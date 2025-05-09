import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user: initialUser } = useRoute().params;

  const [ad, setAd] = useState(initialUser.ad);
  const [soyad, setSoyad] = useState(initialUser.soyad);
  const [kullaniciAdi, setKullaniciAdi] = useState(initialUser.kullaniciadi);
  const [sifre, setSifre] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animasyonlar için
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSave = async () => {
    if (!ad.trim() || !soyad.trim() || !kullaniciAdi.trim()) {
      return Alert.alert('Hata', 'Ad, soyad ve kullanıcı adı boş bırakılamaz.');
    }

    if (ad === initialUser.ad && soyad === initialUser.soyad && kullaniciAdi === initialUser.kullaniciadi && !sifre.trim()) {
      return Alert.alert("Uyarı", "Hiçbir değişiklik yapmadınız.");
    }

    setLoading(true);
    try {
      const body = { ad, soyad, kullaniciAdi };
      if (sifre.trim()) body.sifre = sifre;

      const res = await axios.put(`${BASE_URL}/api/profil/guncelle`, body);

      const updatedUser = {
        ...initialUser,
        ad: res.data.kullanici.ad,
        soyad: res.data.kullanici.soyad,
        kullaniciadi: res.data.kullanici.kullaniciadi,
      };

      Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.replace('Home', { user: updatedUser }) },
      ]);
    } catch (e) {
      Alert.alert('Hata', e.response?.data?.mesaj || 'Güncelleme başarısız.');
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <LinearGradient 
      colors={['#f75c5b', '#ff8a5c']} 
      start={{x: 0, y: 0}} 
      end={{x: 1, y: 1}} 
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{ad?.charAt(0)}</Text>
              </View>
              <View style={styles.avatarBadge}>
                <Icon name="checkmark-circle" size={20} color="#fff" />
              </View>
            </View>
            <Text style={styles.name}>{ad} {soyad}</Text>
            <Text style={styles.username}>@{kullaniciAdi}</Text>
          </View>

          {!isEditing ? (
            <View style={styles.infoCard}>
              <InfoRow 
                icon="person-outline" 
                label="Kullanıcı Türü" 
                value={initialUser.kullanicirolu} 
              />
              <InfoRow 
                icon="calendar-outline" 
                label="Kayıt Tarihi" 
                value={new Date(initialUser.olusturmatarihi).toLocaleDateString()} 
              />
              <InfoRow 
                icon="radio-outline" 
                label="Durum" 
                value={initialUser.aktifmi ? "Aktif" : "Pasif"} 
                badgeColor={initialUser.aktifmi ? '#4CAF50' : '#E53935'} 
              />
              <InfoRow 
                icon="shield-checkmark-outline" 
                label="Doğrulama" 
                value={initialUser.onaylandimi ? "Doğrulandı" : "Beklemede"} 
                badgeColor={initialUser.onaylandimi ? '#4CAF50' : '#FF9800'} 
              />
              <InfoRow 
                icon="star-outline" 
                label="Puan" 
                value={initialUser.puan ?? 0} 
              />
            </View>
          ) : (
            <View style={styles.editForm}>
              <InputField
                icon="person-outline"
                label="Ad"
                value={ad}
                onChangeText={setAd}
                placeholder="Adınız"
              />
              <InputField
                icon="person-outline"
                label="Soyad"
                value={soyad}
                onChangeText={setSoyad}
                placeholder="Soyadınız"
              />
              <InputField
                icon="at-outline"
                label="Kullanıcı Adı"
                value={kullaniciAdi}
                onChangeText={setKullaniciAdi}
                placeholder="Kullanıcı Adınız"
              />
              <InputField
                icon="lock-closed-outline"
                label="Yeni Şifre"
                value={sifre}
                onChangeText={setSifre}
                placeholder="Yeni Şifre"
                secureTextEntry
              />
            </View>
          )}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon 
                  name={isEditing ? "save-outline" : "create-outline"} 
                  size={20} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {isEditing ? 'Kaydet' : 'Düzenle'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

const InfoRow = ({ icon, label, value, badgeColor }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <Icon name={icon} size={20} color="#666" style={styles.rowIcon} />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    {badgeColor ? (
      <Text style={[styles.badge, { backgroundColor: badgeColor }]}>{value}</Text>
    ) : (
      <Text style={styles.infoValue}>{value}</Text>
    )}
  </View>
);

const InputField = ({ icon, label, value, onChangeText, placeholder, secureTextEntry }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Icon name={icon} size={20} color="#666" style={styles.inputIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: { 
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: { 
    fontSize: 52, 
    color: '#f75c5b', 
    fontWeight: '700',
    letterSpacing: 1,
  },
  name: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#fff', 
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  username: { 
    fontSize: 18, 
    color: '#fff', 
    opacity: 0.9, 
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  infoCard: { 
    backgroundColor: '#fff', 
    marginHorizontal: 20,
    borderRadius: 24, 
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: 12,
  },
  infoLabel: { 
    color: '#666', 
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: { 
    color: '#2D3436', 
    fontSize: 16, 
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  badge: { 
    color: '#fff', 
    paddingHorizontal: 16, 
    paddingVertical: 6, 
    borderRadius: 20, 
    fontSize: 14, 
    overflow: 'hidden',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  editForm: {
    marginHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: { 
    color: '#fff', 
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 55,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: { 
    flex: 1,
    fontSize: 16,
    color: '#2D3436',
    fontWeight: '500',
  },
  button: { 
    backgroundColor: '#fff', 
    borderRadius: 30, 
    paddingVertical: 16, 
    alignItems: 'center', 
    marginTop: 30,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: { 
    color: '#f75c5b', 
    fontWeight: '700', 
    fontSize: 18,
    letterSpacing: 0.5,
  },
});