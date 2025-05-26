// src/screens/MyGroupsScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function MyGroupsScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [myGroups, setMyGroups] = useState([]);
  const [adminGroups, setAdminGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavingId, setLeavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Header
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  // Data Fetch
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = await getToken();

      // Yönetici olduğun gruplar
      const adminRes = await axios.get(`${BASE}/api/grup/kurdugumGruplar`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Üye olduğun gruplar
      const myRes = await axios.get(`${BASE}/api/grup/uyeOldugumGruplar`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAdminGroups(Array.isArray(adminRes.data) ? adminRes.data : []);
      setMyGroups(Array.isArray(myRes.data) ? myRes.data : []);
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Gruplarınız getirilemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) fetchGroups();
  }, [isFocused]);

  // Gruptan çık
  const handleLeaveGroup = (grupId) => {
    Alert.alert(
      'Gruptan Çık',
      'Bu gruptan çıkmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çık',
          style: 'destructive',
          onPress: async () => {
            setLeavingId(grupId);
            try {
              const token = await getToken();
              await axios.delete(`${BASE}/api/grup/gruptanCik/${grupId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchGroups();
            } catch (e) {
              Alert.alert('Hata', 'Çıkılamadı: ' + (e.response?.data?.message ?? ''));
            } finally {
              setLeavingId(null);
            }
          }
        }
      ]
    );
  };

  // Grubu sil (sadece yönetici)
  const handleDeleteGroup = (grupId) => {
    Alert.alert(
      'Grubu Sil',
      'Bu grubu silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(grupId);
            try {
              const token = await getToken();
              await axios.delete(`${BASE}/api/grup/grupSil/${grupId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              fetchGroups();
            } catch (e) {
              Alert.alert('Hata', 'Silinemedi: ' + (e.response?.data?.message ?? ''));
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  // Render Fonksiyonu
  const renderGroupCard = ({ item, admin = false }) => (
    <View style={styles.groupCard}>
      <View style={styles.groupCardHeader}>
        <Ionicons name="people" size={24} color="#00bcd4" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.groupName}>{item.ad || item.grupad || item.grupAd || item.baslik}</Text>
          <Text style={styles.groupDetail}>
            {admin
              ? 'Kurucu: Siz'
              : `Kurucu: ${item.kurucuadi || item.kurucu || item.kurucuAd || '-'}`}
          </Text>
          <Text style={styles.groupDetail}>
            Üye Sayısı: {item.uyesayisi ?? item.uyeSayisi ?? '-'}
          </Text>
        </View>
      </View>
      <View style={styles.groupActions}>
        {admin ? (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteGroup(item.grupid || item.grupId || item.id)}
            disabled={deletingId === (item.grupid || item.grupId || item.id)}
          >
            {deletingId === (item.grupid || item.grupId || item.id)
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="trash" size={18} color="#fff" />}
            <Text style={styles.actionText}>
              {deletingId === (item.grupid || item.grupId || item.id) ? 'Siliniyor...' : 'Sil'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.leaveBtn}
            onPress={() => handleLeaveGroup(item.grupid || item.grupId || item.id)}
            disabled={leavingId === (item.grupid || item.grupId || item.id)}
          >
            {leavingId === (item.grupid || item.grupId || item.id)
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="exit" size={18} color="#fff" />}
            <Text style={styles.actionText}>
              {leavingId === (item.grupid || item.grupId || item.id) ? 'Çıkılıyor...' : 'Çık'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#00bcd4" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gruplarım</Text>
          <Ionicons name="people" size={24} color="#fff" />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Yönetici Olduğun Gruplar */}
          <Text style={styles.sectionTitle}>Yönetici Olduğun Gruplar</Text>
          {adminGroups.length === 0 ? (
            <Text style={styles.emptyText}>Hiç grup kurmamışsın</Text>
          ) : (
            <FlatList
              data={adminGroups}
              keyExtractor={item => (item.grupid || item.grupId || item.id || Math.random()).toString()}
              renderItem={({ item }) => renderGroupCard({ item, admin: true })}
              scrollEnabled={false}
            />
          )}

          {/* Üye Olduğun Gruplar */}
          <Text style={styles.sectionTitle}>Üye Olduğun Gruplar</Text>
          {myGroups.length === 0 ? (
            <Text style={styles.emptyText}>Üyesi olduğun grup yok</Text>
          ) : (
            <FlatList
              data={myGroups}
              keyExtractor={item => (item.grupid || item.grupId || item.id || Math.random()).toString()}
              renderItem={({ item }) => renderGroupCard({ item, admin: false })}
              scrollEnabled={false}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  headerBtn: {
    backgroundColor: 'rgba(0,0,0,0.09)',
    borderRadius: 20,
    padding: 7,
    marginRight: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1.1,
    flex: 1,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 8,
    color: '#222',
    letterSpacing: 0.2,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 16,
    marginLeft: 10,
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,188,212,0.07)',
  },
  groupCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  groupDetail: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  groupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  leaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e17055',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginRight: 7,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00bcd4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
