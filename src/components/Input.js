import React, { useState } from 'react';
import { View, TextInput as RNTextInput, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  keyboardType = 'default',
  multiline = false,
  icon,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[
          styles.label, 
          { color: error ? theme.colors.error : (isFocused ? theme.colors.primary : theme.colors.textSecondary) }
        ]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        {
          backgroundColor: isFocused ? theme.colors.surface : theme.colors.surfaceVariant,
          ...(isFocused ? theme.shadows.low : {})
        }
      ]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        
        <RNTextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </View>
      
      {/* Error Message Space to prevent layout jump */}
      <Text style={[
        styles.errorText, 
        { minHeight: error ? 16 : 0, marginTop: error ? theme.spacing.xs : 0 }
      ]}>
        {error || ' '} 
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.xs, // Reduced gap between inputs
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: theme.spacing.m,
    minHeight: 48,
  },
  iconContainer: {
    marginRight: theme.spacing.s,
  },
  input: {
    flex: 1,
    ...theme.typography.body1,
    color: theme.colors.text,
    paddingVertical: theme.spacing.s,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
  },
});

export default Input;
