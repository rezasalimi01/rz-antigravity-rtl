# RZ Antigravity RTL & UI Patcher

A smart and beautiful RTL (Right-to-Left) patch for both **Antigravity Desktop** and **Antigravity IDE**.

This CLI tool automatically injects a sophisticated RTL engine into Antigravity applications, adding support for Persian (Farsi), Arabic, Hebrew, and other RTL languages, along with a sleek UI to configure fonts and settings on the fly.

## ✨ Features

- **Dual Support**: Fully patches both **Antigravity Desktop** and **Antigravity IDE**.
- **Strict Code Editor Isolation**: In Antigravity IDE, only the chat panel (`antigravity-agent-side-panel`, inputs, and questions) is RTL-patched. The Monaco code editor, file explorer, status bar, and code blocks (`<pre>`, `<code>`) remain strictly LTR and untouched!
- **Neon Volt & Pitch Black Theme**: Modern obsidian & pitch black design (`#000000`) with vibrant electric lime accents (`#D0FE1B`) for maximum visual pop and readability.
- **Fluid UI & Custom Spring Dropdowns**: Custom animated dropdown menus that open with smooth spring physics instead of rigid native OS selects.
- **Click-to-Open & Micro-Animations**: Trigger button scales up slightly on hover and only opens on click. Changing slider values triggers a responsive micro-pulse badge animation.
- **Draggable with 4-Corner Snap (Strictly Confined to Chat)**: Drag the settings button within the chat panel to snap intelligently to any of the 4 inner corners, never escaping into the Monaco editor or rest of IDE.
- **Font Dropdown Selector**: Built-in dropdowns to easily pick between curated offline fonts:
  - **Persian**: Default (Vazirmatn), IRANSans X, IRANYekanX Pro, Kalameh, Noora, Pelak, Ravi, Yekan Bakh
  - **English**: Default (System), Open Sans, Roboto, Fira Sans
  - **Code**: Default (Monospace), Fira Code, JetBrains Mono
- **Live Slider Values**: Interactive Line Height and Font Size sliders with real-time numeric value displays and one-click reset buttons.
- **Smart Auto-Direction**: Automatically detects if a paragraph is RTL or LTR and aligns it perfectly.
- **Force RTL Mode**: Want everything aligned to the right? Just toggle the switch.
- **Persian Keyboard Fix**: Maps `Shift + 2` to type `@` instead of `٬` on Persian keyboards.
- **Safe Backups & Restore**: Automatic backups created prior to patching, with a simple `--restore` command.

## 🚀 Installation & Usage

You don't need to manually configure any files. Just run the following command in your terminal:

```bash
npx rz-antigravity-rtl
```

An interactive menu will detect your installed applications and let you choose:
1. **Both Antigravity Desktop & Antigravity IDE (Recommended)**
2. **Antigravity Desktop App only**
3. **Antigravity IDE only**

### Command-line Options

```bash
# Patch both Desktop and IDE automatically
npx rz-antigravity-rtl --all

# Patch only Antigravity IDE
npx rz-antigravity-rtl --ide

# Patch only Antigravity Desktop
npx rz-antigravity-rtl --app

# Restore original unpatched files
npx rz-antigravity-rtl --restore
npx rz-antigravity-rtl --ide --restore
npx rz-antigravity-rtl --app --restore
```

### OS Specific Notes

#### Windows
Run **PowerShell** (as Administrator if your apps are in Program Files, or standard terminal if in LocalAppData):
```powershell
npx rz-antigravity-rtl
```

#### macOS
```bash
sudo npx rz-antigravity-rtl
```
> **macOS Users:** If you get a "Permission Denied" error, ensure your terminal has **App Management** permissions in `System Settings > Privacy & Security > App Management`.

#### Linux
```bash
sudo npx rz-antigravity-rtl
```

> [!WARNING]
> **App Updates:** Since updating Antigravity or Antigravity IDE overwrites internal files, you will need to run `npx rz-antigravity-rtl` again after updating to re-apply the patch.

---

<div dir="rtl">

# ابزار هوشمند راست‌به‌چپ RZ Antigravity RTL

یک پچِ هوشمند و زیبا برای پشتیبانی کامل از زبان‌های راست‌به‌چپ (RTL) در هر دو برنامهٔ **Antigravity Desktop** و **Antigravity IDE**.

این ابزار خط فرمان (CLI) به صورت خودکار موتور پیشرفتهٔ RTL را به هستهٔ برنامه و محیط چت آنتی‌گرویتی تزریق می‌کند تا از زبان‌های فارسی، عربی و عبری به بهترین شکل پشتیبانی شود و یک پنل تنظیماتِ شناور با نام **RZ Antigravity RTL** برای تغییر زندهٔ فونت‌ها، اندازهٔ خطوط و قلم در اختیار شما قرار می‌دهد.

