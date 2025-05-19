// App.tsx

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import axios from 'axios';

// --- Auth utils ---
import { getToken } from './src/utils/auth';

// --- Auth / onboarding / main screens ---
import Login from './src/screens/Giris_islemleri/Login';
import Signup from './src/screens/Giris_islemleri/Signup';
import VerifyScreen from './src/screens/Giris_islemleri/VerifyScreen';
import Home from './src/screens/Home';
import MyQuestionsScreen from './src/screens/MyQuestionsScreen';
import MyAnswersScreen   from './src/screens/MyAnswersScreen';
import MyContentScreen   from './src/screens/MyContentScreen';
import MyForumsScreen    from './src/screens/MyForumsScreen';
import MyEntriesScreen   from './src/screens/MyEntriesScreen';
import UpdateQuestionScreen from './src/screens/UpdateQuestionScreen';
import UpdateAnswer   from './src/screens/UpdateAnswer'
import UpdateForumScreen from './src/screens/UpdateForumScreen';
import UpdateEntryScreen from './src/screens/UpdateEntryScreen';
import GroupListScreen from './src/screens/GroupListScreen';



// --- University & profile ---
import UniversitelerListesi from './src/screens/Universty_sayfasi/UniversitelerListesi';
import UniversiteDetay      from './src/screens/Universty_sayfasi/UniversiteDetay';
import Favoriler            from './src/screens/Favoriler';
import ProfileScreen        from './src/screens/ProfileScreen';

// --- Registration flow ---
import StudentComplete    from './src/screens/Giris_islemleri/StudentComplete';
import GraduateStart      from './src/screens/Giris_islemleri/GraduateStart';
import GraduateComplete   from './src/screens/Giris_islemleri/GraduateComplete';
import GraduateVerify     from './src/screens/Giris_islemleri/GraduateVerify';

// --- Faculty / Department ---
import FacultyList                  from './src/screens/Fakulte_sayfasi/FacultyList';
import DepartmentList               from './src/screens/Bolum_sayfasi/DepartmentList';
import FacultyDetail                from './src/screens/Fakulte_sayfasi/FacultyDetail';
import DepartmentDetail             from './src/screens/Bolum_sayfasi/DepartmentDetail';
import FacultyQuestionScreen        from './src/screens/Fakulte_sayfasi/FacultyQuestionScreen';
import FacultyQuestionDetailScreen  from './src/screens/Fakulte_sayfasi/FacultyQuestionDetailScreen';
import NewFacultyQuestionScreen     from './src/screens/Fakulte_sayfasi/NewFacultyQuestionScreen';
import DepartmentQuestionScreen     from './src/screens/Bolum_sayfasi/DepartmentQuestionScreen';
import DepartmentQuestionDetailScreen from './src/screens/Bolum_sayfasi/DepartmentQuestionDetailScreen';
import NewDepartmentQuestionScreen  from './src/screens/Bolum_sayfasi/NewDepartmentQuestionScreen';

// --- Q&A flow ---
import TopicListScreen     from './src/screens/TopicListScreen';
import KonularScreen       from './src/screens/KonularScreen';
import QuestionListScreen  from './src/screens/Universty_sayfasi/QuestionListScreen';
import NewQuestionScreen   from './src/screens/Universty_sayfasi/NewQuestionScreen';
import QuestionDetailScreen from './src/screens/Universty_sayfasi/QuestionDetailScreen';

// --- Admin ---
import AdminPanelScreen from './src/screens/admin/AdminPanelScreen';
import AdminForumDetay from './src/screens/admin/AdminForumDetay';
import AdminSoruDetay from './src/screens/admin/AdminSoruDetay';



// --- Forum flow ---
import ForumScreen        from './src/screens/Universty_sayfasi/ForumScreen';
import NewForumScreen     from './src/screens/Universty_sayfasi/NewForumScreen';
import ForumDetailScreen  from './src/screens/Universty_sayfasi/ForumDetailScreen';
import FacultyForumScreen from './src/screens/Fakulte_sayfasi/FacultyForumScreen';

