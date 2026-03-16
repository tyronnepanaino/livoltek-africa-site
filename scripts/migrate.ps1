# ════════════════════════════════════════════════════════════════════
# LIVOLTEK AFRICA — React SPA to Astro Migration Script (Windows)
# ════════════════════════════════════════════════════════════════════
#
# USAGE (PowerShell):
#   1. Open PowerShell
#   2. cd to the astro-migration folder
#   3. Run:  .\scripts\migrate.ps1
#
# If you get a "script not allowed" error, run this FIRST:
#   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# ════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

# ─── Configuration ─────────────────────────────────────────
# CHANGE THIS to the path of your existing React project
$REACT_ROOT = "C:\Users\Natasha\Desktop\Livoltek Website\livoltek-africa"
$REACT_SRC  = "$REACT_ROOT\src\app"
$ASTRO_SRC  = ".\src"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Livoltek Africa - Astro Migration Script (Windows)  " -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "React source: $REACT_SRC"
Write-Host "Astro target: $ASTRO_SRC"
Write-Host ""

# ─── Verify source exists ─────────────────────────────────
if (-not (Test-Path $REACT_SRC)) {
    Write-Host "ERROR: React source not found at: $REACT_SRC" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please edit this script and set `$REACT_ROOT to your React project path." -ForegroundColor Yellow
    Write-Host "Look for the line near the top that says:" -ForegroundColor Yellow
    Write-Host '  $REACT_ROOT = "C:\Users\Natasha\Desktop\..."' -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# ─── 1. Lib files (copy as-is) ────────────────────────────
Write-Host "Copying lib files..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$ASTRO_SRC\lib" -Force | Out-Null

$libFiles = @("types.ts", "firebase.ts", "firebaseService.ts", "analytics.ts", "mockData.ts", "store.tsx")
foreach ($f in $libFiles) {
    $src = "$REACT_SRC\lib\$f"
    if (Test-Path $src) {
        Copy-Item $src "$ASTRO_SRC\lib\$f" -Force
        Write-Host "   OK  $f" -ForegroundColor DarkGreen
    } else {
        Write-Host "   SKIP  $f (not found)" -ForegroundColor Yellow
    }
}

# ─── 2. React island components ───────────────────────────
Write-Host ""
Write-Host "Copying React island components..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$ASTRO_SRC\components" -Force | Out-Null

$islands = @(
    @{ src = "components\FloatingWhatsApp.tsx";         dest = "components\FloatingWhatsApp.tsx" },
    @{ src = "components\analytics\CookieConsent.tsx";  dest = "components\CookieConsent.tsx" },
    @{ src = "components\RichTextEditor.tsx";           dest = "components\RichTextEditor.tsx" }
)
foreach ($item in $islands) {
    $src = "$REACT_SRC\$($item.src)"
    if (Test-Path $src) {
        Copy-Item $src "$ASTRO_SRC\$($item.dest)" -Force
        Write-Host "   OK  $($item.dest)" -ForegroundColor DarkGreen
    } else {
        Write-Host "   SKIP  $($item.src) (not found)" -ForegroundColor Yellow
    }
}

# ─── 3. Admin pages ──────────────────────────────────────
Write-Host ""
Write-Host "Copying admin page components..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$ASTRO_SRC\pages-react\admin" -Force | Out-Null

$adminFiles = @(
    "AdminDashboard.tsx",
    "AdminProducts.tsx",
    "AdminProductForm.tsx",
    "AdminInsights.tsx",
    "AdminInsightForm.tsx",
    "AdminQuotes.tsx",
    "AdminResources.tsx",
    "AdminResourceForm.tsx"
)
foreach ($f in $adminFiles) {
    $src = "$REACT_SRC\pages\admin\$f"
    if (Test-Path $src) {
        Copy-Item $src "$ASTRO_SRC\pages-react\admin\$f" -Force
        Write-Host "   OK  $f" -ForegroundColor DarkGreen
    } else {
        Write-Host "   SKIP  $f (not found)" -ForegroundColor Yellow
    }
}

# AdminLayout
$adminLayout = "$REACT_SRC\components\layout\AdminLayout.tsx"
if (Test-Path $adminLayout) {
    Copy-Item $adminLayout "$ASTRO_SRC\pages-react\admin\AdminLayoutReact.tsx" -Force
    Write-Host "   OK  AdminLayout.tsx -> AdminLayoutReact.tsx" -ForegroundColor DarkGreen
}

# ─── 4. UI components (entire folder) ────────────────────
Write-Host ""
Write-Host "Copying shadcn/ui components..." -ForegroundColor Green
New-Item -ItemType Directory -Path "$ASTRO_SRC\components\ui" -Force | Out-Null

$uiDir = "$REACT_SRC\components\ui"
if (Test-Path $uiDir) {
    $uiFiles = Get-ChildItem $uiDir -File -Include *.tsx, *.ts
    $count = 0
    foreach ($f in $uiFiles) {
        Copy-Item $f.FullName "$ASTRO_SRC\components\ui\$($f.Name)" -Force
        $count++
    }
    Write-Host "   OK  $count UI component files copied" -ForegroundColor DarkGreen
} else {
    Write-Host "   SKIP  ui/ directory not found" -ForegroundColor Yellow
}

# ─── 5. Public assets ────────────────────────────────────
Write-Host ""
Write-Host "Copying public assets..." -ForegroundColor Green
New-Item -ItemType Directory -Path ".\public\images" -Force | Out-Null

$publicImages = "$REACT_ROOT\public\images"
if (Test-Path $publicImages) {
    Copy-Item "$publicImages\*" ".\public\images\" -Recurse -Force
    Write-Host "   OK  images/" -ForegroundColor DarkGreen
} else {
    Write-Host "   SKIP  public/images/ not found" -ForegroundColor Yellow
}

$robotsTxt = "$REACT_ROOT\public\robots.txt"
if (Test-Path $robotsTxt) {
    Copy-Item $robotsTxt ".\public\robots.txt" -Force
    Write-Host "   OK  robots.txt" -ForegroundColor DarkGreen
}

$sitemap = "$REACT_ROOT\public\sitemap.xml"
if (Test-Path $sitemap) {
    Copy-Item $sitemap ".\public\sitemap.xml" -Force
    Write-Host "   OK  sitemap.xml" -ForegroundColor DarkGreen
}

# ─── 6. Firebase config ─────────────────────────────────
Write-Host ""
Write-Host "Copying Firebase config..." -ForegroundColor Green
$firebaseJson = "$REACT_ROOT\firebase.json"
if (Test-Path $firebaseJson) {
    Copy-Item $firebaseJson ".\firebase.json" -Force
    Write-Host "   OK  firebase.json" -ForegroundColor DarkGreen
} else {
    Write-Host "   SKIP  firebase.json not found" -ForegroundColor Yellow
}

# ─── Done ────────────────────────────────────────────────
Write-Host ""
Write-Host "======================================================" -ForegroundColor Green
Write-Host "  MIGRATION COMPLETE" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "  1. pnpm install"
Write-Host "  2. pnpm dev"
Write-Host "  3. Open http://localhost:4321/"
Write-Host "  4. Test all pages"
Write-Host "  5. pnpm build"
Write-Host "  6. firebase deploy --only hosting"
Write-Host ""
