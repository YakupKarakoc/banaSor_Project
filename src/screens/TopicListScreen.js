import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

export default function TopicListScreen({ navigation }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/soru/konu/getir`);
        setTopics(res.data);
      } catch (err) {
        console.error('Konular yüklenirken hata:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={(item, index) => {
          // Postgres sütun isimlendirmesine göre hem lowercase hem camelCase kontrolü
          const id = item.konuId ?? item.konuid ?? index;
          return id.toString();
        }}
        renderItem={({ item }) => {
          const konuId = item.konuId ?? item.konuid;
          return (
            <TouchableOpacity
              style={styles.item}
              onPress={() =>
                navigation.navigate('QuestionList', {
                  konuId,
                  konuAd: item.ad,
                })
              }
            >
              <Text style={styles.text}>{item.ad}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>Hiç konu bulunamadı.</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  text: { fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 20, color: '#888' },
});
