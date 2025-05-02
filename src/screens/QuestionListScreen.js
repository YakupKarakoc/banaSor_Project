import React, { useEffect, useState } from 'react'
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native'
import axios from 'axios'

export default function QuestionListScreen({ route, navigation }) {
  const { konuId, konuAd } = route.params
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    navigation.setOptions({ title: konuAd })
    axios
      .get('http://10.0.2.2:3000/api/soru/getir', { params: { konuId } })
      .then(res => setQuestions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [konuId])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        keyExtractor={q => q.sorusid.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('QuestionDetail', { soruId: item.sorusid })
            }
          >
            <Text style={styles.title}>{item.icerik}</Text>
            <Text style={styles.meta}>
              {item.kullaniciadi} —{' '}
              {new Date(item.olusturmatarihi).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.newBtn}
        onPress={() =>
          navigation.navigate('NewQuestion', { konuId, konuAd })
        }
      >
        <Text style={styles.newBtnText}>Yeni Soru Sor</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 16, fontWeight: '500' },
  meta: { fontSize: 12, color: '#666', marginTop: 4 },
  newBtn: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#f75c5b',
    padding: 14,
    borderRadius: 28,
    elevation: 3,
  },
  newBtnText: { color: '#fff', fontWeight: '600' },
})
