// src/screens/ForumDetailScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function ForumDetailScreen() {
  const { forumId } = useRoute().params;
  const [forum, setForum] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [posting, setPosting] = useState(false);

  // 1) Forum + entry’leri çek
  const fetchForum = () => {
    setLoading(true);
    axios
      .get(`${BASE}/api/forum/detay/${forumId}`)
      .then(({ data }) => {
        setForum(data);
        setEntries(data.entryler);
      })
      .catch(() => Alert.alert('Hata', 'Forum detayları yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchForum, [forumId]);

  // 2) Yeni entry ekle
  const handleAddEntry = () => {
    if (!newEntry.trim()) {
      return Alert.alert('Hata', 'Lütfen bir içerik girin.');
    }
    setPosting(true);
    axios
      .post(`${BASE}/api/forum/entryEkle`, {
        forumId,
        icerik: newEntry.trim(),
      })
      .then(() => {
        setNewEntry('');
        fetchForum(); // listeyi güncelle
      })
      .catch(() => Alert.alert('Hata', 'Entry eklenemedi'))
      .finally(() => setPosting(false));
  };

  if (loading || !forum) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      {/* Forum Başlığı ve Meta */}
      <View style={styles.header}>
        <Text style={styles.title}>{forum.baslik}</Text>
        <Text style={styles.meta}>
          {forum.universite} · Oluşturan: {forum.olusturanKullaniciAdi}
        </Text>
        <Text style={styles.metaSmall}>
          {new Date(forum.olusturmaTarihi).toLocaleString('tr-TR')}
        </Text>
        <Text style={styles.count}>
          Entry sayısı: {forum.entrySayisi}
        </Text>
      </View>

      {/* Entry Listesi */}
      <FlatList
        data={entries}
        keyExtractor={e => e.entryId.toString()}
        ListEmptyComponent={
          <Text style={styles.empty}>Henüz entry yok. İlki siz ekleyin!</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>{item.icerik}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.metaSmall}>
                — {item.kullaniciAdi} ·{' '}
                {new Date(item.olusturmaTarihi).toLocaleString('tr-TR')}
              </Text>
              <View style={styles.reactions}>
                <Text style={styles.reaction}>👍 {item.likeSayisi}</Text>
                <Text style={styles.reaction}>👎 {item.dislikeSayisi}</Text>
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 16 }}
      />

      {/* Yeni Entry Gönder */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.footer}
      >
        <TextInput
          style={styles.input}
          placeholder="Yeni entry yazın…"
          placeholderTextColor="#aaa"
          value={newEntry}
          onChangeText={setNewEntry}
        />
        <TouchableOpacity
          style={styles.btn}
          onPress={handleAddEntry}
          disabled={posting}
        >
          <Text style={styles.btnText}>
            {posting ? 'Gönderiliyor…' : 'Gönder'}
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader:    { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f75c5b' },
  header:    { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.5)' },
  title:     { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  meta:      { color: '#fff', fontSize: 14, marginTop: 4 },
  metaSmall: { color: '#ddd', fontSize: 12, marginTop: 2 },
  count:     { color: '#fff', fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  card:      { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginVertical: 6 },
  cardText:  { fontSize: 16, color: '#333' },
  cardFooter:{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  reactions:{ flexDirection: 'row' },
  reaction: { marginLeft: 12, fontSize: 14, color: '#555' },
  empty:     { textAlign: 'center', color: '#fff', marginTop: 20 },
  footer:    { flexDirection: 'row', padding: 16, backgroundColor: 'rgba(0,0,0,0.05)' },
  input:     { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, height: 44 },
  btn:       { marginLeft: 8, backgroundColor: '#fff', borderRadius: 20, justifyContent: 'center', paddingHorizontal: 16 },
  btnText:   { color: '#f75c5b', fontWeight: '600' },
});
