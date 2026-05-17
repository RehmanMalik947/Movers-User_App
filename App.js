import React from 'react';
import { StatusBar, useColorScheme, View } from 'react-native';
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

import LoadingOverlay from './src/components/LoadingOverlay';

function RootNavigator() {
  const { user, isLoading, isInitialLoading } = useAuth();

  if (isInitialLoading) {
    return (
      <View style={{ flex: 1 }}>
        <LoadingOverlay visible={true} message="Initializing..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!user ? (
        <AuthStack />
      ) : user.role === 'owner' ? (
        <OwnerStack />
      ) : user.role === 'driver' ? (
        <DriverStack />
      ) : (
        <UserStack />
      )}
      
      <LoadingOverlay visible={isLoading} />
    </View>
  );
}

export default function App() {
  const isDark = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <AuthProvider>
        <SafeAreaProvider>
          <StatusBar
            barStyle="dark-content"
            translucent={true}
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
