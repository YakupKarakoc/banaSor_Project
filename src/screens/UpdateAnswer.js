// src/screens/UpdateAnswer.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ion from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function UpdateAnswer() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cevapId, mevcutIcerik } = route.params;

  const [icerik, setIcerik] = useState(mevcutIcerik || '');
  const [busy, setBusy]     = useState(false);

  // submit güncelleme
  const handleUpdate = async () => {
    if (!icerik.trim()) {
      return Alert.alert('Hata', 'İçeriği boş bırakamazsınız.');
    }
    setBusy(true);
    try {
      const token = await getToken();
      await axios.patch(
        `${BASE}/api/soru/cevapGuncelle/${cevapId}`,
        { icerik: icerik.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Başarılı', 'Cevap güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', err.response?.data?.error || 'Güncelleme başarısız oldu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        <View style={styles.header}>
          <Ion name="create-outline" size={28} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.headerTxt}>Cevabı Güncelle</Text>
        </View>

        <View style={styles.body}>
          <Text style={styles.label}>Yeni İçerik:</Text>
          <TextInput
            style={styles.input}
            value={icerik}
            onChangeText={setIcerik}
            multiline
            placeholder="Cevabınızı düzenleyin…"
            placeholderTextColor="#aaa"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleUpdate}
            disabled={busy}
            activeOpacity={0.8}
          >
            {busy
              ? <ActivityIndicator color="#f75c5b" />
              : <Text style={styles.buttonTxt}>Güncelle</Text>
            }
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1 },
  header:       { flexDirection:'row', alignItems:'center', padding:20, paddingTop:48 },
  headerTxt:    { fontSize:22, fontWeight:'700', color:'#fff' },
  body:         { flex:1, padding:20 },
  label:        { color:'#fff', fontSize:16, marginBottom:8 },
  input:        {
    flex:1,
    backgroundColor:'#fff',
    borderRadius:12,
    padding:16,
    textAlignVertical:'top',
    fontSize:15,
    color:'#333'
  },
  button:       {
    marginTop:16,
    backgroundColor:'#fff',
    paddingVertical:14,
    borderRadius:12,
    alignItems:'center',
    shadowColor:'#000',
    shadowOffset:{ width:0, height:2 },
    shadowOpacity:0.1,
    shadowRadius:4,
    elevation:3,
  },
  buttonTxt:    { color:'#f75c5b', fontSize:16, fontWeight:'700' },
});
