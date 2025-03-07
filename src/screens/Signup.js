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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

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
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hesap Oluştur</Text>
      </View>

      <View style={styles.formContainer}>
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

        <TextInput style={styles.input} placeholder="Ad Soyad" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="E-posta" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <TextInput style={styles.input} placeholder="Şifre" secureTextEntry value={password} onChangeText={setPassword} />
        <TextInput style={styles.input} placeholder="Şifreyi Onayla" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

        {role === 'mezun' && (
          <>
            <TextInput style={styles.input} placeholder="1. Referans Maili" keyboardType="email-address" value={ref1} onChangeText={setRef1} />
            <TextInput style={styles.input} placeholder="2. Referans Maili" keyboardType="email-address" value={ref2} onChangeText={setRef2} />
          </>
        )}

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.signupButtonText}>Kaydol</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signupContainer}>
          <Text style={styles.signupText}>Zaten hesabınız var mı? </Text>
          <Text style={styles.signupLinkBold}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#f75c5b',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingVertical: 50,
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 34,
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    justifyContent: 'center',
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  signupText: {
    color: '#333',
    fontSize: 14,
  },
  signupLinkBold: {
    color: '#f75c5b',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default SignupScreen;
