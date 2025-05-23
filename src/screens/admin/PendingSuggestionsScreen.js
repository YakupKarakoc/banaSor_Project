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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-outline" size={24} color="#fff"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bekleyen Öneriler</Text>
      </View>

      {loading
        ? <ActivityIndicator size="large" color="#fff" style={{marginTop:20}}/>
        : (
          <FlatList
            data={pending}
            keyExtractor={item => String(item.oneriId)}
            contentContainerStyle={{ padding:16 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Bekleyen öneri yok.</Text>
            }
            renderItem={({ item }) => (
              <View style={styles.proposalCard}>
                <Text style={styles.proposalText}>
                  <Text style={styles.proposalBold}>{item.onerenKullaniciAdi}</Text>
                  {' → '}
                  <Text style={styles.proposalBold}>{item.onerilenKullaniciAdi}</Text>
                </Text>
                <View style={styles.proposalButtons}>
                  {actionLoading[item.oneriId]
                    ? <ActivityIndicator color="#fff"/>
                    : <>
                        <TouchableOpacity
                          style={styles.okBtn}
                          onPress={() => handleDecision(item.oneriId, 'Onaylandi')}
                        >
                          <Text style={styles.btnText}>Onayla</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.noBtn}
                          onPress={() => handleDecision(item.oneriId, 'Reddedildi')}
                        >
                          <Text style={styles.btnText}>Reddet</Text>
                        </TouchableOpacity>
                      </>
                  }
                </View>
              </View>
            )}
          />
        )
      }
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  header: {
    flexDirection:'row', alignItems:'center',
    paddingTop:48, paddingHorizontal:16, paddingBottom:12
  },
  headerTitle: { color:'#fff', fontSize:20, fontWeight:'700', marginLeft:12 },

  emptyText:    { color:'#fff', textAlign:'center', marginTop:40 },

  proposalCard: {
    backgroundColor:'#fff',
    borderRadius:8,
    padding:12,
    marginBottom:12
  },
  proposalText: { marginBottom:8 },
  proposalBold: { fontWeight:'700' },
  proposalButtons: { flexDirection:'row' },

  okBtn: {
    backgroundColor:'#30d158',
    paddingVertical:6, paddingHorizontal:12,
    borderRadius:6, marginRight:8
  },
  noBtn: {
    backgroundColor:'#ff3b30',
    paddingVertical:6, paddingHorizontal:12,
    borderRadius:6
  },
  btnText: { color:'#fff', fontWeight:'600' },
});
