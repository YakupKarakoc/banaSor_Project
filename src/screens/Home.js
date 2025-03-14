import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
// Eğer Bare workflow ise (ÖNERİLEN):
import Ionicons from 'react-native-vector-icons/Ionicons';

// Eğer linear-gradient kullanmak istiyorsan, şu paketi kur: 
// npm install react-native-linear-gradient
// npx react-native link react-native-linear-gradient
import LinearGradient from 'react-native-linear-gradient';

const HomeScreen = () => {
  const navigation = useNavigation();

  // Örnek kullanıcı adı
  const username = 'Yakup';

  const menuItems = [
    { label: 'Üniversiteler', icon: 'school-outline', onPress: () => {} },
    { label: 'Soru-Cevap', icon: 'chatbubbles-outline', onPress: () => {} },
    { label: 'Topluluklar', icon: 'people-outline', onPress: () => {} },
    { label: 'Favoriler', icon: 'star-outline', onPress: () => {} },
    { label: 'Etkinlikler', icon: 'calendar-outline', onPress: () => {} },
    { label: 'Mesajlar', icon: 'mail-outline', onPress: () => {} },
  ];

  const handleLogout = () => {
    navigation.navigate('Login');
  };

  return (
    <LinearGradient
      colors={['#f75c5b', '#ff8a5c']} // Kırmızıdan turuncuya
      style={styles.gradientContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Üst kısım - Kullanıcı bilgisi */}
        <View style={styles.header}>
          <Image
            source={require('../assets/images/banaSor_logo.jpg')}
            style={styles.logo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.welcomeText}>Hoş Geldin,</Text>
            <Text style={styles.usernameText}>{username}!</Text>
          </View>
          <TouchableOpacity
            style={styles.profileIconWrapper}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={40} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Arama kutusu */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#777" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Üniversite veya kullanıcı ara..."
            placeholderTextColor="#999"
          />
        </View>

        {/* Menü listesi */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons
                name={item.icon}
                size={26}
                color="#f75c5b"
                style={{ marginRight: 12 }}
              />
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Çıkış butonu */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

/* ------------------ STYLES ------------------ */
const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  container: {
    padding: 15,
  },
  header: {
    marginTop: 50,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  logo: {
    borderRadius: 25,

    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 10,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
  },
  usernameText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileIconWrapper: {
    // Ekstra style gerekirse
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f75c5b',
    borderRadius: 12,
    padding: 15,
    elevation: 2,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default HomeScreen;
