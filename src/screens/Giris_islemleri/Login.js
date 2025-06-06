import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { saveToken } from '../../utils/auth';  // token saklama

const LoginScreen = () => {
  const navigation = useNavigation();

  // Login form
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  // Password-reset modal
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep]                 = useState(1);
  const [resetEmail, setResetEmail]     = useState('');
  const [resetCode, setResetCode]       = useState('');
  const [newPass, setNewPass]           = useState('');

  // Animations
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
      .start(() => handleLogin());

  const handleLogin = async () => {
    try {
      const r = await axios.post(
        'http://10.0.2.2:3000/api/auth/login',
        { email, sifre: password }
      );

      if (r.data.error) {
        return Alert.alert('Hata', r.data.error);
      }

      const token = r.data.token;
      // 1️⃣ util ile sakla (authToken)
      await saveToken(token);
      // 2️⃣ eski ekranlar için de 'token' anahtarıyla sakla
      await AsyncStorage.setItem('token', token);

      // 3️⃣ header'a ekle
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      const userObj = r.data.user ?? r.data;
      const role = String(userObj.kullanicirolu).toLowerCase();

      // Giriş yönlendirmeleri
      if (role === 'superuser') {
        return navigation.replace('SuperUserAdmin', { user: userObj, token });
      } else if (role === 'admin') {
        return navigation.replace('AdminPanel', { user: userObj, token });
      } else {
        return navigation.replace('Home', { user: userObj });
      }

    } catch (e) {
      Alert.alert('Sunucu hatası', e.response?.data?.error || e.message);
    }
  };

  // Şifre sıfırlama adımları
  const sendResetCode = async () => {
    try {
      await axios.post('http://10.0.2.2:3000/api/auth/forgotPassword', { email: resetEmail });
      Alert.alert('Kod Gönderildi', 'E-posta kutunu kontrol et.');
      setStep(2);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || e.message);
    }
  };

  const applyNewPassword = async () => {
    if (newPass.length < 6) {
      return Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalı.');
    }
    try {
      await axios.post('http://10.0.2.2:3000/api/auth/resetPassword', {
        email: resetEmail,
        resetCode,
        newPassword: newPass,
      });
      Alert.alert('Başarılı', 'Şifre güncellendi.');
      closeModal();
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || e.message);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPass('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* HEADER */}
        <LinearGradient
          colors={['#f75c5b', '#ff8a5c']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/banaSor_logo.jpg')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.welcomeModern}>BanaSor'a Hoş Geldiniz!</Text>
        </LinearGradient>

        {/* CARD */}
        <Animated.View
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] })
              }]
            }
          ]}
        >
          <Text style={styles.title}>Giriş Yap</Text>

          <View style={styles.field}>
            <Icon name="mail-outline" size={22} color="#f75c5b" style={styles.iconModern} />
            <TextInput
              style={styles.inputModern}
              placeholder="E-posta"
              placeholderTextColor="#f75c5b"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Icon name="lock-closed-outline" size={22} color="#f75c5b" style={styles.iconModern} />
            <TextInput
              style={styles.inputModern}
              placeholder="Şifre"
              placeholderTextColor="#f75c5b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable style={styles.forgotModern} onPress={() => setModalVisible(true)}>
            <Text style={styles.forgotTextModern}>Şifremi unuttum?</Text>
          </Pressable>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={styles.buttonModern}
            >
              <Text style={styles.buttonTextModern}>Giriş Yap</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.bottom}>
            <Text style={styles.bottomText}>Hesabınız yok mu?</Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.bottomLinkModern}> Kayıt Ol</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* PASSWORD RESET MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {step === 1 ? 'Şifre Sıfırlama' : 'Yeni Şifre Belirle'}
                </Text>
                <Pressable style={styles.modalClose} onPress={closeModal}>
                  <Icon name="close-circle" size={28} color="#f75c5b" />
                </Pressable>
              </View>

              {step === 1 ? (
                <>
                  <Text style={styles.modalSubtitle}>
                    Şifrenizi sıfırlamak için e-posta adresinizi girin
                  </Text>
                  <View style={styles.modalInputContainer}>
                    <Icon name="mail-outline" size={22} color="#f75c5b" style={styles.modalInputIcon} />
                    <TextInput
                      style={styles.modalInput}
                      placeholder="E-posta adresiniz"
                      placeholderTextColor="#888"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={resetEmail}
                      onChangeText={setResetEmail}
                    />
                  </View>
                  <Pressable style={styles.modalBtn} onPress={sendResetCode}>
                    <Text style={styles.modalBtnText}>Kod Gönder</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.modalSubtitle}>
                    {resetEmail} adresine gelen kodu ve yeni şifrenizi girin
                  </Text>
                  <View style={styles.modalInputContainer}>
                    <Icon name="key-outline" size={22} color="#f75c5b" style={styles.modalInputIcon} />
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Aldığınız kod"
                      placeholderTextColor="#888"
                      value={resetCode}
                      onChangeText={setResetCode}
                    />
                  </View>
                  <View style={styles.modalInputContainer}>
                    <Icon name="lock-closed-outline" size={22} color="#f75c5b" style={styles.modalInputIcon} />
                    <TextInput
                      style={styles.modalInput}
                      placeholder="Yeni Şifre"
                      placeholderTextColor="#888"
                      secureTextEntry
                      value={newPass}
                      onChangeText={setNewPass}
                    />
                  </View>
                  <Pressable style={styles.modalBtn} onPress={applyNewPassword}>
                    <Text style={styles.modalBtnText}>Şifreyi Güncelle</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FA' 
  },
  header: {
    height: '40%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 16,
  },
  logo: { 
    width: 90, 
    height: 90, 
    resizeMode: 'contain' 
  },
  welcomeModern: {
    fontSize: 26,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    marginTop: -35,
    borderRadius: 35,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2D3436',
    textAlign: 'center',
    marginBottom: 25,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    height: 55,
    marginBottom: 18,
    paddingLeft: 55,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  iconModern: {
    position: 'absolute',
    left: 18,
    color: '#f75c5b',
  },
  inputModern: {
    flex: 1,
    fontSize: 16,
    color: '#2D3436',
    height: '100%',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  forgotModern: {
    alignSelf: 'flex-end',
    marginBottom: 15,
    padding: 5,
  },
  forgotTextModern: {
    color: '#f75c5b',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.1,
  },
  buttonModern: {
    backgroundColor: '#f75c5b',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonTextModern: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottom: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    marginTop: 10,
  },
  bottomText: { 
    color: '#6C757D',
    fontSize: 15,
  },
  bottomLinkModern: {
    color: '#ff8a5c',
    fontWeight: '800',
    fontSize: 15,
    marginLeft: 5,
    letterSpacing: 0.1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 30,
    padding: 25,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#636E72',
    marginBottom: 20,
    lineHeight: 22,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    height: 55,
    marginBottom: 20,
    paddingLeft: 55,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  modalInputIcon: {
    position: 'absolute',
    left: 18,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3436',
    height: '100%',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalBtn: {
    backgroundColor: '#f75c5b',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  modalClose: {
    padding: 5,
  },
});
