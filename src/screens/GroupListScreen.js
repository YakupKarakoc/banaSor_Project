// src/screens/GroupListScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Modal,
  TextInput, ActivityIndicator, Alert
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Token çekme fonksiyonu (kendi utils'indeki gibi kullan)
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function GroupListScreen() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [refresh, setRefresh] = useState(false);

  // Tüm grupları çek
  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${BASE}/api/grup/grupList`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data.gruplar || []);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Gruplar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, [refresh]);

  // Grup oluştur
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      Alert.alert('Hata', 'Grup adı boş olamaz.');
      return;
    }
    try {
      const token = await getToken();
      await axios.post(`${BASE}/api/grup/olustur`,
        { ad: newGroupName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalVisible(false);
      setNewGroupName('');
      setRefresh(r => !r);  // listeyi yenile
      Alert.alert('Başarılı', 'Grup oluşturuldu!');
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', err.response?.data?.message || 'Grup oluşturulamadı.');
    }
  };

  // Gruba katıl
  const handleJoin = async (grupId) => {
    try {
      const token = await getToken();
      await axios.post(`${BASE}/api/grup/katil`,
        { grupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Başarılı', 'Gruba katıldınız!');
      setRefresh(r => !r);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', err.response?.data?.message || 'Gruba katılma başarısız');
    }
  };

  // Gruptan çık
  const handleLeave = async (grupId) => {
    Alert.alert(
      "Onayla",
      "Bu gruptan çıkmak istediğinize emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çık",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${BASE}/api/grup/grupCik/${grupId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              setRefresh(r => !r);
              Alert.alert('Başarılı', 'Gruptan çıkıldı.');
            } catch (err) {
              console.error(err);
              Alert.alert('Hata', err.response?.data?.message || 'Çıkış başarısız');
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Ionicons name="people-circle-outline" size={30} color="#f75c5b" style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.groupName}>{item.ad}</Text>
          <Text style={styles.groupMeta}>
            Kurucu: {item.kullaniciadi || item.kullaniciAdi} | Üye sayısı: {item.uyesayisi}
          </Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        {/* Burada üyelik durumuna göre buton değiştirilebilir. Şimdilik sadece iki butonu gösteriyoruz */}
        <TouchableOpacity style={styles.joinBtn} onPress={() => handleJoin(item.grupid || item.grupId)}>
          <Ionicons name="log-in-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>KATIL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.leaveBtn} onPress={() => handleLeave(item.grupid || item.grupId)}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.btnText}>ÇIK</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.headerTxt}>Topluluklar</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={26} color="#fff" />
          <Text style={styles.addBtnText}>Grup Oluştur</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loaderText}>Yükleniyor…</Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={g => (g.grupid || g.grupId).toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Grup oluştur modalı */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Yeni Grup Oluştur</Text>
            <TextInput
              value={newGroupName}
              onChangeText={setNewGroupName}
              style={styles.modalInput}
              placeholder="Grup adı giriniz"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}>
                <Text style={{ color: '#444', fontWeight: '500' }}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCreateGroup} style={styles.confirmBtn}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  headerTxt: { fontSize: 22, fontWeight: '700', color: '#fff' },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#4CD964',
    borderRadius: 14, paddingVertical: 8, paddingHorizontal: 16
  },
  addBtnText: { color: '#fff', fontWeight: '700', marginLeft: 7 },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { color: '#fff', marginTop: 12, fontSize: 16, opacity: 0.8 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, marginVertical: 8, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 8,
    elevation: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)'
  },
  cardContent: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  groupName: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  groupMeta: { fontSize: 13, color: '#666', marginTop: 3, fontWeight: '500' },
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 7 },
  joinBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#00b894',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12
  },
  leaveBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#ff5252',
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, marginLeft: 8
  },
  btnText: { color: '#fff', marginLeft: 7, fontWeight: '700', fontSize: 14 },

  // Modal stilleri
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '84%', backgroundColor: '#fff', borderRadius: 12, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 16, fontSize: 15 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  cancelBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  confirmBtn: { backgroundColor: '#f75c5b', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
});
