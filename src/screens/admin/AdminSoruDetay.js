// src/screens/admin/AdminSoruDetay.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

const BASE_URL = 'http://10.0.2.2:3000';

export default function AdminSoruDetay() {
  const route = useRoute();
  const navigation = useNavigation();
  const { soru, token } = route.params;

  const [loading, setLoading] = useState(true);
  const [detay, setDetay] = useState(null);
  const [deletingCevap, setDeletingCevap] = useState(null);

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchSoruDetay();
  }, []);

  const fetchSoruDetay = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/soru/detay/${soru.soruid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDetay(response.data);
    } catch (err) {
      Alert.alert('Hata', 'Soru detayları getirilemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCevap = async (cevapId) => {
    Alert.alert('Cevap Sil', 'Bu cevabı silmek istiyor musunuz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setDeletingCevap(cevapId);
          try {
            await axios.delete(`${BASE_URL}/api/admin/cevap/${cevapId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setDetay(prev => ({
              ...prev,
              cevaplar: prev.cevaplar.filter(c => c.cevapId !== cevapId),
            }));
            Alert.alert('Başarılı', 'Cevap başarıyla silindi.');
          } catch (err) {
            Alert.alert('Hata', err.response?.data?.message || err.message);
          } finally {
            setDeletingCevap(null);
          }
        },
      },
    ]);
  };

  const renderCevap = ({ item }) => (
    <View style={styles.modernCevapCard}>
      <View style={styles.modernCevapAvatar}>
        <Icon name="chatbubble" size={20} color="#fff" />
      </View>
      
      <View style={styles.modernCevapContent}>
        <Text style={styles.modernCevapText}>{item.icerik}</Text>
        <View style={styles.modernCevapMeta}>
          <View style={styles.modernMetaItem}>
            <Icon name="person" size={14} color="#f75c5b" />
            <Text style={styles.modernMetaText}>{item.cevaplayanKullaniciAdi}</Text>
          </View>
          <View style={styles.modernMetaItem}>
            <Icon name="calendar" size={14} color="#f75c5b" />
            <Text style={styles.modernMetaText}>
              {new Date(item.olusturmaTarihi).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
        <View style={styles.modernCevapBadge}>
          <Text style={styles.modernBadgeText}>ID: {item.cevapId}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => handleDeleteCevap(item.cevapId)} 
        style={styles.modernDeleteBtn}
        disabled={deletingCevap === item.cevapId}
      >
        {deletingCevap === item.cevapId ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Icon name="trash" size={18} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Soru Detayı</Text>
              <Text style={styles.modernHeaderSubtitle}>Admin Panel</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingText}>Soru detayı yükleniyor...</Text>
          </View>
        ) : detay ? (
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Question Card */}
            <View style={styles.modernQuestionCard}>
              <View style={styles.modernQuestionHeader}>
                <View style={styles.modernQuestionAvatar}>
                  <Icon name="help-circle" size={24} color="#fff" />
                </View>
                <View style={styles.modernQuestionInfo}>
                  <Text style={styles.modernQuestionTitle}>Soru</Text>
                  <View style={styles.modernQuestionBadge}>
                    <Text style={styles.modernQuestionBadgeText}>ID: {soru.soruid}</Text>
                  </View>
                </View>
              </View>
              
              <Text style={styles.modernQuestionText}>{detay.icerik}</Text>
              
              <View style={styles.modernQuestionMeta}>
                <View style={styles.modernMetaRow}>
                  <View style={styles.modernMetaItem}>
                    <Icon name="person" size={16} color="#f75c5b" />
                    <Text style={styles.modernMetaLabel}>Soran:</Text>
                    <Text style={styles.modernMetaValue}>{detay.soranKullaniciAdi}</Text>
                  </View>
                </View>
                
                <View style={styles.modernMetaRow}>
                  <View style={styles.modernMetaItem}>
                    <Icon name="bookmark" size={16} color="#f75c5b" />
                    <Text style={styles.modernMetaLabel}>Konu:</Text>
                    <Text style={styles.modernMetaValue}>{detay.konu}</Text>
                  </View>
                </View>
                
                <View style={styles.modernMetaRow}>
                  <View style={styles.modernMetaItem}>
                    <Icon name="library" size={16} color="#f75c5b" />
                    <Text style={styles.modernMetaLabel}>Bölüm:</Text>
                    <Text style={styles.modernMetaValue}>{detay.bolum}</Text>
                  </View>
                </View>
                
                <View style={styles.modernMetaRow}>
                  <View style={styles.modernMetaItem}>
                    <Icon name="calendar" size={16} color="#f75c5b" />
                    <Text style={styles.modernMetaLabel}>Tarih:</Text>
                    <Text style={styles.modernMetaValue}>
                      {new Date(detay.olusturmaTarihi).toLocaleDateString('tr-TR')}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Answers Section */}
            <View style={styles.modernAnswersSection}>
              <View style={styles.modernSectionHeader}>
                <View style={styles.modernSectionIconContainer}>
                  <Icon name="chatbubbles" size={20} color="#fff" />
                </View>
                <Text style={styles.modernSectionTitle}>
                  Cevaplar ({detay.cevaplar?.length || 0})
                </Text>
              </View>

              {detay.cevaplar && detay.cevaplar.length > 0 ? (
                <FlatList
                  data={detay.cevaplar}
                  renderItem={renderCevap}
                  keyExtractor={(item, index) => item.cevapId?.toString() ?? index.toString()}
                  scrollEnabled={false}
                  contentContainerStyle={styles.answersListContainer}
                />
              ) : (
                <View style={styles.modernEmptyContainer}>
                  <View style={styles.emptyIconContainer}>
                    <Icon name="chatbubbles-outline" size={60} color="rgba(255,255,255,0.4)" />
                  </View>
                  <Text style={styles.modernEmptyText}>Henüz cevap yok</Text>
                  <Text style={styles.modernEmptySubText}>Bu soruya henüz kimse cevap vermemiş</Text>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.modernEmptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="alert-circle-outline" size={60} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.modernEmptyText}>Soru detayı yüklenemedi</Text>
            <Text style={styles.modernEmptySubText}>Lütfen tekrar deneyin</Text>
          </View>
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
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
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
  headerSpacer: {
    width: 36,
  },

  // QUESTION CARD
  modernQuestionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.08)',
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
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modernQuestionInfo: {
    flex: 1,
  },
  modernQuestionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modernQuestionBadge: {
    backgroundColor: '#f75c5b',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  modernQuestionBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modernQuestionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    lineHeight: 24,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  modernQuestionMeta: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#f75c5b20',
  },
  modernMetaRow: {
    marginBottom: 10,
  },
  modernMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernMetaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modernMetaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2d3436',
    flex: 1,
    letterSpacing: 0.2,
  },

  // ANSWERS SECTION
  modernAnswersSection: {
    marginBottom: 30,
  },
  modernSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modernSectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modernSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    textTransform: 'uppercase',
  },
  answersListContainer: {
    paddingBottom: 10,
  },

  // ANSWER CARDS
  modernCevapCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernCevapAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modernCevapContent: {
    flex: 1,
  },
  modernCevapText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    lineHeight: 20,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  modernCevapMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  modernMetaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
    marginRight: 15,
  },
  modernCevapBadge: {
    backgroundColor: '#f75c5b',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  modernBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  modernDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b6b',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modernEmptyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modernEmptySubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
