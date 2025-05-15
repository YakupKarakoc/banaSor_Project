// src/screens/MyAnswersScreen.js

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

import { getToken } from '../utils/auth';
import ReactionButton from '../components/ReactionButton';

const BASE = 'http://10.0.2.2:3000';

export default function MyAnswersScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [data,    setData]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  // verileri çek
  const fetchMyAnswers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${BASE}/api/profil/cevaplarim`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Cevaplarınız getirilemedi');
    } finally {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
      setLoading(false);
    }
  };

  // odağa gelince yeniden yükle
  useEffect(() => {
    if (isFocused) fetchMyAnswers();
  }, [isFocused]);

  // sil işlemi
  const handleDelete = (cevapId) => {
    Alert.alert(
      'Onay',
      'Cevabı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE}/api/soru/cevapSil/${cevapId}`);
              fetchMyAnswers();
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
    const id           = item.cevapId   ?? item.cevapid;
    const likeCount    = item.likeSayisi    ?? item.likesayisi    ?? 0;
    const dislikeCount = item.dislikeSayisi ?? item.dislikesayisi ?? 0;
    const content      = item.cevapIcerik   ?? item.cevapicerik   ?? '';
    const question     = item.soruIcerik    ?? item.soruicerik    ?? '';
    const dateStr      = item.cevapTarihi   ?? item.cevaptarihi;
    const date         = dateStr ? new Date(dateStr) : null;
    const formatted    = date && !isNaN(date)
      ? date.toLocaleString('tr-TR')
      : '—';

    return (
      <Animated.View style={[
          styles.card,
          { opacity: fade, transform: [{ translateY: slide }] }
        ]}
      >
        <Text style={styles.answerText}>{content}</Text>

        <View style={styles.questionRow}>
          <Ion name="help-circle-outline" size={14} color="#ff8a5c" />
          <Text style={styles.questionTxt} numberOfLines={1}>{question}</Text>
        </View>

        <View style={styles.footerRow}>
          <Ion name="time-outline" size={12} color="#ff8a5c" />
          <Text style={styles.metaTxt}>{formatted}</Text>

          <View style={styles.reactions}>
            <ReactionButton entryId={id} type="Like"    countInit={likeCount} />
            <ReactionButton entryId={id} type="Dislike" countInit={dislikeCount}/>
          </View>
        </View>

        {/* Güncelle / Sil butonları */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() =>
              navigation.navigate('UpdateAnswer', {
                cevapId: id,
                mevcutIcerik: content
              })
            }
          >
            <Ion name="pencil-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Güncelle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#e84118' }]}
            onPress={() => handleDelete(id)}
          >
            <Ion name="trash-outline" size={16} color="#fff" />
            <Text style={styles.actionText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <Ion name="chatbubbles-outline" size={26} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTxt}>Cevaplarım</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.centerTxt}>Yükleniyor…</Text>
        </View>
      ) : data.length === 0 ? (
        <View style={styles.center}>
          <Ion name="chatbubble-ellipses-outline" size={46} color="#fff"
               style={{ opacity:0.7, marginBottom:6 }} />
          <Text style={styles.centerTxt}>Henüz bir cevabın yok.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={item => `ans-${item.cevapId ?? item.cevapid}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1 },
  header:       { flexDirection:'row',alignItems:'center',padding:20,paddingTop:48 },
  headerTxt:    { fontSize:22,fontWeight:'700',color:'#fff' },

  listContent:  { paddingHorizontal:16, paddingBottom:30 },

  card: {
    backgroundColor:'#fff',
    borderRadius:16,
    marginVertical:8,
    padding:16,
    borderWidth:1,
    borderColor:'rgba(0,0,0,0.04)',
    shadowColor:'#000',
    shadowOffset:{ width:0, height:3 },
    shadowOpacity:0.08,
    shadowRadius:6,
    elevation:4,
  },
  answerText:   { fontSize:14,color:'#333',fontWeight:'600',marginBottom:6 },

  questionRow:  { flexDirection:'row',alignItems:'center',marginBottom:6 },
  questionTxt:  { marginLeft:4,fontSize:13,color:'#555',flex:1 },

  footerRow:    { flexDirection:'row',alignItems:'center' },
  metaTxt:      { fontSize:12,color:'#666',marginLeft:4,fontWeight:'500' },

  reactions:    { flexDirection:'row',marginLeft:'auto' },

  actions:      { flexDirection:'row',justifyContent:'flex-end',marginTop:12 },
  actionBtn:    {
    flexDirection:'row',
    alignItems:'center',
    backgroundColor:'#487eb0',
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:6,
    marginLeft:8
  },
  actionText:   { color:'#fff',marginLeft:6,fontSize:13,fontWeight:'600' },

  center:       { flex:1,justifyContent:'center',alignItems:'center' },
  centerTxt:    { color:'#fff',fontSize:15,opacity:0.85,textAlign:'center' },
});
