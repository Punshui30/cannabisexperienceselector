/**
 * High-Contrast, High-Chroma Color System
 * 
 * Rules:
 * - True black backgrounds (#000000)
 * - Vivid, saturated accent colors with semantic meaning
 * - No muting, no pastels, no gray mixing
 * - If forced to choose between subtlety and clarity, always choose clarity
 */

export const COLORS = {
  // Background - True Black
  background: '#000000',
  
  // Foreground - Pure White
  foreground: '#ffffff',
  
  // Semantic Accent Colors - High Chroma
  blend: {
    primary: '#00ffa3',    // Vivid emerald - for blend experiences
    secondary: '#00d9ff',  // Bright cyan - for flow states
    gradient: 'linear-gradient(135deg, #00ffa3, #00d9ff)',
  },
  
  stack: {
    primary: '#a855f7',    // Saturated purple - for stacked experiences
    secondary: '#ec4899',  // Bright pink - for layered depth
    gradient: 'linear-gradient(135deg, #a855f7, #ec4899)',
  },
  
  // Energy & Quality
  energy: '#ffd700',       // Pure gold - for precision/quality indicators
  
  // Status & Feedback
  success: '#00ff88',      // Bright green
  warning: '#ffaa00',      // Vivid orange
  error: '#ff3366',        // Bright red
  
  // Neutral (for containers & secondary UI)
  neutral: {
    border: 'rgba(255, 255, 255, 0.1)',
    surface: 'rgba(255, 255, 255, 0.05)',
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.4)',
    }
  },
} as const;

// Layer colors for stacks (single-hue gradients)
export const LAYER_COLORS = {
  layer1: {
    solid: '#a855f7',
    gradient: 'linear-gradient(180deg, #a855f7, #9333ea)',
  },
  layer2: {
    solid: '#d946ef',
    gradient: 'linear-gradient(180deg, #d946ef, #c026d3)',
  },
  layer3: {
    solid: '#ec4899',
    gradient: 'linear-gradient(180deg, #ec4899, #db2777)',
  },
} as const;

// Role-based color encoding - cohesive palette that communicates hierarchy
export const ROLE_COLORS = {
  foundation: '#7c3aed',   // Deep violet - heavier, grounding tone
  balance: '#a855f7',      // Mid-purple - moderating, transitional
  accent: '#d946ef',       // Bright magenta - highlight, finishing character
} as const;