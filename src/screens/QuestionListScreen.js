// src/screens/QuestionListScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function QuestionListScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);

  // Modal ve form için state’ler
  const [modalVisible, setModalVisible]     = useState(false);
  const [topics, setTopics]                 = useState([]);
  const [selectedTopic, setSelectedTopic]   = useState(null);
  const [questionText, setQuestionText]     = useState('');

  // 1️⃣ Soruları çek (üniversite/fakülte/bölüm bazlı)
  const fetchQuestions = () => {
    setLoading(true);
    // üniversite üstünden örnek: GET /api/soru/getir/universite?universiteId=...
    const url = fakulteId
      ? `${BASE}/api/soru/getir/fakulte`
      : bolumId
        ? `${BASE}/api/soru/getir/bolum`
        : `${BASE}/api/soru/getir/universite`;

    const params = {};
    if (universiteId) params.universiteId = universiteId;
    if (fakulteId)    params.fakulteId    = fakulteId;
    if (bolumId)      params.bolumId      = bolumId;

    axios.get(url, { params })
      .then(res => setQuestions(res.data))
      .catch(err => {
        console.error(err);
        Alert.alert('Hata', 'Sorular yüklenemedi');
      })
      .finally(() => setLoading(false));
  };
  useEffect(fetchQuestions, [universiteId, fakulteId, bolumId, isFocused]);

  // 2️⃣ Konuları çek
  useEffect(() => {
    axios.get(`${BASE}/api/soru/konu/getir`)
      .then(res => setTopics(res.data))
      .catch(err => {
        console.error(err);
        Alert.alert('Hata','Konular yüklenemedi');
      });
  }, []);

  // 3️⃣ Yeni soru oluştur
  const handleCreate = () => {
    if (!selectedTopic || !questionText.trim()) {
      return Alert.alert('Hata','Lütfen konu ve soru içeriğini girin.');
    }
    axios.post(`${BASE}/api/soru/soruOlustur`, {
      universiteId,
      bolumId,
      konuId: selectedTopic.konuId,
      icerik: questionText.trim(),
    })
    .then(() => {
      setModalVisible(false);
      setQuestionText('');
      setSelectedTopic(null);
      Alert.alert('Başarılı','Sorunuz yayınlandı.');
      // listeyi yenile
      fetchQuestions();
    })
    .catch(err => {
      console.error(err);
      Alert.alert('Hata','Soru eklenemedi.');
    });
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff"/>
      </View>
    );
  }

  return (
    <>
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Sorular</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.newBtnText}>+ Yeni Soru</Text>
          </TouchableOpacity>
        </View>

        {questions.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Henüz soru yok.</Text>
          </View>
        ) : (
          <FlatList
            data={questions}
            keyExtractor={q => q.soruId.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  navigation.navigate('QuestionDetail', { soruId: item.soruId })
                }
              >
                <Text style={styles.cardTitle}>{item.icerik}</Text>
                <Text style={styles.cardMeta}>
                  {item.kullaniciAdi} · {new Date(item.olusturmaTarihi).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </LinearGradient>

      {/* Yeni Soru Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS==='ios'?'padding':'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yeni Soru Sor</Text>

            {/* Konu Seçimi */}
            <FlatList
              horizontal
              data={topics}
              keyExtractor={t=>t.konuId.toString()}
              renderItem={({item})=>(
                <TouchableOpacity
                  style={[
                    styles.topicChip,
                    selectedTopic?.konuId===item.konuId && styles.topicChipSelected
                  ]}
                  onPress={()=>setSelectedTopic(item)}
                >
                  <Text style={[
                    styles.topicText,
                    selectedTopic?.konuId===item.konuId && styles.topicTextSelected
                  ]}>
                    {item.ad}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
            />

            {/* Soru Metni */}
            <TextInput
              style={styles.input}
              placeholder="Sorunuzu yazın..."
              placeholderTextColor="#999"
              multiline
              value={questionText}
              onChangeText={setQuestionText}
            />

            {/* Butonlar */}
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalBtn} onPress={handleCreate}>
                <Text style={styles.modalBtnText}>Gönder</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancel]}
                onPress={()=>setModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, padding:16 },
  loader:       { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  header:       { flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  title:        { color:'#fff', fontSize:22, fontWeight:'bold' },
  newBtn:       { backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:6, borderRadius:6 },
  newBtnText:   { color:'#f75c5b', fontWeight:'600' },
  empty:        { flex:1, justifyContent:'center', alignItems:'center' },
  emptyText:    { color:'#fff', fontSize:16, opacity:0.8 },
  card:         { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:10 },
  cardTitle:    { fontSize:16, fontWeight:'600', marginBottom:4, color:'#333' },
  cardMeta:     { fontSize:12, color:'#666' },

  // Modal
  modalContainer:{ flex:1, justifyContent:'center', backgroundColor:'rgba(0,0,0,0.4)' },
  modalContent: { margin:20, backgroundColor:'#fff', borderRadius:8, padding:16 },
  modalTitle:   { fontSize:18, fontWeight:'bold', marginBottom:12 },
  topicChip:    { padding:8, backgroundColor:'#eee', borderRadius:16, marginRight:8 },
  topicChipSelected:{ backgroundColor:'#f75c5b' },
  topicText:    { color:'#333' },
  topicTextSelected:{ color:'#fff' },
  input:        { height:100, backgroundColor:'#f0f0f0', borderRadius:6, padding:8, marginTop:12, textAlignVertical:'top' },
  modalButtons: { flexDirection:'row', justifyContent:'flex-end', marginTop:16 },
  modalBtn:     { paddingVertical:10, paddingHorizontal:16, backgroundColor:'#f75c5b', borderRadius:6, marginLeft:8 },
  modalBtnText: { color:'#fff', fontWeight:'600' },
  modalCancel:  { backgroundColor:'#ccc' },
  modalCancelText:{ color:'#333' },
});
