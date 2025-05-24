// src/screens/Bolum_sayfasi/DepartmentQuestionDetailScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import ReactionButton from '../../components/ReactionButton';  // 👍/👎

const BASE = 'http://10.0.2.2:3000';

export default function DepartmentQuestionDetailScreen() {
  const { soru, department } = useRoute().params;
  const soruId = soru.soruid;
  const navigation = useNavigation();

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [detail, setDetail] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answerTxt, setAnswerTxt] = useState('');
  const [posting, setPosting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    loadDetail();
    startAnimations();
  }, [soruId]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // load question + answers + each answer's current user reaction
  const loadDetail = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/api/soru/detay/${soruId}`);
      setDetail(data);

      const enriched = await Promise.all(
        (data.cevaplar || []).map(async (c) => {
          const id = c.cevapId ?? c.cevapid;
          try {
            const { data: tepkiRes } = await axios.get(
              `${BASE}/api/soru/cevap/tepki/${id}`
            );
            return { ...c, kullaniciTepkisi: tepkiRes.tepki ?? null };
          } catch {
            return { ...c, kullaniciTepkisi: null };
          }
        })
      );
      setAnswers(enriched);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Detaylar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // post a new answer then re-load
  const handleSend = async () => {
    if (!answerTxt.trim()) return;
    setPosting(true);
    try {
      await axios.post(`${BASE}/api/soru/cevapOlustur`, {
        soruId,
        icerik: answerTxt.trim(),
      });
      setAnswerTxt('');
      loadDetail();
    } catch {
      Alert.alert('Hata', 'Cevap gönderilemedi');
    } finally {
      setPosting(false);
    }
  };

  if (loading || !detail) {
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
            <Text style={styles.loadingText}>Soru detayları yükleniyor...</Text>
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
              <Text style={styles.headerTitle}>Soru Detayı</Text>
              <Text style={styles.headerSubtitle}>{department.bolumadi}</Text>
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
            {/* Question Card */}
            <Animated.View
              style={[
                styles.questionCard,
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
                style={styles.questionGradient}
              >
                <View style={styles.questionHeader}>
                  <View style={styles.questionIconContainer}>
                    <LinearGradient
                      colors={['#f75c5b', '#ff8a5c']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.questionIcon}
                    >
                      <Icon name="help-circle" size={24} color="#fff" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.questionLabel}>SORU</Text>
                </View>
                <Text style={styles.questionText}>{soru.icerik}</Text>
                <View style={styles.questionMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="person-outline" size={16} color="#f75c5b" />
                    <Text style={styles.metaText}>{soru.kullaniciadi}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="time-outline" size={16} color="#f75c5b" />
                    <Text style={styles.metaText}>
                      {new Date(soru.olusturmaTarihi || Date.now()).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Answers Section */}
            <Animated.View
              style={[
                styles.answersSection,
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
              <View style={styles.answersSectionHeader}>
                <View style={styles.answersIconContainer}>
                  <Icon name="chatbubble-ellipses" size={20} color="#f75c5b" />
                </View>
                <Text style={styles.sectionTitle}>
                  Cevaplar ({answers.length})
                </Text>
              </View>

              {answers.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconContainer}>
                    <LinearGradient
                      colors={['rgba(247, 92, 91, 0.1)', 'rgba(255, 138, 92, 0.1)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.emptyIcon}
                    >
                      <Icon name="chatbubble-outline" size={32} color="#f75c5b" />
                    </LinearGradient>
                  </View>
                  <Text style={styles.emptyText}>Henüz cevap yok</Text>
                  <Text style={styles.emptySubText}>İlk cevabı veren sen ol!</Text>
                </View>
              ) : (
                answers.map((c, i) => {
                  const id = c.cevapId ?? c.cevapid;
                  const likeCnt = Number(c.likeSayisi ?? c.likesayisi ?? 0);
                  const dislikeCnt = Number(c.dislikeSayisi ?? c.dislikesayisi ?? 0);
                  const activeLike = c.kullaniciTepkisi === 'Like';
                  const activeDislike = c.kullaniciTepkisi === 'Dislike';

                  return (
                    <Animated.View
                      key={i}
                      style={[
                        styles.answerCard,
                        {
                          opacity: fadeAnim,
                          transform: [{
                            translateY: slideAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [40 + (i * 10), 0]
                            })
                          }]
                        }
                      ]}
                    >
                      <LinearGradient
                        colors={['#fff', '#f8f9fa']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.answerGradient}
                      >
                        <View style={styles.answerHeader}>
                          <View style={styles.answerAvatarContainer}>
                            <LinearGradient
                              colors={['#f75c5b', '#ff8a5c']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.answerAvatar}
                            >
                              <Icon name="person" size={16} color="#fff" />
                            </LinearGradient>
                          </View>
                          <View style={styles.answerUserInfo}>
                            <Text style={styles.answerUserName}>
                              {c.cevaplayanKullaniciAdi}
                            </Text>
                            <Text style={styles.answerDate}>
                              {new Date(c.olusturmaTarihi).toLocaleString('tr-TR')}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.answerText}>{c.icerik}</Text>
                        <View style={styles.answerReactions}>
                          <ReactionButton
                            type="Like"
                            cevapId={id}
                            countInit={likeCnt}
                            activeInit={activeLike}
                          />
                          <ReactionButton
                            type="Dislike"
                            cevapId={id}
                            countInit={dislikeCnt}
                            activeInit={activeDislike}
                          />
                        </View>
                      </LinearGradient>
                    </Animated.View>
                  );
                })
              )}
            </Animated.View>

            {/* Answer Input */}
            <Animated.View
              style={[
                styles.inputSection,
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
              <View style={styles.inputCard}>
                <LinearGradient
                  colors={['#fff', '#f8f9fa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.inputGradient}
                >
                  <View style={styles.inputHeader}>
                    <View style={styles.inputIconWrapper}>
                      <Icon name="create-outline" size={18} color="#f75c5b" />
                    </View>
                    <Text style={styles.inputLabel}>Cevabınızı yazın</Text>
                  </View>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Cevabınızı buraya yazın..."
                    placeholderTextColor="#999"
                    multiline
                    value={answerTxt}
                    onChangeText={setAnswerTxt}
                    maxLength={300}
                    textAlignVertical="top"
                  />
                  <View style={styles.inputFooter}>
                    <Text style={styles.charCount}>
                      {answerTxt.length}/300 karakter
                    </Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { width: `${(answerTxt.length / 300) * 100}%` }
                        ]} 
                      />
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.sendButton,
                        (!answerTxt.trim() || posting) && styles.sendButtonDisabled
                      ]}
                      disabled={!answerTxt.trim() || posting}
                      onPress={handleSend}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={
                          (!answerTxt.trim() || posting)
                            ? ['#ccc', '#999']
                            : ['#f75c5b', '#ff8a5c']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.sendGradient}
                      >
                        {posting ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Icon name="send" size={18} color="#fff" />
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
    marginBottom: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  questionCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  questionGradient: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(247, 92, 91, 0.1)',
    borderRadius: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionIconContainer: {
    marginRight: 12,
  },
  questionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  questionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#f75c5b',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    lineHeight: 26,
    marginBottom: 16,
  },
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#636E72',
    marginLeft: 6,
    fontWeight: '500',
  },
  answersSection: {
    marginBottom: 24,
  },
  answersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  answersIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2D3436',
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  emptyText: {
    fontSize: 16,
    color: '#636E72',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  answerCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  answerGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    borderRadius: 16,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  answerAvatarContainer: {
    marginRight: 12,
  },
  answerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  answerUserInfo: {
    flex: 1,
  },
  answerUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 2,
  },
  answerDate: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  answerText: {
    fontSize: 15,
    color: '#2D3436',
    lineHeight: 22,
    marginBottom: 12,
  },
  answerReactions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inputSection: {
    marginTop: 8,
  },
  inputCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  inputGradient: {
    padding: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(247, 92, 91, 0.1)',
    borderRadius: 16,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    color: '#2D3436',
    backgroundColor: 'rgba(248, 249, 250, 0.8)',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
    textAlignVertical: 'top',
    lineHeight: 22,
    marginBottom: 12,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  charCount: {
    fontSize: 12,
    color: '#636E72',
    fontWeight: '500',
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginHorizontal: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f75c5b',
    borderRadius: 2,
  },
  sendButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  sendButtonDisabled: {
    shadowOpacity: 0.05,
    elevation: 2,
  },
  sendGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
