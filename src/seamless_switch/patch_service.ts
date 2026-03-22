/**
 * AG Pro - Patch Service
 * 补丁 Antigravity 的 extension.js，注入无感切号命令
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../shared/log_service';

const PATCH_KEYWORD = 'antigravity.injectAuthSession';

/** 获取 Antigravity extension.js 路径 */
function getExtensionJsPath(): string | null {
    const candidates = [
        'D:\\software\\Antigravity\\resources\\app\\extensions\\antigravity\\dist\\extension.js',
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity', 'resources', 'app', 'extensions', 'antigravity', 'dist', 'extension.js'),
        path.join('C:\\Program Files', 'Antigravity', 'resources', 'app', 'extensions', 'antigravity', 'dist', 'extension.js'),
    ];
    // macOS
    candidates.push('/Applications/Antigravity.app/Contents/Resources/app/extensions/antigravity/dist/extension.js');

    for (const p of candidates) {
        if (fs.existsSync(p)) { return p; }
    }
    return null;
}

/** 检查补丁是否已应用 */
export function isPatchApplied(): boolean {
    const extPath = getExtensionJsPath();
    if (!extPath) { return false; }
    try {
        const content = fs.readFileSync(extPath, 'utf-8');
        return content.includes(PATCH_KEYWORD);
    } catch {
        return false;
    }
}

/** 应用补丁 */
export function applyPatch(): { success: boolean; needsRestart: boolean; error?: string } {
    const extPath = getExtensionJsPath();
    if (!extPath) {
        return { success: false, needsRestart: false, error: 'Antigravity extension.js not found' };
    }

    if (isPatchApplied()) {
        return { success: true, needsRestart: false };
    }

    try {
        fs.accessSync(extPath, fs.constants.W_OK);
    } catch {
        return { success: false, needsRestart: false, error: `No write permission: ${extPath}` };
    }

    let content = fs.readFileSync(extPath, 'utf-8');

    // ─── 注入点 1: injectSession 方法 ───
    const anchor1 = 'getLocalhostRedirectUri(){';
    const idx1 = content.indexOf(anchor1);
    if (idx1 < 0) {
        return { success: false, needsRestart: false, error: 'Cannot find getLocalhostRedirectUri anchor' };
    }

    const injectedMethod =
        'async injectSession(tokenInfo,email,name){' +
        'try{' +
        'console.log("[AG-Pro] Injecting session for:",email);' +
        'await i.antigravityAuth.setOAuthTokenInfo(tokenInfo);' +
        'const sess={id:"antigravity-"+email,accessToken:tokenInfo.accessToken,account:{id:email,label:name||email},scopes:[]};' +
        'this._sessionChangeEmitter.fire({added:[sess],removed:[],changed:[]});' +
        'console.log("[AG-Pro] Session injected successfully");' +
        'return sess;' +
        '}catch(err){console.error("[AG-Pro] Inject failed:",err);throw err;}' +
        '}';

    content = content.slice(0, idx1) + injectedMethod + content.slice(idx1);
    logger.info(`[PatchService] Injected injectSession method`);

    // ─── 注入点 2: 注册命令 ───
    const anchor2 = 'a.commands.registerCommand("antigravity.handleAuthRefresh"';
    const idx2 = content.indexOf(anchor2);
    if (idx2 < 0) {
        return { success: false, needsRestart: false, error: 'Cannot find handleAuthRefresh anchor' };
    }

    // 找到 registerCommand 闭合括号
    let depth = 0, endIdx = idx2, foundStart = false;
    for (let j = idx2; j < content.length && j < idx2 + 500; j++) {
        if (content[j] === '(') { depth++; foundStart = true; }
        if (content[j] === ')') {
            depth--;
            if (foundStart && depth === 0) { endIdx = j + 1; break; }
        }
    }

    // 查找正确的 ExternalAuthProvider 变量名
    const providerPattern = /([a-zA-Z_$]+)\.ExternalAuthProvider\.getInstance/g;
    let providerVar = 'h'; // 默认
    const searchChunk = content.slice(Math.max(0, idx2 - 500), idx2);
    const match = [...searchChunk.matchAll(providerPattern)].pop();
    if (match) { providerVar = match[1]; }

    const injectedCommand =
        `,a.commands.registerCommand("antigravity.injectAuthSession",async(tokenInfo)=>{` +
        `try{` +
        `const provider=${providerVar}.ExternalAuthProvider.getInstance();` +
        `const sess=await provider.injectSession(tokenInfo,tokenInfo.email,tokenInfo.name);` +
        `return{success:true,session:sess};` +
        `}catch(err){` +
        `return{success:false,error:err.message};` +
        `}` +
        `})`;

    content = content.slice(0, endIdx) + injectedCommand + content.slice(endIdx);
    logger.info(`[PatchService] Injected command registration (provider var: ${providerVar})`);

    // 备份并写入
    try {
        fs.copyFileSync(extPath, extPath + '.bak');
    } catch { /* ignore backup failure */ }

    fs.writeFileSync(extPath, content, 'utf-8');

    // 验证
    const verify = fs.readFileSync(extPath, 'utf-8');
    if (!verify.includes(PATCH_KEYWORD)) {
        return { success: false, needsRestart: false, error: 'Patch verification failed' };
    }

    logger.info('[PatchService] Patch applied successfully!');
    return { success: true, needsRestart: true };
}

/** 检查注入的命令是否已可用 */
export async function isPatchCommandAvailable(): Promise<boolean> {
    const vscode = await import('vscode');
    const commands = await vscode.commands.getCommands();
    return commands.includes(PATCH_KEYWORD);
}
