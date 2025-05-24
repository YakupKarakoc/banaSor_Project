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
  Animated,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

export default function UniversiteDetay() {
  const { universite } = useRoute().params;
  const uniId = universite.universiteid;
  const navigation = useNavigation();

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  const [faculties, setFaculties] = useState([]);
  const [loadingFac, setLoadingFac] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(universite.takipciSayisi ?? 0);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Better data handling
  const universityName = universite.universiteadi || universite.ad || 'Üniversite';
  const cityName = universite.sehiradi || universite.sehir || 'Türkiye';

  useEffect(() => {
    loadData();
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadData = async () => {
    try {
      console.log('Loading data for university:', universityName, 'ID:', uniId);
      
      let faculties = [];
      let isFollowing = false;
      let followerCount = universite.takipciSayisi ?? 0;

      // Load faculty data
      try {
        const facRes = await axios.get(`${BASE_URL}/api/education/faculty`, {
          params: { universiteId: uniId, aktifMi: true },
        });
        faculties = Array.isArray(facRes.data) ? facRes.data : [];
        console.log('✅ Faculties loaded:', faculties.length);
      } catch (facError) {
        console.log('⚠️ Faculty API unavailable, using empty list');
        faculties = [];
      }

      // Load follow status
      try {
        const followRes = await axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`);
        isFollowing = followRes.data?.takipEdiyorMu ?? false;
        console.log('✅ Follow status loaded:', isFollowing);
      } catch (followError) {
        console.log('⚠️ Follow status API unavailable, using default: false');
        isFollowing = false;
      }

      // Load follower count
      try {
        const countRes = await axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`);
        followerCount = countRes.data?.toplam ?? followerCount;
        console.log('✅ Follower count loaded:', followerCount);
      } catch (countError) {
        console.log('⚠️ Follower count API unavailable, using fallback:', followerCount);
        // Keep the original fallback value
      }

      setFaculties(faculties);
      setIsFollowing(isFollowing);
      setFollowerCount(followerCount);

    } catch (error) {
      console.log('⚠️ General loadData error, using fallback values');
    } finally {
      setLoadingFac(false);
    }
  };

  const toggleFollow = async () => {
    setLoadingFollow(true);
    try {
      console.log('Toggling follow for:', universityName);
      
      if (isFollowing) {
        await axios.delete(`${BASE_URL}/api/takipCik/${uniId}`);
        console.log('✅ Successfully unfollowed');
      } else {
        await axios.post(`${BASE_URL}/api/takipEt/${uniId}`);
        console.log('✅ Successfully followed');
      }

      // Update status and count
      let newFollowStatus = !isFollowing;
      let newFollowerCount = followerCount;

      try {
        const stRes = await axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`);
        newFollowStatus = stRes.data?.takipEdiyorMu ?? newFollowStatus;
      } catch (error) {
        console.log('⚠️ Could not refresh follow status, using toggle result');
      }

      try {
        const ctRes = await axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`);
        newFollowerCount = ctRes.data?.toplam ?? newFollowerCount;
      } catch (error) {
        console.log('⚠️ Could not refresh follower count, using manual calculation');
        newFollowerCount = isFollowing ? followerCount - 1 : followerCount + 1;
      }

      setIsFollowing(newFollowStatus);
      setFollowerCount(newFollowerCount);

    } catch (error) {
      console.log('❌ Toggle follow failed:', error.response?.status);
      Alert.alert('Hata', 'Takip işlemi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoadingFollow(false);
    }
  };

  const renderCard = ({ icon, title, content, onPress }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardBtn}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.9 : 1}
      >
        <View style={styles.cardHeader}>
          <Icon name={icon} size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.cardBody}>{content}</View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient
        colors={["#f75c5b", "#ff8a5c"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Icon name="school" size={36} color="#fff" style={styles.headerIcon} />
              <Text style={styles.title} numberOfLines={2}>
                {universityName}
              </Text>
              <View style={styles.locationRow}>
                <Icon name="location" size={16} color="#fff" />
                <Text style={styles.subTitle}>{cityName}</Text>
              </View>
            </View>
          </Animated.View>

          {/* University Stats Card */}
          <Animated.View
            style={[
              styles.universityCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Icon name="people" size={16} color="#f75c5b" />
                <Text style={styles.statText}>{followerCount} takipçi</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={toggleFollow}
              disabled={loadingFollow}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={
                  isFollowing 
                    ? ['#00b894', '#55a3ff'] 
                    : ['#f75c5b', '#ff8a5c']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.followGradient}
              >
                {loadingFollow ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon
                      name={isFollowing ? "heart" : "heart-outline"}
                      size={18}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.followButtonText}>
                      {isFollowing ? 'Takipten Çık' : 'Takip Et'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Action Cards */}
          {renderCard({
            icon: "megaphone-outline",
            title: "Son Duyurular",
            content: (
              <View>
                <Text style={styles.cardItem}>• Bahar şenlikleri 24 Nisan'da başlıyor!</Text>
                <Text style={styles.cardItem}>• Yüz yüze eğitime geçiş duyurusu yayımlandı.</Text>
                <Text style={styles.cardItem}>• Yeni akademik takvim açıklandı.</Text>
              </View>
            )
          })}

          {renderCard({
            icon: "chatbubbles-outline",
            title: "Forum",
            content: <Text style={styles.cardDescription}>Bu üniversitenin forum başlıklarını görüntüle</Text>,
            onPress: () => navigation.navigate('Forum', { universiteId: uniId }),
          })}

          {renderCard({
            icon: "help-circle-outline",
            title: "Sorular",
            content: <Text style={styles.cardDescription}>Bu üniversitenin sorularını görüntüle</Text>,
            onPress: () => navigation.navigate('QuestionList', { universiteId: uniId }),
          })}

          {/* Faculties Section */}
          <View style={styles.sectionHeaderRow}>
            <Icon name="library-outline" size={20} color="#fff" style={styles.sectionIcon} />
            <Text style={styles.sectionHeader}>Fakülteler</Text>
            <View style={styles.facultyBadge}>
              <Text style={styles.facultyBadgeText}>
                {loadingFac ? '...' : faculties.length}
              </Text>
            </View>
          </View>

          {loadingFac ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.loadingText}>Fakülteler yükleniyor...</Text>
            </View>
          ) : faculties.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="library-outline" size={40} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
              <Text style={styles.emptyText}>Henüz fakülte bilgisi yok</Text>
              <Text style={styles.emptySubText}>Yakında eklenecek</Text>
            </View>
          ) : (
            faculties.map((faculty, index) => (
              <Animated.View
                key={faculty.fakulteid || index}
                style={[
                  styles.listItem,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.facultyBtn}
                  onPress={() => navigation.navigate('FacultyDetail', { universite, faculty })}
                  activeOpacity={0.9}
                >
                  <View style={styles.facultyIconRow}>
                    <Icon name="library-outline" size={20} color="#fff" style={styles.facultyIcon} />
                    <Text style={styles.itemText} numberOfLines={2}>
                      {faculty.fakulteadi || faculty.ad || 'Fakülte'}
                    </Text>
                  </View>
                  <Icon name="chevron-forward" size={20} color="#fff" />
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </ScrollView>
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
  content: {
    padding: 18,
    paddingBottom: 32,
  },

  // PREMIUM HEADER
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  backBtn: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    lineHeight: 32,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  subTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 6,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // LUXURY UNIVERSITY CARD
  universityCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(247, 92, 91, 0.1)',
    marginBottom: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(247, 92, 91, 0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.15)',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statText: {
    fontSize: 14,
    color: '#f75c5b',
    marginLeft: 6,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  followButton: {
    borderRadius: 28,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    alignSelf: 'center',
  },
  followingButton: {
    shadowColor: '#00b894',
  },
  followGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.6,
  },

  // PREMIUM CARDS
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.08)',
  },
  cardBtn: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    marginRight: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f75c5b',
    letterSpacing: 0.5,
    flex: 1,
  },
  cardBody: {
    marginTop: 8,
  },
  cardItem: {
    fontSize: 15,
    color: '#2D3436',
    marginBottom: 8,
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 15,
    color: '#636e72',
    lineHeight: 22,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ELEGANT FACULTIES SECTION
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  sectionIcon: {
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sectionHeader: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 0.6,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  facultyBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  facultyBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // LOADING & EMPTY STATES
  loadingContainer: {
    padding: 50,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // LUXURY FACULTY ITEMS
  listItem: {
    marginBottom: 12,
  },
  facultyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  facultyIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  facultyIcon: {
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
