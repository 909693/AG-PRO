/**
 * AG Pro - Google OAuth Token 刷新
 * 使用 Python 子进程调用 Google OAuth API（绕过扩展环境网络限制）
 */

// Note: These are public OAuth credentials from the original Antigravity client
// Users should configure their own OAuth app for production use
const OAUTH_CLIENT_ID = process.env.ANTIGRAVITY_CLIENT_ID || '';
const OAUTH_CLIENT_SECRET = process.env.ANTIGRAVITY_CLIENT_SECRET || '';

export interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
    const { execFile } = await import('child_process');
    const { promisify } = await import('util');
    const execFileAsync = promisify(execFile);

    const script = `
import urllib.request, urllib.parse, json, sys
body = urllib.parse.urlencode({
    'client_id': '${OAUTH_CLIENT_ID}',
    'client_secret': '${OAUTH_CLIENT_SECRET}',
    'refresh_token': sys.argv[1],
    'grant_type': 'refresh_token',
}).encode()
req = urllib.request.Request('https://oauth2.googleapis.com/token', data=body,
    headers={'Content-Type': 'application/x-www-form-urlencoded'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    print(json.dumps({'error': e.read().decode(), 'status': e.code}))
    sys.exit(1)
`;

    const { stdout } = await execFileAsync('python', ['-c', script, refreshToken], {
        timeout: 15000,
        encoding: 'utf-8',
    });

    const result = JSON.parse(stdout.trim());
    if (result.error) {
        throw new Error(`Token refresh failed: ${JSON.stringify(result)}`);
    }
    return result as TokenResponse;
}
