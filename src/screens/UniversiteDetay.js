// src/screens/UniversiteDetay.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

export default function UniversiteDetay() {
  const { universite } = useRoute().params;
  const uniId = universite.universiteid;
  const navigation = useNavigation();

  const [faculties, setFaculties] = useState([]);
  const [loadingFac, setLoadingFac] = useState(true);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(universite.takipciSayisi ?? 0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Fakülteleri çek
  useEffect(() => {
    axios.get(`${BASE_URL}/api/education/faculty`, {
      params: { universiteId: uniId, aktifMi: true },
    })
    .then(res => setFaculties(res.data))
    .catch(() => Alert.alert('Hata','Fakülteler yüklenemedi'))
    .finally(() => setLoadingFac(false));
  }, [uniId]);

  // Takip durumunu ve sayısını çek
  useEffect(() => {
    axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`)
      .then(res => setIsFollowing(res.data.takipEdiyorMu))
      .catch(() => {});
    axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`)
      .then(res => setFollowerCount(res.data.toplam))
      .catch(() => {});
  }, [uniId]);

  // Takip / takibi bırak
  const toggleFollow = async () => {
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await axios.delete(`${BASE_URL}/api/takip/takipCik/${uniId}`);
      } else {
        await axios.post(`${BASE_URL}/api/takip/takipEt/${uniId}`);
      }
      // güncel durumu yeniden çek
      const [st, ct] = await Promise.all([
        axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`),
        axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`)
      ]);
      setIsFollowing(st.data.takipEdiyorMu);
      setFollowerCount(ct.data.toplam);
    } catch {
      Alert.alert('Hata','Takip işlemi başarısız');
    } finally {
      setLoadingFollow(false);
    }
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Başlık */}
        <Text style={styles.title}>{universite.universiteadi}</Text>
        <Text style={styles.subTitle}>Şehir: {universite.sehiradi}</Text>

        {/* İstatistikler + Takip */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={styles.statText}> {universite.puan ?? '-'} puan</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.statText}> {followerCount} takipçi</Text>
          </View>
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={toggleFollow}
            disabled={loadingFollow}
          >
            {loadingFollow
              ? <ActivityIndicator color="#fff"/>
              : <Text style={styles.followText}>
                  {isFollowing ? 'Takipten Çık' : 'Takip Et'}
                </Text>
            }
          </TouchableOpacity>
        </View>

        {/* Son Duyurular */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📢 Son Duyurular</Text>
          <Text style={styles.cardItem}>• Bahar şenlikleri 24 Nisan’da başlıyor!</Text>
          <Text style={styles.cardItem}>• Yüz yüze eğitime geçiş duyurusu yayımlandı.</Text>
        </View>

        {/* Forum Butonu */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Forum', { universiteId: uniId })}
        >
          <Text style={styles.cardTitle}>💬 Forum</Text>
          <Text style={styles.cardItemSmall}>
            Bu üniversitenin forum başlıklarını görüntüle
          </Text>
        </TouchableOpacity>

        {/* Sorular Butonu */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('QuestionList', { universiteId: uniId })}
        >
          <Text style={styles.cardTitle}>❓ Sorular</Text>
          <Text style={styles.cardItemSmall}>
            Bu üniversitenin sorularını görüntüle
          </Text>
        </TouchableOpacity>

        {/* Fakülteler */}
        <Text style={styles.sectionHeader}>Fakülteler</Text>
        {loadingFac ? (
          <ActivityIndicator color="#fff" size="large"/>
        ) : faculties.map(f => (
          <TouchableOpacity
            key={f.fakulteid}
            style={styles.listItem}
            onPress={() => navigation.push('FacultyDetail', { universite, faculty: f })}
          >
            <Text style={styles.itemText}>{f.fakulteadi}</Text>
            <Ionicons name="chevron-forward" size={20} color="#fff"/>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  content:        { padding: 20 },
  title:          { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subTitle:       { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 16 },
  statsRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 20 },
  stat:           { flexDirection: 'row', alignItems: 'center' },
  statText:       { color: '#fff', fontSize: 14, marginLeft: 4 },
  followBtn:      { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 20 },
  followingBtn:   { backgroundColor: '#444' },
  followText:     { color: '#f75c5b', fontWeight: '600' },
  card:           { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, elevation: 3 },
  cardTitle:      { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#f75c5b' },
  cardItem:       { fontSize: 14, color: '#444', marginBottom: 4 },
  cardItemSmall:  { fontSize: 13, color: '#444', marginBottom: 4 },
  sectionHeader:  { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  listItem:       { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, marginBottom: 8 },
  itemText:       { flex: 1, color: '#fff', fontSize: 16 },
});
