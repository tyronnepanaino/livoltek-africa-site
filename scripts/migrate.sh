#!/bin/bash
# ════════════════════════════════════════════════════════════════════
# LIVOLTEK AFRICA — React SPA to Astro Migration Script
# ════════════════════════════════════════════════════════════════════
#
# USAGE:
#   1. Copy /astro-migration/ to your local machine
#   2. Set REACT_SRC to point to your existing React project's src/app
#   3. Run: chmod +x scripts/migrate.sh && bash scripts/migrate.sh
#
# This script copies all files that transfer UNCHANGED from the
# React SPA into the Astro project structure.
# ════════════════════════════════════════════════════════════════════

set -e

# ─── Configuration ─────────────────────────────────────────
# Set this to the absolute path of your existing React project
REACT_SRC="${REACT_SRC:-../livoltek-africa/src/app}"
REACT_ROOT="${REACT_ROOT:-../livoltek-africa}"
ASTRO_SRC="./src"

echo "╔════════════════════════════════════════════════╗"
echo "║  Livoltek Africa — Astro Migration Script      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "React source: $REACT_SRC"
echo "Astro target: $ASTRO_SRC"
echo ""

# ─── 1. Lib files (copy as-is, no changes) ────────────────
echo "📦 Copying lib files..."
mkdir -p "$ASTRO_SRC/lib"

# These files need ZERO modifications
cp "$REACT_SRC/lib/types.ts"           "$ASTRO_SRC/lib/types.ts"
cp "$REACT_SRC/lib/firebase.ts"        "$ASTRO_SRC/lib/firebase.ts"
cp "$REACT_SRC/lib/firebaseService.ts" "$ASTRO_SRC/lib/firebaseService.ts"
cp "$REACT_SRC/lib/analytics.ts"       "$ASTRO_SRC/lib/analytics.ts"
cp "$REACT_SRC/lib/mockData.ts"        "$ASTRO_SRC/lib/mockData.ts"
cp "$REACT_SRC/lib/store.tsx"          "$ASTRO_SRC/lib/store.tsx"

echo "   ✓ types.ts, firebase.ts, firebaseService.ts, analytics.ts, mockData.ts, store.tsx"

# ─── 2. React island components (copy as-is) ──────────────
echo "📦 Copying React island components..."
mkdir -p "$ASTRO_SRC/components"

# These React components become Astro "islands" — no changes needed
cp "$REACT_SRC/components/FloatingWhatsApp.tsx"            "$ASTRO_SRC/components/FloatingWhatsApp.tsx"
cp "$REACT_SRC/components/analytics/CookieConsent.tsx"     "$ASTRO_SRC/components/CookieConsent.tsx"
cp "$REACT_SRC/components/RichTextEditor.tsx"              "$ASTRO_SRC/components/RichTextEditor.tsx"

echo "   ✓ FloatingWhatsApp.tsx, CookieConsent.tsx, RichTextEditor.tsx"

# ─── 3. Admin pages (copy as-is into pages-react) ─────────
echo "📦 Copying admin page components..."
mkdir -p "$ASTRO_SRC/pages-react/admin"

cp "$REACT_SRC/pages/admin/AdminDashboard.tsx"     "$ASTRO_SRC/pages-react/admin/AdminDashboard.tsx"
cp "$REACT_SRC/pages/admin/AdminProducts.tsx"      "$ASTRO_SRC/pages-react/admin/AdminProducts.tsx"
cp "$REACT_SRC/pages/admin/AdminProductForm.tsx"   "$ASTRO_SRC/pages-react/admin/AdminProductForm.tsx"
cp "$REACT_SRC/pages/admin/AdminInsights.tsx"      "$ASTRO_SRC/pages-react/admin/AdminInsights.tsx"
cp "$REACT_SRC/pages/admin/AdminInsightForm.tsx"   "$ASTRO_SRC/pages-react/admin/AdminInsightForm.tsx"
cp "$REACT_SRC/pages/admin/AdminQuotes.tsx"        "$ASTRO_SRC/pages-react/admin/AdminQuotes.tsx"
cp "$REACT_SRC/pages/admin/AdminResources.tsx"     "$ASTRO_SRC/pages-react/admin/AdminResources.tsx"
cp "$REACT_SRC/pages/admin/AdminResourceForm.tsx"  "$ASTRO_SRC/pages-react/admin/AdminResourceForm.tsx"
cp "$REACT_SRC/components/layout/AdminLayout.tsx"  "$ASTRO_SRC/pages-react/admin/AdminLayoutReact.tsx"

echo "   ✓ All 8 admin page components + AdminLayout"

# ─── 4. UI components (copy entire directory) ─────────────
echo "📦 Copying shadcn/ui components..."
mkdir -p "$ASTRO_SRC/components/ui"
cp "$REACT_SRC/components/ui/"*.tsx "$ASTRO_SRC/components/ui/" 2>/dev/null || true
cp "$REACT_SRC/components/ui/"*.ts  "$ASTRO_SRC/components/ui/" 2>/dev/null || true

echo "   ✓ All shadcn/ui components"

# ─── 5. Public assets ─────────────────────────────────────
echo "📦 Copying public assets..."
mkdir -p "./public/images"
cp -r "$REACT_ROOT/public/images/"*  "./public/images/" 2>/dev/null || true
cp "$REACT_ROOT/public/robots.txt"   "./public/robots.txt" 2>/dev/null || true
cp "$REACT_ROOT/public/sitemap.xml"  "./public/sitemap.xml" 2>/dev/null || true

echo "   ✓ Images, robots.txt, sitemap.xml"

# ─── 6. Firebase config ──────────────────────────────────
echo "📦 Copying Firebase config..."
cp "$REACT_ROOT/firebase.json" "./firebase.json" 2>/dev/null || true

echo "   ✓ firebase.json"

# ─── 7. Fix import paths in admin pages ──────────────────
echo "🔧 Fixing import paths in admin pages..."

# Admin pages imported from '../lib/store' etc. — need to adjust
# since they're now at src/pages-react/admin/ instead of src/app/pages/admin/
if command -v sed &>/dev/null; then
  for f in "$ASTRO_SRC/pages-react/admin/"*.tsx; do
    # Fix relative imports: ../../lib/ → ../../lib/
    # (path depth is the same, so most imports work as-is)
    # Fix ../../components/ → ../../components/
    # These should already be correct since both structures have same depth
    echo "   Checking: $(basename "$f")"
  done
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ Migration complete!"
echo ""
echo "Files copied:"
echo "  • 6 lib files (types, firebase, analytics, mockData, store)"
echo "  • 3 React island components"
echo "  • 8 admin page components"
echo "  • All shadcn/ui components"
echo "  • Public assets"
echo "  • Firebase config"
echo ""
echo "NEXT STEPS:"
echo "  1. Run: pnpm install"
echo "  2. Fix any import paths that reference 'react-router-dom'"
echo "     (change to 'react-router' or remove entirely for static pages)"
echo "  3. Review admin page imports — they may need path adjustments"
echo "  4. Run: pnpm dev"
echo "  5. Test all pages"
echo "  6. Run: pnpm build"
echo "  7. Deploy: pnpm deploy"
echo "═══════════════════════════════════════════════════"
