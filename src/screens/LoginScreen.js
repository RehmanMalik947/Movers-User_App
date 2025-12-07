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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      
      {/* Keyboard Avoiding */}
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

            {/* App Logo */}
            <Image
              source={require('../assets/heavyTruck.png')}
              style={styles.logo}
            />

            {/* Title */}
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Login to continue</Text>

            {/* Card Container */}
            <View style={styles.card}>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Icon name="mail-outline" size={20} color="#DAAE58" />
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#888"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password Input */}
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

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity 
                onPress={() => navigation.navigate('MainTabs')} 
                style={styles.loginBtn}
              >
                <Text style={styles.loginText}>Login</Text>
              </TouchableOpacity>

              {/* Signup Link */}
              <View style={styles.signupRow}>
                <Text style={styles.signupGrey}>Don’t have an account?</Text>
                <TouchableOpacity>
                  <Text style={styles.signupLink}> Sign up</Text>
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
    paddingTop: 60,
    alignItems: 'center',
  },

  logo: {
    width: 110,
    height: 110,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 24,
  },

  card: {
    width: '100%',
    backgroundColor: '#F5F8FF',
    borderRadius: 20,
    padding: 20,
    paddingVertical: 30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E8EAF2',
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: '#000',
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },

  forgotText: {
    color: '#2A73FF',
    fontWeight: '600',
  },

  loginBtn: {
    backgroundColor: '#E6A940',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 15,
  },

  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  signupGrey: {
    color: '#666',
  },

  signupLink: {
    color: '#DAAE58',
    fontWeight: '700',
  },
});
