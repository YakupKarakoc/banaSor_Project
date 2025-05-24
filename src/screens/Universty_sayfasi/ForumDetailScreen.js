// src/screens/ForumDetailScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useIsFocused, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import EntryReaction from '../../components/EntryReaction';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function ForumDetailScreen() {
  const route      = useRoute();
  const navigation = useNavigation();
  const isFocused  = useIsFocused();
  const forumId    = route?.params?.forumId;

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [forum,    setForum]    = useState(null);
  const [entries,  setEntries]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [newEntry, setNewEntry] = useState('');
  const [posting,  setPosting]  = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim]= useState(new Animated.Value(40));

  useEffect(() => {
    if (!forumId) {
      Alert.alert(
        'Hata',
        'Forum bulunamadı. Ana sayfaya yönlendiriliyorsunuz.',
        [{ text: 'Tamam', onPress: () => navigation.goBack() }]
      );
      return;
    }
    fetchDetail();
    startAnimations();
  }, [forumId, isFocused]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue:1, duration:1200, useNativeDriver:true }),
      Animated.timing(slideAnim, { toValue:0, duration:1200, useNativeDriver:true }),
    ]).start();
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/api/forum/detay/${forumId}`);
      setForum(res.data);
      setEntries(res.data.entryler || []);
    } catch {
      Alert.alert('Hata', 'Forum detayları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.trim()) {
      return Alert.alert('Hata', 'Lütfen içerik girin.');
    }
    setPosting(true);
    try {
      await axios.post(`${BASE}/api/forum/entryEkle`, {
        forumId,
        icerik: newEntry.trim(),
      });
      setNewEntry('');
      fetchDetail();
    } catch {
      Alert.alert('Hata', 'Mesaj eklenemedi');
    } finally {
      setPosting(false);
    }
  };

  if (!forumId) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
        <LinearGradient 
          colors={['#f75c5b','#ff8a5c']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          <View style={styles.modernLoadingContainer}>
            <View style={styles.errorIcon}>
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.errorIconBackground}
              >
                <Icon name="warning" size={52} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.errorText}>Forum ID bulunamadı</Text>
            <Text style={styles.errorSubText}>Lütfen tekrar deneyin</Text>
        </View>
      </LinearGradient>
      </SafeAreaView>
    );
  }

  if (loading || !forum) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
        <LinearGradient 
          colors={['#f75c5b','#ff8a5c']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingText}>Forum yükleniyor...</Text>
            <Text style={styles.modernLoadingSubText}>Mesajlar getiriliyor</Text>
        </View>
      </LinearGradient>
      </SafeAreaView>
    );
  }

  const owner = forum.olusturanKullaniciAdi ?? forum.olusturankullaniciadi;

  const renderItem = ({ item, index }) => {
    const id   = item.entryId ?? item.entryid;
    const like = Number(item.likeSayisi ?? item.likesayisi ?? 0);
    const dis  = Number(item.dislikeSayisi ?? item.dislikesayisi ?? 0);

    return (
      <Animated.View style={[
        styles.modernEntryCard,
        {
          opacity: fadeAnim,
          transform: [
            { 
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [index * 15 + 30, 0]
              })
            },
            { 
              scale: fadeAnim.interpolate({ 
                inputRange:[0,1], 
                outputRange:[0.9,1] 
              }) 
            }
          ]
        }
      ]}>
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.entryCardGradient}
        >
          <View style={styles.modernEntryContent}>
            <View style={styles.modernEntryHeader}>
              <View style={styles.modernEntryAvatar}>
                <LinearGradient
                  colors={['#f75c5b', '#ff8a5c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.avatarGradient}
                >
                  <Icon name="person" size={20} color="#fff" />
                </LinearGradient>
              </View>
              <View style={styles.modernEntryInfo}>
                <Text style={styles.modernEntryUser}>
                  {item.kullaniciAdi ?? item.kullaniciadi}
                </Text>
                <Text style={styles.modernEntryTime}>
                  {new Date(item.olusturmaTarihi || Date.now()).toLocaleString('tr-TR')}
                </Text>
              </View>
              <View style={styles.entryBadge}>
                <Icon name="chatbubble" size={14} color="#f75c5b" />
          </View>
            </View>
            
            <Text style={styles.modernEntryText}>{item.icerik}</Text>
            
            <View style={styles.modernEntryFooter}>
              <View style={styles.modernReactions}>
              <EntryReaction type="Like"    entryId={id} countInit={like} />
              <EntryReaction type="Dislike" entryId={id} countInit={dis}  />
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
        colors={['#f75c5b','#ff8a5c']} 
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
              <Text style={styles.modernHeaderTitle}>Forum Detayı</Text>
              <Text style={styles.modernHeaderSubtitle}>MESAJ AKIŞI</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Icon name="chatbubbles" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.modernContentContainer}>
          {/* Enhanced Forum Info Card */}
          <Animated.View 
            style={[
              styles.forumInfoCard,
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
            <LinearGradient
              colors={['#fff', '#f8f9fa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.forumInfoGradient}
            >
              <View style={styles.forumInfoHeader}>
                <View style={styles.forumInfoIconContainer}>
                  <LinearGradient
                    colors={['#f75c5b', '#ff8a5c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.forumInfoIcon}
                  >
                    <Icon name="chatbubbles" size={28} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.forumInfoContent}>
                  <Text style={styles.forumTitle} numberOfLines={2}>{forum.baslik}</Text>
                  <View style={styles.forumMeta}>
                    <View style={styles.metaItem}>
                      <Icon name="person" size={14} color="#f75c5b" />
                      <Text style={styles.forumMetaText}>{owner}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Icon name="chatbubble-ellipses" size={14} color="#f75c5b" />
                      <Text style={styles.forumMetaText}>{entries.length} mesaj</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.forumStats}>
                  <View style={styles.statsNumber}>
                    <Text style={styles.statsNumberText}>{entries.length}</Text>
                    <Text style={styles.statsLabel}>MESAJ</Text>
                  </View>
        </View>
      </View>
            </LinearGradient>
          </Animated.View>

      {/* Entry list */}
      {entries.length === 0 ? (
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
              <Text style={styles.modernEmptyText}>Henüz mesaj yok</Text>
              <Text style={styles.modernEmptySubText}>Bu konuda ilk mesajı sen yazabilirsin!</Text>
            </Animated.View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={e => (e.entryId ?? e.entryid).toString()}
          renderItem={renderItem}
              contentContainerStyle={styles.modernListContainer}
          showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      )}
        </View>

        {/* Enhanced Message Input */}
      <KeyboardAvoidingView
          style={styles.modernMessageContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
          <LinearGradient
            colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.02)']}
            style={styles.messageContainerGradient}
          >
            <View style={styles.messageInputWrapper}>
              <View style={styles.modernMessageInput}>
        <TextInput
                  style={styles.modernTextInput}
                  placeholder="Mesajınızı yazın..."
                  placeholderTextColor="#999"
          value={newEntry}
          onChangeText={setNewEntry}
          multiline
                  maxLength={500}
                  autoCorrect={true}
                  autoCapitalize="sentences"
                  keyboardType="default"
                  textContentType="none"
                  autoComplete="off"
        />
                <Text style={styles.characterCounter}>
                  {newEntry.length}/500
                </Text>
              </View>
        <TouchableOpacity
                style={[styles.modernSendBtn, (!newEntry.trim() || posting) && styles.modernSendBtnDisabled]}
          onPress={handleAddEntry}
                disabled={!newEntry.trim() || posting}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={(!newEntry.trim() || posting) ? ['#ccc', '#999'] : ['#f75c5b', '#ff8a5c']}
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
          </LinearGradient>
      </KeyboardAvoidingView>
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
    flex: 1 
  },

  // LOADING STATES
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
  modernLoadingText: {
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
  modernLoadingSubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorIconBackground: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  errorSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  // PREMIUM HEADER
  modernHeader: {
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
  modernBackBtn: {
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
    marginLeft: 16,
  },
  modernHeaderTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  modernHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modernHeaderIcon: {
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

  // PREMIUM CONTENT CONTAINER
  modernContentContainer: {
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

  // LUXURY FORUM INFO CARD
  forumInfoCard: {
    backgroundColor: 'transparent',
    borderRadius: 20,
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 12,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  forumInfoGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  forumInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forumInfoIconContainer: {
    marginRight: 16,
  },
  forumInfoIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  forumInfoContent: {
    flex: 1,
  },
  forumTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 6,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  forumMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginVertical: 2,
    backgroundColor: 'rgba(247, 92, 91, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  forumMetaText: {
    fontSize: 12,
    color: '#f75c5b',
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  forumStats: {
    marginLeft: 12,
  },
  statsNumber: {
    alignItems: 'center',
    backgroundColor: 'rgba(247, 92, 91, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.2)',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statsNumberText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#f75c5b',
    letterSpacing: 0.4,
  },
  statsLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#636e72',
    letterSpacing: 0.4,
    marginTop: 2,
  },

  // PREMIUM ENTRY CARDS
  modernEntryCard: {
    backgroundColor: 'transparent',
    borderRadius: 18,
    marginHorizontal: 18,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  entryCardGradient: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.08)',
  },
  modernEntryContent: {
    padding: 18,
  },
  modernEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernEntryAvatar: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modernEntryInfo: {
    flex: 1,
  },
  modernEntryUser: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  modernEntryTime: {
    fontSize: 12,
    color: '#777',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  entryBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.2)',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modernEntryText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  modernEntryFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(247, 92, 91, 0.08)',
  },
  modernReactions: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ELEGANT EMPTY STATE
  modernEmptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 36,
  },
  emptyIconContainer: {
    marginBottom: 32,
  },
  emptyIconBackground: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(247, 92, 91, 0.15)',
  },
  modernEmptyText: {
    color: '#2D3436',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  modernEmptySubText: {
    color: '#636e72',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
    lineHeight: 24,
  },

  // REFINED LIST
  modernListContainer: {
    paddingTop: 10,
    paddingBottom: 28,
  },
  itemSeparator: {
    height: 6,
    backgroundColor: 'transparent',
  },

  // PREMIUM MESSAGE INPUT
  modernMessageContainer: {
    backgroundColor: 'transparent',
  },
  messageContainerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  messageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  modernMessageInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginRight: 10,
    maxHeight: 120,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.08)',
  },
  modernTextInput: {
    fontSize: 15,
    color: '#333',
    minHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  characterCounter: {
    fontSize: 11,
    color: '#777',
    textAlign: 'right',
    marginTop: 6,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modernSendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  modernSendBtnDisabled: {
    opacity: 0.6,
  },
  sendBtnGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
});
