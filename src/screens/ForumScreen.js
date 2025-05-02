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
  const { universiteId, fakulteId, bolumId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [forums, setForums]     = useState([]);
  const [loading, setLoading]   = useState(true);

  // 1) Listeyi çek
  const fetchForums = () => {
    setLoading(true);
    const params = {};
    if (universiteId) params.universiteId = universiteId;
    if (fakulteId)    params.fakulteId    = fakulteId;
    if (bolumId)      params.bolumId      = bolumId;

    axios.get(`${BASE}/api/forum/getir`, { params })
      .then(res => setForums(res.data))
      .catch(err => {
        console.error(err);
        Alert.alert('Hata', 'Forumlar yüklenemedi');
      })
      .finally(() => setLoading(false));
  };

  useEffect(fetchForums, [universiteId, fakulteId, bolumId, isFocused]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff"/>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Forum</Text>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() =>
            navigation.navigate('NewForum', { universiteId, fakulteId, bolumId })
          }
        >
          <Text style={styles.newBtnText}>+ Yeni Forum</Text>
        </TouchableOpacity>
      </View>

      {forums.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Henüz forum yok.</Text>
        </View>
      ) : (
        <FlatList
          data={forums}
          keyExtractor={f => f.forumid.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate('ForumDetail', { forumId: item.forumid })
              }
            >
              <Text style={styles.cardTitle}>{item.baslik}</Text>
              <Text style={styles.cardMeta}>Oluşturan: {item.olusturanadi}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, padding:16 },
  loader:      { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  header:      { flexDirection:'row', justifyContent:'space-between', marginBottom:12 },
  title:       { color:'#fff', fontSize:22, fontWeight:'bold' },
  newBtn:      { backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:6, borderRadius:6 },
  newBtnText:  { color:'#f75c5b', fontWeight:'600' },
  empty:       { flex:1, justifyContent:'center', alignItems:'center' },
  emptyText:   { color:'#fff', fontSize:16, opacity:0.8 },
  card:        { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:10 },
  cardTitle:   { fontSize:16, fontWeight:'600', marginBottom:4, color:'#333' },
  cardMeta:    { fontSize:12, color:'#666' },
});
