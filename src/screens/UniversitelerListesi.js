// src/screens/UniversitelerListesi.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:3000';

const UniversitelerListesi = () => {
  const navigation = useNavigation();

  const [cities, setCities] = useState(['Tümü']);
  const [allUnis, setAllUnis] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tümü');

  const [followMap, setFollowMap] = useState({}); // { [uniId]: boolean }
  const [countMap, setCountMap] = useState({});   // { [uniId]: number }

  const [loading, setLoading] = useState(true);

  const normalize = (text) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');

  // ─── Başlangıçta şehir + üniversiteler + takip durumu + sayılar ───────────────────
  useEffect(() => {
    (async () => {
      try {
        const [cityRes, uniRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/education/city`),
          axios.get(`${BASE_URL}/api/education/university`),
        ]);

        // Şehirler
        const cityNames = cityRes.data.map(c => c.ad).sort((a, b) => a.localeCompare(b));
        setCities(['Tümü', ...cityNames]);

        // Üniversiteler
        setAllUnis(uniRes.data);
        setFiltered(uniRes.data);

        // İlk takip durumları ve sayılar
        const fMap = {};
        const cMap = {};
        await Promise.all(
          uniRes.data.map(async u => {
            // DB'deki gerçek takipçi sayısını bu endpoint'ten alın
            try {
              const cntRes = await axios.get(
                `${BASE_URL}/api/takip/universite/${u.universiteid}/takipciler`
              );
              cMap[u.universiteid] = cntRes.data.toplam;
            } catch {
              cMap[u.universiteid] = u.takipciSayisi ?? 0;
            }
            // Bu kullanıcının takip durumunu al
            try {
              const stRes = await axios.get(
                `${BASE_URL}/api/takip/takip-durumu/${u.universiteid}`
              );
              fMap[u.universiteid] = stRes.data.takipEdiyorMu;
            } catch {
              fMap[u.universiteid] = false;
            }
          })
        );
        setFollowMap(fMap);
        setCountMap(cMap);

      } catch (e) {
        console.error(e);
        Alert.alert('Hata', 'Veriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ─── Filtre + arama ───────────────────────────────
  const applyFilter = useCallback(() => {
    let list = allUnis;
    if (selectedCity !== 'Tümü') {
      list = list.filter(u => u.sehiradi === selectedCity);
    }
    if (search.trim()) {
      const q = normalize(search.trim());
      list = list.filter(u =>
        normalize(u.universiteadi).includes(q) ||
        normalize(u.sehiradi).includes(q)
      );
    }
    setFiltered(list);
  }, [allUnis, selectedCity, search]);

  useEffect(applyFilter, [applyFilter]);

  // ─── Takip / Takipten Çık işlemi ────────────────────
  const toggleFollow = async (uniId) => {
    try {
      if (followMap[uniId]) {
        // Takipten çık
        await axios.delete(`${BASE_URL}/api/takip/takipCik/${uniId}`);
      } else {
        // Takip et
        await axios.post(`${BASE_URL}/api/takip/takipEt/${uniId}`);
      }
      // İşlemden sonra gerçek sayıyı tekrar getir
      const cntRes = await axios.get(
        `${BASE_URL}/api/takip/universite/${uniId}/takipciler`
      );
      // ve tekrar durumu al
      const stRes = await axios.get(
        `${BASE_URL}/api/takip/takip-durumu/${uniId}`
      );
      setCountMap(c => ({ ...c, [uniId]: cntRes.data.toplam }));
      setFollowMap(m => ({ ...m, [uniId]: stRes.data.takipEdiyorMu }));
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  // ─── Kart render ───────────────────────────────────
  const renderUniversity = ({ item }) => {
    const id = item.universiteid;
    const isFollowing = followMap[id];
    const followerCount = countMap[id] ?? 0;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('UniversiteDetay', { universite: item })
        }
      >
        <View style={styles.cardHeader}>
          <Ionicons
            name="school"
            size={18}
            color="#f75c5b"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.uniName}>{item.universiteadi}</Text>
        </View>
        <Text style={styles.uniCity}>Şehir: {item.sehiradi}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="people" size={16} color="#f75c5b" />
          <Text style={styles.metaText}> Takipçi: {followerCount}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={() => toggleFollow(id)}
        >
          <Text style={[styles.followText, isFollowing && styles.followingText]}>
            {isFollowing ? 'Takipten Çık' : 'Takip Et'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f75c5b" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <Text style={styles.title}>Üniversiteler</Text>

      <View style={styles.filterRow}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={setSelectedCity}
            style={styles.picker}
          >
            {cities.map(c => (
              <Picker.Item key={c} label={c} value={c} />
            ))}
          </Picker>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Üniversite veya şehir ara..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.universiteid.toString()}
        renderItem={renderUniversity}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Hiç üniversite bulunamadı.</Text>
        }
      />
    </LinearGradient>
  );
};

export default UniversitelerListesi;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 20, 
    paddingTop: 50 
  },
  loader: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: '#f75c5b',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  pickerWrapper: {
    flex: 0.4,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  picker: { 
    width: '100%', 
    height: 50,
    color: '#2D3436',
  },
  searchInput: {
    flex: 0.6,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    color: '#2D3436',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  list: { 
    paddingBottom: 30,
    paddingTop: 8,
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
    marginBottom: 8,
  },
  uniName: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#2D3436',
    letterSpacing: 0.3,
  },
  uniCity: { 
    fontSize: 15, 
    color: '#666', 
    marginBottom: 12,
    fontWeight: '500',
  },
  metaRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  metaText: { 
    fontSize: 14, 
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  followBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f75c5b',
    borderRadius: 25,
    alignSelf: 'flex-start',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  followingBtn: { 
    backgroundColor: '#E9ECEF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  followText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  followingText: { 
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 50,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
});
