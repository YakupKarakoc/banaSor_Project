// src/screens/LoginScreen.js
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
      toValue: 1, duration: 600, useNativeDriver: true
    }).start();
  }, []);

  const onPressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
      .start(handleLogin);

  // --- LOGIN ---
  // --- LOGIN ---
// src/screens/LoginScreen.js

const handleLogin = async () => {
  // Admin shortcut
  if (email === 'admin' && password === 'admin') {
    return navigation.replace('AdminDashboard');
  }

  try {
    const r = await axios.post(
      'http://10.0.2.2:3000/api/auth/login',
      {
        email,
        sifre: password,
      }
    );

    if (r.data.error) {
      return Alert.alert('Hata', r.data.error);
    }

    const token = r.data.token; 
    const userObj = r.data.user ?? r.data;

    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    navigation.replace('Home', { user: userObj });

  } catch (e) {
    Alert.alert('Sunucu hatası', e.response?.data?.error || e.message);
  }
};



  // --- ŞİFRE SIFIRLAMA ADIM 1 ---
  const sendResetCode = async () => {
    try {
      await axios.post('http://10.0.2.2:3000/api/auth/forgotPassword', { email: resetEmail });
      Alert.alert('Kod Gönderildi', 'E‑posta kutunu kontrol et.');
      setStep(2);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || e.message);
    }
  };

  // --- ŞİFRE SIFIRLAMA ADIM 2 ---
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
    setResetEmail(''); setResetCode(''); setNewPass('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* HEADER */}
        <LinearGradient
          colors={['#FF8C00', '#FF3D00']}
          style={styles.header}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/banaSor_logo.jpg')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.welcome}>BanaSor’a Hoş Geldiniz!</Text>
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
            <Icon name="mail-outline" size={20} color="#AAA" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="E‑posta"
              placeholderTextColor="#AAA"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.field}>
            <Icon name="lock-closed-outline" size={20} color="#AAA" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Şifre"
              placeholderTextColor="#AAA"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable style={styles.forgot} onPress={() => setModalVisible(true)}>
            <Text style={styles.forgotText}>Şifremi unuttum?</Text>
          </Pressable>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.bottom}>
            <Text style={styles.bottomText}>Hesabınız yok mu?</Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.bottomLink}> Kayıt Ol</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* PASSWORD RESET MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {step === 1 ? 'Şifre Sıfırlama' : 'Yeni Şifre Belirle'}
              </Text>

              {step === 1 ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="E‑posta adresiniz"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                  />
                  <Pressable style={styles.modalBtn} onPress={sendResetCode}>
                    <Text style={styles.modalBtnText}>Kod Gönder</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Aldığınız kod"
                    placeholderTextColor="#888"
                    value={resetCode}
                    onChangeText={setResetCode}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Yeni Şifre"
                    placeholderTextColor="#888"
                    secureTextEntry
                    value={newPass}
                    onChangeText={setNewPass}
                  />
                  <Pressable style={styles.modalBtn} onPress={applyNewPassword}>
                    <Text style={styles.modalBtnText}>Şifreyi Güncelle</Text>
                  </Pressable>
                </>
              )}

              <Pressable style={styles.modalClose} onPress={closeModal}>
                <Icon name="close-circle" size={28} color="#444" />
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

// (styles kodları aynı kaldı)




const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9' },

  header: {
    height: '35%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 30,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 12,
  },
  logo: { width: 80, height: 80, resizeMode: 'contain' },
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },

  card: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 24,
    marginTop: -30,
    borderRadius: 30,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFEFEF',
    borderRadius: 20,
    height: 50,
    marginBottom: 15,
    paddingLeft: 50,
  },
  icon: { position: 'absolute', left: 15 },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },

  forgot: { alignSelf: 'flex-end', marginBottom: 10 },
  forgotText: { color: '#FF3D00', fontWeight: '500' },

  button: {
    backgroundColor: '#FF3D00',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  bottom: { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { color: '#666' },
  bottomLink: { color: '#FF3D00', fontWeight: '600' },

  /* Modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
    marginBottom: 12,
  },
  modalBtn: {
    backgroundColor: '#FF3D00',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  modalClose: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
