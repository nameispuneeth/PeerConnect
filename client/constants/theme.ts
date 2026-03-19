/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.

 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#2563eb'; // Blue-600
const tintColorDark = '#3b82f6'; // Blue-500

export const Colors = {
  light: {
    text: '#1e293b', // Slate-800
    background: '#ffffff',
    tint: tintColorLight,
    icon: '#475569', // Slate-600
    tabIconDefault: '#64748b', // Slate-500
    tabIconSelected: tintColorLight,
    card: '#f8fafc', // Slate-50
    border: '#e2e8f0', // Slate-200
    input: '#ffffff',
    placeholder: '#94a3b8', // Slate-400
  },
  dark: {
    text: '#f1f5f9', // Slate-100
    background: '#0f172a', // Slate-900
    tint: tintColorDark,
    icon: '#cbd5e1', // Slate-300
    tabIconDefault: '#64748b', // Slate-500
    tabIconSelected: tintColorDark,
    card: '#1e293b', // Slate-800
    border: '#334155', // Slate-700
    input: '#1e293b', // Slate-800
    placeholder: '#64748b', // Slate-500
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
