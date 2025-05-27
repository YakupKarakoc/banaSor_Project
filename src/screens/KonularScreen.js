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
  Modal,
  TextInput,
  Platform,
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

  // --- Üniversite filtreleme için state'ler ---
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  // --- Benzersiz üniversite adlarını çıkar ---
  const uniqueUniversities = Array.from(new Set(sorular.map(s => s.universiteAd || s.universitead || s.universiteadi || s.universiteAdi || s.university || s.universite).filter(Boolean)));
  const filteredUniversities = uniqueUniversities.filter(u => u.toLowerCase().includes(universitySearch.toLowerCase()));

  // --- Soruları filtrele ---
  const filteredSorular = selectedUniversity
    ? sorular.filter(s => (s.universiteAd || s.universitead || s.universiteadi || s.universiteAdi || s.university || s.universite) === selectedUniversity)
    : sorular;

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

 // Load Questions for Selected Topic (YENİ API'ye göre)
const loadTopicQuestions = async (topicId) => {
  setLoadingSorular(true);
  try {
    console.log('Konu soruları yükleniyor, topicId:', topicId);
    const res = await axios.get(`${BASE_URL}/api/soru/getir/konu`, {
      params: { konuId: topicId }
    });
    console.log('API Response:', res.data);
    console.log('Sorular sayısı:', res.data?.length || 0);
    setSorular(res.data || []);
  } catch (err) {
    console.error('Konu soruları yüklenirken hata:', err);
    console.error('Error response:', err.response?.data);
    setSorular([]); // hata anında boşalt
  } finally {
    setLoadingSorular(false);
  }
};


  // Handle Topic Selection
  const handleTopicPress = (topic) => {
    console.log('Topic seçildi:', topic); // Debug log
    const topicId = topic.konuId || topic.konuid || topic.id;
    console.log('Topic ID:', topicId); // Debug log
    
    if (!topicId) {
      console.error('Topic ID bulunamadı!');
      return;
    }
    
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
   
    
    // Reset and restart animations
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    startAnimations();
  };

  // Render Topic Item
  const renderTopicItem = ({ item, index }) => (
    <View
      style={styles.modernTopicCard}
    >
      <TouchableOpacity
        style={styles.modernTopicContent}
        onPress={() => handleTopicPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.modernTopicHeader}>
          <View style={styles.modernTopicAvatar}>
            <Icon name="bookmark" size={24} color="#fff" />
          </View>
          <View style={styles.modernTopicInfo}>
            <Text style={styles.modernTopicTitle}>{item.ad ?? '—'}</Text>
          </View>
          <View style={styles.modernTopicArrow}>
            <Icon name="chevron-forward" size={22} color="#f75c5b" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
const renderQuestionItem = ({ item, index }) => {
  // Debug log temizlendi
  
  const soruId = item.soruId || item.soruIdsi || item.soruid || item.id;
  const icerik = item.icerik || item.soru || item.content || 'Soru içeriği yok';
  const kullaniciAdi = item.kullaniciAdi || item.kullaniciadi || item.username || 'Bilinmeyen';
  const cevapSayisi = item.cevapSayisi || item.cevapsayisi || item.answerCount || 0;
  const begeniSayisi = item.begeniSayisi || item.begenisayisi || item.likeCount || 0;
  
  // Üniversite bilgisi için farklı field isimlerini kontrol et
  const universiteName = item.universiteAd || item.universitead || item.universiteadi || item.universiteAdi || item.university || item.universite || null;
  
  // Debug: Üniversite bilgisini kontrol et
  if (index === 0) { // Sadece ilk item için log bas ki spam olmasın
    console.log('Soru verisi sample:', JSON.stringify(item, null, 2));
    console.log('Üniversite adı:', universiteName);
  }

  return (
    <View
      style={[
        styles.modernQuestionCard,
        // Debug stilleri temizlendi, normal stiller
      ]}
    >
      <TouchableOpacity
        style={styles.modernQuestionContent}
        activeOpacity={0.8}
        onPress={() => soruId && navigation.navigate('QuestionDetail', { soruId })}
      >
        <View style={styles.modernQuestionHeader}>
          <View style={styles.modernQuestionAvatar}>
            <Icon name="help-circle" size={20} color="#fff" />
          </View>
          <View style={styles.modernQuestionInfo}>
            <Text style={styles.modernQuestionTitle} numberOfLines={2}>
              {icerik}
            </Text>
            <View style={styles.modernQuestionMeta}>
              <Icon name="person" size={14} color="#6c5ce7" />
              <Text style={styles.modernQuestionMetaText}>
                {kullaniciAdi}
              </Text>
              {universiteName && (
                <View style={styles.universityBadge}>
                  <Icon name="school" size={14} color="#e17055" style={{ marginRight: 4 }} />
                  <Text style={styles.universityBadgeText}>{universiteName}</Text>
                </View>
              )}
              <Icon
                name="chatbubbles"
                size={14}
                color="#00b894"
                style={{ marginLeft: 12 }}
              />
              <Text style={styles.modernQuestionMetaText}>
                {parseInt(cevapSayisi, 10)} cevap
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.modernQuestionActions}>
          <LikeButton
            soruId={soruId}
            likedInit={false}
            countInit={parseInt(begeniSayisi, 10)}
            dark={false}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};


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
      // Debug log temizlendi
      
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
  data={filteredSorular}
  extraData={filteredSorular}  
keyExtractor={(item, index) => {
    const id = item.soruId || item.soruIdsi || item.soruid || item.id || index;
    return id.toString();
  }}
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

  // --- Filtre butonu ---
  const renderFilterButton = () => (
    <TouchableOpacity
      style={styles.filterButton}
      onPress={() => setFilterModalVisible(true)}
    >
      <Icon name="filter" size={20} color="#f75c5b" />
      <Text style={styles.filterButtonText}>{selectedUniversity ? selectedUniversity : 'Üniversite Filtrele'}</Text>
      {selectedUniversity && (
        <TouchableOpacity onPress={() => setSelectedUniversity(null)}>
          <Icon name="close-circle" size={18} color="#e17055" style={{ marginLeft: 6 }} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  // --- Filtre modalı ---
  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="slide"
      transparent
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Üniversite Seç</Text>
          <TextInput
            style={styles.modalSearch}
            placeholder="Üniversite ara..."
            value={universitySearch}
            onChangeText={setUniversitySearch}
            autoFocus
          />
          <FlatList
            data={filteredUniversities}
            keyExtractor={(item, idx) => item + idx}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedUniversity(item);
                  setFilterModalVisible(false);
                }}
              >
                <Icon name="school" size={18} color="#e17055" style={{ marginRight: 8 }} />
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.modalEmpty}>Sonuç yok</Text>}
            keyboardShouldPersistTaps="handled"
          />
          <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setFilterModalVisible(false)}>
            <Text style={styles.modalCloseText}>Kapat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
          {screenMode === 'questions' && renderFilterButton()}
          {renderContent()}
        </View>
      </LinearGradient>
      {screenMode === 'questions' && renderFilterModal()}
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
  backgroundColor: '#f2f2f2',   // daha açık gri bir zemin
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
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },

  // TOPIC CARDS
  modernTopicCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
    overflow: 'hidden',
  },
  modernTopicContent: {
    padding: 20,
  },
  modernTopicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernTopicAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  modernTopicInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modernTopicTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
    lineHeight: 24,
    letterSpacing: 0.5,
  },
  modernTopicArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 92, 91, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.15)',
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
    borderColor: '#e0e0e0',           // hafif gri border
    minHeight: 100, // minimum height
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
    fontSize: 16,
    fontWeight: '800',
    color: '#2D3436',         // daha koyu renk
    lineHeight: 22,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  modernQuestionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // açık gri arka plan ekle
    padding: 8,
    borderRadius: 8,
    flexWrap: 'wrap', // Uzun üniversite adları için wrap ekle
  },
  modernQuestionMetaText: {
    fontSize: 13,
    color: '#2D3436',
    marginLeft: 4,
    fontWeight: '700',
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
  universityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4e6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
    marginRight: 6,
    marginTop: 2,
  },
  universityBadgeText: {
    color: '#e17055',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.2,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e17055',
    borderRadius: 8,
    marginBottom: 16,
  },
  filterButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e17055',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 16,
  },
  modalSearch: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 16,
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
  },
  modalEmpty: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  modalCloseBtn: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e17055',
  },
});
