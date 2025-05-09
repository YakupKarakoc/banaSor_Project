// src/screens/GraduateVerify.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, StyleSheet
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

const BASE_URL = 'http://10.0.2.2:3000';

export default function GraduateVerify({ route, navigation }) {
  const { username } = route.params;
  const [kod1, setKod1] = useState('');
  const [kod2, setKod2] = useState('');
  const [loading, setLoading] = useState(false);

  const verifyCodes = async () => {
    if (!kod1 || !kod2)
      return Alert.alert('Hata','Her iki kodu da girin');
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/mezun/kod-dogrula`, {
        kullaniciAdi: username,
        kod1,
        kod2
      });
      Alert.alert('Başarılı','Hesabınız onaylandı.',[
        { text:'Tamam', onPress:()=>navigation.replace('Login') }
      ]);
    } catch(e) {
      Alert.alert('Hata', e.response?.data?.error||'Kod doğrulama başarısız');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <View style={styles.loader}><ActivityIndicator size="large" color="#fff"/></View>
  );

  return (
    <LinearGradient colors={['#FF8C00','#FF3D00']} style={styles.container}>
      <Text style={styles.title}>Kodla Doğrulama</Text>
      <TextInput
        style={styles.input}
        placeholder="Kod 1"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        value={kod1}
        onChangeText={setKod1}
      />
      <TextInput
        style={styles.input}
        placeholder="Kod 2"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        value={kod2}
        onChangeText={setKod2}
      />
      <TouchableOpacity style={styles.button} onPress={verifyCodes}>
        <Text style={styles.btnText}>Doğrula & Kaydı Tamamla</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1,justifyContent:'center',padding:20 },
  loader:{ flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#FF3D00' },
  title:{ fontSize:22,fontWeight:'bold',color:'#fff',textAlign:'center',marginBottom:20 },
  input:{ backgroundColor:'#fff',borderRadius:8,padding:12,marginBottom:12 },
  button:{ backgroundColor:'#fff',borderRadius:25,padding:14,alignItems:'center' },
  btnText:{ color:'#FF3D00',fontWeight:'600' }
});
