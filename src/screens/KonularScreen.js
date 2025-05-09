import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

export default function KonularScreen({ navigation }) {
  const [konular, setKonular] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadKonular();
    startAnimations();
  }, []);

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

  const loadKonular = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/soru/konu/getir`);
      setKonular(res.data);
    } catch (err) {
      console.error('Konular yüklenirken hata:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderTopicItem = ({ item, index }) => (
    <Animated.View
      style={[
        styles.topicCard,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.95, 1]
            })}
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.topicButton}
        onPress={() => navigation.navigate('Sorular', { konu: item })}
      >
        <View style={styles.topicContent}>
          <View style={styles.topicIconContainer}>
            <Icon name="bookmark-outline" size={24} color="#f75c5b" />
          </View>
          <View style={styles.topicInfo}>
            <Text style={styles.topicTitle}>{item.ad ?? '—'}</Text>
            <Text style={styles.topicSubtitle}>
              {item.soruSayisi ?? 0} soru
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#f75c5b" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#f75c5b', '#ff8a5c']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Konular</Text>
        <Text style={styles.headerSubtitle}>Tüm konuları keşfedin</Text>
      </View>

      <FlatList
        data={konular}
        keyExtractor={(item, index) => {
          const id = item.konuId ?? item.konuid ?? index;
          return id.toString();
        }}
        renderItem={renderTopicItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Icon name="book-outline" size={48} color="#fff" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>Henüz konu bulunmuyor</Text>
          </View>
        )}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  listContainer: {
    padding: 16,
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  topicButton: {
    padding: 16,
  },
  topicContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicInfo: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 2,
  },
  topicSubtitle: {
    fontSize: 13,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    marginBottom: 12,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
});
