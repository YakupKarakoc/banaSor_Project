// src/screens/FacultyForumScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function FacultyForumScreen() {
  const { universiteId, fakulteId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [forums, setForums]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingF, setLoadingF]   = useState(true);
  const [loadingQ, setLoadingQ]   = useState(true);

  // Fakülte bazlı forumları çek
  useEffect(() => {
    async function loadForums() {
      setLoadingF(true);
      try {
        const res = await axios.get(`${BASE}/api/forum/getir/fakulte`, {
          params: { fakulteId }
        });
        setForums(res.data);
      } catch (e) {
        console.error(e);
        Alert.alert('Hata', 'Forumlar yüklenemedi');
      } finally {
        setLoadingF(false);
      }
    }
    loadForums();
  }, [fakulteId, isFocused]);

  // Fakülte bazlı soruları çek
  useEffect(() => {
    async function loadQuestions() {
      setLoadingQ(true);
      try {
        const res = await axios.get(`${BASE}/api/soru/getir/fakulte`, {
          params: { fakulteId }
        });
        setQuestions(res.data);
      } catch (e) {
        console.error(e);
        Alert.alert('Hata', 'Sorular yüklenemedi');
      } finally {
        setLoadingQ(false);
      }
    }
    loadQuestions();
  }, [fakulteId, isFocused]);

  if (loadingF || loadingQ) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const renderForum = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumId })}
    >
      <Text style={styles.cardTitle}>{item.baslik}</Text>
      <Text style={styles.cardMeta}>by {item.olusturanKullaniciAdi}</Text>
    </TouchableOpacity>
  );

  const renderQuestion = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('QuestionDetail', { soruId: item.soruId })}
    >
      <Text style={styles.cardTitle}>Q: {item.icerik}</Text>
      <Text style={styles.cardMeta}>
        by {item.kullaniciAdi} · {item.cevapSayisi} cevap
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Forum Başlıkları */}
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Forum Başlıkları</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
          >
            <Text style={styles.newBtnText}>+ Yeni Forum</Text>
          </TouchableOpacity>
        </View>
        {forums.length === 0
          ? <Text style={styles.emptyText}>Henüz forum yok.</Text>
          : <FlatList
              data={forums}
              keyExtractor={f => f.forumId.toString()}
              renderItem={renderForum}
              scrollEnabled={false}
            />
        }

        {/* Sorular */}
        <View style={[styles.headerRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Sorular</Text>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('NewQuestion', { universiteId, fakulteId })}
          >
            <Text style={styles.newBtnText}>+ Yeni Soru</Text>
          </TouchableOpacity>
        </View>
        {questions.length === 0
          ? <Text style={styles.emptyText}>Henüz soru yok.</Text>
          : <FlatList
              data={questions}
              keyExtractor={q => q.soruId.toString()}
              renderItem={renderQuestion}
              scrollEnabled={false}
            />
        }
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1 },
  loader:         { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  headerRow:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  sectionTitle:   { color:'#fff', fontSize:18, fontWeight:'bold' },
  newBtn:         { backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:6, borderRadius:6 },
  newBtnText:     { color:'#f75c5b', fontWeight:'600' },
  emptyText:      { color:'#fff', fontSize:14, textAlign:'center', marginVertical:12, opacity:0.8 },
  card:           { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:10 },
  cardTitle:      { fontSize:16, fontWeight:'600', color:'#333' },
  cardMeta:       { fontSize:12, color:'#666', marginTop:4 },
});
