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
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import EntryReaction from '../../components/EntryReaction';  // <-- updated import

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function ForumDetailScreen() {
  const route      = useRoute();
  const navigation = useNavigation();
  const isFocused  = useIsFocused();
  const forumId    = route?.params?.forumId;

  const [forum,    setForum]    = useState(null);
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [posting,  setPosting]  = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim]= useState(new Animated.Value(40));

  useEffect(() => {
    if (!forumId) {
      Alert.alert(
        'Hata',
        'Forum bulunamadı. Ana sayfaya yönlendiriliyorsunuz.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
      return;
    }
    fetchDetail();
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:1, duration:700, useNativeDriver:true }),
      Animated.timing(slideAnim, { toValue:0, duration:700, useNativeDriver:true }),
    ]).start();
  }, [forumId, isFocused]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/forum/detay/${forumId}`);
      setForum(res.data);
      setEntries(res.data.entryler || []);
    } catch {
      Alert.alert('Hata', 'Forum detayları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.trim()) {
      return Alert.alert('Hata', 'Lütfen içerik girin.');
    }
    setPosting(true);
    try {
      await axios.post(`${BASE}/api/forum/entryEkle`, {
        forumId,
        icerik: newEntry.trim(),
      });
      setNewEntry('');
      fetchDetail();
    } catch {
      Alert.alert('Hata', 'Mesaj eklenemedi');
    } finally {
      setPosting(false);
    }
  };

  if (!forumId) {
    return (
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <Text style={styles.loadingText}>Forum ID iletilemedi.</Text>
        </View>
      </LinearGradient>
    );
  }

  if (loading || !forum) {
    return (
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Yükleniyor…</Text>
        </View>
      </LinearGradient>
    );
  }

  const owner = forum.olusturanKullaniciAdi ?? forum.olusturankullaniciadi;

  const renderItem = ({ item }) => {
    const id   = item.entryId ?? item.entryid;
    const like = Number(item.likeSayisi ?? item.likesayisi ?? 0);
    const dis  = Number(item.dislikeSayisi ?? item.dislikesayisi ?? 0);

    return (
      <Animated.View style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange:[0,1], outputRange:[0.97,1] }) }
          ]
        }
      ]}>
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Icon name="chatbubble-ellipses-outline" size={20} color="#f75c5b" style={styles.cardIcon}/>
            <Text style={styles.cardText}>{item.icerik}</Text>
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.userRow}>
              <Icon name="person-outline" size={14} color="#ff8a5c"/>
              <Text style={styles.user}>{item.kullaniciAdi ?? item.kullaniciadi}</Text>
            </View>
            <View style={styles.reactions}>
              <EntryReaction type="Like"    entryId={id} countInit={like} />
              <EntryReaction type="Dislike" entryId={id} countInit={dis}  />
            </View>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Icon name="chatbubbles-outline" size={28} color="#fff" style={styles.headerIcon}/>
          <Text style={styles.title}>{forum.baslik}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="person-outline" size={16} color="#fff"/>
          <Text style={styles.meta}>{owner}</Text>
          <Icon name="time-outline" size={16} color="#fff" style={{marginLeft:12}}/>
          <Text style={styles.meta}>
            {new Date(forum.olusturmaTarihi).toLocaleString('tr-TR')}
          </Text>
        </View>
        <Text style={styles.count}>Mesaj sayısı: {entries.length}</Text>
      </View>

      {/* Entry list */}
      {entries.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="chatbubble-ellipses-outline" size={40} color="#fff" style={{opacity:0.7,marginBottom:8}}/>
          <Text style={styles.emptyTxt}>Henüz mesaj yok.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => (e.entryId ?? e.entryid).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal:16, paddingBottom:30 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* New entry input */}
      <KeyboardAvoidingView
        style={styles.footer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
          style={styles.sendBtn}
          onPress={handleAddEntry}
          disabled={posting}
        >
          {posting
            ? <ActivityIndicator color="#f75c5b"/>
            : <Icon name="send" size={22} color="#f75c5b"/>}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 },
  loader:{ flex:1,justifyContent:'center',alignItems:'center' },
  loadingText:{ color:'#fff', marginTop:12, fontSize:16, opacity:0.8 },

  header:{ padding:20, paddingTop:48, borderBottomWidth:1, borderBottomColor:'rgba(255,255,255,0.2)' },
  headerRow:{ flexDirection:'row', alignItems:'center', marginBottom:8 },
  headerIcon:{ marginRight:10 },
  title:{ color:'#fff', fontSize:22, fontWeight:'700', flexShrink:1 },
  metaRow:{ flexDirection:'row', alignItems:'center' },
  meta:{ color:'#eee', fontSize:13, marginLeft:4, marginRight:12 },
  count:{ color:'#fff', marginTop:8, fontStyle:'italic' },

  empty:{ flex:1, justifyContent:'center', alignItems:'center', marginTop:40 },
  emptyTxt:{ color:'#fff', fontSize:16, opacity:0.8 },

  card:{ backgroundColor:'#fff', borderRadius:16, marginVertical:8,
         shadowColor:'#000', shadowOffset:{width:0,height:4},
         shadowOpacity:0.08, shadowRadius:8, elevation:5,
         borderWidth:1, borderColor:'rgba(0,0,0,0.04)' },
  cardContent:{ padding:16 },
  cardHeader:{ flexDirection:'row', alignItems:'center', marginBottom:6 },
  cardIcon:{ marginRight:8 },
  cardText:{ fontSize:15, color:'#2D3436', flex:1, fontWeight:'600' },
  cardFooter:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:6 },
  userRow:{ flexDirection:'row', alignItems:'center' },
  user:{ marginLeft:4, fontSize:12, color:'#555', fontWeight:'500' },
  reactions:{ flexDirection:'row', alignItems:'center' },

  footer:{ flexDirection:'row', padding:16, backgroundColor:'rgba(0,0,0,0.06)', alignItems:'flex-end' },
  input:{ flex:1, backgroundColor:'#fff', borderRadius:20, paddingHorizontal:16, paddingVertical:10,
          maxHeight:100, fontSize:15, marginRight:8 },
  sendBtn:{ backgroundColor:'#fff', borderRadius:20, paddingHorizontal:16, justifyContent:'center', alignItems:'center' },
});
