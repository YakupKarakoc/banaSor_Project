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

  // 1) Fakülteleri çek
  useEffect(() => {
    axios.get(`${BASE_URL}/api/education/faculty`, {
      params: { universiteId: uniId, aktifMi: true },
    })
    .then(res => setFaculties(res.data))
    .catch(() => Alert.alert('Hata','Fakülteler yüklenemedi'))
    .finally(() => setLoadingFac(false));
  }, [uniId]);

  // 2) Takip durumunu ve sayısını çek
  useEffect(() => {
    axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`)
      .then(res => setIsFollowing(res.data.takipEdiyorMu))
      .catch(() => {});
    axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`)
      .then(res => setFollowerCount(res.data.toplam))
      .catch(() => {});
  }, [uniId]);

  // 3) Takip / takibi bırak
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
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık Bölümü */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{universite.universiteadi}</Text>
          <Text style={styles.subTitle}>Şehir: {universite.sehiradi}</Text>
        </View>

        {/* İstatistikler + Takip */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="star" size={20} color="#fff" />
              <Text style={styles.statText}> {universite.puan ?? '-'} puan</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people" size={20} color="#fff" />
              <Text style={styles.statText}> {followerCount} takipçi</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.followBtn, isFollowing && styles.followingBtn]}
            onPress={toggleFollow}
            disabled={loadingFollow}
          >
            {loadingFollow ? (
              <ActivityIndicator color="#f75c5b" size="small" />
            ) : (
              <>
                <Ionicons 
                  name={isFollowing ? "checkmark-circle" : "add-circle"} 
                  size={18} 
                  color={isFollowing ? "#666" : "#f75c5b"} 
                  style={styles.followIcon}
                />
                <Text style={[styles.followText, isFollowing && styles.followingText]}>
                  {isFollowing ? 'Takipten Çık' : 'Takip Et'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Duyurular */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="megaphone" size={24} color="#f75c5b" />
            <Text style={styles.cardTitle}>Son Duyurular</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardItem}>• Bahar şenlikleri 24 Nisan'da başlıyor!</Text>
            <Text style={styles.cardItem}>• Yüz yüze eğitime geçiş duyurusu yayımlandı.</Text>
          </View>
        </View>

        {/* Forum */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Forum', { universiteId: uniId })}
        >
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles" size={24} color="#f75c5b" />
            <Text style={styles.cardTitle}>Forum</Text>
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardItemSmall}>
              Bu üniversitenin forum başlıklarını görüntüle
            </Text>
            <View style={styles.forumArrow}>
              <Ionicons name="arrow-forward" size={20} color="#f75c5b" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Fakülteler */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Ionicons name="school" size={24} color="#fff" />
            <Text style={styles.sectionTitle}>Fakülteler</Text>
          </View>
          {loadingFac ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="large"/>
            </View>
          ) : (
            faculties.map(f => (
              <TouchableOpacity
                key={f.fakulteid}
                style={styles.listItem}
                onPress={() => navigation.push('FacultyDetail', { universite, faculty: f })}
              >
                <Text style={styles.itemText}>{f.fakulteadi}</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff"/>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: { 
    padding: 24,
    paddingTop: 50,
  },
  headerContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: { 
    color: '#fff', 
    fontSize: 32, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  subTitle: { 
    color: '#fff', 
    fontSize: 18, 
    textAlign: 'center', 
    opacity: 0.9,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  statsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  statsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around', 
    marginBottom: 16,
  },
  stat: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  statText: { 
    color: '#fff', 
    fontSize: 16, 
    marginLeft: 8,
    fontWeight: '600',
  },
  followBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  followingBtn: { 
    backgroundColor: '#E9ECEF',
  },
  followIcon: {
    marginRight: 8,
  },
  followText: { 
    color: '#f75c5b', 
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  followingText: { 
    color: '#666',
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#f75c5b',
    letterSpacing: 0.5,
    marginLeft: 12,
  },
  cardContent: {
    position: 'relative',
  },
  cardItem: { 
    fontSize: 15, 
    color: '#2D3436', 
    marginBottom: 12,
    lineHeight: 22,
    fontWeight: '500',
  },
  cardItemSmall: { 
    fontSize: 15, 
    color: '#666', 
    lineHeight: 22,
    fontWeight: '500',
  },
  forumArrow: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    padding: 8,
    borderRadius: 12,
  },
  sectionContainer: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { 
    color: '#fff', 
    fontSize: 24, 
    fontWeight: '700', 
    marginLeft: 12,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  itemText: { 
    flex: 1, 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
