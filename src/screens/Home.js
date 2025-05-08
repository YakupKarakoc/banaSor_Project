// src/screens/HomeScreen.js

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [user, setUser] = useState(route.params?.user || null);
  const [searchValue, setSearchValue] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
    }
  }, [route.params?.user]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const username = user?.kullaniciadi || 'Misafir';

  const menuItems = [
    {
      label: 'Üniversiteler',
      icon: 'school-outline',
      onPress: () => navigation.navigate('Universiteler'),
    },
    {
      label: 'Soru-Cevap',
      icon: 'chatbubbles-outline',
      onPress: () => navigation.navigate('Konular'),  // ← Burayı güncelledik
    },
    {
      label: 'Topluluklar',
      icon: 'people-outline',
      onPress: () => navigation.navigate('Forums'),  // eğer ForumList ekranınız "Forums" ise
    },
    {
      label: 'Favoriler',
      icon: 'star-outline',
      onPress: () => navigation.navigate('Favoriler'),
    },
    {
      label: 'Mesajlar',
      icon: 'mail-outline',
      onPress: () => navigation.navigate('Messages'), // Mesaj ekranınızın adı
    },
    {
      label: 'Profilim',
      icon: 'person-circle-outline',
      onPress: () => navigation.navigate('Profile', { user }),
    },
  ];

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.gradientContainer}>
      <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
        <Image source={require('../assets/images/banaSor_logo.jpg')} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.welcomeText}>Hoş Geldin,</Text>
          <Text style={styles.usernameText}>{username}!</Text>
        </View>
        <TouchableOpacity
          style={styles.profileIconWrapper}
          onPress={() => navigation.navigate('Profile', { user })}
        >
          <Ionicons name="person-circle-outline" size={42} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.searchContainer}
        >
          <Ionicons name="search-outline" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Üniversite veya kullanıcı ara..."
            placeholderTextColor="#999"
            value={searchValue}
            onChangeText={setSearchValue}
          />
        </Animatable.View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <Animatable.View key={idx} animation="fadeInUp" duration={600} delay={idx * 80}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color="#f75c5b"
                  style={{ marginRight: 12 }}
                />
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  gradientContainer: { 
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    marginTop: 50,
    marginHorizontal: 24,
    marginBottom: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logo: {
    borderRadius: 30,
    width: 55,
    height: 55,
    resizeMode: 'contain',
    marginRight: 15,
    backgroundColor: '#fff',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerText: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  welcomeText: { 
    color: '#fff', 
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  usernameText: { 
    color: '#fff', 
    fontSize: 22, 
    fontWeight: '700', 
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileIconWrapper: { 
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    marginLeft: 10,
  },
  scrollContent: { 
    paddingHorizontal: 24, 
    paddingBottom: 40 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  searchIcon: { 
    marginRight: 12,
    color: '#666'
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: '#333',
    fontWeight: '500',
  },
  menuContainer: { 
    marginBottom: 25 
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  menuText: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#2D3436',
    letterSpacing: 0.3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 16,
    justifyContent: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutText: { 
    fontSize: 17, 
    fontWeight: '600', 
    color: '#fff',
    letterSpacing: 0.5,
  },
});
