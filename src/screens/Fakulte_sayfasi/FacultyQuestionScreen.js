// src/screens/Fakulte_sayfasi/FacultyQuestionScreen.js

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
import axios from 'axios';
import LikeButton from '../../components/LikeButton';

const BASE = 'http://10.0.2.2:3000';

export default function FacultyQuestionScreen() {
  const { universite, faculty } = useRoute().params;
  const fakulteId = faculty.fakulteid;
  const navigation = useNavigation();
  const isFocused  = useIsFocused();

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
      const res = await axios.get(`${BASE}/api/soru/getir/fakulte`, {
        params: { fakulteId: parseInt(fakulteId) },
      });

      const soruList = res.data;

      // Her soru için beğenip beğenmediğini sorgula
      const enriched = await Promise.all(
        soruList.map(async (q) => {
          try {
            const begRes = await axios.get(`${BASE}/api/soru/begeni/${q.soruid}`);
            return {
              ...q,
              kullaniciBegendiMi: begRes.data?.begendiMi ?? false,
            };
          } catch {
            return { ...q, kullaniciBegendiMi: false };
          }
        })
      );

      setQuestions(enriched);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Sorular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const startAnim = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:1,duration:800,useNativeDriver:true }),
      Animated.timing(slideAnim, { toValue:0,duration:800,useNativeDriver:true }),
    ]).start();
  };

  const renderItem = ({ item }) => (
    <Animated.View
      style={[styles.card,{
        opacity:fadeAnim,
        transform:[
          {translateY:slideAnim},
          {scale:fadeAnim.interpolate({inputRange:[0,1],outputRange:[0.97,1]})}
        ]
      }]}
    >
      <TouchableOpacity
        style={styles.cardBtn}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('DepartmentQuestionDetailScreen', {
            soru: item,
            department: {
              bolumadi: item.bolumad,
              bolumid: item.bolumid,
            },
          })
        }
      >
        <View style={styles.cardHeader}>
          <Icon name="help-circle-outline" size={20} color="#f75c5b" style={{marginRight:8}}/>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.icerik}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="layers-outline" size={14} color="#ff8a5c" />
          <Text style={styles.metaTxt}>{item.bolumad}</Text>
          <Icon name="chatbubble-ellipses-outline" size={14} color="#ff8a5c" style={{marginLeft:10}} />
          <Text style={styles.metaTxt}>{item.cevapsayisi} cevap</Text>
          <LikeButton
            soruId={item.soruid}
            likedInit={item.kullaniciBegendiMi}
            countInit={item.begenisayisi}
            dark
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={["#f75c5b","#ff8a5c"]} style={{flex:1}}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Icon name="help-circle-outline" size={26} color="#fff" style={{marginRight:6}} />
          <Text style={styles.headerTitle}>{faculty.fakulteadi} Fakültesi – Tüm Bölüm Soruları</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color="#fff" size="large"/></View>
      ) : questions.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Icon name="help-circle-outline" size={48} color="#fff" style={{opacity:0.7,marginBottom:8}} />
          <Text style={styles.emptyTxt}>Henüz soru yok.</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={q => q.soruid.toString()}
          renderItem={renderItem}
          contentContainerStyle={{paddingHorizontal:16,paddingBottom:30}}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerRow:{ flexDirection:'row',alignItems:'center',padding:20,paddingTop:48 },
  headerLeft:{ flexDirection:'row',alignItems:'center',flexShrink:1 },
  headerTitle:{ color:'#fff',fontSize:18,fontWeight:'700',flexShrink:1 },
  loader:{ flex:1,justifyContent:'center',alignItems:'center' },
  emptyWrap:{ flex:1,justifyContent:'center',alignItems:'center',marginTop:40 },
  emptyTxt:{ color:'#fff',opacity:0.8 },
  card:{ backgroundColor:'#fff',borderRadius:16,marginVertical:6,shadowColor:'#000',shadowOffset:{width:0,height:4},shadowOpacity:0.08,shadowRadius:8,elevation:4,borderWidth:1,borderColor:'rgba(0,0,0,0.04)' },
  cardBtn:{ padding:16 },
  cardHeader:{ flexDirection:'row',alignItems:'center',marginBottom:6 },
  cardTitle:{ fontSize:15,fontWeight:'700',color:'#2D3436',flex:1 },
  metaRow:{ flexDirection:'row',alignItems:'center',marginTop:4 },
  metaTxt:{ fontSize:12,color:'#666',marginLeft:4 },
});
