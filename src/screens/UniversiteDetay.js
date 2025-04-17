// src/screens/UniversiteDetay.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const UniversiteDetay = () => {
  const route = useRoute();
  const { universite } = route.params;
  const uniId = universite.universiteid;

  const [faculties, setFaculties] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [departments, setDepartments] = useState({});
  const [loadingFac, setLoadingFac] = useState(true);
  const [loadingDeps, setLoadingDeps] = useState({});

  // Fakülteleri çek
  useEffect(() => {
    axios
      .get('http://10.0.2.2:3000/api/education/faculty', {
        params: { universiteId: uniId, aktifMi: true },
      })
      .then((res) => setFaculties(res.data))
      .catch(console.error)
      .finally(() => setLoadingFac(false));
  }, [uniId]);

  // Accordion aç-kapa ve bölümler için API çağrısı
  const toggleFaculty = (fakulteId) => {
    setExpanded((prev) => {
      const nowOpen = !prev[fakulteId];

      if (nowOpen && !departments[fakulteId]) {
        // Bölümleri çağır
        setLoadingDeps((ld) => ({ ...ld, [fakulteId]: true }));
        axios
          .get('http://10.0.2.2:3000/api/education/department', {
            params: {
              universiteId: uniId,
              fakulteId,
              aktifMi: true,
            },
          })
          .then((res) =>
            setDepartments((d) => ({ ...d, [fakulteId]: res.data }))
          )
          .catch(console.error)
          .finally(() =>
            setLoadingDeps((ld) => ({ ...ld, [fakulteId]: false }))
          );
      }

      return { ...prev, [fakulteId]: nowOpen };
    });
  };

  return (
    <LinearGradient
      colors={['#f75c5b', '#ff8a5c']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Başlık */}
        <Text style={styles.title}>{universite.universiteadi}</Text>
        <Text style={styles.subTitle}>Şehir: {universite.sehiradi}</Text>

        {/* İstatistik */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="star" size={18} color="#fff" />
            <Text style={styles.statText}>
              {' '}
              {universite.puan ?? '-'} puan
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={18} color="#fff" />
            <Text style={styles.statText}>
              {' '}
              {universite.takipciSayisi ?? '-'} takipçi
            </Text>
          </View>
        </View>

        {/* Accordion */}
        <Text style={styles.sectionTitle}>Fakülteler & Bölümler</Text>
        {loadingFac ? (
          <ActivityIndicator color="#fff" size="large" />
        ) : (
          faculties.map((fakulte) => {
            const fid = fakulte.fakulteid;
            const isOpen = !!expanded[fid];

            return (
              <View key={fid} style={styles.accordion}>
                <TouchableOpacity
                  style={styles.header}
                  onPress={() => toggleFaculty(fid)}
                >
                  <Ionicons
                    name="school-outline"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.headerText}>
                    {fakulte.fakulteadi}
                  </Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#fff"
                  />
                </TouchableOpacity>

                {isOpen && (
                  <View style={styles.body}>
                    {loadingDeps[fid] ? (
                      <ActivityIndicator color="#f75c5b" />
                    ) : (
                      (departments[fid] || []).map((bolum) => (
                        <Text
                          key={bolum.bolumid}
                          style={styles.department}
                        >
                          • {bolum.bolumadi}
                        </Text>
                      ))
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </LinearGradient>
  );
};

export default UniversiteDetay;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  stat: { flexDirection: 'row', alignItems: 'center' },
  statText: { color: '#fff', fontSize: 14 },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  accordion: {
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
    marginHorizontal: 8,
  },
  body: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  department: {
    fontSize: 14,
    color: '#333',
    paddingVertical: 4,
  },
});
