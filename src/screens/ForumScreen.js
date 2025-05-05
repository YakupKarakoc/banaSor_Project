// src/screens/ForumScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function ForumScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params || {};
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [forums, setForums]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      try {
        const fParams = {};
        if (universiteId) fParams.universiteId = universiteId;
        if (fakulteId)    fParams.fakulteId    = fakulteId;
        if (bolumId)      fParams.bolumId      = bolumId;
        const [fRes, qRes] = await Promise.all([
          axios.get(`${BASE}/api/forum/getir`, { params: fParams }),
          axios.get(`${BASE}/api/soru/getir`, { 
            params: {
              ...(universiteId ? { universiteId } : {}),
              ...(bolumId      ? { bolumId }      : {}),
            }
          })
        ]);
        if (!mounted) return;
        setForums(fRes.data);
        setQuestions(qRes.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Veriler yüklenemedi.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAll();
    return () => { mounted = false; };
  }, [universiteId, fakulteId, bolumId, isFocused]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const sections = [
    {
      key: 'forums',
      title: 'Forum Başlıkları',
      data: forums,
      addLabel: 'Yeni Forum',
      onAdd: () => navigation.navigate('NewForum', { universiteId, fakulteId, bolumId }),
      renderItem: ({ item }) => {
        const id = item.forumid ?? item.forumId;
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ForumDetail', { forumId: id })}
          >
            <Text style={styles.cardTitle}>{item.baslik}</Text>
          </TouchableOpacity>
        );
      },
    },
    {
      key: 'questions',
      title: 'Sorular',
      data: questions,
      addLabel: 'Yeni Soru',
      onAdd: () => navigation.navigate('NewQuestion', { universiteId, fakulteId, bolumId }),
      renderItem: ({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('QuestionDetail', { soruId: item.soruid })}
        >
          <Text style={styles.cardTitle}>Q: {item.icerik}</Text>
          <Text style={styles.cardMeta}>
            by {item.kullaniciadi} · {item.cevapsayisi} cevap
          </Text>
        </TouchableOpacity>
      ),
    },
  ];

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => (item.forumid ?? item.soruid ?? index).toString()}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <TouchableOpacity style={styles.newBtn} onPress={section.onAdd}>
              <Text style={styles.newBtnText}>+ {section.addLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
        renderItem={({ section, item }) => section.renderItem({ item })}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Henüz hiç içerik yok.</Text>
        }
        contentContainerStyle={{ padding: 16 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1 },
  loader:         { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  sectionHeader:  {
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center',
    marginTop: 16,
    marginBottom: 8
  },
  sectionTitle:   { color:'#fff', fontSize:18, fontWeight:'bold' },
  newBtn:         { backgroundColor:'#fff', paddingHorizontal:12, paddingVertical:6, borderRadius:6 },
  newBtnText:     { color:'#f75c5b', fontWeight:'600' },
  emptyText:      { color:'#fff', textAlign:'center', marginTop:20, opacity:0.8 },
  card:           { backgroundColor:'#fff', borderRadius:8, padding:12, marginBottom:10 },
  cardTitle:      { fontSize:16, fontWeight:'600', color:'#333' },
  cardMeta:       { fontSize:12, color:'#666', marginTop:4 },
});
