// src/screens/NewForumScreen.js
import React, { useState } from 'react';
import {
  View, TextInput, TouchableOpacity,
  Text, Alert, StyleSheet, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';

const BASE = 'http://10.0.2.2:3000';

export default function NewForumScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params;
  const navigation = useNavigation();

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

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
    return <ActivityIndicator style={{flex:1}} size="large" color="#f75c5b"/>;
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Forum Başlığı"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />
      <TouchableOpacity style={styles.btn} onPress={handleCreate}>
        <Text style={styles.btnText}>Oluştur</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, padding:16, justifyContent:'center' },
  input:      { backgroundColor:'#fff', borderRadius:8, padding:12, fontSize:16, marginBottom:12 },
  btn:        { backgroundColor:'#fff', paddingVertical:14, borderRadius:25, alignItems:'center' },
  btnText:    { color:'#f75c5b', fontWeight:'600', fontSize:16 },
});
