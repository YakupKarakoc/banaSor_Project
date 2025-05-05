import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// 🔑 Authentication Screens
import Login from './src/screens/Login';
import Signup from './src/screens/Signup';
import VerifyScreen from './src/screens/VerifyScreen';

// 🏠 Main
import Home from './src/screens/Home';

// 🎓 Üniversiteler
import UniversitelerListesi from './src/screens/UniversitelerListesi';
import UniversiteDetay from './src/screens/UniversiteDetay';
import FacultyList from './src/screens/FacultyList';
import FacultyDetail from './src/screens/FacultyDetail';
import DepartmentList from './src/screens/DepartmentList';
import DepartmentDetail from './src/screens/DepartmentDetail';

// ⭐ Favoriler & Profil
import Favoriler from './src/screens/Favoriler';
import ProfileScreen from './src/screens/ProfileScreen';

// 📝 Kayıt Tamamlama
import StudentComplete from './src/screens/StudentComplete';
import GraduateStart from './src/screens/GraduateStart';
import GraduateComplete from './src/screens/GraduateComplete';
import GraduateVerify from './src/screens/GraduateVerify';

// 💬 Soru-Cevap
import KonularScreen from './src/screens/KonularScreen';
import TopicListScreen from './src/screens/TopicListScreen';
import QuestionListScreen from './src/screens/QuestionListScreen';
import QuestionDetailScreen from './src/screens/QuestionDetailScreen';
import NewQuestionScreen from './src/screens/NewQuestionScreen';

// 📢 Forum
import ForumScreen from './src/screens/ForumScreen';
import NewForumScreen from './src/screens/NewForumScreen';
import ForumDetailScreen from './src/screens/ForumDetailScreen';

// 🛡️ Admin Panel
import AdminDashboard from './src/screens/AdminDashboard';
import KullaniciYonetim from './src/screens/KullaniciYonetim';
import UniversiteYonetim from './src/screens/UniversiteYonetim';
import FakulteYonetim from './src/screens/FakulteYonetim';
import SoruYonetim from './src/screens/SoruYonetim';
import GeriBildirimler from './src/screens/GeriBildirimler';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* 🔑 Authentication */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Verify" component={VerifyScreen} />

        {/* 🏠 Main */}
        <Stack.Screen name="Home" component={Home} />

        {/* 🎓 Üniversiteler */}
        <Stack.Screen name="Universiteler" component={UniversitelerListesi} />
        <Stack.Screen name="UniversiteDetay" component={UniversiteDetay} />
        <Stack.Screen name="FacultyList" component={FacultyList} />
        <Stack.Screen name="FacultyDetail" component={FacultyDetail} />
        <Stack.Screen name="DepartmentList" component={DepartmentList} />
        <Stack.Screen name="DepartmentDetail" component={DepartmentDetail} />

        {/* ⭐ Favoriler & Profil */}
        <Stack.Screen name="Favoriler" component={Favoriler} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* 📝 Kayıt Tamamlama */}
        <Stack.Screen name="StudentComplete" component={StudentComplete} />
        <Stack.Screen name="GraduateStart" component={GraduateStart} />
        <Stack.Screen name="GraduateComplete" component={GraduateComplete} />
        <Stack.Screen name="GraduateVerify" component={GraduateVerify} />

        {/* 💬 Soru-Cevap */}
        <Stack.Screen name="Konular" component={KonularScreen} />
        <Stack.Screen name="Topics" component={TopicListScreen} />
        <Stack.Screen name="QuestionList" component={QuestionListScreen} />
        <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
        <Stack.Screen name="NewQuestion" component={NewQuestionScreen} />

        {/* 📢 Forum */}
        <Stack.Screen name="Forum" component={ForumScreen} />
        <Stack.Screen name="NewForum" component={NewForumScreen} />
        <Stack.Screen name="ForumDetail" component={ForumDetailScreen} />

        {/* 🛡️ Admin */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="KullaniciYonetim" component={KullaniciYonetim} />
        <Stack.Screen name="UniversiteYonetim" component={UniversiteYonetim} />
        <Stack.Screen name="FakulteYonetim" component={FakulteYonetim} />
        <Stack.Screen name="SoruYonetim" component={SoruYonetim} />
        <Stack.Screen name="GeriBildirimler" component={GeriBildirimler} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}