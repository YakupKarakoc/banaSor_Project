// src/screens/GraduateComplete.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Alert,
  TouchableOpacity, ActivityIndicator,
  TextInput, ScrollView
} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import LinearGradient from 'react-native-linear-gradient';

const BASE_URL = 'http://10.0.2.2:3000';

export default function GraduateComplete({ route, navigation }) {
  const { email } = route.params;
  const [unis, setUnis] = useState([]);
  const [depts, setDepts] = useState([]);
  const [selUni, setSelUni] = useState('');
  const [selDept, setSelDept] = useState('');
  const [ref1, setRef1] = useState('');
  const [ref2, setRef2] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    axios.get(`${BASE_URL}/api/education/university`)
      .then(r => setUnis(r.data))
      .catch(() => Alert.alert('Hata','Üniversiteler yüklenemedi'));
  }, []);

  useEffect(() => {
    if (!selUni) return setDepts([]), setSelDept('');
    axios.get(`${BASE_URL}/api/education/department`, { params:{ universiteId: selUni }})
      .then(r => setDepts(r.data))
      .catch(() => Alert.alert('Hata','Bölümler yüklenemedi'));
  }, [selUni]);

  // Email validation function
  const validateEduEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.toLowerCase().endsWith('.edu.tr');
  };

  // Reference email change handlers
  const handleRef1Change = (text) => {
    setRef1(text.toLowerCase().trim());
    if (text && !validateEduEmail(text)) {
      setErrors(prev => ({ ...prev, ref1: 'Referans e-posta .edu.tr uzantılı olmalı' }));
    } else {
      setErrors(prev => ({ ...prev, ref1: null }));
    }
  };

  const handleRef2Change = (text) => {
    setRef2(text.toLowerCase().trim());
    if (text && !validateEduEmail(text)) {
      setErrors(prev => ({ ...prev, ref2: 'Referans e-posta .edu.tr uzantılı olmalı' }));
    } else {
      setErrors(prev => ({ ...prev, ref2: null }));
    }
  };

  const submit = async () => {
    if (!selUni || !selDept || !ref1 || !ref2) {
      return Alert.alert('Hata','Tüm alanları doldurun.');
    }
    
    // Referans email validasyonu
    if (!validateEduEmail(ref1)) {
      return Alert.alert('Hata', 'İlk referans e-posta adresi .edu.tr uzantılı olmalı');
    }
    
    if (!validateEduEmail(ref2)) {
      return Alert.alert('Hata', 'İkinci referans e-posta adresi .edu.tr uzantılı olmalı');
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
      Alert.alert('Başarılı','Mezun kaydınız tamamlandı.', [
        { text:'Tamam', onPress:()=>navigation.replace('Login') }
      ]);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || 'İşlem başarısız.');
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
        <Text style={styles.titleModern}>Mezun Kayıt</Text>
        <Text style={styles.infoModern}>{email} ile devam ediliyor.</Text>

        <Text style={styles.labelModern}>Üniversite</Text>
        <View style={styles.pickerBoxModern}>
          <Picker selectedValue={selUni} onValueChange={setSelUni}>
            <Picker.Item label="Seçin..." value=""/>
            {unis.map(u =>
              <Picker.Item key={u.universiteid} label={u.universiteadi} value={u.universiteid}/>
            )}
          </Picker>
        </View>

        <Text style={styles.labelModern}>Bölüm</Text>
        <View style={styles.pickerBoxModern}>
          <Picker selectedValue={selDept} onValueChange={setSelDept}>
            <Picker.Item label="Seçin..." value=""/>
            {depts.map(d =>
              <Picker.Item key={d.bolumid} label={d.bolumadi} value={d.bolumid}/>
            )}
          </Picker>
        </View>

        <TextInput
          style={[styles.inputModern, errors.ref1 && styles.inputError]}
          placeholder="Referans E-posta 1 (örn: prof@uni.edu.tr)"
          placeholderTextColor="#f75c5b"
          keyboardType="email-address"
          value={ref1}
          onChangeText={handleRef1Change}
        />
        {errors.ref1 && <Text style={styles.errorText}>{errors.ref1}</Text>}
        
        <TextInput
          style={[styles.inputModern, errors.ref2 && styles.inputError]}
          placeholder="Referans E-posta 2 (örn: dr@uni.edu.tr)"
          placeholderTextColor="#f75c5b"
          keyboardType="email-address"
          value={ref2}
          onChangeText={handleRef2Change}
        />
        {errors.ref2 && <Text style={styles.errorText}>{errors.ref2}</Text>}

        <TouchableOpacity style={styles.buttonModern} onPress={submit}>
          <Text style={styles.btnTextModern}>Kaydı Tamamla</Text>
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
  inputError: { borderColor: 'red', borderWidth: 1 },
  errorText: { color: 'red', marginTop: 5 },
});
