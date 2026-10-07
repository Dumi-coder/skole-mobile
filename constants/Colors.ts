import { appTheme } from './theme';

export default {
  light: {
    text: appTheme.light.foreground,
    background: appTheme.light.background,
    tint: appTheme.light.primary,
    tabIconDefault: appTheme.light.tabIconDefault,
    tabIconSelected: appTheme.light.tabIconSelected,
    card: appTheme.light.card,
    border: appTheme.light.border,
    muted: appTheme.light.muted,
    mutedText: appTheme.light.mutedForeground,
    success: appTheme.light.success,
    warning: appTheme.light.warning,
    danger: appTheme.light.danger,
  },
  dark: {
    text: appTheme.dark.foreground,
    background: appTheme.dark.background,
    tint: appTheme.dark.primary,
    tabIconDefault: appTheme.dark.tabIconDefault,
    tabIconSelected: appTheme.dark.tabIconSelected,
    card: appTheme.dark.card,
    border: appTheme.dark.border,
    muted: appTheme.dark.muted,
    mutedText: appTheme.dark.mutedForeground,
    success: appTheme.dark.success,
    warning: appTheme.dark.warning,
    danger: appTheme.dark.danger,
  },
};
