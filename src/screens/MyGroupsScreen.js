import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TouchableOpacity, StatusBar, SafeAreaView, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../utils/auth';

// !!! BURAYA KENDİ KULLANICI ADINI GETİREN YAPINI KOY !!!
// Örnek: asyncStorage veya JWT'den dinamik alabilirsin.
const myUsername = "hhoglu11"; // <- Bunu dinamik yap istersen!

const BASE = 'http://10.0.2.2:3000';

export default function MyGroupsScreen() {
  const navigation = useNavigation();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const res = await axios.get(`${BASE}/api/grup/uyeOldugumGruplar`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const gruplar = res.data?.gruplar ?? [];
      setGroups(gruplar);
    } catch (e) {
      Alert.alert('Hata', 'Gruplar yüklenemedi');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  // Sadece kurucuysa silme aktif!
  const handleDelete = (grupid) => {
    Alert.alert(
      'Grubu Sil',
      'Bu grubu silmek istediğine emin misin? Grupta birden fazla üye varsa silinemez!',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(grupid);
            try {
              const token = await getToken();
              await axios.delete(`${BASE}/api/grup/grupSil/${grupid}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              setGroups(prev => prev.filter(g => g.grupid !== grupid));
              Alert.alert('Başarılı', 'Grup silindi.');
            } catch (e) {
              // API'den dönen hatayı göster
              const msg = e?.response?.data?.message || "Grup silinemedi. (Belki birden fazla üye var?)";
              Alert.alert('Hata', msg);
            } finally {
              setDeletingId(null);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.card} key={item.grupid}>
      <View style={styles.cardContent}>
        <View style={styles.iconArea}>
          <Ionicons name="people-circle" size={32} color="#6c5ce7" />
        </View>
        <View style={styles.infoArea}>
          <Text style={styles.groupName}>{item.grupadi}</Text>
          <Text style={styles.groupMeta}>
            Kurucu: <Text style={{ fontWeight: 'bold' }}>{item.olusturankullanici}</Text>
          </Text>
          <Text style={styles.groupMeta}>
            Takipçi: {item.takipcisayisi}
          </Text>
        </View>
       
        
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Topluluklarım</Text>
        </View>
        {loading ? (
          <View style={styles.loaderArea}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loaderText}>Yükleniyor...</Text>
          </View>
        ) : (
          <FlatList
            data={groups}
            keyExtractor={item => item.grupid?.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Henüz üye olduğunuz grup yok</Text>
            }
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#f75c5b' },
  container: { flex: 1 },
  header: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconArea: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f3f0fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoArea: {
    flex: 1,
  },
  groupName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 13,
    color: '#636e72',
    marginBottom: 2,
  },
  deleteBtn: {
    backgroundColor: '#e17055',
    borderRadius: 8,
    padding: 8,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#e17055',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  loaderArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  emptyText: {
    color: '#fff',
    marginTop: 60,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
