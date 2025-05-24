import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function NewDepartmentQuestionScreen() {
  const { bolumId } = useRoute().params;
  const navigation = useNavigation();

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [konular, setKonular] = useState([]);
  const [selectedKonu, setSelectedKonu] = useState(null);
  const [icerik, setIcerik] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    loadTopics();
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

  const loadTopics = () => {
    axios
      .get(`${BASE}/api/soru/konu/getir`)
      .then(res => setKonular(res.data))
      .catch(() => Alert.alert('Hata', 'Konular yüklenemedi'))
      .finally(() => setLoading(false));
  };

  const handleSubmit = () => {
    if (!selectedKonu) return Alert.alert('Hata', 'Lütfen bir konu seçin');
    if (!icerik.trim()) return Alert.alert('Hata', 'Sorunuzu yazın');

    setPosting(true);
    axios
      .post(`${BASE}/api/soru/soruOlustur`, {
        bolumId,
        konuId: selectedKonu,
        icerik: icerik.trim(),
      })
      .then(() => {
        Alert.alert('Başarılı', 'Soru oluşturuldu', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ]);
      })
      .catch(() => Alert.alert('Hata', 'Soru oluşturulamadı'))
      .finally(() => setPosting(false));
  };

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
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.loadingText}>Konular yükleniyor...</Text>
            <Text style={styles.loadingSubText}>Lütfen bekleyin</Text>
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
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Yeni Soru</Text>
              <Text style={styles.headerSubtitle}>BÖLÜM SORUSU</Text>
            </View>
            <View style={styles.headerBtn}>
              <Icon name="help-circle" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Main Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.mainContent}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Icon Header */}
            <Animated.View
              style={[
                styles.iconHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={['#f75c5b', '#ff8a5c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Icon name="help-circle" size={36} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.pageTitle}>Bölüm Sorusu Oluştur</Text>
              <Text style={styles.pageSubtitle}>
                Bölümünle ilgili sorun var mı? Hemen sor!
              </Text>
            </Animated.View>

            {/* Topic Selection */}
            <Animated.View 
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.sectionTitle}>Konu Seçin</Text>
              <View style={styles.topicGrid}>
                {konular.map((k, index) => (
                  <TouchableOpacity
                    key={k.konuid.toString()}
                    style={[
                      styles.topicChip,
                      selectedKonu === k.konuid && styles.topicChipSelected,
                    ]}
                    onPress={() => setSelectedKonu(k.konuid)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        selectedKonu === k.konuid 
                          ? ['#f75c5b', '#ff8a5c']
                          : ['#fff', '#f8f9fa']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.topicChipGradient}
                    >
                      <Icon 
                        name={selectedKonu === k.konuid ? "checkmark-circle" : "ellipse-outline"} 
                        size={16} 
                        color={selectedKonu === k.konuid ? "#fff" : "#f75c5b"} 
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={[
                          styles.topicChipText,
                          selectedKonu === k.konuid && styles.topicChipTextSelected,
                        ]}
                      >
                        {k.ad}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Question Input */}
            <Animated.View 
              style={[
                styles.section,
                {
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [40, 0]
                    })
                  }]
                }
              ]}
            >
              <Text style={styles.sectionTitle}>Sorunuz</Text>
              <View style={styles.inputCard}>
                <LinearGradient
                  colors={['#fff', '#f8f9fa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputGradient}
                >
                  <View style={styles.inputHeader}>
                    <View style={styles.inputIconWrapper}>
                      <Icon name="create-outline" size={20} color="#f75c5b" />
                    </View>
                    <Text style={styles.inputLabel}>Sorunuzu detaylı yazın</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Sorunuzu buraya yazın..."
                    placeholderTextColor="#999"
                    multiline
                    value={icerik}
                    onChangeText={setIcerik}
                    maxLength={500}
                    textAlignVertical="top"
                    autoCorrect={true}
                    autoCapitalize="sentences"
                    keyboardType="default"
                    textContentType="none"
                    autoComplete="off"
                  />
                  <View style={styles.inputFooter}>
                    <Text style={styles.charCount}>
                      {icerik.length}/500 karakter
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${(icerik.length / 500) * 100}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Submit Button */}
            <Animated.View
              style={[
                {
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [60, 0]
                    })
                  }]
                }
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.submitButton, 
                  (!selectedKonu || !icerik.trim() || posting) && styles.submitButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={!selectedKonu || !icerik.trim() || posting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    (!selectedKonu || !icerik.trim() || posting) 
                      ? ['#ccc', '#999'] 
                      : ['#f75c5b', '#ff8a5c']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.submitGradient}
                >
                  {posting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Icon name="send" size={18} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.submitText}>Soruyu Gönder</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Info Card */}
            <Animated.View
              style={[
                styles.infoCard,
                {
                  opacity: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.8]
                  }),
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [80, 0]
                    })
                  }]
                }
              ]}
            >
              <LinearGradient
                colors={['rgba(247, 92, 91, 0.08)', 'rgba(255, 138, 92, 0.08)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoGradient}
              >
                <View style={styles.infoContent}>
                  <Icon name="information-circle" size={20} color="#f75c5b" />
                  <Text style={styles.infoText}>
                    Sorunuz bölüm öğrencileri tarafından görülecek ve cevaplar alacaksınız.
                  </Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

/* --- stil --- */
const styles = StyleSheet.create({
  // MAIN CONTAINERS
  safeContainer: {
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  container: {
    flex: 1,
  },

  // LOADING STATE
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    marginBottom: 8,
  },
  loadingSubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // PREMIUM HEADER
  header: {
    paddingTop: 15,
    paddingHorizontal: 18,
    paddingBottom: 25,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
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
  headerTitleContainer: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.2,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 3,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // PREMIUM MAIN CONTENT
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },
  scrollContainer: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 32,
  },

  // ELEGANT ICON HEADER
  iconHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  iconContainer: {
    marginBottom: 16,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  iconGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  pageTitle: {
    color: '#2D3436',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  pageSubtitle: {
    color: '#636e72',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
    lineHeight: 22,
  },

  // MODERN SECTIONS
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 14,
    letterSpacing: 0.5,
  },

  // LUXURY TOPIC SELECTION
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    margin: 2,
  },
  topicChipSelected: {
    shadowColor: '#f75c5b',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  topicChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.12)',
  },
  topicChipText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#636e72',
  },
  topicChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },

  // PREMIUM INPUT SECTION
  inputCard: {
    borderRadius: 20,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  inputGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  inputIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 92, 91, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '700',
    letterSpacing: 0.4,
    flex: 1,
  },
  textInput: {
    fontSize: 15,
    color: '#2D3436',
    backgroundColor: 'rgba(248, 249, 250, 0.6)',
    borderRadius: 16,
    padding: 18,
    minHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
    textAlignVertical: 'top',
    lineHeight: 22,
    marginBottom: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    fontSize: 12,
    color: '#777',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(247, 92, 91, 0.15)',
    borderRadius: 3,
    marginLeft: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f75c5b',
    borderRadius: 3,
  },

  // LUXURY SUBMIT BUTTON
  submitButton: {
    borderRadius: 28,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    marginTop: 8,
    marginBottom: 18,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ELEGANT INFO CARD
  infoCard: {
    marginTop: 12,
    borderRadius: 18,
  },
  infoGradient: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.12)',
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
  },
  infoText: {
    color: '#636e72',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 14,
    flex: 1,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
});
