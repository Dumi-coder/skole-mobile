export const webTheme = {
  colors: {
    background: '#ffffff',
    foreground: '#0f1419',
    card: '#ffffff',
    muted: '#f7f9f9',
    mutedForeground: '#536471',
    border: '#cfd9de',
    primary: '#0f1419',
    primaryForeground: '#ffffff',
    accent: '#f7f9f9',
    accentForeground: '#0f1419',
    success: '#59d44e',
    warning: '#f79009',
    danger: '#f04438',
    input: '#eff3f4',
    ring: '#0f1419',
    shadow: 'rgba(15, 20, 25, 0.08)',
    tabIconDefault: '#9aa4ae',
    tabIconSelected: '#0f1419',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radii: {
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
    pill: 999,
  },
  typography: {
    title: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700' as const,
    },
    heading: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700' as const,
    },
    body: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '400' as const,
    },
    label: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600' as const,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '500' as const,
    },
  },
};

export const appTheme = {
  light: {
    ...webTheme.colors,
    text: webTheme.colors.foreground,
    background: webTheme.colors.background,
    tint: webTheme.colors.primary,
  },
  dark: {
    ...webTheme.colors,
    text: '#e7e9ea',
    background: '#000000',
    card: '#12151a',
    foreground: '#e7e9ea',
    muted: '#16181c',
    mutedForeground: '#71767b',
    border: '#2f3336',
    primary: '#e7e9ea',
    primaryForeground: '#000000',
    accent: '#16181c',
    accentForeground: '#e7e9ea',
    input: '#16181c',
    ring: '#e7e9ea',
    tint: '#e7e9ea',
  },
};

export default appTheme;
