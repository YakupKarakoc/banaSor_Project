// src/screens/QuestionListScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LikeButton from '../../components/LikeButton';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function QuestionListScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params || {};
  const navigation = useNavigation();
  const isFocused  = useIsFocused();

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    loadQuestions();
    startAnimations();
  }, [universiteId, fakulteId, bolumId, isFocused]);

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

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/soru/getir';
      const params = {};

      if (fakulteId) {
        endpoint = '/api/soru/getir/fakulte';
        params.fakulteId = fakulteId;
      } else if (bolumId) {
        endpoint = '/api/soru/getir/bolum';
        params.bolumId = bolumId;
      } else if (universiteId) {
        endpoint = '/api/soru/getir/universite';
        params.universiteId = universiteId;
      }

      const res = await axios.get(`${BASE}${endpoint}`, { params });
      const questionList = res.data;

      // Beğeni bilgilerini de kontrol et (her soru için)
      const enriched = await Promise.all(
        questionList.map(async q => {
          try {
            const begRes = await axios.get(`${BASE}/api/soru/begeni/${q.soruid}`);
            return {
              ...q,
              kullaniciBegendiMi: begRes.data?.begendiMi ?? false,
            };
          } catch (err) {
            return { ...q, kullaniciBegendiMi: false };
          }
        })
      );

      setQuestions(enriched);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Sorular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.modernQuestionCard,
        {
          opacity: fadeAnim,
          transform: [
            { 
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [index * 5 + 20, 0]
              })
            }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.modernQuestionContent}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('QuestionDetail', { soruId: item.soruid })}
      >
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.questionCardGradient}
        >
          <View style={styles.modernQuestionHeader}>
            <View style={styles.modernQuestionAvatar}>
              <LinearGradient
                colors={['#f75c5b', '#ff8a5c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradient}
              >
                <Icon name="help-circle" size={20} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.modernQuestionInfo}>
              <Text style={styles.modernQuestionTitle} numberOfLines={2}>
                {item.icerik}
              </Text>
              <View style={styles.modernQuestionMeta}>
                <View style={styles.metaItem}>
                  <Icon name="person" size={14} color="#f75c5b" />
                  <Text style={styles.modernQuestionMetaText}>{item.kullaniciadi}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="chatbubble-ellipses" size={14} color="#f75c5b" />
                  <Text style={styles.modernQuestionMetaText}>{item.cevapsayisi} cevap</Text>
                </View>
              </View>
            </View>
            <View style={styles.modernQuestionActions}>
              <View style={styles.likeButtonContainer}>
                <LikeButton
                  soruId={item.soruid}
                  likedInit={item.kullaniciBegendiMi}
                  countInit={item.begenisayisi}
                  dark
                />
              </View>
              <View style={styles.modernQuestionArrow}>
                <Icon name="chevron-forward" size={18} color="#f75c5b" />
              </View>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
        <LinearGradient 
          colors={['#f75c5b', '#ff8a5c']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingText}>Sorular yükleniyor...</Text>
            <Text style={styles.modernLoadingSubText}>Lütfen bekleyin</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient 
        colors={['#f75c5b', '#ff8a5c']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Fixed Header - Always Visible */}
        <View style={styles.fixedHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Sorular</Text>
              <Text style={styles.headerSubtitle}>SORU & CEVAP</Text>
            </View>
            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => navigation.navigate('NewQuestion', { universiteId, fakulteId, bolumId })}
              activeOpacity={0.8}
            >
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Stats Card - Compact */}
          <Animated.View 
            style={[
              styles.compactStatsCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['#fff', '#f8f9fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.compactStatsGradient}
            >
              <View style={styles.compactStatsContent}>
                <View style={styles.compactStatsIcon}>
                  <LinearGradient
                    colors={['#f75c5b', '#ff8a5c']}
                    style={styles.compactIconGradient}
                  >
                    <Icon name="help-circle" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.compactStatsInfo}>
                  <Text style={styles.compactStatsTitle}>Sorular & Cevaplar</Text>
                  <Text style={styles.compactStatsSubtitle}>
                    {questions.length} aktif soru • Bilgi paylaş
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.compactStatsAction}
                  onPress={() => navigation.navigate('NewQuestion', { universiteId, fakulteId, bolumId })}
                  activeOpacity={0.8}
                >
                  <Icon name="add-circle" size={20} color="#f75c5b" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </Animated.View>

          {questions.length === 0 ? (
            <Animated.View 
              style={[
                styles.compactEmptyContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.compactEmptyIcon}>
                <LinearGradient
                  colors={['rgba(247, 92, 91, 0.1)', 'rgba(255, 138, 92, 0.1)']}
                  style={styles.compactEmptyIconBg}
                >
                  <Icon name="help-circle-outline" size={60} color="#f75c5b" />
                </LinearGradient>
              </View>
              <Text style={styles.compactEmptyText}>Henüz soru yok</Text>
              <Text style={styles.compactEmptySubText}>
                İlk soruyu sorarak bilgi paylaşımına başla!
              </Text>
              <TouchableOpacity
                style={styles.compactCreateButton}
                onPress={() => navigation.navigate('NewQuestion', { universiteId, fakulteId, bolumId })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#f75c5b', '#ff8a5c']}
                  style={styles.compactCreateGradient}
                >
                  <Icon name="add-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.compactCreateText}>Soru Sor</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            <FlatList
              data={questions}
              keyExtractor={item => item.soruid.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.compactListContainer}
              showsVerticalScrollIndicator={false}
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
    flex: 1 
  },

  // LOADING STATE
  modernLoadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: { 
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modernLoadingText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  modernLoadingSubText: { 
    color: 'rgba(255,255,255,0.8)', 
    fontSize: 14, 
    fontWeight: '500',
    textAlign: 'center',
  },

  // FIXED HEADER
  fixedHeader: { 
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerBtn: { 
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitleContainer: { 
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: { 
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 2,
    textAlign: 'center',
  },

  // MAIN CONTENT
  mainContent: { 
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  // COMPACT STATS CARD
  compactStatsCard: { 
    backgroundColor: 'transparent',
    borderRadius: 18,
    margin: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  compactStatsGradient: { 
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  compactStatsContent: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactStatsIcon: { 
    marginRight: 16,
  },
  compactIconGradient: { 
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  compactStatsInfo: { 
    flex: 1,
  },
  compactStatsTitle: { 
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  compactStatsSubtitle: { 
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  compactStatsAction: { 
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },

  // QUESTION CARDS - MORE COMPACT
  modernQuestionCard: { 
    backgroundColor: 'transparent',
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  questionCardGradient: { 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.08)',
  },
  modernQuestionContent: { 
    padding: 16,
  },
  modernQuestionHeader: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  modernQuestionAvatar: { 
    marginRight: 12,
  },
  avatarGradient: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  modernQuestionInfo: { 
    flex: 1,
  },
  modernQuestionTitle: { 
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  modernQuestionMeta: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
  },
  modernQuestionMetaText: { 
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  modernQuestionActions: { 
    flexDirection: 'row', 
    alignItems: 'center',
    marginLeft: 8,
  },
  likeButtonContainer: { 
    marginRight: 6,
  },
  modernQuestionArrow: { 
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // EMPTY STATE - COMPACT
  compactEmptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  compactEmptyIcon: { 
    marginBottom: 24,
  },
  compactEmptyIconBg: { 
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  compactEmptyText: { 
    color: '#2D3436',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  compactEmptySubText: { 
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 32,
    lineHeight: 22,
  },
  compactCreateButton: { 
    borderRadius: 24,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  compactCreateGradient: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
  },
  compactCreateText: { 
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.4,
  },

  // LIST
  compactListContainer: { 
    paddingTop: 8,
    paddingBottom: 32,
  },
});
