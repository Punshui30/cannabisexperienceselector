# GO Calculator - Cannabis Experience Recommendation App

A premium Swiss-inspired cannabis blend recommendation application built with React, TypeScript, and Tailwind CSS.

## Architecture

This application follows a strict 3-layer architecture as defined in the canonical execution specification:

### Layer 1: Intent Interpretation (Non-Authoritative)
- Location: `/lib/engineAdapter.ts` - `interpretIntent()` function
- Converts natural language user input into structured Intent objects
- Detects keywords for energy, focus, mood, anxiety sensitivity, time of day, etc.
- **Has NO authority** over scoring, ranking, or recommendations

### Layer 2: Outcome Resolution Engine (Authoritative, Deterministic)
- Location: `/lib/calculationEngine.ts` - `calculateBlends()` function
- Pure mathematical blend calculator with ZERO AI or randomness
- Evaluates all possible 2 and 3-cultivar combinations
- Applies terpene influence models, cannabinoid modifiers, and constraint enforcement
- Returns exactly **3 recommendations** (top-ranked blends)
- **Absolute authority** over all mathematical calculations and rankings

### Layer 3: UI & Presentation Layer
- Location: `/App.tsx`, `/components/*`
- Premium glassmorphism design with animated background orbs
- Mobile-first responsive layout
- Explains results and handles user interactions
- **Cannot** mutate Layer 2 outputs

## Key Features

### Premium Visual Design
- **Glassmorphism panels**: `backdrop-filter: blur(20px)` with rgba borders
- **Animated background orbs**: 100px blur with opacity 0.25-0.4
- **Shimmer effects**: Gradient overlays on buttons
- **Swiss-inspired typography**: Clean Inter font with precise spacing
- **Color tokens**: Emerald (#00ffa3), Purple (#9333ea), Gold (#ffaa00)

### Mobile-First Responsive
- Default sizing for 375-390px viewports (iPhone)
- Responsive breakpoints using Tailwind `md:` prefix (768px+)
- Swipe gestures for card navigation on mobile
- Touch-optimized interactions

### Data Layer
- **Strain Library**: 60 real cultivars with vibe tags (`/lib/strainLibrary.ts`)
- **Calculation Engine**: Deterministic terpene/cannabinoid modeling (`/lib/calculationEngine.ts`)
- **Mock Inventory**: 10 cultivars with synthetic COA data (`/lib/mockInventory.ts`)
- **Adapter Layer**: Translates between UI and engine (`/lib/engineAdapter.ts`)

## File Structure

```
/
├── App.tsx                          # Main app orchestrator
├── lib/
│   ├── calculationEngine.ts         # Layer 2: Deterministic blend calculator
│   ├── strainLibrary.ts             # 60 canonical strains
│   ├── mockInventory.ts             # Demo COA data
│   ├── engineAdapter.ts             # Layer 1 + Layer 2 integration
│   └── colors.ts                    # Color token system
├── components/
│   ├── SplashScreen.tsx             # Entry animation with orbs
│   ├── EntryGate.tsx                # Age verification + role selection
│   ├── InputScreen.tsx              # User input interface
│   ├── ResultsScreen.tsx            # Recommendation carousel
│   ├── BlendCard.tsx                # Blend recommendation display
│   ├── CalculatorModal.tsx          # Dosage calculator
│   ├── QRShareModal.tsx             # QR code sharing
│   └── admin/
│       ├── AdminPanel.tsx           # Admin dashboard
│       ├── InventoryDashboard.tsx   # COA management
│       └── COAScanner.tsx           # Lab result ingestion
└── styles/
    └── globals.css                  # Tailwind v4 + custom tokens
```

## How It Works

1. **User enters description**: "I want energy and focus for work without anxiety"
2. **Layer 1 interprets** → `{ targetEffects: { energy: 0.7, focus: 0.8, ... }, constraints: { maxAnxiety: 0.2 } }`
3. **Layer 2 calculates** → Evaluates 1000s of blend candidates, applies terpene models, ranks by distance to target
4. **Layer 2 returns** → Top 3 blends with scores, ratios, predicted effects, confidence
5. **UI displays** → Premium glassmorphism cards with cultivar breakdowns, match scores, reasoning

## Implementation Notes

### Why 3 Recommendations (Not 5)?
The calculation engine is configured to return exactly 3 blends:
```typescript
// /lib/calculationEngine.ts line 400+
const sorted = sortCandidates(candidates);
const top3 = sorted.slice(0, 3);  // ← Exactly 3
```

This is intentional to avoid choice paralysis and maintain focus on top-quality matches.

### Premium Aesthetic Implementation

**Background Orbs (Correct Implementation)**:
```tsx
<motion.div
  style={{
    backgroundColor: COLORS.blend.primary,
    filter: 'blur(100px)',  // NOT Tailwind class
    width: '500px',
    height: '500px',
    // Mobile: 250-300px, Desktop: 400-500px
  }}
  animate={{ opacity: 0.25 }}  // NOT 0.05 (too subtle)
/>
```

**Glassmorphism (Correct Implementation)**:
```tsx
<div
  style={{
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
  }}
/>
```

### Mobile-First Responsive Pattern
```tsx
// Mobile-first: base styles for small screens, scale up
<div className="px-4 py-3 md:px-6 md:py-4">
<h1 className="text-2xl md:text-4xl">
<div className="w-[300px] md:w-[500px]">
```

## Deployment

This app can be deployed to:
- **Vercel** (recommended for Next.js-style apps)
- **Netlify**
- **GitHub Pages**
- Any static hosting service

To export code:
1. Download all files from this Figma Make environment
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. Run `npm run build` to create production build

## Extending the System

### Adding New Strains
Edit `/lib/strainLibrary.ts` - append only, never modify existing entries:
```typescript
{
  id: "strain_061",
  name: "New Strain",
  cultivarType: "hybrid",
  vibeTags: ["tag1", "tag2", "tag3"]
}
```

### Adding COA Data to Inventory
Edit `/lib/mockInventory.ts`:
```typescript
{
  id: "strain_061",  // Must match strainLibrary ID
  name: "New Strain",
  thcPercent: 18.5,
  cbdPercent: 0.3,
  available: true,
  terpenes: {
    myrcene: 1.2,
    limonene: 0.8,
    caryophyllene: 0.5,
  },
}
```

### Modifying Terpene Influence Model
Edit `/lib/calculationEngine.ts` → `TERPENE_INFLUENCES` object.
⚠️ **Warning**: Changes affect all calculations. Document modifications and version the model.

## License & Usage

This is a demonstration application for cannabis experience recommendation.
NOT intended for collection of PII or securing sensitive medical data.
Use appropriate backend authentication and encryption for production deployment.

## Technical Stack

- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Motion/React** (Framer Motion) for animations
- **Vite** for build tooling
- Pure deterministic calculations (no AI, no randomness)

---

Built with Figma Make
