import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function UpdateForumScreen() {
  const { forumId, baslik: initialBaslik } = useRoute().params;
  const navigation = useNavigation();

  const [baslik, setBaslik]   = useState(initialBaslik || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!baslik.trim()) {
      return Alert.alert('Hata', 'Başlık boş olamaz.');
    }
    setLoading(true);
    try {
      const token = await getToken();
      await axios.patch(
        `${BASE}/api/forum/forumGuncelle`,
        { forumId, yeniBaslik: baslik.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Başarılı', 'Forum başlığı güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', err.response?.data?.message || 'Güncelleme başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTxt}>Forum Güncelle</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Yeni Başlık</Text>
          <TextInput
            style={styles.input}
            value={baslik}
            onChangeText={setBaslik}
            placeholder="Forum başlığını güncelle…"
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdate}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#f75c5b" />
              : <Text style={styles.btnTxt}>Güncelle</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1 },
  wrapper:   { flex:1, padding:20, paddingTop:48 },
  header:    { flexDirection:'row', alignItems:'center', marginBottom:24 },
  headerTxt: { color:'#fff', fontSize:20, fontWeight:'700', marginLeft:12 },

  card:      {
    backgroundColor:'#fff',
    borderRadius:16,
    padding:20,
    flex:1,
    justifyContent:'center',
    shadowColor:'#000',
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.08,
    shadowRadius:8,
    elevation:4
  },
  label:     { fontSize:16, fontWeight:'600', color:'#333', marginBottom:8 },
  input:     {
    borderWidth:1,
    borderColor:'#ddd',
    borderRadius:8,
    paddingHorizontal:12,
    paddingVertical:10,
    fontSize:15,
    color:'#333',
    marginBottom:20
  },

  button:    {
    backgroundColor:'#f75c5b',
    paddingVertical:14,
    borderRadius:25,
    alignItems:'center'
  },
  btnTxt:    { color:'#fff', fontSize:16, fontWeight:'700' },
});
