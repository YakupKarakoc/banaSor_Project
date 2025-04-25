// src/screens/SignupScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const SignupScreen = () => {
  const navigation = useNavigation();

  // ─── Genel Form State ─────────────────
  const [role, setRole]               = useState('aday'); // 'aday' | 'ogrenci' | 'mezun'
  const [name, setName]               = useState('');
  const [surname, setSurname]         = useState('');
  const [username, setUsername]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ─── Üniversite & Bölüm (ogrenci/mezun) ───
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [selUni, setSelUni]             = useState('');
  const [selDept, setSelDept]           = useState('');

  // ─── Mezun için Referans E-postaları ───
  const [ref1, setRef1] = useState('');
  const [ref2, setRef2] = useState('');

  // ─── Animations ─────────────────────────
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // ─── Data Fetch: Üniversiteler ───────────
  useEffect(() => {
    if (role !== 'aday') {
      axios.get('http://10.0.2.2:3000/api/education/university')
        .then(res => setUniversities(res.data))
        .catch(() => Alert.alert('Hata','Üniversiteler yüklenemedi'));
    } else {
      setUniversities([]);
      setSelUni('');
    }
    // her rol değiştiğinde bölümleri sıfırla
    setDepartments([]);
    setSelDept('');
  }, [role]);

  // ─── Data Fetch: Bölümler ───────────────
  useEffect(() => {
    if ((role==='ogrenci' || role==='mezun') && selUni) {
      axios.get('http://10.0.2.2:3000/api/education/department', {
        params: { universiteId: selUni }
      })
      .then(res => setDepartments(res.data))
      .catch(() => Alert.alert('Hata','Bölümler yüklenemedi'));
    } else {
      setDepartments([]);
      setSelDept('');
    }
  }, [role, selUni]);

  // ─── Buton Animasyonları ─────────────────
  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start(handleSignup);

  // ─── Kayıt Handler ───────────────────────
  const handleSignup = async () => {
    if (password !== confirmPassword) {
      return Alert.alert('Hata','Şifreler eşleşmiyor!');
    }

    // DB’deki ID’ler: Aday=1, Üniv. Öğrenci=2, Mezun=3
    const turuId = role==='aday' ? 1 : role==='ogrenci' ? 2 : 3;

    try {
      // 1) Kullanıcı kaydı
      const reg = await axios.post('http://10.0.2.2:3000/api/auth/register', {
        ad: name,
        soyad: surname,
        kullaniciAdi: username,
        email,
        sifre: password,
        kullaniciTuruId: turuId
      });
      if (reg.data.error) {
        return Alert.alert('Hata', reg.data.error);
      }

      // 2) Üniversite Öğrencisi ise /api/ogrenci/kayit
      if (role==='ogrenci') {
        if (!selUni || !selDept) {
          return Alert.alert('Hata','Üniversite ve bölümü seçin.');
        }
        await axios.post('http://10.0.2.2:3000/api/ogrenci/kayit', {
          email,
          universiteId: selUni,
          bolumId: selDept
        });
      }

      // 3) Mezun ise /api/mezun/dogrulama-baslat
      if (role==='mezun') {
        if (!selUni || !selDept || !ref1 || !ref2) {
          return Alert.alert('Hata','Tüm alanları eksiksiz doldurun.');
        }
        await axios.post('http://10.0.2.2:3000/api/mezun/dogrulama-baslat', {
          email,
          universiteId: selUni,
          bolumId: selDept,
          dogrulamaMail1: ref1,
          dogrulamaMail2: ref2
        });
      }

      Alert.alert('Başarılı','Kayıt tamamlandı.');
      navigation.replace('Login');
    } catch (e) {
      console.error(e);
      Alert.alert('Sunucu Hatası', e.response?.data?.error || e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS==='ios'?'padding':'height'}
    >
      {/* Üst Gradient + Logo */}
      <LinearGradient colors={['#FF8C00','#FF3D00']} style={styles.header}>
        <Image source={require('../assets/images/banaSor_logo.jpg')} style={styles.logo}/>
        <Text style={styles.headerText}>BanaSor’a Hoş Geldiniz!</Text>
      </LinearGradient>

      {/* Kayıt Kartı */}
      <Animated.View style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform:[{ translateY: fadeAnim.interpolate({ inputRange:[0,1], outputRange:[40,0] }) }]
        }
      ]}>
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Yeni Hesap Oluştur</Text>

          {/* Rol Seçimi */}
          <View style={styles.field}>
            <Icon name="people-circle-outline" size={20} color="#777" style={styles.icon}/>
            <Picker selectedValue={role} onValueChange={setRole} style={styles.picker}>
              <Picker.Item label="Aday Öğrenci" value="aday"/>
              <Picker.Item label="Üniversite Öğrencisi" value="ogrenci"/>
              <Picker.Item label="Mezun Öğrenci" value="mezun"/>
            </Picker>
          </View>

          {/* Ortak Alanlar */}
          {[
            {ph:'Adınız',         val:name,   fn:setName,         ic:'person-outline'},
            {ph:'Soyadınız',      val:surname,fn:setSurname,      ic:'people-outline'},
            {ph:'Kullanıcı Adı',  val:username,fn:setUsername,    ic:'at-outline'},
            {ph:'E-posta',        val:email,  fn:setEmail,        ic:'mail-outline',      kb:'email-address'},
            {ph:'Şifre',          val:password,fn:setPassword,     ic:'lock-closed-outline',secure:true},
            {ph:'Şifre Onayla',   val:confirmPassword,fn:setConfirmPassword,ic:'lock-open-outline',secure:true},
          ].map((f,i)=>(
            <View style={styles.field} key={i}>
              <Icon name={f.ic} size={20} color="#777" style={styles.icon}/>
              <TextInput
                style={styles.input}
                placeholder={f.ph}
                placeholderTextColor="#999"
                value={f.val}
                onChangeText={f.fn}
                keyboardType={f.kb||'default'}
                secureTextEntry={f.secure||false}
              />
            </View>
          ))}

          {/* Uni & Bölüm (ogrenci/mezun) */}
          {(role==='ogrenci' || role==='mezun') && (
            <>
              <View style={styles.field}>
                <Icon name="school-outline" size={20} color="#777" style={styles.icon}/>
                <Picker selectedValue={selUni} onValueChange={setSelUni} style={styles.picker}>
                  <Picker.Item label="Üniversite seçin..." value=""/>
                  {universities.map(u=>(
                    <Picker.Item key={u.universiteid} label={u.universiteadi} value={u.universiteid}/>
                  ))}
                </Picker>
              </View>

              <View style={styles.field}>
                <Icon name="layers-outline" size={20} color="#777" style={styles.icon}/>
                <Picker selectedValue={selDept} onValueChange={setSelDept} style={styles.picker}>
                  <Picker.Item label="Bölüm seçin..." value=""/>
                  {departments.map(d=>(
                    <Picker.Item key={d.bolumid} label={d.bolumadi} value={d.bolumid}/>
                  ))}
                </Picker>
              </View>
            </>
          )}

          {/* Mezun için Referans E-postaları */}
          {role==='mezun' && (
            <>
              <View style={styles.field}>
                <Icon name="mail-outline" size={20} color="#777" style={styles.icon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Referans E-posta 1"
                  placeholderTextColor="#999"
                  value={ref1}
                  onChangeText={setRef1}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.field}>
                <Icon name="mail-outline" size={20} color="#777" style={styles.icon}/>
                <TextInput
                  style={styles.input}
                  placeholder="Referans E-posta 2"
                  placeholderTextColor="#999"
                  value={ref2}
                  onChangeText={setRef2}
                  keyboardType="email-address"
                />
              </View>
            </>
          )}

          {/* Kayıt Butonu */}
          <Animated.View style={{ transform:[{ scale: scaleAnim }] }}>
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.button}>
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </Pressable>
          </Animated.View>

          {/* Zaten varsa */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Zaten hesabınız var mı?</Text>
            <Pressable onPress={()=>navigation.replace('Login')}>
              <Text style={styles.bottomLink}> Giriş Yap</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:'#F4F5F6' },
  header:      { height:'30%', borderBottomLeftRadius:40, borderBottomRightRadius:40,
                 justifyContent:'center', alignItems:'center', paddingTop:30 },
  logo:        { width:100, height:100, resizeMode:'contain' },
  headerText:  { color:'#FFF', fontSize:18, fontWeight:'600', marginTop:8 },

  card:        { flex:1, backgroundColor:'#FFF', marginHorizontal:20, marginTop:-30,
                 borderRadius:30, paddingVertical:20, paddingHorizontal:25,
                 shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.1,
                 shadowRadius:8, elevation:5 },

  form:        { paddingBottom:40 },
  title:       { fontSize:22, fontWeight:'600', color:'#333', textAlign:'center', marginBottom:20 },

  field:       { flexDirection:'row', alignItems:'center',
                 backgroundColor:'#F0F0F3', borderRadius:25, height:50,
                 marginBottom:15, paddingLeft:50 },

  icon:        { position:'absolute', left:15, zIndex:2 },
  picker:      { flex:1, color:'#333' },
  input:       { flex:1, fontSize:16, color:'#333', height:'100%' },

  button:      { backgroundColor:'#FF8C00', borderRadius:25,
                 paddingVertical:14, alignItems:'center', marginVertical:10 },
  buttonText:  { color:'#FFF', fontSize:16, fontWeight:'600' },

  bottomRow:   { flexDirection:'row', justifyContent:'center' },
  bottomText:  { color:'#666' },
  bottomLink:  { color:'#FF8C00', fontWeight:'600' },
});
