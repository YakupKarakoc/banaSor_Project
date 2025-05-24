// src/screens/UpdateQuestionScreen.js

import React, { useState } from 'react';
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
  StatusBar,
  SafeAreaView,
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { getToken } from '../utils/auth';

const BASE = 'http://10.0.2.2:3000';

export default function UpdateQuestionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { soruId, mevcutIcerik } = route.params;

  const [icerik, setIcerik] = useState(mevcutIcerik);
  const [busy, setBusy]     = useState(false);

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const handleUpdate = async () => {
    if (!icerik.trim()) {
      return Alert.alert('Hata', 'Lütfen bir içerik girin.');
    }
    setBusy(true);
    try {
      const token = await getToken();
      await axios.patch(`${BASE}/api/soru/soruGuncelle/${soruId}`, {
        icerik: icerik.trim()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Alert.alert('Başarılı', 'Soru güncellendi.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Hata', 'Güncelleme başarısız oldu.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.gradient}>
          
          {/* Premium Header */}
          <View style={styles.modernHeader}>
            <View style={styles.headerContent}>
              <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
                <IonIcon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.modernHeaderTitle}>Soruyu Güncelle</Text>
                <Text style={styles.modernHeaderSubtitle}>Düzenleme Modu</Text>
              </View>
              <View style={styles.modernHeaderIcon}>
                <IonIcon name="help-circle" size={24} color="#fff" />
              </View>
            </View>
          </View>

          {/* Modern Content Card */}
          <View style={styles.modernContentCard}>
            <View style={styles.modernCardHeader}>
              <View style={styles.modernCardIconContainer}>
                <IonIcon name="help-circle" size={20} color="#fff" />
              </View>
              <View style={styles.modernCardInfo}>
                <Text style={styles.modernCardTitle}>Soru İçeriği</Text>
                <Text style={styles.modernCardSubtitle}>Sorunuzu düzenleyin</Text>
              </View>
            </View>

            <View style={styles.modernInputContainer}>
              <Text style={styles.modernInputLabel}>Soru Metni</Text>
              <TextInput
                style={styles.modernTextInput}
                multiline
                placeholder="Sorunuzu buraya yazın..."
                placeholderTextColor="#999"
                value={icerik}
                onChangeText={setIcerik}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.modernCharCounter}>
                {icerik?.length || 0}/500 karakter
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modernUpdateBtn, busy && styles.modernUpdateBtnDisabled]}
              onPress={handleUpdate}
              disabled={busy || !icerik?.trim()}
              activeOpacity={0.8}
            >
              {busy ? (
                <View style={styles.modernLoadingContainer}>
                  <ActivityIndicator color="#fff" size="small" />
                  <Text style={styles.modernUpdateBtnText}>Güncelleniyor...</Text>
                </View>
              ) : (
                <View style={styles.modernUpdateContainer}>
                  <IonIcon name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.modernUpdateBtnText}>Soruyu Güncelle</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // MAIN CONTAINERS
  safeContainer: {
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },

  // PREMIUM HEADER
  modernHeader: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  modernHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  modernHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // MODERN CONTENT CARD
  modernContentCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    paddingTop: 25,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  modernCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modernCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6c5ce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modernCardInfo: {
    flex: 1,
  },
  modernCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modernCardSubtitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },

  // MODERN INPUT
  modernInputContainer: {
    flex: 1,
    marginBottom: 20,
  },
  modernInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  modernTextInput: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
    borderWidth: 2,
    borderColor: '#e9ecef',
    textAlignVertical: 'top',
  },
  modernCharCounter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // MODERN BUTTON
  modernUpdateBtn: {
    backgroundColor: '#6c5ce7',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  modernUpdateBtnDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  modernLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernUpdateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernUpdateBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 8,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
