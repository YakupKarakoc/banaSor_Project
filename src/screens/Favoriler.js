import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

const BASE = 'http://10.0.2.2:3000/api';

export default function Favoriler() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    axios.get(`${BASE}/takip/takipEdilenler`)
      .then(r=>setList(r.data.takipEdilenler))
      .catch(e=>{ console.error(e); Alert.alert('Hata','Çekilemedi'); })
      .finally(()=>setLoading(false));
  },[]);

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color="#f75c5b"/></View>;

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <Text style={styles.title}>Takip Ettiklerim</Text>
      <FlatList
        data={list}
        keyExtractor={(i,idx)=>idx.toString()}
        renderItem={({item})=><Text style={styles.item}>{item.ad}</Text>}
        ListEmptyComponent={<Text style={styles.empty}>Takip edilen üniversite yok.</Text>}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:20 },
  loader:{ flex:1, justifyContent:'center', alignItems:'center' },
  title:{ fontSize:22, fontWeight:'bold', color:'#fff', marginBottom:16, textAlign:'center' },
  item:{ fontSize:18, color:'#333', backgroundColor:'#fff', padding:12, borderRadius:8, marginBottom:10 },
  empty:{ textAlign:'center', color:'#fff', marginTop:20 },
});