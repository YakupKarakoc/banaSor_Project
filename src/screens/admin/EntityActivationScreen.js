import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const BASE_URL = 'http://10.0.2.2:3000';

export default function EntityActivationScreen() {
  const isFocused = useIsFocused();

  const [unis, setUnis] = useState([]);
  const [selectedUni, setSelectedUni] = useState(null);
  const [facs, setFacs] = useState([]);
  const [loadingFac, setLoadingFac] = useState(false);
  const [deptMap, setDeptMap] = useState({});
  const [loadingDept, setLoadingDept] = useState({});
  const [expanded, setExpanded] = useState({});
  const [toggling, setToggling] = useState({});
  const [loading, setLoading] = useState(true);

  // 1) Token ve üniversiteleri yükleme
  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        Alert.alert('Yetki Hatası', 'Lütfen tekrar giriş yapın.');
        return;
      }
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setLoading(false);
      fetchUniversities();
    })();
  }, []);

  // 2) Üniversiteleri API'den çek
  const fetchUniversities = useCallback(() => {
    axios.get(`${BASE_URL}/api/education/university`)
      .then(res => setUnis(res.data || []))
      .catch(() => Alert.alert('Hata', 'Üniversiteler yüklenemedi.'));
  }, []);

  // 3) Fakülteleri çek ve 'aktifmi' -> 'aktifMi' map et
  const fetchFaculties = useCallback(() => {
    if (!selectedUni) return setFacs([]);
    setLoadingFac(true);
    axios.get(`${BASE_URL}/api/education/faculty`, { params: { universiteId: selectedUni } })
      .then(res => {
        const mapped = (res.data || []).map(f => ({
          ...f,
          aktifMi: f.aktifMi ?? f.aktifmi,
        }));
        setFacs(mapped);
      })
      .catch(() => Alert.alert('Hata', 'Fakülteler yüklenemedi.'))
      .finally(() => setLoadingFac(false));
  }, [selectedUni]);

  useEffect(() => {
    if (!loading) fetchFaculties();
  }, [loading, selectedUni, isFocused, fetchFaculties]);

  // 4) Bölümleri çek ve map et
  const fetchDepartments = useCallback(facId => {
    setLoadingDept(ld => ({ ...ld, [facId]: true }));
    axios.get(`${BASE_URL}/api/education/department`, { params: { fakulteId: facId } })
      .then(res => {
        const mapped = (res.data || []).map(d => ({
          ...d,
          aktifMi: d.aktifMi ?? d.aktifmi,
        }));
        setDeptMap(dm => ({ ...dm, [facId]: mapped }));
      })
      .catch(() => Alert.alert('Hata', 'Bölümler yüklenemedi.'))
      .finally(() => setLoadingDept(ld => ({ ...ld, [facId]: false })));
  }, []);

  useEffect(() => {
    Object.entries(expanded).forEach(([facId, open]) => {
      if (open) fetchDepartments(facId);
    });
  }, [expanded, isFocused, fetchDepartments]);

  // 5) Toggle fonksiyonu: aktifMi değerini tersine çevir ve backend'e gönder
  const toggleAktif = async (type, id) => {
    const key = `${type}:${id}`;
    setToggling(t => ({ ...t, [key]: true }));
    try {
      const list = type === 'fakulte' ? facs : (deptMap[Object.keys(expanded).find(f => expanded[f])] || []);
      const item = list.find(i => i[type === 'fakulte' ? 'fakulteid' : 'bolumid'] === id);
      const newStatus = !item.aktifMi;
      await axios.put(`${BASE_URL}/api/admin/${type}/aktifMi/${id}`, { aktifMi: newStatus });
      if (type === 'fakulte') fetchFaculties();
      else fetchDepartments(Object.keys(expanded).find(f => expanded[f]));
    } catch (err) {
      Alert.alert('Güncelleme Hatası', err.response?.data?.error || err.message);
    } finally {
      setToggling(t => ({ ...t, [key]: false }));
    }
  };

  const toggleExpand = facId => setExpanded(e => ({ ...e, [facId]: !e[facId] }));

  if (loading) {
    return <ActivityIndicator size="large" style={{ flex:1, justifyContent:'center' }} />;
  }

  // Fakülteleri aktif/pasif olarak ayır
  const activeFacs = facs.filter(f => f.aktifMi);
  const passiveFacs = facs.filter(f => !f.aktifMi);
  const facultySections = [
    { title: `Aktif Fakülteler (${activeFacs.length})`, data: activeFacs },
    { title: `Pasif Fakülteler (${passiveFacs.length})`, data: passiveFacs },
  ];

  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedUni} style={styles.picker} onValueChange={setSelectedUni}>
          <Picker.Item label="Üniversite seç…" value={null} />
          {unis.map(u => <Picker.Item key={u.universiteid} label={u.universiteadi} value={u.universiteid} />)}
        </Picker>
      </View>
      {loadingFac ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop:20 }} />
      ) : (
        <SectionList
          sections={facultySections}
          keyExtractor={item => String(item.fakulteid)}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
          renderItem={({ item }) => {
            const busy = toggling[`fakulte:${item.fakulteid}`];
            const isActive = item.aktifMi;
            const isOpen = expanded[item.fakulteid];
            const depts = deptMap[item.fakulteid] || [];
            const activeDepts = depts.filter(d => d.aktifMi);
            const passiveDepts = depts.filter(d => !d.aktifMi);
            const deptSections = [
              { title: `Aktif Bölümler (${activeDepts.length})`, data: activeDepts },
              { title: `Pasif Bölümler (${passiveDepts.length})`, data: passiveDepts },
            ];
            return (
              <View style={styles.group}>
                <TouchableOpacity style={[styles.row, !isActive && styles.passiveRow]} onPress={() => toggleExpand(item.fakulteid)}>
                  <Text style={[styles.label, !isActive && styles.passiveLabel]}>{item.fakulteadi}</Text>
                  <View style={styles.right}>
                    {busy ? (<ActivityIndicator color="#fff"/>) : (
                      <TouchableOpacity onPress={() => toggleAktif('fakulte', item.fakulteid)}>
                        <Icon name={isActive ? 'toggle' : 'toggle-outline'} size={28} color={isActive ? '#30d158' : '#bbb'} />
                      </TouchableOpacity>
                    )}
                    <Icon name={isOpen ? 'chevron-down' : 'chevron-forward'} size={20} color="#fff" style={{ marginLeft:8 }} />
                  </View>
                </TouchableOpacity>
                {isOpen && (loadingDept[item.fakulteid] ? (
                  <ActivityIndicator style={{ marginLeft:20 }} color="#fff" />
                ) : (
                  <SectionList
                    sections={deptSections}
                    keyExtractor={d => String(d.bolumid)}
                    renderSectionHeader={({ section: { title } }) => <Text style={styles.subSectionHeader}>{title}</Text>}
                    renderItem={({ item: d }) => {
                      const key = `bolum:${d.bolumid}`;
                      const isActiveDept = d.aktifMi;
                      const busyDept = toggling[key];
                      return (
                        <View style={[styles.row, styles.nested, !isActiveDept && styles.passiveRow]}>
                          <Text style={[styles.label, !isActiveDept && styles.passiveLabel]}>{d.bolumadi}</Text>
                          {busyDept ? (<ActivityIndicator color="#fff"/>) : (
                            <TouchableOpacity onPress={() => toggleAktif('bolum', d.bolumid)}>
                              <Icon name={isActiveDept ? 'toggle' : 'toggle-outline'} size={24} color={isActiveDept ? '#30d158' : '#bbb'} />
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    }}
                    contentContainerStyle={{ paddingBottom:20 }}
                  />
                ))}
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom:30 }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16 },
  pickerWrapper: { backgroundColor:'rgba(255,255,255,0.2)', borderRadius:8, marginBottom:16 },
  picker: { color:'#fff' },
  sectionHeader: { color:'#fff', fontSize:18, fontWeight:'700', marginVertical:8 },
  subSectionHeader: { color:'#fff', fontSize:16, fontWeight:'600', marginLeft:24, marginVertical:4 },
  group: { marginBottom:12 },
  row: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', backgroundColor:'rgba(255,255,255,0.2)', paddingVertical:12, paddingHorizontal:16, borderRadius:8 },
  nested: { marginLeft:24, marginTop:8, backgroundColor:'rgba(255,255,255,0.1)' },
  label: { color:'#fff', fontSize:16, flexShrink:1 },
  right: { flexDirection:'row', alignItems:'center' },
  passiveRow: { backgroundColor:'rgba(255,255,255,0.07)' },
  passiveLabel: { color:'#bbb' }
});
