import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, Image, KeyboardAvoidingView,
  Platform, TouchableWithoutFeedback, Keyboard, Animated, Pressable,
  Alert, Modal
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const LoginScreen = () => {
  const navigation   = useNavigation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');

  /* ---------- şifre sıfırlama state ---------- */
  const [modalVisible, setModalVisible] = useState(false);
  const [resetStep, setResetStep]       = useState(1); // 1: e‑posta, 2: kod+şifre
  const [resetEmail, setResetEmail]     = useState('');
  const [resetCode, setResetCode]       = useState('');
  const [newPass, setNewPass]           = useState('');

  /* ---------- animasyonlar ---------- */
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const onPressIn  = () => Animated.spring(scaleAnim, { toValue: 0.94, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true })
      .start(handleLogin);

  /* ---------- login ---------- */
  const handleLogin = async () => {
    try {
      const r = await axios.post('http://10.0.2.2:3000/api/auth/login', {
        email, sifre: password,
      });
      if (r.data.error) return Alert.alert('Hata', r.data.error);
      Alert.alert('Başarılı', 'Giriş yapıldı!');
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Sunucu hatası', e.message);
    }
  };

  /* ---------- şifre sıfırlama – adım 1 ---------- */
  const sendResetCode = async () => {
    try {
      await axios.post('http://10.0.2.2:3000/api/auth/forgotPassword', { email: resetEmail });
      Alert.alert('Kod gönderildi', 'E‑posta kutunu kontrol et.');
      setResetStep(2);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || e.message);
    }
  };

  /* ---------- şifre sıfırlama – adım 2 ---------- */
  const resetPassword = async () => {
    if (newPass.length < 6) return Alert.alert('Hata', 'Şifre en az 6 karakter olmalı.');
    try {
      await axios.post('http://10.0.2.2:3000/api/auth/resetPassword', {
        email: resetEmail,
        resetCode,
        newPassword: newPass,
      });
      Alert.alert('Başarılı', 'Şifren güncellendi.');
      closeModal();
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || e.message);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPass('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* ---------- HEADER ---------- */}
        <LinearGradient colors={['#ff6b6b', '#ff9f6b']} style={styles.headerBox}>
          <Image source={require('../assets/images/banaSor_logo.jpg')} style={styles.logo} />
        </LinearGradient>

        {/* ---------- CARD ---------- */}
        <Animated.View
          style={[
            styles.card,
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
          ]}>
          <Text style={styles.loginTitle}>Giriş Yap</Text>

          {/* email */}
          <View style={styles.inputWrapper}>
            <Icon name="mail-outline" size={20} color="#999" style={styles.leftIcon} />
            <TextInput
              placeholder="E‑posta"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>

          {/* password */}
          <View style={styles.inputWrapper}>
            <Icon name="lock-closed-outline" size={20} color="#999" style={styles.leftIcon} />
            <TextInput
              placeholder="Şifre"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          {/* forgot */}
          <Pressable onPress={() => setModalVisible(true)} style={styles.forgotWrapper}>
            <Text style={styles.forgotText}>Şifremi unuttum?</Text>
          </Pressable>

          {/* login btn */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.loginBtn}>
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            </Pressable>
          </Animated.View>

          {/* bottom */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Hesabınız yok mu?</Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLink}>Kayıt Ol</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* ---------- Şifre Sıfırlama Modalı ---------- */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>
                {resetStep === 1 ? 'Kod Gönder' : 'Şifreyi Sıfırla'}
              </Text>

              {resetStep === 1 ? (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="E‑posta adresin"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    value={resetEmail}
                    onChangeText={setResetEmail}
                  />
                  <Pressable style={styles.modalBtn} onPress={sendResetCode}>
                    <Text style={styles.modalBtnTxt}>Kodu Gönder</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Doğrulama Kodu"
                    placeholderTextColor="#999"
                    value={resetCode}
                    onChangeText={setResetCode}
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Yeni Şifre"
                    placeholderTextColor="#999"
                    secureTextEntry
                    value={newPass}
                    onChangeText={setNewPass}
                  />
                  <Pressable style={styles.modalBtn} onPress={resetPassword}>
                    <Text style={styles.modalBtnTxt}>Şifreyi Güncelle</Text>
                  </Pressable>
                </>
              )}

              <Pressable onPress={closeModal} style={styles.modalClose}>
                <Icon name="close" size={24} color="#666" />
              </Pressable>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

/* ---------- STYLES ---------- */
const CARD_RADIUS = 38;
const LOGO_SIZE = 140;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f1f1' },
  headerBox: {
    height: '36%',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: CARD_RADIUS * 1.5,
    borderBottomRightRadius: CARD_RADIUS * 1.5,
  },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE, resizeMode: 'contain' },

  /* card */
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -CARD_RADIUS,
    marginHorizontal: 24,
    borderRadius: CARD_RADIUS,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 4,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    alignSelf: 'center',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  leftIcon: { marginRight: 6 },
  input: { flex: 1, height: 48, fontSize: 15, color: '#333' },
  forgotWrapper: { alignSelf: 'flex-end', marginBottom: 16 },
  forgotText: { fontSize: 13, color: '#ff6b6b' },
  loginBtn: {
    backgroundColor: '#ff6b6b',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  bottomRow: { flexDirection: 'row', justifyContent: 'center' },
  bottomText: { color: '#666' },
  signupLink: { marginLeft: 4, color: '#ff6b6b', fontWeight: '600' },

  /* modal */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#333', alignSelf: 'center', marginBottom: 18 },
  modalInput: {
    width: '100%',
    backgroundColor: '#f7f7f7',
    borderRadius: 16,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
    marginBottom: 14,
  },
  modalBtn: {
    backgroundColor: '#ff6b6b',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  modalClose: { position: 'absolute', top: 12, right: 12 },
});
