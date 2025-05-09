// App.tsx

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

// Auth / onboarding / main
import Login from './src/screens/Giris_islemleri/Login'
import Signup from './src/screens/Giris_islemleri/Signup'
import VerifyScreen from './src/screens/Giris_islemleri/VerifyScreen'
import Home from './src/screens/Home'

// Üniversite & profile
import UniversitelerListesi from './src/screens/Universty_sayfasi/UniversitelerListesi'
import UniversiteDetay from './src/screens/Universty_sayfasi/UniversiteDetay'
import Favoriler from './src/screens/Favoriler'
import ProfileScreen from './src/screens/ProfileScreen'

// Kayıt tamamlama
import StudentComplete from './src/screens/Giris_islemleri/StudentComplete'
import GraduateStart from './src/screens/Giris_islemleri/GraduateStart'
import GraduateComplete from './src/screens/Giris_islemleri/GraduateComplete'
import GraduateVerify from './src/screens/Giris_islemleri/GraduateVerify'

// Fakülte / bölüm
import FacultyList from './src/screens/Fakulte_sayfasi/FacultyList'
import DepartmentList from './src/screens/Bolum_sayfasi/DepartmentList'
import FacultyDetail from './src/screens/Fakulte_sayfasi/FacultyDetail'
import DepartmentDetail from './src/screens/Bolum_sayfasi/DepartmentDetail'

// Soru-Cevap akışı
import TopicListScreen from './src/screens/TopicListScreen'
import KonularScreen from './src/screens/KonularScreen'
import QuestionListScreen from './src/screens/Universty_sayfasi/QuestionListScreen'
import NewQuestionScreen from './src/screens/Universty_sayfasi/NewQuestionScreen'
import QuestionDetailScreen from './src/screens/Universty_sayfasi/QuestionDetailScreen'

// admin
import AdminDashboard from './src/screens/admin/AdminDashboard'
import UniversiteYonetim from './src/screens/admin/UniversiteYonetim'
import KullaniciYonetim from './src/screens/admin/KullaniciYonetim'
import GeriBildirimler from './src/screens/admin/GeriBildirimler'
import SoruYonetim from './src/screens/admin/SoruYonetim'
import FakulteYonetim from './src/screens/admin/FakulteYonetim'


// Forum akışı
import ForumScreen from './src/screens/Universty_sayfasi/ForumScreen'
import NewForumScreen from './src/screens/Universty_sayfasi/NewForumScreen'
import ForumDetailScreen from './src/screens/Universty_sayfasi/ForumDetailScreen';
import FacultyForumScreen from './src/screens/Fakulte_sayfasi/FacultyForumScreen'

const Stack = createStackNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth / Onboarding */}
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Verify" component={VerifyScreen} />

        {/* Main */}
        <Stack.Screen name="Home" component={Home} />

        {/* Üniversite Bölümü */}
        <Stack.Screen name="Universiteler" component={UniversitelerListesi} />
        <Stack.Screen name="UniversiteDetay" component={UniversiteDetay} />

        {/* Favoriler & Profil */}
        <Stack.Screen name="Favoriler" component={Favoriler} />
        <Stack.Screen name="Profile" component={ProfileScreen} />

        {/* Kayıt Tamamlama */}
        <Stack.Screen name="StudentComplete" component={StudentComplete} />
        <Stack.Screen name="GraduateStart" component={GraduateStart} />
        <Stack.Screen name="GraduateComplete" component={GraduateComplete} />
        <Stack.Screen name="GraduateVerify" component={GraduateVerify} />

        {/* Fakülte / Bölüm */}
        <Stack.Screen name="FacultyList" component={FacultyList} />
        <Stack.Screen name="DepartmentList" component={DepartmentList} />
        <Stack.Screen name="FacultyDetail" component={FacultyDetail} />
        <Stack.Screen name="DepartmentDetail" component={DepartmentDetail} />
      
        {/* admin */}
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="UniversiteYonetim" component={UniversiteYonetim} />
        <Stack.Screen name="KullaniciYonetim" component={KullaniciYonetim} />
        <Stack.Screen name="GeriBildirimler" component={GeriBildirimler} />
        <Stack.Screen name="SoruYonetim" component={SoruYonetim} />
        <Stack.Screen name="FakulteYonetim" component={FakulteYonetim} />
        

        {/* Soru-Cevap */}
        <Stack.Screen name="Topics" component={TopicListScreen} />
        <Stack.Screen name="Konular" component={KonularScreen} />
        <Stack.Screen name="QuestionList" component={QuestionListScreen}/>
        <Stack.Screen name="NewQuestion" component={NewQuestionScreen} />
        <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />
       
        {/* Forum */}
        <Stack.Screen name="Forum" component={ForumScreen} />
        <Stack.Screen name="NewForum" component={NewForumScreen} />
        <Stack.Screen
          name="ForumDetail"           
          component={ForumDetailScreen}
        />
        

<Stack.Screen name="FacultyForum" component={FacultyForumScreen}/>


        
      </Stack.Navigator>
        
      
    </NavigationContainer>
  )
}
