// src/screens/FacultyDetail.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

export default function FacultyDetail() {
  const { universite, faculty } = useRoute().params;
  const navigation = useNavigation();
  const [departments, setDepartments] = useState([]);
  const [loadingDeps, setLoadingDeps] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

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
  }, [universite, faculty]);

  const renderDepartment = (d) => (
    <Animated.View
      key={d.bolumid}
      style={[
        styles.listItem,
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
        style={styles.departmentBtn}
        onPress={() =>
          navigation.push('DepartmentDetail', {
            universite,
            faculty,
            department: d,
          })
        }
        activeOpacity={0.9}
      >
        <View style={styles.departmentIconRow}>
          <Icon name="school-outline" size={20} color="#fff" style={styles.departmentIcon} />
          <Text style={styles.itemText}>{d.bolumadi}</Text>
        </View>
        <Icon name="chevron-forward" size={20} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="school-outline" size={36} color="#fff" style={styles.headerIcon} />
          <Text style={styles.title}>{faculty.fakulteadi}</Text>
          <Text style={styles.subTitle}>@ {universite.universiteadi}</Text>
        </View>

        {/* Son Duyurular */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="megaphone-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Son Duyurular</Text>
          </View>
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
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <Icon name="chatbubbles-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Minik Forum</Text>
          </View>
          <Text style={styles.cardItemSmall}>
            Bu fakültenin forum başlıklarına ve sorularına git
          </Text>
        </TouchableOpacity>

        {/* Bölümler */}
        <View style={styles.sectionHeaderRow}>
          <Icon name="layers-outline" size={20} color="#fff" style={styles.sectionIcon} />
          <Text style={styles.sectionHeader}>Bölümler</Text>
        </View>
        {loadingDeps ? (
          <ActivityIndicator color="#fff" size="large" style={{ marginTop: 16 }} />
        ) : departments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="school-outline" size={40} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
            <Text style={styles.emptyText}>Bölüm bulunamadı.</Text>
          </View>
        ) : (
          departments.map(renderDepartment)
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  content:        { padding: 20, paddingBottom: 30 },
  header:         { alignItems: 'center', marginBottom: 18 },
  headerIcon:     { marginBottom: 8 },
  title:          { color: '#fff', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 2, letterSpacing: 0.5 },
  subTitle:       { color: '#fff', fontSize: 15, textAlign: 'center', marginBottom: 8, opacity: 0.9 },
  card:           { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  cardHeader:     { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon:       { marginRight: 8 },
  cardTitle:      { fontSize: 16, fontWeight: '700', color: '#f75c5b', letterSpacing: 0.3 },
  cardItemSmall:  { fontSize: 14, color: '#666', fontWeight: '500' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 },
  sectionIcon:    { marginRight: 8 },
  sectionHeader:  { color: '#fff', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 },
  emptyContainer: { flex: 1, alignItems: 'center', marginTop: 16 },
  emptyText:      { color: '#fff', fontSize: 15, opacity: 0.8 },
  listItem:       { marginBottom: 10 },
  departmentBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.15)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  departmentIconRow: { flexDirection: 'row', alignItems: 'center' },
  departmentIcon: { marginRight: 10 },
  itemText:       { color: '#fff', fontSize: 15, fontWeight: '600', letterSpacing: 0.2 },
});
