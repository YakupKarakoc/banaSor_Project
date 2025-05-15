import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function MyEntriesScreen() {
  const navigation = useNavigation();

  const [data,    setData] = useState([]);
  const [loading, setLoad] = useState(true);

  /* --- fetch once --- */
  useEffect(() => {
    (async () => {
      setLoad(true);
      try {
        const { data } = await axios.get(`${BASE}/api/profil/entrylerim`);
        setData(data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Entry’ler yüklenemedi');
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  /* --- UI helpers --- */
  if (loading) {
    return (
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.flex}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadTxt}>Yükleniyor…</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate('ForumDetail', {
          forumId: item.forumId,
          entryId: item.entryId,      // ileride otomatik kaydırma vb. için
        })
      }
    >
      <View style={styles.row}>
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#f75c5b" style={{ marginRight: 10 }} />
        <Text style={styles.title} numberOfLines={2}>{item.icerik}</Text>
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="book-outline" size={14} color="#ff8a5c" />
        <Text style={styles.meta}>{item.forumBaslik}</Text>

        <Ionicons name="thumbs-up-outline" size={14} color="#ff8a5c" style={{ marginLeft: 10 }} />
        <Text style={styles.meta}>{item.likeSayisi}</Text>

        <Ionicons name="thumbs-down-outline" size={14} color="#ff8a5c" style={{ marginLeft: 8 }} />
        <Text style={styles.meta}>{item.dislikeSayisi}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.flex}>
      <View style={styles.header}>
        <Ionicons name="document-text-outline" size={26} color="#fff" style={{ marginRight: 8 }} />
        <Text style={styles.headerTxt}>Entrylerim</Text>
      </View>

      {data.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="chatbubble-ellipses-outline" size={46} color="#fff" style={{ opacity: 0.7 }} />
          <Text style={styles.emptyTxt}>Henüz yazdığınız entry yok.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
 keyExtractor={(e, idx) => (e.entryId ? `${e.entryId}` : `idx-${idx}`)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  flex:{ flex:1 },
  header:{
    flexDirection:'row',
    alignItems:'center',
    padding:20,
    paddingTop:48,
  },
  headerTxt:{ color:'#fff',fontSize:22,fontWeight:'700' },

  center:{ flex:1,justifyContent:'center',alignItems:'center' },
  loadTxt:{ color:'#fff',marginTop:10,fontSize:15,opacity:0.8 },
  emptyTxt:{ color:'#fff',textAlign:'center',fontSize:16,opacity:0.8,marginTop:10 },

  card:{ backgroundColor:'#fff',borderRadius:16,padding:16,marginVertical:8,
         shadowColor:'#000',shadowOffset:{width:0,height:3},
         shadowOpacity:0.08,shadowRadius:6,elevation:4,
         borderWidth:1,borderColor:'rgba(0,0,0,0.04)' },
  row:{ flexDirection:'row',alignItems:'center',marginBottom:6 },
  title:{ flex:1,fontSize:14,fontWeight:'600',color:'#2D3436' },
  metaRow:{ flexDirection:'row',alignItems:'center',flexWrap:'wrap' },
  meta:{ fontSize:12,color:'#666',marginLeft:4,fontWeight:'500' },
});
