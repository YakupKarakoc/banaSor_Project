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
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FF8C00', '#FF3D00']} style={styles.container}>
      <Text style={styles.title}>Mail Doğrulama</Text>
      <Text style={styles.info}>{email} adresine gönderilen kodu girin.</Text>
      <TextInput
        style={styles.input}
        placeholder="Doğrulama Kodu"
        placeholderTextColor="#999"
        keyboardType="number-pad"
        value={kod}
        onChangeText={setKod}
      />
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.btnText}>Doğrula</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#FF3D00',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: {
    color: '#FF3D00',
    fontWeight: '600',
    fontSize: 16,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3D00',
  },
});
