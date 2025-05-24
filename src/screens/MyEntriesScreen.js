import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, FlatList, ActivityIndicator, StyleSheet,
  TouchableOpacity, Alert, Animated, StatusBar, SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function MyEntriesScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Animasyon
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  // Entryleri çek
  const fetchEntries = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`${BASE}/api/profil/entrylerim`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEntries(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Entryleriniz getirilemedi');
    } finally {
      setLoading(false);
      Animated.parallel([
        Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]).start();
    }
  };

  useEffect(() => {
    if (isFocused) fetchEntries();
  }, [isFocused]);

  // Entry sil
  const handleDelete = (entryId) => {
    Alert.alert(
      'Onay',
      'Bu entry\'yi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(entryId);
            try {
              const token = await getToken();
              await axios.delete(`${BASE}/api/forum/entrySil`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { entryId }  // Body içinde gönderiyoruz!
              });
              Alert.alert('Başarılı', 'Entry silindi.');
              fetchEntries();
            } catch (e) {
              console.error(e);
              Alert.alert('Hata', e.response?.data?.message || 'Silme başarısız');
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[
      styles.modernEntryCard,
      { opacity: fade, transform: [{ translateY: slide }] }
    ]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('UpdateEntry', {
          entryId: item.entryId,
          mevcutIcerik: item.icerik
        })}
        style={styles.modernCardContent}
      >
        <View style={styles.modernEntryHeader}>
          <View style={styles.modernEntryAvatar}>
            <Ion name="document-text" size={20} color="#fff" />
          </View>
          <View style={styles.modernEntryInfo}>
            <Text style={styles.modernEntryTitle}>Entry</Text>
            <View style={styles.modernEntryBadge}>
              <Text style={styles.modernBadgeText}>ID: {item.entryId}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.modernEntryText} numberOfLines={3}>
          {item.icerik}
        </Text>

        <View style={styles.modernEntryMeta}>
          <View style={styles.modernMetaRow}>
            <View style={styles.modernMetaItem}>
              <Ion name="chatbubbles" size={16} color="#0984e3" />
              <Text style={styles.modernMetaText}>{item.forumBaslik}</Text>
            </View>
          </View>
          
          <View style={styles.modernStatsRow}>
            <View style={styles.modernStatItem}>
              <Ion name="thumbs-up" size={14} color="#00b894" />
              <Text style={styles.modernStatText}>{item.likeSayisi || 0} beğeni</Text>
            </View>
            <View style={styles.modernStatItem}>
              <Ion name="thumbs-down" size={14} color="#ff6b6b" />
              <Text style={styles.modernStatText}>{item.dislikeSayisi || 0} dislike</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.modernActions}>
        <TouchableOpacity
          style={styles.modernUpdateBtn}
          onPress={() => navigation.navigate('UpdateEntry', {
            entryId: item.entryId,
            mevcutIcerik: item.icerik
          })}
        >
          <Ion name="pencil" size={16} color="#fff" />
          <Text style={styles.modernActionText}>Güncelle</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.modernDeleteBtn}
          onPress={() => handleDelete(item.entryId)}
          disabled={deletingId === item.entryId}
        >
          {deletingId === item.entryId ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ion name="trash" size={16} color="#fff" />
          )}
          <Text style={styles.modernActionText}>
            {deletingId === item.entryId ? 'Siliniyor...' : 'Sil'}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Ion name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Entrylerim</Text>
              <Text style={styles.modernHeaderSubtitle}>Entry Yönetimi</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Ion name="document-text" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingText}>Entryler yükleniyor…</Text>
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.modernEmptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ion name="document-text-outline" size={80} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.modernEmptyText}>Henüz entry yok</Text>
            <Text style={styles.modernEmptySubText}>
              İlk entry'nizi yazmaya başlayın
            </Text>
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={e => (e.entryId ?? Math.random()).toString()}
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

  // ENTRY CARDS
  modernEntryCard: {
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
  modernEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modernEntryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0984e3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#0984e3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modernEntryInfo: {
    flex: 1,
  },
  modernEntryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modernEntryBadge: {
    backgroundColor: '#0984e3',
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
  modernEntryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    lineHeight: 22,
    marginBottom: 15,
    letterSpacing: 0.3,
  },

  // META INFORMATION
  modernEntryMeta: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#0984e320',
  },
  modernMetaRow: {
    marginBottom: 10,
  },
  modernMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernMetaText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginLeft: 8,
    letterSpacing: 0.2,
    flex: 1,
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
