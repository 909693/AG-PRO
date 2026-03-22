# AG Pro

English · [简体中文](README.md)

[![Version](https://img.shields.io/badge/version-1.0.0-blue)](https://github.com/yourusername/ag-pro)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE.txt)

VS Code extension for monitoring Google Antigravity AI model quotas. Based on [Antigravity Cockpit](https://github.com/jlcodes99/vscode-antigravity-cockpit).

**Features**: Webview Dashboard · QuickPick Mode · Quota Grouping · Auto Grouping · Rename · Card View · Drag & Drop · Status Bar · Threshold Alerts · Privacy Mode · Seamless Account Switching

**Languages**: Follows VS Code language settings, supports 16 languages

🇺🇸 English · 🇨🇳 简体中文 · 繁體中文 · 🇯🇵 日本語 · 🇩🇪 Deutsch · 🇪🇸 Español · 🇫🇷 Français · 🇮🇹 Italiano · 🇰🇷 한국어 · 🇧🇷 Português · 🇷🇺 Русский · 🇹🇷 Türkçe · 🇵🇱 Polski · 🇨🇿 Čeština · 🇸🇦 العربية · 🇻🇳 Tiếng Việt

---

## ✨ What's New

Compared to the original Antigravity Cockpit, AG Pro adds:

- 🚀 **Seamless Account Switching**: Quick switch with `Ctrl/Cmd+Shift+A`, no client restart needed
- 🎨 **Modern Design**: Refreshed UI with cleaner visuals
- ⚡ **Performance Boost**: Faster response and smoother interactions
- 🔧 **Enhanced Stability**: Bug fixes and improved reliability

---

## Installation

### Method 1: VSIX File

1. Download the latest `ag-pro-x.x.x.vsix` file
2. Open VS Code
3. Press `Ctrl/Cmd+Shift+P` to open Command Palette
4. Type `Extensions: Install from VSIX...`
5. Select the downloaded VSIX file

Or via command line:

```bash
code --install-extension ag-pro-1.0.0.vsix
```

### Method 2: Build from Source

```bash
# Clone repository
git clone https://github.com/yourusername/ag-pro.git
cd ag-pro

# Install dependencies
npm install

# Build
npm run build:prod

# Package
npm run package
```

Requirements: Node.js v18+, npm v9+

---

## Usage

### Open Dashboard
- Click status bar icon
- Or `Ctrl/Cmd+Shift+Q`
- Or run `AG Pro: Open AG Pro Dashboard` from Command Palette

### Seamless Account Switching
- Press `Ctrl/Cmd+Shift+A`
- Or run `AG Pro: Seamless Switch Account` from Command Palette
- Select target account, automatic switching

### Refresh Quota
- Click refresh button
- Or `Ctrl/Cmd+Shift+R` (when dashboard is active)

---

## Keyboard Shortcuts

| Shortcut | Function |
|----------|----------|
| `Ctrl/Cmd+Shift+Q` | Open AG Pro Dashboard |
| `Ctrl/Cmd+Shift+A` | Seamless Account Switch |
| `Ctrl/Cmd+Shift+R` | Refresh Quota (dashboard active) |

---

## Acknowledgments

This project is based on [Antigravity Cockpit](https://github.com/jlcodes99/vscode-antigravity-cockpit). Thanks to the original author for the open-source contribution!

Also thanks to:
- [Antigravity Quota](https://github.com/example/antigravity-quota) - Process detection reference
- [AntigravityQuotaWatcher](https://github.com/example/watcher) - Monitoring mechanism reference

If these projects help you, please give them a ⭐ Star!

---

## Support

If AG Pro helps you:

- ⭐ Star the project
- 🐛 Submit Issues for bugs
- 💡 Submit Pull Requests
- 📢 Share with others

---

## License

MIT License

---

## Disclaimer

This project is for personal learning and research only. By using this project, you agree to:

- Not use this project for any commercial purposes
- Bear all risks and responsibilities of using this project
- Comply with relevant terms of service and laws

The project author is not responsible for any direct or indirect losses caused by using this project.

---

**Enjoy coding with AG Pro! 🚀**
