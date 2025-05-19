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
    }
  };

  // --- Render each forum card ---
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.cardInner}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('ForumDetail', { forumId: item.forumid })
        }
      >
        <View style={styles.row}>
          <Ionicons name="chatbubbles-outline" size={20} color="#f75c5b" style={{ marginRight: 10 }}/>
          <Text style={styles.title} numberOfLines={2}>{item.baslik}</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="school-outline" size={14} color="#ff8a5c" />
          <Text style={styles.meta}>Uni ID: {item.universiteid}</Text>
          <Ionicons name="document-text-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }}/>
        </View>
      </TouchableOpacity>
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={() => openUpdateModal(item.forumid, item.baslik)}
        >
          <Ionicons name="pencil-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Güncelle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => handleDelete(item.forumid)}
        >
          <Ionicons name="trash-outline" size={18} color="#fff" />
          <Text style={styles.actionText}>Sil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.flex}>
        <View style={styles.header}>
          <Ionicons
            name="people-circle-outline"
            size={26}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.headerTxt}>Forumlarım</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadText}>Yükleniyor…</Text>
          </View>
        ) : data.length === 0 ? (
          <View style={styles.centerEmpty}>
            <Ionicons
              name="chatbubbles-outline"
              size={46}
              color="#fff"
              style={{ opacity: 0.7 }}
            />
            <Text style={styles.emptyTxt}>
              Henüz oluşturduğunuz forum başlığı yok.
            </Text>
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={item => item.forumid?.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </LinearGradient>

      {/* Güncelle Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Başlık Güncelle</Text>
            <TextInput
              style={styles.modalInput}
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Yeni başlık"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.modalCancel}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdate}
                style={styles.modalConfirm}
              >
                <Text style={styles.modalConfirmText}>Güncelle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 48,
  },
  headerTxt: { fontSize: 22, fontWeight: '700', color: '#fff' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadText: { color: '#fff', marginTop: 10, fontSize: 15, opacity: 0.8 },

  centerEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTxt: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardInner: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 15, fontWeight: '700', color: '#2D3436', flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500' },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CD964',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  actionText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
  },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    fontSize: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancel: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalCancelText: {
    color: '#444',
    fontWeight: '500',
  },
  modalConfirm: {
    backgroundColor: '#f75c5b',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});
