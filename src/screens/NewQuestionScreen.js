import React, { useState } from 'react'
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  StyleSheet,
} from 'react-native'
import axios from 'axios'

export default function NewQuestionScreen({ route, navigation }) {
  const { konuId, konuAd } = route.params
  const [content, setContent] = useState('')

  const postQuestion = () => {
    if (!content.trim()) {
      return Alert.alert('Hata', 'Soru içeriği boş olamaz.')
    }
    axios
      .post('http://10.0.2.2:3000/api/soru/soruOlustur', {
        universiteId: null, // istersen route’dan ek parametre çekebilirsin
        bolumId: null,
        konuId,
        icerik: content,
      })
      .then(() => {
        Alert.alert('Başarılı', 'Soru eklendi.', [
          { text: 'Tamam', onPress: () => navigation.goBack() },
        ])
      })
      .catch(err => {
        console.error(err)
        Alert.alert('Hata', 'Soru eklenemedi.')
      })
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={`${konuAd} hakkında sorunuzu yazın...`}
        multiline
        value={content}
        onChangeText={setContent}
      />
      <TouchableOpacity style={styles.btn} onPress={postQuestion}>
        <Text style={styles.btnText}>Soruyu Gönder</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    flex: 1,
    textAlignVertical: 'top',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
  },
  btn: {
    backgroundColor: '#f75c5b',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: { color: '#fff', fontWeight: '600' },
})
