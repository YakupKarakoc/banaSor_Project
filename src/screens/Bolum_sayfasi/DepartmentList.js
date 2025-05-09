import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

export default function DepartmentList() {
  const { universite, fakulte } = useRoute().params;
  const navigation = useNavigation();
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/education/department`, {
        params: {
          universiteId: universite.universiteid,
          fakulteId: fakulte.fakulteid,
          aktifMi: true,
        },
      })
      .then((r) => setDepts(r.data))
      .catch(() => Alert.alert('Hata', 'Bölümler yüklenemedi'))
      .finally(() => setLoading(false));
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Bölümler yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.item,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.itemBtn}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate('DepartmentDetail', {
            universite,
            faculty: fakulte,
            department: item,
          })
        }
      >
        <View style={styles.itemIconRow}>
          <Icon name="layers-outline" size={22} color="#f75c5b" style={styles.itemIcon} />
          <Text style={styles.itemText}>{item.bolumadi}</Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#f75c5b" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <Icon name="layers-outline" size={32} color="#fff" style={styles.headerIcon} />
        <Text style={styles.title}>{fakulte.fakulteadi} – Bölümler</Text>
      </View>
      <FlatList
        data={depts}
        keyExtractor={(i) => i.bolumid.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="layers-outline" size={40} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
            <Text style={styles.emptyText}>Bölüm bulunamadı.</Text>
          </View>
        }
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 12, opacity: 0.8 },
  header: { alignItems: 'center', marginBottom: 18, marginTop: 24 },
  headerIcon: { marginBottom: 8 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  list: { padding: 16, paddingBottom: 30 },
  item: { marginBottom: 12 },
  itemBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: 16, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  itemIconRow: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { marginRight: 10 },
  itemText: { fontSize: 16, color: '#2D3436', fontWeight: '600', letterSpacing: 0.2 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 16 },
  emptyText: { color: '#fff', fontSize: 15, opacity: 0.8 },
});
