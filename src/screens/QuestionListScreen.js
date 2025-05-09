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
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function QuestionListScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params || {};
  const navigation = useNavigation();
  const isFocused  = useIsFocused();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        let endpoint = '/api/soru/getir';
        const params = {};

        if (fakulteId) {
          endpoint = '/api/soru/getir/fakulte';
          params.fakulteId = fakulteId;
        } else if (bolumId) {
          endpoint = '/api/soru/getir/bolum';
          params.bolumId = bolumId;
        } else if (universiteId) {
          endpoint = '/api/soru/getir/universite';
          params.universiteId = universiteId;
        }

        const res = await axios.get(`${BASE}${endpoint}`, { params });
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Sorular yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [universiteId, fakulteId, bolumId, isFocused]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('QuestionDetail', { soruId: item.soruid })
      }
    >
      <Text style={styles.cardTitle}>Q: {item.icerik}</Text>
      <Text style={styles.cardMeta}>
        by {item.kullaniciadi} · {item.cevapsayisi} cevap
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Sorular</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() =>
            navigation.navigate('NewQuestion', { universiteId, fakulteId, bolumId })
          }
        >
          <Text style={styles.newBtnText}>+ Yeni Soru</Text>
        </TouchableOpacity>
      </View>

      {questions.length === 0 ? (
        <Text style={styles.emptyText}>Henüz soru yok.</Text>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => item.soruid.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  loader:      { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f75c5b' },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title:       { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  newBtn:      { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  newBtnText:  { color: '#f75c5b', fontWeight: '600' },
  emptyText:   { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20, opacity: 0.8 },
  list:        { paddingHorizontal: 16, paddingBottom: 30 },
  card:        { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginVertical: 6 },
  cardTitle:   { fontSize: 16, fontWeight: '600', color: '#333' },
  cardMeta:    { fontSize: 12, color: '#666', marginTop: 4 },
});
