import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  FlatList, TouchableOpacity, ActivityIndicator,
  Modal, TextInput, Alert
} from 'react-native'
import axios from 'axios'
import { useRoute } from '@react-navigation/native'

const BASE_URL = 'http://10.0.2.2:3000'

export default function QuestionDetail() {
  const { soruId } = useRoute().params
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [newAnswer, setNewAnswer] = useState('')

  const fetchDetail = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`${BASE_URL}/api/soru/detay/${soruId}`)
      setDetail(res.data)
    } catch {
      Alert.alert('Hata','Detay yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDetail() }, [])

  const postAnswer = async () => {
    if (!newAnswer.trim()) return Alert.alert('Hata','Cevap girin')
    try {
      await axios.post(`${BASE_URL}/api/soru/cevapOlustur`, {
        soruId, icerik:newAnswer
      })
      setNewAnswer('')
      setModal(false)
      fetchDetail()
    } catch {
      Alert.alert('Hata','Cevap eklenemedi')
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator/></View>

  return (
    <View style={styles.container}>
      <ScrollView style={styles.questionBox}>
        <Text style={styles.qText}>{detail.icerik}</Text>
        <Text style={styles.qMeta}>{detail.soranKullaniciAdi} • {detail.begeniSayisi}👍</Text>
      </ScrollView>

      <FlatList
        data={detail.cevaplar}
        keyExtractor={a=>a.cevapid.toString()}
        renderItem={({item})=>(
          <View style={styles.row}>
            <Text style={styles.aText}>{item.icerik}</Text>
            <Text style={styles.aMeta}>{item.cevaplayanKullaniciAdi} • {item.likeSayisi}👍</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addBtn} onPress={()=>setModal(true)}>
        <Text style={styles.addTxt}>+ Cevap Yaz</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal transparent visible={modal} animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Yeni Cevap</Text>
            <TextInput
              value={newAnswer}
              onChangeText={setNewAnswer}
              multiline
              placeholder="Cevabınızı yazın..."
              style={[styles.input,{ height:80 }]}
            />
            <View style={styles.actions}>
              <TouchableOpacity onPress={()=>setModal(false)}>
                <Text style={styles.cancel}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={postAnswer}>
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
  container:{ flex:1 },
  questionBox:{ padding:16, backgroundColor:'#fff', borderBottomWidth:1, borderColor:'#eee' },
  qText:{ fontSize:16 },
  qMeta:{ fontSize:12,color:'#999',marginTop:8 },

  row:{ padding:12, borderBottomWidth:1,borderColor:'#eee' },
  aText:{ fontSize:14 },
  aMeta:{ fontSize:12,color:'#999',marginTop:6 },

  center:{ flex:1,justifyContent:'center',alignItems:'center' },
  addBtn:{ position:'absolute',right:20,bottom:30,backgroundColor:'#f75c5b',padding:12,borderRadius:25 },
  addTxt:{ color:'#fff',fontWeight:'bold' },

  modalBg:{ flex:1,justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.5)' },
  modal:{ backgroundColor:'#fff',width:'80%',borderRadius:8,padding:16 },
  modalTitle:{ fontSize:18,fontWeight:'600',marginBottom:12 },
  input:{ borderWidth:1,borderColor:'#ddd',borderRadius:6,padding:8,marginBottom:12,textAlignVertical:'top' },
  actions:{ flexDirection:'row',justifyContent:'flex-end' },
  cancel:{ marginRight:20,color:'#f75c5b' },
  ok:{ fontWeight:'bold',color:'#f75c5b' },
})
