export const theme = {
  colors: {
    // Ultra-premium Dark Mode aesthetic
    primary: '#3B82F6', // Glowing Neon Blue
    primaryLight: '#60A5FA',
    
    // Secondary
    secondary: '#F97316', // Neon Orange
    secondaryLight: '#FB923C',
    
    // Backgrounds
    background: '#09090B', // Pitch black
    surface: 'rgba(20, 20, 25, 0.75)', // Glassmorphism translucent black
    surfaceVariant: 'rgba(255, 255, 255, 0.1)', // Very soft translucent grey for inputs
    
    // Text colors
    text: '#FFFFFF', // Pure white
    textSecondary: '#A1A1AA', // Elegant muted grey
    textTertiary: '#71717A',
    
    // Semantic
    error: '#E11D48',
    success: '#10B981',
    
    // Structural
    border: 'rgba(255, 255, 255, 0.15)',
    divider: 'rgba(255, 255, 255, 0.1)',
  },
  typography: {
    // Large, bold, tightly tracked headings
    h1: { fontSize: 36, fontWeight: '900', letterSpacing: -1, lineHeight: 42 },
    h2: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, lineHeight: 34 },
    h3: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3, lineHeight: 28 },
    subtitle1: { fontSize: 16, fontWeight: '600', letterSpacing: -0.1, lineHeight: 24 },
    subtitle2: { fontSize: 14, fontWeight: '600', letterSpacing: 0, lineHeight: 22 },
    body1: { fontSize: 15, fontWeight: '400', letterSpacing: 0, lineHeight: 22 },
    body2: { fontSize: 14, fontWeight: '400', letterSpacing: 0, lineHeight: 20 },
    caption: { fontSize: 13, fontWeight: '500', letterSpacing: 0.1, lineHeight: 18 },
    button: { fontSize: 16, fontWeight: '700', letterSpacing: 0.2, textTransform: 'none' },
  },
  spacing: {
    xxs: 4,
    xs: 8,
    s: 12,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 40,
    xxxl: 56,
  },
  borderRadius: {
    s: 10,
    m: 16, // Softer, modern inputs
    l: 24,
    xl: 32,
    round: 9999, // Pill-shaped buttons
  },
  shadows: {
    // Ultra-soft, premium Apple-like shadows
    low: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 5,
    },
    high: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      elevation: 10,
    },
  },
  animation: {
    quick: 150,
    standard: 250,
    slow: 400,
  }
};
