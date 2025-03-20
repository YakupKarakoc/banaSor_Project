import React, { useState, useRef } from 'react';
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import axios from 'axios';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Buton basma animasyonu için
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:3000/api/auth/login', {
        email,
        sifre: password,
      });

      // Eğer backend 'success' yerine 'message' ve 'token' döndürüyorsa:
      if (res.data.error) {
        Alert.alert('Hata', res.data.error);
        return;
      }

      Alert.alert('Başarılı', 'Giriş yapıldı!');
      // Giriş başarılı, anasayfaya yönlendir
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Sunucu hatası', error.message);
    }
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start(async () => {
      // Animasyon bitince handleLogin fonksiyonunu çağır
      await handleLogin();
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Üst alan (gradient + dalgalar + logo + yazılar) */}
        <View style={styles.headerContainer}>
          <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.topGradient}>
            <View style={styles.logoCircle}>
              <Image
                source={require('../assets/images/banaSor_logo.jpg')}
                style={styles.logo}
              />
            </View>
            <Text style={styles.appName}>banaSor</Text>

            <Text style={styles.welcome}>Hoş Geldin!</Text>
            <Text style={styles.subtitle}>Giriş yapmak için bilgilerini gir.</Text>
          </LinearGradient>

          {/* Dalga Katmanı #1 (Yarı saydam) */}
          <View style={styles.waveWrapper1}>
            <Svg width="100%" height="100%" viewBox="0 0 1440 320">
              <Path
                fill="rgba(255,255,255,0.5)"
                d="M0,256L48,224C96,192,192,128,288,122.7C384,117,480,171,576,197.3C672,224,768,224,864,202.7C960,181,1056,139,1152,149.3C1248,160,1344,224,1392,256L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </Svg>
          </View>

          {/* Dalga Katmanı #2 (Beyaz) */}
          <View style={styles.waveWrapper2}>
            <Svg width="100%" height="100%" viewBox="0 0 1440 320">
              <Path
                fill="#fff"
                d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,186.7C672,171,768,117,864,112C960,107,1056,149,1152,154.7C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              />
            </Svg>
          </View>
        </View>

        {/* ALT BEYAZ KART (Form) */}
        <View style={styles.formCard}>
          <View style={styles.inputContainer}>
            {/* E-posta */}
            <View style={styles.iconInputWrapper}>
              <Text style={styles.icon}>📧</Text>
              <TextInput
                style={[styles.input, { paddingLeft: 45 }]}
                placeholder="E-posta"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#888"
              />
            </View>

            {/* Şifre */}
            <View style={styles.iconInputWrapper}>
              <Text style={styles.icon}>🔒</Text>
              <TextInput
                style={[styles.input, { paddingLeft: 45 }]}
                placeholder="Şifre"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#888"
              />
            </View>
          </View>

          {/* Animasyonlu Buton */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <Pressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={({ pressed }) => [
                styles.loginButton,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.loginButtonText}>Giriş Yap</Text>
            </Pressable>
          </Animated.View>

          <View style={styles.bottomText}>
            <Text style={styles.signupText}>Hesabınız yok mu? </Text>
            <Pressable onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLinkBold}>Kayıt Ol</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;

/* ----------------- STYLES ----------------- */
const LOGO_SIZE = 70;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  /* ÜST ALAN (GRADIENT + DALGALAR + LOGO + YAZILAR) */
  headerContainer: {
    position: 'relative',
    width: '100%',
    height: '40%', // Biraz arttırdık, metin dalgaya girmesin
    overflow: 'hidden',
  },
  topGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
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
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  welcome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2,
    marginBottom: 8,
  },

  /* DALGALAR */
  waveWrapper1: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
  },
  waveWrapper2: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 110,
  },

  /* ALT BEYAZ KART */
  formCard: {
    flex: 1,
    marginTop: -50,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    // Gölge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  inputContainer: {
    width: '100%',
    marginTop: 30,
  },
  iconInputWrapper: {
    position: 'relative',
    marginBottom: 15,
  },
  icon: {
    position: 'absolute',
    left: 15,
    top: 15,
    fontSize: 18,
    zIndex: 2,
  },
  input: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 25,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#f75c5b',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomText: {
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
