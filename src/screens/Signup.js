import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SignupScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-left" size={28} color="#333" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kayıt Ol</Text>
        <Text style={styles.headerSubtitle}>Yeni bir hesap oluştur</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput style={styles.input} placeholder="Ad Soyad" />
        <TextInput style={styles.input} placeholder="E-posta" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Şifre" secureTextEntry />
        <TextInput style={styles.input} placeholder="Şifreyi Onayla" secureTextEntry />

        <TouchableOpacity style={styles.signupButton}>
          <Text style={styles.signupButtonText}>Kayıt Ol</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Zaten hesabın var mı? Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  header: {
    backgroundColor: '#f75c5b',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 25,
    marginBottom: 15,
    elevation: 3,
    fontSize: 16,
  },
  signupButton: {
    width: '100%',
    backgroundColor: '#f75c5b',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 15,
    color: '#f75c5b',
    fontWeight: 'bold',
  },
});

export default SignupScreen;
