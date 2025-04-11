import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

const UniversiteDetay = () => {
  const route = useRoute();
  const { universite } = route.params;

  const [isFollowed, setIsFollowed] = useState(false);

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.uniIsmi}>{universite.name}</Text>
        <Text style={styles.sehir}>{universite.city}</Text>

        {/* İstatistik kutusu */}
        <View style={styles.statBox}>
          <Text style={styles.statText}>👥 {universite.followers} takipçi</Text>
          <Text style={styles.statText}>⭐ {universite.rating} puan</Text>
          <TouchableOpacity
            style={[styles.followButton, isFollowed && styles.followed]}
            onPress={() => setIsFollowed(!isFollowed)}
          >
            <Text style={[styles.followText, isFollowed && styles.followedText]}>
              {isFollowed ? 'Takip Ediliyor' : 'Takip Et'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hakkında */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          <Text style={styles.desc}>
            Bu üniversite hakkında genel bir açıklama verisi daha sonra backend'den alınacaktır.
          </Text>
        </View>

        {/* Bölümler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bölümler</Text>
          {['Bilgisayar Müh.', 'Elektrik-Elektronik', 'Makine Müh.'].map((bolum, i) => (
            <View key={i} style={styles.subCard}>
              <Ionicons name="school-outline" size={18} color="#f75c5b" style={{ marginRight: 8 }} />
              <Text style={styles.item}>{bolum}</Text>
            </View>
          ))}
        </View>

        {/* Etkinlikler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Etkinlikler / Topluluklar</Text>
          {['Kariyer Günleri', 'Robotik Kulübü'].map((etkinlik, i) => (
            <View key={i} style={styles.subCard}>
              <Ionicons name="rocket-outline" size={18} color="#f75c5b" style={{ marginRight: 8 }} />
              <Text style={styles.item}>{etkinlik}</Text>
            </View>
          ))}
        </View>

        {/* Üyeler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mezunlar / Üyeler</Text>
          {['Ayşe K.', 'Mehmet Y.', 'Zeynep T.'].map((uye, i) => (
            <View key={i} style={styles.subCard}>
              <Ionicons name="person-circle-outline" size={18} color="#f75c5b" style={{ marginRight: 8 }} />
              <Text style={styles.item}>{uye}</Text>
            </View>
          ))}
        </View>

        {/* Soru-Cevap */}
        <TouchableOpacity style={styles.askButton}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
          <Text style={styles.askText}>Bu üniversite hakkında soru sor</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default UniversiteDetay;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  uniIsmi: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  sehir: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 14,
  },
  statBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 14,
    color: '#f75c5b',
    fontWeight: 'bold',
  },
  followButton: {
    backgroundColor: '#f75c5b',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  followText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  followed: {
    backgroundColor: '#ccc',
  },
  followedText: {
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f75c5b',
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  subCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  item: {
    fontSize: 14,
    color: '#444',
  },
  askButton: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
  },
  askText: {
    fontWeight: 'bold',
    color: '#f75c5b',
    fontSize: 15,
  },
});
