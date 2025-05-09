// src/screens/Signup.js
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput,
  KeyboardAvoidingView, Platform, Animated,
  Pressable, Image, ScrollView, Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:3000';

export default function Signup() {
  const navigation = useNavigation();
  const [role, setRole] = useState('aday'); // aday|ogrenci|mezun
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start(handleSignup);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      return Alert.alert('Hata', 'Şifreler eşleşmiyor!');
    }
    const turuId = role === 'aday' ? 1 : role === 'ogrenci' ? 2 : 3;

    try {
      // 1) Kayıt
      const { data } = await axios.post(`${BASE_URL}/api/auth/register`, {
        ad: name,
        soyad: surname,
        kullaniciAdi: username,
        email,
        sifre: password,
        kullaniciTuruId: turuId,
      });
      if (data.error) {
        return Alert.alert('Hata', data.error);
      }
      const kullaniciId = data.user.kullaniciid;

      // 2) Mail doğrulama kodu gönder
      await axios.post(`${BASE_URL}/api/auth/sendVerification`, {
        kullaniciId,
        email,
      });

      // 3) Verify ekranına geç
      navigation.replace('Verify', {
        kullaniciId,
        email,
        role,
        username: data.user.kullaniciadi,
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Sunucu Hatası', e.response?.data?.error || e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.headerModern}>
        <Image source={require('../../assets/images/banaSor_logo.jpg')} style={styles.logoModern} />
        <Text style={styles.headerTextModern}>BanaSor'a Hoş Geldiniz!</Text>
      </LinearGradient>
      <Animated.View
        style={[
          styles.cardModern,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [40, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.formModern} showsVerticalScrollIndicator={false}>
          <Text style={styles.titleModern}>Yeni Hesap Oluştur</Text>

          {/* Rol Seçimi */}
          <View style={styles.fieldModern}>
            <Icon name="people-circle-outline" size={24} color="#f75c5b" style={styles.iconModern} />
            <Picker selectedValue={role} onValueChange={setRole} style={styles.pickerModern}>
              <Picker.Item label="Aday Öğrenci" value="aday" />
              <Picker.Item label="Üniversite Öğrencisi" value="ogrenci" />
              <Picker.Item label="Mezun Öğrenci" value="mezun" />
            </Picker>
          </View>

          {/* Ortak Alanlar */}
          {[
            { ph: 'Adınız', val: name, fn: setName, ic: 'person-outline' },
            { ph: 'Soyadınız', val: surname, fn: setSurname, ic: 'people-outline' },
            { ph: 'Kullanıcı Adı', val: username, fn: setUsername, ic: 'at-outline' },
            { ph: 'E-posta', val: email, fn: setEmail, ic: 'mail-outline', kb: 'email-address' },
            { ph: 'Şifre', val: password, fn: setPassword, ic: 'lock-closed-outline', secure: true },
            { ph: 'Şifre Onayla', val: confirmPassword, fn: setConfirmPassword, ic: 'lock-open-outline', secure: true },
          ].map((f, i) => (
            <View style={styles.fieldModern} key={i}>
              <Icon name={f.ic} size={24} color="#f75c5b" style={styles.iconModern} />
              <TextInput
                style={styles.inputModern}
                placeholder={f.ph}
                placeholderTextColor="#f75c5b"
                value={f.val}
                onChangeText={f.fn}
                keyboardType={f.kb || 'default'}
                secureTextEntry={f.secure || false}
              />
            </View>
          ))}

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.buttonModern}>
              <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.buttonGradient}>
                <Text style={styles.buttonTextModern}>Kayıt Ol</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <View style={styles.bottomRowModern}>
            <Text style={styles.bottomTextModern}>Zaten hesabınız var mı?</Text>
            <Pressable onPress={() => navigation.replace('Login')}>
              <Text style={styles.bottomLinkModern}> Giriş Yap</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F6' },
  headerModern: {
    height: '36%',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 48,
    marginBottom: 8,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 10,
  },
  logoModern: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.13,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 18,
  },
  headerTextModern: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 10,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.3,
  },
  cardModern: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 18,
    marginTop: -44,
    borderRadius: 36,
    paddingVertical: 28,
    paddingHorizontal: 28,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius: 18,
    elevation: 8,
  },
  formModern: { paddingBottom: 48 },
  titleModern: { fontSize: 26, fontWeight: '900', color: '#f75c5b', textAlign: 'center', marginBottom: 28, letterSpacing: 0.5 },
  fieldModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 28,
    height: 58,
    marginBottom: 18,
    paddingLeft: 58,
    borderWidth: 1,
    borderColor: '#f75c5b22',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  iconModern: {
    position: 'absolute',
    left: 18,
    zIndex: 2,
    color: '#f75c5b',
  },
  pickerModern: {
    flex: 1,
    color: '#2D3436',
    fontWeight: '700',
    fontSize: 17,
  },
  inputModern: {
    flex: 1,
    fontSize: 17,
    color: '#2D3436',
    height: '100%',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  buttonModern: {
    backgroundColor: 'transparent',
    borderRadius: 28,
    overflow: 'hidden',
    marginVertical: 16,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonGradient: {
    width: '100%',
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonTextModern: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  bottomRowModern: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  bottomTextModern: { color: '#6C757D', fontSize: 15 },
  bottomLinkModern: {
    color: '#ff8a5c',
    fontWeight: '900',
    marginLeft: 5,
    fontSize: 15,
    letterSpacing: 0.1,
  },
});
