import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const GeriBildirimler = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('http://10.0.2.2:3000/api/admin/geribildirimler') // ❗️Backend geri bildirim endpoint
      .then((res) => setFeedbacks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Geri Bildirimler</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          feedbacks.map((feedback) => (
            <View key={feedback.geriBildirimId} style={styles.card}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color="#f75c5b" />
              <View style={styles.info}>
                <Text style={styles.content}>{feedback.icerik}</Text>
                <Text style={styles.subText}>Gönderen: {feedback.kullaniciAdi || 'Anonim'}</Text>
                <Text style={styles.subText}>Tarih: {new Date(feedback.olusturmaTarihi).toLocaleDateString()}</Text>

                {/* Okundu / Okunmadı */}
                <View style={styles.statusRow}>
                  <Text style={[
                    styles.status,
                    { backgroundColor: feedback.okunduMu ? '#4CAF50' : '#E53935' }
                  ]}>
                    {feedback.okunduMu ? 'Okundu' : 'Okunmadı'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default GeriBildirimler;

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
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
    elevation: 3,
  },
  info: {
    marginLeft: 12,
    flex: 1,
  },
  content: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 6,
  },
  subText: {
    fontSize: 12,
    color: '#777',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 6,
  },
  status: {
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    fontSize: 12,
    overflow: 'hidden',
  },
});