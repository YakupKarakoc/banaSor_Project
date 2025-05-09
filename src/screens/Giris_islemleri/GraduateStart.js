// src/screens/GraduateStart.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert,
  TouchableOpacity, TextInput, ScrollView, ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

const BASE_URL = 'http://10.0.2.2:3000';

export default function GraduateStart({ route, navigation }) {
  const { email, username } = route.params;
  const [unis, setUnis] = useState([]);
  const [depts, setDepts] = useState([]);
  const [selUni, setSelUni] = useState('');
  const [selDept, setSelDept] = useState('');
  const [ref1, setRef1] = useState('');
  const [ref2, setRef2] = useState('');
  const [loading, setLoading] = useState(false);

  // üniversiteleri yükle
  useEffect(() => {
    axios.get(`${BASE_URL}/api/education/university`)
      .then(r => setUnis(r.data))
      .catch(() => Alert.alert('Hata','Üniversiteler yüklenemedi'));
  }, []);

  // bölümleri yükle
  useEffect(() => {
    if (!selUni) {
      setDepts([]); setSelDept('');
      return;
    }
    axios.get(`${BASE_URL}/api/education/department`, { params:{ universiteId: selUni }})
      .then(r => setDepts(r.data))
      .catch(() => Alert.alert('Hata','Bölümler yüklenemedi'));
  }, [selUni]);

  const sendCodes = async () => {
    if (!selUni || !selDept || !ref1 || !ref2) {
      return Alert.alert('Hata','Tüm alanları eksiksiz doldurun.');
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/mezun/dogrulama-baslat`, {
        email,
        universiteId: selUni,
        bolumId: selDept,
        dogrulamaMail1: ref1,
        dogrulamaMail2: ref2,
      });
      Alert.alert('Başarılı','Doğrulama kodları gönderildi.\nKayıt tamamlandı.', [
        { text:'Tamam', onPress: () => navigation.replace('Login') }
      ]);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || 'Kod gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderModern}>
        <ActivityIndicator size="large" color="#fff"/>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.containerModern}>
      <ScrollView contentContainerStyle={styles.innerModern}>
        <Text style={styles.titleModern}>Mezun Kayıt Tamamlama</Text>
        <Text style={styles.infoModern}>
          {email} ve referans e-postalarınıza kod gönderilecektir.
        </Text>

        <Text style={styles.labelModern}>Üniversite</Text>
        <View style={styles.pickerBoxModern}>
          <Picker selectedValue={selUni} onValueChange={setSelUni}>
            <Picker.Item label="Seçin..." value=""/>
            {unis.map(u=>
              <Picker.Item key={u.universiteid} label={u.universiteadi} value={u.universiteid}/>
            )}
          </Picker>
        </View>

        <Text style={styles.labelModern}>Bölüm</Text>
        <View style={styles.pickerBoxModern}>
          <Picker selectedValue={selDept} onValueChange={setSelDept}>
            <Picker.Item label="Seçin..." value=""/>
            {depts.map(d=>
              <Picker.Item key={d.bolumid} label={d.bolumadi} value={d.bolumid}/>
            )}
          </Picker>
        </View>

        <TextInput
          style={styles.inputModern}
          placeholder="Referans E-posta 1"
          placeholderTextColor="#f75c5b"
          keyboardType="email-address"
          value={ref1}
          onChangeText={setRef1}
        />
        <TextInput
          style={styles.inputModern}
          placeholder="Referans E-posta 2"
          placeholderTextColor="#f75c5b"
          keyboardType="email-address"
          value={ref2}
          onChangeText={setRef2}
        />

        <TouchableOpacity style={styles.buttonModern} onPress={sendCodes}>
          <Text style={styles.btnTextModern}>Kayıt & Kodları Gönder</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  containerModern: { flex:1 },
  loaderModern: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#f75c5b' },
  innerModern: { padding:24 },
  titleModern: { fontSize:24, fontWeight:'900', color:'#fff', textAlign:'center', marginBottom:10, textShadowColor:'rgba(0,0,0,0.18)', textShadowOffset:{width:0,height:2}, textShadowRadius:8, letterSpacing:0.5 },
  infoModern: { fontSize:15, color:'#fff', textAlign:'center', marginBottom:22, opacity:0.92 },
  labelModern: { color:'#fff', marginBottom:7, fontWeight:'700', fontSize:15, letterSpacing:0.1 },
  pickerBoxModern: { backgroundColor:'#fff', borderRadius:16, marginBottom:18, overflow:'hidden', shadowColor:'#f75c5b', shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:8, elevation:3 },
  inputModern: { backgroundColor:'#fff', borderRadius:16, paddingHorizontal:14, height:48, marginBottom:16, color:'#2D3436', fontSize:16, shadowColor:'#f75c5b', shadowOffset:{width:0,height:2}, shadowOpacity:0.10, shadowRadius:8, elevation:2 },
  buttonModern: { backgroundColor:'#fff', borderRadius:25, paddingVertical:15, alignItems:'center', marginTop:16, shadowColor:'#f75c5b', shadowOffset:{width:0,height:4}, shadowOpacity:0.13, shadowRadius:8, elevation:4 },
  btnTextModern: { color:'#f75c5b', fontWeight:'800', fontSize:17, letterSpacing:0.2 },
});
