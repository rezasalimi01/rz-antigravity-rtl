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

// Automatically keep payload source files in sync with package.json version
function syncVersionToPayloads() {
    try {
        const targetBadge = `class="rtl-version-badge">v${pkg.version}<`;
        const payloadPath = path.join(__dirname, 'payload.js');
        const idePayloadPath = path.join(__dirname, 'ide-payload.js');

        if (fs.existsSync(payloadPath)) {
            let content = fs.readFileSync(payloadPath, 'utf8');
            let updated = content.replace(/class="rtl-version-badge">v[^<]*</g, targetBadge);
            if (updated !== content) {
                fs.writeFileSync(payloadPath, updated, 'utf8');
            }
        }

        if (fs.existsSync(idePayloadPath)) {
            let content = fs.readFileSync(idePayloadPath, 'utf8');
            let updated = content.replace(/class="rtl-version-badge">v[^<]*</g, targetBadge);
            if (updated !== content) {
                fs.writeFileSync(idePayloadPath, updated, 'utf8');
            }
        }
    } catch (e) {}
}
syncVersionToPayloads();

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
        console.log(`\x1b[2m  RTL & UI Patcher for Antigravity, Antigravity IDE & VS Code Extension | v${pkg.version}\x1b[0m\n`);
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
        return '/opt/Antigravity/resources/app.asar';
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

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx rz-antigravity-rtl [options]

