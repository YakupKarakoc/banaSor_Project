// src/screens/ProfileScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';

// 🧠 Yardımcı fonksiyon: Kullanıcı rolünü ID'ye göre çözümle
const getUserRoleName = (roleId) => {
  const roles = {
    1: 'Aday Öğrenci',
    2: 'Üniversite Öğrencisi',
    3: 'Mezun Öğrenci',
    4: 'Admin',
    5: 'SuperUser',
  };
  return roles[roleId] || 'Bilinmeyen Rol';
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const user = route.params?.user || { ad: 'Kullanıcı', soyad: '', email: '—' };

  const calculateTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    return months > 12
      ? `${Math.floor(months / 12)} yıldır`
      : `${months} aydır`;
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Profilim</Text>

        <View style={styles.infoBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.ad?.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{user.ad} {user.soyad}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ad</Text>
          <Text style={styles.value}>{user.ad}</Text>

          <Text style={styles.label}>Soyad</Text>
          <Text style={styles.value}>{user.soyad}</Text>

          <Text style={styles.label}>E‑posta</Text>
          <Text style={styles.value}>{user.email}</Text>

          <Text style={styles.label}>Kullanıcı Adı</Text>
          <Text style={styles.value}>{user.kullaniciadi}</Text>

          <Text style={styles.label}>Puan</Text>
          <Text style={styles.value}>{user.puan}</Text>

          <Text style={styles.label}>Kayıt Tarihi</Text>
          <Text style={styles.value}>
            {new Date(user.olusturmatarihi).toLocaleDateString('tr-TR', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
          </Text>

          <Text style={styles.label}>Üyelik Süresi</Text>
          <Text style={styles.value}>{calculateTimeAgo(user.olusturmatarihi)}</Text>

          <Text style={styles.label}>Hesap Durumu</Text>
          <Text style={styles.value}>{user.aktifmi ? 'Aktif' : 'Pasif'}</Text>

          <Text style={styles.label}>Doğrulama Durumu</Text>
          <Text style={styles.value}>{user.onaylandimi ? 'Doğrulandı' : 'Beklemede'}</Text>

          <Text style={styles.label}>Kullanıcı Rolü</Text>
          <Text style={styles.value}>{getUserRoleName(user.kullanicituruid)}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>← Geri Dön</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 20, paddingTop: 60 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoBox: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    backgroundColor: '#fff',
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 28,
    color: '#f75c5b',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  email: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 14,
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#f75c5b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
