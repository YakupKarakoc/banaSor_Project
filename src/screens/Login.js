import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Image source={require('../assets/images/banaSor_logo.jpg')} style={styles.logo} />
          <Text style={styles.appName}>banaSor</Text>
          <Text style={styles.welcome}>Hoş Geldin!</Text>
          <Text style={styles.subtitle}>Giriş yapmak için bilgilerini gir.</Text>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="E-posta"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Şifre"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor="#888"
          />
        </View>

        <TouchableOpacity style={styles.loginButton} activeOpacity={0.8}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.signupLink}>Hesabın yok mu? <Text style={styles.signupLinkBold}>Kayıt Ol</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 5,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f75c5b',
    marginBottom: 10,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    width: '95%',
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'left',
    paddingHorizontal: 20,
  },
  loginButton: {
    width: '95%',
    backgroundColor: '#f75c5b',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupLink: {
    marginTop: 15,
    color: '#777',
    fontSize: 14,
    textAlign: 'center',
  },
  signupLinkBold: {
    color: '#f75c5b',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
