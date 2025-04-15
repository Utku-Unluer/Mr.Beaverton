import { DefaultTheme } from 'react-native-paper';
import { Platform } from 'react-native';

// Define the app's theme colors based on original Wordpecker web app
const colors = {
  primary: '#4CAF50', // Green
  primaryDark: '#388E3C',
  primaryLight: '#A5D6A7',
  secondary: '#FFC107', // Amber
  secondaryDark: '#FFA000',
  secondaryLight: '#FFECB3',
  accent: '#2196F3', // Blue
  accentDark: '#1976D2',
  accentLight: '#BBDEFB',
  background: '#0F172A', // slate.900 - Dark blue background
  surface: '#1E293B', // slate.800
  error: '#EF4444', // Red
  text: '#FFFFFF', // White text
  textSecondary: '#94A3B8', // slate.400 - Secondary text
  disabled: '#475569', // slate.600
  placeholder: '#64748B', // slate.500
  backdrop: 'rgba(0, 0, 0, 0.5)',
  notification: '#FF9800',
  card: '#1E293B', // slate.800
  border: '#334155', // slate.700
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
};

// Create the theme object with dark mode
const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    text: colors.text,
    disabled: colors.disabled,
    placeholder: colors.placeholder,
    backdrop: colors.backdrop,
    notification: colors.notification,
    card: colors.card,
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

// Platform-specific shadow styles
const shadowStyles = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 3,
  },
  web: {
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
  },
});

// Export common style objects for reuse across components
export const commonStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    ...shadowStyles,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    color: colors.text,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 8,
    color: colors.text,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 24,
    color: colors.textSecondary,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  input: {
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  divider: {
    marginVertical: 16,
    backgroundColor: colors.border,
  },
  successBadge: {
    backgroundColor: colors.success,
    color: colors.text,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  }
};

export default theme;
