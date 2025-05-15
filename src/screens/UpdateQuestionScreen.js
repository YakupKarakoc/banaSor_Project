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
} from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import IonIcon from 'react-native-vector-icons/Ionicons';

const BASE = 'http://10.0.2.2:3000';

export default function UpdateQuestionScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { soruId, mevcutIcerik } = route.params;

  const [icerik, setIcerik] = useState(mevcutIcerik);
  const [busy, setBusy]     = useState(false);

  const handleUpdate = async () => {
    if (!icerik.trim()) {
      return Alert.alert('Hata', 'Lütfen bir içerik girin.');
    }
    setBusy(true);
    try {
      await axios.patch(`${BASE}/api/soru/soruGuncelle/${soruId}`, {
        icerik: icerik.trim()
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <IonIcon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTxt}>Soruyu Güncelle</Text>
      </LinearGradient>

      <View style={styles.container}>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Sorunuzu buraya yazın…"
          placeholderTextColor="#999"
          value={icerik}
          onChangeText={setIcerik}
        />

        <TouchableOpacity
          style={[styles.saveBtn, busy && { opacity: 0.6 }]}
          onPress={handleUpdate}
          disabled={busy}
          activeOpacity={0.8}
        >
          {busy
            ? <ActivityIndicator color="#f75c5b" />
            : <Text style={styles.saveTxt}>Güncelle</Text>
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 16,
    paddingBottom: 16
  },
  backBtn: {
    marginRight: 12
  },
  headerTxt: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700'
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  input: {
    flex: 1,
    textAlignVertical: 'top',
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fafafa'
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#f75c5b',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700'
  }
});
