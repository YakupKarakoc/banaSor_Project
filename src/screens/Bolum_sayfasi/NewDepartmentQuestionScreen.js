import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { getToken } from '../../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function NewDepartmentQuestionScreen() {
  const navigation = useNavigation();
  // Tüm olası id’leri karşılamak için alternatif keyler kontrol ediliyor
  const params = useRoute().params || {};
  const universiteId = params.universiteId || params.universiteid;
  const bolumId = params.bolumId || params.bolumid;

  const [konular, setKonular] = useState([]);
  const [selectedKonu, setSelectedKonu] = useState(null);
  const [icerik, setIcerik] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    fetchKonular();
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();
  }, []);

  const fetchKonular = async () => {
    try {
      const res = await axios.get(`${BASE}/api/soru/konu/getir`);
      setKonular(res.data);
    } catch (err) {
      console.error('Konu yükleme hatası:', err);
      Alert.alert('Hata', 'Konular yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedKonu) return Alert.alert('Hata', 'Lütfen bir konu seçin');
    if (!icerik.trim()) return Alert.alert('Hata', 'Sorunuzu girin');
    if (!universiteId || !bolumId) {
      return Alert.alert('Hata', 'Bölüm veya üniversite bilgisi eksik.');
    }

    setPosting(true);
    try {
      const token = await getToken();
      if (!token) throw new Error('Token bulunamadı.');

      // Anahtarlar backend’in istediği şekilde gönderiliyor (camelCase)
      await axios.post(
        `${BASE}/api/soru/soruOlustur`,
        {
          universiteId: Number(universiteId),
          bolumId: Number(bolumId),
          konuId: Number(selectedKonu),
          icerik: icerik.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('Başarılı', 'Soru oluşturuldu.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Soru oluşturma hatası:', err.response?.data || err.message);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message;
      Alert.alert('Hata', msg);
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
        <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.safe}>
          <ActivityIndicator size="large" color="#fff" style={{ marginTop: 100 }} />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.safe}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Yeni Bölüm Sorusu</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* FORM */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView contentContainerStyle={styles.form}>
            {/* Konu */}
            <Text style={styles.label}>Konu Seçin</Text>
            <View style={styles.topicGrid}>
              {konular.map(k => (
                <TouchableOpacity
                  key={k.konuid.toString()}
                  style={[
                    styles.topicChip,
                    selectedKonu === k.konuid && styles.topicChipActive
                  ]}
                  onPress={() => setSelectedKonu(k.konuid)}
                >
                  <Text style={[
                    styles.topicText,
                    selectedKonu === k.konuid && styles.topicTextActive
                  ]}>
                    {k.ad}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* İçerik */}
            <Text style={styles.label}>Sorunuz</Text>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Sorunuzu yazın..."
              value={icerik}
              onChangeText={setIcerik}
              maxLength={500}
            />
            <Text style={styles.charCount}>{icerik.length}/500</Text>

            {/* Gönder */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                (posting || !icerik.trim() || !selectedKonu) && styles.disabled
              ]}
              onPress={handleSubmit}
              disabled={posting || !icerik.trim() || !selectedKonu}
            >
              {posting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitText}>Soruyu Gönder</Text>
              }
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 48
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },

  formContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  form: { padding: 16 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  topicGrid: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 },
  topicChip: { padding: 8, backgroundColor: '#eee', borderRadius: 16, margin: 4 },
  topicChipActive: { backgroundColor: '#f75c5b' },
  topicText: { color: '#333' },
  topicTextActive: { color: '#fff' },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    minHeight: 80,
    textAlignVertical: 'top'
  },
  charCount: { textAlign: 'right', color: '#666', marginTop: 4 },

  submitBtn: {
    backgroundColor: '#f75c5b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16
  },
  disabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '700' }
});
