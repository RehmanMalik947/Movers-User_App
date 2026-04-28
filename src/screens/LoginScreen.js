import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';
import apiService from '../api/apiService';

// ─── Design Tokens - Custom Blue Color Palette ─────────────────────────────────────────
const C = {
  primary: '#1847B1', // Deep navy blue - Sign In button background and main brand color
  primaryStandard: '#2260D9', // Standard primary blue - focused input borders, forgot password text, icon colors, create account button text
  primaryLight: '#E8EFFD', // Light blue tint - brand pill background, logo rings, shield badge background
  bg: '#F8FAFC', // Cool Gray Background
  surface: '#FFFFFF', // White
  surfaceAlt: '#F8FAFC', // Light background
  textHead: '#0F172A', // Dark text
  textBody: '#334155', // Body text
  textMuted: '#64748B', // Muted text
  textLink: '#2260D9', // Standard blue for links
  border: '#E2E8F0', // Border color
  borderFocus: '#2260D9', // Focus border - Standard blue
  divider: '#E2E8F0', // Divider color
  white: '#FFFFFF',
  success: '#10B981',
  error: '#EF4444',
};

// ─── Animated Input ─────────────────────────────────────────────────────────
function FloatInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
}) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(anim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.border, C.borderFocus],
  });
  const bgColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.surfaceAlt, C.white],
  });

  return (
    <Animated.View
      style={[styles.inputRow, { borderColor, backgroundColor: bgColor }]}
    >
      <Icon
        name={icon}
        size={18}
        color={focused ? C.primaryStandard : C.textMuted}
        style={styles.inputIcon}
      />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={C.textMuted}
        style={styles.inputText}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        autoCapitalize="none"
        keyboardType={keyboardType || 'default'}
        secureTextEntry={secureTextEntry || false}
      />
    </Animated.View>
  );
}

// ─── Screen ─────────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuth();
  const navigation = useNavigation();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid credentials. Please try again.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Top banner with light blue tint background ── */}

          {/* ── Logo block ── */}
          <Animated.View
            style={[
              styles.logoBlock,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/heavyTruck.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>Movers</Text>
            <Text style={styles.appTagline}>Find Movers, anytime.</Text>
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.cardTitle}>Sign in to your account</Text>

            <FloatInput
              icon="mail-outline"
              placeholder="Email / Phone (Driver)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <FloatInput
              icon="lock-closed-outline"
              placeholder="Password / CNIC (Driver)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginBtn, isLoading && { opacity: 0.75 }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <View style={styles.loginBtnInner}>
                  <Text style={styles.loginBtnText}>Sign In</Text>
                  <Icon
                    name="arrow-forward-outline"
                    size={17}
                    color={C.white}
                  />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>New here?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.signupBtn}
              onPress={() => navigation.navigate('Signup')}
              activeOpacity={0.8}
            >
              <Text style={styles.signupBtnText}>Create an Account</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Footer with light blue tint badge ── */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={styles.shieldBadge}>
              <Icon
                name="shield-checkmark-outline"
                size={13}
                color={C.primaryStandard}
              />
            </View>
            <Text style={styles.footerText}>
              Secured with end-to-end encryption
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingBottom: 36,
    alignItems: 'center',
  },

  logoBlock: {
    alignItems: 'center',
    top: 35,
    marginBottom: 36,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 14,
    borderWidth: 2,
    borderColor: C.primaryLight, // Light blue tint for logo ring (#E8EFFD)
  },
  logo: {
    width: 54,
    height: 54,
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textHead,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 13,
    color: C.textMuted,
  },

  card: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: C.divider,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textHead,
    marginBottom: 20,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    color: C.textBody,
  },

  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 22,
    paddingVertical: 2,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primaryStandard, // Standard blue (#2260D9)
  },

  loginBtn: {
    height: 52,
    backgroundColor: C.primary, // Deep navy blue (#1847B1)
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  loginBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.divider,
  },
  dividerLabel: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
  },

  signupBtn: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primaryStandard, // Standard blue (#2260D9)
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primaryStandard, // Standard blue (#2260D9)
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.primaryLight, // Light blue tint for shield badge background (#E8EFFD)
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  footerText: {
    fontSize: 11,
    color: C.textMuted,
  },
});
