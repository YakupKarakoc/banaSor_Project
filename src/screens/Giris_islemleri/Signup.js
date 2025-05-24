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
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Rol değiştiğinde email'i yeniden validate et
  useEffect(() => {
    if (email) {
      handleEmailChange(email);
    }
  }, [role]);

  // Validation functions
  const validateName = (text) => {
    // Sadece harfler, boşluk ve Türkçe karakterler
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    return nameRegex.test(text) && text.length >= 2;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    
    // Eğer üniversite öğrencisi seçildiyse .edu.tr ile bitmeli
    if (role === 'ogrenci') {
      return isValidFormat && email.toLowerCase().endsWith('.edu.tr');
    }
    
    return isValidFormat;
  };

  const validateUsername = (username) => {
    // Alfanumerik + underscore, 3-20 karakter
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    // En az 6 karakter, büyük harf, küçük harf ve rakam
    const hasLength = password.length >= 6;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLength && hasUpper && hasLower && hasNumber;
  };

  // Input handlers with validation
  const handleNameChange = (text) => {
    // Sadece harfler ve boşluk kabul et
    const filteredText = text.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
    setName(filteredText);
    
    if (filteredText && !validateName(filteredText)) {
      setErrors(prev => ({ ...prev, name: 'Ad en az 2 harften oluşmalı' }));
    } else {
      setErrors(prev => ({ ...prev, name: null }));
    }
  };

  const handleSurnameChange = (text) => {
    // Sadece harfler ve boşluk kabul et
    const filteredText = text.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
    setSurname(filteredText);
    
    if (filteredText && !validateName(filteredText)) {
      setErrors(prev => ({ ...prev, surname: 'Soyad en az 2 harften oluşmalı' }));
    } else {
      setErrors(prev => ({ ...prev, surname: null }));
    }
  };

  const handleUsernameChange = (text) => {
    // Sadece alfanumerik ve underscore
    const filteredText = text.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    setUsername(filteredText);
    
    if (filteredText && !validateUsername(filteredText)) {
      setErrors(prev => ({ ...prev, username: 'Kullanıcı adı 3-20 karakter olmalı (harf, rakam, _)' }));
    } else {
      setErrors(prev => ({ ...prev, username: null }));
    }
  };

  const handleEmailChange = (text) => {
    setEmail(text.toLowerCase().trim());
    
    if (text && !validateEmail(text)) {
      if (role === 'ogrenci') {
        setErrors(prev => ({ ...prev, email: 'Üniversite öğrencileri için .edu.tr uzantılı email gerekli' }));
      } else {
        setErrors(prev => ({ ...prev, email: 'Geçerli bir email adresi girin' }));
      }
    } else {
      setErrors(prev => ({ ...prev, email: null }));
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    
    if (text && !validatePassword(text)) {
      setErrors(prev => ({ 
        ...prev, 
        password: 'Şifre en az 6 karakter, büyük/küçük harf ve rakam içermeli' 
      }));
    } else {
      setErrors(prev => ({ ...prev, password: null }));
    }
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    
    if (text && text !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Şifreler eşleşmiyor' }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Ad zorunludur';
    } else if (!validateName(name)) {
      newErrors.name = 'Geçerli bir ad girin';
    }

    if (!surname.trim()) {
      newErrors.surname = 'Soyad zorunludur';
    } else if (!validateName(surname)) {
      newErrors.surname = 'Geçerli bir soyad girin';
    }

    if (!username.trim()) {
      newErrors.username = 'Kullanıcı adı zorunludur';
    } else if (!validateUsername(username)) {
      newErrors.username = 'Geçerli bir kullanıcı adı girin';
    }

    if (!email.trim()) {
      newErrors.email = 'Email zorunludur';
    } else if (!validateEmail(email)) {
      if (role === 'ogrenci') {
        newErrors.email = 'Üniversite öğrencileri için .edu.tr uzantılı email gerekli';
      } else {
        newErrors.email = 'Geçerli bir email adresi girin';
      }
    }

    if (!password) {
      newErrors.password = 'Şifre zorunludur';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Şifre kriterleri karşılanmıyor';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Şifre onayı zorunludur';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start(handleSignup);

  const handleSignup = async () => {
    if (isLoading) return;

    if (!validateForm()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doğru şekilde doldurun');
      return;
    }

    setIsLoading(true);
    const turuId = role === 'aday' ? 1 : role === 'ogrenci' ? 2 : 3;

    try {
      // 1) Kayıt
      const { data } = await axios.post(`${BASE_URL}/api/auth/register`, {
        ad: name.trim(),
        soyad: surname.trim(),
        kullaniciAdi: username.trim(),
        email: email.trim(),
        sifre: password,
        kullaniciTuruId: turuId,
      });
      
      if (data.error) {
        Alert.alert('Hata', data.error);
        return;
      }
      
      const kullaniciId = data.user.kullaniciid;

      // 2) Mail doğrulama kodu gönder
      await axios.post(`${BASE_URL}/api/auth/sendVerification`, {
        kullaniciId,
        email: email.trim(),
      });

      // 3) Verify ekranına geç
      navigation.replace('Verify', {
        kullaniciId,
        email: email.trim(),
        role,
        username: data.user.kullaniciadi,
      });
    } catch (e) {
      console.error(e);
      const errorMsg = e.response?.data?.error || e.response?.data?.message || e.message;
      Alert.alert('Kayıt Hatası', errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const inputFields = [
    { 
      placeholder: 'Adınız', 
      value: name, 
      onChangeText: handleNameChange, 
      icon: 'person-outline',
      autoCapitalize: 'words',
      error: errors.name
    },
    { 
      placeholder: 'Soyadınız', 
      value: surname, 
      onChangeText: handleSurnameChange, 
      icon: 'people-outline',
      autoCapitalize: 'words',
      error: errors.surname
    },
    { 
      placeholder: 'Kullanıcı Adı', 
      value: username, 
      onChangeText: handleUsernameChange, 
      icon: 'at-outline',
      autoCapitalize: 'none',
      error: errors.username
    },
    { 
      placeholder: role === 'ogrenci' ? 'E-posta (üniversite@domain.edu.tr)' : 'E-posta', 
      value: email, 
      onChangeText: handleEmailChange, 
      icon: 'mail-outline', 
      keyboardType: 'email-address',
      autoCapitalize: 'none',
      error: errors.email
    },
    { 
      placeholder: 'Şifre', 
      value: password, 
      onChangeText: handlePasswordChange, 
      icon: 'lock-closed-outline', 
      secureTextEntry: true,
      error: errors.password
    },
    { 
      placeholder: 'Şifre Onayla', 
      value: confirmPassword, 
      onChangeText: handleConfirmPasswordChange, 
      icon: 'lock-open-outline', 
      secureTextEntry: true,
      error: errors.confirmPassword
    },
  ];

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

          {/* Input Fields */}
          {inputFields.map((field, index) => (
            <View key={index}>
              <View style={[styles.fieldModern, field.error && styles.fieldError]}>
                <Icon name={field.icon} size={24} color="#f75c5b" style={styles.iconModern} />
                <TextInput
                  style={styles.inputModern}
                  placeholder={field.placeholder}
                  placeholderTextColor="#f75c5b"
                  value={field.value}
                  onChangeText={field.onChangeText}
                  keyboardType={field.keyboardType || 'default'}
                  secureTextEntry={field.secureTextEntry || false}
                  autoCapitalize={field.autoCapitalize || 'none'}
                  autoCorrect={false}
                  maxLength={field.placeholder.includes('Kullanıcı') ? 20 : 50}
                />
              </View>
              {field.error && <Text style={styles.errorText}>{field.error}</Text>}
            </View>
          ))}

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable 
              onPressIn={onPressIn} 
              onPressOut={onPressOut} 
              style={[styles.buttonModern, isLoading && styles.buttonDisabled]}
              disabled={isLoading}
            >
              <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.buttonGradient}>
                <Text style={styles.buttonTextModern}>
                  {isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                </Text>
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
  titleModern: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#f75c5b', 
    textAlign: 'center', 
    marginBottom: 28, 
    letterSpacing: 0.5 
  },
  fieldModern: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 28,
    height: 58,
    marginBottom: 8,
    paddingLeft: 58,
    borderWidth: 1,
    borderColor: '#f75c5b22',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  fieldError: {
    borderColor: '#ff4757',
    borderWidth: 2,
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
  errorText: {
    color: '#ff4757',
    fontSize: 12,
    marginLeft: 18,
    marginBottom: 10,
    fontWeight: '600',
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
  buttonDisabled: {
    opacity: 0.7,
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
  bottomRowModern: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 18 
  },
  bottomTextModern: { 
    color: '#6C757D', 
    fontSize: 15 
  },
  bottomLinkModern: {
    color: '#ff8a5c',
    fontWeight: '900',
    marginLeft: 5,
    fontSize: 15,
    letterSpacing: 0.1,
  },
});
