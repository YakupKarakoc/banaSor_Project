// src/screens/MyContentScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function MyContentScreen() {
  const navigation = useNavigation();

  const tiles = [
    { label: 'Sorularım',   icon: 'help-circle-outline',   target: 'MyQuestions' },
    { label: 'Cevaplarım',  icon: 'chatbubbles-outline',   target: 'MyAnswers'   },
    { label: 'Forumlarım',  icon: 'people-circle-outline', target: 'MyForums'    },
    { label: 'Entrylerim',  icon: 'document-text-outline', target: 'MyEntries'   },
  ];

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.flex}>
      <View style={styles.header}>
        <Ionicons name="folder-open-outline" size={26} color="#fff" style={{ marginRight: 8 }}/>
        <Text style={styles.headerTxt}>Bana Ait</Text>
      </View>

      <View style={styles.container}>
        {tiles.map((t, i) => (
          <TouchableOpacity
            key={i}
            style={styles.tile}
            activeOpacity={0.85}
            onPress={() => navigation.navigate(t.target)}
          >
            <Ionicons name={t.icon} size={24} color="#fff" style={styles.tileIcon}/>
            <Text style={styles.tileTxt}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  flex:{ flex:1 },
  header:{ flexDirection:'row',alignItems:'center',padding:20,paddingTop:48 },
  headerTxt:{ fontSize:22,fontWeight:'700',color:'#fff' },

  container:{ padding:20,justifyContent:'center' },
  tile:{
    flexDirection:'row',alignItems:'center',
    backgroundColor:'#fff',borderRadius:18,
    paddingVertical:14,paddingHorizontal:18,
    marginBottom:14,

    shadowColor:'#000',shadowOffset:{width:0,height:3},
    shadowOpacity:0.08,shadowRadius:6,elevation:4,
    borderWidth:1,borderColor:'rgba(0,0,0,0.03)',
  },
  tileIcon:{
    width:36,height:36,borderRadius:18,
    backgroundColor:'#f75c5b',marginRight:14,
    textAlign:'center',textAlignVertical:'center',
    lineHeight:36,
    shadowColor:'#f75c5b',shadowOffset:{width:0,height:2},
    shadowOpacity:0.12,shadowRadius:4,elevation:3,
  },
  tileTxt:{ fontSize:16,fontWeight:'600',color:'#2D3436',letterSpacing:0.2 },
});
