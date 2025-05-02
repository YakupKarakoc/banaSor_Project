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

export default function TopicListScreen({ navigation }) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('http://10.0.2.2:3000/api/soru/konu/getir')
      .then(res => setTopics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" />

  return (
    <View style={styles.container}>
      <FlatList
        data={topics}
        keyExtractor={t => t.konuid.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('QuestionList', {
                konuId: item.konuid,
                konuAd: item.ad,
              })
            }
          >
            <Text style={styles.text}>{item.ad}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
  text: { fontSize: 16 },
})
