import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function SignupScreen() {
  const navigation = useNavigation();
  const { signup, isLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'owner'

  const handleSubmit = async () => {
    if (!fullName || !email || !phone || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await signup(fullName, email, phone, password, role);
      // Navigation handled by App.js
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>

            {/* Logo */}
            <Image
              source={require('../assets/heavyTruck.png')}
              style={styles.logo}
            />

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started</Text>

            <View style={styles.card}>

              {/* Role Selection */}
              <View style={styles.roleContainer}>
                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleRow}>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]}
                    onPress={() => setRole('user')}
                  >
                    <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>Customer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleBtn, role === 'owner' && styles.roleBtnActive]}
                    onPress={() => setRole('owner')}
                  >
                    <Text style={[styles.roleText, role === 'owner' && styles.roleTextActive]}>Truck Owner</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Icon name="person-outline" size={20} color="#DAAE58" />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color="#DAAE58" />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>


              {/* Phone */}
              <View style={styles.inputContainer}>
                <Icon name="call-outline" size={20} color="#DAAE58" />
                <TextInput
                  placeholder="Phone Number"
                  placeholderTextColor="#888"
                  keyboardType="phone-pad"
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Icon name="lock-closed-outline" size={20} color="#DAAE58" />
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                style={styles.signupBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.signupText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginRow}>
                <Text style={styles.loginGrey}>Already have an account?</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.loginLink}> Login</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },

  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20,
  },

  card: {
    width: '100%',
    backgroundColor: '#F5F8FF',
    borderRadius: 20,
    padding: 20,
    paddingVertical: 20,
    elevation: 4,
  },

  roleContainer: {
    marginBottom: 15,
  },
  roleLabel: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    fontWeight: '600'
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  roleBtnActive: {
    borderColor: theme.colors.secondary,
    backgroundColor: '#FFF8E1'
  },
  roleText: {
    color: '#666',
    fontWeight: '600'
  },
  roleTextActive: {
    color: theme.colors.secondary
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 50,
    borderWidth: 1,
    borderColor: '#E8EAF2',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
  },

  signupBtn: {
    backgroundColor: '#E6A940',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },

  signupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },

  loginGrey: {
    color: '#666',
  },

  loginLink: {
    color: '#DAAE58',
    fontWeight: '700',
  },
});
