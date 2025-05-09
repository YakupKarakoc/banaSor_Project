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

const SoruYonetim = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get('http://10.0.2.2:3000/api/admin/sorular') // ❗️Backend sorular endpoint
      .then((res) => setQuestions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Soru Yönetimi</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          questions.map((question) => (
            <View key={question.soruId} style={styles.card}>
              <Ionicons name="help-circle-outline" size={40} color="#f75c5b" />
              <View style={styles.info}>
                <Text style={styles.content}>{question.icerik}</Text>
                <Text style={styles.subText}>Soran: {question.soranKullaniciAdi ?? '-'}</Text>
                <Text style={styles.subText}>Üniversite: {question.universiteAd ?? '-'}</Text>
                <Text style={styles.subText}>Bölüm: {question.bolumAd ?? '-'}</Text>

                <View style={styles.statusRow}>
                  <Text style={styles.status}>Cevap: {question.cevapSayisi}</Text>
                  <Text style={styles.status}>Beğeni: {question.begeniSayisi}</Text>
                  <Text style={styles.status}>Tarih: {new Date(question.olusturmaTarihi).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default SoruYonetim;

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
    justifyContent: 'space-between',
    marginTop: 6,
  },
  status: {
    fontSize: 12,
    color: '#f75c5b',
    fontWeight: '600',
  },
});