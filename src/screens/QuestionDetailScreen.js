import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import axios from 'axios'

export default function QuestionDetailScreen({ route }) {
  const { soruId } = route.params
  const [detail, setDetail] = useState(null)
  const [newAnswer, setNewAnswer] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchDetail = () => {
    axios
      .get(`http://10.0.2.2:3000/api/soru/detay/${soruId}`)
      .then(res => setDetail(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(fetchDetail, [])

  const postAnswer = () => {
    if (!newAnswer.trim()) return
    axios
      .post('http://10.0.2.2:3000/api/soru/cevapolustur', {
        soruId,
        icerik: newAnswer,
      })
      .then(() => {
        setNewAnswer('')
        fetchDetail()
      })
      .catch(console.error)
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />

  return (
    <View style={styles.container}>
      <Text style={styles.qTitle}>{detail.icerik}</Text>
      <Text style={styles.meta}>
        Soruyu soran: {detail.sorankullaniciadi}
      </Text>
      <Text style={styles.likes}>👍 {detail.begenisayisi}</Text>

      <Text style={styles.sub}>Cevaplar</Text>
      <FlatList
        data={detail.cevaplar}
        keyExtractor={c => c.cevapid.toString()}
        renderItem={({ item }) => (
          <View style={styles.answer}>
            <Text style={styles.answerText}>{item.icerik}</Text>
            <Text style={styles.answerMeta}>
              — {item.cevaplayankullaniciadi}
            </Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={newAnswer}
          onChangeText={setNewAnswer}
          placeholder="Cevabınızı yazın..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={postAnswer}>
          <Text style={styles.sendText}>Gönder</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  qTitle: { fontSize: 18, fontWeight: '600' },
  meta: { color: '#666', marginVertical: 4 },
  likes: { color: '#f75c5b', marginBottom: 12 },
  sub: { fontSize: 16, fontWeight: '600', marginTop: 12 },
  answer: { padding: 10, borderBottomWidth: 1, borderColor: '#eee' },
  answerText: { fontSize: 14 },
  answerMeta: { fontSize: 12, color: '#666', marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 40,
  },
  sendBtn: {
    backgroundColor: '#f75c5b',
    padding: 10,
    borderRadius: 20,
    marginLeft: 8,
  },
  sendText: { color: '#fff' },
})
