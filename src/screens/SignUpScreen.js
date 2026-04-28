import { useNavigation } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

const { height, width } = Dimensions.get('window');

// ─── Design Tokens - Matching Login Screen ─────────────────────────────────────────
const C = {
  primary: '#1847B1', // Deep navy blue - Sign Up button background
  primaryStandard: '#2260D9', // Standard primary blue - focused input borders, links, icons
  primaryLight: '#E8EFFD', // Light blue tint - role buttons, logo ring
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

// ─── Animated Input Component ─────────────────────────────────────────────────────
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

// ─── Screen ───────────────────────────────────────────────────────────────────────
export default function SignupScreen() {
  const navigation = useNavigation();
  const { signup, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'owner'

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
    if (!fullName || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone validation (basic)
    if (phone.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    // Password validation
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      const signupData = {
        name: fullName,
        email,
        phone,
        password,
        role,
        company: role === 'owner' ? `${fullName}'s Logistics` : undefined,
      };

      await signup(signupData);
      // Navigation handled by App.js
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        error.message || 'An error occurred during signup',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
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
            <Text style={styles.appTagline}>Join the moving community</Text>
          </Animated.View>

          {/* ── Form card ── */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.cardTitle}>Create your account</Text>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <View style={styles.roleRow}>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === 'user' && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole('user')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="person-outline"
                    size={16}
                    color={role === 'user' ? C.primaryStandard : C.textMuted}
                    style={styles.roleIcon}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === 'user' && styles.roleTextActive,
                    ]}
                  >
                    Customer
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.roleBtn,
                    role === 'owner' && styles.roleBtnActive,
                  ]}
                  onPress={() => setRole('owner')}
                  activeOpacity={0.7}
                >
                  <Icon
                    name="business-outline"
                    size={16}
                    color={role === 'owner' ? C.primaryStandard : C.textMuted}
                    style={styles.roleIcon}
                  />
                  <Text
                    style={[
                      styles.roleText,
                      role === 'owner' && styles.roleTextActive,
                    ]}
                  >
                    Truck Owner
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <FloatInput
              icon="person-outline"
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            <FloatInput
              icon="mail-outline"
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <FloatInput
              icon="call-outline"
              placeholder="Phone Number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
            <FloatInput
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.signupBtn, isLoading && { opacity: 0.75 }]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color={C.white} />
              ) : (
                <View style={styles.signupBtnInner}>
                  <Text style={styles.signupBtnText}>Sign Up</Text>
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
              <Text style={styles.dividerLabel}>Already have an account?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.loginBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.loginBtnText}>Sign In Instead</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Footer ── */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },

  keyboardView: {
    flex: 1,
  },

  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },

  logoBlock: {
    alignItems: 'center',
    marginVertical: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: C.primaryLight,
  },
  logo: {
    width: 50,
    height: 50,
  },
  appName: {
    fontSize: 20,
    fontWeight: '800',
    color: C.textHead,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  appTagline: {
    fontSize: 12,
    color: C.textMuted,
  },

  card: {
    width: '100%',
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: C.divider,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textHead,
    marginBottom: 16,
  },

  roleContainer: {
    marginBottom: 16,
  },
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textBody,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    backgroundColor: C.white,
    gap: 6,
  },
  roleBtnActive: {
    borderColor: C.primaryStandard,
    backgroundColor: C.primaryLight,
  },
  roleIcon: {
    marginRight: 2,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textMuted,
  },
  roleTextActive: {
    color: C.primaryStandard,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    color: C.textBody,
  },

  signupBtn: {
    height: 48,
    backgroundColor: C.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signupBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  signupBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.divider,
  },
  dividerLabel: {
    fontSize: 11,
    color: C.textMuted,
    fontWeight: '500',
  },

  loginBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.primaryStandard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.primaryStandard,
  },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  shieldBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  footerText: {
    fontSize: 10,
    color: C.textMuted,
  },
});