Options:
  --all        Patch Desktop App, Antigravity IDE, and VS Code Extension
  --app        Patch Antigravity Desktop App only
  --ide        Patch Antigravity IDE only
  --vscode     Patch VS Code Antigravity Extension only
  --restore    Restore original unpatched files (use with --app, --ide, --vscode, or --all)
  -h, --help   Show this help message
    `);
    process.exit(0);
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
        const spinner = ora('Restoring original app.asar...').start();
        try {
            fs.copyFileSync(backupPath, asarPath);
            spinner.succeed('Successfully restored original Antigravity Desktop!');
            return true;
        } catch (e) {
            spinner.fail('Failed to restore Antigravity Desktop.');
            console.error(red(e.message));
            return false;
        }
    }

    const spinner = ora('Checking permissions and backing up app.asar...').start();
    try {
        fs.accessSync(path.dirname(asarPath), fs.constants.W_OK);
        if (!fs.existsSync(backupPath)) {
            fs.copyFileSync(asarPath, backupPath);
        } else {
            // Restore from clean backup first so asar.unpacked matches and previous patches are cleanly replaced
            fs.copyFileSync(backupPath, asarPath);
        }
    } catch (e) {
        spinner.fail('Permission Denied.');
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
        let payload = fs.readFileSync(payloadPath, 'utf8');
        payload = payload.replace(/class="rtl-version-badge">v[^<]*</g, `class="rtl-version-badge">v${pkg.version}<`);

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
    const agyExtJsBak = path.join(agyExtDir, 'extension.js.original.bak');

    if (isRestore) {
        const spinner = ora('Restoring original Antigravity IDE workbench...').start();
        try {
            if (fs.existsSync(workbenchHtmlBak)) {
                fs.copyFileSync(workbenchHtmlBak, workbenchHtml);
            }
            if (fs.existsSync(jetskiAgentHtmlBak)) {
                fs.copyFileSync(jetskiAgentHtmlBak, jetskiAgentHtml);
            }
            if (fs.existsSync(agyExtJsBak)) {
                fs.copyFileSync(agyExtJsBak, agyExtJs);
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
            spinner.succeed('Successfully restored original Antigravity IDE!');
            return true;
        } catch (e) {
            spinner.fail('Failed to restore Antigravity IDE.');
            console.error(red(e.message));
            return false;
        }
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
        if (!fs.existsSync(agyExtJsBak) && fs.existsSync(agyExtJs)) {
            fs.copyFileSync(agyExtJs, agyExtJsBak);
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

        let idePayloadCode = fs.readFileSync(idePayloadSource, 'utf8');
        idePayloadCode = idePayloadCode.replace(/class="rtl-version-badge">v[^<]*</g, `class="rtl-version-badge">v${pkg.version}<`);
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

            // 4. Remove ALL previous RTL script/link tags and comments (RZ, original antigravity-rtl, or third-party)
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

        // Patch extensions/agy/vscode/extension.js for Chat Webview RTL Proxy
        if (fs.existsSync(agyExtJs)) {
            let extCode = fs.existsSync(agyExtJsBak)
                ? fs.readFileSync(agyExtJsBak, 'utf8')
                : fs.readFileSync(agyExtJs, 'utf8');

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

            const payloadPath = path.resolve(__dirname, '..', '..', '..', 'out', 'vs', 'code', 'electron-browser', 'workbench', 'ide-payload.js');
            const fontPath = path.resolve(__dirname, '..', '..', '..', 'out', 'vs', 'code', 'electron-browser', 'workbench', 'Vazirmatn-Variable.woff2');
            const fontsDir = path.resolve(__dirname, '..', '..', '..', 'out', 'vs', 'code', 'electron-browser', 'workbench', 'fonts');

            const server = http.createServer((req, res) => {
                const url = req.url || '/';

                if (url.startsWith('/rz-ide-payload.js')) {
                    try {
                        const code = fs.readFileSync(payloadPath, 'utf8');
                        res.writeHead(200, {
                            'Content-Type': 'application/javascript; charset=utf-8',
                            'Cache-Control': 'no-cache, no-store, must-revalidate'
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
                    res.writeHead(502);
                    res.end('RZ Proxy Error: ' + err.message);
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

                const targetSocket = net.connect(targetPort, targetHost, () => {
                    const reqLines = [(req.method || 'GET') + ' ' + (req.url || '/') + ' HTTP/' + (req.httpVersion || '1.1')];
                    for (let i = 0; i < req.rawHeaders.length; i += 2) {
                        const k = req.rawHeaders[i];
                        let v = req.rawHeaders[i + 1];
                        const kl = k.toLowerCase();
                        if (kl === 'host') {
                            v = targetHost + ':' + targetPort;
                        } else if (kl === 'origin') {
                            v = 'http://' + targetHost + ':' + targetPort;
                        }
                        reqLines.push(k + ': ' + v);
                    }
                    reqLines.push('', '');
                    targetSocket.write(reqLines.join('\\r\\n'));
                    if (head && head.length > 0) {
                        targetSocket.write(head);
                    }
                    socket.pipe(targetSocket).pipe(socket);
                });
                targetSocket.on('error', () => socket.destroy());
                socket.on('error', () => targetSocket.destroy());
            });

            const boundPort = await new Promise((resolve) => {
                const preferredPort = 7198;
                const onError = (e) => {
                    if (e.code === 'EADDRINUSE') {
                        server.listen(0, '127.0.0.1', () => {
                            resolve(server.address().port);
                        });
                    } else {
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
                extCode = extCode.replace('renderIframe(a,b,c){', 'async renderIframe(a,b,c){b=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(b):b;');
                extCode = extCode.replace('async function pR(a,b){', 'async function pR(a,b){a=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(a):a;');
                fs.writeFileSync(agyExtJs, extCode, 'utf8');
            }
        }

        spinner.succeed('Successfully patched Antigravity IDE!');
        return true;
    } catch (e) {
        spinner.fail('Failed to patch IDE workbench HTML.');
        console.error(red(e.message));
        return false;
    }
}

async function patchVSCodeExtension(extDir) {
    console.log(bold(cyan(`\n🔌 VS Code Antigravity Extension`)));
    console.log(dim(`   Path: ${extDir}`));

    const extJs = path.join(extDir, 'extension.js');
    const extJsBak = extJs + '.original.bak';
    const payloadDest = path.join(extDir, 'ide-payload.js');
    const fontDest = path.join(extDir, 'Vazirmatn-Variable.woff2');
    const fontsDirDest = path.join(extDir, 'fonts');

    if (isRestore) {
        if (!fs.existsSync(extJsBak)) {
            console.error(red('✖ No backup found for VS Code Extension to restore.\n'));
            return false;
        }
        const spinner = ora('Restoring original extension.js...').start();
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
            spinner.succeed('Successfully restored original VS Code Extension!');
            return true;
        } catch (e) {
            spinner.fail('Failed to restore VS Code Extension.');
            console.error(red(e.message));
            return false;
        }
    }

    const spinner = ora('Checking permissions and backing up extension.js...').start();
    try {
        fs.accessSync(extDir, fs.constants.W_OK);
        if (!fs.existsSync(extJsBak)) {
            fs.copyFileSync(extJs, extJsBak);
        } else {
            // Restore from clean backup first so re-patching applies cleanly
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

        let idePayloadCode = fs.readFileSync(idePayloadSource, 'utf8');
        idePayloadCode = idePayloadCode.replace(/class="rtl-version-badge">v[^<]*</g, `class="rtl-version-badge">v${pkg.version}<`);
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

            const payloadPath = path.resolve(__dirname, 'ide-payload.js');
            const fontPath = path.resolve(__dirname, 'Vazirmatn-Variable.woff2');
            const fontsDir = path.resolve(__dirname, 'fonts');

            const server = http.createServer((req, res) => {
                const url = req.url || '/';

                if (url.startsWith('/rz-ide-payload.js')) {
                    try {
                        const code = fs.readFileSync(payloadPath, 'utf8');
                        res.writeHead(200, {
                            'Content-Type': 'application/javascript; charset=utf-8',
                            'Cache-Control': 'no-cache, no-store, must-revalidate'
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
                const preferredPort = 7196;
                const onError = () => {
                    server.removeListener('error', onError);
                    try {
                        server.listen(0, '127.0.0.1', () => {
                            const addr = server.address();
                            resolve(typeof addr === 'object' && addr ? addr.port : 0);
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
            extCode = extCode.replace('renderIframe(a,b,c){', 'async renderIframe(a,b,c){b=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(b):b;');
            if (extCode.includes('async function DR(a,b){')) {
                extCode = extCode.replace('async function DR(a,b){', 'async function DR(a,b){a=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(a):a;');
            } else if (extCode.includes('async function pR(a,b){')) {
                extCode = extCode.replace('async function pR(a,b){', 'async function pR(a,b){a=globalThis.__rzStartProxy?await globalThis.__rzStartProxy(a):a;');
            }
            fs.writeFileSync(extJs, extCode, 'utf8');
        }

        spinner.succeed('Successfully patched VS Code Antigravity Extension!');
        return true;
    } catch (e) {
        spinner.fail('Failed to patch VS Code Extension.');
        console.error(red(e.message));
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

    const appFound = fs.existsSync(defaultAppAsar);
    const ideFound = fs.existsSync(defaultIdeApp);
    const vscodeFound = defaultVscodeExt && fs.existsSync(defaultVscodeExt);

    let selectedTargets = [];

    if (targetAll) {
        selectedTargets = [];
        if (appFound) selectedTargets.push('app');
        if (ideFound) selectedTargets.push('ide');
        if (vscodeFound) selectedTargets.push('vscode');
        if (selectedTargets.length === 0) {
            selectedTargets = ['app', 'ide', 'vscode'];
        }
    } else if (targetAppOnly) {
        selectedTargets = ['app'];
    } else if (targetIdeOnly) {
        selectedTargets = ['ide'];
    } else if (targetVscodeOnly) {
        selectedTargets = ['vscode'];
    } else {
        const anyFound = appFound || ideFound || vscodeFound;

        if (anyFound) {
            const detectedList = [];
            if (appFound) detectedList.push('Desktop');
            if (ideFound) detectedList.push('IDE');
            if (vscodeFound) detectedList.push('VS Code Extension');
            console.log(blue(`ℹ Detected installed applications: ${detectedList.join(', ')}`));

            const choices = [
                { title: 'All Applications (Desktop, IDE & VS Code Extension) [Recommended]', value: 'all' }
            ];
            if (appFound) choices.push({ title: 'Antigravity Desktop App only', value: 'app' });
            if (ideFound) choices.push({ title: 'Antigravity IDE only', value: 'ide' });
            if (vscodeFound) choices.push({ title: 'VS Code Antigravity Extension only', value: 'vscode' });

            if (!appFound) choices.push({ title: 'Antigravity Desktop App only (custom path)', value: 'app' });
            if (!ideFound) choices.push({ title: 'Antigravity IDE only (custom path)', value: 'ide' });
            if (!vscodeFound) choices.push({ title: 'VS Code Antigravity Extension only (custom path)', value: 'vscode' });

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

            if (response.target === 'all') {
                selectedTargets = [];
                if (appFound) selectedTargets.push('app');
                if (ideFound) selectedTargets.push('ide');
                if (vscodeFound) selectedTargets.push('vscode');
                if (selectedTargets.length === 0) {
                    selectedTargets = ['app', 'ide', 'vscode'];
                }
            } else {
                selectedTargets = [response.target];
            }
        } else {
            console.log(yellow('⚠ Could not find Antigravity Desktop, IDE, or VS Code Extension at default locations.'));
            const response = await prompts({
                type: 'select',
                name: 'manualTarget',
                message: 'Select which application you want to patch manually:',
                choices: [
                    { title: 'Antigravity Desktop App (specify app.asar)', value: 'app' },
                    { title: 'Antigravity IDE (specify resources/app folder)', value: 'ide' },
                    { title: 'VS Code Antigravity Extension (specify extension folder)', value: 'vscode' }
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

    for (const target of selectedTargets) {
        if (target === 'app') {
            let asarPath = defaultAppAsar;
            if (!fs.existsSync(asarPath)) {
                const response = await prompts({
                    type: 'text',
                    name: 'customPath',
                    message: 'Please enter the full path to Antigravity Desktop app.asar:'
                });
                if (!response.customPath || !fs.existsSync(response.customPath)) {
                    console.error(red('✖ Invalid path. Skipping Desktop App.\n'));
                    continue;
                }
                asarPath = response.customPath;
            }
            const ok = await patchDesktop(asarPath);
            if (ok) successCount++;
        } else if (target === 'ide') {
            let idePath = defaultIdeApp;
            if (!fs.existsSync(idePath)) {
                const response = await prompts({
                    type: 'text',
                    name: 'customPath',
                    message: 'Please enter the full path to Antigravity IDE resources/app folder:'
                });
                if (!response.customPath || !fs.existsSync(response.customPath)) {
                    console.error(red('✖ Invalid path. Skipping IDE.\n'));
                    continue;
                }
                idePath = response.customPath;
            }
            const ok = await patchIDE(idePath);
            if (ok) successCount++;
        } else if (target === 'vscode') {
            let vscodePath = defaultVscodeExt;
            if (!vscodePath || !fs.existsSync(vscodePath)) {
                const response = await prompts({
                    type: 'text',
                    name: 'customPath',
                    message: 'Please enter the full path to VS Code Antigravity extension folder:'
                });
                if (!response.customPath || !fs.existsSync(response.customPath)) {
                    console.error(red('✖ Invalid path. Skipping VS Code Extension.\n'));
                    continue;
                }
                vscodePath = response.customPath;
            }
            const ok = await patchVSCodeExtension(vscodePath);
            if (ok) successCount++;
        }
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
            console.log(yellow('   To apply changes, please restart the respective application(s).\n'));
        }
    }
}

main().catch(e => {
    console.error(red('\n✖ An unexpected error occurred:'), e.message);
    process.exit(1);
});
