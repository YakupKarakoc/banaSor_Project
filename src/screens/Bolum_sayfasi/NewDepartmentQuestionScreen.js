import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ActivityIndicator,
  Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';

const BASE = 'http://10.0.2.2:3000';

export default function NewDepartmentQuestionScreen() {
  const { bolumId } = useRoute().params;            // 🔑 sadece bölüm id
  const navigation   = useNavigation();

  const [konular, setKonular]   = useState([]);
  const [selectedKonu, setSelectedKonu] = useState(null);
  const [icerik, setIcerik]     = useState('');
  const [loading, setLoading]   = useState(true);
  const [posting, setPosting]   = useState(false);

  /* konuları çek */
  useEffect(() => {
    axios.get(`${BASE}/api/soru/konu/getir`)
      .then(res => setKonular(res.data))
      .catch(() => Alert.alert('Hata', 'Konular yüklenemedi'))
      .finally(() => setLoading(false));
  }, []);

  /* gönder */
  const handleSubmit = () => {
    if (!selectedKonu)  return Alert.alert('Hata', 'Lütfen bir konu seçin');
    if (!icerik.trim()) return Alert.alert('Hata', 'Sorunuzu yazın');

    setPosting(true);
    axios.post(`${BASE}/api/soru/soruOlustur`, {
      bolumId,
      konuId: selectedKonu,
      icerik: icerik.trim(),
    })
    .then(() => {
      Alert.alert('Başarılı','Soru oluşturuldu',[{ text:'Tamam', onPress:()=>navigation.goBack() }]);
    })
    .catch(()=> Alert.alert('Hata','Soru oluşturulamadı'))
    .finally(()=> setPosting(false));
  };

  /* yükleniyor ekranı */
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff"/>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.inner}>
          <Text style={styles.title}>Yeni Soru Oluştur</Text>

          <Text style={styles.label}>Konu Seçin</Text>
          <View style={styles.pickerContainer}>
            {konular.map(k=>(
              <TouchableOpacity
                key={k.konuid}
                style={[ styles.konuItem, selectedKonu===k.konuid && styles.konuItemSelected ]}
                onPress={()=> setSelectedKonu(k.konuid)}
              >
                <Text style={[ styles.konuText, selectedKonu===k.konuid && styles.konuTextSelected ]}>
                  {k.ad}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Sorunuz</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Sorunuzu buraya yazın..."
            placeholderTextColor="#ccc"
            value={icerik}
            onChangeText={setIcerik}
          />

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={posting}>
            {posting ? <ActivityIndicator color="#f75c5b"/> : <Text style={styles.btnText}>Gönder</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

/* --- stil --- */
const styles = StyleSheet.create({
  container:{ flex:1 },
  loader:{ flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'#f75c5b' },
  inner:{ padding:16 },
  title:{ fontSize:20,fontWeight:'bold',color:'#fff',textAlign:'center',marginBottom:20 },
  label:{ fontSize:14,fontWeight:'600',color:'#fff',marginBottom:8 },
  pickerContainer:{ flexDirection:'row',flexWrap:'wrap',marginBottom:16 },
  konuItem:{ backgroundColor:'rgba(255,255,255,0.2)',paddingHorizontal:12,paddingVertical:6,borderRadius:20,margin:4 },
  konuItemSelected:{ backgroundColor:'#fff' },
  konuText:{ color:'#fff' },
  konuTextSelected:{ color:'#f75c5b',fontWeight:'bold' },
  input:{ backgroundColor:'#fff',borderRadius:8,height:120,padding:12,textAlignVertical:'top',marginBottom:20,color:'#333' },
  button:{ backgroundColor:'#fff',paddingVertical:14,borderRadius:25,alignItems:'center' },
  btnText:{ color:'#f75c5b',fontWeight:'600',fontSize:16 },
});
