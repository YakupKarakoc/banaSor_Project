import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert
} from 'react-native'
import axios from 'axios'
import { useRoute } from '@react-navigation/native'

const BASE_URL = 'http://10.0.2.2:3000'

export default function ForumDetail() {
  const { forumId, baslik } = useRoute().params
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [newEntry, setNewEntry] = useState('')

  const fetchEntries = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/forum/entryGetir`, { params:{ forumId }})
      setEntries(res.data)
    } catch {
      Alert.alert('Hata','Mesajlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchEntries() }, [])

  const addEntry = async () => {
    if (!newEntry.trim()) return Alert.alert('Hata','Mesaj girin')
    try {
      await axios.post(`${BASE_URL}/api/forum/entryEkle`, {
        forumId, icerik:newEntry
      })
      setNewEntry('')
      setModalVisible(false)
      fetchEntries()
    } catch {
      Alert.alert('Hata','Mesaj eklenemedi')
    }
  }

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.meta}>{item.kullaniciAdi} • {new Date(item.olusturmaTarihi).toLocaleString()}</Text>
      <Text style={styles.text}>{item.icerik}</Text>
    </View>
  )

  if (loading) return (
    <View style={styles.center}><ActivityIndicator/></View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{baslik}</Text>
      <FlatList
        data={entries}
        keyExtractor={e=>e.entryid.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Henüz mesaj yok.</Text>}
      />

      <TouchableOpacity style={styles.addBtn} onPress={()=>setModalVisible(true)}>
        <Text style={styles.addTxt}>+ Mesaj Yaz</Text>
      </TouchableOpacity>

      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Yeni Mesaj</Text>
            <TextInput
              value={newEntry}
              onChangeText={setNewEntry}
              placeholder="Mesajınızı yazın..."
              multiline
              style={[styles.input,{ height:80 }]}
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={()=>setModalVisible(false)}>
                <Text style={styles.cancel}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addEntry}>
                <Text style={styles.ok}>Gönder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container:{ flex:1,padding:16 },
  header:{ fontSize:18,fontWeight:'600',marginBottom:12 },
  row:{ padding:12, borderBottomWidth:1, borderColor:'#eee' },
  meta:{ fontSize:12,color:'#999', marginBottom:4 },
  text:{ fontSize:14 },
  empty:{ textAlign:'center', marginTop:20, color:'#666' },
  center:{ flex:1,justifyContent:'center',alignItems:'center' },
  addBtn:{ position:'absolute',right:20,bottom:30,backgroundColor:'#f75c5b',padding:12,borderRadius:25 },
  addTxt:{ color:'#fff',fontWeight:'bold' },

  modalBg:{ flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.5)' },
  modal:{ backgroundColor:'#fff',width:'80%',borderRadius:8,padding:16 },
  modalTitle:{ fontSize:18,fontWeight:'600',marginBottom:12 },
  input:{ borderWidth:1,borderColor:'#ddd',borderRadius:6,padding:8,marginBottom:12, textAlignVertical:'top' },
  actions:{ flexDirection:'row',justifyContent:'flex-end' },
  cancel:{ marginRight:20,color:'#f75c5b' },
  ok:{ fontWeight:'bold',color:'#f75c5b' },
})
