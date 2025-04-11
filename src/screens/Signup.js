import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Pressable,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [role, setRole] = useState('aday');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [kullaniciAdi, setKullaniciAdi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start(handleSignup);

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor!');
      return;
    }
    const turuId = role === 'aday' ? 0 : role === 'ogrenci' ? 1 : 2;
    try {
      const res = await axios.post('http://10.0.2.2:3000/api/auth/register', {
        ad: name,
        soyad: surname,
        kullaniciAdi,
        email,
        sifre: password,
        kullaniciTuruId: turuId,
      });
      if (res.data.error) return Alert.alert('Hata', res.data.error);
      Alert.alert('Başarılı', 'Kayıt başarılı!');
      const createdUser = res.data.user;
      await axios.post('http://10.0.2.2:3000/api/auth/sendVerification', {
        kullaniciId: createdUser.kullaniciid,
        email: createdUser.email,
      });
      navigation.navigate('Verify', {
        kullaniciId: createdUser.kullaniciid,
        email: createdUser.email,
      });
    } catch (err) {
      Alert.alert('Sunucu Hatası', err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* HEADER */}
      <LinearGradient colors={['#ff6b6b', '#ff9f6b']} style={styles.headerBox}>
        <Text style={styles.headerTitle}>Kayıt Ol</Text>
        <View style={styles.logoWrapper}>
          <Image source={require('../assets/images/banaSor_logo.jpg')} style={styles.logo} />
        </View>
      </LinearGradient>

      {/* FORM CARD */}
      <Animated.View
        style={[
          styles.formWrapper,
          {
            opacity: fadeAnim,
            transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        {/* Role Picker */}
        <View style={styles.pickerContainer}>
          <Icon name="people-outline" size={18} color="#666" style={styles.pickerIcon} />
          <Picker selectedValue={role} onValueChange={setRole} style={styles.picker}>
            <Picker.Item label="Aday Öğrenci" value="aday" />
            <Picker.Item label="Üniversite Öğrencisi" value="ogrenci" />
            <Picker.Item label="Mezun Öğrenci" value="mezun" />
          </Picker>
        </View>

        {/* Inputs */}
        {[
          { placeholder: 'Adınız', value: name, set: setName, icon: 'person-outline' },
          { placeholder: 'Soyadınız', value: surname, set: setSurname, icon: 'people-outline' },
          { placeholder: 'Kullanıcı Adı', value: kullaniciAdi, set: setKullaniciAdi, icon: 'at-outline' },
          { placeholder: 'E‑posta', value: email, set: setEmail, icon: 'mail-outline', keyboard: 'email-address' },
          { placeholder: 'Şifre', value: password, set: setPassword, icon: 'lock-closed-outline', secure: true },
          { placeholder: 'Şifreyi Onayla', value: confirmPassword, set: setConfirmPassword, icon: 'lock-open-outline', secure: true },
        ].map((item, idx) => (
          <View style={styles.inputWrapper} key={idx}>
            <Icon name={item.icon} size={18} color="#666" style={styles.leftIcon} />
            <TextInput
              style={styles.input}
              placeholder={item.placeholder}
              placeholderTextColor="#999"
              value={item.value}
              onChangeText={item.set}
              keyboardType={item.keyboard || 'default'}
              secureTextEntry={item.secure || false}
            />
          </View>
        ))}

        {/* Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
          <Pressable onPressIn={onPressIn} onPressOut={onPressOut} style={styles.signupButton}>
            <Text style={styles.signupButtonText}>Kayıt Ol</Text>
          </Pressable>
        </Animated.View>

        <View style={styles.bottomLink}>
          <Text style={styles.signupText}>Zaten hesabınız var mı? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signupLinkBold}>Giriş Yap</Text>
          </Pressable>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

/* ---------- STYLES ---------- */
const HEADER_HEIGHT = '28%'; // daha da küçültüldü, kart yukarı çıksın
const CARD_RADIUS = 32;
const LOGO_SIZE = 122;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerBox: {
    height: HEADER_HEIGHT,
    borderBottomLeftRadius: CARD_RADIUS * 1.5,
    borderBottomRightRadius: CARD_RADIUS * 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#fff', marginBottom: 6 },
  logoWrapper: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  logo: { width: LOGO_SIZE * 0.7, height: LOGO_SIZE * 0.7, resizeMode: 'contain' },
  formWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -CARD_RADIUS * 1.2, // daha yukarı
    marginHorizontal: 24,
    borderRadius: CARD_RADIUS,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    marginBottom: 15,
    paddingLeft: 40,
    position: 'relative',
    height: 52,
    justifyContent: 'center',
  },
  pickerIcon: { position: 'absolute', left: 15, zIndex: 2 },
  picker: { width: '100%', color: '#333' },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    marginBottom: 15,
    paddingLeft: 40,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: { position: 'absolute', left: 15, zIndex: 2 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  signupButton: {
    width: '100%',
    backgroundColor: '#ff6b6b',
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center',
    marginTop: 6,
  },
  signupButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  bottomLink: { flexDirection: 'row', marginTop: 12, justifyContent: 'center' },
  signupText: { color: '#666', fontSize: 14 },
  signupLinkBold: { color: '#ff6b6b', fontWeight: 'bold', fontSize: 14, marginLeft: 4 },
});