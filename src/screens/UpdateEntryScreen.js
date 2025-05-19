import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet, Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function UpdateEntryScreen() {
  const navigation = useNavigation();
  const { entryId, mevcutIcerik } = useRoute().params;
  const [icerik, setIcerik] = useState(mevcutIcerik || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!icerik.trim()) {
      return Alert.alert('Hata', 'Entry içeriği boş olamaz.');
    }
    setLoading(true);
    try {
      const token = await getToken();
      await axios.patch(`${BASE}/api/forum/entryGuncelle`, {
        entryId,
        yeniIcerik: icerik.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Başarılı', 'Entry güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', err.response?.data?.message || 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Entry Güncelle</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Yeni İçerik</Text>
        <TextInput
          style={styles.input}
          value={icerik}
          onChangeText={setIcerik}
          placeholder="Yeni entry içeriğini girin…"
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading
            ? <ActivityIndicator color="#f75c5b" />
            : <Text style={styles.btnTxt}>Güncelle</Text>
          }
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 48 },
  headerTxt: { color: '#fff', fontSize: 20, fontWeight: '700', marginLeft: 12 },

  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, margin: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#333', marginBottom: 20, minHeight: 60, textAlignVertical: 'top' },

  button: { backgroundColor: '#f75c5b', paddingVertical: 14, borderRadius: 25, alignItems: 'center' },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
