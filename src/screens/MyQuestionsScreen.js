// src/screens/MyQuestionsScreen.js

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';

export default function MyQuestionsScreen() {
  const nav = useNavigation();
  const isFocused = useIsFocused();

  const [list, setList] = useState([]);
  const [loading, setLoad] = useState(true);

  // anim değerleri
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  // soruları çek
  const getData = async () => {
    setLoad(true);
    try {
      const { data } = await axios.get(`${BASE}/api/profil/sorularim`);
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Sorularınız getirilemedi');
    } finally {
      setLoad(false);
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  };

  // ekran odağa gelince listeyi yenile
  useEffect(() => {
    if (isFocused) getData();
  }, [isFocused]);

  // sil işlemi
  const handleDelete = (soruId) => {
    Alert.alert(
      'Onay',
      'Soruyu silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE}/api/soru/soruisil/${soruId}`);
              getData();  // silince listeyi yenile
            } catch (e) {
              console.error(e);
              Alert.alert('Hata', 'Silme işlemi başarısız oldu');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const id = item.soruId ?? item.soruid ?? Math.random().toString();
    return (
      <Animated.View
        style={[
          styles.card,
          { opacity: fade, transform: [{ translateY: slide }] }
        ]}
      >
        <View style={styles.cardInner}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => nav.navigate('QuestionDetail', { soruId: id })}
          >
            <View style={styles.row}>
              <Ion name="help-circle-outline" size={20} color="#f75c5b" style={{ marginRight: 8 }} />
              <Text style={styles.title} numberOfLines={2}>{item.icerik}</Text>
            </View>
            <View style={[styles.row, { marginTop: 6 }]}>
              <Ion name="school-outline" size={14} color="#ff8a5c" />
              <Text style={styles.meta}>{item.universiteAd}</Text>
              {item.bolumAd && (
                <>
                  <Ion name="layers-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }} />
                  <Text style={styles.meta}>{item.bolumAd}</Text>
                </>
              )}
            </View>
            <View style={[styles.row, { marginTop: 2 }]}>
              <Ion name="chatbubble-ellipses-outline" size={14} color="#ff8a5c" />
              <Text style={styles.meta}>{item.cevapSayisi} cevap</Text>
              <Ion name="heart-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }} />
              <Text style={styles.meta}>{item.begeniSayisi} beğeni</Text>
            </View>
          </TouchableOpacity>

          {/* Güncelle / Sil butonları */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => nav.navigate('UpdateQuestion', { soruId: id, mevcutIcerik: item.icerik })}
            >
              <Ion name="pencil-outline" size={18} color="#fff" />
              <Text style={styles.actionText}>Güncelle</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#e84118' }]}
              onPress={() => handleDelete(id)}
            >
              <Ion name="trash-outline" size={18} color="#fff" />
              <Text style={styles.actionText}>Sil</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.flex}>
      <View style={styles.header}>
        <Ion name="list-circle-outline" size={26} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTxt}>Sorularım</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.centerTxt}>Yükleniyor…</Text>
        </View>
      ) : list.length === 0 ? (
        <View style={styles.center}>
          <Ion name="help-circle-outline" size={48} color="#fff" style={{ opacity: 0.7, marginBottom: 6 }} />
          <Text style={styles.centerTxt}>Henüz bir sorunuz yok.</Text>
        </View>
      ) : (
        <FlatList
          data={list}
          keyExtractor={q => (q.soruId ?? q.soruid ?? Math.random()).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex:{ flex:1 },
  header:{ flexDirection:'row',alignItems:'center',padding:20,paddingTop:48 },
  headerTxt:{ fontSize:22,fontWeight:'700',color:'#fff' },

  card:{ 
    backgroundColor:'#fff',
    borderRadius:16,
    marginVertical:8,
    shadowColor:'#000',
    shadowOffset:{width:0,height:3},
    shadowOpacity:0.08,
    shadowRadius:6,
    elevation:4,
    borderWidth:1,
    borderColor:'rgba(0,0,0,0.04)'
  },
  cardInner:{ padding:16 },
  row:{ flexDirection:'row',alignItems:'center' },
  title:{ fontSize:15,fontWeight:'700',color:'#2D3436',flex:1 },
  meta:{ fontSize:12,color:'#666',marginLeft:4,fontWeight:'500' },

  actions:{
    flexDirection:'row',
    justifyContent:'flex-end',
    marginTop:12
  },
  actionBtn:{
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#487eb0',
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:6,
    marginLeft:8
  },
  actionText:{
    color:'#fff',
    marginLeft:6,
    fontSize:13,
    fontWeight:'600'
  },

  center:{ flex:1,justifyContent:'center',alignItems:'center' },
  centerTxt:{ color:'#fff',fontSize:15,opacity:0.85,textAlign:'center' },
});
