import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
// Eğer LikeButton kullanacaksan ekle
// import LikeButton from '../../components/LikeButton';

const BASE = 'http://10.0.2.2:3000';

export default function DepartmentQuestionScreen() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { universite, faculty, department } = useRoute().params;

  // Parametreleri backend uyumlu şekilde ayıkla
  const universiteId = universite.universiteId || universite.universiteid;
  const bolumId = department.bolumid || department.bolumId;
  const bolumAdi = department.bolumadi || department.bolumAdi || "Bölüm";

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fadeAnim]  = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    loadQuestions();
    startAnimations();
  }, [bolumId, isFocused]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      // Bölüme göre soruları getir
      const res = await axios.get(`${BASE}/api/soru/getir/bolum`, {
        params: { bolumId: Number(bolumId) }
      });
      setQuestions(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Sorular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { 
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [index * 5 + 20, 0]
              })
            }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('DepartmentQuestionDetailScreen', {
            soru: item,
            universite,
            faculty,
            department,
          })
        }
      >
        <LinearGradient
          colors={['#fff', '#f8f9fa']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <LinearGradient
                colors={['#f75c5b', '#ff8a5c']}
                style={styles.iconGradient}
              >
                <Icon name="help-circle" size={18} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {item.icerik}
              </Text>
              <View style={styles.cardMetaRow}>
                <View style={styles.metaItem}>
                  <Icon name="person" size={13} color="#f75c5b" />
                  <Text style={styles.metaText}>{item.kullaniciadi}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Icon name="chatbubble-ellipses" size={13} color="#f75c5b" />
                  <Text style={styles.metaText}>{item.cevapsayisi || 0} cevap</Text>
                </View>
              </View>
            </View>
            <Icon name="chevron-forward" size={20} color="#f75c5b" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerTitle}>{bolumAdi} Soruları</Text>
            <Text style={styles.headerSubtitle}>
              {faculty.fakulteadi} • {universite.universiteadi}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() =>
              navigation.navigate('NewDepartmentQuestionScreen', {
                universiteId,
                bolumId,
              })
            }
            activeOpacity={0.8}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#f75c5b" size="large" />
              <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
            </View>
          ) : questions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="help-circle-outline" size={60} color="#f75c5b" style={{ opacity: 0.15 }} />
              <Text style={styles.emptyText}>Bu bölümde henüz soru yok</Text>
              <TouchableOpacity
                style={styles.emptyBtn}
                onPress={() =>
                  navigation.navigate('NewDepartmentQuestionScreen', {
                    universiteId,
                    bolumId,
                  })
                }
              >
                <Icon name="add-circle" size={19} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.emptyBtnText}>Soru Sor</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={questions}
              keyExtractor={item => item.soruid.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f75c5b' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 42,
    backgroundColor: 'transparent',
  },
  headerBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTextBlock: { flex: 1, alignItems: 'center' },
  headerTitle: {
    fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 0.6,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12, color: 'rgba(255,255,255,0.92)', fontWeight: '600', letterSpacing: 0.2, textAlign: 'center',
    marginTop: 3,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginHorizontal: 2,
    paddingTop: 6,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#f75c5b', marginTop: 8, fontWeight: '600' },
  listContainer: { paddingBottom: 32, paddingTop: 4 },
  card: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    marginHorizontal: 12,
    marginVertical: 5,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    elevation: 3,
  },
  cardGradient: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.10)',
    padding: 12,
  },
  cardContent: { },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  iconWrap: { marginRight: 10 },
  iconGradient: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#2D3436', marginBottom: 7 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  metaText: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 44 },
  emptyText: { color: '#2D3436', fontSize: 18, fontWeight: '600', marginTop: 22, marginBottom: 14, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    backgroundColor: '#f75c5b',
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#f75c5b',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
