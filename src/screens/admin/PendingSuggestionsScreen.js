// src/screens/admin/PendingSuggestionsScreen.js

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

export default function PendingSuggestionsScreen({ navigation, route }) {
  const { token } = route.params;
  const [pending, setPending]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [actionLoading, setActionLoading] = useState({}); // { [oneriId]: boolean }

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${BASE_URL}/api/admin/bekleyenOneriler`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Map backend’s lowercase keys to camelCase
      const mapped = res.data.map(r => ({
        oneriId:              r.oneriid,
        onerenKullaniciAdi:   r.onerenkullaniciadi,
        onerilenKullaniciAdi: r.onerilenkullaniciadi,
        onerilenKullaniciId:  r.onerilenkullaniciid, // for direct admin call
      }));
      setPending(mapped);
    } catch (err) {
      Alert.alert('Hata', 'Bekleyen öneriler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (oneriId, karar, onerilenKullaniciId) => {
    setActionLoading(prev => ({ ...prev, [oneriId]: true }));
    try {
      // 1) Record superUser decision
      await axios.post(
        `${BASE_URL}/api/admin/superUserKarar`,
        { oneriId, karar },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2) If approved, make that user admin
      if (karar === 'Onaylandi') {
        if (!onerilenKullaniciId) {
          throw new Error('Önerilen kullanıcı ID bulunamadı.');
        }
        await axios.post(
          `${BASE_URL}/api/admin/dogrudanAdmin`,
          { kullaniciId: onerilenKullaniciId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // 3) Refresh list & inform
      await fetchPending();
      Alert.alert(
        'Başarılı',
        karar === 'Onaylandi'
          ? 'Kullanıcı admin olarak atandı.'
          : 'Öneri reddedildi.'
      );
    } catch (err) {
      Alert.alert(
        'Hata',
        err.response?.data?.mesaj
          || err.response?.data?.message
          || err.message
      );
    } finally {
      setActionLoading(prev => ({ ...prev, [oneriId]: false }));
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Bekleyen Öneriler</Text>
        </View>

        {/* Loading */}
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={pending}
            keyExtractor={item => String(item.oneriId)}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <Text style={styles.empty}>Bekleyen öneri yok.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.infoRow}>
                  <Icon name="person-outline" size={22} color="#f75c5b" />
                  <Text style={styles.infoText}>
                    {item.onerenKullaniciAdi} → {item.onerilenKullaniciAdi}
                  </Text>
                </View>

                {actionLoading[item.oneriId] ? (
                  <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
                ) : (
                  <View style={styles.buttonsRow}>
                    <TouchableOpacity
                      style={styles.okBtn}
                      onPress={() =>
                        handleDecision(
                          item.oneriId,
                          'Onaylandi',
                          item.onerilenKullaniciId
                        )
                      }
                    >
                      <Text style={styles.btnText}>Onayla</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.noBtn}
                      onPress={() => handleDecision(item.oneriId, 'Reddedildi')}
                    >
                      <Text style={styles.btnText}>Reddet</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginRight: 24, // to visually center the title
  },
  empty: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  okBtn: {
    flex: 1,
    backgroundColor: '#30d158',
    paddingVertical: 10,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  noBtn: {
    flex: 1,
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
});
