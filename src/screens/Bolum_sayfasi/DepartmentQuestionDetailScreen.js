// src/screens/Bolum_sayfasi/DepartmentQuestionDetailScreen.js

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
import ReactionButton from '../../components/ReactionButton';  // 👍/👎

const BASE = 'http://10.0.2.2:3000';

export default function DepartmentQuestionDetailScreen() {
  const { soru, department } = useRoute().params;
  const soruId = soru.soruid;

  const [detail, setDetail]    = useState(null);
  const [answers, setAnswers]  = useState([]);
  const [loading, setLoading]  = useState(true);
  const [answerTxt, setAnswerTxt] = useState('');
  const [posting, setPosting]  = useState(false);

  // load question + answers + each answer's current user reaction
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

  // post a new answer then re-load
  const handleSend = async () => {
    if (!answerTxt.trim()) return;
    setPosting(true);
    try {
      await axios.post(`${BASE}/api/soru/cevapOlustur`, {
        soruId,
        icerik: answerTxt.trim(),
      });
      setAnswerTxt('');
      loadDetail();
    } catch {
      Alert.alert('Hata', 'Cevap gönderilemedi');
    } finally {
      setPosting(false);
    }
  };

  if (loading || !detail) {
    return (
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <ActivityIndicator color="#fff" size="large" style={{ marginTop:20 }}/>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.breadcrumb}>{department.bolumadi}</Text>
        <Text style={styles.questionText}>Q: {soru.icerik}</Text>
        <Text style={styles.sectionTitle}>Cevaplar</Text>

        {answers.length === 0 ? (
          <Text style={styles.noAnswer}>Henüz cevap yok.</Text>
        ) : (
          answers.map((c, i) => {
            const id         = c.cevapId ?? c.cevapid;
            const likeCnt    = Number(c.likeSayisi    ?? c.likesayisi    ?? 0);
            const dislikeCnt = Number(c.dislikeSayisi ?? c.dislikesayisi ?? 0);
            const activeLike    = c.kullaniciTepkisi === 'Like';
            const activeDislike = c.kullaniciTepkisi === 'Dislike';

            return (
              <View key={i} style={styles.answerCard}>
                <Text style={styles.answerText}>{c.icerik}</Text>
                <View style={styles.metaRow}>
                  <Icon name="person-outline" size={12} color="#ff8a5c"/>
                  <Text style={styles.meta}>{c.cevaplayanKullaniciAdi}</Text>
                  <Icon name="time-outline" size={12} color="#ff8a5c" style={{marginLeft:8}}/>
                  <Text style={styles.meta}>
                    {new Date(c.olusturmaTarihi).toLocaleString('tr-TR')}
                  </Text>
                  <View style={styles.reactions}>
                    <ReactionButton
                      type="Like"
                      cevapId={id}
                      countInit={likeCnt}
                      activeInit={activeLike}
                    />
                    <ReactionButton
                      type="Dislike"
                      cevapId={id}
                      countInit={dislikeCnt}
                      activeInit={activeDislike}
                    />
                  </View>
                </View>
              </View>
            );
          })
        )}

        {/* new answer input */}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Cevabınızı yazın…"
            placeholderTextColor="#aaa"
            value={answerTxt}
            onChangeText={setAnswerTxt}
            multiline
          />
          <TouchableOpacity
            style={styles.sendBtn}
            disabled={posting}
            onPress={handleSend}
          >
            {posting
              ? <ActivityIndicator color="#fff"/>
              : <Icon name="send" size={18} color="#fff"/>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1 },
  inner:       { padding:20, paddingBottom:60 },
  breadcrumb:  { fontSize:13, color:'#fff', opacity:0.8, marginBottom:6 },
  questionText:{ fontSize:18,fontWeight:'700',color:'#fff',marginBottom:16 },
  sectionTitle:{ fontSize:16,fontWeight:'600',color:'#fff',marginBottom:10 },
  noAnswer:    { color:'#fff', opacity:0.8, marginTop:4 },
  answerCard:  { backgroundColor:'#fff', borderRadius:12, padding:14, marginBottom:10 },
  answerText:  { fontSize:14, color:'#333', marginBottom:6 },
  metaRow:     { flexDirection:'row', alignItems:'center', flexWrap:'wrap' },
  meta:        { fontSize:11, color:'#666', marginLeft:2, marginRight:4 },
  reactions:   { flexDirection:'row', alignItems:'center', marginLeft:'auto' },
  inputWrap:   { flexDirection:'row', alignItems:'flex-end', backgroundColor:'#fff', borderRadius:12, padding:8, marginTop:20 },
  input:       { flex:1, maxHeight:120, fontSize:14, color:'#000', paddingRight:8 },
  sendBtn:     { padding:8, backgroundColor:'#f75c5b', borderRadius:8 },
});
