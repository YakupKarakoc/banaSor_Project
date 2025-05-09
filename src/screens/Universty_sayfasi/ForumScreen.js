// src/screens/ForumScreen.js

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

export default function ForumScreen() {
  const { universiteId, fakulteId } = useRoute().params;
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [forums, setForums]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = { universiteId };
        if (fakulteId) params.fakulteId = fakulteId;
        const res = await axios.get(`${BASE}/api/forum/getir`, { params });
        setForums(res.data);
      } catch (err) {
        console.error(err);
        Alert.alert('Hata', 'Forumlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    }
    load();
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
  }, [universiteId, fakulteId, isFocused]);

  if (loading) {
    return (
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Forumlar yükleniyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardContent}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumid })}
      >
        <View style={styles.cardHeader}>
          <Icon name="chatbubbles-outline" size={22} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle} numberOfLines={2}>{item.baslik}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Icon name="chatbubbles-outline" size={28} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.title}>Forum Başlıkları</Text>
        </View>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate('NewForum', { universiteId, fakulteId })}
          activeOpacity={0.85}
        >
          <Icon name="add-circle-outline" size={20} color="#f75c5b" style={{ marginRight: 4 }} />
          <Text style={styles.btnText}>Yeni Forum</Text>
        </TouchableOpacity>
      </View>

      {forums.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chatbubbles-outline" size={48} color="#fff" style={{ opacity: 0.7, marginBottom: 8 }} />
          <Text style={styles.emptyText}>Henüz forum başlığı yok.</Text>
        </View>
      ) : (
        <FlatList
          data={forums}
          keyExtractor={item => String(item.forumid)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, padding:0 },
  loader:       { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText:  { color:'#fff', fontSize:16, marginTop:12, opacity:0.8 },
  headerRow:    { flexDirection:'row', justifyContent:'space-between', alignItems:'center', padding:20, paddingTop:48, marginBottom:8 },
  headerLeft:   { flexDirection:'row', alignItems:'center' },
  title:        { color:'#fff', fontSize:22, fontWeight:'bold', letterSpacing:0.5 },
  btn:          { flexDirection:'row', alignItems:'center', backgroundColor:'#fff', paddingHorizontal:16, paddingVertical:8, borderRadius:20, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  btnText:      { color:'#f75c5b', fontWeight:'700', fontSize:15 },
  emptyContainer:{ flex:1, justifyContent:'center', alignItems:'center', marginTop:40 },
  emptyText:    { color:'#fff', textAlign:'center', fontSize:16, opacity:0.8 },
  list:         { paddingHorizontal:16, paddingBottom:30 },
  card:         { backgroundColor:'#fff', borderRadius:18, marginVertical:8, shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:8, elevation:5, borderWidth:1, borderColor:'rgba(0,0,0,0.04)' },
  cardContent:  { padding:18 },
  cardHeader:   { flexDirection:'row', alignItems:'center' },
  cardIcon:     { marginRight:10 },
  cardTitle:    { fontSize:16, fontWeight:'700', color:'#2D3436', flex:1 },
});
