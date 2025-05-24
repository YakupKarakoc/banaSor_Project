// src/screens/admin/PendingSuggestionsScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

export default function PendingSuggestionsScreen({ navigation, route }) {
  const { token } = route.params;
  const [pending,       setPending]       = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // { [oneriId]: boolean }

  // Bekleyen önerileri çek
  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/bekleyenOneriler`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const mapped = res.data.map(r => ({
        oneriId:              r.oneriid,             // küçük i
        onerenKullaniciAdi:   r.onerenkullaniciadi,  // küçük k
        onerilenKullaniciAdi: r.onerilenkullaniciadi,
        oneriTarihi:          r.oneritori || new Date().toISOString(), // tarih ekledim
      }));
      setPending(mapped);
    } catch (err) {
      Alert.alert('Hata', 'Bekleyen öneriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  // SuperUser kararı gönder
  const handleDecision = async (oneriId, karar) => {
    setActionLoading(a => ({ ...a, [oneriId]: true }));
    try {
      // 1) Kararı kaydet
      await axios.post(
        `${BASE_URL}/api/admin/superUserKarar`,
        { oneriId, karar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Başarılı',
        karar === 'Onaylandi'
          ? 'Kullanıcı admin önerisi onaylandı.'
          : 'Kullanıcı önerisi reddedildi.'
      );
      // 2) Listeyi yenile
      fetchPending();
    } catch (err) {
      Alert.alert('Hata', err.response?.data?.mesaj || err.message);
    } finally {
      setActionLoading(a => ({ ...a, [oneriId]: false }));
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#fff"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bekleyen Öneriler</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Info Banner */}
      <View style={styles.infoBanner}>
        <Icon name="information-circle" size={20} color="#f75c5b" />
        <Text style={styles.infoText}>
          Admin önerileri değerlendirmenizi bekliyor
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Öneriler yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={pending}
          keyExtractor={item => String(item.oneriId)}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="time-outline" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>Bekleyen öneri bulunmuyor</Text>
              <Text style={styles.emptySubText}>Tüm öneriler değerlendirilmiş</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.proposalCard}>
              {/* Header Section */}
              <View style={styles.proposalHeader}>
                <View style={styles.proposalIcon}>
                  <Icon name="people" size={20} color="#f75c5b" />
                </View>
                <View style={styles.proposalInfo}>
                  <Text style={styles.proposalTitle}>Admin Önerisi</Text>
                  <Text style={styles.proposalDate}>
                    {new Date(item.oneriTarihi).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
              </View>

              {/* Users Section */}
              <View style={styles.usersSection}>
                <View style={styles.userContainer}>
                  <View style={styles.userAvatar}>
                    <Icon name="person" size={16} color="#f75c5b" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userLabel}>Öneren</Text>
                    <Text style={styles.userName}>{item.onerenKullaniciAdi}</Text>
                  </View>
                </View>

                <View style={styles.arrowContainer}>
                  <Icon name="arrow-forward" size={20} color="#999" />
                </View>

                <View style={styles.userContainer}>
                  <View style={styles.userAvatar}>
                    <Icon name="shield-checkmark-outline" size={16} color="#f75c5b" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userLabel}>Admin Adayı</Text>
                    <Text style={styles.userName}>{item.onerilenKullaniciAdi}</Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                {actionLoading[item.oneriId] ? (
                  <View style={styles.loadingActionContainer}>
                    <ActivityIndicator color="#f75c5b" size="small" />
                    <Text style={styles.loadingActionText}>İşleniyor...</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleDecision(item.oneriId, 'Onaylandi')}
                      activeOpacity={0.8}
                    >
                      <Icon name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.approveBtnText}>Onayla</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleDecision(item.oneriId, 'Reddedildi')}
                      activeOpacity={0.8}
                    >
                      <Icon name="close-circle" size={18} color="#fff" />
                      <Text style={styles.rejectBtnText}>Reddet</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },

  // HEADER STYLES
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { 
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 44,
  },

  // INFO BANNER
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '600',
    flex: 1,
  },

  // LOADING STYLES
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },

  // LIST STYLES
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },

  // EMPTY STATE
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },

  // PROPOSAL CARD STYLES
  proposalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },

  // PROPOSAL HEADER
  proposalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  proposalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffe3db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  proposalInfo: {
    flex: 1,
  },
  proposalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 2,
  },
  proposalDate: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },

  // USERS SECTION
  usersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  userContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffe3db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  userInfo: {
    flex: 1,
  },
  userLabel: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
  },
  arrowContainer: {
    marginHorizontal: 12,
  },

  // ACTION SECTION
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loadingActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  loadingActionText: {
    marginLeft: 8,
    color: '#f75c5b',
    fontWeight: '600',
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 0.48,
    justifyContent: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  approveBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  rejectBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
});
