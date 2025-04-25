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
  const [followMap, setFollowMap] = useState({});     // { [uniId]: boolean }
  const [countMap, setCountMap] = useState({});       // { [uniId]: number }
  const [loading, setLoading] = useState(true);

  // normalize fonksiyonu aynen sizin
  const normalize = text => /* ... */ text; // (uzun, kısalttım)

  // Başlangıçta şehir + üniversite + takip durum + sayıyı yükle
  useEffect(() => {
    (async () => {
      try {
        const [cityRes, uniRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/education/city`),
          axios.get(`${BASE_URL}/api/education/university`),
        ]);
        setCities(['Tümü', ...cityRes.data.map(c => c.ad).sort()]);
        setAllUnis(uniRes.data);
        setFiltered(uniRes.data);

        // takip durumu ve sayıyı çek
        const fMap = {}, cMap = {};
        await Promise.all(uniRes.data.map(async u => {
          cMap[u.universiteid] = u.takipciSayisi || 0;
          try {
            const resp = await axios.get(
              `${BASE_URL}/api/takip/takip-durumu/${u.universiteid}`
            );
            fMap[u.universiteid] = resp.data.takipEdiyorMu;
          } catch {
            fMap[u.universiteid] = false;
          }
        }));
        setFollowMap(fMap);
        setCountMap(cMap);
      } catch (e) {
        Alert.alert('Hata','Veriler yüklenemedi');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applyFilter = useCallback(() => {
    let list = allUnis;
    if (selectedCity !== 'Tümü')
      list = list.filter(u => u.sehiradi === selectedCity);
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

  const toggleFollow = async id => {
    try {
      if (followMap[id]) {
        await axios.delete(`${BASE_URL}/api/takip/takipCik/${id}`);
        setFollowMap(m => ({ ...m, [id]: false }));
        setCountMap(c => ({ ...c, [id]: c[id] - 1 }));
      } else {
        await axios.post(`${BASE_URL}/api/takip/takipEt/${id}`);
        setFollowMap(m => ({ ...m, [id]: true }));
        setCountMap(c => ({ ...c, [id]: c[id] + 1 }));
      }
    } catch {
      Alert.alert('Hata','İşlem başarısız');
    }
  };

  const renderUniversity = ({ item }) => {
    const id = item.universiteid;
    const isF = followMap[id];
    const cnt = countMap[id] ?? '-';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('UniversiteDetay', { universite: item })}
      >
        <View style={styles.cardHeader}>
          <Ionicons name="school" color="#f75c5b" size={18}/>
          <Text style={styles.uniName}>{item.universiteadi}</Text>
        </View>
        <Text style={styles.uniCity}>Şehir: {item.sehiradi}</Text>
        <View style={styles.metaRow}>
          <Ionicons name="people" size={16} color="#f75c5b"/>
          <Text style={styles.metaText}> Takipçi: {cnt}</Text>
        </View>
        <TouchableOpacity
          style={[styles.followBtn, isF && styles.followingBtn]}
          onPress={() => toggleFollow(id)}
        >
          <Text style={[styles.followText, isF && styles.followingText]}>
            {isF ? 'Takipten Çık' : 'Takip Et'}
          </Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color="#f75c5b"/>
    </View>
  );

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <Text style={styles.title}>Üniversiteler</Text>
      <View style={styles.filterRow}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={setSelectedCity}
            style={styles.picker}
          >
            {cities.map(c => <Picker.Item key={c} label={c} value={c}/>)}
          </Picker>
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Üniversite veya şehir ara..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={i=>i.universiteid.toString()}
        renderItem={renderUniversity}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Üniversite yok</Text>}
      />
    </LinearGradient>
  );
};

export default UniversitelerListesi;

// … stil dosyanız aynen kalsın, buraya eklemedim brevity için …


const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 16, textAlign: 'center' },
  filterRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pickerWrapper: { flex: 0.4, backgroundColor: '#fff', borderRadius: 8, marginRight: 8 },
  picker: { width: '100%', height: 40 },
  searchInput: { flex: 0.6, backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, height: 40, color: '#333' },
  list: { paddingBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  uniName: { fontSize: 18, fontWeight: '600', color: '#333' },
  uniCity: { fontSize: 14, color: '#666', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  metaText: { fontSize: 14, color: '#555' },
  followBtn: { marginTop: 10, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#f75c5b', borderRadius: 20, alignSelf: 'flex-start' },
  followingBtn: { backgroundColor: '#ccc' },
  followText: { color: '#fff', fontWeight: 'bold' },
  followingText: { color: '#333' },
  emptyText: { textAlign: 'center', color: '#666', marginTop: 50 },
});
