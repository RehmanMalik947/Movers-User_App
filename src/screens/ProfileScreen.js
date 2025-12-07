import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMode } from '../context/ModeContext'; // adjust path if needed

export default function ProfileScreen() {
  const { mode, setMode } = useMode();
  const isOwnerMode = mode === 'owner';

  const toggleMode = () => {
    setMode(isOwnerMode ? 'user' : 'owner');
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
        Profile
      </Text>
      <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>
        Current mode: {isOwnerMode ? 'Truck Owner' : 'User'}
      </Text>

      <TouchableOpacity style={styles.switchBtn} onPress={toggleMode}>
        <Text style={styles.switchText}>
          {isOwnerMode ? 'Switch to User Mode' : 'Switch to Truck Owner Mode'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  switchBtn: {
    backgroundColor: '#E6A940',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  switchText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
