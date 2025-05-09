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

  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [faculties, setFaculties] = useState([]);
  const [loadingFac, setLoadingFac] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(universite.takipciSayisi ?? 0);
  const [loadingFollow, setLoadingFollow] = useState(false);

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
      const [facRes, followRes, countRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/education/faculty`, {
          params: { universiteId: uniId, aktifMi: true },
        }),
        axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`),
        axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`),
      ]);

      setFaculties(facRes.data);
      setIsFollowing(followRes.data.takipEdiyorMu);
      setFollowerCount(countRes.data.toplam);
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoadingFac(false);
    }
  };

  const toggleFollow = async () => {
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await axios.delete(`${BASE_URL}/api/takip/takipCik/${uniId}`);
      } else {
        await axios.post(`${BASE_URL}/api/takip/takipEt/${uniId}`);
      }

      const [st, ct] = await Promise.all([
        axios.get(`${BASE_URL}/api/takip/takip-durumu/${uniId}`),
        axios.get(`${BASE_URL}/api/takip/universite/${uniId}/takipciler`),
      ]);

      setIsFollowing(st.data.takipEdiyorMu);
      setFollowerCount(ct.data.toplam);
    } catch {
      Alert.alert('Hata', 'Takip işlemi başarısız');
    } finally {
      setLoadingFollow(false);
    }
  };

  // --- UI helpers ---
  const renderCard = ({ icon, title, content, onPress, showArrow = false }) => (
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
        style={styles.cardContent}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.85 : 1}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardIconContainer}>
            <Icon name={icon} size={22} color="#f75c5b" />
          </View>
          <Text style={styles.cardTitle}>{title}</Text>
          {showArrow && (
            <View style={styles.cardArrow}><Icon name="chevron-forward" size={20} color="#f75c5b" /></View>
          )}
        </View>
        <View style={styles.cardBody}>{content}</View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={["#f75c5b", "#ff8a5c"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.headerModern}>
          <View style={styles.universityBadgeModern}>
            <Icon name="school-outline" size={44} color="#f75c5b" />
          </View>
          <Text style={styles.uniTitleModern}>{universite.universiteadi}</Text>
          <Text style={styles.uniSubtitleModern}>{universite.sehiradi}</Text>
        </View>

        {/* STATS + FOLLOW (modern, alt alta) */}
        <View style={styles.statsCardModern}>
          <View style={styles.statsRowModern}>
            <View style={styles.statItemModern}>
              <Icon name="star-outline" size={17} color="#f75c5b" />
              <Text style={styles.statTextModern}>{universite.puan ?? '-'} puan</Text>
            </View>
            <View style={styles.statItemModern}>
              <Icon name="people-outline" size={17} color="#f75c5b" />
              <Text style={styles.statTextModern}>{followerCount} takipçi</Text>
            </View>
          </View>
          <View style={styles.statsFollowRowModern}>
            <TouchableOpacity
              style={[styles.followButtonModern, isFollowing && styles.followingButtonModern]}
              onPress={toggleFollow}
              disabled={loadingFollow}
              activeOpacity={0.85}
            >
              {loadingFollow ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Icon
                    name={isFollowing ? "heart" : "heart-outline"}
                    size={17}
                    color={isFollowing ? "#fff" : "#f75c5b"}
                    style={styles.followIconModern}
                  />
                  <Text style={[styles.followTextModern, isFollowing && styles.followingTextModern]}>
                    {isFollowing ? 'Takipten Çık' : 'Takip Et'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* CARDS */}
        {renderCard({
          icon: "megaphone-outline",
          title: "Son Duyurular",
          content: (
            <>
              <Text style={styles.cardItem}>• Bahar şenlikleri 24 Nisan'da başlıyor!</Text>
              <Text style={styles.cardItem}>• Yüz yüze eğitime geçiş duyurusu yayımlandı.</Text>
            </>
          )
        })}

        {renderCard({
          icon: "chatbubbles-outline",
          title: "Forum",
          content: <Text style={styles.cardItemSmall}>Bu üniversitenin forum başlıklarını görüntüle</Text>,
          onPress: () => navigation.navigate('Forum', { universiteId: uniId }),
          showArrow: true
        })}

        {renderCard({
          icon: "help-circle-outline",
          title: "Sorular",
          content: <Text style={styles.cardItemSmall}>Bu üniversitenin sorularını görüntüle</Text>,
          onPress: () => navigation.navigate('QuestionList', { universiteId: uniId }),
          showArrow: true
        })}

        {/* FAKÜLTELER */}
        <View style={styles.sectionContainerModern}>
          <View style={styles.sectionHeaderRowModern}>
            <Icon name="school-outline" size={20} color="#f75c5b" />
            <Text style={styles.sectionTitleModern}>Fakülteler</Text>
          </View>
          {loadingFac ? (
            <View style={styles.loadingContainerModern}>
              <ActivityIndicator color="#f75c5b" size="large" />
            </View>
          ) : faculties.length === 0 ? (
            <View style={styles.emptyContainerModern}>
              <Icon name="school-outline" size={36} color="#f75c5b" style={{ opacity: 0.7, marginBottom: 8 }} />
              <Text style={styles.emptyTextModern}>Fakülte bulunamadı.</Text>
            </View>
          ) : (
            faculties.map((faculty, index) => (
              <Animated.View
                key={faculty.fakulteid}
                style={[
                  styles.facultyItemModern,
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateY: slideAnim },
                      { scale: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.97, 1]
                      })}
                    ]
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.facultyButtonModern}
                  onPress={() => navigation.push('FacultyDetail', { universite, faculty })}
                  activeOpacity={0.9}
                >
                  <View style={styles.facultyIconRowModern}>
                    <Icon name="school-outline" size={17} color="#f75c5b" style={styles.facultyIconModern} />
                    <Text style={styles.facultyNameModern}>{faculty.fakulteadi}</Text>
                  </View>
                  <Icon name="chevron-forward" size={17} color="#f75c5b" />
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 22, paddingTop: 44, paddingBottom: 36 },
  // HEADER
  headerModern: { alignItems: 'center', marginBottom: 30 },
  universityBadgeModern: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#f75c5b', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 18, elevation: 10 },
  uniTitleModern: { fontSize: 28, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 2, letterSpacing: 1.1, textShadowColor: 'rgba(0,0,0,0.22)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  uniSubtitleModern: { fontSize: 17, color: '#2D3436', opacity: 0.93, fontWeight: '600', textAlign: 'center', marginBottom: 2 },
  // STATS
  statsCardModern: { backgroundColor: '#fff', borderRadius: 26, marginBottom: 32, paddingVertical: 18, paddingHorizontal: 18, shadowColor: '#f75c5b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 10, elevation: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  statsRowModern: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 10 },
  statItemModern: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(247,92,91,0.10)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 13 },
  statTextModern: { color: '#f75c5b', fontSize: 15, marginLeft: 7, fontWeight: '800' },
  statsFollowRowModern: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  followButtonModern: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f75c5b', paddingVertical: 7, paddingHorizontal: 22, borderRadius: 18, shadowColor: '#f75c5b', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 5, minHeight: 34, maxWidth: 180, alignSelf: 'center' },
  followingButtonModern: { backgroundColor: '#ff8a5c' },
  followIconModern: { marginRight: 7 },
  followTextModern: { color: '#fff', fontWeight: '800', fontSize: 15 },
  followingTextModern: { color: '#fff' },
  // CARDS
  card: { backgroundColor: '#fff', borderRadius: 24, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.10, shadowRadius: 18, elevation: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  cardContent: { padding: 22 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(247, 92, 91, 0.13)', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#2D3436', flex: 1, letterSpacing: 0.3 },
  cardBody: { position: 'relative' },
  cardItem: { fontSize: 16, color: '#2D3436', marginBottom: 8, lineHeight: 22, fontWeight: '600' },
  cardItemSmall: { fontSize: 15, color: '#666', lineHeight: 20, fontWeight: '500' },
  cardArrow: { marginLeft: 10, backgroundColor: 'rgba(247, 92, 91, 0.13)', padding: 8, borderRadius: 12 },
  // FAKÜLTELER
  sectionContainerModern: { marginTop: 16 },
  sectionHeaderRowModern: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  sectionTitleModern: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: 0.4, textShadowColor: 'rgba(0,0,0,0.22)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
  loadingContainerModern: { padding: 20, alignItems: 'center' },
  emptyContainerModern: { flex: 1, alignItems: 'center', marginTop: 18 },
  emptyTextModern: { color: '#f75c5b', fontSize: 16, opacity: 0.8 },
  facultyItemModern: { marginBottom: 13 },
  facultyButtonModern: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.09, shadowRadius: 8, elevation: 2 },
  facultyIconRowModern: { flexDirection: 'row', alignItems: 'center' },
  facultyIconModern: { marginRight: 10 },
  facultyNameModern: { color: '#2D3436', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});
