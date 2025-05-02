import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, Alert
} from 'react-native'
import axios from 'axios'
import { useRoute, useNavigation } from '@react-navigation/native'

const BASE_URL = 'http://10.0.2.2:3000'

export default function QuestionList() {
  const { universiteId, bolumId } = useRoute().params
  const navigation = useNavigation()
  const [qs, setQs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchQs = async () => {
    setLoading(true)
    try {
      const params = { universiteId, bolumId }
      const res = await axios.get(`${BASE_URL}/api/soru/getir`, { params })
      setQs(res.data)
    } catch {
      Alert.alert('Hata','Sorular yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchQs() }, [])

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('QuestionDetail',{ soruId:item.soruid })}
    >
      <Text style={styles.title}>{item.icerik}</Text>
      <Text style={styles.meta}>{item.kullaniciadi} • {item.begeniSayisi}👍</Text>
    </TouchableOpacity>
  )

  if (loading) return <View style={styles.center}><ActivityIndicator/></View>

  return (
    <View style={styles.container}>
      <FlatList
        data={qs}
        keyExtractor={q=>q.soruid.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Hiç soru yok.</Text>}
      />
      <TouchableOpacity style={styles.addBtn}
        onPress={()=>navigation.navigate('QuestionNew',{ universiteId, bolumId })}
      >
        <Text style={styles.addTxt}>+ Soru Sor</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1,padding:16 },
  row:{ padding:12, borderBottomWidth:1, borderColor:'#eee' },
  title:{ fontSize:15 },
  meta:{ fontSize:12,color:'#999',marginTop:4 },
  empty:{ textAlign:'center', marginTop:20, color:'#666' },
  center:{ flex:1,justifyContent:'center',alignItems:'center' },
  addBtn:{ position:'absolute',right:20,bottom:30,backgroundColor:'#f75c5b',padding:12,borderRadius:25 },
  addTxt:{ color:'#fff',fontWeight:'bold' },
})
