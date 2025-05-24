// src/screens/QuestionDetailScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import ReactionButton from '../../components/ReactionButton';  // 👍/👎

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function QuestionDetailScreen() {
  const { soruId } = useRoute().params;
  const navigation = useNavigation();

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [question, setQuestion]   = useState(null);
  const [answers, setAnswers]     = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading]     = useState(true);
  const [posting, setPosting]     = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Fetch question + answers + user reactions
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/api/soru/detay/${soruId}`);

      // Set question info
      setQuestion({
        icerik: data.icerik,
        soranKullaniciAdi: data.soranKullaniciAdi,
        olusturmaTarihi: data.olusturmaTarihi,
      });

      // Enrich each answer with current user's reaction
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
      Alert.alert('Hata', 'Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    startAnimations();
  }, [soruId]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 900, useNativeDriver: true }),
    ]).start();
  };

  // Add a new answer
  const handleAddAnswer = async () => {
    if (!newAnswer.trim()) {
      return Alert.alert('Hata', 'Lütfen bir cevap girin.');
    }
    setPosting(true);
    try {
      await axios.post(`${BASE}/api/soru/cevapOlustur`, {
        soruId,
        icerik: newAnswer.trim(),
      });
      setNewAnswer('');
      fetchData();
    } catch {
      Alert.alert('Hata', 'Cevap eklenemedi');
    } finally {
      setPosting(false);
    }
  };

  if (loading || !question) {
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
            <Text style={styles.modernLoadingText}>Soru yükleniyor...</Text>
            <Text style={styles.modernLoadingSubText}>Lütfen bekleyin</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Render each answer with reaction buttons
  const renderAnswer = ({ item, index }) => {
    const id         = item.cevapId ?? item.cevapid;
    const likeCnt    = Number(item.likeSayisi    ?? item.likesayisi    ?? 0);
    const dislikeCnt = Number(item.dislikeSayisi ?? item.dislikesayisi ?? 0);

    return (
      <Animated.View
        style={[
          styles.modernAnswerCard,
          {
            opacity: fadeAnim,
            transform: [
              { 
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [index * 15 + 40, 0]
                })
              },
              {
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.answerCardGradient}
        >
          <View style={styles.modernAnswerContent}>
            <View style={styles.modernAnswerHeader}>
              <View style={styles.modernAnswerAvatar}>
                <LinearGradient
                  colors={['#f75c5b', '#ff8a5c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.answerAvatarGradient}
                >
                  <Icon name="person" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.modernAnswerInfo}>
                <Text style={styles.modernAnswerUser}>{item.cevaplayanKullaniciAdi}</Text>
                <Text style={styles.modernAnswerTime}>
                  {new Date(item.olusturmaTarihi).toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={styles.answerBadge}>
                <Icon name="chatbubble" size={14} color="#f75c5b" />
              </View>
            </View>
            
            <Text style={styles.modernAnswerText}>{item.icerik}</Text>
            
            <View style={styles.modernAnswerFooter}>
              <View style={styles.modernReactions}>
                <ReactionButton
                  type="Like"
                  cevapId={id}
                  countInit={likeCnt}
                  activeInit={item.kullaniciTepkisi === 'Like'}
                />
                <ReactionButton
                  type="Dislike"
                  cevapId={id}
                  countInit={dislikeCnt}
                  activeInit={item.kullaniciTepkisi === 'Dislike'}
                />
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient 
        colors={['#f75c5b', '#ff8a5c']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Soru Detayı</Text>
              <Text style={styles.modernHeaderSubtitle}>CEVAPLAR & TEPKİLER</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Icon name="help-circle" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Content Container */}
        <KeyboardAvoidingView
          style={styles.modernContentContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <FlatList
            data={answers}
            keyExtractor={(a) => (a.cevapId ?? a.cevapid).toString()}
            renderItem={renderAnswer}
            contentContainerStyle={styles.modernListContainer}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            ListEmptyComponent={
              <Animated.View 
                style={[
                  styles.modernEmptyContainer,
                  {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }]
                  }
                ]}
              >
                <View style={styles.emptyIconContainer}>
                  <LinearGradient
                    colors={['rgba(247, 92, 91, 0.1)', 'rgba(255, 138, 92, 0.1)']}
                    style={styles.emptyIconBackground}
                  >
                    <Icon name="chatbubble-ellipses-outline" size={64} color="#f75c5b" />
                  </LinearGradient>
                </View>
                <Text style={styles.modernEmptyText}>Henüz cevap yok</Text>
                <Text style={styles.modernEmptySubText}>
                  İlk cevabı vererek tartışmayı başlat!
                </Text>
              </Animated.View>
            }
            ListHeaderComponent={() => (
              <Animated.View 
                style={[
                  styles.questionCard,
                  {
                    opacity: fadeAnim,
                    transform: [{ 
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      })
                    }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['#fff', '#f8f9fa']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.questionCardGradient}
                >
                  <View style={styles.questionContent}>
                    <View style={styles.questionHeader}>
                      <View style={styles.questionIconContainer}>
                        <LinearGradient
                          colors={['#f75c5b', '#ff8a5c']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.questionIcon}
                        >
                          <Icon name="help-circle" size={28} color="#fff" />
                        </LinearGradient>
                      </View>
                      <View style={styles.questionInfo}>
                        <Text style={styles.questionText}>{question.icerik}</Text>
                        <View style={styles.questionMeta}>
                          <View style={styles.metaItem}>
                            <Icon name="person" size={14} color="#f75c5b" />
                            <Text style={styles.questionMetaText}>{question.soranKullaniciAdi}</Text>
                          </View>
                          <View style={styles.metaItem}>
                            <Icon name="time" size={14} color="#f75c5b" />
                            <Text style={styles.questionMetaText}>
                              {new Date(question.olusturmaTarihi).toLocaleString('tr-TR')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <View style={styles.answerCountContainer}>
                      <View style={styles.answerCount}>
                        <Icon name="chatbubble-ellipses" size={18} color="#f75c5b" />
                        <Text style={styles.answerCountText}>{answers.length} cevap var</Text>
                      </View>
                      <View style={styles.answerCountBadge}>
                        <Text style={styles.answerCountBadgeText}>{answers.length}</Text>
                      </View>
                    </View>
                  </View>
                </LinearGradient>
              </Animated.View>
            )}
          />

          {/* Enhanced Answer Input */}
          <View style={styles.modernAnswerContainer}>
            <LinearGradient
              colors={['#fff', '#f8f9fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.answerInputGradient}
            >
              <View style={styles.modernAnswerInput}>
                <View style={styles.inputIconContainer}>
                  <Icon name="chatbubble-ellipses" size={20} color="#f75c5b" />
                </View>
                <TextInput
                  style={styles.modernTextInput}
                  placeholder="Cevabınızı yazın..."
                  placeholderTextColor="#999"
                  value={newAnswer}
                  onChangeText={setNewAnswer}
                  multiline
                  maxLength={1000}
                />
                <TouchableOpacity
                  style={[
                    styles.modernSendBtn, 
                    (!newAnswer.trim() || posting) && styles.modernSendBtnDisabled
                  ]}
                  disabled={!newAnswer.trim() || posting}
                  onPress={handleAddAnswer}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      (!newAnswer.trim() || posting) 
                        ? ['#ddd', '#ccc'] 
                        : ['#f75c5b', '#ff8a5c']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.sendBtnGradient}
                  >
                    {posting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Icon name="send" size={20} color="#fff" />
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              <View style={styles.inputFooter}>
                <Text style={styles.characterCounter}>
                  {newAnswer.length}/1000 karakter
                </Text>
                <View style={styles.characterBar}>
                  <View 
                    style={[
                      styles.characterBarFill, 
                      { width: `${(newAnswer.length / 1000) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { 
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  container: { 
    flex: 1 
  },
  modernLoadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: { 
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modernLoadingText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  modernLoadingSubText: { 
    color: 'rgba(255,255,255,0.9)', 
    fontSize: 15, 
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modernHeader: {
    paddingTop: 15,
    paddingHorizontal: 22,
    paddingBottom: 25,
    backgroundColor: 'transparent',
  },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernBackBtn: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitleContainer: { 
    flex: 1,
    marginLeft: 18,
  },
  modernHeaderTitle: { 
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  modernHeaderSubtitle: { 
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernHeaderIcon: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modernContentContainer: { 
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    paddingTop: 20,
  },
  modernListContainer: { 
    paddingHorizontal: 22,
    paddingBottom: 120,
  },
  questionCard: {
    backgroundColor: 'transparent',
    borderRadius: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
  questionCardGradient: { 
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  questionContent: { 
    padding: 24,
  },
  questionHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 18,
  },
  questionIconContainer: { 
    marginRight: 18,
  },
  questionIcon: { 
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  questionInfo: { 
    flex: 1,
  },
  questionText: { 
    fontSize: 19,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 12,
    letterSpacing: 0.5,
    lineHeight: 28,
  },
  questionMeta: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginVertical: 3,
  },
  questionMetaText: { 
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  answerCountContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247, 92, 91, 0.1)',
  },
  answerCount: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  answerCountText: { 
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  answerCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  answerCountBadgeText: { 
    fontSize: 14,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  modernAnswerCard: { 
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  answerCardGradient: { 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernAnswerContent: { 
    padding: 20,
  },
  modernAnswerHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
  },
  modernAnswerAvatar: { 
    marginRight: 15,
  },
  answerAvatarGradient: { 
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modernAnswerInfo: { 
    flex: 1,
  },
  modernAnswerUser: { 
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  modernAnswerTime: { 
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modernAnswerText: { 
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
    marginBottom: 15,
    letterSpacing: 0.3,
    lineHeight: 24,
  },
  modernAnswerFooter: { 
    flexDirection: 'row', 
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247, 92, 91, 0.08)',
  },
  modernReactions: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  modernEmptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: { 
    marginBottom: 30,
  },
  emptyIconBackground: { 
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 3,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  modernEmptyText: { 
    textAlign: 'center',
    color: '#2D3436',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  modernEmptySubText: { 
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.4,
    lineHeight: 24,
  },
  modernAnswerContainer: {
    paddingHorizontal: 22,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  answerInputGradient: { 
    borderRadius: 25,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernAnswerInput: { 
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  inputIconContainer: { 
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.2)',
  },
  modernTextInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 12,
    maxHeight: 120,
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '600',
    letterSpacing: 0.3,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  modernSendBtn: {
    borderRadius: 25,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  modernSendBtnDisabled: { 
    opacity: 0.6,
  },
  sendBtnGradient: { 
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  characterCounter: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  characterBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    borderRadius: 3,
    marginLeft: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  characterBarFill: {
    height: '100%',
    backgroundColor: '#f75c5b',
    borderRadius: 3,
  },
  itemSeparator: { 
    height: 12,
    backgroundColor: 'transparent',
  },
  answerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.2)',
  },
});
