// src/screens/admin/AdminForumDetay.js

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

export default function AdminForumDetay() {
  const route = useRoute();
  const navigation = useNavigation();
  const { forum, token } = route.params;

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingEntry, setDeletingEntry] = useState(null);

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchForumEntries();
  }, []);

  const fetchForumEntries = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/forum/detay/${forum.forumid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const entryList = response.data?.entries ?? response.data?.entryler ?? [];
      setEntries(entryList);
    } catch (err) {
      Alert.alert('Hata', 'Entryler getirilemedi: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (!entryId || isNaN(entryId)) {
      return Alert.alert('Hata', 'Geçersiz Entry ID');
    }

    Alert.alert('Entry Sil', 'Bu entry silinsin mi?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setDeletingEntry(entryId);
          try {
            await axios.delete(`${BASE_URL}/api/admin/entry/${entryId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setEntries(prev => prev.filter(e => e.entryId !== entryId));
            Alert.alert('Başarılı', 'Entry başarıyla silindi.');
          } catch (err) {
            Alert.alert('Hata', err.response?.data?.message || err.message);
          } finally {
            setDeletingEntry(null);
          }
        },
      },
    ]);
  };

  const renderEntryItem = ({ item }) => (
    <View style={styles.modernEntryCard}>
      <View style={styles.modernEntryAvatar}>
        <Icon name="create" size={20} color="#fff" />
      </View>
      
      <View style={styles.modernEntryContent}>
        <Text style={styles.modernEntryText}>{item.icerik || 'İçerik yok'}</Text>
        <View style={styles.modernEntryMeta}>
          <View style={styles.modernMetaItem}>
            <Icon name="person" size={14} color="#f75c5b" />
            <Text style={styles.modernMetaText}>{item.kullaniciAdi || '-'}</Text>
          </View>
          <View style={styles.modernMetaItem}>
            <Icon name="calendar" size={14} color="#f75c5b" />
            <Text style={styles.modernMetaText}>
              {item.olusturmaTarihi ? new Date(item.olusturmaTarihi).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
            </Text>
          </View>
        </View>
        <View style={styles.modernEntryBadge}>
          <Text style={styles.modernBadgeText}>ID: {item.entryId ?? 'Yok'}</Text>
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => handleDeleteEntry(item.entryId)} 
        style={styles.modernDeleteBtn}
        disabled={deletingEntry === item.entryId}
      >
        {deletingEntry === item.entryId ? (
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
              <Text style={styles.modernHeaderTitle}>Forum Detayı</Text>
              <Text style={styles.modernHeaderSubtitle}>Admin Panel</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* Content */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Forum Info Card */}
          <View style={styles.modernForumCard}>
            <View style={styles.modernForumHeader}>
              <View style={styles.modernForumAvatar}>
                <Icon name="chatbubbles" size={24} color="#fff" />
              </View>
              <View style={styles.modernForumInfo}>
                <Text style={styles.modernForumTitle}>Forum</Text>
                <View style={styles.modernForumBadge}>
                  <Text style={styles.modernForumBadgeText}>ID: {forum.forumid}</Text>
                </View>
              </View>
            </View>
            
            <Text style={styles.modernForumText}>{forum.baslik}</Text>
            
            <View style={styles.modernForumMeta}>
              <View style={styles.modernMetaRow}>
                <View style={styles.modernMetaItem}>
                  <Icon name="document-text" size={16} color="#f75c5b" />
                  <Text style={styles.modernMetaLabel}>Forum Başlığı:</Text>
                  <Text style={styles.modernMetaValue}>{forum.baslik}</Text>
                </View>
              </View>
              
              <View style={styles.modernMetaRow}>
                <View style={styles.modernMetaItem}>
                  <Icon name="list" size={16} color="#f75c5b" />
                  <Text style={styles.modernMetaLabel}>Toplam Entry:</Text>
                  <Text style={styles.modernMetaValue}>{entries.length}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Entries Section */}
          <View style={styles.modernEntriesSection}>
            <View style={styles.modernSectionHeader}>
              <View style={styles.modernSectionIconContainer}>
                <Icon name="create" size={20} color="#fff" />
              </View>
              <Text style={styles.modernSectionTitle}>
                Entry Listesi ({entries.length})
              </Text>
            </View>

            {loading ? (
              <View style={styles.modernLoadingContainer}>
                <View style={styles.loadingSpinner}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
                <Text style={styles.modernLoadingText}>Entryler yükleniyor...</Text>
              </View>
            ) : entries.length > 0 ? (
              <FlatList
                data={entries}
                keyExtractor={(item, index) => item.entryid?.toString() ?? index.toString()}
                renderItem={renderEntryItem}
                scrollEnabled={false}
                contentContainerStyle={styles.entriesListContainer}
              />
            ) : (
              <View style={styles.modernEmptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Icon name="create-outline" size={60} color="rgba(255,255,255,0.4)" />
                </View>
                <Text style={styles.modernEmptyText}>Henüz entry yok</Text>
                <Text style={styles.modernEmptySubText}>Bu foruma henüz entry yazılmamış</Text>
              </View>
            )}
          </View>
        </ScrollView>
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

  // FORUM CARD
  modernForumCard: {
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
  modernForumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modernForumAvatar: {
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
  modernForumInfo: {
    flex: 1,
  },
  modernForumTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modernForumBadge: {
    backgroundColor: '#f75c5b',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  modernForumBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modernForumText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    lineHeight: 24,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  modernForumMeta: {
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

  // ENTRIES SECTION
  modernEntriesSection: {
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
  entriesListContainer: {
    paddingBottom: 10,
  },

  // ENTRY CARDS
  modernEntryCard: {
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
  modernEntryAvatar: {
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
  modernEntryContent: {
    flex: 1,
  },
  modernEntryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    lineHeight: 20,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  modernEntryMeta: {
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
  modernEntryBadge: {
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
