import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './src/redux/store';

// Auth
import { AuthProvider, useAuth } from './src/context/AuthContext';

// Navigation Stacks
import AuthStack from './src/navigation/AuthStack';
import UserStack from './src/navigation/UserStack';
import OwnerStack from './src/navigation/OwnerStack';
import DriverStack from './src/navigation/DriverStack';

function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a splash screen
  }

  if (!user) {
    return <AuthStack />;
  }

  if (user.role === 'owner') {
    return <OwnerStack />;
  }

  if (user.role === 'driver') {
    return <DriverStack />;
  }

  // Default to User
  return <UserStack />;
}

export default function App() {
  const isDark = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar
            barStyle={isDark ? 'light-content' : 'dark-content'}
            translucent={false}
            backgroundColor="transparent"
          />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </Provider>
  );
}
