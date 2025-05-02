// src/screens/KonularScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';

export default function KonularScreen() {
  const [konular, setKonular] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/soru/konu/getir`)
      .then(res => setKonular(res.data))
      .catch(err => {
        console.error('Konular yüklenirken hata:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f75c5b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={konular}
        keyExtractor={(item, index) => {
          // Postgres genelde sütunları küçük harfe çevirir
          const id = item.konuId ?? item.konuid ?? index;
          return id.toString();
        }}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.ad ?? item.baslik ?? '—'}
          </Text>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={() => (
          <Text style={styles.empty}>Hiç konu bulunamadı.</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#fff' },
  loader:    { flex:1, justifyContent:'center', alignItems:'center' },
  item:      { fontSize:16, paddingVertical:12 },
  sep:       { height:1, backgroundColor:'#eee' },
  empty:     { textAlign:'center', marginTop:20, color:'#888' },
});
