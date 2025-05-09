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
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function QuestionDetailScreen() {
  const { soruId } = useRoute().params;
  const [question, setQuestion]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading]     = useState(true);
  const [posting, setPosting]     = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

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

  useEffect(() => { fetchData(); startAnimations(); }, [soruId]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </LinearGradient>
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
              <View style={styles.questionIconRow}>
                <Icon name="help-circle-outline" size={28} color="#fff" style={styles.questionIcon} />
                <Text style={styles.questionText}>{question.icerik}</Text>
              </View>
              <View style={styles.metaRow}>
                <Icon name="person-outline" size={16} color="#fff" style={styles.metaIcon} />
                <Text style={styles.meta}>{question.soranKullaniciAdi}</Text>
                <Icon name="time-outline" size={16} color="#fff" style={[styles.metaIcon, { marginLeft: 12 }]} />
                <Text style={styles.meta}>{new Date(question.olusturmaTarihi).toLocaleString('tr-TR')}</Text>
              </View>
              <Text style={styles.answerCount}>Cevap sayısı: {answers.length}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.97, 1]
                    })}
                  ]
                }
              ]}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Icon name="chatbubble-ellipses-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
                  <Text style={styles.cardText}>{item.icerik}</Text>
                </View>
                <View style={styles.cardMetaRow}>
                  <Icon name="person-outline" size={14} color="#ff8a5c" />
                  <Text style={styles.cardMeta}>{item.cevaplayanKullaniciAdi}</Text>
                  <Icon name="time-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }} />
                  <Text style={styles.cardMeta}>{new Date(item.olusturmaTarihi).toLocaleString('tr-TR')}</Text>
                </View>
              </View>
            </Animated.View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="chatbubble-ellipses-outline" size={40} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
              <Text style={styles.empty}>Henüz cevap yok.</Text>
            </View>
          }
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
            activeOpacity={0.8}
          >
            {posting
              ? <ActivityIndicator color="#f75c5b" />
              : <Icon name="send" size={22} color="#f75c5b" />}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex:           { flex:1 },
  container:      { flex:1 },
  loader:         { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText:    { color:'#fff', fontSize:16, marginTop:12, opacity:0.8 },
  listContent:    { padding:16, paddingBottom:100 },
  header:         { marginBottom:12, paddingHorizontal:8, paddingTop:32 },
  questionIconRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  questionIcon:   { marginRight:10 },
  questionText:   { fontSize:18, fontWeight:'700', color:'#fff', flex:1 },
  metaRow:        { flexDirection:'row', alignItems:'center', marginBottom:4 },
  metaIcon:       { marginRight:4 },
  meta:           { fontSize:13, color:'#eee', marginRight:8, fontWeight:'500' },
  answerCount:    { fontSize:14, color:'#fff', marginTop:8, fontStyle:'italic' },
  card:           { backgroundColor:'#fff', borderRadius:16, marginVertical:8, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:8, elevation:5, borderWidth:1, borderColor:'rgba(0,0,0,0.04)' },
  cardContent:    { padding:16 },
  cardHeader:     { flexDirection:'row', alignItems:'center', marginBottom:8 },
  cardIcon:       { marginRight:8 },
  cardText:       { fontSize:15, color:'#2D3436', flex:1, fontWeight:'600' },
  cardMetaRow:    { flexDirection:'row', alignItems:'center', marginTop:4 },
  cardMeta:       { fontSize:12, color:'#666', marginLeft:4, fontWeight:'500' },
  emptyContainer: { flex:1, justifyContent:'center', alignItems:'center', marginTop:40 },
  empty:          { textAlign:'center', color:'#fff', fontSize:16, opacity:0.8 },
  footer:         { position:'absolute', bottom:0, left:0, right:0, flexDirection:'row', padding:12, backgroundColor:'rgba(0,0,0,0.08)', alignItems:'flex-end' },
  input:          { flex:1, backgroundColor:'#fff', borderRadius:20, paddingHorizontal:16, paddingVertical:10, marginRight:8, maxHeight:100, fontSize:15 },
  sendBtn:        { backgroundColor:'#fff', borderRadius:20, justifyContent:'center', alignItems:'center', paddingHorizontal:16, height:40 },
});
