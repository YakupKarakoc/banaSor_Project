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
        <View style={styles.logoShadow}>
          <Image source={require('../assets/images/banaSor_logo.jpg')} style={styles.logo} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.welcomeText}>Hoş Geldin,</Text>
          <Text style={styles.usernameText}>{username}!</Text>
        </View>
        <TouchableOpacity
          style={styles.profileIconWrapper}
          onPress={() => navigation.navigate('Profile', { user })}
        >
          <Ionicons name="person-circle-outline" size={38} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={200}
          style={styles.searchContainer}
        >
          <Ionicons name="search-outline" size={20} color="#f75c5b" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Üniversite veya kullanıcı ara..."
            placeholderTextColor="#bbb"
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
                activeOpacity={0.85}
              >
                <View style={styles.menuIconCircle}>
                  <Ionicons
                    name={item.icon}
                    size={22}
                    color="#fff"
                  />
                </View>
                <Text style={styles.menuText}>{item.label}</Text>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        <Animatable.View animation="pulse" iterationCount="infinite" duration={3000}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
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
    marginTop: 36,
    marginHorizontal: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoShadow: {
    borderRadius: 32,
    backgroundColor: '#fff',
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 6,
    marginRight: 12,
  },
  logo: {
    borderRadius: 24,
    width: 44,
    height: 44,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  headerText: { 
    flex: 1, 
    justifyContent: 'center' 
  },
  welcomeText: { 
    color: '#fff', 
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.95,
    marginBottom: 1,
  },
  usernameText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: '700', 
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileIconWrapper: { 
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 18,
    marginLeft: 8,
  },
  scrollContent: { 
    paddingHorizontal: 16, 
    paddingBottom: 28 
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { 
    marginRight: 10,
    color: '#f75c5b',
  },
  searchInput: { 
    flex: 1, 
    fontSize: 15, 
    color: '#333',
    fontWeight: '500',
  },
  menuContainer: { 
    marginBottom: 18 
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 13,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  menuIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#2D3436',
    letterSpacing: 0.2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: { 
    fontSize: 15, 
    fontWeight: '700', 
    color: '#fff',
    letterSpacing: 0.4,
  },
});
