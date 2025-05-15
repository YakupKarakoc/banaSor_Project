// src/screens/FacultyForumScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function FacultyForumScreen() {
  const { universiteId, fakulteId } = useRoute().params;
  const navigation  = useNavigation();
  const isFocused   = useIsFocused();

  const [forums,     setForums]    = useState([]);
  const [questions,  setQuestions] = useState([]);
  const [loadingF,   setLoadingF]  = useState(true);
  const [loadingQ,   setLoadingQ]  = useState(true);
  const [fadeAnim]   = useState(new Animated.Value(0));
  const [slideAnim]  = useState(new Animated.Value(40));

  /* ----------  FORUMLAR  ---------- */
  useEffect(() => {
    let mounted = true;
    const loadForums = async () => {
      setLoadingF(true);
      try {
        const { data } = await axios.get(`${BASE}/api/forum/getir/fakulte`, {
          params: { fakulteId },
        });
        if (mounted) setForums(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Forumlar yüklenemedi.');
      } finally {
        if (mounted) setLoadingF(false);
      }
    };
    loadForums();
    return () => (mounted = false);
  }, [fakulteId, isFocused]);

  /* ----------  SORULAR  ---------- */
  useEffect(() => {
    let mounted = true;
    const loadQuestions = async () => {
      setLoadingQ(true);
      try {
        const { data } = await axios.get(`${BASE}/api/soru/getir/fakulte`, {
          params: { fakulteId },
        });
        if (mounted) setQuestions(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Sorular yüklenemedi.');
      } finally {
        if (mounted) setLoadingQ(false);
      }
    };
    loadQuestions();

    /* animasyon */
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();

    return () => (mounted = false);
  }, [fakulteId, isFocused]);

  /* ----------  LOADING  ---------- */
  if (loadingF || loadingQ) {
    return (
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Yükleniyor…</Text>
        </View>
      </LinearGradient>
    );
  }

  /* ----------  RENDERLERS  ---------- */
  const renderForum = ({ item }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.97, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumid })}
      >
        <View style={styles.cardHeader}>
          <Icon name="chatbubbles-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.baslik}
          </Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Icon name="person-outline" size={14} color="#ff8a5c" />
          <Text style={styles.cardMeta}>{item.olusturankullaniciadi || item.olusturanKullaniciAdi}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderQuestion = ({ item }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            {
              scale: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.97, 1],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('QuestionDetail', { soruId: item.soruid })}
      >
        <View style={styles.cardHeader}>
          <Icon name="help-circle-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>
            Q: {item.icerik}
          </Text>
        </View>
        <View style={styles.cardMetaRow}>
          <Icon name="person-outline" size={14} color="#ff8a5c" />
          <Text style={styles.cardMeta}>{item.kullaniciadi}</Text>
          <Icon
            name="chatbubble-ellipses-outline"
            size={14}
            color="#ff8a5c"
            style={{ marginLeft: 10 }}
          />
          <Text style={styles.cardMeta}>{item.cevapsayisi} cevap</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  /* ----------  UI  ---------- */
  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 30 }}
      >
        {/* --------- Forum Başlıkları ---------- */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Icon name="chatbubbles-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Forum Başlıkları</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
          >
            <Icon name="add-circle-outline" size={18} color="#f75c5b" style={{ marginRight: 4 }} />
            <Text style={styles.newBtnText}>Yeni Forum</Text>
          </TouchableOpacity>
        </View>

        {forums.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="chatbubbles-outline"
              size={36}
              color="#fff"
              style={{ opacity: 0.7, marginBottom: 8 }}
            />
            <Text style={styles.emptyText}>Henüz forum yok.</Text>
          </View>
        ) : (
          <FlatList
            data={forums}
            keyExtractor={(f) => f.forumid.toString()}
            renderItem={renderForum}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
          />
        )}

        {/* --------- Sorular ---------- */}
        <View style={[styles.headerRow, { marginTop: 28 }]}>
          <View style={styles.headerLeft}>
            <Icon name="help-circle-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Sorular</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('NewQuestion', { universiteId, fakulteId })}
          >
            <Icon name="add-circle-outline" size={18} color="#f75c5b" style={{ marginRight: 4 }} />
            <Text style={styles.newBtnText}>Yeni Soru</Text>
          </TouchableOpacity>
        </View>

        {questions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon
              name="help-circle-outline"
              size={36}
              color="#fff"
              style={{ opacity: 0.7, marginBottom: 8 }}
            />
            <Text style={styles.emptyText}>Henüz soru yok.</Text>
          </View>
        ) : (
          <FlatList
            data={questions}
            keyExtractor={(q) => q.soruid.toString()}
            renderItem={renderQuestion}
            scrollEnabled={false}
            contentContainerStyle={styles.list}
          />
        )}
      </ScrollView>
    </LinearGradient>
  );
}

/* ------------------- STYLES ------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', fontSize: 16, marginTop: 12, opacity: 0.8 },
  /* headers */
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.3 },
  /* buttons */
  newBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, elevation: 2 },
  newBtnText: { color: '#f75c5b', fontWeight: '700', fontSize: 14 },
  /* empties */
  emptyContainer: { alignItems: 'center', marginVertical: 12 },
  emptyText: { color: '#fff', fontSize: 14, opacity: 0.8 },
  /* lists */
  list: { paddingBottom: 10 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginVertical: 8, elevation: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  cardContent: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { marginRight: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#2D3436', flex: 1 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center' },
  cardMeta: { fontSize: 12, color: '#666', marginLeft: 4, fontWeight: '500' },
});
