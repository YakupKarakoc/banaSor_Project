import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:3000';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user: initialUser } = useRoute().params;

  const [ad, setAd] = useState(initialUser.ad);
  const [soyad, setSoyad] = useState(initialUser.soyad);
  const [kullaniciAdi, setKullaniciAdi] = useState(initialUser.kullaniciadi);
  const [sifre, setSifre] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animasyon için
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSave = async () => {
    if (!ad.trim() || !soyad.trim() || !kullaniciAdi.trim()) {
      return Alert.alert('Hata', 'Ad, soyad ve kullanıcı adı boş bırakılamaz.');
    }

    // Eğer değişiklik yapılmamışsa
    if (ad === initialUser.ad && soyad === initialUser.soyad && kullaniciAdi === initialUser.kullaniciadi && !sifre.trim()) {
      return Alert.alert("Uyarı", "Hiçbir değişiklik yapmadınız.");
    }

    setLoading(true);
    try {
      const body = { ad, soyad, kullaniciAdi };
      if (sifre.trim()) body.sifre = sifre;

      const res = await axios.put(`${BASE_URL}/api/profil/guncelle`, body);

      const updatedUser = {
        ...initialUser,
        ad: res.data.kullanici.ad,
        soyad: res.data.kullanici.soyad,
        kullaniciadi: res.data.kullanici.kullaniciadi,
      };

      Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.replace('Home', { user: updatedUser }) },
      ]);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.mesaj || 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, flex: 1 }}>
        <ScrollView contentContainerStyle={styles.inner}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{ad?.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{ad} {soyad}</Text>
          <Text style={styles.username}>@{kullaniciAdi}</Text>

          {!isEditing && (
            <View style={styles.infoCard}>
              <InfoRow label="Kullanıcı Türü:" value={initialUser.kullanicirolu} />
              <InfoRow label="Kayıt Tarihi:" value={new Date(initialUser.olusturmatarihi).toLocaleDateString()} />
              <InfoRow label="Durum:" value={initialUser.aktifmi ? "Aktif" : "Pasif"} badgeColor={initialUser.aktifmi ? '#4CAF50' : '#E53935'} />
              <InfoRow label="Doğrulama:" value={initialUser.onaylandimi ? "Doğrulandı" : "Beklemede"} badgeColor={initialUser.onaylandimi ? '#4CAF50' : '#FF9800'} />
              <InfoRow label="Puan:" value={initialUser.puan ?? 0} />
            </View>
          )}

          {isEditing && (
            <>
              <Text style={styles.label}>Ad</Text>
              <TextInput style={styles.input} value={ad} onChangeText={setAd} placeholder="Adınız" />

              <Text style={styles.label}>Soyad</Text>
              <TextInput style={styles.input} value={soyad} onChangeText={setSoyad} placeholder="Soyadınız" />

              <Text style={styles.label}>Kullanıcı Adı</Text>
              <TextInput style={styles.input} value={kullaniciAdi} onChangeText={setKullaniciAdi} placeholder="Kullanıcı Adınız" />

              <Text style={styles.label}>Yeni Şifre</Text>
              <TextInput style={styles.input} value={sifre} onChangeText={setSifre} placeholder="Yeni Şifre" secureTextEntry />
            </>
          )}

          <TouchableOpacity style={[styles.button, loading && { backgroundColor: '#ddd' }]} onPress={() => isEditing ? handleSave() : setIsEditing(true)}>
            <Text style={[styles.buttonText, loading && { color: '#999' }]}>
              {loading ? 'Kaydediliyor...' : isEditing ? 'Kaydet' : 'Düzenle'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const InfoRow = ({ label, value, badgeColor }) => (
  <View style={styles.row}>
    <Text style={styles.infoLabel}>{label}</Text>
    {badgeColor ? (
      <Text style={[styles.badge, { backgroundColor: badgeColor }]}>{value}</Text>
    ) : (
      <Text style={styles.infoValue}>{value}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, paddingTop: 60 },
  avatar: {
    backgroundColor: '#fff',
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 42, color: '#f75c5b', fontWeight: 'bold' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  username: { fontSize: 14, color: '#fff', opacity: 0.8, textAlign: 'center', marginBottom: 20 },
  infoCard: { backgroundColor: '#fff', padding: 20, borderRadius: 18, marginBottom: 20, elevation: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { color: '#999', fontSize: 14 },
  infoValue: { color: '#333', fontSize: 15, fontWeight: '600' },
  badge: { color: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, fontSize: 13, overflow: 'hidden' },
  label: { color: '#fff', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, height: 48, fontSize: 16 },
  button: { backgroundColor: '#fff', borderRadius: 30, paddingVertical: 14, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#f75c5b', fontWeight: '700', fontSize: 17 },
});