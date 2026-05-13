import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WalletScreen from '../screens/WalletScreen';
import TopUpScreen from '../screens/TopUpScreen';
import WithdrawScreen from '../screens/WithdrawScreen';

const Stack = createNativeStackNavigator();

export default function WalletStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WalletHome" component={WalletScreen} />
            <Stack.Screen name="TopUp" component={TopUpScreen} />
            <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        </Stack.Navigator>
    );
}
