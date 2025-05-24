// src/screens/MyQuestionsScreen.js

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function MyQuestionsScreen() {
  const nav = useNavigation();
  const isFocused = useIsFocused();

  const [list, setList] = useState([]);
  const [loading, setLoad] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Navigation options
  React.useLayoutEffect(() => {
    nav.setOptions({
      headerShown: false,
    });
  }, [nav]);

  // anim değerleri
  const fade  = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  // soruları çek
  const getData = async () => {
    setLoad(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BASE}/api/profil/sorularim`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setList(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Sorularınız getirilemedi');
    } finally {
      setLoad(false);
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  };

  // ekran odağa gelince listeyi yenile
  useEffect(() => {
    if (isFocused) getData();
  }, [isFocused]);

  // sil işlemi (DOĞRU endpoint ve token ile)
  const handleDelete = (soruId) => {
    Alert.alert(
      'Onay',
      'Soruyu silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(soruId);
            try {
              const token = await getToken();
              await axios.delete(`${BASE}/api/soru/soruSil/${soruId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              getData();  // silince listeyi yenile
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
    const id = item.soruId ?? item.soruid ?? Math.random().toString();
    return (
      <Animated.View
        style={[
          styles.modernQuestionCard,
          { opacity: fade, transform: [{ translateY: slide }] }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => nav.navigate('QuestionDetail', { soruId: id })}
          style={styles.modernCardContent}
        >
          <View style={styles.modernQuestionHeader}>
            <View style={styles.modernQuestionAvatar}>
              <Ion name="help-circle" size={24} color="#fff" />
            </View>
            <View style={styles.modernQuestionInfo}>
              <Text style={styles.modernQuestionTitle} numberOfLines={2}>
                {item.icerik}
              </Text>
              <View style={styles.modernQuestionBadge}>
                <Text style={styles.modernBadgeText}>ID: {id}</Text>
              </View>
            </View>
          </View>

          <View style={styles.modernQuestionMeta}>
            <View style={styles.modernMetaRow}>
              <View style={styles.modernMetaItem}>
                <Ion name="school" size={16} color="#6c5ce7" />
                <Text style={styles.modernMetaText}>{item.universiteAd}</Text>
              </View>
              {item.bolumAd && (
                <View style={styles.modernMetaItem}>
                  <Ion name="layers" size={16} color="#6c5ce7" />
                  <Text style={styles.modernMetaText}>{item.bolumAd}</Text>
                </View>
              )}
            </View>
            
            <View style={styles.modernStatsRow}>
              <View style={styles.modernStatItem}>
                <Ion name="chatbubbles" size={14} color="#00b894" />
                <Text style={styles.modernStatText}>{item.cevapSayisi || 0} cevap</Text>
              </View>
              <View style={styles.modernStatItem}>
                <Ion name="heart" size={14} color="#e17055" />
                <Text style={styles.modernStatText}>{item.begeniSayisi || 0} beğeni</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.modernActions}>
          <TouchableOpacity
            style={styles.modernUpdateBtn}
            onPress={() => nav.navigate('UpdateQuestion', { soruId: id, mevcutIcerik: item.icerik })}
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
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => nav.goBack()}>
              <Ion name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Sorularım</Text>
              <Text style={styles.modernHeaderSubtitle}>Soru Yönetimi</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Ion name="help-circle" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingText}>Sorular yükleniyor...</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.modernEmptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ion name="help-circle-outline" size={80} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.modernEmptyText}>Henüz soru yok</Text>
            <Text style={styles.modernEmptySubText}>
              İlk sorunuzu sormaya başlayın
            </Text>
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={q => (q.soruId ?? q.soruid ?? Math.random()).toString()}
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

  // QUESTION CARDS
  modernQuestionCard: {
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
  modernQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modernQuestionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modernQuestionInfo: {
    flex: 1,
  },
  modernQuestionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    lineHeight: 22,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  modernQuestionBadge: {
    backgroundColor: '#6c5ce7',
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

  // META INFORMATION
  modernQuestionMeta: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#6c5ce720',
  },
  modernMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  modernMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 4,
  },
  modernMetaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginLeft: 6,
    letterSpacing: 0.2,
  },
  modernStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  modernStatText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginLeft: 6,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
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
