#!/usr/bin/env pwsh
# Expo Setup and Migration Script

$ErrorActionPreference = "Stop"
$mobileDir = "C:\Users\simmo\Desktop\Cannabis-Experience-Selector-Mobile"
$webDir = "C:\Users\simmo\Desktop\Cannabis Experience Selector"

Write-Host "=== Expo Project Setup ===" -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "`n[1/6] Installing dependencies..." -ForegroundColor Yellow
Set-Location $mobileDir
npm install nativewind tailwindcss@3.3.2 react-native-reanimated moti react-native-gesture-handler react-native-svg expo-av react-native-qrcode-svg lucide-react-native openai

# Step 2: Configure NativeWind
Write-Host "`n[2/6] Configuring NativeWind..." -ForegroundColor Yellow

# Create tailwind.config.js
@"
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
"@ | Out-File -FilePath "$mobileDir\tailwind.config.js" -Encoding UTF8

# Create babel.config.js
@"
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};
"@ | Out-File -FilePath "$mobileDir\babel.config.js" -Encoding UTF8

# Step 3: Copy business logic folders
Write-Host "`n[3/6] Copying business logic (lib, types, data, services)..." -ForegroundColor Yellow

$foldersToCopy = @("lib", "types", "data", "services")
foreach ($folder in $foldersToCopy) {
    $source = Join-Path $webDir "src\$folder"
    $dest = Join-Path $mobileDir $folder
    
    if (Test-Path $source) {
        Write-Host "  Copying $folder..." -ForegroundColor Gray
        Copy-Item -Path $source -Destination $dest -Recurse -Force
    }
}

# Step 4: Create constants folder
Write-Host "`n[4/6] Creating constants..." -ForegroundColor Yellow
$constantsDir = Join-Path $mobileDir "constants"
if (-not (Test-Path $constantsDir)) {
    New-Item -ItemType Directory -Path $constantsDir -Force | Out-Null
}

# Create Colors.ts
@"
export const Colors = {
  primary: '#00FFD1',
  accent: '#C9A24D',
  background: '#000000',
  surface: 'rgba(255, 255, 255, 0.05)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
};
"@ | Out-File -FilePath "$constantsDir\Colors.ts" -Encoding UTF8

# Step 5: Update package.json scripts
Write-Host "`n[5/6] Updating package.json..." -ForegroundColor Yellow
$packageJson = Get-Content "$mobileDir\package.json" | ConvertFrom-Json
$packageJson.scripts.start = "expo start"
$packageJson.scripts.android = "expo start --android"
$packageJson.scripts.ios = "expo start --ios"
$packageJson.scripts.web = "expo start --web"
$packageJson | ConvertTo-Json -Depth 10 | Out-File "$mobileDir\package.json" -Encoding UTF8

# Step 6: Create README
Write-Host "`n[6/6] Creating README..." -ForegroundColor Yellow
@"
# Cannabis Experience Selector - Mobile

Expo/React Native version of the Cannabis Experience Selector.

## Setup

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Start the development server:
   \`\`\`bash
   npm start
   \`\`\`

3. Run on your device:
   - iOS: Press \`i\` or scan QR code with Camera app
   - Android: Press \`a\` or scan QR code with Expo Go app
   - Web: Press \`w\`

## Project Structure

- \`app/\` - Expo Router screens
- \`components/\` - React Native components
- \`lib/\` - Business logic (copied from web app)
- \`types/\` - TypeScript definitions
- \`data/\` - Presets and inventory
- \`constants/\` - Theme and configuration

## Migration Status

- [x] Project setup
- [x] Business logic copied
- [ ] UI components conversion
- [ ] Testing
"@ | Out-File -FilePath "$mobileDir\README.md" -Encoding UTF8

Write-Host "`n=== Setup Complete! ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. cd C:\Users\simmo\Desktop\Cannabis-Experience-Selector-Mobile"
Write-Host "2. npm start"
Write-Host "3. Press 'w' for web preview or scan QR code for mobile"
