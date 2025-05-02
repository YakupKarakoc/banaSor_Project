// src/screens/QuestionNew.js

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'
import { useRoute, useNavigation } from '@react-navigation/native'

const BASE_URL = 'http://10.0.2.2:3000'

export default function QuestionNew() {
  const { universiteId, bolumId } = useRoute().params
  const navigation = useNavigation()

  const [konular, setKonular] = useState([])
  const [loadingKonular, setLoadingKonular] = useState(true)

  const [selectedKonu, setSelectedKonu] = useState('')
  const [icerik, setIcerik] = useState('')

  const [submitting, setSubmitting] = useState(false)

  // 1️⃣ Konuları yükle
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/soru/konu/getir`)
      .then(res => setKonular(res.data))
      .catch(() => Alert.alert('Hata', 'Konular yüklenemedi'))
      .finally(() => setLoadingKonular(false))
  }, [])

  // 2️⃣ Soruyu gönder
  const handleSubmit = async () => {
    if (!selectedKonu) {
      return Alert.alert('Hata', 'Lütfen bir konu seçin.')
    }
    if (!icerik.trim()) {
      return Alert.alert('Hata', 'Lütfen soruyu yazın.')
    }

    setSubmitting(true)
    try {
      await axios.post(`${BASE_URL}/api/soru/soruOlustur`, {
        universiteId,
        bolumId,
        konuId: selectedKonu,
        icerik: icerik.trim(),
      })
      Alert.alert('Başarılı', 'Sorunuz yayınlandı.', [
        { text: 'Tamam', onPress: () => navigation.goBack() }
      ])
    } catch {
      Alert.alert('Hata', 'Soru oluşturulamadı.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingKonular) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Konu</Text>
      <View style={styles.pickerBox}>
        <Picker
          selectedValue={selectedKonu}
          onValueChange={setSelectedKonu}
          style={styles.picker}
        >
          <Picker.Item label="Konu seçin..." value="" />
          {konular.map(k => (
            <Picker.Item
              key={k.konuid}
              label={k.ad}
              value={k.konuid}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Soru</Text>
      <TextInput
        style={[styles.input, { height: 120 }]}
        multiline
        placeholder="Sorunuzu buraya yazın..."
        placeholderTextColor="#999"
        value={icerik}
        onChangeText={setIcerik}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Soruyu Gönder</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
    fontWeight: '500',
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 24,
    textAlignVertical: 'top',
    color: '#333',
  },
  button: {
    backgroundColor: '#f75c5b',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
})
