// src/screens/ForumScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function ForumScreen() {
  const { universiteId, fakulteId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [forums, setForums]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = { universiteId };
        if (fakulteId) params.fakulteId = fakulteId;
        const res = await axios.get(`${BASE}/api/forum/getir`, { params });
        setForums(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Forumlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [universiteId, fakulteId, isFocused]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      {/* Header & Yeni Forum Butonu */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Forum Başlıkları</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
        >
          <Text style={styles.btnText}>+ Yeni Forum</Text>
        </TouchableOpacity>
      </View>

      {/* Forum Listesi */}
      {forums.length === 0 ? (
        <Text style={styles.emptyText}>Henüz forum başlığı yok.</Text>
      ) : (
        <FlatList
          data={forums}
          keyExtractor={item => String(item.forumid)}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumid })}
            >
              <Text style={styles.cardTitle}>{item.baslik}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, padding:16 },
  loader:       { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  headerRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:12 },
  title:        { color:'#fff', fontSize:20, fontWeight:'bold' },
  btn:          { backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:6, borderRadius:6 },
  btnText:      { color:'#f75c5b', fontWeight:'600' },
  emptyText:    { color:'#fff', textAlign:'center', marginTop:20, opacity:0.8 },
  card:         { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:10 },
  cardTitle:    { fontSize:16, fontWeight:'600', color:'#333' },
});
