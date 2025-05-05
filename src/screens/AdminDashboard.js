import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AdminDashboard = ({ route, navigation }) => {
  const user = route.params?.user;

  const username = user?.kullaniciadi ?? 'Admin';
  const role = user?.kullanicirolu ?? 'Admin';

  // Kartlar + içerik sayıları (mock olarak belirttik)
  const menuItems = [
    { label: 'Kullanıcı Yönetimi', icon: 'people-outline', screen: 'KullaniciYonetim', count: 34 },
    { label: 'Üniversite Yönetimi', icon: 'school-outline', screen: 'UniversiteYonetim', count: 12 },
    { label: 'Fakülte Yönetimi', icon: 'business-outline', screen: 'FakulteYonetim', count: 26 },
    { label: 'Soru Yönetimi', icon: 'help-circle-outline', screen: 'SoruYonetim', count: 120 },
    { label: 'Geri Bildirimler', icon: 'chatbox-ellipses-outline', screen: 'GeriBildirimler', count: 5 },
  ];

  const handleLogout = () => {
    navigation.replace('Login');
  };

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Admin Bilgi Kartı */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.username}>{username}</Text>
            <Text style={styles.role}>{role}</Text>
          </View>
        </View>

        {/* Yönetim Kartları */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={28} color="#f75c5b" style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>{item.label}</Text>
                <Text style={styles.menuSubText}>{item.count} içerik</Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Çıkış */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 60 },

  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 4,
  },
  avatar: {
    backgroundColor: '#f75c5b',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  username: { fontSize: 20, color: '#333', fontWeight: 'bold' },
  role: { fontSize: 14, color: '#888', marginTop: 4 },

  menuContainer: {},
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 2,
  },
  menuText: { fontSize: 16, color: '#333', fontWeight: '600' },
  menuSubText: { fontSize: 12, color: '#aaa', marginTop: 4 },

  badge: {
    backgroundColor: '#f75c5b',
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

  logoutButton: {
    backgroundColor: '#f75c5b',
    borderRadius: 12,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
  },
  logoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});