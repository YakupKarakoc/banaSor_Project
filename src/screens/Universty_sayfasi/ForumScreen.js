// src/screens/ForumScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function ForumScreen() {
  const { universiteId, fakulteId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [forums, setForums]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    loadForums();
    startAnimations();
  }, [universiteId, fakulteId, isFocused]);

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

  const loadForums = async () => {
      setLoading(true);
      try {
        const params = { universiteId };
        if (fakulteId) params.fakulteId = fakulteId;
        const res = await axios.get(`${BASE}/api/forum/getir`, { params });
        setForums(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Forumlar yüklenemedi');
      } finally {
        setLoading(false);
      }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingText}>Forumlar yükleniyor...</Text>
            <Text style={styles.modernLoadingSubText}>Lütfen bekleyin</Text>
        </View>
      </LinearGradient>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.modernForumCard,
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
                inputRange: [0, 1], 
                outputRange: [0.9, 1] 
              }) 
            }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.modernForumContent}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumid })}
      >
        <View style={styles.modernForumHeader}>
          <View style={styles.modernForumAvatar}>
            <Icon name="chatbubbles" size={20} color="#fff" />
          </View>
          <View style={styles.modernForumInfo}>
            <Text style={styles.modernForumTitle} numberOfLines={2}>{item.baslik}</Text>
            <View style={styles.modernForumMeta}>
              <View style={styles.metaItem}>
                <Icon name="person" size={12} color="#f75c5b" />
                <Text style={styles.modernForumMetaText}>
                  {item.olusturanKullaniciAdi || item.olusturankullaniciadi || 'Anonim'}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Icon name="time" size={12} color="#f75c5b" />
                <Text style={styles.modernForumMetaText}>
                  {new Date(item.olusturmaTarihi || Date.now()).toLocaleDateString('tr-TR')}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.modernForumArrow}>
            <Icon name="chevron-forward" size={18} color="#f75c5b" />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

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
              <Text style={styles.modernHeaderTitle}>Forum</Text>
              <Text style={styles.modernHeaderSubtitle}>TARTIŞMA ALANI</Text>
            </View>
            <TouchableOpacity 
              style={styles.modernAddBtn}
              onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
              activeOpacity={0.8}
            >
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.modernContentContainer}>
          {/* Enhanced Stats Card */}
          <Animated.View 
            style={[
              styles.statsCard,
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
              style={styles.statsGradient}
            >
              <View style={styles.statsContent}>
                <View style={styles.statsIconContainer}>
                  <LinearGradient
                    colors={['#f75c5b', '#ff8a5c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.statsIcon}
                  >
                    <Icon name="chatbubbles" size={24} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.statsInfo}>
                  <Text style={styles.statsTitle}>Forum Başlıkları</Text>
                  <Text style={styles.statsSubtitle}>
                    {forums.length} aktif konu • Topluluğa katıl
                  </Text>
                </View>
                <View style={styles.statsAction}>
        <TouchableOpacity
                    style={styles.statsActionBtn}
          onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
                    activeOpacity={0.8}
        >
                    <Icon name="add-circle" size={18} color="#f75c5b" />
        </TouchableOpacity>
      </View>
              </View>
            </LinearGradient>
          </Animated.View>

      {forums.length === 0 ? (
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
                  <Icon name="chatbubbles-outline" size={70} color="#f75c5b" />
                </LinearGradient>
        </View>
              <Text style={styles.modernEmptyText}>Henüz forum başlığı yok</Text>
              <Text style={styles.modernEmptySubText}>
                Yeni bir tartışma başlatarak topluluğa katkıda bulun!
              </Text>
              <TouchableOpacity
                style={styles.modernCreateButton}
                onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#f75c5b', '#ff8a5c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createButtonGradient}
                >
                  <Icon name="add-circle" size={20} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.modernCreateButtonText}>Forum Oluştur</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
      ) : (
        <FlatList
          data={forums}
          keyExtractor={item => String(item.forumid)}
          renderItem={renderItem}
              contentContainerStyle={styles.modernListContainer}
          showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
        />
      )}
        </View>
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

  // LOADING STATE
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
  modernAddBtn: {
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

  // LUXURY STATS CARD
  statsCard: {
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
  statsGradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  statsContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsIconContainer: {
    marginRight: 16,
  },
  statsIcon: {
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
  statsInfo: {
    flex: 1,
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3436',
    marginBottom: 5,
    letterSpacing: 0.5,
  },
  statsSubtitle: {
    fontSize: 13,
    color: '#636e72',
    fontWeight: '600',
    letterSpacing: 0.3,
    lineHeight: 19,
  },
  statsAction: {
    marginLeft: 12,
  },
  statsActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 92, 91, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.2)',
  },

  // PREMIUM FORUM CARDS
  modernForumCard: {
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
  modernForumContent: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.08)',
  },
  modernForumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernForumAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modernForumInfo: {
    flex: 1,
  },
  modernForumTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 7,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  modernForumMeta: {
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
  modernForumMetaText: {
    fontSize: 12,
    color: '#f75c5b',
    marginLeft: 4,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modernForumArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    marginBottom: 36,
    lineHeight: 24,
  },
  modernCreateButton: {
    borderRadius: 28,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  createButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modernCreateButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.8,
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
});
