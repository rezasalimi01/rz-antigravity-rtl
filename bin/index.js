#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import picocolors from 'picocolors';
import ora from 'ora';
import prompts from 'prompts';
import * as asar from '@electron/asar';
import figlet from 'figlet';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { blue, cyan, green, red, yellow, bold, dim } = picocolors;

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

function injectDynamicVersion(code) {
    return code
        .replace(/__RZ_PACKAGE_VERSION__/g, pkg.version)
        .replace(/class="rtl-version-badge">v[^<]*</g, `class="rtl-version-badge">v${pkg.version}<`);
}

function printBanner() {
    try {
        const fullArt = figlet.textSync('RZ Antigravity RTL', { font: 'RubiFont' }).split('\n');

        const hexColors = [
            '#3387FF',
            '#F25041',
            '#DFAC2A',
            '#91C45B'
        ];

        const colors = hexColors.map(hex => {
            const bigint = parseInt(hex.replace('#', ''), 16);
            return {
                r: (bigint >> 16) & 255,
                g: (bigint >> 8) & 255,
                b: bigint & 255
            };
        });

        const applyGradient = (text) => {
            let result = '';
            const len = text.length;
            for (let i = 0; i < len; i++) {
                const char = text[i];
                if (char === ' ' || char === '\n') {
                    result += char;
                    continue;
                }
                const factor = len > 1 ? i / (len - 1) : 0;
                const segments = colors.length - 1;
                const segmentFloat = factor * segments;
                const segmentIdx = Math.min(Math.floor(segmentFloat), segments - 1);
                const segmentFactor = segmentFloat - segmentIdx;

                const cStart = colors[segmentIdx];
                const cEnd = colors[segmentIdx + 1];

                const r = Math.round(cStart.r + segmentFactor * (cEnd.r - cStart.r));
                const g = Math.round(cStart.g + segmentFactor * (cEnd.g - cStart.g));
                const b = Math.round(cStart.b + segmentFactor * (cEnd.b - cStart.b));

                result += `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
            }
            return result;
        };

        console.log('');
        for (const line of fullArt) {
            if (!line.trim()) continue;
            console.log(applyGradient(line));
        }
        console.log('');
        console.log(`\x1b[2m  RTL & UI Patcher for Antigravity, Antigravity IDE & VS Code Extension (Windows & WSL) | v${pkg.version}\x1b[0m\n`);
    } catch (err) {
        console.log(bold(cyan(`\n✨ RZ Antigravity RTL Patcher v${pkg.version}\n`)));
    }
}

printBanner();

function getDefaultAppAsarPath() {
    if (os.platform() === 'darwin') {
        return '/Applications/Antigravity.app/Contents/Resources/app.asar';
    } else if (os.platform() === 'win32') {
        return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity', 'resources', 'app.asar');
    } else {
        const linuxDefault = '/opt/Antigravity/resources/app.asar';
        if (fs.existsSync(linuxDefault)) return linuxDefault;
        // WSL fallback: detect Windows Host Antigravity Desktop App (GUI for both Local & WSL Hub)
        try {
            const mntUsers = '/mnt/c/Users';
            if (fs.existsSync(mntUsers)) {
                for (const u of fs.readdirSync(mntUsers)) {
                    const candidate = path.join(mntUsers, u, 'AppData', 'Local', 'Programs', 'Antigravity', 'resources', 'app.asar');
                    if (fs.existsSync(candidate)) return candidate;
                }
            }
        } catch (e) {}
        return linuxDefault;
    }
}

function getDefaultIdeAppPath() {
    if (os.platform() === 'darwin') {
        return '/Applications/Antigravity IDE.app/Contents/Resources/app';
    } else if (os.platform() === 'win32') {
        return path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Antigravity IDE', 'resources', 'app');
    }
}

function getVSCodeExtensionPath() {
    const candidates = [
        path.join(os.homedir(), '.vscode', 'extensions'),
        path.join(os.homedir(), '.vscode-insiders', 'extensions')
    ];
    for (const baseDir of candidates) {
        if (!fs.existsSync(baseDir)) continue;
        try {
            const entries = fs.readdirSync(baseDir, { withFileTypes: true });
            const matchingDirs = entries
                .filter(d => d.isDirectory() && d.name.startsWith('google.google-antigravity-'))
                .map(d => path.join(baseDir, d.name))
                .filter(dirPath => fs.existsSync(path.join(dirPath, 'extension.js')));

            if (matchingDirs.length > 0) {
                matchingDirs.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
                return matchingDirs[0];
            }
        } catch (e) {}
    }
    return null;
}

function getWslTargets() {
    const targets = [];
    if (os.platform() === 'win32') {
        let distros = [];
        try {
            const stdout = execSync('wsl.exe -l -q', { encoding: 'buffer', stdio: ['pipe', 'pipe', 'ignore'], timeout: 4000 });
            let text = '';
            if (stdout.includes(0)) {
                text = stdout.toString('utf16le');
            } else {
                text = stdout.toString('utf8');
            }
            distros = text.split(/\r?\n/).map(s => s.trim().replace(/\0/g, '')).filter(s => s && !s.toLowerCase().startsWith('docker'));
        } catch(e) {}

        for (const distro of distros) {
            let baseWsl = null;
            const prefixes = ['//wsl.localhost/' + distro, '//wsl$/' + distro];
            for (const prefix of prefixes) {
                if (fs.existsSync(prefix)) {
                    baseWsl = prefix;
                    break;
                }
            }
            if (!baseWsl) continue;

            const homeBase = path.join(baseWsl, 'home');
            if (!fs.existsSync(homeBase)) continue;

            let users = [];
            try { users = fs.readdirSync(homeBase); } catch(e) {}

            for (const user of users) {
                const uHome = path.join(homeBase, user);

                // 1. Antigravity IDE server
                const ideBin = path.join(uHome, '.antigravity-ide-server', 'bin');
                if (fs.existsSync(ideBin)) {
                    let versions = [];
                    try { versions = fs.readdirSync(ideBin); } catch(e) {}
                    for (const v of versions) {
                        const agyVs = path.join(ideBin, v, 'extensions', 'agy', 'vscode');
                        if (fs.existsSync(path.join(agyVs, 'extension.js'))) {
                            targets.push({
                                type: 'wsl-ide',
                                distro,
                                user,
                                label: `WSL (${distro}) — Antigravity IDE Server (${v.split('-')[0]})`,
                                extDir: agyVs,
                                preferredPort: 7194
                            });
                        }
                    }
                }

                // 2. VS Code server
                for (const sName of ['.vscode-server', '.vscode-server-insiders']) {
                    const extBase = path.join(uHome, sName, 'extensions');
                    if (fs.existsSync(extBase)) {
                        let exts = [];
                        try { exts = fs.readdirSync(extBase); } catch(e) {}
                        for (const ext of exts) {
                            if (ext.startsWith('google.google-antigravity-')) {
                                const extDir = path.join(extBase, ext);
                                if (fs.existsSync(path.join(extDir, 'extension.js'))) {
                                    targets.push({
                                        type: 'wsl-vscode',
                                        distro,
                                        user,
                                        label: `WSL (${distro}) — VS Code Extension (${ext.replace('google.google-antigravity-', '')})`,
                                        extDir,
                                        preferredPort: 7192
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    } else if (os.platform() === 'linux') {
        const uHome = os.homedir();
        // 1. Antigravity IDE server
        const ideBin = path.join(uHome, '.antigravity-ide-server', 'bin');
        if (fs.existsSync(ideBin)) {
            let versions = [];
            try { versions = fs.readdirSync(ideBin); } catch(e) {}
            for (const v of versions) {
                const agyVs = path.join(ideBin, v, 'extensions', 'agy', 'vscode');
                if (fs.existsSync(path.join(agyVs, 'extension.js'))) {
                    targets.push({
                        type: 'wsl-ide',
                        distro: 'Linux/WSL',
                        user: path.basename(uHome),
                        label: `Antigravity IDE Server (${v.split('-')[0]})`,
                        extDir: agyVs,
                        preferredPort: 7194
                    });
                }
            }
        }
        // 2. VS Code server
        for (const sName of ['.vscode-server', '.vscode-server-insiders']) {
            const extBase = path.join(uHome, sName, 'extensions');
            if (fs.existsSync(extBase)) {
                let exts = [];
                try { exts = fs.readdirSync(extBase); } catch(e) {}
                for (const ext of exts) {
                    if (ext.startsWith('google.google-antigravity-')) {
                        const extDir = path.join(extBase, ext);
                        if (fs.existsSync(path.join(extDir, 'extension.js'))) {
                            targets.push({
                                type: 'wsl-vscode',
                                distro: 'Linux/WSL',
                                user: path.basename(uHome),
                                label: `VS Code Extension (${ext.replace('google.google-antigravity-', '')})`,
                                extDir,
                                preferredPort: 7192
                            });
                        }
                    }
                }
            }
        }
    }
    return targets;
}

function cleanupConflictingGlobalPackages() {
    const knownConflicts = ['antigravity-rtl', 'antigravity-rtl-patch'];
    const npmCmd = os.platform() === 'win32' ? 'npm.cmd' : 'npm';
    try {
        const stdout = execSync(`${npmCmd} list -g --depth=0 --json`, {
            stdio: ['ignore', 'pipe', 'ignore'],
            encoding: 'utf8',
            timeout: 6000
        });
        const data = JSON.parse(stdout);
        const globalPkgs = data.dependencies ? Object.keys(data.dependencies) : [];
        for (const pkgName of knownConflicts) {
            if (globalPkgs.includes(pkgName)) {
                const s = ora(`Found conflicting global package "${pkgName}". Removing it...`).start();
                try {
                    execSync(`${npmCmd} uninstall -g ${pkgName}`, {
                        stdio: ['ignore', 'ignore', 'ignore'],
                        timeout: 15000
                    });
                    s.succeed(`Successfully uninstalled conflicting global package "${pkgName}".`);
                } catch (err) {
                    s.warn(`Could not auto-remove global "${pkgName}". You can run "${npmCmd} uninstall -g ${pkgName}" manually.`);
                }
            }
        }
    } catch (e) {}
}

function purgePreviousRtlPatchesFromUtils(utilsCode) {
    let cleaned = utilsCode;
    // 1. Remove RZ Antigravity RTL with end tag
    cleaned = cleaned.replace(/\/\* RZ ANTIGRAVITY RTL PATCH \*\/[\s\S]*?\/\* END RZ ANTIGRAVITY RTL PATCH \*\/\s*/g, 'void win.loadURL(url);\n    ');
    // 2. Remove RZ Antigravity RTL without end tag
    cleaned = cleaned.replace(/\/\* RZ ANTIGRAVITY RTL PATCH \*\/[\s\S]*?void win\.loadURL\(url\);/g, 'void win.loadURL(url);');
    // 3. Remove upstream antigravity-rtl patch (starts with /* ANTIGRAVITY RTL PATCH */ and extends to return win;)
    cleaned = cleaned.replace(/\/\* ANTIGRAVITY RTL PATCH \*\/[\s\S]*?\s*(?=return win;)/g, 'void win.loadURL(url);\n    ');
    // 4. Remove any other third-party RTL patch containing SAVE_RTL_CONFIG before return win;
    if (cleaned.includes('SAVE_RTL_CONFIG') && cleaned.includes('return win;')) {
        cleaned = cleaned.replace(/\/\*[\s\S]*?(?:SAVE_RTL_CONFIG|RTL PATCH)[\s\S]*?\s*(?=return win;)/g, 'void win.loadURL(url);\n    ');
    }
    // 5. Clean up duplicate anchors if any
    cleaned = cleaned.replace(/(void win\.loadURL\(url\);\s*){2,}/g, 'void win.loadURL(url);\n    ');
    return cleaned;
}

const args = process.argv.slice(2);
const isRestore = args.includes('--restore');
const targetAll = args.includes('--all');
const targetAppOnly = args.includes('--app');
const targetIdeOnly = args.includes('--ide');
const targetVscodeOnly = args.includes('--vscode') || args.includes('--ext');
const targetWslOnly = args.includes('--wsl');

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx rz-antigravity-rtl [options]

Options:
  --all        Patch Desktop App, Antigravity IDE, and VS Code Extension (Windows & WSL)
  --app        Patch Antigravity Desktop App only
  --ide        Patch Antigravity IDE only (Windows & WSL)
  --vscode     Patch VS Code Antigravity Extension only (Windows & WSL)
  --wsl        Patch WSL environments only (Antigravity IDE & VS Code Server)
  --restore    Restore original unpatched files (use with --app, --ide, --vscode, --wsl, or --all)
  -h, --help   Show this help message
    `);
    process.exit(0);
}

function readUtilsFromAsar(asarFile) {
    try {
        asar.uncache(asarFile);
        return asar.extractFile(asarFile, 'dist/utils.js').toString('utf8');
    } catch(e) {
        return '';
    }
}

async function patchDesktop(asarPath) {
    console.log(bold(cyan(`\n📦 Antigravity Desktop App`)));
    console.log(dim(`   Path: ${asarPath}`));

    const backupPath = asarPath + '.bak';

    if (isRestore) {
        if (!fs.existsSync(backupPath)) {
            console.error(red('✖ No backup found for Antigravity Desktop App to restore.\n'));
            return false;
        }
        const spinner = ora('Checking backup and restoring original app.asar...').start();
        try {
            const backupUtils = readUtilsFromAsar(backupPath);
            if (backupUtils.includes('/* RZ ANTIGRAVITY RTL PATCH */') || backupUtils.includes('/* ANTIGRAVITY RTL PATCH */')) {
                spinner.text = 'Backup was dirty; stripping RTL patch before restoring...';
                const cleanBackupUtils = purgePreviousRtlPatchesFromUtils(backupUtils);
                const extractDir = path.join(path.dirname(asarPath), 'app-restore-temp');
                if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
                asar.extractAll(backupPath, extractDir);
                fs.writeFileSync(path.join(extractDir, 'dist', 'utils.js'), cleanBackupUtils, 'utf8');
                await asar.createPackage(extractDir, asarPath);
                fs.rmSync(extractDir, { recursive: true, force: true });
            } else {
                fs.copyFileSync(backupPath, asarPath);
            }
            asar.uncache(asarPath);
            spinner.succeed('Successfully restored original Antigravity Desktop!');
            return true;
        } catch (e) {
            spinner.fail('Failed to restore Antigravity Desktop.');
            console.error(red(e.message));
            return false;
        }
    }

    const spinner = ora('Checking permissions and verifying app.asar...').start();
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        const currentUtils = readUtilsFromAsar(asarPath);
        const isCurrentPatched = currentUtils.includes('/* RZ ANTIGRAVITY RTL PATCH */') || currentUtils.includes('/* ANTIGRAVITY RTL PATCH */');

        if (!fs.existsSync(backupPath)) {
            if (!isCurrentPatched) {
                fs.copyFileSync(asarPath, backupPath);
            } else {
                // Current asar is patched and no backup exists. Self-heal clean backup by stripping the patch!
                const cleanUtils = purgePreviousRtlPatchesFromUtils(currentUtils);
                const extractDir = path.join(path.dirname(asarPath), 'app-clean-backup-temp');
                if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
                asar.extractAll(asarPath, extractDir);
                fs.writeFileSync(path.join(extractDir, 'dist', 'utils.js'), cleanUtils, 'utf8');
                await asar.createPackage(extractDir, backupPath);
                fs.rmSync(extractDir, { recursive: true, force: true });
            }
        } else {
            // Backup exists. Let's verify it is clean
            const backupUtils = readUtilsFromAsar(backupPath);
            const isBackupPatched = backupUtils.includes('/* RZ ANTIGRAVITY RTL PATCH */') || backupUtils.includes('/* ANTIGRAVITY RTL PATCH */');
            if (isBackupPatched) {
                // Heal the dirty backup
                const cleanUtils = purgePreviousRtlPatchesFromUtils(backupUtils);
                const extractDir = path.join(path.dirname(asarPath), 'app-clean-backup-temp');
                if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
                asar.extractAll(backupPath, extractDir);
                fs.writeFileSync(path.join(extractDir, 'dist', 'utils.js'), cleanUtils, 'utf8');
                await asar.createPackage(extractDir, backupPath);
                fs.rmSync(extractDir, { recursive: true, force: true });
            }
            // Always restore from clean backup before applying new patch so base is completely clean
            fs.copyFileSync(backupPath, asarPath);
        }
        asar.uncache(asarPath);
        asar.uncache(backupPath);
    } catch (e) {
        spinner.fail('Permission Denied or corrupted asar.');
        console.error(red('\nSystem Error: ' + e.message));
        if (os.platform() === 'win32') {
            console.error(yellow('\nPlease run your terminal (PowerShell/CMD) as Administrator and try again.\n'));
        } else {
            console.error(yellow('\nPlease run this command with sudo.\n'));
        }
        return false;
    }

    const extractDir = path.join(path.dirname(asarPath), 'app-extracted-rtl-temp');
    spinner.text = 'Extracting app.asar (this may take a few seconds)...';
    try {
        if (fs.existsSync(extractDir)) {
            fs.rmSync(extractDir, { recursive: true, force: true });
        }
        asar.extractAll(asarPath, extractDir);
    } catch (e) {
        spinner.fail('Failed to extract ASAR.');
        console.error(red(e.message));
        return false;
    }

    spinner.text = 'Injecting RTL features...';
    try {
        const utilsPath = path.join(extractDir, 'dist', 'utils.js');
        if (!fs.existsSync(utilsPath)) {
            throw new Error('dist/utils.js not found in ASAR. Unsupported Antigravity version.');
        }

        let utilsCode = fs.readFileSync(utilsPath, 'utf8');
        // Purge any previous RTL patches (original antigravity-rtl, older RZ, or third-party)
        utilsCode = purgePreviousRtlPatchesFromUtils(utilsCode);

        const payloadPath = path.join(__dirname, 'payload.js');
        let payload = injectDynamicVersion(fs.readFileSync(payloadPath, 'utf8'));

        const anchor = 'void win.loadURL(url);';
        if (!utilsCode.includes(anchor)) {
            throw new Error('Injection anchor not found in dist/utils.js. The app version might be unsupported.');
        }

        utilsCode = utilsCode.replace(anchor, payload);
        utilsCode = utilsCode.replace(/devTools:\s*(?:!electron_1?\.app\.isPackaged|\(0,\s*debugConsole_1\.isDebugConsoleEnabled\)\(\))/g, 'devTools: true');
        fs.writeFileSync(utilsPath, utilsCode);

        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontDest = path.join(extractDir, 'dist', 'Vazirmatn-Variable.woff2');
        if (fs.existsSync(fontSource)) {
            fs.copyFileSync(fontSource, fontDest);
        }

        const fontsDirSource = path.join(__dirname, 'fonts');
        const fontsDirDest = path.join(extractDir, 'dist', 'fonts');
        if (fs.existsSync(fontsDirSource)) {
            fs.cpSync(fontsDirSource, fontsDirDest, { recursive: true });
        }
    } catch (e) {
        spinner.fail('Injection failed.');
        console.error(red(e.message));
        if (fs.existsSync(extractDir)) fs.rmSync(extractDir, { recursive: true, force: true });
        return false;
    }

    spinner.text = 'Repacking app.asar...';
    try {
        await asar.createPackage(extractDir, asarPath);
        fs.rmSync(extractDir, { recursive: true, force: true });
        spinner.succeed('Successfully patched Antigravity Desktop!');
        return true;
    } catch (e) {
        spinner.fail('Failed to repack ASAR.');
        console.error(red(e.message));
        return false;
    }
}

async function patchExtensionFolder(extDir, { label, preferredPort = 7196 }) {
    console.log(bold(cyan(`\n🔌 ${label}`)));
    console.log(dim(`   Path: ${extDir}`));

    const extJs = path.join(extDir, 'extension.js');
    const extJsBak = extJs + '.original.bak';
    const payloadDest = path.join(extDir, 'ide-payload.js');
    const fontDest = path.join(extDir, 'Vazirmatn-Variable.woff2');
    const fontsDirDest = path.join(extDir, 'fonts');

    if (isRestore) {
        if (!fs.existsSync(extJsBak)) {
            console.error(red(`✖ No backup found for ${label} to restore.\n`));
            return false;
        }
        const spinner = ora(`Restoring original ${label}...`).start();
        try {
            fs.copyFileSync(extJsBak, extJs);
            if (fs.existsSync(payloadDest)) {
                try { fs.rmSync(payloadDest, { force: true }); } catch (e) {}
            }
            if (fs.existsSync(fontDest)) {
                try { fs.rmSync(fontDest, { force: true }); } catch (e) {}
            }
            if (fs.existsSync(fontsDirDest)) {
                try { fs.rmSync(fontsDirDest, { recursive: true, force: true }); } catch (e) {}
            }
            spinner.succeed(`Successfully restored original ${label}!`);
            return true;
        } catch (e) {
            spinner.fail(`Failed to restore ${label}.`);
            console.error(red(e.message));
            return false;
        }
    }

    const spinner = ora(`Checking permissions and backing up ${label}...`).start();
    try {
        fs.accessSync(extDir, fs.constants.W_OK);
        if (!fs.existsSync(extJsBak)) {
            fs.copyFileSync(extJs, extJsBak);
        } else {
            // Restore from clean backup first so re-patching applies cleanly without duplicate injections
            fs.copyFileSync(extJsBak, extJs);
        }
    } catch (e) {
        spinner.fail('Permission Denied on extension folder.');
        console.error(red('\nSystem Error: ' + e.message));
        return false;
    }

    spinner.text = 'Copying RTL payload & fonts to extension folder...';
    try {
        const idePayloadSource = path.join(__dirname, 'ide-payload.js');
        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontsDirSource = path.join(__dirname, 'fonts');

        let idePayloadCode = injectDynamicVersion(fs.readFileSync(idePayloadSource, 'utf8'));
        fs.writeFileSync(payloadDest, idePayloadCode, 'utf8');

        if (fs.existsSync(fontSource)) {
            fs.copyFileSync(fontSource, fontDest);
        }
        if (fs.existsSync(fontsDirSource)) {
            fs.cpSync(fontsDirSource, fontsDirDest, { recursive: true });
        }
    } catch (e) {
        spinner.fail('Failed to copy payload files to extension folder.');
        console.error(red(e.message));
        return false;
    }

    spinner.text = 'Patching extension.js for Chat Webview RTL Proxy...';
    try {
        let extCode = fs.readFileSync(extJsBak, 'utf8');

        if (extCode.includes('renderIframe(a,b,c){')) {
            const proxySnippet = `
/* --- RZ ANTIGRAVITY RTL PROXY --- */
(function() {
    let __rzProxy = null;
    let __rzProxyPort = 0;
    let __rzTargetUrl = '';

    globalThis.__rzStartProxy = async function(targetUrl) {
        if (!targetUrl || typeof targetUrl !== 'string') return targetUrl;
        try {
            const parsed = new URL(targetUrl);
            if (__rzProxyPort > 0 && parseInt(parsed.port, 10) === __rzProxyPort) {
                return targetUrl;
            }
        } catch(e) {}
        __rzTargetUrl = targetUrl;
        if (__rzProxyPort > 0) {
            try {
                const u = new URL(targetUrl);
                u.port = String(__rzProxyPort);
                return u.toString().replace(/\\/$/, '');
            } catch(e) {
                return 'http://127.0.0.1:' + __rzProxyPort;
            }
        }

        try {
            const http = require('http');
            const net = require('net');
            const fs = require('fs');
            const path = require('path');

            const payloadPath = fs.existsSync(path.resolve(__dirname, 'ide-payload.js'))
                ? path.resolve(__dirname, 'ide-payload.js')
                : path.resolve(__dirname, '..', '..', '..', 'out', 'vs', 'code', 'electron-browser', 'workbench', 'ide-payload.js');
            const fontPath = fs.existsSync(path.resolve(__dirname, 'Vazirmatn-Variable.woff2'))
                ? path.resolve(__dirname, 'Vazirmatn-Variable.woff2')
                : path.resolve(__dirname, '..', '..', '..', 'out', 'vs', 'code', 'electron-browser', 'workbench', 'Vazirmatn-Variable.woff2');
            const fontsDir = fs.existsSync(path.resolve(__dirname, 'fonts'))
                ? path.resolve(__dirname, 'fonts')
                : path.resolve(__dirname, '..', '..', '..', 'out', 'vs', 'code', 'electron-browser', 'workbench', 'fonts');
            const configPath = path.resolve(__dirname, 'rz-rtl-config.json');
            const homeConfigPath = path.join(require('os').homedir(), '.antigravity-rtl.json');

            function readSavedConfig() {
                for (const p of [configPath, homeConfigPath]) {
                    if (fs.existsSync(p)) {
                        try {
                            const raw = fs.readFileSync(p, 'utf8').trim();
                            if (raw && raw !== '{}') return raw;
                        } catch(e) {}
                    }
                }
                return '{}';
            }

            const server = http.createServer((req, res) => {
                const url = req.url || '/';

                if (req.method === 'OPTIONS' && (url === '/rz-api/config' || url.startsWith('/rz-api/config?'))) {
                    res.writeHead(204, {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type'
                    });
                    res.end();
                    return;
                }

                if (url === '/rz-api/config' || url.startsWith('/rz-api/config?')) {
                    if (req.method === 'POST') {
                        let body = '';
                        req.on('data', chunk => body += chunk);
                        req.on('end', () => {
                            try {
                                const parsed = JSON.parse(body);
                                for (const k of ['faFont', 'enFont', 'codeFont', 'lh', 'fs']) {
                                    if (parsed[k] !== undefined && (typeof parsed[k] !== 'string' || !/^[\p{L}\p{N} ._-]{0,64}$/u.test(parsed[k]))) {
                                        delete parsed[k];
                                    }
                                }
                                let merged = parsed;
                                try {
                                    if (fs.existsSync(homeConfigPath)) {
                                        const existing = JSON.parse(fs.readFileSync(homeConfigPath, 'utf8'));
                                        merged = { ...existing, ...merged };
                                    }
                                } catch(_) {}
                                const str = JSON.stringify(merged, null, 2);
                                try { fs.writeFileSync(configPath, str, 'utf8'); } catch(e) {}
                                try { fs.writeFileSync(homeConfigPath, str, 'utf8'); } catch(e) {}
                                res.writeHead(200, {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                });
                                res.end(JSON.stringify({ ok: true }));
                            } catch(e) {
                                res.writeHead(400, {
                                    'Content-Type': 'application/json',
                                    'Access-Control-Allow-Origin': '*'
                                });
                                res.end(JSON.stringify({ error: e.message }));
                            }
                        });
                        return;
                    } else {
                        const cfg = readSavedConfig();
                        res.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(cfg);
                        return;
                    }
                }

                if (url.startsWith('/rz-ide-payload.js')) {
                    try {
                        let code = fs.readFileSync(payloadPath, 'utf8');
                        const initialConfig = readSavedConfig();
                        code = 'window.__RZ_RTL_VERSION__ = ${JSON.stringify(pkg.version)};\\nwindow.__RZ_INITIAL_CONFIG__ = ' + (initialConfig.trim() || '{}') + ';\\n' + code;
                        res.writeHead(200, {
                            'Content-Type': 'application/javascript; charset=utf-8',
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(code);
                    } catch(err) {
                        res.writeHead(500);
                        res.end('/* Error loading payload: ' + err.message + ' */');
                    }
                    return;
                }

                if (url.includes('/Vazirmatn-Variable.woff2')) {
                    try {
                        const font = fs.readFileSync(fontPath);
                        res.writeHead(200, {
                            'Content-Type': 'font/woff2',
                            'Access-Control-Allow-Origin': '*',
                            'Cache-Control': 'public, max-age=31536000'
                        });
                        res.end(font);
                    } catch(err) {
                        res.writeHead(404);
                        res.end();
                    }
                    return;
                }

                let fontSubPath = null;
                const fIdx = url.indexOf('/fonts/');
                if (fIdx !== -1) {
                    fontSubPath = url.slice(fIdx + '/fonts/'.length).split(/[?#]/)[0];
                } else if (url.startsWith('fonts/')) {
                    fontSubPath = url.slice('fonts/'.length).split(/[?#]/)[0];
                }
                if (fontSubPath) {
                    try {
                        const subPath = decodeURIComponent(fontSubPath);
                        const fullFontPath = path.join(fontsDir, subPath);
                        if (fs.existsSync(fullFontPath) && fs.statSync(fullFontPath).isFile()) {
                            const font = fs.readFileSync(fullFontPath);
                            const ext = path.extname(fullFontPath).toLowerCase();
                            const mimeType = ext === '.ttf' ? 'font/ttf' : (ext === '.woff' ? 'font/woff' : 'font/woff2');
                            res.writeHead(200, {
                                'Content-Type': mimeType,
                                'Access-Control-Allow-Origin': '*',
                                'Cache-Control': 'public, max-age=31536000'
                            });
                            res.end(font);
                            return;
                        }
                    } catch(err) {}
                }

                let targetHost = '127.0.0.1';
                let targetPort = 7123;
                try {
                    const tu = new URL(__rzTargetUrl);
                    targetHost = tu.hostname || '127.0.0.1';
                    targetPort = parseInt(tu.port, 10) || 7123;
                } catch(e) {}

                const isFont = url.includes('/Vazirmatn-Variable.woff2') || url.includes('/fonts/');
                const isStatic = isFont || url.endsWith('.js') || url.endsWith('.css') || url.endsWith('.png') || url.endsWith('.svg') || url.endsWith('.ico') || url.endsWith('.json') || url.endsWith('.woff2');

                const reqHeaders = { ...req.headers };
                reqHeaders.host = targetHost + ':' + targetPort;
                if (reqHeaders.origin) {
                    reqHeaders.origin = 'http://' + targetHost + ':' + targetPort;
                }
                if (reqHeaders.referer) {
                    try {
                        const refUrl = new URL(reqHeaders.referer);
                        refUrl.host = targetHost + ':' + targetPort;
                        reqHeaders.referer = refUrl.toString();
                    } catch(e) {}
                }
                delete reqHeaders['accept-encoding'];

                const proxyReq = http.request({
                    hostname: targetHost,
                    port: targetPort,
                    path: req.url,
                    method: req.method,
                    headers: reqHeaders
                }, (proxyRes) => {
                    if (!isStatic && (proxyRes.headers['content-type']?.includes('text/html') || proxyRes.headers['content-type']?.includes('application/xhtml+xml'))) {
                        const headers = { ...proxyRes.headers };
                        delete headers['content-length'];
                        let body = '';
                        proxyRes.setEncoding('utf8');
                        proxyRes.on('data', chunk => body += chunk);
                        proxyRes.on('end', () => {
                            const injection = '\\n<!-- RZ ANTIGRAVITY RTL -->\\n<script src="/rz-ide-payload.js"></script>\\n';
                            if (body.includes('</body>')) {
                                body = body.replace('</body>', injection + '</body>');
                            } else {
                                body += injection;
                            }
                            res.writeHead(proxyRes.statusCode, headers);
                            res.end(body);
                        });
                    } else {
                        res.writeHead(proxyRes.statusCode, proxyRes.headers);
                        proxyRes.pipe(res);
                    }
                });

                proxyReq.on('error', (err) => {
                    try {
                        res.writeHead(502);
                        res.end('Proxy Error: ' + err.message);
                    } catch(e) {}
                });

                req.pipe(proxyReq);
            });

            server.on('upgrade', (req, socket, head) => {
                let targetHost = '127.0.0.1';
                let targetPort = 7123;
                try {
                    const tu = new URL(__rzTargetUrl);
                    targetHost = tu.hostname || '127.0.0.1';
                    targetPort = parseInt(tu.port, 10) || 7123;
                } catch(e) {}

                let rawReq = req.method + ' ' + (req.url || '/') + ' HTTP/1.1\\r\\n';
                const headers = req.rawHeaders || [];
                let hasHost = false;
                for (let i = 0; i < headers.length; i += 2) {
                    const key = headers[i];
                    let val = headers[i + 1] || '';
                    const lowerKey = key.toLowerCase();
                    if (lowerKey === 'host') {
                        val = targetHost + ':' + targetPort;
                        hasHost = true;
                    } else if (lowerKey === 'origin') {
                        val = 'http://' + targetHost + ':' + targetPort;
                    }
                    rawReq += key + ': ' + val + '\\r\\n';
                }
                if (!hasHost) {
                    rawReq += 'Host: ' + targetHost + ':' + targetPort + '\\r\\n';
                }
                rawReq += '\\r\\n';

                const targetSocket = net.connect(targetPort, targetHost, () => {
                    targetSocket.write(rawReq);
                    if (head && head.length > 0) {
                        targetSocket.write(head);
                    }
                    targetSocket.pipe(socket);
                    socket.pipe(targetSocket);
                });

                targetSocket.on('error', () => {
                    try { socket.destroy(); } catch(e) {}
                });
                socket.on('error', () => {
                    try { targetSocket.destroy(); } catch(e) {}
                });
            });

            const boundPort = await new Promise((resolve) => {
                const preferredPort = ${preferredPort};
                const onError = () => {
                    server.removeListener('error', onError);
                    try {
                        server.close(() => {
                            server.listen(0, '127.0.0.1', () => {
                                const addr = server.address();
                                resolve(typeof addr === 'object' && addr ? addr.port : 0);
                            });
                        });
                    } catch(err) {
                        resolve(0);
                    }
                };
                server.once('error', onError);
                server.listen(preferredPort, '127.0.0.1', () => {
                    server.removeListener('error', onError);
                    resolve(preferredPort);
                });
            });

            if (boundPort > 0) {
                __rzProxyPort = boundPort;
                __rzProxy = server;
                try {
                    const u = new URL(targetUrl);
                    u.port = String(boundPort);
                    return u.toString().replace(/\\/$/, '');
                } catch(e) {
                    return 'http://127.0.0.1:' + boundPort;
                }
            }
            return targetUrl;
        } catch(err) {
            console.error('[RZ RTL] Proxy init error:', err);
            return targetUrl;
        }
    };
})();
`;
            extCode = proxySnippet + '\n' + extCode;
            // 1. Patch Remote webview renderer (used in WSL & remote environments)
            if (extCode.includes('}async renderIframe(a,b,c){')) {
                extCode = extCode.replace('}async renderIframe(a,b,c){', '}async renderIframe(a,b,c){b=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(b):b;');
            } else if (extCode.includes('async renderIframe(a,b,c){')) {
                extCode = extCode.replace('async renderIframe(a,b,c){', 'async renderIframe(a,b,c){b=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(b):b;');
            }

            // 2. Patch Local/Desktop webview renderer
            if (extCode.includes('}renderIframe(a,b,c){')) {
                extCode = extCode.replace('}renderIframe(a,b,c){', '}async renderIframe(a,b,c){b=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(b):b;');
            } else if (extCode.includes('renderIframe(a,b,c){')) {
                extCode = extCode.replace('renderIframe(a,b,c){', 'async renderIframe(a,b,c){b=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(b):b;');
            }

            // 3. Patch external URI resolvers
            if (extCode.includes('async function DR(a,b){')) {
                extCode = extCode.replace('async function DR(a,b){', 'async function DR(a,b){a=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(a):a;');
            } else if (extCode.includes('async function pR(a,b){')) {
                extCode = extCode.replace('async function pR(a,b){', 'async function pR(a,b){a=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(a):a;');
            }
            fs.writeFileSync(extJs, extCode, 'utf8');
        }

        spinner.succeed(`Successfully patched ${label}!`);
        return true;
    } catch (e) {
        spinner.fail(`Failed to patch ${label}.`);
        console.error(red(e.message));
        return false;
    }
}

async function patchIDE(ideAppPath) {
    console.log(bold(cyan(`\n⚡ Antigravity IDE`)));
    console.log(dim(`   Path: ${ideAppPath}`));

    const workbenchDir = path.join(ideAppPath, 'out', 'vs', 'code', 'electron-browser', 'workbench');
    if (!fs.existsSync(workbenchDir)) {
        console.error(red(`✖ Could not find IDE workbench directory at:\n  ${workbenchDir}\n`));
        return false;
    }

    const workbenchHtml = path.join(workbenchDir, 'workbench.html');
    const workbenchHtmlBak = path.join(workbenchDir, 'workbench.html.original.bak');
    const jetskiAgentHtml = path.join(workbenchDir, 'workbench-jetski-agent.html');
    const jetskiAgentHtmlBak = path.join(workbenchDir, 'workbench-jetski-agent.html.original.bak');
    const idePayloadDest = path.join(workbenchDir, 'ide-payload.js');
    const fontDest = path.join(workbenchDir, 'Vazirmatn-Variable.woff2');

    const agyExtDir = path.join(ideAppPath, 'extensions', 'agy', 'vscode');
    const agyExtJs = path.join(agyExtDir, 'extension.js');

    if (isRestore) {
        const spinner = ora('Restoring original Antigravity IDE workbench...').start();
        try {
            if (fs.existsSync(workbenchHtmlBak)) {
                fs.copyFileSync(workbenchHtmlBak, workbenchHtml);
            }
            if (fs.existsSync(jetskiAgentHtmlBak)) {
                fs.copyFileSync(jetskiAgentHtmlBak, jetskiAgentHtml);
            }
            if (fs.existsSync(idePayloadDest)) {
                fs.rmSync(idePayloadDest, { force: true });
            }
            const legacyFiles = ['payload.js', 'rtl.js', 'rtl.css'];
            for (const file of legacyFiles) {
                const legacyPath = path.join(workbenchDir, file);
                if (fs.existsSync(legacyPath)) {
                    try { fs.rmSync(legacyPath, { force: true }); } catch (e) {}
                }
            }
            const ideFontsDir = path.join(workbenchDir, 'fonts');
            if (fs.existsSync(ideFontsDir)) {
                fs.rmSync(ideFontsDir, { recursive: true, force: true });
            }
            spinner.succeed('Successfully restored original Antigravity IDE workbench!');
        } catch (e) {
            spinner.fail('Failed to restore Antigravity IDE workbench.');
            console.error(red(e.message));
            return false;
        }

        if (fs.existsSync(agyExtDir) && (fs.existsSync(agyExtJs) || fs.existsSync(agyExtJs + '.original.bak'))) {
            await patchExtensionFolder(agyExtDir, {
                label: 'Antigravity IDE — Extension Host',
                preferredPort: 7198
            });
        }
        return true;
    }

    const spinner = ora('Checking IDE permissions and backing up...').start();
    try {
        fs.accessSync(workbenchDir, fs.constants.W_OK);
        if (!fs.existsSync(workbenchHtmlBak) && fs.existsSync(workbenchHtml)) {
            fs.copyFileSync(workbenchHtml, workbenchHtmlBak);
        }
        if (!fs.existsSync(jetskiAgentHtmlBak) && fs.existsSync(jetskiAgentHtml)) {
            fs.copyFileSync(jetskiAgentHtml, jetskiAgentHtmlBak);
        }
    } catch (e) {
        spinner.fail('Permission Denied on IDE folder.');
        console.error(red('\nSystem Error: ' + e.message));
        if (os.platform() === 'win32') {
            console.error(yellow('\nPlease run your terminal as Administrator and try again.\n'));
        } else {
            console.error(yellow('\nPlease run this command with sudo.\n'));
        }
        return false;
    }

    spinner.text = 'Purging legacy files and copying IDE RTL payload & fonts...';
    try {
        const idePayloadSource = path.join(__dirname, 'ide-payload.js');
        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontsDirSource = path.join(__dirname, 'fonts');
        const fontsDirDest = path.join(workbenchDir, 'fonts');

        // Clean up legacy files from other RTL packages if present
        const legacyFiles = ['payload.js', 'rtl.js', 'rtl.css'];
        for (const file of legacyFiles) {
            const legacyPath = path.join(workbenchDir, file);
            if (fs.existsSync(legacyPath)) {
                try { fs.rmSync(legacyPath, { force: true }); } catch (e) {}
            }
        }

        let idePayloadCode = injectDynamicVersion(fs.readFileSync(idePayloadSource, 'utf8'));
        fs.writeFileSync(idePayloadDest, idePayloadCode);
        if (fs.existsSync(fontSource)) {
            fs.copyFileSync(fontSource, fontDest);
        }
        if (fs.existsSync(fontsDirSource)) {
            fs.cpSync(fontsDirSource, fontsDirDest, { recursive: true });
        }
    } catch (e) {
        spinner.fail('Failed to copy payload files to IDE.');
        console.error(red(e.message));
        return false;
    }

    spinner.text = 'Patching IDE workbench HTML...';
    try {
        const patchHtmlFile = (filePath, backupFilePath) => {
            if (!fs.existsSync(filePath)) return;
            // Always read from backup if available to ensure clean slate
            let htmlContent = fs.existsSync(backupFilePath)
                ? fs.readFileSync(backupFilePath, 'utf8')
                : fs.readFileSync(filePath, 'utf8');

            // 1. Remove Trusted-Types restrictions from CSP so custom UI & scripts run smoothly
            htmlContent = htmlContent.replace(/require-trusted-types-for[\s\S]*?;/gi, '');
            htmlContent = htmlContent.replace(/trusted-types[\s\S]*?;/gi, '');

            // 2. Allow fonts (data: and 'self') in font-src
            htmlContent = htmlContent.replace(/(font-src[^;]*)/i, (match) => {
                let res = match;
                if (!res.includes("data:")) res = res.replace("font-src", "font-src data:");
                if (!res.includes("'self'")) res = res.replace("font-src", "font-src 'self'");
                return res;
            });

            // 3. Allow unsafe-inline for scripts in script-src if needed
            htmlContent = htmlContent.replace(/(script-src[^;]*)/i, (match) => {
                let res = match;
                if (!res.includes("'unsafe-inline'")) {
                    res = res.replace("script-src", "script-src 'unsafe-inline'");
                }
                return res;
            });

            // 4. Remove ALL previous RTL script/link tags and comments
            htmlContent = htmlContent.replace(/<!--\s*(?:RZ\s*)?(?:ANTIGRAVITY\s*)?RTL[\s\S]*?-->\s*/gi, '');
            htmlContent = htmlContent.replace(/<script[^>]*(?:ide-payload|payload|rtl)[^>]*><\/script>\s*/gi, '');
            htmlContent = htmlContent.replace(/<link[^>]*rtl[^>]*>\s*/gi, '');

            // 5. Injection tag
            const injectionTag = '<!-- RZ ANTIGRAVITY RTL -->\n<script src="./ide-payload.js"></script>\n';
            if (htmlContent.includes('</body>')) {
                htmlContent = htmlContent.replace('</body>', `${injectionTag}</body>`);
            } else if (htmlContent.includes('</html>')) {
                htmlContent = htmlContent.replace('</html>', `${injectionTag}</html>`);
            } else {
                htmlContent += `\n${injectionTag}`;
            }

            fs.writeFileSync(filePath, htmlContent, 'utf8');
        };

        patchHtmlFile(workbenchHtml, workbenchHtmlBak);
        patchHtmlFile(jetskiAgentHtml, jetskiAgentHtmlBak);
        spinner.succeed('Successfully patched Antigravity IDE workbench!');
    } catch (e) {
        spinner.fail('Failed to patch IDE workbench HTML.');
        console.error(red(e.message));
        return false;
    }

    // Patch extensions/agy/vscode for Chat Webview RTL Proxy
    if (fs.existsSync(agyExtDir) && (fs.existsSync(agyExtJs) || fs.existsSync(agyExtJs + '.original.bak'))) {
        await patchExtensionFolder(agyExtDir, {
            label: 'Antigravity IDE — Extension Host',
            preferredPort: 7198
        });
    }

    return true;
}

async function patchVSCodeExtension(extDir) {
    return await patchExtensionFolder(extDir, {
        label: 'VS Code Antigravity Extension',
        preferredPort: 7196
    });
}

async function patchWslTarget(target) {
    return await patchExtensionFolder(target.extDir, {
        label: target.label,
        preferredPort: target.preferredPort
    });
}

function getRunningAntigravityProcesses() {
    try {
        if (os.platform() === 'win32') {
            const out = execSync('tasklist /FI "IMAGENAME eq Antigravity*" /FO CSV /NH', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            return out.includes('Antigravity');
        } else {
            const out = execSync('pgrep -i antigravity || true', { encoding: 'utf8' });
            return out.trim().length > 0;
        }
    } catch (e) {
        return false;
    }
}

function getRunningVSCodeProcesses() {
    try {
        if (os.platform() === 'win32') {
            const out = execSync('tasklist /FI "IMAGENAME eq Code.exe" /FO CSV /NH', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
            return out.includes('Code.exe');
        } else {
            const out = execSync('pgrep -i "Code" || true', { encoding: 'utf8' });
            return out.trim().length > 0;
        }
    } catch (e) {
        return false;
    }
}

async function main() {
    if (!isRestore) {
        cleanupConflictingGlobalPackages();
    }

    const defaultAppAsar = getDefaultAppAsarPath();
    const defaultIdeApp = getDefaultIdeAppPath();
    const defaultVscodeExt = getVSCodeExtensionPath();
    const wslTargets = getWslTargets();

    const appFound = fs.existsSync(defaultAppAsar);
    const ideFound = fs.existsSync(defaultIdeApp);
    const vscodeFound = defaultVscodeExt && fs.existsSync(defaultVscodeExt);
    const wslFound = wslTargets.length > 0;

    let selectedTargets = [];

    if (targetAll) {
        selectedTargets = ['all'];
    } else if (targetAppOnly) {
        selectedTargets = ['app'];
    } else if (targetIdeOnly) {
        selectedTargets = ['ide'];
    } else if (targetVscodeOnly) {
        selectedTargets = ['vscode'];
    } else if (targetWslOnly) {
        selectedTargets = ['wsl'];
    } else {
        const anyFound = appFound || ideFound || vscodeFound || wslFound;

        if (anyFound) {
            const detectedList = [];
            if (appFound) detectedList.push('Desktop');
            if (ideFound) detectedList.push('IDE');
            if (vscodeFound) detectedList.push('VS Code Extension');
            if (wslFound) {
                const distros = [...new Set(wslTargets.map(t => t.distro))];
                detectedList.push(`WSL (${distros.join(', ')})`);
            }
            console.log(blue(`ℹ Detected installed applications: ${detectedList.join(', ')}`));

            const choices = [
                { title: 'All Applications (Desktop, IDE, VS Code & WSL) [Recommended]', value: 'all' }
            ];
            if (appFound) choices.push({ title: 'Antigravity Desktop App only', value: 'app' });
            if (ideFound || wslTargets.some(t => t.type === 'wsl-ide')) {
                choices.push({ title: 'Antigravity IDE only (Windows & WSL)', value: 'ide' });
            }
            if (vscodeFound || wslTargets.some(t => t.type === 'wsl-vscode')) {
                choices.push({ title: 'VS Code Antigravity Extension only (Windows & WSL)', value: 'vscode' });
            }
            if (wslFound) {
                const wslCount = wslTargets.length;
                choices.push({ title: `WSL environments only (${wslCount} target${wslCount > 1 ? 's' : ''})`, value: 'wsl' });
            }

            if (!appFound) choices.push({ title: 'Antigravity Desktop App only (custom path)', value: 'app-custom' });
            if (!ideFound && !wslTargets.some(t => t.type === 'wsl-ide')) {
                choices.push({ title: 'Antigravity IDE only (custom path)', value: 'ide-custom' });
            }
            if (!vscodeFound && !wslTargets.some(t => t.type === 'wsl-vscode')) {
                choices.push({ title: 'VS Code Antigravity Extension only (custom path)', value: 'vscode-custom' });
            }

            const response = await prompts({
                type: 'select',
                name: 'target',
                message: isRestore
                    ? 'Which application would you like to restore?'
                    : 'Which application would you like to patch with RZ Antigravity RTL?',
                choices: choices,
                initial: 0
            });

            if (!response.target) {
                console.log(yellow('\nOperation cancelled.\n'));
                process.exit(0);
            }

            selectedTargets = [response.target];
        } else {
            console.log(yellow('⚠ Could not find Antigravity Desktop, IDE, or VS Code Extension at default locations.'));
            const response = await prompts({
                type: 'select',
                name: 'manualTarget',
                message: 'Select which application you want to patch manually:',
                choices: [
                    { title: 'Antigravity Desktop App (specify app.asar)', value: 'app-custom' },
                    { title: 'Antigravity IDE (specify resources/app folder)', value: 'ide-custom' },
                    { title: 'VS Code Antigravity Extension (specify extension folder)', value: 'vscode-custom' }
                ]
            });

            if (!response.manualTarget) {
                console.log(yellow('\nOperation cancelled.\n'));
                process.exit(0);
            }
            selectedTargets = [response.manualTarget];
        }
    }

    let successCount = 0;

    const shouldPatchApp = selectedTargets.includes('all') || selectedTargets.includes('app') || selectedTargets.includes('app-custom');
    const shouldPatchIde = selectedTargets.includes('all') || selectedTargets.includes('ide') || selectedTargets.includes('ide-custom');
    const shouldPatchVscode = selectedTargets.includes('all') || selectedTargets.includes('vscode') || selectedTargets.includes('vscode-custom');
    const shouldPatchWsl = selectedTargets.includes('all') || selectedTargets.includes('wsl');

    // 1. Desktop App
    if (shouldPatchApp) {
        let asarPath = defaultAppAsar;
        if (selectedTargets.includes('app-custom') || (!fs.existsSync(asarPath) && !selectedTargets.includes('all'))) {
            const response = await prompts({
                type: 'text',
                name: 'customPath',
                message: 'Please enter the full path to Antigravity Desktop app.asar:'
            });
            if (response.customPath && fs.existsSync(response.customPath)) {
                asarPath = response.customPath;
            } else {
                console.error(red('✖ Invalid path. Skipping Desktop App.\n'));
                asarPath = null;
            }
        }
        if (asarPath && fs.existsSync(asarPath)) {
            const ok = await patchDesktop(asarPath);
            if (ok) successCount++;
        }
    }

    // 2. Windows Antigravity IDE
    if (shouldPatchIde) {
        let idePath = defaultIdeApp;
        if (selectedTargets.includes('ide-custom') || (!fs.existsSync(idePath) && !selectedTargets.includes('all'))) {
            const response = await prompts({
                type: 'text',
                name: 'customPath',
                message: 'Please enter the full path to Antigravity IDE resources/app folder:'
            });
            if (response.customPath && fs.existsSync(response.customPath)) {
                idePath = response.customPath;
            } else {
                console.error(red('✖ Invalid path. Skipping Windows IDE.\n'));
                idePath = null;
            }
        }
        if (idePath && fs.existsSync(idePath)) {
            const ok = await patchIDE(idePath);
            if (ok) successCount++;
        }
    }

    // 3. Windows VS Code Extension
    if (shouldPatchVscode) {
        let vscodePath = defaultVscodeExt;
        if (selectedTargets.includes('vscode-custom') || ((!vscodePath || !fs.existsSync(vscodePath)) && !selectedTargets.includes('all'))) {
            const response = await prompts({
                type: 'text',
                name: 'customPath',
                message: 'Please enter the full path to VS Code Antigravity extension folder:'
            });
            if (response.customPath && fs.existsSync(response.customPath)) {
                vscodePath = response.customPath;
            } else {
                console.error(red('✖ Invalid path. Skipping Windows VS Code Extension.\n'));
                vscodePath = null;
            }
        }
        if (vscodePath && fs.existsSync(vscodePath)) {
            const ok = await patchVSCodeExtension(vscodePath);
            if (ok) successCount++;
        }
    }

    // 4. WSL Targets (WSL IDE Server & WSL VS Code Extension)
    const wslIdeTargets = wslTargets.filter(t => t.type === 'wsl-ide');
    const wslVscodeTargets = wslTargets.filter(t => t.type === 'wsl-vscode');

    let targetsToPatchInWsl = [];
    if (shouldPatchWsl) {
        targetsToPatchInWsl = wslTargets;
    } else {
        if (shouldPatchIde) {
            targetsToPatchInWsl.push(...wslIdeTargets);
        }
        if (shouldPatchVscode) {
            targetsToPatchInWsl.push(...wslVscodeTargets);
        }
    }

    for (const wt of targetsToPatchInWsl) {
        const ok = await patchWslTarget(wt);
        if (ok) successCount++;
    }

    if (successCount > 0) {
        if (isRestore) {
            console.log(green('\n✅ Restore completed successfully! Please restart the application(s).\n'));
        } else {
            console.log(green('\n✨ RZ Antigravity RTL features enabled! Please restart your application(s) to enjoy.\n'));
        }

        const runningAnti = getRunningAntigravityProcesses();
        const runningCode = getRunningVSCodeProcesses();
        if (runningAnti || runningCode) {
            console.log(yellow('⚠️  NOTICE: Antigravity, Antigravity IDE, or VS Code is currently running in the background!'));
            console.log(yellow('   To apply changes, please restart the respective application(s) or reload the window.\n'));
        }
    }
}

main().catch(e => {
    console.error(red('\n✖ An unexpected error occurred:'), e.message);
    process.exit(1);
});
