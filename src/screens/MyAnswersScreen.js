// src/screens/MyAnswersScreen.js

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

import { getToken } from '../utils/auth';
import ReactionButton from '../components/ReactionButton';

const BASE = 'http://10.0.2.2:3000';

export default function MyAnswersScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [data,    setData]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  // verileri çek
  const fetchMyAnswers = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${BASE}/api/profil/cevaplarim`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Cevaplarınız getirilemedi');
    } finally {
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
      setLoading(false);
    }
  };

  // odağa gelince yeniden yükle
  useEffect(() => {
    if (isFocused) fetchMyAnswers();
  }, [isFocused]);

  // sil işlemi
  const handleDelete = (cevapId) => {
    Alert.alert(
      'Onay',
      'Cevabı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(cevapId);
            try {
              await axios.delete(`${BASE}/api/soru/cevapSil/${cevapId}`);
              fetchMyAnswers();
            } catch (e) {
              console.error(e);
              Alert.alert('Hata', 'Silme işlemi başarısız oldu');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    const id           = item.cevapId   ?? item.cevapid;
    const likeCount    = item.likeSayisi    ?? item.likesayisi    ?? 0;
    const dislikeCount = item.dislikeSayisi ?? item.dislikesayisi ?? 0;
    const content      = item.cevapIcerik   ?? item.cevapicerik   ?? '';
    const question     = item.soruIcerik    ?? item.soruicerik    ?? '';
    const dateStr      = item.cevapTarihi   ?? item.cevaptarihi;
    const date         = dateStr ? new Date(dateStr) : null;
    const formatted    = date && !isNaN(date)
      ? date.toLocaleString('tr-TR')
      : '—';

    return (
      <Animated.View style={[
          styles.modernAnswerCard,
          { opacity: fade, transform: [{ translateY: slide }] }
        ]}
      >
        <View style={styles.modernCardContent}>
          <View style={styles.modernAnswerHeader}>
            <View style={styles.modernAnswerAvatar}>
              <Ion name="chatbubble" size={20} color="#fff" />
            </View>
            <View style={styles.modernAnswerInfo}>
              <Text style={styles.modernAnswerTitle}>Cevabım</Text>
              <View style={styles.modernAnswerBadge}>
                <Text style={styles.modernBadgeText}>ID: {id}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.modernAnswerText}>{content}</Text>

          <View style={styles.modernQuestionSection}>
            <View style={styles.modernQuestionHeader}>
              <Ion name="help-circle" size={16} color="#00b894" />
              <Text style={styles.modernQuestionLabel}>İlgili Soru:</Text>
            </View>
            <Text style={styles.modernQuestionText} numberOfLines={2}>{question}</Text>
          </View>

          <View style={styles.modernAnswerMeta}>
            <View style={styles.modernMetaItem}>
              <Ion name="calendar" size={14} color="#00b894" />
              <Text style={styles.modernMetaText}>{formatted}</Text>
            </View>
            
            <View style={styles.modernReactions}>
              <ReactionButton entryId={id} type="Like"    countInit={likeCount} />
              <ReactionButton entryId={id} type="Dislike" countInit={dislikeCount}/>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.modernActions}>
          <TouchableOpacity
            style={styles.modernUpdateBtn}
            onPress={() =>
              navigation.navigate('UpdateAnswer', {
                cevapId: id,
                mevcutIcerik: content
              })
            }
          >
            <Ion name="pencil" size={16} color="#fff" />
            <Text style={styles.modernActionText}>Güncelle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modernDeleteBtn}
            onPress={() => handleDelete(id)}
            disabled={deletingId === id}
          >
            {deletingId === id ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ion name="trash" size={16} color="#fff" />
            )}
            <Text style={styles.modernActionText}>
              {deletingId === id ? 'Siliniyor...' : 'Sil'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Ion name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Cevaplarım</Text>
              <Text style={styles.modernHeaderSubtitle}>Cevap Yönetimi</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Ion name="chatbubbles" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator color="#fff" size="large" />
            </View>
            <Text style={styles.modernLoadingText}>Cevaplar yükleniyor…</Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.modernEmptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ion name="chatbubbles-outline" size={80} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.modernEmptyText}>Henüz cevap yok</Text>
            <Text style={styles.modernEmptySubText}>
              İlk cevabınızı yazmaya başlayın
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={item => `ans-${item.cevapId ?? item.cevapid}`}
            renderItem={renderItem}
            contentContainerStyle={styles.modernListContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
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

  // MODERN LIST
  modernListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // ANSWER CARDS
  modernAnswerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernCardContent: {
    padding: 20,
  },
  modernAnswerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modernAnswerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00b894',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modernAnswerInfo: {
    flex: 1,
  },
  modernAnswerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modernAnswerBadge: {
    backgroundColor: '#00b894',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  modernBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modernAnswerText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    lineHeight: 22,
    marginBottom: 15,
    letterSpacing: 0.3,
  },

  // QUESTION SECTION
  modernQuestionSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#00b89420',
  },
  modernQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernQuestionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modernQuestionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 18,
    letterSpacing: 0.2,
  },

  // META & REACTIONS
  modernAnswerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernMetaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  modernReactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ACTION BUTTONS
  modernActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  modernUpdateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00b894',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    shadowColor: '#00b894',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modernDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modernActionText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modernLoadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modernEmptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modernEmptySubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
