import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '../theme/theme';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'text'
  size = 'medium',     // 'small' | 'medium' | 'large'
  disabled = false, 
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  
  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceVariant;
    switch (variant) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'outline': return 'transparent';
      case 'text': return 'transparent';
      default: return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textTertiary;
    switch (variant) {
      case 'primary': return theme.colors.surface;
      case 'secondary': return theme.colors.surface;
      case 'outline': return theme.colors.primary;
      case 'text': return theme.colors.primary;
      default: return theme.colors.surface;
    }
  };

  const getBorder = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1.5,
        borderColor: disabled ? theme.colors.border : theme.colors.primary,
      };
    }
    return {};
  };

  const getSizePadding = () => {
    switch (size) {
      case 'small': return { paddingVertical: theme.spacing.xs, paddingHorizontal: theme.spacing.m };
      case 'large': return { paddingVertical: theme.spacing.m, paddingHorizontal: theme.spacing.xl };
      case 'medium':
      default: return { paddingVertical: theme.spacing.s, paddingHorizontal: theme.spacing.l };
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getBorder(),
        getSizePadding(),
        variant === 'primary' && !disabled ? theme.shadows.medium : {},
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && icon}
          <Text style={[
            styles.text, 
            { color: getTextColor() },
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.round, // Pill shape for modern buttons
    minWidth: 120,
  },
  text: {
    ...theme.typography.button,
    textAlign: 'center',
  },
});

export default Button;
