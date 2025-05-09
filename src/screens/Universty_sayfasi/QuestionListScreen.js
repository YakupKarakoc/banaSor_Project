// src/screens/QuestionListScreen.js

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
  Dimensions,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function QuestionListScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params || {};
  const navigation = useNavigation();
  const isFocused  = useIsFocused();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      try {
        let endpoint = '/api/soru/getir';
        const params = {};

        if (fakulteId) {
          endpoint = '/api/soru/getir/fakulte';
          params.fakulteId = fakulteId;
        } else if (bolumId) {
          endpoint = '/api/soru/getir/bolum';
          params.bolumId = bolumId;
        } else if (universiteId) {
          endpoint = '/api/soru/getir/universite';
          params.universiteId = universiteId;
        }

        const res = await axios.get(`${BASE}${endpoint}`, { params });
        setQuestions(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Sorular yüklenemedi');
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
    startAnimations();
  }, [universiteId, fakulteId, bolumId, isFocused]);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.97, 1]
            })}
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('QuestionDetail', { soruId: item.soruid })}
      >
        <View style={styles.cardHeader}>
          <Icon name="help-circle-outline" size={22} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>Q: {item.icerik}</Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Icon name="person-outline" size={16} color="#ff8a5c" />
          <Text style={styles.cardMeta}>{item.kullaniciadi}</Text>
          <Icon name="chatbubble-ellipses-outline" size={16} color="#ff8a5c" style={{ marginLeft: 12 }} />
          <Text style={styles.cardMeta}>{item.cevapsayisi} cevap</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Icon name="help-circle-outline" size={28} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.title}>Sorular</Text>
        </View>
        <TouchableOpacity
          style={styles.newBtn}
          onPress={() =>
            navigation.navigate('NewQuestion', { universiteId, fakulteId, bolumId })
          }
        >
          <Icon name="add-circle-outline" size={20} color="#f75c5b" style={{ marginRight: 4 }} />
          <Text style={styles.newBtnText}>Yeni Soru</Text>
        </TouchableOpacity>
      </View>

      {questions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="help-circle-outline" size={48} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
          <Text style={styles.emptyText}>Henüz soru yok.</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={item => item.soruid.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  loader:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 12, opacity: 0.8 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 48 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center' },
  title:       { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 0.5 },
  newBtn:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  newBtnText:  { color: '#f75c5b', fontWeight: '700', fontSize: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyText:   { color: '#fff', fontSize: 16, textAlign: 'center', opacity: 0.8 },
  list:        { paddingHorizontal: 16, paddingBottom: 30 },
  card:        { backgroundColor: '#fff', borderRadius: 18, marginVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  cardContent: { padding: 18 },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardIcon:    { marginRight: 10 },
  cardTitle:   { fontSize: 16, fontWeight: '700', color: '#2D3436', flex: 1 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardMeta:    { fontSize: 13, color: '#666', marginLeft: 4, fontWeight: '500' },
});
