// src/screens/QuestionDetailScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function QuestionDetailScreen() {
  const { soruId } = useRoute().params;
  const [question, setQuestion]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading]     = useState(true);
  const [posting, setPosting]     = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/api/soru/detay/${soruId}`);
      setQuestion({
        icerik: data.icerik,
        soranKullaniciAdi: data.soranKullaniciAdi,
        olusturmaTarihi: data.olusturmaTarihi,
      });
      setAnswers(data.cevaplar);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [soruId]);

  const handleAddAnswer = async () => {
    if (!newAnswer.trim()) return Alert.alert('Hata', 'Lütfen bir cevap girin.');
    setPosting(true);
    try {
      await axios.post(`${BASE}/api/soru/cevapOlustur`, {
        soruId,
        icerik: newAnswer.trim(),
      });
      setNewAnswer('');
      fetchData();
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Cevap eklenemedi');
    } finally {
      setPosting(false);
    }
  };

  if (loading || !question) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS==='ios'?'padding':'height'}
        style={styles.flex}
      >
        <FlatList
          data={answers}
          keyExtractor={a => a.cevapId.toString()}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.questionText}>{question.icerik}</Text>
              <Text style={styles.meta}>
                — {question.soranKullaniciAdi} ·{' '}
                {new Date(question.olusturmaTarihi).toLocaleString('tr-TR')}
              </Text>
              <Text style={styles.answerCount}>
                Cevap sayısı: {answers.length}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.icerik}</Text>
              <Text style={styles.metaSmall}>
                — {item.cevaplayanKullaniciAdi} ·{' '}
                {new Date(item.olusturmaTarihi).toLocaleString('tr-TR')}
              </Text>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Henüz cevap yok.</Text>}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.footer}>
          <TextInput
            style={styles.input}
            placeholder="Cevabınızı buraya yazın..."
            placeholderTextColor="#aaa"
            multiline
            value={newAnswer}
            onChangeText={setNewAnswer}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleAddAnswer}
            disabled={posting}
          >
            {posting
              ? <ActivityIndicator color="#f75c5b" />
              : <Text style={styles.sendText}>Gönder</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex:           { flex:1 },
  container:      { flex:1 },
  loader:         { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  listContent:    { padding:16, paddingBottom:100 },
  header:         { marginBottom:12, paddingHorizontal:16 },
  questionText:   { fontSize:18, fontWeight:'600', color:'#fff' },
  meta:           { fontSize:12, color:'#eee', marginTop:4 },
  answerCount:    { fontSize:14, color:'#fff', marginTop:8, fontStyle:'italic' },
  card:           { backgroundColor:'#fff', borderRadius:8, padding:12, marginVertical:6, marginHorizontal:16 },
  cardText:       { fontSize:16, color:'#333' },
  metaSmall:      { fontSize:12, color:'#555', marginTop:4 },
  empty:          { textAlign:'center', color:'#fff', marginTop:20, opacity:0.8 },
  footer:         { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', padding:12, backgroundColor:'rgba(0,0,0,0.1)' },
  input:          { flex:1, backgroundColor:'#fff', borderRadius:20, paddingHorizontal:16, paddingVertical:8, marginRight:8, maxHeight:100 },
  sendBtn:        { backgroundColor:'#fff', borderRadius:20, justifyContent:'center', paddingHorizontal:16 },
  sendText:       { color:'#f75c5b', fontWeight:'600' },
});
