// App.tsx

import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'

// Auth / onboarding / main
import Login from './src/screens/Login'
import Signup from './src/screens/Signup'
import VerifyScreen from './src/screens/VerifyScreen'
import Home from './src/screens/Home'

// Üniversite & profile
import UniversitelerListesi from './src/screens/UniversitelerListesi'
import UniversiteDetay from './src/screens/UniversiteDetay'
import Favoriler from './src/screens/Favoriler'
import ProfileScreen from './src/screens/ProfileScreen'

// Kayıt tamamlama
import StudentComplete from './src/screens/StudentComplete'
import GraduateStart from './src/screens/GraduateStart'
import GraduateComplete from './src/screens/GraduateComplete'
import GraduateVerify from './src/screens/GraduateVerify'

// Fakülte / bölüm
import FacultyList from './src/screens/FacultyList'
import DepartmentList from './src/screens/DepartmentList'
import FacultyDetail from './src/screens/FacultyDetail'
import DepartmentDetail from './src/screens/DepartmentDetail'

// Soru-Cevap akışı
import TopicListScreen from './src/screens/TopicListScreen'
import KonularScreen from './src/screens/KonularScreen'
import QuestionListScreen from './src/screens/QuestionListScreen'
import NewQuestionScreen from './src/screens/NewQuestionScreen'
import QuestionDetailScreen from './src/screens/QuestionDetailScreen'



// Forum akışı
import ForumScreen from './src/screens/ForumScreen'
import NewForumScreen from './src/screens/NewForumScreen'
import ForumDetailScreen from './src/screens/ForumDetailScreen';

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
          name="ForumDetail"           // <-- yeni ekran adı
          component={ForumDetailScreen}
        />

        {/* … sonraki screen’ler … */}
      </Stack.Navigator>
        
      
    </NavigationContainer>
  )
}
