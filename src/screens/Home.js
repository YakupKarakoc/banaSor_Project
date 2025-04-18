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
  console.log('Gelen user:', route.params?.user);

  const [searchValue, setSearchValue] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Kullanıcıyı state olarak sakla
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (route.params?.user) {
      setUser(route.params.user);
    }
  }, [route.params?.user]);

  const username = user?.kullaniciadi || 'Kullanıcı';

  const menuItems = [
    {
      label: 'Üniversiteler',
      icon: 'school-outline',
      onPress: () => navigation.navigate('Universiteler'),
    },
    {
      label: 'Soru-Cevap',
      icon: 'chatbubbles-outline',
      onPress: () => {},
    },
    {
      label: 'Topluluklar',
      icon: 'people-outline',
      onPress: () => {},
    },
    {
      label: 'Favoriler',
      icon: 'star-outline',
      onPress: () => {},
    },
    {
      label: 'Etkinlikler',
      icon: 'calendar-outline',
      onPress: () => {},
    },
    {
      label: 'Mesajlar',
      icon: 'mail-outline',
      onPress: () => {},
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
        <Animatable.View animation="fadeInUp" duration={800} delay={200} style={styles.searchContainer}>
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
          {menuItems.map((item, index) => (
            <Animatable.View key={index} animation="fadeInUp" duration={600} delay={index * 100}>
              <TouchableOpacity style={styles.menuItem} onPress={item.onPress} activeOpacity={0.7}>
                <Ionicons name={item.icon} size={24} color="#f75c5b" style={{ marginRight: 12 }} />
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

// styles kısmın zaten doğru, o kısmı değiştirmene gerek yok

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  header: {
    marginTop: 45,
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    borderRadius: 25,
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginRight: 10,
  },
  headerText: {
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
  },
  usernameText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuContainer: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
    borderRadius: 12,
    padding: 15,
    justifyContent: 'center',
    elevation: 2,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
