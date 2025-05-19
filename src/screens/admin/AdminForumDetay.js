// src/screens/admin/AdminForumDetay.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:3000';

export default function AdminForumDetay() {
  const route = useRoute();
  const navigation = useNavigation();
  const { forum, token } = route.params;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForumEntries();
  }, []);

  const fetchForumEntries = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/forum/detay/${forum.forumid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const entryList = response.data?.entries ?? response.data?.entryler ?? [];
      setEntries(entryList);
    } catch (err) {
      Alert.alert('Hata', 'Entryler getirilemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
  if (!entryId || isNaN(entryId)) {
    return Alert.alert('Hata', 'Geçersiz Entry ID');
  }

  Alert.alert('Entry Sil', 'Bu entry silinsin mi?', [
    { text: 'İptal', style: 'cancel' },
    {
      text: 'Sil',
      style: 'destructive',
      onPress: async () => {
        try {
          await axios.delete(`${BASE_URL}/api/admin/entry/${entryId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setEntries(prev => prev.filter(e => e.entryId !== entryId));
          Alert.alert('Başarılı', 'Entry başarıyla silindi.');
        } catch (err) {
          Alert.alert('Hata', err.response?.data?.message || err.message);
        }
      },
    },
  ]);
};

const renderEntryItem = ({ item }) => (
  <View style={styles.card}>
    <View style={{ flex: 1 }}>
      <Text style={styles.entryText}>{item.icerik || 'İçerik yok'}</Text>
      <Text style={styles.entryMeta}>Yazan: {item.kullaniciAdi || '-'}</Text>
      <Text style={styles.entryMeta}>
        Tarih: {item.olusturmaTarihi ? new Date(item.olusturmaTarihi).toLocaleDateString() : 'Bilinmiyor'}
      </Text>
      <Text style={styles.entryMeta}>Entry ID: {item.entryId ?? 'Yok'}</Text>
    </View>
    <TouchableOpacity onPress={() => handleDeleteEntry(item.entryId)} style={styles.deleteBtn}>
      <Icon name="trash-outline" size={20} color="#fff" />
    </TouchableOpacity>
  </View>
);


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forum: {forum.baslik}</Text>
      <Text style={styles.subtitle}>Entry listesi:</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#f75c5b" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item, index) => item.entryid?.toString() ?? index.toString()}
          renderItem={renderEntryItem}
          ListEmptyComponent={<Text style={styles.emptyText}>Bu foruma henüz entry yazılmamış.</Text>}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f75c5b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  entryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  entryMeta: {
    fontSize: 12,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
    color: '#888',
  },
  deleteBtn: {
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
