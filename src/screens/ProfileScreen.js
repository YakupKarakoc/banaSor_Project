// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:3000';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user: initialUser } = useRoute().params; // user param
  const [ad, setAd] = useState(initialUser.ad);
  const [soyad, setSoyad] = useState(initialUser.soyad);
  const [kullaniciAdi, setKullaniciAdi] = useState(initialUser.kullaniciadi);
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!ad.trim() || !soyad.trim() || !kullaniciAdi.trim()) {
      return Alert.alert('Hata', 'Ad, soyad ve kullanıcı adı boş bırakılamaz.');
    }

    setLoading(true);
    try {
      const body = {
        ad: ad.trim(),
        soyad: soyad.trim(),
        kullaniciAdi: kullaniciAdi.trim(),
      };
      if (sifre.trim()) {
        body.sifre = sifre;
      }

      const res = await axios.put(
        `${BASE_URL}/api/profil/guncelle`,
        body
      );

      const updatedUser = {
        ...initialUser,
        ad: res.data.kullanici.ad,
        soyad: res.data.kullanici.soyad,
        kullaniciadi: res.data.kullanici.kullaniciadi,
      };

      Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
        {
          text: 'Tamam',
          onPress: () => {
            // Home'a updatedUser ile dön
            navigation.replace('Home', { user: updatedUser });
          },
        },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', e.response?.data?.mesaj || 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loader]}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Profilimi Güncelle</Text>

        <Text style={styles.label}>Ad</Text>
        <TextInput
          style={styles.input}
          value={ad}
          onChangeText={setAd}
          placeholder="Adınız"
        />

        <Text style={styles.label}>Soyad</Text>
        <TextInput
          style={styles.input}
          value={soyad}
          onChangeText={setSoyad}
          placeholder="Soyadınız"
        />

        <Text style={styles.label}>Kullanıcı Adı</Text>
        <TextInput
          style={styles.input}
          value={kullaniciAdi}
          onChangeText={setKullaniciAdi}
          placeholder="Kullanıcı Adınız"
        />

        <Text style={styles.label}>Yeni Şifre (opsiyonel)</Text>
        <TextInput
          style={styles.input}
          value={sifre}
          onChangeText={setSifre}
          placeholder="Şifre"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Güncellemeyi Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ff8a5c' },
  inner: { padding: 20, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 30 },
  label: { color: '#fff', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#f75c5b', fontWeight: '600', fontSize: 16 },
});
