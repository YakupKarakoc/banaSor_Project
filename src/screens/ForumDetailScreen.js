// src/screens/ForumDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput,
  TouchableOpacity, ActivityIndicator,
  StyleSheet, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function ForumDetailScreen() {
  const { forumId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [entries, setEntries]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchEntries = () => {
    setLoading(true);
    axios.get(`${BASE}/api/forum/entryGetir`, { params: { forumId } })
      .then(res => setEntries(res.data))
      .catch(err => {
        console.error(err);
        Alert.alert('Hata','Entry’ler yüklenemedi');
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchEntries, [forumId, isFocused]);

  const submitEntry = () => {
    if (!newEntry.trim()) {
      return Alert.alert('Hata','Boş entry gönderemezsiniz');
    }
    setSubmitting(true);
    axios.post(`${BASE}/api/forum/entryEkle`, {
      forumId,
      icerik: newEntry.trim()
    })
    .then(() => {
      setNewEntry('');
      fetchEntries();           // hemen güncelle
    })
    .catch(err => {
      console.error(err);
      Alert.alert('Hata','Entry eklenemedi');
    })
    .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff"/>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <Text style={styles.title}>Forum Detay</Text>
      <FlatList
        data={entries}
        keyExtractor={e => e.entryid.toString()}
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <Text style={styles.entryAuthor}>{item.kullaniciadi}</Text>
            <Text style={styles.entryText}>{item.icerik}</Text>
            <Text style={styles.entryTime}>{new Date(item.olusturmatarihi).toLocaleString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Henüz entry yok.</Text>
          </View>
        }
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Yeni entry girin..."
          placeholderTextColor="#999"
          value={newEntry}
          onChangeText={setNewEntry}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={submitEntry}
          disabled={submitting}
        >
          {submitting 
            ? <ActivityIndicator color="#fff"/> 
            : <Text style={styles.sendBtnText}>Gönder</Text>
          }
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1, padding:16 },
  loader:         { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  title:          { fontSize:20, fontWeight:'bold', color:'#fff', textAlign:'center', marginBottom:12 },
  entryCard:      { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:10 },
  entryAuthor:    { fontWeight:'600', marginBottom:4 },
  entryText:      { marginBottom:6, color:'#333' },
  entryTime:      { fontSize:10, color:'#666', textAlign:'right' },
  empty:          { flex:1, justifyContent:'center', alignItems:'center', marginTop:20 },
  emptyText:      { color:'#fff', opacity:0.8 },
  inputContainer: { flexDirection:'row', alignItems:'center', marginTop:'auto', backgroundColor:'#fff', borderRadius:25, paddingHorizontal:12, paddingVertical:8 },
  input:          { flex:1, fontSize:16, color:'#333', height:40 },
  sendBtn:        { marginLeft:8, backgroundColor:'#f75c5b', paddingHorizontal:16, paddingVertical:8, borderRadius:20 },
  sendBtnText:    { color:'#fff', fontWeight:'600' },
});
