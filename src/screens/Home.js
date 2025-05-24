// src/screens/HomeScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [user, setUser] = useState(route.params?.user || null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  /* user update */
  useEffect(() => {
    if (route.params?.user) setUser(route.params.user);
  }, [route.params?.user]);

  /* smooth animations */
  useEffect(() => {
    Animated.timing(fadeAnim, { 
      toValue: 1, 
      duration: 800, 
      useNativeDriver: true 
    }).start();
  }, []);

  const username = user?.kullaniciadi || 'Misafir';
  const userFullName = user ? `${user.ad || ''} ${user.soyad || ''}`.trim() : '';

  /* —— CLEAN MENU —— */
  const menuItems = [
    {
      label: 'Üniversiteler',
      icon: 'school-outline',
      onPress: () => navigation.navigate('Universiteler'),
    },
    {
      label: 'Konular',
      icon: 'chatbubbles-outline', 
      onPress: () => navigation.navigate('Konular'),
    },
    {
      label: 'Topluluklar',
      icon: 'people-outline',
      onPress: () => navigation.navigate('GroupList'),
    },
    {
      label: 'Favoriler',
      icon: 'star-outline',
      onPress: () => navigation.navigate('Favoriler'),
    },
    {
      label: 'Profilim', 
      icon: 'person-circle-outline',
      onPress: () => navigation.navigate('Profile', { user }),
    },
    {
      label: 'Bana Ait',
      icon: 'folder-open-outline',
      onPress: () => navigation.navigate('MyContent'),
    },
  ];

  const handleLogout = () => navigation.replace('Login');

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.gradientContainer}>
        
        {/* ---------- CLEAN HEADER ---------- */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.header}>
          <Animated.View style={[styles.headerContent, { opacity: fadeAnim }]}>
            <View style={styles.logoContainer}>
              <View style={styles.logoShadow}>
                <Image source={require('../assets/images/banaSor_logo.jpg')} style={styles.logo}/>
              </View>
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Hoş Geldin</Text>
              <Text style={styles.usernameText}>{userFullName || username}</Text>
            </View>

            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile', { user })}
              activeOpacity={0.7}
            >
              <Ionicons name="person-circle-outline" size={32} color="#fff"/>
            </TouchableOpacity>
          </Animated.View>
        </Animatable.View>

        {/* ---------- MAIN CONTENT ---------- */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* Menu List */}
          <Animated.View style={[styles.menuContainer, { opacity: fadeAnim }]}>
            {menuItems.map((item, index) => (
              <Animatable.View 
                key={index} 
                animation="fadeInUp" 
                duration={600} 
                delay={index * 60}
                style={styles.menuItemWrapper}
              >
                <TouchableOpacity 
                  style={styles.menuItem} 
                  onPress={item.onPress} 
                  activeOpacity={0.8}
                >
                  <View style={styles.menuIcon}>
                    <Ionicons name={item.icon} size={24} color="#f75c5b"/>
                  </View>
                  <Text style={styles.menuText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ccc"/>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </Animated.View>

          {/* Logout Button */}
          <Animatable.View animation="fadeInUp" duration={800} delay={400}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={22} color="#fff" style={styles.logoutIcon}/>
              <Text style={styles.logoutText}>Çıkış Yap</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  // MAIN CONTAINERS
  safeContainer: {
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  gradientContainer: {
    flex: 1,
  },

  // CLEAN HEADER
  header: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    marginRight: 15,
  },
  logoShadow: {
    borderRadius: 30,
    backgroundColor: '#fff',
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  logo: {
    borderRadius: 24,
    width: 48,
    height: 48,
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  usernameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // CONTENT
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // CLEAN MENU
  menuContainer: {
    marginBottom: 30,
  },
  menuItemWrapper: {
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f75c5b20',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3436',
    letterSpacing: 0.3,
  },

  // LOGOUT
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: 0.4,
  },
});
