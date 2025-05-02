import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert
} from 'react-native'
import axios from 'axios'
import { useRoute, useNavigation } from '@react-navigation/native'

const BASE_URL = 'http://10.0.2.2:3000'

export default function ForumList() {
  const { universiteId, fakulteId, bolumId } = useRoute().params
  const navigation = useNavigation()
  const [forums, setForums] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const fetchForums = async () => {
    setLoading(true)
    try {
      const q = []
      if (universiteId) q.push(`universiteId=${universiteId}`)
      if (fakulteId)     q.push(`fakulteId=${fakulteId}`)
      if (bolumId)      q.push(`bolumId=${bolumId}`)
      const res = await axios.get(`${BASE_URL}/api/forum/getir?${q.join('&')}`)
      setForums(res.data)
    } catch {
      Alert.alert('Hata','Forumlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchForums() }, [])

  const createForum = async () => {
    if (!newTitle.trim()) return Alert.alert('Hata','Başlık girin')
    try {
      await axios.post(`${BASE_URL}/api/forum/forumEkle`, {
        baslik: newTitle,
        universiteId,
        fakulteId,
        bolumId
      })
      setModalVisible(false)
      setNewTitle('')
      fetchForums()
    } catch {
      Alert.alert('Hata','Forum oluşturulamadı')
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('ForumDetail', { forumId: item.forumid, baslik: item.baslik })}
    >
      <Text style={styles.title}>{item.baslik}</Text>
      <Text style={styles.count}>{item.entrySayisi} mesaj</Text>
    </TouchableOpacity>
  )

  if (loading) return (
    <View style={styles.center}><ActivityIndicator/></View>
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={forums}
        keyExtractor={f=>f.forumid.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Hiç forum yok.</Text>}
      />

      <TouchableOpacity style={styles.addBtn} onPress={()=>setModalVisible(true)}>
        <Text style={styles.addTxt}>+ Yeni Forum</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Yeni Forum Başlığı</Text>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Başlık girin"
              style={styles.input}
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={()=>setModalVisible(false)}>
                <Text style={styles.cancel}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={createForum}>
                <Text style={styles.ok}>Oluştur</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1, padding:16 },
  row:{ padding:12, borderBottomWidth:1, borderColor:'#eee' },
  title:{ fontSize:16 },
  count:{ fontSize:12, color:'#666' },
  empty:{ textAlign:'center', marginTop:20, color:'#666' },
  center:{ flex:1,justifyContent:'center',alignItems:'center' },
  addBtn:{ position:'absolute',right:20,bottom:30,backgroundColor:'#f75c5b',padding:12,borderRadius:25 },
  addTxt:{ color:'#fff',fontWeight:'bold' },

  modalBg:{ flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.5)' },
  modal:{ backgroundColor:'#fff',width:'80%',borderRadius:8,padding:16 },
  modalTitle:{ fontSize:18,fontWeight:'600',marginBottom:12 },
  input:{ borderWidth:1,borderColor:'#ddd',borderRadius:6,padding:8,marginBottom:12 },
  actions:{ flexDirection:'row',justifyContent:'flex-end' },
  cancel:{ marginRight:20,color:'#f75c5b' },
  ok:{ fontWeight:'bold',color:'#f75c5b' },
})
