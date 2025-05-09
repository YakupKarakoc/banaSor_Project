// src/screens/FacultyForumScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert, ScrollView,
  Animated, Dimensions
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function FacultyForumScreen() {
  const { universiteId, fakulteId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [forums, setForums]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loadingF, setLoadingF]   = useState(true);
  const [loadingQ, setLoadingQ]   = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

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
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fakulteId, isFocused]);

  if (loadingF || loadingQ) {
    return (
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderForum = ({ item }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumId })}
      >
        <View style={styles.cardHeader}>
          <Icon name="chatbubbles-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>{item.baslik}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Icon name="person-outline" size={14} color="#ff8a5c" />
          <Text style={styles.cardMeta}>{item.olusturanKullaniciAdi}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuestion = ({ item }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('QuestionDetail', { soruId: item.soruId })}
      >
        <View style={styles.cardHeader}>
          <Icon name="help-circle-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>Q: {item.icerik}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Icon name="person-outline" size={14} color="#ff8a5c" />
          <Text style={styles.cardMeta}>{item.kullaniciAdi}</Text>
          <Icon name="chatbubble-ellipses-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }} />
          <Text style={styles.cardMeta}>{item.cevapSayisi} cevap</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Forum Başlıkları */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Icon name="chatbubbles-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Forum Başlıkları</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
            activeOpacity={0.85}
          >
            <Icon name="add-circle-outline" size={18} color="#f75c5b" style={{ marginRight: 4 }} />
            <Text style={styles.newBtnText}>Yeni Forum</Text>
          </TouchableOpacity>
        </View>
        {forums.length === 0
          ? <View style={styles.emptyContainer}>
              <Icon name="chatbubbles-outline" size={36} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
              <Text style={styles.emptyText}>Henüz forum yok.</Text>
            </View>
          : <FlatList
              data={forums}
              keyExtractor={f => f.forumId.toString()}
              renderItem={renderForum}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            />
        }

        {/* Sorular */}
        <View style={[styles.headerRow, { marginTop: 28 }]}> 
          <View style={styles.headerLeft}>
            <Icon name="help-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Sorular</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => navigation.navigate('NewQuestion', { universiteId, fakulteId })}
            activeOpacity={0.85}
          >
            <Icon name="add-circle-outline" size={18} color="#f75c5b" style={{ marginRight: 4 }} />
            <Text style={styles.newBtnText}>Yeni Soru</Text>
          </TouchableOpacity>
        </View>
        {questions.length === 0
          ? <View style={styles.emptyContainer}>
              <Icon name="help-circle-outline" size={36} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
              <Text style={styles.emptyText}>Henüz soru yok.</Text>
            </View>
          : <FlatList
              data={questions}
              keyExtractor={q => q.soruId.toString()}
              renderItem={renderQuestion}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.list}
            />
        }
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1 },
  loader:         { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText:    { color:'#fff', fontSize:16, marginTop:12, opacity:0.8 },
  headerRow:      { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginBottom:8 },
  headerLeft:     { flexDirection:'row', alignItems:'center' },
  sectionTitle:   { color:'#fff', fontSize:18, fontWeight:'bold', letterSpacing:0.3 },
  newBtn:         { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', paddingHorizontal:14, paddingVertical:8, borderRadius:20, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  newBtnText:     { color:'#f75c5b', fontWeight:'700', fontSize:14 },
  emptyContainer: { flex:1, alignItems:'center', marginVertical:12 },
  emptyText:      { color:'#fff', fontSize:14, textAlign:'center', opacity:0.8 },
  list:           { paddingBottom: 10 },
  card:           { backgroundColor:'#fff', borderRadius:16, marginVertical:8, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:8, elevation:5, borderWidth:1, borderColor:'rgba(0,0,0,0.04)' },
  cardContent:    { padding:16 },
  cardHeader:     { flexDirection:'row', alignItems:'center', marginBottom:8 },
  cardIcon:       { marginRight:8 },
  cardTitle:      { fontSize:15, fontWeight:'700', color:'#2D3436', flex:1 },
  cardMetaRow:    { flexDirection:'row', alignItems:'center', marginTop:2 },
  cardMeta:       { fontSize:12, color:'#666', marginLeft:4, fontWeight:'500' },
});
