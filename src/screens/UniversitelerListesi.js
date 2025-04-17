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

const UniversitelerListesi = () => {
  const navigation = useNavigation();

  // ─── State ─────────────────────────────
  const [cities, setCities] = useState(['Tümü']);
  const [allUnis, setAllUnis] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [followed, setFollowed] = useState([]);
  const [loading, setLoading] = useState(true);

  // ─── Fetch cities + universities ─────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cityRes, uniRes] = await Promise.all([
          axios.get('http://10.0.2.2:3000/api/education/city'),
          axios.get('http://10.0.2.2:3000/api/education/university'),
        ]);

        // extract & sort city names
        const cityNames = cityRes.data
          .map((c) => c.ad)
          .sort((a, b) => a.localeCompare(b));
        setCities(['Tümü', ...cityNames]);

        // store unis
        setAllUnis(uniRes.data);
        setFiltered(uniRes.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Veriler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ─── Filter & search logic ───────────────
  const applyFilter = useCallback(() => {
    let list = allUnis;

    if (selectedCity !== 'Tümü') {
      list = list.filter((u) => u.sehiradi === selectedCity);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.universiteadi.toLowerCase().includes(q) ||
          u.sehiradi.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [allUnis, selectedCity, search]);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  // ─── Follow toggle ───────────────────────
  const toggleFollow = (id) => {
    setFollowed((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]
    );
  };

  // ─── Render each university card ──────────
  const renderUniversity = ({ item }) => {
    const id = item.universiteid.toString();
    const isFollowing = followed.includes(id);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('UniversiteDetay', { universite: item })
        }
      >
        <Text style={styles.uniName}>{item.universiteadi}</Text>
        <Text style={styles.uniCity}>Şehir: {item.sehiradi}</Text>

        <View style={styles.metaRow}>
          <Ionicons name="star" size={16} color="#f75c5b" />
          <Text style={styles.metaText}> Puan: {item.puan ?? '-'}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="people" size={16} color="#f75c5b" />
          <Text style={styles.metaText}>
            {' '}
            Takipçi: {item.takipciSayisi ?? '-'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.followBtn, isFollowing && styles.followingBtn]}
          onPress={() => toggleFollow(id)}
        >
          <Text
            style={[styles.followText, isFollowing && styles.followingText]}
          >
            {isFollowing ? 'Takip Ediliyor' : 'Takip Et'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // ─── Loading state ───────────────────────
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

      {/* Şehir seçimi + arama */}
      <View style={styles.filterRow}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={setSelectedCity}
            style={styles.picker}
          >
            {cities.map((city) => (
              <Picker.Item key={city} label={city} value={city} />
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
        keyExtractor={(item) => item.universiteid.toString()}
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
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  picker: {
    width: '100%',
    height: 40,
  },
  searchInput: {
    flex: 0.6,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    color: '#333',
  },
  list: {
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  uniName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  uniCity: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#555',
  },
  followBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f75c5b',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  followingBtn: {
    backgroundColor: '#ccc',
  },
  followText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followingText: {
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
  },
});
