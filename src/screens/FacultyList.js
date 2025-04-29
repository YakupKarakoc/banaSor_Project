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
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:3000';

export default function FacultyList() {
  const { universite } = useRoute().params;
  const navigation = useNavigation();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/education/faculty`, {
        params: { universiteId: universite.universiteid, aktifMi: true },
      })
      .then((r) => setFaculties(r.data))
      .catch(() => Alert.alert('Hata', 'Fakülteler yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <Text style={styles.title}>{universite.universiteadi} – Fakülteler</Text>
      <FlatList
        data={faculties}
        keyExtractor={(i) => i.fakulteid.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('DepartmentList', {
                universite,
                fakulte: item,
              })
            }
          >
            <Text style={styles.itemText}>{item.fakulteadi}</Text>
            <Ionicons name="chevron-forward" size={20} color="#f75c5b" />
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 16 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f75c5b' },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemText: { fontSize: 16, color: '#333' },
});