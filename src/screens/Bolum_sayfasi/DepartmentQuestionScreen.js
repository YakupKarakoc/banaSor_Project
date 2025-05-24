// src/screens/Bolum_sayfasi/DepartmentQuestionScreen.js

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
} from 'react-native';
import { useRoute, useNavigation, useIsFocused } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import LikeButton from '../../components/LikeButton';
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';

export default function DepartmentQuestionScreen() {
  const { universite, faculty, department } = useRoute().params;
  const bolumId = department.bolumid;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    if (isFocused) loadQuestions();
    startAnimations();
  }, [isFocused]);

  const startAnimations = () => {
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
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE}/api/soru/getir/bolum`, {
        params: { bolumId: Number(bolumId) }
      });

      const enriched = await Promise.all(
        data.map(async (q) => {
          try {
            const res = await axios.get(`${BASE}/api/soru/begeni/${q.soruid}`);
            return {
              ...q,
              kullaniciBegendiMi: res.data?.begendiMi ?? false,
            };
          } catch {
            return { ...q, kullaniciBegendiMi: false };
          }
        })
      );

      setQuestions(enriched);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Sorular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (item) => (
    <Animated.View
      key={item.soruid}
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
        style={styles.cardBtn}
        onPress={() => navigation.navigate('DepartmentQuestionDetailScreen', {
          soru: item,
          universite,
          faculty,
          department
        })}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <Icon name="help-circle-outline" size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>{item.icerik}</Text>
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Icon name="person-outline" size={14} color="#f75c5b" />
            <Text style={styles.metaText}>{item.kullaniciadi}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="chatbubble-ellipses-outline" size={14} color="#f75c5b" />
            <Text style={styles.metaText}>{item.cevapsayisi} cevap</Text>
          </View>
          <LikeButton
            soruId={item.soruid}
            likedInit={item.kullaniciBegendiMi}
            countInit={item.begenisayisi}
            dark
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Icon name="help-circle-outline" size={36} color="#fff" style={styles.headerIcon} />
          <Text style={styles.title}>Bölüm Soruları</Text>
          <Text style={styles.subTitle}>{department.bolumadi}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NewDepartmentQuestionScreen', { bolumId })}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#fff" size="large" />
          <Text style={styles.loadingText}>Sorular yükleniyor...</Text>
        </View>
      ) : questions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="help-circle-outline" size={48} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
          <Text style={styles.emptyText}>Henüz soru yok</Text>
          <Text style={styles.emptySubText}>Bu bölümde ilk soruyu sorarak başla!</Text>
        </View>
      ) : (
        <FlatList
          data={questions}
          keyExtractor={q => q.soruid.toString()}
          renderItem={({ item }) => renderQuestion(item)}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 48,
  },
  backBtn: {
    padding: 8,
  },
  headerInfo: {
    flexDirection: 'column',
    flex: 1,
  },
  headerIcon: {
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    flexShrink: 1,
  },
  subTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '400',
  },
  addBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardBtn: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3436',
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
});
