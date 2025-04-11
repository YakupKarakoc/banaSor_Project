import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const mockUniversities = [
  { id: 1, name: 'Trakya Üniversitesi', city: 'Edirne', followers: 1243, rating: 4.2 },
  { id: 2, name: 'İstanbul Teknik Üniversitesi', city: 'İstanbul', followers: 3856, rating: 4.8 },
  { id: 3, name: 'ODTÜ', city: 'Ankara', followers: 2974, rating: 4.6 },
];

const UniversitelerListesi = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState('');
  const [universities, setUniversities] = useState(mockUniversities);
  const [followed, setFollowed] = useState([]);
  const [selectedCity, setSelectedCity] = useState('Tümü');
  const [sortType, setSortType] = useState('Varsayılan');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const cities = ['Tümü', 'Edirne', 'İstanbul', 'Ankara'];
  const sortOptions = ['Varsayılan', 'Puan', 'Takipçi', 'İsim'];

  const toggleFollow = (id) => {
    if (followed.includes(id)) {
      setFollowed(followed.filter(fid => fid !== id));
    } else {
      setFollowed([...followed, id]);
    }
  };

  const applyFilters = () => {
    let filtered = [...mockUniversities];
    if (selectedCity !== 'Tümü') {
      filtered = filtered.filter(u => u.city === selectedCity);
    }

    switch (sortType) {
      case 'Puan':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'Takipçi':
        filtered.sort((a, b) => b.followers - a.followers);
        break;
      case 'İsim':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    setUniversities(filtered);
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <Text style={styles.title}>Üniversiteler</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Üniversite ara..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity onPress={() => setIsFilterVisible(!isFilterVisible)}>
          <Ionicons name="filter" size={20} color="#f75c5b" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {isFilterVisible && (
        <View style={styles.filterBox}>
          <Text style={styles.filterLabel}>Şehre Göre:</Text>
          <Picker
            selectedValue={selectedCity}
            onValueChange={(val) => setSelectedCity(val)}>
            {cities.map((c, i) => <Picker.Item key={i} label={c} value={c} />)}
          </Picker>

          <Text style={styles.filterLabel}>Sıralama:</Text>
          <Picker
            selectedValue={sortType}
            onValueChange={(val) => setSortType(val)}>
            {sortOptions.map((s, i) => <Picker.Item key={i} label={s} value={s} />)}
          </Picker>

          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyText}>Uygula</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* List */}
      <FlatList
        data={universities.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('UniversiteDetay', { universite: item })}
          >
            <Text style={styles.uniName}>{item.name}</Text>
            <Text style={styles.altBilgi}>{item.city}</Text>
            <View style={styles.altSatir}>
              <Ionicons name="people" size={16} color="#f75c5b" />
              <Text style={styles.altYazi}> {item.followers} takipçi</Text>
            </View>
            <View style={styles.altSatir}>
              <Ionicons name="star" size={16} color="#f75c5b" />
              <Text style={styles.altYazi}> {item.rating} puan</Text>
            </View>
            <TouchableOpacity
              style={styles.takipButton}
              onPress={() => toggleFollow(item.id)}>
              <Text style={styles.takipYazi}>
                {followed.includes(item.id) ? 'Takip Ediliyor' : 'Takip Et'}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterButton: {
    color: '#f75c5b',
    fontWeight: 'bold',
    marginLeft: 10,
  },
  filterBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  filterLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginTop: 6,
  },
  applyButton: {
    backgroundColor: '#f75c5b',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  uniName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  altBilgi: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  altSatir: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  altYazi: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
  takipButton: {
    backgroundColor: '#f75c5b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  takipYazi: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UniversitelerListesi;