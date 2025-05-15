// src/screens/Fakulte_sayfasi/FacultyQuestionDetailScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import ReactionButton from '../../components/ReactionButton';   // 👍 / 👎

const BASE_URL = 'http://10.0.2.2:3000';

export default function FacultyQuestionDetailScreen() {
  const { soru } = useRoute().params;        // faculty & universite gerekmedikçe alınmadı
  const soruId = soru?.soruid;

  const [detay, setDetay]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [cevapText, setCevapText] = useState('');
  const [posting, setPosting]     = useState(false);

  /* ----------- FETCH ----------- */
  const loadDetay = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/soru/detay/${soruId}`);
      setDetay(data);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Detaylar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDetay(); }, [soruId]);

  /* ----------- ADD ANSWER ----------- */
  const handleSend = async () => {
    if (!cevapText.trim()) return;
    setPosting(true);
    try {
      await axios.post(`${BASE_URL}/api/soru/cevapOlustur`, {
        soruId,
        icerik: cevapText.trim(),
      });
      setCevapText('');
      loadDetay();
    } catch (e) {
      Alert.alert('Hata', 'Cevap gönderilemedi');
    } finally {
      setPosting(false);
    }
  };

  /* ----------- RENDER SINGLE ANSWER ----------- */
  const renderCevap = (c, idx) => {
    const id          = c.cevapId ?? c.cevapid;
    const likeCount   = parseInt(c.likeSayisi    ?? c.likesayisi    ?? 0, 10);
    const dislikeCount= parseInt(c.dislikeSayisi ?? c.dislikesayisi ?? 0, 10);

    return (
      <View key={idx} style={styles.answerCard}>
        <Text style={styles.answerText}>{c.icerik}</Text>

        <View style={styles.answerFooter}>
          <View style={styles.userRow}>
            <Icon name="person-outline" size={13} color="#ff8a5c" />
            <Text style={styles.userTxt}>{c.cevaplayanKullaniciAdi}</Text>
          </View>

          {/* Like / Dislike → sadece cevapId gönderiyoruz */}
          <View style={styles.reactions}>
            <ReactionButton type="Like"    cevapId={id} countInit={likeCount}   />
            <ReactionButton type="Dislike" cevapId={id} countInit={dislikeCount}/>
          </View>
        </View>
      </View>
    );
  };

  /* ----------- UI ----------- */
  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Q: {soru.icerik}</Text>

        <Text style={styles.sectionTitle}>Cevaplar</Text>

        {loading ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : detay?.cevaplar?.length ? (
          detay.cevaplar.map(renderCevap)
        ) : (
          <Text style={styles.noAnswer}>Henüz cevap yok.</Text>
        )}

        {/* --- Yeni cevap giriş kutusu --- */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Cevabınızı yazın…"
            placeholderTextColor="#ccc"
            value={cevapText}
            onChangeText={setCevapText}
            multiline
          />
          <TouchableOpacity
            style={styles.sendBtn}
            disabled={posting}
            onPress={handleSend}>
            {posting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Icon name="send" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { padding: 20, paddingBottom: 60 },

  title:         { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 },
  sectionTitle:  { fontSize: 17, fontWeight: '600', color: '#fff', marginBottom: 10 },

  /* ---- answer card ---- */
  answerCard:{ backgroundColor:'#fff', padding:14, borderRadius:10, marginBottom:12,
               borderWidth:1, borderColor:'rgba(0,0,0,0.05)' },
  answerText:{ fontSize:14, color:'#444' },

  answerFooter:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8 },
  userRow:{ flexDirection:'row', alignItems:'center' },
  userTxt:{ marginLeft:4, fontSize:12, color:'#555', fontWeight:'500' },

  reactions:{ flexDirection:'row', alignItems:'center' },

  noAnswer:{ color:'#fff', opacity:0.7, fontSize:15, marginTop:10 },

  /* ---- input ---- */
  inputBox:{ flexDirection:'row', marginTop:20, backgroundColor:'#fff',
             borderRadius:10, alignItems:'center', paddingHorizontal:10, paddingVertical:6 },
  input:{ flex:1, fontSize:15, paddingHorizontal:8, paddingVertical:6, color:'#000' },
  sendBtn:{ backgroundColor:'#f75c5b', padding:10, borderRadius:8, marginLeft:6 },
});
