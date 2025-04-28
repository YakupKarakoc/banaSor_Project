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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerWrapper: {
    flex: 0.4,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 8,
  },
  picker: { width: '100%', height: 40 },
  searchInput: {
    flex: 0.6,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: '#333',
  },
  list: { paddingBottom: 30 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  uniName: { fontSize: 18, fontWeight: '600', color: '#333' },
  uniCity: { fontSize: 14, color: '#666', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 14, color: '#555' },
  followBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f75c5b',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  followingBtn: { backgroundColor: '#ccc' },
  followText: { color: '#fff', fontWeight: 'bold' },
  followingText: { color: '#333' },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});
