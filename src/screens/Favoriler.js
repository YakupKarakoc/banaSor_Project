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
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { getToken } from '../utils/auth';


const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000/api';

export default function Favoriler({ navigation, route }) {
  
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
  setLoading(true);
  try {
    const token = await getToken();            // ← TOKEN’I ÇEK
    const response = await axios.get(
      `${BASE}/takip/takipEdilenler`,
      { headers:{ Authorization:`Bearer ${token}` } }
    );
   
    setList(response.data.takipEdilenler);
  } catch (error) {
    console.error('Favoriler yükleme hatası:', error);
    Alert.alert('Hata', 'Favoriler yüklenirken bir hata oluştu.');
  } finally {
    setLoading(false);
  }
};


const unfollowUniversity = async (universiteId, universiteName) => {
  if (!universiteId) {
    Alert.alert('Hata', 'Üniversite ID eksik.');
    return;
  }

  Alert.alert(
    'Takipten Çıkar',
    `${universiteName} üniversitesini takipten çıkarmak istediğinize emin misiniz?`,
    [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkar',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const token = await getToken(); // veya route.params.token

           await axios.delete(
   `${BASE}/takip/takipCik/${universiteId}`,
   { headers: { Authorization: `Bearer ${token}` } }
 );

            // Ön yüzde de listeden sil
            setList(prev => prev.filter(u => u.universiteid !== universiteId));
            Alert.alert('Başarılı', `${universiteName} takipten çıkarıldı.`);
            // await loadFavorites();
          } catch (err) {
            console.error(err);
            Alert.alert('Hata', err.response?.data?.message || 'İşlem başarısız.');
          } finally {
            setLoading(false);
          }
        }
      }
    ]
  );
};



  const renderFavoriteItem = ({ item, index }) => {
    // Debug: Item objesini console'a bas
    console.log('Favorite item object:', item);
    console.log('Available keys:', Object.keys(item));
const universiteId   = item.universiteid;
  const universiteName = item.ad;

  console.log('Üniversite ID:', universiteId);
  console.log('Üniversite adı:', universiteName);
    
    return (
      <Animated.View
        style={[
          styles.modernFavoriteCard,
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
        <View style={styles.modernFavoriteContent}>
          {/* University Info */}
          <View style={styles.modernFavoriteHeader}>
            <View style={styles.modernUniversityAvatar}>
              <Icon name="school" size={24} color="#fff" />
            </View>
            <View style={styles.modernUniversityInfo}>
              <Text style={styles.modernUniversityName} numberOfLines={2}>
                {universiteName}
              </Text>
              
            </View>
          </View>
          
          {/* University Stats */}
          <View style={styles.modernStatsContainer}>
            <View style={styles.modernStatItem}>
              <Icon name="library" size={16} color="#6c5ce7" />
              <Text style={styles.modernStatText}>Fakulteler</Text>
            </View>
            <View style={styles.modernStatItem}>
              <Icon name="people" size={16} color="#fd79a8" />
              <Text style={styles.modernStatText}>Öğrenciler</Text>
            </View>
            <View style={styles.modernStatItem}>
              <Icon name="help-circle" size={16} color="#00b894" />
              <Text style={styles.modernStatText}>Sorular</Text>
            </View>
          </View>

          {/* Single Unfollow Button */}
          <View style={styles.singleActionContainer}>
            <TouchableOpacity
              style={styles.removeButtonLarge}
              onPress={() => unfollowUniversity(universiteId, universiteName)}
              activeOpacity={0.8}
            >
              <Icon name="heart-dislike" size={20} color="#fff" />
              <Text style={styles.removeButtonLargeText}>Takipten Çıkar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient
        colors={['#f75c5b', '#ff8a5c']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}
      >
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Favorilerim</Text>
              <Text style={styles.modernHeaderSubtitle}>TAKİP ETTİKLERİM</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Icon name="heart" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.modernContentContainer}>
          {loading ? (
            <View style={styles.modernLoadingContainer}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#f75c5b" />
              </View>
              <Text style={styles.modernLoadingText}>Favoriler yükleniyor...</Text>
            </View>
          ) : (
            <FlatList
              data={list}
 keyExtractor={item => String(item.universiteid)}
               renderItem={renderFavoriteItem}
              contentContainerStyle={styles.modernListContainer}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => (
                <View style={styles.discoverMoreContainer}>
                  <View style={styles.discoverMoreCard}>
                    <View style={styles.discoverMoreHeader}>
                      <View style={styles.discoverMoreIcon}>
                        <Icon name="compass" size={28} color="#fff" />
                      </View>
                      <View style={styles.discoverMoreInfo}>
                        <Text style={styles.discoverMoreTitle}>Daha Fazla Keşfet</Text>
                        <Text style={styles.discoverMoreSubtitle}>
                          Yeni üniversiteler keşfet ve favorilerine ekle
                        </Text>
                      </View>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.discoverMoreButton}
                      onPress={() => navigation.navigate('Universiteler')}
                      activeOpacity={0.8}
                    >
                      <Icon name="search" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.discoverMoreButtonText}>Üniversiteleri Keşfet</Text>
                      <Icon name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              ListEmptyComponent={() => (
                <View style={styles.modernEmptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="heart-outline" size={80} color="#f75c5b" />
                  </View>
                  <Text style={styles.modernEmptyText}>Henüz favori üniversiten yok</Text>
                  <Text style={styles.modernEmptySubText}>
                    Üniversiteleri keşfet ve favorilerine ekle
                  </Text>
                  <TouchableOpacity
                    style={styles.modernExploreButton}
                    onPress={() => navigation.navigate('Universiteler')}
                    activeOpacity={0.8}
                  >
                    <Icon name="compass" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.modernExploreButtonText}>Üniversiteleri Keşfet</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // MAIN CONTAINERS
  safeContainer: {
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  container: {
    flex: 1,
  },

  // PREMIUM HEADER
  modernHeader: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  modernHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  modernHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // CONTENT
  modernContentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  modernListContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  // FAVORITE CARDS
  modernFavoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernFavoriteContent: {
    padding: 20,
  },
  modernFavoriteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modernUniversityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernUniversityInfo: {
    flex: 1,
  },
  modernUniversityName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  modernLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernUniversityLocation: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // UNIVERSITY STATS
  modernStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f3f4',
  },
  modernStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modernStatText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // LOADING STATE
  modernLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  modernLoadingText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // EMPTY STATE
  modernEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  modernEmptyText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  modernEmptySubText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginBottom: 32,
    lineHeight: 20,
  },
  modernExploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modernExploreButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  // DISCOVER MORE SECTION
  discoverMoreContainer: {
    padding: 20,
  },
  discoverMoreCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  discoverMoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  discoverMoreIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  discoverMoreInfo: {
    flex: 1,
  },
  discoverMoreTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 6,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  discoverMoreSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  discoverMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  discoverMoreButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },

  // UNFOLLOW BUTTON
  singleActionContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  removeButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  removeButtonLargeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
    marginLeft: 8,
  },
});