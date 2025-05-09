// src/screens/NewForumScreen.js
import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  Text, Alert, StyleSheet, ActivityIndicator, Animated
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE = 'http://10.0.2.2:3000';

export default function NewForumScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params;
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  React.useEffect(() => {
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
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return Alert.alert('Hata','Lütfen başlık girin');
    setLoading(true);
    try {
      await axios.post(`${BASE}/api/forum/forumEkle`, {
        baslik:        title,
        universiteId,
        fakulteId,
        bolumId
      });
      Alert.alert('Başarılı','Forum oluşturuldu.',[
        { text:'Tamam', onPress:()=>navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Hata', e.response?.data||'Forum oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Oluşturuluyor...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
          ],
        }}
      >
        <View style={styles.iconRow}>
          <Icon name="chatbubbles-outline" size={40} color="#fff" style={styles.icon} />
        </View>
        <Text style={styles.title}>Yeni Forum Başlığı</Text>
        <TextInput
          style={styles.input}
          placeholder="Forum Başlığı"
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
          maxLength={60}
        />
        <TouchableOpacity style={styles.btn} onPress={handleCreate} activeOpacity={0.85}>
          <Icon name="add-circle-outline" size={22} color="#f75c5b" style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Oluştur</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, padding:24, justifyContent:'center' },
  loader:     { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText:{ color:'#fff', fontSize:16, marginTop:12, opacity:0.8 },
  iconRow:    { alignItems:'center', marginBottom:16 },
  icon:       { opacity:0.9 },
  title:      { color:'#fff', fontSize:22, fontWeight:'700', textAlign:'center', marginBottom:18, letterSpacing:0.5 },
  input:      { backgroundColor:'#fff', borderRadius:16, padding:16, fontSize:16, marginBottom:18, color:'#2D3436', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  btn:        { flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#fff', paddingVertical:14, borderRadius:25, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  btnText:    { color:'#f75c5b', fontWeight:'700', fontSize:16 },
});
