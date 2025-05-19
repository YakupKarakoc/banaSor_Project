// src/screens/admin/SuperUserAdmin.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

const TAB_LIST = [
  { key: 'forum', label: 'Forumlar' },
  { key: 'soru', label: 'Sorular' },
  { key: 'grup', label: 'Gruplar' },
];

export default function SuperUserAdmin({ navigation, route }) {
  const { token } = route.params || {};

  const [activeTab, setActiveTab] = useState('forum');
  const [loading, setLoading] = useState(false);
  const [forums, setForums] = useState([]);
  const [sorular, setSorular] = useState([]);
  const [gruplar, setGruplar] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const forumRes = await axios.get(`${BASE_URL}/api/forum/getir`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForums((forumRes.data ?? []).filter(f => f?.forumid != null));

      const soruRes = await axios.get(`${BASE_URL}/api/soru/getir`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSorular((soruRes.data ?? []).filter(s => s?.soruid != null));

      const grupRes = await axios.get(`${BASE_URL}/api/grup/grupList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const gruplarList = grupRes.data.gruplar ?? [];
      setGruplar((gruplarList ?? []).filter(g => g?.grupid != null));
    } catch (e) {
      Alert.alert('Hata', 'Veriler alınamadı: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    Alert.alert(`${type} Sil`, `Bu ${type.toLowerCase()} silinsin mi?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/admin/${type}/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (type === 'forum') setForums(prev => prev.filter(f => f.forumid !== id));
            else if (type === 'soru') setSorular(prev => prev.filter(s => s.soruid !== id));
            else if (type === 'grup') setGruplar(prev => prev.filter(g => g.grupid !== id));
            Alert.alert('Başarılı', `${type} silindi.`);
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.message || e.message);
          }
        },
      },
    ]);
  };

  const renderForumItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('AdminForumDetay', { forum: item, token })}
        style={{ flex: 1 }}
      >
        <Text style={styles.cardTitle}>{item.baslik}</Text>
        <Text style={styles.cardMeta}>Üniversite: {item.universiteAdi}</Text>
        <Text style={styles.cardMeta}>Kullanıcı: {item.olusturanKullaniciAdi}</Text>
        <Text style={styles.cardMeta}>Tarih: {new Date(item.olusturmaTarihi).toLocaleDateString()}</Text>
        <Text style={styles.cardMeta}>Entry Sayısı: {item.entrySayisi}</Text>
        <Text style={styles.cardMeta}>ID: {item.forumid}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDelete('forum', item.forumid)}
        style={styles.deleteBtn}
      >
        <Icon name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderSoruItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => navigation.navigate('AdminSoruDetay', { soru: item, token })}
        style={{ flex: 1 }}
      >
        <Text style={styles.cardTitle}>{item.icerik}</Text>
        <Text style={styles.cardMeta}>ID: {item.soruid}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => handleDelete('soru', item.soruid)}
        style={styles.deleteBtn}
      >
        <Icon name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderGrupItem = ({ item }) => (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.ad}</Text>
        <Text style={styles.cardMeta}>ID: {item.grupid}</Text>
        <Text style={styles.cardMeta}>Tarih: {new Date(item.olusturmatarihi).toLocaleDateString()}</Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete('grup', item.grupid)}
        style={styles.deleteBtn}
      >
        <Icon name="trash-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const TAB_DATA = {
    forum: {
      data: forums,
      empty: 'Forum bulunamadı.',
      renderItem: renderForumItem,
      keyExtractor: item => String(item.forumid),
    },
    soru: {
      data: sorular,
      empty: 'Soru bulunamadı.',
      renderItem: renderSoruItem,
      keyExtractor: item => String(item.soruid),
    },
    grup: {
      data: gruplar,
      empty: 'Grup bulunamadı.',
      renderItem: renderGrupItem,
      keyExtractor: item => String(item.grupid),
    },
  };

  const tabProps = TAB_DATA[activeTab];

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SuperUser Paneli</Text>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.replace('Home', { user: route.params?.user })}
        >
          <Icon name="home-outline" size={22} color="#fff" />
          <Text style={styles.homeBtnText}>Ana Sayfa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        {TAB_LIST.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab === tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabBtnText, activeTab === tab.key && styles.tabBtnTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={tabProps.data}
            renderItem={tabProps.renderItem}
            keyExtractor={tabProps.keyExtractor}
            ListEmptyComponent={<Text style={styles.emptyText}>{tabProps.empty}</Text>}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 25,
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  homeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff8a5c',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  homeBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 7,
    fontSize: 15,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
    marginBottom: 10,
    overflow: 'hidden',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#ffe3db',
    borderBottomColor: '#f75c5b',
  },
  tabBtnText: {
    color: '#2D3436',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#f75c5b',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 13,
    padding: 16,
    marginBottom: 13,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardTitle: { fontWeight: '700', fontSize: 15, color: '#f75c5b' },
  cardMeta: { fontSize: 12, color: '#555', marginTop: 2 },
  emptyText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 35,
    fontSize: 15,
  },
  deleteBtn: {
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    alignSelf: 'center',
  },
});
