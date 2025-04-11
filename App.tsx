import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login   from './src/screens/Login';
import SignupScreen  from './src/screens/Signup';
import HomeScreen    from './src/screens/Home';
import VerifyScreen  from './src/screens/VerifyScreen'; // e‑posta doğrulama

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"   component={Login} />
      <Stack.Screen name="Signup"  component={SignupScreen} />
      <Stack.Screen name="Verify"  component={VerifyScreen} />
      <Stack.Screen name="Home"    component={HomeScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;
