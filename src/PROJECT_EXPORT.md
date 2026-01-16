# Cannabis Experience Selector - Complete Project Export

## 🚀 Quick Start Guide

This is your complete **Guided Outcomes™ powered by StrainMath™** cannabis experience recommendation app.

---

## 📋 Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- Basic terminal/command line knowledge

---

## 🛠️ Setup Instructions

### Step 1: Create React + Vite Project

```bash
npm create vite@latest cannabis-selector -- --template react-ts
cd cannabis-selector
```

### Step 2: Install Tailwind CSS v4

```bash
npm install tailwindcss@next @tailwindcss/vite@next
```

### Step 3: Install Dependencies

```bash
npm install motion qrcode lucide-react sonner@2.0.3
npm install -D @types/qrcode
```

### Step 4: Configure Vite

Replace `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'motion/react': 'framer-motion',
    },
  },
});
```

### Step 5: Update package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

---

## 📁 Project Structure

```
cannabis-selector/
├── public/
│   └── assets/          # Place logo images here
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── COAScanner.tsx
│   │   │   ├── InventoryDashboard.tsx
│   │   │   └── ProductOverview.tsx
│   │   ├── ui/          # shadcn/ui components (48 files)
│   │   ├── BlendCard.tsx
│   │   ├── CalculatorModal.tsx
│   │   ├── ConfidenceVisual.tsx
│   │   ├── EntryGate.tsx
│   │   ├── InputScreen.tsx
│   │   ├── MiniStackPreview.tsx
│   │   ├── OnboardingFlow.tsx
│   │   ├── OperatorDemo.tsx
│   │   ├── PresetStacks.tsx
│   │   ├── QRShareModal.tsx
│   │   ├── ResultsScreen.tsx
│   │   ├── RoleIndicator.tsx
│   │   ├── ShareArtifact.tsx
│   │   ├── StackVisualization.tsx
│   │   ├── StackedCard.tsx
│   │   └── VoiceFeedback.tsx
│   ├── lib/
│   │   └── colors.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🎨 Asset Requirements

### Logo Images Needed

Place these in `public/assets/`:

1. **Gold Hexagon Logo** - `logo.png` (used throughout app)
   - Recommended size: 512x512px
   - Format: PNG with transparency
   - Path: `/assets/logo.png`

Update import paths in files to use:
```typescript
import logo from '/assets/logo.png';
```

Search for `figma:asset` in all files and replace with `/assets/logo.png`

---

## 📦 Complete Package.json

```json
{
  "name": "cannabis-selector",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "motion": "^10.18.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.344.0",
    "qrcode": "^1.5.3",
    "sonner": "^2.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.11.19",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "@tailwindcss/vite": "^4.0.0-alpha.19",
    "tailwindcss": "^4.0.0-alpha.19",
    "typescript": "^5.2.2",
    "vite": "^5.1.0"
  }
}
```

---

## 🔑 Key Features Implemented

### Core Functionality
✅ Age gate with session-based verification  
✅ Onboarding flow for first-time users  
✅ Three input modes: Natural language, Photo, Strain lookup  
✅ Blend vs Stacked recommendation engine  
✅ Pre-roll weight calculator with precision controls  
✅ QR code sharing system  
✅ Voice feedback modal  
✅ Operator demo mode (auto-playing sales demo)  

### Admin Features
✅ Admin panel with inventory dashboard  
✅ COA (Certificate of Analysis) scanner  
✅ Product overview system  
✅ Demo mode toggle  

### IP Protection
✅ "Guided Outcomes™ powered by StrainMath™" branding throughout  
✅ "Outcome design powered by StrainMath™" on recommendation cards  
✅ Persistent demo badges  
✅ Attribution markers strategically placed  

### Design System
✅ Premium Swiss-inspired aesthetic  
✅ Gold hexagon logo integration  
✅ True black (#000000) backgrounds  
✅ High-chroma accent colors  
✅ Smooth Motion animations  
✅ NO vertical scrolling (mobile-only, fixed viewport)  
✅ Progressive disclosure patterns  

---

## 🎯 Design Philosophy

**"We calibrate the session, not the user"**

- No localStorage persistence
- Entry gate required every session
- Kiosk-safe implementation
- Respects user experience levels per session
- Mobile-only with HARD viewport constraints
- Single-screen experiences with modals/overlays

---

## 🚦 Running the App

### Development Mode

```bash
npm run dev
```

App runs at: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

---

## 📸 Viewing on Desktop

The app is mobile-only. When viewed on desktop (>768px width), it displays in a centered mobile frame with shadow effects for better preview.

---

## 🔧 Configuration Notes

### Tailwind v4 Configuration

Tailwind v4 uses CSS-based configuration. All design tokens are in `/src/styles/globals.css`:

- Color system defined with CSS custom properties
- Dark mode enabled via `.dark` class
- Typography base styles defined
- Mobile viewport constraints enforced

### Motion/React (Framer Motion)

The app uses `motion/react` (modern Framer Motion). Import syntax:

```typescript
import { motion, AnimatePresence } from 'motion/react';
```

Vite alias configured to map to `framer-motion` package.

---

## 📝 Important File Notes

### Protected Files (DO NOT MODIFY)

These would normally be protected, but for export you'll recreate them:

- `/components/figma/ImageWithFallback.tsx` - If this exists, use it for dynamic images

### Core Entry Point

- `/src/App.tsx` - Main application logic
- `/src/main.tsx` - React root mounting

### Admin Access

Admin mode accessible via:
1. Entry gate admin button (hidden by default)
2. Long-press on logo (if implemented)
3. Direct state toggle in development

---

## 🎨 Color System (lib/colors.ts)

```typescript
COLORS = {
  background: '#000000',          // True black
  foreground: '#ffffff',          // Pure white
  
  blend: {
    primary: '#00ffa3',          // Vivid emerald
    secondary: '#00d9ff',        // Bright cyan
  },
  
  stack: {
    primary: '#a855f7',          // Saturated purple
    secondary: '#ec4899',        // Bright pink
  },
  
  energy: '#ffd700',             // Pure gold
  success: '#00ff88',
  warning: '#ffaa00',
  error: '#ff3366',
}
```

---

## 📜 License & Attribution

**Guided Outcomes™** and **StrainMath™** are proprietary systems. 

All trademark and copyright notices must remain intact:
- Footer attributions
- Recommendation card attributions
- Demo badges
- Entry gate branding

---

## 🆘 Troubleshooting

### Issue: "Cannot find module 'motion/react'"

**Solution:** Check vite.config.ts has the alias:

```typescript
resolve: {
  alias: {
    'motion/react': 'framer-motion',
  },
}
```

### Issue: Images not loading

**Solution:** 
1. Replace all `figma:asset/...` imports with `/assets/logo.png`
2. Ensure logo file exists in `/public/assets/`

### Issue: Tailwind classes not working

**Solution:**
1. Verify `@tailwindcss/vite` plugin in vite.config.ts
2. Check `globals.css` is imported in main.tsx
3. Ensure Tailwind v4 alpha is installed

### Issue: QR codes not generating

**Solution:** Install @types/qrcode:

```bash
npm install -D @types/qrcode
```

---

## 📧 Next Steps After Setup

1. ✅ Install all dependencies
2. ✅ Add logo assets to `/public/assets/`
3. ✅ Replace `figma:asset` imports with `/assets/logo.png`
4. ✅ Run `npm run dev` and test
5. ✅ Customize recommendation engine logic in `App.tsx`
6. ✅ Connect to real backend (if needed)
7. ✅ Deploy to production

---

## 🌐 Deployment Recommendations

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Upload dist/ folder
```

### Custom Server
```bash
npm run build
# Serve dist/ folder with nginx/apache
```

---

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Motion (Framer Motion)](https://www.framer.com/motion/)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)

---

## ✨ You're All Set!

This export contains everything needed to recreate your premium cannabis experience recommendation app. Follow the setup steps above, copy the file contents from the sections below, and you'll have a fully functioning application.

**Build something amazing! 🚀**

---

---

# 📄 COMPLETE FILE CONTENTS

## Copy each file below into your project structure

---

## `/src/main.tsx`

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## `/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>Guided Outcomes</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

_[FILE CONTENTS WILL BE PROVIDED IN NEXT SECTION - This document is now a comprehensive setup guide. Would you like me to continue with all file contents, or would you prefer a different format?]_

---

**Total Files to Copy:** 60+  
**Estimated Setup Time:** 15-30 minutes  
**Difficulty Level:** Intermediate

