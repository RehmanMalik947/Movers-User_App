import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
// We might need a RoleSelectionScreen if we want to separate it from Login, 
// but for now LoginScreen has been handling some of it or we'll refactor LoginScreen.
// Based on current file structure:
// LoginScreen.js exists
// SignUpScreen.js exists

const Stack = createNativeStackNavigator();

export default function AuthStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignUpScreen} />
        </Stack.Navigator>
    );
}
