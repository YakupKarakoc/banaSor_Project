import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './src/screens/Login';
import SignupScreen from './src/screens/Signup';
import VerifyScreen from './src/screens/VerifyScreen';
import HomeScreen from './src/screens/Home';
import UniversitelerListesi from './src/screens/UniversitelerListesi';
import UniversiteDetay from './src/screens/UniversiteDetay';
import Favoriler from './src/screens/Favoriler';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Verify" component={VerifyScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Universiteler" component={UniversitelerListesi} />
        <Stack.Screen name="UniversiteDetay" component={UniversiteDetay} />
        <Stack.Screen name="Favoriler" component={Favoriler} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}