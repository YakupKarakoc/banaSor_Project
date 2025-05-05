// src/screens/ForumDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
  StyleSheet, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useIsFocused } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function ForumDetailScreen() {
  const { forumId } = useRoute().params;
  const isFocused   = useIsFocused();

  const [forum,    setForum]    = useState(null);
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [posting,  setPosting]  = useState(false);

  const fetchDetail = () => {
    setLoading(true);
    axios.get(`${BASE}/api/forum/detay/${forumId}`)
      .then(res => {
        setForum(res.data);
        setEntries(res.data.entryler || []);
      })
      .catch(err => {
        console.error(err);
        Alert.alert('Hata', 'Forum detayları yüklenemedi');
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchDetail, [forumId, isFocused]);

  const handleAddEntry = () => {
    if (!newEntry.trim()) {
      return Alert.alert('Hata', 'Lütfen içerik girin.');
    }
    setPosting(true);
    axios.post(`${BASE}/api/forum/entryEkle`, {
      forumId,
      icerik: newEntry.trim(),
    })
    .then(() => {
      setNewEntry('');
      fetchDetail();
    })
    .catch(err => {
      console.error(err);
      Alert.alert('Hata', 'Mesaj eklenemedi');
    })
    .finally(() => setPosting(false));
  };

  if (loading || !forum) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff"/>
      </View>
    );
  }

  const owner = forum.olusturanKullaniciAdi ?? forum.olusturankullaniciadi;

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{forum.baslik}</Text>
        <Text style={styles.meta}>
          Oluşturan: {owner} •{' '}
          {new Date(forum.olusturmaTarihi).toLocaleString('tr-TR')}
        </Text>
        <Text style={styles.count}>Mesaj sayısı: {forum.entrySayisi ?? 0}</Text>
      </View>

      {entries.length===0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Henüz mesaj yok.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => (e.entryId ?? e.entryid).toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardText}>{item.icerik}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardUser}>— {item.kullaniciAdi ?? item.kullaniciadi}</Text>
                <View style={styles.reactions}>
                  <Text style={styles.reaction}>👍{item.likeSayisi}</Text>
                  <Text style={styles.reaction}>👎{item.dislikeSayisi}</Text>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      )}

      <KeyboardAvoidingView
        style={styles.footer}
        behavior={Platform.OS==='ios'?'padding':'height'}
      >
        <TextInput
          style={styles.input}
          placeholder="Yeni mesajınızı yazın…"
          placeholderTextColor="#aaa"
          value={newEntry}
          onChangeText={setNewEntry}
          multiline
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
  container: { flex:1 },
  loader:    { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  header:    { padding:16, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.5)' },
  title:     { color:'#fff', fontSize:20, fontWeight:'bold' },
  meta:      { color:'#ddd', fontSize:12, marginTop:4 },
  count:     { color:'#fff', fontSize:14, marginTop:8 },
  empty:     { flex:1, justifyContent:'center', alignItems:'center' },
  emptyText: { color:'#fff', opacity:0.8 },
  card:      { backgroundColor:'#fff', borderRadius:8, padding:12, marginVertical:6, marginHorizontal:16 },
  cardText:  { fontSize:16, color:'#333' },
  cardFooter:{ flexDirection:'row', justifyContent:'space-between', marginTop:8 },
  cardUser:  { fontSize:12, color:'#555' },
  reactions:{ flexDirection:'row' },
  reaction: { marginLeft:12, fontSize:12, color:'#555' },
  footer:    { flexDirection:'row', padding:16, backgroundColor:'rgba(0,0,0,0.05)' },
  input:     { flex:1, backgroundColor:'#fff', borderRadius:20, paddingHorizontal:16, height:44 },
  btn:       { marginLeft:8, backgroundColor:'#fff', borderRadius:20, justifyContent:'center', paddingHorizontal:16 },
  btnText:   { color:'#f75c5b', fontWeight:'600' },
});
