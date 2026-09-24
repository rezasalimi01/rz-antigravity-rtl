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
        console.log(`\x1b[2m  RTL & UI Patcher for Antigravity & Antigravity IDE | v${pkg.version}\x1b[0m\n`);
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
    } else {
        return '/opt/Antigravity IDE/resources/app';
    }
}

const args = process.argv.slice(2);
const isRestore = args.includes('--restore');
const targetAll = args.includes('--all');
const targetAppOnly = args.includes('--app');
const targetIdeOnly = args.includes('--ide');

if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage:
  npx rz-antigravity-rtl [options]

Options:
  --all        Patch both Antigravity Desktop App and Antigravity IDE
  --app        Patch Antigravity Desktop App only
  --ide        Patch Antigravity IDE only
  --restore    Restore original unpatched files (use with --app, --ide, or --all)
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

        if (utilsCode.includes('/* RZ ANTIGRAVITY RTL PATCH */')) {
            if (utilsCode.includes('/* END RZ ANTIGRAVITY RTL PATCH */')) {
                utilsCode = utilsCode.replace(/\/\* RZ ANTIGRAVITY RTL PATCH \*\/[\s\S]*?\/\* END RZ ANTIGRAVITY RTL PATCH \*\/\s*/, 'void win.loadURL(url);');
            } else {
                utilsCode = utilsCode.replace(/\/\* RZ ANTIGRAVITY RTL PATCH \*\/[\s\S]*?void win\.loadURL\(url\);/, 'void win.loadURL(url);');
            }
        }

        const payloadPath = path.join(__dirname, 'payload.js');
        const payload = fs.readFileSync(payloadPath, 'utf8');

        const anchor = 'void win.loadURL(url);';
        if (!utilsCode.includes(anchor)) {
            throw new Error('Injection anchor not found in dist/utils.js. The app version might be unsupported.');
        }

        utilsCode = utilsCode.replace(anchor, payload);
        utilsCode = utilsCode.replace(/devTools:\s*!electron_1?\.app\.isPackaged/g, 'devTools: true');
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

    spinner.text = 'Copying IDE RTL payload and fonts...';
    try {
        const idePayloadSource = path.join(__dirname, 'ide-payload.js');
        const fontSource = path.join(__dirname, 'Vazirmatn-Variable.woff2');
        const fontsDirSource = path.join(__dirname, 'fonts');
        const fontsDirDest = path.join(workbenchDir, 'fonts');

        fs.copyFileSync(idePayloadSource, idePayloadDest);
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

            // 4. Remove any existing RZ script tag
            htmlContent = htmlContent.replace(/<!-- RZ ANTIGRAVITY RTL -->\s*<script[^>]*ide-payload\.js[^>]*><\/script>\s*/gi, '');

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

        spinner.succeed('Successfully patched Antigravity IDE!');
        return true;
    } catch (e) {
        spinner.fail('Failed to patch IDE workbench HTML.');
        console.error(red(e.message));
        return false;
    }
}

async function main() {
    const defaultAppAsar = getDefaultAppAsarPath();
    const defaultIdeApp = getDefaultIdeAppPath();

    const appFound = fs.existsSync(defaultAppAsar);
    const ideFound = fs.existsSync(defaultIdeApp);

    let selectedTargets = [];

    if (targetAll) {
        selectedTargets = ['app', 'ide'];
    } else if (targetAppOnly) {
        selectedTargets = ['app'];
    } else if (targetIdeOnly) {
        selectedTargets = ['ide'];
    } else {
        if (appFound && ideFound) {
            const response = await prompts({
                type: 'select',
                name: 'target',
                message: isRestore
                    ? 'Which application would you like to restore?'
                    : 'Which application would you like to patch with RZ Antigravity RTL?',
                choices: [
                    { title: 'Both Antigravity Desktop & Antigravity IDE (Recommended)', value: 'both' },
                    { title: 'Antigravity Desktop App only', value: 'app' },
                    { title: 'Antigravity IDE only', value: 'ide' }
                ],
                initial: 0
            });

            if (!response.target) {
                console.log(yellow('\nOperation cancelled.\n'));
                process.exit(0);
            }

            if (response.target === 'both') selectedTargets = ['app', 'ide'];
            else selectedTargets = [response.target];
        } else if (appFound && !ideFound) {
            console.log(blue('ℹ Found Antigravity Desktop App. (Antigravity IDE not detected at default location)'));
            selectedTargets = ['app'];
        } else if (!appFound && ideFound) {
            console.log(blue('ℹ Found Antigravity IDE. (Antigravity Desktop App not detected at default location)'));
            selectedTargets = ['ide'];
        } else {
            console.log(yellow('⚠ Could not find Antigravity Desktop or IDE at default locations.'));
            const response = await prompts({
                type: 'select',
                name: 'manualTarget',
                message: 'Select which application you want to patch manually:',
                choices: [
                    { title: 'Antigravity Desktop App (specify app.asar)', value: 'app' },
                    { title: 'Antigravity IDE (specify resources/app folder)', value: 'ide' }
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

    if (successCount > 0) {
        if (isRestore) {
            console.log(green('\n✅ Restore completed successfully! Please restart the application(s).\n'));
        } else {
            console.log(green('\n✨ RZ Antigravity RTL features enabled! Please restart your application(s) to enjoy.\n'));
        }

        if (getRunningAntigravityProcesses()) {
            console.log(yellow('⚠️  NOTICE: Antigravity or Antigravity IDE is currently running in the background!'));
            console.log(yellow('   Electron apps minimize to the Windows System Tray (near the clock) when closed.'));
            console.log(yellow('   To apply changes, please right-click the tray icon and Quit, or restart them via Task Manager.\n'));
        }
    }
}

main().catch(e => {
    console.error(red('\n✖ An unexpected error occurred:'), e.message);
    process.exit(1);
});
