import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import ChatListScreen from '../screens/ChatListScreen';
import MessagingScreen from '../screens/MessagingScreen';
import NewChatScreen from '../screens/NewChatScreen';

const Stack = createNativeStackNavigator();

export default function ChatStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ChatList" component={ChatListScreen} />
            <Stack.Screen name="NewChat" component={NewChatScreen} />
            <Stack.Screen name="Messaging" component={MessagingScreen} />
        </Stack.Navigator>
    );
}
