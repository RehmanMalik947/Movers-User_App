import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function SplashScreen({ navigation }) {

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('MainTabs'); // Change to your first screen
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/heavyTruck.png')} // your logo path
        style={styles.logo}
      />

      {/* Footer Text */}
      <Text style={styles.footerText}>Developed by AIA</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // change any color you want
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  footerText: {
    position: 'absolute',
    bottom: 40,
    fontSize: 16,
    color: '#444',
  },
});
