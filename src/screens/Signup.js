import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const SignupScreen = () => {
  const navigation = useNavigation();
  const [role, setRole] = useState('aday');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ref1, setRef1] = useState('');
  const [ref2, setRef2] = useState('');

  const handleSignup = () => {
    if (role === 'ogrenci' && !email.endsWith('@edu.tr')) {
      Alert.alert('Hata', 'Üniversite öğrencisi kaydı için @edu.tr maili gereklidir.');
      return;
    }
    Alert.alert('Başarı', 'Kayıt başarılı!');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Üst Bölüm (Gradient + Dalga + Logo + Yazılar) */}
      <View style={styles.headerContainer}>
        <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.topGradient}>
          <View style={styles.logoCircle}>
            <Image
              source={require('../assets/images/banaSor_logo.jpg')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.headerTitle}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Kayıt olmak için bilgileri doldur.</Text>
        </LinearGradient>

        {/* Dalga Katmanı #1 (Yarı saydam) */}
        <View style={styles.waveWrapper1}>
          <Svg width="100%" height="100%" viewBox="0 0 1440 320">
            <Path
              fill="rgba(255,255,255,0.5)"
              d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,186.7C672,171,768,117,864,112C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </Svg>
        </View>

        {/* Dalga Katmanı #2 (Beyaz) */}
        <View style={styles.waveWrapper2}>
          <Svg width="100%" height="100%" viewBox="0 0 1440 320">
            <Path
              fill="#fff"
              d="M0,192L48,186.7C96,181,192,171,288,144C384,117,480,75,576,85.3C672,96,768,160,864,170.7C960,181,1056,139,1152,144C1248,149,1344,203,1392,229.3L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            />
          </Svg>
        </View>
      </View>

      {/* Beyaz Kart Formu */}
      <View style={styles.formWrapper}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Aday Öğrenci" value="aday" />
            <Picker.Item label="Üniversite Öğrencisi" value="ogrenci" />
            <Picker.Item label="Mezun Öğrenci" value="mezun" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="E-posta"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifreyi Onayla"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholderTextColor="#999"
        />

        {role === 'mezun' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="1. Referans Maili"
              keyboardType="email-address"
              value={ref1}
              onChangeText={setRef1}
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              placeholder="2. Referans Maili"
              keyboardType="email-address"
              value={ref2}
              onChangeText={setRef2}
              placeholderTextColor="#999"
            />
          </>
        )}

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Kaydol</Text>
        </TouchableOpacity>

        <View style={styles.bottomLink}>
          <Text style={styles.signupText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.signupLinkBold}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

/* -------------- STYLES -------------- */
const LOGO_SIZE = 70;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  /* Üst Kısım: gradient + dalgalar + logo + yazılar */
  headerContainer: {
    position: 'relative',
    width: '100%',
    height: '40%', // Biraz artırarak metinlerin net görünmesini sağladık
    overflow: 'hidden',
  },
  topGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 15,
  },
  logoCircle: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logo: {
    width: LOGO_SIZE * 0.8,
    height: LOGO_SIZE * 0.8,
    borderRadius: LOGO_SIZE * 0.4,
    resizeMode: 'contain',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },

  waveWrapper1: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 80, // Yarı saydam dalga
  },
  waveWrapper2: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 90, // Beyaz dalga
  },

  /* Beyaz Kart Formu */
  formWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -30, // Dalgaya gömme
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 20,
    alignItems: 'center',
    // Gölge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pickerContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  picker: {
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#f75c5b',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomLink: {
    flexDirection: 'row',
    marginTop: 15,
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLinkBold: {
    color: '#f75c5b',
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
});
