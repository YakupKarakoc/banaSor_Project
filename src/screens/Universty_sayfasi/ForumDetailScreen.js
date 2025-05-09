// src/screens/ForumDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
  StyleSheet, KeyboardAvoidingView, Platform,
  Animated, Dimensions
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function ForumDetailScreen() {
  const { forumId } = useRoute().params;
  const isFocused   = useIsFocused();

  const [forum,    setForum]    = useState(null);
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [posting,  setPosting]  = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

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

  useEffect(() => { fetchDetail(); startAnimations(); }, [forumId, isFocused]);

  const startAnimations = () => {
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
  };

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
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  const owner = forum.olusturanKullaniciAdi ?? forum.olusturankullaniciadi;

  const renderItem = ({ item }) => (
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
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Icon name="chatbubble-ellipses-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardText}>{item.icerik}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={styles.cardUserRow}>
            <Icon name="person-outline" size={14} color="#ff8a5c" />
            <Text style={styles.cardUser}>{item.kullaniciAdi ?? item.kullaniciadi}</Text>
          </View>
          <View style={styles.reactions}>
            <Icon name="thumbs-up-outline" size={16} color="#ff8a5c" />
            <Text style={styles.reaction}>{item.likeSayisi}</Text>
            <Icon name="thumbs-down-outline" size={16} color="#ff8a5c" style={{ marginLeft: 8 }} />
            <Text style={styles.reaction}>{item.dislikeSayisi}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIconRow}>
          <Icon name="chatbubbles-outline" size={28} color="#fff" style={styles.headerIcon} />
          <Text style={styles.title}>{forum.baslik}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="person-outline" size={16} color="#fff" style={styles.metaIcon} />
          <Text style={styles.meta}>{owner}</Text>
          <Icon name="time-outline" size={16} color="#fff" style={[styles.metaIcon, { marginLeft: 12 }]} />
          <Text style={styles.meta}>{new Date(forum.olusturmaTarihi).toLocaleString('tr-TR')}</Text>
        </View>
        <Text style={styles.count}>Mesaj sayısı: {forum.entrySayisi ?? 0}</Text>
      </View>

      {entries.length===0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chatbubble-ellipses-outline" size={40} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
          <Text style={styles.emptyText}>Henüz mesaj yok.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => (e.entryId ?? e.entryid).toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
          activeOpacity={0.8}
        >
          {posting
            ? <ActivityIndicator color="#f75c5b" />
            : <Icon name="send" size={22} color="#f75c5b" />}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  loader:    { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText:{ color:'#fff', fontSize:16, marginTop:12, opacity:0.8 },
  header:    { padding:20, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.2)', paddingTop:48 },
  headerIconRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  headerIcon: { marginRight:10 },
  title:     { color:'#fff', fontSize:22, fontWeight:'700', flex:1, letterSpacing:0.5 },
  metaRow:   { flexDirection:'row', alignItems:'center', marginBottom:4 },
  metaIcon:  { marginRight:4 },
  meta:      { color:'#eee', fontSize:13, marginRight:8, fontWeight:'500' },
  count:     { color:'#fff', fontSize:14, marginTop:8, fontStyle:'italic' },
  emptyContainer:{ flex:1, justifyContent:'center', alignItems:'center', marginTop:40 },
  emptyText: { color:'#fff', opacity:0.8, fontSize:16 },
  listContent:{ paddingHorizontal:16, paddingBottom:30 },
  card:      { backgroundColor:'#fff', borderRadius:16, marginVertical:8, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:8, elevation:5, borderWidth:1, borderColor:'rgba(0,0,0,0.04)' },
  cardContent:{ padding:16 },
  cardHeader:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  cardIcon:  { marginRight:8 },
  cardText:  { fontSize:15, color:'#2D3436', flex:1, fontWeight:'600' },
  cardFooter:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:8 },
  cardUserRow:{ flexDirection:'row', alignItems:'center' },
  cardUser:  { fontSize:12, color:'#555', marginLeft:4, fontWeight:'500' },
  reactions: { flexDirection:'row', alignItems:'center' },
  reaction:  { marginLeft:4, fontSize:13, color:'#ff8a5c', fontWeight:'600' },
  footer:    { flexDirection:'row', padding:16, backgroundColor:'rgba(0,0,0,0.05)', alignItems:'flex-end' },
  input:     { flex:1, backgroundColor:'#fff', borderRadius:20, paddingHorizontal:16, paddingVertical:10, marginRight:8, maxHeight:100, fontSize:15 },
  btn:       { backgroundColor:'#fff', borderRadius:20, justifyContent:'center', alignItems:'center', paddingHorizontal:16, height:40 },
});
