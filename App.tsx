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
import StudentComplete from './src/screens/StudentComplete';
import GraduateComplete from './src/screens/GraduateComplete';
import GraduateStart from './src/screens/GraduateStart';
import GraduateVerify from './src/screens/GraduateVerify';
import FacultyList from './src/screens/FacultyList';
import DepartmentList from './src/screens/DepartmentList';
import FacultyDetail from './src/screens/FacultyDetail';
import DepartmentDetail from './src/screens/DepartmentDetail';

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
        <Stack.Screen name="StudentComplete" component={StudentComplete} />
        <Stack.Screen name="GraduateComplete" component={GraduateComplete} />
        <Stack.Screen name="GraduateStart" component={GraduateStart} />
        <Stack.Screen name="GraduateVerify" component={GraduateVerify} />
        <Stack.Screen name="FacultyList"     component={FacultyList} />
        <Stack.Screen name="DepartmentList"  component={DepartmentList} />
        <Stack.Screen name="FacultyDetail" component={FacultyDetail} />
        <Stack.Screen name="DepartmentDetail" component={DepartmentDetail} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}