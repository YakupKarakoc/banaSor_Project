import React, { useState } from 'react';
import { 
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';

const VerifyScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { kullaniciId, email } = route.params; // Kayıttan geliyor

  const [kod, setKod] = useState('');

  const handleVerify = async () => {
    try {
      const res = await axios.post('http://10.0.2.2:3000/api/auth/verifyCode', {
        kullaniciId,
        kod
      });

      if (res.data.error) {
        Alert.alert('Hata', res.data.error);
        return;
      }
      Alert.alert('Başarılı', 'E-posta doğrulandı!');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Sunucu Hatası', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>E-posta Doğrulama</Text>
      <Text style={styles.infoText}>
        {email} adresine gönderilen kodu giriniz:
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Doğrulama Kodu"
        value={kod}
        onChangeText={setKod}
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.verifyButton} onPress={handleVerify}>
        <Text style={styles.verifyButtonText}>Onayla</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerifyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  verifyButton: {
    backgroundColor: '#f75c5b',
    padding: 15,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
