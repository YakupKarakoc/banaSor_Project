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

export default function DepartmentDetail() {
  const { universite, faculty, department } = useRoute().params;
  const navigation = useNavigation();
  const [loadingNews, setLoadingNews] = useState(false);

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <Text style={styles.title}>{department.bolumadi}</Text>
        <Text style={styles.subTitle}>
          @ {faculty.fakulteadi} • {universite.universiteadi}
        </Text>

        {/* Announcements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📢 Son Duyurular</Text>
          <Text style={styles.cardItemSmall}>
            • Staj başvuru tarihi duyurusu.
          </Text>
        </View>

        {/* Forum ve Sorular */}
        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('Forum', {
              universiteId: universite.universiteid,
              fakulteId: faculty.fakulteid,
              bolumId: department.bolumid,
            })
          }
        >
          <Text style={styles.cardTitle}>💬 Forum</Text>
          <Text style={styles.cardItemSmall}>
            Bu bölümün forum başlıklarını görüntüle
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate('QuestionList', {
              universiteId: universite.universiteid,
              fakulteId: faculty.fakulteid,
              bolumId: department.bolumid,
            })
          }
        >
          <Text style={styles.cardTitle}>❓ Sorular</Text>
          <Text style={styles.cardItemSmall}>
            Bu bölümün sorularını görüntüle
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  subTitle: {
    color: '#fff',
    fontSize: 14,
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
  cardItemSmall: {
    fontSize: 13,
    color: '#444',
    marginBottom: 4,
  },
});
