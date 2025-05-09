// src/screens/FacultyDetail.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

export default function FacultyDetail() {
  const { universite, faculty } = useRoute().params;
  const navigation = useNavigation();
  const [departments, setDepartments] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/education/department`, {
        params: {
          universiteId: universite.universiteid,
          fakulteId: faculty.fakulteid,
          aktifMi: true,
        },
      })
      .then(res => setDepartments(res.data))
      .catch(console.error)
      .finally(() => setLoadingDeps(false));
  }, [universite, faculty]);

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>{faculty.fakulteadi}</Text>
        <Text style={styles.subTitle}>@ {universite.universiteadi}</Text>

        {/* Son Duyurular */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📢 Son Duyurular</Text>
          <Text style={styles.cardItemSmall}>• Yeni bölüm açılışı duyuruldu.</Text>
        </View>

        {/* Minik Forum */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('Forum', {
              universiteId: universite.universiteid,
              fakulteId: faculty.fakulteid,
            })
          }
        >
          <Text style={styles.cardTitle}>💬 Minik Forum</Text>
          <Text style={styles.cardItemSmall}>
            Bu fakültenin forum başlıklarına ve sorularına git
          </Text>
        </TouchableOpacity>

        {/* Bölümler */}
        <Text style={styles.sectionHeader}>Bölümler</Text>
        {loadingDeps ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          departments.map(d => (
            <TouchableOpacity
              key={d.bolumid}
              style={styles.listItem}
              onPress={() =>
                navigation.push('DepartmentDetail', {
                  universite,
                  faculty,
                  department: d,
                })
              }
            >
              <Text style={styles.itemText}>{d.bolumadi}</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  content:        { padding: 20 },
  title:          { color: '#fff', fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subTitle:       { color: '#fff', fontSize: 14, textAlign: 'center', marginBottom: 16 },
  card:           { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12, elevation: 2 },
  cardTitle:      { fontSize: 15, fontWeight: '600', marginBottom: 6, color: '#f75c5b' },
  cardItemSmall:  { fontSize: 13, color: '#444' },
  sectionHeader:  { color: '#fff', fontSize: 17, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  listItem:       { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, marginBottom: 6 },
  itemText:       { flex: 1, color: '#fff', fontSize: 15 },
});
