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
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

const UniversitelerListesi = () => {
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [cities, setCities] = useState(['Tümü']);
  const [allUnis, setAllUnis] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [followMap, setFollowMap] = useState({});
  const [countMap, setCountMap] = useState({});
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

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      const [cityRes, uniRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/education/city`),
        axios.get(`${BASE_URL}/api/education/university`),
      ]);

      const cityNames = cityRes.data.map(c => c.ad).sort((a, b) => a.localeCompare(b));
      setCities(['Tümü', ...cityNames]);
      setAllUnis(uniRes.data);
      setFiltered(uniRes.data);

      const fMap = {};
      const cMap = {};
      await Promise.all(
        uniRes.data.map(async u => {
          try {
            const [cntRes, stRes] = await Promise.all([
              axios.get(`${BASE_URL}/api/takip/universite/${u.universiteid}/takipciler`),
              axios.get(`${BASE_URL}/api/takip/takip-durumu/${u.universiteid}`)
            ]);
            cMap[u.universiteid] = cntRes.data.toplam;
            fMap[u.universiteid] = stRes.data.takipEdiyorMu;
          } catch {
            cMap[u.universiteid] = u.takipciSayisi ?? 0;
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
  };

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

  const toggleFollow = async (uniId) => {
    try {
      if (followMap[uniId]) {
        await axios.delete(`${BASE_URL}/api/takip/takipCik/${uniId}`);
      } else {
        await axios.post(`${BASE_URL}/api/takip/takipEt/${uniId}`);
      }
      const [cntRes, stRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`),
        axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`)
      ]);
      setCountMap(c => ({ ...c, [uniId]: cntRes.data.toplam }));
      setFollowMap(m => ({ ...m, [uniId]: stRes.data.takipEdiyorMu }));
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'İşlem başarısız.');
    }
  };

  const renderUniversity = ({ item, index }) => {
    const id = item.universiteid;
    const isFollowing = followMap[id];
    const followerCount = countMap[id] ?? 0;

    return (
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1]
              })}
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.cardContent}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('UniversiteDetay', { universite: item })}
        >
          <View style={styles.cardHeader}>
            <View style={styles.universityIconContainer}>
              <Icon name="school-outline" size={24} color="#f75c5b" />
            </View>
            <View style={styles.universityInfo}>
              <Text style={styles.uniName}>{item.universiteadi}</Text>
              <Text style={styles.uniCity}>{item.sehiradi}</Text>
            </View>
          </View>

          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Icon name="people-outline" size={18} color="#f75c5b" />
              <Text style={styles.metaText}>{followerCount} Takipçi</Text>
            </View>
            <TouchableOpacity
              style={[styles.followBtn, isFollowing && styles.followingBtn]}
              onPress={() => toggleFollow(id)}
            >
              <Icon 
                name={isFollowing ? "heart" : "heart-outline"} 
                size={18} 
                color={isFollowing ? "#666" : "#fff"} 
                style={styles.followIcon}
              />
              <Text style={[styles.followText, isFollowing && styles.followingText]}>
                {isFollowing ? 'Takipten Çık' : 'Takip Et'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f75c5b" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#f75c5b', '#ff8a5c']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Üniversiteler</Text>
        <Text style={styles.headerSubtitle}>Tüm üniversiteleri keşfedin</Text>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Icon name="location-outline" size={20} color="#666" style={styles.filterIcon} />
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
        <View style={styles.searchWrapper}>
          <Icon name="search-outline" size={20} color="#666" style={styles.filterIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Üniversite veya şehir ara..."
            placeholderTextColor="#999"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.universiteid.toString()}
        renderItem={renderUniversity}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="school-outline" size={48} color="#fff" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Üniversite bulunamadı</Text>
          </View>
        )}
      />
    </LinearGradient>
  );
};

export default UniversitelerListesi;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  filterIcon: {
    marginRight: 8,
  },
  picker: {
    flex: 1,
    height: 50,
    color: '#2D3436',
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#2D3436',
    fontSize: 16,
  },
  list: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  universityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  universityInfo: {
    flex: 1,
  },
  uniName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
  },
  uniCity: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
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
  followIcon: {
    marginRight: 6,
  },
  followText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  followingText: {
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
});
