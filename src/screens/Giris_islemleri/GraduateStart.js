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
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff"/>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FF8C00','#FF3D00']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>Mezun Kayıt Tamamlama</Text>
        <Text style={styles.info}>
          {email} ve referans e-postalarınıza kod gönderilecektir.
        </Text>

        <Text style={styles.label}>Üniversite</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={selUni} onValueChange={setSelUni}>
            <Picker.Item label="Seçin..." value=""/>
            {unis.map(u=>
              <Picker.Item key={u.universiteid} label={u.universiteadi} value={u.universiteid}/>
            )}
          </Picker>
        </View>

        <Text style={styles.label}>Bölüm</Text>
        <View style={styles.pickerBox}>
          <Picker selectedValue={selDept} onValueChange={setSelDept}>
            <Picker.Item label="Seçin..." value=""/>
            {depts.map(d=>
              <Picker.Item key={d.bolumid} label={d.bolumadi} value={d.bolumid}/>
            )}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Referans E-posta 1"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={ref1}
          onChangeText={setRef1}
        />
        <TextInput
          style={styles.input}
          placeholder="Referans E-posta 2"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={ref2}
          onChangeText={setRef2}
        />

        <TouchableOpacity style={styles.button} onPress={sendCodes}>
          <Text style={styles.btnText}>Kayıt & Kodları Gönder</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1 },
  loader:{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'#FF3D00' },
  inner:{ padding:20 },
  title:{ fontSize:22, fontWeight:'bold', color:'#fff', textAlign:'center', marginBottom:8 },
  info:{ fontSize:14, color:'#fff', textAlign:'center', marginBottom:20 },
  label:{ color:'#fff', marginBottom:6 },
  pickerBox:{ backgroundColor:'#fff', borderRadius:8, marginBottom:12, overflow:'hidden' },
  input:{ backgroundColor:'#fff', borderRadius:8, paddingHorizontal:12, height:48, marginBottom:12, color:'#333' },
  button:{ backgroundColor:'#fff', borderRadius:25, paddingVertical:14, alignItems:'center', marginTop:10 },
  btnText:{ color:'#FF3D00', fontWeight:'600', fontSize:16 },
});
