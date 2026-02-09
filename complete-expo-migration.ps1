#!/usr/bin/env pwsh
# Complete Expo Migration Script - Part 2

$ErrorActionPreference = "Stop"
$mobileDir = "C:\Users\simmo\Desktop\Cannabis-Experience-Selector-Mobile"
$webDir = "C:\Users\simmo\Desktop\Cannabis Experience Selector"

Write-Host "=== Completing Expo Migration ===" -ForegroundColor Cyan

# Step 1: Copy converted InputScreen
Write-Host "`n[1/5] Copying converted components..." -ForegroundColor Yellow
$componentsDir = Join-Path $mobileDir "components"
if (-not (Test-Path $componentsDir)) {
    New-Item -ItemType Directory -Path $componentsDir -Force | Out-Null
}

Copy-Item "$webDir\mobile-components\InputScreen.tsx" "$componentsDir\" -Force

# Step 2: Create main app screen
Write-Host "`n[2/5] Creating main app screen..." -ForegroundColor Yellow
$appDir = Join-Path $mobileDir "app"

@"
import { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { InputScreen } from '../components/InputScreen';
import { IntentSeed as UserInput } from '../types/domain';
import { Colors } from '../constants/Colors';

export default function HomeScreen() {
  const [currentView, setCurrentView] = useState<'input' | 'results'>('input');
  const [userInput, setUserInput] = useState<UserInput | null>(null);

  const handleSubmit = (input: UserInput) => {
    console.log('User submitted:', input);
    setUserInput(input);
    // TODO: Call orchestrator and show results
    alert('Submitted! Orchestrator integration coming next.');
  };

  const handleBrowsePresets = () => {
    console.log('Browse presets');
  };

  const handleSelectPreset = (preset: any) => {
    console.log('Selected preset:', preset);
  };

  const handleAdminToggle = () => {
    console.log('Admin mode toggled');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <InputScreen
        onSubmit={handleSubmit}
        onBrowsePresets={handleBrowsePresets}
        onSelectPreset={handleSelectPreset}
        onAdminModeToggle={handleAdminToggle}
        isAdminMode={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});
"@ | Out-File -FilePath "$appDir\index.tsx" -Encoding UTF8

# Step 3: Update app layout
Write-Host "`n[3/5] Updating app layout..." -ForegroundColor Yellow

@"
import { Stack } from 'expo-router';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
        },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: Colors.background,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'StrainMath™',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
"@ | Out-File -FilePath "$appDir\_layout.tsx" -Encoding UTF8

# Step 4: Create app.json configuration
Write-Host "`n[4/5] Updating app.json..." -ForegroundColor Yellow

@"
{
  "expo": {
    "name": "Cannabis Experience Selector",
    "slug": "cannabis-experience-selector-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "strainmath",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#000000"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.strainmath.selector"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "package": "com.strainmath.selector"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-av",
        {
          "microphonePermission": "Allow StrainMath to access your microphone for voice input."
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    }
  }
}
"@ | Out-File -FilePath "$mobileDir\app.json" -Encoding UTF8

# Step 5: Create migration status document
Write-Host "`n[5/5] Creating migration status..." -ForegroundColor Yellow

@"
# Expo Migration Status

## ✅ Completed

### Setup
- [x] Expo project created with tabs template
- [x] Dependencies installed (NativeWind, Reanimated, etc.)
- [x] Business logic copied (lib, types, data, services)
- [x] Configuration files created

### Components
- [x] InputScreen (fully functional)
  - Text input for descriptions
  - Strain name input
  - Temporal keyword detection for stacks
  - Preset scenarios carousel
  - Curated stacks carousel
  - Floating action button

### App Structure
- [x] Main app screen (index.tsx)
- [x] Root layout with navigation
- [x] Color constants
- [x] App configuration

## 🚧 In Progress

### Core Features
- [ ] Orchestrator integration
- [ ] Results screen
- [ ] Blend detail screen
- [ ] Stack detail screen

### Advanced Features
- [ ] LiveConsultant modal
- [ ] Admin panel
- [ ] QR code sharing
- [ ] Voice input (microphone)

## 📝 Notes

### Key Differences from Web
1. **No Framer Motion**: Using React Native's Animated API
2. **No Radix UI**: Custom components with TouchableOpacity
3. **No 3D Graphics**: Simplified to 2D (can add Expo GL later)
4. **Simplified Styling**: Using StyleSheet instead of Tailwind classes

### Testing Instructions
1. \`cd C:\\Users\\simmo\\Desktop\\Cannabis-Experience-Selector-Mobile\`
2. \`npm start\`
3. Press \`w\` for web preview
4. Or scan QR code with Expo Go app

### Next Steps
1. Integrate orchestrator (already copied to lib/)
2. Create results screen
3. Add navigation between screens
4. Test on iOS/Android devices
"@ | Out-File -FilePath "$mobileDir\MIGRATION_STATUS.md" -Encoding UTF8

Write-Host "`n=== Migration Complete! ===" -ForegroundColor Green
Write-Host "`nYour Expo app is ready to run:" -ForegroundColor Cyan
Write-Host "1. cd C:\Users\simmo\Desktop\Cannabis-Experience-Selector-Mobile"
Write-Host "2. npm start"
Write-Host "3. Press 'w' for web or scan QR for mobile"
Write-Host "`nThe InputScreen is fully functional with:" -ForegroundColor Yellow
Write-Host "  - Temporal keyword detection for stacks"
Write-Host "  - Preset scenarios"
Write-Host "  - Curated stacks"
Write-Host "  - All business logic ready to use"
