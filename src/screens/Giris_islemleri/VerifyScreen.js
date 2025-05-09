// src/screens/VerifyScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';

const BASE_URL = 'http://10.0.2.2:3000';

export default function VerifyScreen() {
  const { params } = useRoute();
  const { kullaniciId, email, role, username } = params;
  const navigation = useNavigation();

  const [kod, setKod] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!kod.trim()) {
      return Alert.alert('Hata', 'Lütfen kodu girin.');
    }
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/verifyCode`, {
        kullaniciId,
        kod,                            // backend expects `kod`, not `code`
      });

      // Rol bazlı yönlendirme
      if (role === 'aday') {
        Alert.alert('Başarılı', 'Hesabınız doğrulandı.', [
          { text: 'Tamam', onPress: () => navigation.replace('Login') },
        ]);
      } else if (role === 'ogrenci') {
        navigation.replace('StudentComplete', { email });
      } else {
        navigation.replace('GraduateComplete', { email, username });
      }
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.error || 'Doğrulama başarısız.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderModern}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.containerModern}>
      <Text style={styles.titleModern}>Mail Doğrulama</Text>
      <Text style={styles.infoModern}>{email} adresine gönderilen kodu girin.</Text>
      <TextInput
        style={styles.inputModern}
        placeholder="Doğrulama Kodu"
        placeholderTextColor="#f75c5b"
        keyboardType="number-pad"
        value={kod}
        onChangeText={setKod}
      />
      <TouchableOpacity style={styles.buttonModern} onPress={handleVerify}>
        <Text style={styles.btnTextModern}>Doğrula</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  containerModern: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  titleModern: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 14,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: 0.5,
  },
  infoModern: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 22,
    opacity: 0.92,
  },
  inputModern: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 22,
    fontSize: 17,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonModern: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
  },
  btnTextModern: {
    color: '#f75c5b',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  loaderModern: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
  },
});
