import React, { useState, useRef, useEffect } from 'react';
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

  // Form state
  const [role, setRole] = useState('aday');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ref1, setRef1] = useState('');
  const [ref2, setRef2] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start(handleSignup);
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      return Alert.alert('Hata', 'Şifreler eşleşmiyor!');
    }
    const turuId = role === 'aday' ? 0 : role === 'ogrenci' ? 1 : 2;
    try {
      const { data } = await axios.post(
        'http://10.0.2.2:3000/api/auth/register',
        {
          ad: name,
          soyad: surname,
          kullaniciAdi: username,
          email,
          sifre: password,
          kullaniciTuruId: turuId,
          referans1: role === 'mezun' ? ref1 : null,
          referans2: role === 'mezun' ? ref2 : null,
        }
      );
      if (data.error) {
        return Alert.alert('Hata', data.error);
      }
      Alert.alert('Tebrikler!', 'Kayıt başarılı.');
      // verification kodunu gönder
      const user = data.user;
      await axios.post('http://10.0.2.2:3000/api/auth/sendVerification', {
        kullaniciId: user.kullaniciid,
        email: user.email,
      });
      navigation.navigate('Verify', {
        kullaniciId: user.kullaniciid,
        email: user.email,
      });
    } catch (e) {
      Alert.alert('Sunucu Hatası', e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Arka plan gradient + soyut blob */}
      <LinearGradient
        colors={['#FF6B6B', '#FFD86B']}
        style={styles.background}
      >
        <Image
          source={require('../assets/images/banaSor_logo.jpg')}
          style={styles.heroLogo}
        />
      </LinearGradient>

      {/* Kayıt kartı */}
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
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.form}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Yeni Hesap Oluştur</Text>

          {/* Rol seçimi */}
          <View style={styles.field}>
            <Icon
              name="people-circle-outline"
              size={20}
              color="#777"
              style={styles.icon}
            />
            <Picker
              selectedValue={role}
              onValueChange={setRole}
              style={styles.picker}
            >
              <Picker.Item label="Aday Öğrenci" value="aday" />
              <Picker.Item label="Üniversite Öğrencisi" value="ogrenci" />
              <Picker.Item label="Mezun Öğrenci" value="mezun" />
            </Picker>
          </View>

          {/* Genel input alanları */}
          {[
            {
              placeholder: 'Adınız',
              value: name,
              setter: setName,
              icon: 'person-outline',
            },
            {
              placeholder: 'Soyadınız',
              value: surname,
              setter: setSurname,
              icon: 'people-outline',
            },
            {
              placeholder: 'Kullanıcı Adı',
              value: username,
              setter: setUsername,
              icon: 'at-outline',
            },
            {
              placeholder: 'E‑posta',
              value: email,
              setter: setEmail,
              icon: 'mail-outline',
              keyboard: 'email-address',
            },
            {
              placeholder: 'Şifre',
              value: password,
              setter: setPassword,
              icon: 'lock-closed-outline',
              secure: true,
            },
            {
              placeholder: 'Şifreyi Onayla',
              value: confirmPassword,
              setter: setConfirmPassword,
              icon: 'lock-open-outline',
              secure: true,
            },
          ].map((f, i) => (
            <View style={styles.field} key={i}>
              <Icon name={f.icon} size={20} color="#777" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder={f.placeholder}
                placeholderTextColor="#999"
                value={f.value}
                onChangeText={f.setter}
                keyboardType={f.keyboard || 'default'}
                secureTextEntry={f.secure || false}
              />
            </View>
          ))}

          {/* Mezun için referans e‑postaları */}
          {role === 'mezun' && (
            <>
              <View style={styles.field}>
                <Icon
                  name="mail-outline"
                  size={20}
                  color="#777"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Referans E‑posta 1"
                  placeholderTextColor="#999"
                  value={ref1}
                  onChangeText={setRef1}
                  keyboardType="email-address"
                />
              </View>
              <View style={styles.field}>
                <Icon
                  name="mail-outline"
                  size={20}
                  color="#777"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Referans E‑posta 2"
                  placeholderTextColor="#999"
                  value={ref2}
                  onChangeText={setRef2}
                  keyboardType="email-address"
                />
              </View>
            </>
          )}

          {/* Kayıt ol butonu */}
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Pressable
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Kayıt Ol</Text>
            </Pressable>
          </Animated.View>

          {/* Alt link */}
          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Zaten hesabınız var mı?</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
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
  container: {
    flex: 1,
    backgroundColor: '#F4F5F6',
  },
  background: {
    height: '30%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroLogo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 25,
    // soft shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  form: {
    paddingBottom: 40,
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
    backgroundColor: '#F0F0F3',
    borderRadius: 25,
    height: 50,
    marginBottom: 15,
    paddingLeft: 50,
  },
  icon: {
    position: 'absolute',
    left: 15,
    zIndex: 2,
  },
  picker: {
    flex: 1,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  button: {
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  bottomText: {
    color: '#666',
  },
  bottomLink: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
});
