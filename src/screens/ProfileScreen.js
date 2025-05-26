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
  Switch,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.0.2.2:3000';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user: initialUser } = useRoute().params;

  // --- State'ler
  const [ad, setAd] = useState(initialUser.ad);
  const [soyad, setSoyad] = useState(initialUser.soyad);
  const [kullaniciAdi, setKullaniciAdi] = useState(initialUser.kullaniciAdi ?? initialUser.kullaniciadi);
  const [sifre, setSifre] = useState('');
  const [aktifMi, setAktifMi] = useState(
    typeof initialUser.aktifMi === "boolean"
      ? initialUser.aktifMi
      : initialUser.aktifmi
  );
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Animasyonlar
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = async () => {
    if (!ad.trim() || !soyad.trim() || !kullaniciAdi.trim()) {
      return Alert.alert('Hata', 'Ad, soyad ve kullanıcı adı boş bırakılamaz.');
    }

    // Değişiklik kontrolü
    const hasChanges = (
      ad !== initialUser.ad ||
      soyad !== initialUser.soyad ||
      (kullaniciAdi !== (initialUser.kullaniciAdi ?? initialUser.kullaniciadi)) ||
      (typeof initialUser.aktifMi === "boolean"
        ? aktifMi !== initialUser.aktifMi
        : aktifMi !== initialUser.aktifmi
      ) ||
      (sifre.trim() !== '')
    );

    if (!hasChanges) {
      return Alert.alert('Uyarı', 'Hiçbir değişiklik yapmadınız.');
    }

    setLoading(true);

    try {
      const body = {
        ad,
        soyad,
        kullaniciAdi,
        aktifMi,
      };

      if (sifre.trim()) {
        body.sifre = sifre;
      }

      console.log('Profil güncelleme body:', body);
      console.log('Şifre gönderiliyor mu?', !!body.sifre);

      const res = await axios.put(`${BASE_URL}/api/profil/guncelle`, body);

      console.log('API Response:', res.data);

      if (res?.data && typeof res.data === 'object' && res.data.kullanici) {
        const updatedUser = {
          ...initialUser,
          ...res.data.kullanici,
        };
        Alert.alert('Başarılı', res.data.mesaj || 'Profiliniz güncellendi.', [
          { text: 'Tamam', onPress: () => navigation.replace('Home', { user: updatedUser }) },
        ]);
      } else {
        const updatedUser = {
          ...initialUser,
          ad,
          soyad,
          kullaniciAdi,
          aktifMi,
        };
        Alert.alert('Başarılı', 'Profiliniz güncellendi.', [
          { text: 'Tamam', onPress: () => navigation.replace('Home', { user: updatedUser }) },
        ]);
      }
      setSifre('');
    } catch (e) {
      console.error('Profil güncelleme hatası:', e);
      console.error('Error details:', e.response?.data);

      let errorMsg = 'Güncelleme başarısız.';

      if (e.response?.data) {
        const data = e.response.data;
        errorMsg = data.mesaj || data.message || data.error || errorMsg;

        if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('şifre')) {
          errorMsg = 'Şifre güncelleme hatası: ' + errorMsg;
        }
      } else {
        errorMsg = e.message || errorMsg;
      }

      Alert.alert('Hata', errorMsg);
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <LinearGradient
      colors={['#f75c5b', '#ff8a5c']}
      style={styles.container}
    >
      <Animated.View style={[
        styles.content,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Profil Başlık */}
          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{ad?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={styles.name}>{ad} {soyad}</Text>
            <Text style={styles.username}>@{kullaniciAdi}</Text>
          </View>

          {/* Görüntüleme veya Düzenleme */}
          {!isEditing ? (
            <View style={styles.infoCard}>
              <InfoRow icon="person-outline" label="Ad Soyad" value={`${ad} ${soyad}`} />
              <InfoRow icon="at-outline" label="Kullanıcı Adı" value={kullaniciAdi} />
              <InfoRow icon="lock-closed-outline" label="Şifre" value="" />
              <InfoRow
                icon="radio-outline"
                label="Durum"
                value={aktifMi ? "Aktif" : "Pasif"}
                badgeColor={aktifMi ? '#4CAF50' : '#E53935'}
              />
            </View>
          ) : (
            <View style={styles.editForm}>
              <InputField icon="person-outline" label="Ad" value={ad} onChangeText={setAd} placeholder="Adınız" />
              <InputField icon="person-outline" label="Soyad" value={soyad} onChangeText={setSoyad} placeholder="Soyadınız" />
              <InputField icon="at-outline" label="Kullanıcı Adı" value={kullaniciAdi} onChangeText={setKullaniciAdi} placeholder="Kullanıcı Adı" />
              <InputField icon="lock-closed-outline" label="Yeni Şifre" value={sifre} onChangeText={setSifre} placeholder="Yeni Şifre" secureTextEntry />
              {/* Aktif/Pasif anahtarı */}
              <View style={[styles.row, { marginTop: 8, marginBottom: 4 }]}>
                <View style={styles.rowLeft}>
                  <Icon name="radio-outline" size={20} color="#666" style={styles.rowIcon} />
                  <Text style={styles.infoLabel}>Hesap Durumu</Text>
                </View>
                <View style={styles.switchRow}>
                  <Text style={{ color: aktifMi ? '#4CAF50' : '#E53935', fontWeight: '700', marginRight: 6 }}>
                    {aktifMi ? "Aktif" : "Pasif"}
                  </Text>
                  <Switch
                    value={aktifMi}
                    onValueChange={setAktifMi}
                    trackColor={{ false: "#e57373", true: "#81c784" }}
                    thumbColor={aktifMi ? "#fff" : "#fff"}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Düzenle/Kaydet Butonu */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#f75c5b" />
              : (
                <>
                  <Icon name={isEditing ? "save-outline" : "create-outline"} size={20} color="#f75c5b" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>{isEditing ? 'Kaydet' : 'Düzenle'}</Text>
                </>
              )
            }
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </LinearGradient>
  );
}

// Bilgi satırı (sadece gösterim)
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

// Input bileşeni
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

// Stil dosyası
const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
  scrollContent: { paddingBottom: 28, paddingHorizontal: 0 },
  header: { alignItems: 'center', paddingTop: 36, paddingBottom: 18 },
  avatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 10, elevation: 6,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', marginBottom: 10,
  },
  avatarText: { fontSize: 36, color: '#f75c5b', fontWeight: '700', letterSpacing: 1 },
  name: { fontSize: 22, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 2 },
  username: { fontSize: 14, color: '#fff', opacity: 0.9, textAlign: 'center', fontWeight: '500', letterSpacing: 0.5, marginBottom: 8 },
  infoCard: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { marginRight: 10 },
  infoLabel: { color: '#666', fontSize: 14, fontWeight: '500' },
  infoValue: { color: '#2D3436', fontSize: 14, fontWeight: '600', letterSpacing: 0.2 },
  badge: { color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, fontSize: 12, overflow: 'hidden', fontWeight: '600', letterSpacing: 0.3 },
  editForm: { marginHorizontal: 16 },
  inputContainer: { marginBottom: 14 },
  inputLabel: { color: '#fff', marginBottom: 6, fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, height: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: '#2D3436', fontWeight: '500' },
  button: {
    backgroundColor: '#fff', borderRadius: 20, paddingVertical: 12, alignItems: 'center',
    marginTop: 18, marginHorizontal: 16, flexDirection: 'row', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonIcon: { marginRight: 6 },
  buttonText: { color: '#f75c5b', fontWeight: '700', fontSize: 15, letterSpacing: 0.3 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
});

