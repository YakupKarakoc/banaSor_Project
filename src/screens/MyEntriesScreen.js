import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Alert, Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function MyEntriesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // Animasyon
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  // Entryleri çek
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BASE}/api/profil/entrylerim`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Entryleriniz getirilemedi');
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  };

  useEffect(() => {
    if (isFocused) fetchEntries();
  }, [isFocused]);

  // Entry sil
  const handleDelete = (entryId) => {
    Alert.alert(
      'Onay',
      'Bu entry\'yi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${BASE}/api/forum/entrySil`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { entryId:entryid }  // Body içinde gönderiyoruz!
              });
              Alert.alert('Başarılı', 'Entry silindi.');
              fetchEntries();
            } catch (e) {
              console.error(e);
              Alert.alert('Hata', e.response?.data?.message || 'Silme başarısız');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[
      styles.card,
      { opacity: fade, transform: [{ translateY: slide }] }
    ]}>
      <View style={styles.cardInner}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('UpdateEntry', {
            entryId: item.entryId,
            mevcutIcerik: item.icerik
          })}
        >
          <View style={styles.row}>
            <Ion name="document-text-outline" size={20} color="#f75c5b" style={{ marginRight: 8 }} />
            <Text style={styles.title} numberOfLines={2}>{item.icerik}</Text>
          </View>
          <View style={[styles.row, { marginTop: 6 }]}>
            <Ion name="chatbubbles-outline" size={14} color="#ff8a5c" />
            <Text style={styles.meta}>{item.forumBaslik}</Text>
            <Ion name="thumbs-up-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }} />
            <Text style={styles.meta}>{item.likeSayisi} beğeni</Text>
            <Ion name="thumbs-down-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }} />
            <Text style={styles.meta}>{item.dislikeSayisi} dislike</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('UpdateEntry', {
              entryId: item.entryId,
              mevcutIcerik: item.icerik
            })}
          >
            <Ion name="pencil-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Güncelle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#e84118' }]}
            onPress={() => handleDelete(item.entryId)}
          >
            <Ion name="trash-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Sil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.flex}>
      <View style={styles.header}>
        <Ion name="list-circle-outline" size={26} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTxt}>Entrylerim</Text>
      </View>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.centerTxt}>Yükleniyor…</Text>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Ion name="document-text-outline" size={48} color="#fff" style={{ opacity: 0.7, marginBottom: 6 }} />
          <Text style={styles.centerTxt}>Henüz bir entry'niz yok.</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => (e.entryId ?? Math.random()).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 48 },
  headerTxt: { fontSize: 22, fontWeight: '700', color: '#fff' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)'
  },
  cardInner: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700', color: '#2D3436', flex: 1 },
  meta: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500' },

  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#487eb0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8
  },
  actionText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600'
  },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centerTxt: { color: '#fff', fontSize: 15, opacity: 0.85, textAlign: 'center' },
});
