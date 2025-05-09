import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000/api';

export default function Favoriler({ navigation }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadFavorites();
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

  const loadFavorites = async () => {
    try {
      const response = await axios.get(`${BASE}/takip/takipEdilenler`);
      setList(response.data.takipEdilenler);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Favoriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const renderFavoriteItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.favoriteCard,
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
        style={styles.favoriteButton}
        onPress={() => navigation.navigate('UniversiteDetay', { universite: item })}
      >
        <View style={styles.favoriteContent}>
          <View style={styles.universityIconContainer}>
            <Icon name="school-outline" size={24} color="#f75c5b" />
          </View>
          <View style={styles.universityInfo}>
            <Text style={styles.universityName}>{item.ad}</Text>
            <Text style={styles.universityLocation}>
              {item.sehir ?? 'Şehir bilgisi yok'}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

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
        <Text style={styles.headerTitle}>Takip Ettiklerim</Text>
        <Text style={styles.headerSubtitle}>Favori üniversiteleriniz</Text>
      </View>

      <FlatList
        data={list}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderFavoriteItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="heart-outline" size={48} color="#fff" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Henüz takip ettiğiniz üniversite yok</Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('UniversitelerListesi')}
            >
              <Text style={styles.exploreButtonText}>Üniversiteleri Keşfet</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </LinearGradient>
  );
}

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
  listContainer: {
    padding: 16,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  favoriteButton: {
    padding: 16,
  },
  favoriteContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  universityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  universityInfo: {
    flex: 1,
  },
  universityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  universityLocation: {
    fontSize: 13,
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
    marginBottom: 16,
  },
  exploreButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#f75c5b',
    fontWeight: '600',
    fontSize: 14,
  },
});