import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function DepartmentDetail() {
  const { universite, faculty, department } = useRoute().params;

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>{department.bolumadi}</Text>
        <Text style={styles.subTitle}>
          {faculty.fakulteadi} • {universite.universiteadi}
        </Text>

        {/* Announcements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📢 Duyurular</Text>
          <Text style={styles.cardItem}>
            • Staj başvuru tarihi duyurusu.
          </Text>
        </View>

        {/* Forum */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💬 Forum</Text>
          <Text style={styles.cardItem}>
            Soru: Staj yerleri nereden öğrenilir?
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subTitle: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#f75c5b',
  },
  cardItem: {
    fontSize: 14,
    color: '#444',
  },
});
