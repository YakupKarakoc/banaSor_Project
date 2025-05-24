import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import LikeButton from '../components/LikeButton';
import axios from 'axios';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

export default function KonularScreen({ navigation }) {
  // Screen State: 'topics' or 'questions'
  const [screenMode, setScreenMode] = useState('topics');
  
  // Selected Topic Data
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Topics Data
  const [konular, setKonular] = useState([]);
  const [loadingKonular, setLoadingKonular] = useState(true);

  // Questions Data (for selected topic)
  const [sorular, setSorular] = useState([]);
  const [loadingSorular, setLoadingSorular] = useState(false);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    loadKonular();
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

  // Load Topics
  const loadKonular = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/soru/konu/getir`);
      setKonular(res.data);
    } catch (err) {
      console.error('Konular yüklenirken hata:', err);
    } finally {
      setLoadingKonular(false);
    }
  };

  // Load Questions for Selected Topic
  const loadTopicQuestions = async (topicId) => {
    setLoadingSorular(true);
    try {
      // Get all questions and filter by topic
      const res = await axios.get(`${BASE_URL}/api/soru/getir`);
      const allQuestions = res.data;
      
      // Filter questions by topic ID
      const topicQuestions = allQuestions.filter(q => {
        const questionTopicId = q.konuId || q.konuid;
        return questionTopicId === topicId;
      });

      // Enrich with like data
      const enriched = await Promise.all(
        topicQuestions.map(async q => {
          try {
            const begRes = await axios.get(`${BASE_URL}/api/soru/begeni/${q.soruid}`);
            return {
              ...q,
              kullaniciBegendiMi: begRes.data?.begendiMi ?? false,
            };
          } catch (err) {
            return { ...q, kullaniciBegendiMi: false };
          }
        })
      );

      setSorular(enriched);
    } catch (err) {
      console.error('Konu soruları yüklenirken hata:', err);
    } finally {
      setLoadingSorular(false);
    }
  };

  // Handle Topic Selection
  const handleTopicPress = (topic) => {
    const topicId = topic.konuId || topic.konuid;
    setSelectedTopic(topic);
    setScreenMode('questions');
    loadTopicQuestions(topicId);
    
    // Reset and restart animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    startAnimations();
  };

  // Handle Back to Topics
  const handleBackToTopics = () => {
    setScreenMode('topics');
    setSelectedTopic(null);
    setSorular([]);
    
    // Reset and restart animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    startAnimations();
  };

  // Render Topic Item
  const renderTopicItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.modernTopicCard,
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
        style={styles.modernTopicContent}
        onPress={() => handleTopicPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.modernTopicHeader}>
          <View style={styles.modernTopicAvatar}>
            <Icon name="bookmark" size={20} color="#fff" />
          </View>
          <View style={styles.modernTopicInfo}>
            <Text style={styles.modernTopicTitle}>{item.ad ?? '—'}</Text>
            <View style={styles.modernTopicBadge}>
              <Text style={styles.modernTopicBadgeText}>
                {item.soruSayisi ?? 0} SORU
              </Text>
            </View>
          </View>
          <View style={styles.modernTopicArrow}>
            <Icon name="chevron-forward" size={20} color="#ccc" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render Question Item
  const renderQuestionItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.modernQuestionCard,
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
        style={styles.modernQuestionContent}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('QuestionDetail', { soruId: item.soruid })}
      >
        <View style={styles.modernQuestionHeader}>
          <View style={styles.modernQuestionAvatar}>
            <Icon name="help-circle" size={20} color="#fff" />
          </View>
          <View style={styles.modernQuestionInfo}>
            <Text style={styles.modernQuestionTitle} numberOfLines={2}>
              {item.icerik}
            </Text>
            <View style={styles.modernQuestionMeta}>
              <Icon name="person" size={14} color="#6c5ce7" />
              <Text style={styles.modernQuestionMetaText}>{item.kullaniciadi}</Text>
              <Icon name="chatbubbles" size={14} color="#00b894" style={{ marginLeft: 12 }} />
              <Text style={styles.modernQuestionMetaText}>{item.cevapsayisi || 0} cevap</Text>
            </View>
          </View>
        </View>

        <View style={styles.modernQuestionActions}>
          <LikeButton
            soruId={item.soruid}
            likedInit={item.kullaniciBegendiMi}
            countInit={item.begenisayisi}
            dark={false}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  // Render Content Based on Screen Mode
  const renderContent = () => {
    if (screenMode === 'topics') {
      // Topics View
      if (loadingKonular) {
        return (
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#f75c5b" />
            </View>
            <Text style={styles.modernLoadingText}>Konular yükleniyor...</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={konular}
          keyExtractor={(item, index) => {
            const id = item.konuId ?? item.konuid ?? index;
            return id.toString();
          }}
          renderItem={renderTopicItem}
          contentContainerStyle={styles.modernListContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.modernEmptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="bookmark-outline" size={80} color="#f75c5b" />
              </View>
              <Text style={styles.modernEmptyText}>Henüz konu bulunmuyor</Text>
              <Text style={styles.modernEmptySubText}>Konular yakında eklenecek</Text>
            </View>
          )}
        />
      );
    } else {
      // Questions View
      if (loadingSorular) {
        return (
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#f75c5b" />
            </View>
            <Text style={styles.modernLoadingText}>Sorular yükleniyor...</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={sorular}
          keyExtractor={item => item.soruid.toString()}
          renderItem={renderQuestionItem}
          contentContainerStyle={styles.modernListContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.modernEmptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Icon name="help-circle-outline" size={80} color="#f75c5b" />
              </View>
              <Text style={styles.modernEmptyText}>Bu konuda henüz soru yok</Text>
              <Text style={styles.modernEmptySubText}>İlk soruyu sen sor!</Text>
            </View>
          )}
        />
      );
    }
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
            <TouchableOpacity 
              style={styles.modernBackBtn} 
              onPress={screenMode === 'questions' ? handleBackToTopics : () => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              {screenMode === 'topics' ? (
                <>
                  <Text style={styles.modernHeaderTitle}>Konular</Text>
                  <Text style={styles.modernHeaderSubtitle}>TÜM KONULAR</Text>
                </>
              ) : (
                <>
                  <Text style={styles.modernHeaderTitle}>{selectedTopic?.ad}</Text>
                  <Text style={styles.modernHeaderSubtitle}>KONU SORULARI</Text>
                </>
              )}
            </View>
            
            <View style={styles.modernHeaderIcon}>
              <Icon name="search" size={24} color="#fff" />
            </View>
          </View>
          
          {/* Breadcrumb for Questions View */}
          {screenMode === 'questions' && (
            <View style={styles.breadcrumbContainer}>
              <TouchableOpacity 
                style={styles.breadcrumbItem}
                onPress={handleBackToTopics}
              >
                <Icon name="bookmark" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.breadcrumbText}>Konular</Text>
              </TouchableOpacity>
              <Icon name="chevron-forward" size={14} color="rgba(255,255,255,0.6)" />
              <View style={styles.breadcrumbItem}>
                <Icon name="help-circle" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>
                  {selectedTopic?.ad}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Content Container */}
        <View style={styles.modernContentContainer}>
          {renderContent()}
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

  // BREADCRUMB
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
  },
  breadcrumbItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    marginLeft: 4,
    marginRight: 8,
  },
  breadcrumbActive: {
    color: '#fff',
    fontWeight: '800',
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

  // TOPIC CARDS
  modernTopicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernTopicContent: {
    padding: 16,
  },
  modernTopicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernTopicAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modernTopicInfo: {
    flex: 1,
  },
  modernTopicTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  modernTopicBadge: {
    backgroundColor: '#f75c5b',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  modernTopicBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modernTopicArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  // QUESTION CARDS  
  modernQuestionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.05)',
  },
  modernQuestionContent: {
    padding: 16,
  },
  modernQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modernQuestionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  modernQuestionInfo: {
    flex: 1,
  },
  modernQuestionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    lineHeight: 20,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  modernQuestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernQuestionMetaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modernQuestionActions: {
    alignItems: 'flex-end',
  },

  // LOADING & EMPTY STATES
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
  modernEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  modernEmptyText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  modernEmptySubText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
