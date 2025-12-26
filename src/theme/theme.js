export const theme = {
    colors: {
        primary: '#1A237E', // Deep Blue
        secondary: '#E65100', // Orange Accent
        background: '#F5F5F5',
        surface: '#FFFFFF',
        text: '#212121',
        textSecondary: '#757575',
        error: '#B00020',
        success: '#4CAF50',
        warning: '#FFC107',
        border: '#E0E0E0',
    },
    typography: {
        h1: { fontSize: 32, fontWeight: '700', letterSpacing: 0.5 },
        h2: { fontSize: 24, fontWeight: '700', letterSpacing: 0.25 },
        h3: { fontSize: 20, fontWeight: '600', letterSpacing: 0.15 },
        body1: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
        body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
        caption: { fontSize: 12, fontWeight: '400', letterSpacing: 0.4 },
        button: { fontSize: 16, fontWeight: '600', letterSpacing: 1.25, textTransform: 'uppercase' },
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        s: 4,
        m: 8,
        l: 16,
        xl: 24,
    },
    shadows: {
        low: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        high: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};
