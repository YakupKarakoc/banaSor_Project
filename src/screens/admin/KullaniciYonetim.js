import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const KullaniciYonetim = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('http://10.0.2.2:3000/api/admin/users') // ❗️Buraya backend'deki kullanıcı listeleme endpointi gelecek
      .then((res) => setUsers(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Kullanıcı Yönetimi</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          users.map((user) => (
            <View key={user.kullaniciid} style={styles.card}>
              <Ionicons name="person-circle-outline" size={40} color="#f75c5b" />
              <View style={styles.info}>
                <Text style={styles.name}>{user.ad} {user.soyad}</Text>
                <Text style={styles.email}>@{user.kullaniciadi} - {user.email}</Text>
                <View style={styles.statusRow}>
                  <Text style={[styles.status, { backgroundColor: user.aktifmi ? '#4CAF50' : '#E53935' }]}>
                    {user.aktifmi ? 'Aktif' : 'Pasif'}
                  </Text>
                  <Text style={styles.role}>{user.kullanicirolu}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default KullaniciYonetim;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, paddingTop: 50 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    elevation: 3,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  email: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  status: {
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
    marginRight: 8,
  },
  role: {
    fontSize: 12,
    color: '#333',
  },
});