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
    <View style={styles.loaderModern}><ActivityIndicator size="large" color="#fff"/></View>
  );

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.containerModern}>
      <Text style={styles.titleModern}>Kodla Doğrulama</Text>
      <TextInput
        style={styles.inputModern}
        placeholder="Kod 1"
        placeholderTextColor="#f75c5b"
        keyboardType="number-pad"
        value={kod1}
        onChangeText={setKod1}
      />
      <TextInput
        style={styles.inputModern}
        placeholder="Kod 2"
        placeholderTextColor="#f75c5b"
        keyboardType="number-pad"
        value={kod2}
        onChangeText={setKod2}
      />
      <TouchableOpacity style={styles.buttonModern} onPress={verifyCodes}>
        <Text style={styles.btnTextModern}>Doğrula & Kaydı Tamamla</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  containerModern: { flex:1,justifyContent:'center',padding:24 },
  loaderModern: { flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#f75c5b' },
  titleModern: { fontSize:24,fontWeight:'900',color:'#fff',textAlign:'center',marginBottom:22,textShadowColor:'rgba(0,0,0,0.18)',textShadowOffset:{width:0,height:2},textShadowRadius:8,letterSpacing:0.5 },
  inputModern: { backgroundColor:'#fff',borderRadius:16,padding:14,marginBottom:16,fontSize:17,shadowColor:'#f75c5b',shadowOffset:{width:0,height:2},shadowOpacity:0.10,shadowRadius:8,elevation:2 },
  buttonModern: { backgroundColor:'#fff',borderRadius:25,padding:15,alignItems:'center',shadowColor:'#f75c5b',shadowOffset:{width:0,height:4},shadowOpacity:0.13,shadowRadius:8,elevation:4 },
  btnTextModern: { color:'#f75c5b',fontWeight:'800',fontSize:16,letterSpacing:0.2 },
});
