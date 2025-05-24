import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function MyForumsScreen() {
  const navigation = useNavigation();
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedId, setSelectedId]     = useState(null);
  const [newTitle, setNewTitle]         = useState('');
  const [deletingId, setDeletingId]     = useState(null);
  const [updating, setUpdating]         = useState(false);

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // --- Fetch the user's forums ---
  const fetchMyForums = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(
        `${BASE}/api/profil/forumlarim`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Forumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMyForums(); }, []);

  // --- Delete a forum ---
  const handleDelete = (forumid) => {
    Alert.alert(
      'Onayla',
      'Bu forumu silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(forumid);
            try {
              const token = await getToken();
              await axios.delete(
                `${BASE}/api/forum/forumSil`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                  data: { forumId: forumid } // backend body: forumId küçük harf
                }
              );
              Alert.alert('Başarılı', 'Forum silindi');
              fetchMyForums();
            } catch (e) {
              console.error(e);
              Alert.alert(
                'Hata',
                e.response?.data?.message || e.response?.data?.error || 'Silme başarısız'
              );
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  // --- Open the update modal ---
  const openUpdateModal = (forumid, currentTitle) => {
    setSelectedId(forumid);
    setNewTitle(currentTitle);
    setModalVisible(true);
  };

  // --- Submit title update ---
  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const token = await getToken();
      await axios.patch(
        `${BASE}/api/forum/forumGuncelle`,
        { forumId: selectedId, yeniBaslik: newTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Başarılı', 'Başlık güncellendi');
      setModalVisible(false);
      fetchMyForums();
    } catch (e) {
      console.error('Güncelle error:', e.response?.status, e.response?.data);
      Alert.alert(
        'Hata',
        e.response?.data?.message || e.response?.data?.error || 'Güncelleme başarısız'
      );
    } finally {
      setUpdating(false);
    }
  };

  // --- Render each forum card ---
  const renderItem = ({ item }) => (
    <View style={styles.modernForumCard}>
      <TouchableOpacity
        style={styles.modernCardContent}
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('ForumDetail', { forumId: item.forumid })
        }
      >
        <View style={styles.modernForumHeader}>
          <View style={styles.modernForumAvatar}>
            <Ionicons name="chatbubbles" size={20} color="#fff" />
          </View>
          <View style={styles.modernForumInfo}>
            <Text style={styles.modernForumTitle}>Forum</Text>
            <View style={styles.modernForumBadge}>
              <Text style={styles.modernBadgeText}>ID: {item.forumid}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.modernForumText} numberOfLines={2}>
          {item.baslik}
        </Text>

        <View style={styles.modernForumMeta}>
          <View style={styles.modernMetaItem}>
            <Ionicons name="school" size={16} color="#e17055" />
            <Text style={styles.modernMetaText}>Uni ID: {item.universiteid}</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.modernActions}>
        <TouchableOpacity
          style={styles.modernUpdateBtn}
          onPress={() => openUpdateModal(item.forumid, item.baslik)}
        >
          <Ionicons name="pencil" size={16} color="#fff" />
          <Text style={styles.modernActionText}>Güncelle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modernDeleteBtn}
          onPress={() => handleDelete(item.forumid)}
          disabled={deletingId === item.forumid}
        >
          {deletingId === item.forumid ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="trash" size={16} color="#fff" />
          )}
          <Text style={styles.modernActionText}>
            {deletingId === item.forumid ? 'Siliniyor...' : 'Sil'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
        <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
          
          {/* Premium Header */}
          <View style={styles.modernHeader}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.modernHeaderTitle}>Forumlarım</Text>
                <Text style={styles.modernHeaderSubtitle}>Forum Yönetimi</Text>
              </View>
              <View style={styles.modernHeaderIcon}>
                <Ionicons name="people-circle" size={24} color="#fff" />
              </View>
            </View>
          </View>

          {/* Content */}
          {loading ? (
            <View style={styles.modernLoadingContainer}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
              <Text style={styles.modernLoadingText}>Forumlar yükleniyor…</Text>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.modernEmptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="chatbubbles-outline" size={80} color="rgba(255,255,255,0.4)" />
              </View>
              <Text style={styles.modernEmptyText}>Henüz forum yok</Text>
              <Text style={styles.modernEmptySubText}>
                İlk forumunuzu oluşturmaya başlayın
              </Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={item => item.forumid?.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.modernListContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </LinearGradient>
      </SafeAreaView>

      {/* Modern Update Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modernModalBackdrop}>
          <View style={styles.modernModalCard}>
            <View style={styles.modernModalHeader}>
              <View style={styles.modernModalIconContainer}>
                <Ionicons name="pencil" size={24} color="#fff" />
              </View>
              <Text style={styles.modernModalTitle}>Forum Başlığını Güncelle</Text>
            </View>
            
            <View style={styles.modernModalContent}>
              <Text style={styles.modernModalLabel}>Yeni Başlık</Text>
              <TextInput
                style={styles.modernModalInput}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Forum başlığını girin..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
            
            <View style={styles.modernModalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modernModalCancelBtn}
                disabled={updating}
              >
                <Text style={styles.modernModalCancelText}>İptal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleUpdate}
                style={styles.modernModalConfirmBtn}
                disabled={updating || !newTitle.trim()}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark" size={18} color="#fff" />
                )}
                <Text style={styles.modernModalConfirmText}>
                  {updating ? 'Güncelleniyor...' : 'Güncelle'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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

  // FORUM CARDS
  modernForumCard: {
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
  modernForumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modernForumAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e17055',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#e17055',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modernForumInfo: {
    flex: 1,
  },
  modernForumTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modernForumBadge: {
    backgroundColor: '#e17055',
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
  modernForumText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2d3436',
    lineHeight: 22,
    marginBottom: 15,
    letterSpacing: 0.3,
  },
  modernForumMeta: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#e1705520',
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

  // MODERN MODAL
  modernModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modernModalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modernModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f75c5b',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modernModalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  modernModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernModalContent: {
    padding: 20,
  },
  modernModalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  modernModalInput: {
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f8f9fa',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  modernModalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modernModalCancelBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  modernModalCancelText: {
    color: '#6c757d',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  modernModalConfirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernModalConfirmText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    marginLeft: 6,
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
