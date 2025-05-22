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
import ReactionButton from '../../components/ReactionButton';   // 👍/👎

const BASE = 'http://10.0.2.2:3000';

export default function FacultyQuestionDetailScreen() {
  const { soru } = useRoute().params;
  const soruId    = soru.soruid;

  const [detail, setDetail]       = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cevapText, setCevapText] = useState('');
  const [posting, setPosting]     = useState(false);

  // Fetch question detail + each answer's user reaction
  const loadDetail = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/api/soru/detay/${soruId}`);
      setDetail(data);

      const enriched = await Promise.all(
        (data.cevaplar || []).map(async (c) => {
          const id = c.cevapId ?? c.cevapid;
          try {
            const { data: tepkiRes } = await axios.get(
              `${BASE}/api/soru/cevap/tepki/${id}`
            );
            return { ...c, kullaniciTepkisi: tepkiRes.tepki ?? null };
          } catch {
            return { ...c, kullaniciTepkisi: null };
          }
        })
      );
      setAnswers(enriched);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Detaylar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [soruId]);

  // Post a new answer
  const handleSend = async () => {
    if (!cevapText.trim()) return;
    setPosting(true);
    try {
      await axios.post(`${BASE}/api/soru/cevapOlustur`, {
        soruId,
        icerik: cevapText.trim(),
      });
      setCevapText('');
      loadDetail();
    } catch {
      Alert.alert('Hata','Cevap gönderilemedi');
    } finally {
      setPosting(false);
    }
  };

  if (loading || !detail) {
    return (
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <ActivityIndicator color="#fff" size="large" style={{ marginTop: 20 }} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Q: {soru.icerik}</Text>
        <Text style={styles.sectionTitle}>Cevaplar</Text>

        {answers.length === 0 ? (
          <Text style={styles.noAnswer}>Henüz cevap yok.</Text>
        ) : (
          answers.map((c, i) => {
            const id          = c.cevapId ?? c.cevapid;
            const likeCnt     = Number(c.likeSayisi    ?? c.likesayisi    ?? 0);
            const dislikeCnt  = Number(c.dislikeSayisi ?? c.dislikesayisi ?? 0);
            return (
              <View key={i} style={styles.answerCard}>
                <Text style={styles.answerText}>{c.icerik}</Text>
                <View style={styles.answerFooter}>
                  <View style={styles.userRow}>
                    <Icon name="person-outline" size={13} color="#ff8a5c" />
                    <Text style={styles.userTxt}>{c.cevaplayanKullaniciAdi}</Text>
                  </View>
                  <View style={styles.reactions}>
                    <ReactionButton
                      type="Like"
                      cevapId={id}
                      countInit={likeCnt}
                      activeInit={c.kullaniciTepkisi === 'Like'}
                    />
                    <ReactionButton
                      type="Dislike"
                      cevapId={id}
                      countInit={dislikeCnt}
                      activeInit={c.kullaniciTepkisi === 'Dislike'}
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* Yeni cevap kutusu */}
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
            onPress={handleSend}
          >
            {posting
              ? <ActivityIndicator color="#fff"/>
              : <Icon name="send" size={20} color="#fff"/>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1 },
  content:        { padding:20, paddingBottom:60 },
  title:          { fontSize:20, fontWeight:'700', color:'#fff', marginBottom:8 },
  sectionTitle:   { fontSize:17, fontWeight:'600', color:'#fff', marginBottom:10 },
  noAnswer:       { color:'#fff', opacity:0.7, marginTop:8 },
  answerCard:     { backgroundColor:'#fff', padding:14, borderRadius:10, marginBottom:12 },
  answerText:     { fontSize:14, color:'#444' },
  answerFooter:   { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8 },
  userRow:        { flexDirection:'row', alignItems:'center' },
  userTxt:        { marginLeft:4, fontSize:12, color:'#555', fontWeight:'500' },
  reactions:      { flexDirection:'row', alignItems:'center' },
  inputBox:       { flexDirection:'row', marginTop:20, backgroundColor:'#fff', borderRadius:10, padding:8 },
  input:          { flex:1, fontSize:15, padding:6, color:'#000' },
  sendBtn:        { padding:10, backgroundColor:'#f75c5b', borderRadius:8 },
});
