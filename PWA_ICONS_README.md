# PWA Icons Setup Guide

## Required Icon Sizes

Your PWA needs the following icon sizes in the `/public` directory:

### Standard Icons (any purpose)
- `icon-72.png` - 72x72px
- `icon-96.png` - 96x96px
- `icon-128.png` - 128x128px
- `icon-144.png` - 144x144px
- `icon-152.png` - 152x152px
- `icon-192.png` - 192x192px
- `icon-384.png` - 384x384px
- `icon-512.png` - 512x512px

### Maskable Icons (adaptive icons for Android)
- `icon-maskable-192.png` - 192x192px (with safe zone padding)
- `icon-maskable-512.png` - 512x512px (with safe zone padding)

### Apple-specific Icons
- `apple-touch-icon.png` - 180x180px (for iOS home screen)

### Favicon
- `favicon.ico` - 32x32px or multi-size

## How to Generate Icons

### Option 1: Use an Online Tool (Recommended for Quick Setup)

1. **PWA Asset Generator**: https://www.pwabuilder.com/imageGenerator
   - Upload your base logo (minimum 512x512px)
   - Download all generated icons
   - Place in `/public` directory

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Upload your logo
   - Customize settings
   - Download and extract to `/public`

### Option 2: Use Command Line Tool

Install the PWA Asset Generator:

```bash
npm install -g pwa-asset-generator
```

Generate all icons from a single source image:

```bash
pwa-asset-generator path/to/logo.png ./public \
  --icon-only \
  --favicon \
  --mstile \
  --type png
```

### Option 3: Manual Creation with ImageMagick

Install ImageMagick, then run:

```bash
# Standard icons
convert logo.png -resize 72x72 public/icon-72.png
convert logo.png -resize 96x96 public/icon-96.png
convert logo.png -resize 128x128 public/icon-128.png
convert logo.png -resize 144x144 public/icon-144.png
convert logo.png -resize 152x152 public/icon-152.png
convert logo.png -resize 192x192 public/icon-192.png
convert logo.png -resize 384x384 public/icon-384.png
convert logo.png -resize 512x512 public/icon-512.png

# Apple touch icon
convert logo.png -resize 180x180 public/apple-touch-icon.png
```

For maskable icons, add 20% padding (safe zone):

```bash
convert logo.png -resize 154x154 -gravity center -extent 192x192 -background transparent public/icon-maskable-192.png
convert logo.png -resize 410x410 -gravity center -extent 512x512 -background transparent public/icon-maskable-512.png
```

## Design Guidelines

### Standard Icons
- Use your full logo or app icon
- Ensure good contrast
- PNG format with transparency
- Square aspect ratio

### Maskable Icons
- 20% safe zone padding on all sides
- The important content should fit in the center 80%
- Background should not be transparent
- Use your brand color as background

### Best Practices
1. Start with a 1024x1024px or larger source image
2. Use SVG when possible for scaling
3. Test icons on both light and dark backgrounds
4. Ensure icons are recognizable at small sizes (72x72)
5. Use consistent branding across all sizes

## Quick Test

After adding icons, test your PWA:

1. Build your app: `npm run build`
2. Serve the production build: `npm start`
3. Open Chrome DevTools > Application > Manifest
4. Check all icons are loaded correctly
5. Test on mobile: Open site, tap "Add to Home Screen"

## Temporary Placeholder Icons

If you need to test PWA functionality immediately, you can use solid color placeholders:

```bash
# Create simple colored squares as temporary icons
convert -size 192x192 xc:#FF6B6B public/icon-192.png
convert -size 512x512 xc:#FF6B6B public/icon-512.png
convert -size 192x192 xc:#FF6B6B public/icon-maskable-192.png
convert -size 512x512 xc:#FF6B6B public/icon-maskable-512.png
convert -size 180x180 xc:#FF6B6B public/apple-touch-icon.png
```

Replace these with proper branded icons before production deployment.
