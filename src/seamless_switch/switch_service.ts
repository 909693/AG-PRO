/**
 * AG Pro - Seamless Switch Service
 * 无感切号核心服务
 */

import * as vscode from 'vscode';
import { refreshAccessToken } from './google_oauth';
import { applyPatch, isPatchApplied, isPatchCommandAvailable } from './patch_service';
import { credentialStorage } from '../auto_trigger';
import { logger } from '../shared/log_service';
import { t } from '../shared/i18n';

export class SeamlessSwitchService {
    /**
     * 执行无感切号
     */
    async switchToAccount(email: string): Promise<boolean> {
        logger.info(`[SeamlessSwitch] Switching to: ${email}`);

        // Step 1: 检查补丁
        const cmdAvailable = await isPatchCommandAvailable();
        if (!cmdAvailable) {
            if (!isPatchApplied()) {
                logger.info('[SeamlessSwitch] Applying patch...');
                const patchResult = applyPatch();
                if (!patchResult.success) {
                    vscode.window.showErrorMessage(`Patch failed: ${patchResult.error}`);
                    return false;
                }
            }
            vscode.window.showInformationMessage(
                t('seamless.patchApplied') || 'Patch applied, reloading to activate...',
            );
            setTimeout(() => {
                vscode.commands.executeCommand('workbench.action.reloadWindow');
            }, 1500);
            return false;
        }

        // Step 2: 获取目标账号凭证
        const credential = await credentialStorage.getCredentialForAccount(email);
        if (!credential?.refreshToken) {
            vscode.window.showErrorMessage(`No refresh token for ${email}`);
            return false;
        }

        // Step 3: 刷新 access_token
        logger.info('[SeamlessSwitch] Refreshing token...');
        let accessToken: string;
        try {
            const tokenResp = await refreshAccessToken(credential.refreshToken);
            accessToken = tokenResp.access_token;
            logger.info(`[SeamlessSwitch] Token refreshed, expires in ${tokenResp.expires_in}s`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            vscode.window.showErrorMessage(`Token refresh failed: ${msg}`);
            return false;
        }

        // Step 4: 注入 token
        logger.info('[SeamlessSwitch] Injecting session...');
        try {
            const expirySeconds = Math.floor(Date.now() / 1000) + 3600;
            const result: any = await vscode.commands.executeCommand(
                'antigravity.injectAuthSession',
                {
                    accessToken,
                    refreshToken: credential.refreshToken,
                    expiryDateSeconds: expirySeconds,
                    tokenType: 'Bearer',
                    isGcpTos: false,
                    email,
                    name: credential.email || email,
                },
            );

            if (result?.success) {
                logger.info(`[SeamlessSwitch] SUCCESS! Switched to ${email}`);
                await credentialStorage.setActiveAccount(email, true);
                vscode.window.showInformationMessage(
                    t('seamless.switchSuccess', { email }) || `账号切换成功: ${email}`,
                );
                return true;
            } else {
                logger.error(`[SeamlessSwitch] Inject failed: ${result?.error}`);
                vscode.window.showErrorMessage(
                    t('seamless.switchFailed', { error: result?.error || 'unknown' }) || `切换失败: ${result?.error || 'unknown'}`,
                );
                return false;
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error(`[SeamlessSwitch] Error: ${msg}`);
            vscode.window.showErrorMessage(`Switch failed: ${msg}`);
            return false;
        }
    }

    /**
     * 显示账号选择器并执行无感切换
     */
    async showSwitchQuickPick(): Promise<void> {
        const accounts = await credentialStorage.getAccountInfoList();
        if (accounts.length === 0) {
            vscode.window.showWarningMessage('No accounts. Add one via OAuth or import.');
            return;
        }

        const activeEmail = await credentialStorage.getActiveAccount();

        const items = accounts.map(acc => ({
            label: acc.email === activeEmail ? `$(check) ${acc.email}` : acc.email,
            description: acc.email === activeEmail ? 'Current' : undefined,
            email: acc.email,
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select account for seamless switch',
            title: 'AG Pro — Seamless Switch',
        });

        if (!selected) { return; }

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: t('seamless.switching', { email: selected.email }) || `正在切换账号: ${selected.email}...`,
            cancellable: false,
        }, () => this.switchToAccount(selected.email));
    }
}

export const seamlessSwitchService = new SeamlessSwitchService();