const Stack = createStackNavigator();

export default function App() {
  // On app start, read token and set Axios header
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
    })();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth / Onboarding */}
        <Stack.Screen name="Login"  component={Login} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Verify" component={VerifyScreen} />
        <Stack.Screen name="MyQuestions" component={MyQuestionsScreen} />
        <Stack.Screen name="MyAnswers"   component={MyAnswersScreen} />
        <Stack.Screen name="MyForums"    component={MyForumsScreen} />
        <Stack.Screen name="MyEntries"   component={MyEntriesScreen} />
        <Stack.Screen name="MyContent"   component={MyContentScreen} />
        <Stack.Screen name="UpdateQuestion" component={UpdateQuestionScreen} />
        <Stack.Screen name="UpdateAnswer" component={UpdateAnswer}/>
        <Stack.Screen name="ForumGuncelle" component={UpdateForumScreen}/>
        <Stack.Screen
  name="UpdateEntry"
  component={UpdateEntryScreen}
  options={{
    headerShown: false // Kendi header'ın varsa
  }}
/>



        {/* Main */}
        <Stack.Screen name="Home" component={Home} />
       


        {/* University / Department */}
        <Stack.Screen name="Universiteler" component={UniversitelerListesi} />
        <Stack.Screen name="UniversiteDetay" component={UniversiteDetay} />
        <Stack.Screen name="QuestionList" component={QuestionListScreen} />

        {/* Favorites & Profile */}
        <Stack.Screen name="Favoriler" component={Favoriler} />
        <Stack.Screen name="Profile"   component={ProfileScreen} />
         <Stack.Screen name="GroupList" component={GroupListScreen} options={{ headerShown: false }} />

        {/* Registration completion */}
        <Stack.Screen name="StudentComplete"  component={StudentComplete} />
        <Stack.Screen name="GraduateStart"    component={GraduateStart} />
        <Stack.Screen name="GraduateComplete" component={GraduateComplete} />
        <Stack.Screen name="GraduateVerify"   component={GraduateVerify} />

        {/* Faculty / Department */}
        <Stack.Screen name="FacultyList"                  component={FacultyList} />
        <Stack.Screen name="DepartmentList"               component={DepartmentList} />
        <Stack.Screen name="FacultyDetail"                component={FacultyDetail} />
        <Stack.Screen name="DepartmentDetail"             component={DepartmentDetail} />
        <Stack.Screen name="FacultyQuestionScreen"        component={FacultyQuestionScreen} />
        <Stack.Screen name="FacultyQuestionDetailScreen"  component={FacultyQuestionDetailScreen} />
        <Stack.Screen name="NewFacultyQuestionScreen"     component={NewFacultyQuestionScreen} />
        <Stack.Screen name="DepartmentQuestionScreen"     component={DepartmentQuestionScreen} />
        <Stack.Screen name="DepartmentQuestionDetailScreen" component={DepartmentQuestionDetailScreen} />
        <Stack.Screen name="NewDepartmentQuestionScreen"  component={NewDepartmentQuestionScreen} />

        {/* Admin */}
       <Stack.Screen
    name="AdminPanel"
    component={AdminPanelScreen}
    options={{ title: "Admin Paneli", headerShown: true }}
  />

  <Stack.Screen name="AdminForumDetay" component={AdminForumDetay} />
  <Stack.Screen name="AdminSoruDetay" component={AdminSoruDetay} />


        

        {/* Q&A */}
        <Stack.Screen name="Topics"         component={TopicListScreen} />
        <Stack.Screen name="Konular"        component={KonularScreen} />
        <Stack.Screen name="NewQuestion"    component={NewQuestionScreen} />
        <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} />

        {/* Forum */}
        <Stack.Screen name="Forum"       component={ForumScreen} />
        <Stack.Screen name="NewForum"    component={NewForumScreen} />
        <Stack.Screen name="ForumDetail" component={ForumDetailScreen} />
        <Stack.Screen name="FacultyForum" component={FacultyForumScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
