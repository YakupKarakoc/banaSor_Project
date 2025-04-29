import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

export default function DepartmentList() {
  const { universite, fakulte } = useRoute().params;
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f75c5b" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <Text style={styles.title}>
        {fakulte.fakulteadi} – Bölümler
      </Text>
      <FlatList
        data={depts}
        keyExtractor={(i) => i.bolumid.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            // replace with your DepartmentDetail if you have it
            onPress={() => Alert.alert('Bölüm Seçildi', item.bolumadi)}
          >
            <Text style={styles.itemText}>{item.bolumadi}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 12,
  },
  item: {
    backgroundColor: '#fff',
    padding: 14,
    marginBottom: 12,
    borderRadius: 10,
  },
  itemText: { fontSize: 16, color: '#333' },
});
