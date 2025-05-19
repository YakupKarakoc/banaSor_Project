// src/screens/admin/AdminSoruDetay.js

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
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:3000';

export default function AdminSoruDetay() {
  const route = useRoute();
  const { soru, token } = route.params;

  const [loading, setLoading] = useState(true);
  const [detay, setDetay] = useState(null);

  useEffect(() => {
    fetchSoruDetay();
  }, []);

  const fetchSoruDetay = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/soru/detay/${soru.soruid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetay(response.data);
    } catch (err) {
      Alert.alert('Hata', 'Soru detayları getirilemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCevap = async (cevapId) => {
    Alert.alert('Cevap Sil', 'Bu cevabı silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/admin/cevap/${cevapId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setDetay(prev => ({
              ...prev,
              cevaplar: prev.cevaplar.filter(c => c.cevapId !== cevapId),
            }));
            Alert.alert('Başarılı', 'Cevap başarıyla silindi.');
          } catch (err) {
            Alert.alert('Hata', err.response?.data?.message || err.message);
          }
        },
      },
    ]);
  };

  const renderCevap = ({ item }) => (
    <View style={styles.cevapCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cevapText}>{item.icerik}</Text>
        <Text style={styles.cevapMeta}>Yazan: {item.cevaplayanKullaniciAdi}</Text>
        <Text style={styles.cevapMeta}>Tarih: {new Date(item.olusturmaTarihi).toLocaleDateString()}</Text>
        <Text style={styles.cevapMeta}>Cevap ID: {item.cevapId}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteCevap(item.cevapId)} style={styles.deleteBtn}>
        <Icon name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Soru Detayı</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#f75c5b" style={{ marginTop: 20 }} />
      ) : detay ? (
        <View>
          <Text style={styles.questionText}>{detay.icerik}</Text>
          <Text style={styles.meta}>Soran: {detay.soranKullaniciAdi}</Text>
          <Text style={styles.meta}>Konu: {detay.konu}</Text>
          <Text style={styles.meta}>Bölüm: {detay.bolum}</Text>
          <Text style={styles.meta}>Tarih: {new Date(detay.olusturmaTarihi).toLocaleDateString()}</Text>

          <Text style={[styles.title, { marginTop: 20 }]}>Cevaplar:</Text>
          <FlatList
            data={detay.cevaplar}
            renderItem={renderCevap}
            keyExtractor={(item, index) => item.cevapId?.toString() ?? index.toString()}
            ListEmptyComponent={<Text style={styles.meta}>Cevap bulunamadı.</Text>}
          />
        </View>
      ) : (
        <Text style={styles.meta}>Soru detayı yüklenemedi.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#f75c5b', marginBottom: 10 },
  questionText: { fontSize: 16, fontWeight: '500', marginBottom: 5, color: '#333' },
  meta: { fontSize: 13, color: '#555', marginBottom: 4 },
  cevapCard: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cevapText: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 4 },
  cevapMeta: { fontSize: 12, color: '#666' },
  deleteBtn: {
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