## ✨ امکانات

- **پشتیبانی دوگانه**: قابل اعمال روی هر دو برنامهٔ **Antigravity Desktop** و **Antigravity IDE**.
- **ایزوله بودن کامل ادیتور کد در IDE**: محیط کدنویسی اصلی (Monaco Editor)، درخت فایل‌ها، تب‌ها، منوها و بلوک‌های کد (`pre` و `code`) کاملاً دست‌نخورده و چپ‌چین می‌مانند و فقط پنل چت و اینپوت‌ها راست‌چین می‌شوند.
- **ترکیب رنگی نئون لایم و مشکی عمیق**: تم مدرن مشکی خالص (`#000000`) با لهجه‌های جذاب سبز-فسفری/لایم نئون (`#D0FE1B`) برای کنتراست فوق‌العاده و زیبایی چشم‌نواز.
- **رابط کاربری نرم و دراپ‌داون‌های فنری انیمیشنی**: باز شدن دراپ‌داون‌ها با فیزیک اسپرینگ (فنری) نرم و مدرن به جای سلکتورهای ساده و خشک پیش‌فرض سیستم‌عامل.
- **میکرو-انیمیشن‌ها و باز شدن کلیکی**: دکمه تنظیمات با رفتن موس روی آن کمی بزرگتر می‌شود و فقط با کلیک باز می‌شود؛ تغییر اسلایدرها همراه با پالس و میکروانیمیشن مقادیر عددی است.
- **درگ و اسنپ هوشمند به ۴ گوشه (کاملاً ایزوله در باکس چت)**: در Antigravity IDE، دکمه تنها در محدودهٔ داخلی باکس چت حرکت می‌کند و به هیچ وجه وارد محیط ادیتور کد یا سایر بخش‌های IDE نمی‌شود و به ۴ گوشهٔ داخلی باکس اسنپ می‌شود.
- **دراپ‌داون اختصاصی انتخاب فونت‌های آفلاین**:
  - **فارسی**: پیش‌فرض (Vazirmatn)، ایران سنس ایکس (IRANSans X)، ایران یکان ایکس (IRANYekanX Pro)، کلمه (Kalameh)، نورا (Noora)، پلاک (Pelak)، راوی (Ravi)، یکان بخ (Yekan Bakh)
  - **انگلیسی**: پیش‌فرض (System)، اوپن سنس (Open Sans)، روبوتو (Roboto)، فیرا سنس (Fira Sans)
  - **کد نویسی**: پیش‌فرض (Monospace)، فیرا کد (Fira Code)، جت‌برینز مونو (JetBrains Mono)
- **نمایش عددی زنده برای اسلایدرها**: نمایش عدد دقیق Line Height و Font Size در کنار اسلایدرها به همراه دکمه‌های ریست سریع.
- **راست‌چین هوشمند (Smart Auto-Direction)**: سیستم به صورت خودکار تشخیص می‌دهد که هر پیام با حرف فارسی شروع شده یا انگلیسی و جهت آن را تنظیم می‌کند.
- **حالت راست‌چینِ اجباری (Force RTL Mode)**: قابلیت سوئیچ برای راست‌چین کردن تمام پیام‌های چت.
- **اصلاح کیبورد فارسی**: رفع مشکل کلید `Shift + 2` برای تایپ علامت `@` به جای «٬».
- **بازگردانی امن (Restore)**: تهیه بک‌آپ خودکار و بازگردانی سریع به حالت پیش‌فرض با فلگ `--restore`.

## 🚀 نحوهٔ استفاده

برای اجرا کافیست دستور زیر را در ترمینال وارد کنید:

```bash
npx rz-antigravity-rtl
```

ابزار به صورت خودکار برنامه‌های نصب‌شده روی سیستم شما را شناسایی کرده و منوی زیر را نمایش می‌دهد:
1. **Both Antigravity Desktop & Antigravity IDE (Recommended)**
2. **Antigravity Desktop App only**
3. **Antigravity IDE only**

### گزینه‌های خط فرمان

```bash
# پچ کردن هم‌زمان دسکتاپ و IDE
npx rz-antigravity-rtl --all

# پچ کردن فقط محیط Antigravity IDE
npx rz-antigravity-rtl --ide

# پچ کردن فقط برنامه Antigravity دسکتاپ
npx rz-antigravity-rtl --app

# بازگردانی به نسخه اصلی (حذف پچ)
npx rz-antigravity-rtl --restore
npx rz-antigravity-rtl --ide --restore
npx rz-antigravity-rtl --app --restore
```

</div>
