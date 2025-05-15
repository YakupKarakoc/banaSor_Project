// src/screens/Bolum_sayfasi/DepartmentQuestionScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import LikeButton from '../../components/LikeButton';            // 👈 KALP
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';

export default function DepartmentQuestionScreen() {
  const { universite, faculty, department } = useRoute().params;
  const bolumId      = department.bolumid;
  const navigation   = useNavigation();
  const isFocused    = useIsFocused();

  const [questions, setQuestions] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [fadeAnim]  = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    if (isFocused) loadQuestions();
    startAnim();
  }, [isFocused]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/api/soru/getir/bolum`, { params:{ bolumId: Number(bolumId) } });
      setQuestions(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Sorular yüklenemedi');
    } finally { setLoading(false); }
  };

  const startAnim = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:1,duration:700,useNativeDriver:true }),
      Animated.timing(slideAnim, { toValue:0,duration:700,useNativeDriver:true }),
    ]).start();
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.card,{ opacity:fadeAnim, transform:[{translateY:slideAnim},{scale:fadeAnim.interpolate({inputRange:[0,1],outputRange:[0.97,1]})}] }]}
    >
      <TouchableOpacity
        style={styles.cardBtn}
        activeOpacity={0.9}
        onPress={()=>navigation.navigate('DepartmentQuestionDetailScreen',{ soru:item, universite, faculty, department })}
      >
        <View style={styles.cardHeader}>
          <Icon name="help-circle-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>{item.icerik}</Text>
        </View>

        <View style={styles.metaRow}>
          <Icon name="person-outline" size={14} color="#ff8a5c" />
          <Text style={styles.metaText}>{item.kullaniciadi}</Text>
          <Icon name="chatbubble-ellipses-outline" size={14} color="#ff8a5c" style={{ marginLeft:10 }} />
          <Text style={styles.metaText}>{item.cevapsayisi} cevap</Text>

          {/* ❤️ LIKE */}
          <LikeButton
            soruId={item.soruid}
            likedInit={item.kullaniciBegendiMi}   // backend boolean alan adı
            countInit={item.begenisayisi}         // backend like sayısı
            dark                                   // siyah metinlere uygun beyaz kalp
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={["#f75c5b","#ff8a5c"]} style={{flex:1}}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Icon name="help-circle-outline" size={26} color="#fff" style={{ marginRight:6 }} />
          <Text style={styles.headerTitle}>{department.bolumadi} – Sorular</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={()=>navigation.navigate('NewDepartmentQuestionScreen',{ bolumId })}>
          <Icon name="add-circle-outline" size={18} color="#f75c5b" style={{ marginRight:4 }} />
          <Text style={styles.newBtnText}>Yeni Soru</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color="#fff" size="large"/></View>
      ) : questions.length===0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="help-circle-outline" size={48} color="#fff" style={{ opacity:0.7, marginBottom:8 }} />
          <Text style={styles.emptyText}>Henüz soru yok.</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={q=>q.soruid.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal:16, paddingBottom:30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, paddingTop:48 },
  headerLeft:{ flexDirection:'row', alignItems:'center', flexShrink:1 },
  headerTitle:{ color:'#fff', fontSize:18, fontWeight:'700', flexShrink:1 },
  newBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#fff', paddingHorizontal:14, paddingVertical:6, borderRadius:20 },
  newBtnText:{ color:'#f75c5b', fontWeight:'700', fontSize:14 },
  loader:{ flex:1, justifyContent:'center', alignItems:'center' },
  emptyWrap:{ flex:1, justifyContent:'center', alignItems:'center', marginTop:40 },
  emptyText:{ color:'#fff', opacity:0.8 },
  card:{ backgroundColor:'#fff', borderRadius:16, marginVertical:6, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:8, elevation:4, borderWidth:1, borderColor:'rgba(0,0,0,0.04)' },
  cardBtn:{ padding:16 },
  cardHeader:{ flexDirection:'row', alignItems:'center', marginBottom:6 },
  cardIcon:{ marginRight:8 },
  cardTitle:{ fontSize:15, fontWeight:'700', color:'#2D3436', flex:1 },
  metaRow:{ flexDirection:'row', alignItems:'center' },
  metaText:{ fontSize:12, color:'#666', marginLeft:4 },
});
