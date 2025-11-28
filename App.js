// App.js
import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import BottomTabs from './src/screens/Navigation/BottomTabs';
import PlaceOrderScreen from './src/screens/PlaceOrderScreen';
import SetDateTimeScreen from './src/screens/SetDateTimeScreen';
import setPickup from './src/screens/setPickup';
import DropoffLocationScreen from './src/screens/DropoffLocation';
import store from './src/redux/store';
import SplashScreen from './src/screens/splashScreen';
import VehicleSelectionScreen from './src/screens/VehicleSelectionScreen';
import GoodsInfoScreen from './src/screens/GoodsInfoScreen';
// If you later want stack screens outside tabs (e.g. auth, onboarding), add them here:
// import DetailsScreen from './src/screens/DetailsScreen';
// import CartScreen from './src/screens/CartScreen';

const RootStack = createNativeStackNavigator();

export default function App() {
  const isDark = useColorScheme() === 'dark';

  return (
      <Provider store={store}>
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
        backgroundColor="transparent"
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <NavigationContainer>
          <RootStack.Navigator initialRouteName='splash'
            screenOptions={{
              headerShown: false, // tabs manage their own headers if needed
            }}
          >
            <RootStack.Screen name="MainTabs" component={BottomTabs} />
            <RootStack.Screen name="placeOrder" component={PlaceOrderScreen} />
            <RootStack.Screen name="setDate" component={SetDateTimeScreen} />
            <RootStack.Screen name="splash" component={SplashScreen} />
            <RootStack.Screen name="selectVehical" component={VehicleSelectionScreen} />
            <RootStack.Screen name="goodinfo" component={GoodsInfoScreen} />



            <RootStack.Screen name="pickup" component={setPickup} />
            <RootStack.Screen name="dropoff" component={DropoffLocationScreen} />


            {/*
            // Example: push-only screens that should sit above tabs
            <RootStack.Screen name="Details" component={DetailsScreen} />
            <RootStack.Screen name="Cart" component={CartScreen} />
            */}
          </RootStack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
    </Provider>
  );
}
