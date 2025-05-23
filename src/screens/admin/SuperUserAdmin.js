// src/screens/admin/SuperUserAdmin.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';
const TAB_LIST = [
  { key: 'forum', label: 'Forumlar' },
  { key: 'soru',  label: 'Sorular' },
  { key: 'grup',  label: 'Gruplar' },
];

export default function AdminPanelScreen({ navigation, route }) {
  const { token, user } = route.params || {};

  // Ana veri
  const [activeTab,    setActiveTab]    = useState('forum');
  const [loading,      setLoading]      = useState(false);
  const [forums,       setForums]       = useState([]);
  const [sorular,      setSorular]      = useState([]);
  const [gruplar,      setGruplar]      = useState([]);

  // Kullanıcı listesi modal
  const [showUsers,    setShowUsers]    = useState(false);
  const [userFilter,   setUserFilter]   = useState('all');    // 'all'|'mezun'|'admin'
  const [searchName,   setSearchName]   = useState('');
  const [users,        setUsers]        = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [toggling,     setToggling]     = useState({});      // { [id]: boolean }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [fRes, sRes, gRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/forum/getir`,   { headers:{ Authorization:`Bearer ${token}` } }),
        axios.get(`${BASE_URL}/api/soru/getir`,    { headers:{ Authorization:`Bearer ${token}` } }),
        axios.get(`${BASE_URL}/api/grup/grupList`, { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      setForums(  (fRes.data||[]).filter(f => f.forumid!=null) );
      setSorular((sRes.data||[]).filter(s => s.soruid!=null) );
      setGruplar((gRes.data.gruplar||[]).filter(g => g.grupid!=null));
    } catch (e) {
      Alert.alert('Hata', 'Veriler alınamadı: ' + (e.response?.data?.message || e.message));
    } finally {
      setLoading(false);
    }
  }

   const handleDeleteForum = id => {
    Alert.alert('Forum Sil', 'Bu forumu silmek istiyor musunuz?', [
      { text:'İptal', style:'cancel' },
      { text:'Sil', style:'destructive', onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/admin/forum/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
            setForums(prev=>prev.filter(f=>f.forumid!==id));
            Alert.alert('Başarılı','Forum silindi.');
          } catch(e) {
            Alert.alert('Hata', e.response?.data?.message||e.message);
          }
      }}
    ]);
  };
  const handleDeleteSoru = id => { /* aynı pattern */
    Alert.alert('Soru Sil', 'Bu soruyu silmek istiyor musunuz?', [
      { text:'İptal', style:'cancel' },
      { text:'Sil', style:'destructive', onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/admin/soru/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
            setSorular(prev=>prev.filter(s=>s.soruid!==id));
            Alert.alert('Başarılı','Soru silindi.');
          } catch(e) {
            Alert.alert('Hata', e.response?.data?.message||e.message);
          }
      }}
    ]);
  };
  const handleDeleteGrup = id => {
    Alert.alert('Grup Sil', 'Bu grubu silmek istiyor musunuz?', [
      { text:'İptal', style:'cancel' },
      { text:'Sil', style:'destructive', onPress: async () => {
          try {
            await axios.delete(`${BASE_URL}/api/admin/grup/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
            setGruplar(prev=>prev.filter(g=>g.grupid!==id));
            Alert.alert('Başarılı','Grup silindi.');
          } catch(e) {
            Alert.alert('Hata', e.response?.data?.message||e.message);
          }
      }}
    ]);
  };


  // Kullanıcıları çek
  async function fetchUsers() {
    setUsersLoading(true);
    try {
      let endpoint = '/api/admin/kullanici/listele';
      if (userFilter === 'mezun') endpoint = '/api/admin/kullanici/mezunListele';
      if (userFilter === 'admin') endpoint = '/api/admin/kullanici/adminListele';

      const res = await axios.get(`${BASE_URL}${endpoint}`, {
        headers:{ Authorization:`Bearer ${token}` },
        params: searchName ? { kullaniciAdi: searchName } : {}
      });

      const list = Array.isArray(res.data)
        ? (res.data[0]?.user ? res.data.map(r => r.user) : res.data)
        : [];
      setUsers(list);
    } catch {
      Alert.alert('Hata','Kullanıcılar yüklenemedi');
    } finally {
      setUsersLoading(false);
    }
  }
  // sayfanın üst kısmında, diğer handler’larla beraber:
const handleRemoveAdmin = async id => {
  Alert.alert(
    'Adminlikten Çıkar',
    'Bu kullanıcıyı adminlikten çıkarmak istediğinize emin misiniz?',
    [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkar',
        style: 'destructive',
        onPress: async () => {
          setToggling(t => ({ ...t, [id]: true }));
          try {
            await axios.post(
              `${BASE_URL}/api/admin/adminliktenCikarma`,
              { kullaniciId: id },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers(); // listeyi yenile
          } catch (e) {
            Alert.alert('Hata', e.response?.data?.mesaj || e.message);
          } finally {
            setToggling(t => ({ ...t, [id]: false }));
          }
        }
      }
    ]
  );
};

  const onPressListe = () => {
    setShowUsers(true);
    setSearchName('');
    setUserFilter('all');
    fetchUsers();
  };
  const onBackFromUsers = () => {
    setShowUsers(false);
    setUsers([]);
  };

  // ——— Kullanıcı aktif/pasif toggle handler ———
  const handleToggleUser = async (id, yeniDurum) => {
    setToggling(prev => ({ ...prev, [id]: true }));
    setUsers(prev =>
      prev.map(u => u.kullaniciid === id ? { ...u, aktifmi: yeniDurum } : u)
    );

    try {
      await axios.put(
        `${BASE_URL}/api/admin/kullanici/aktifMi/${id}`,
        { aktifMi: yeniDurum },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
    } catch {
      Alert.alert('Hata','Durum güncellenemedi');
      setUsers(prev =>
        prev.map(u => u.kullaniciid === id ? { ...u, aktifmi: !yeniDurum } : u)
      );
    } finally {
      setToggling(prev => ({ ...prev, [id]: false }));
    }
  };

  // ——— Kullanıcı Listesi Görünümü ———
if (showUsers) {
  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.homeBtn} onPress={onBackFromUsers}>
          <Icon name="arrow-back-outline" size={22} color="#fff"/>
          <Text style={styles.homeBtnText}>Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kullanıcı Listesi</Text>
      </View>

      <View style={styles.userFilterRow}>
        {[
          { key:'all',   label:'Tümü'    },
          { key:'mezun', label:'Mezunlar'},
          { key:'admin', label:'Adminler'}
        ].map(btn => (
          <TouchableOpacity
            key={btn.key}
            style={[
              styles.filterBtn,
              userFilter===btn.key && styles.filterBtnActive
            ]}
            onPress={() => {
              setUserFilter(btn.key);
              fetchUsers();
            }}
          >
            <Text style={styles.filterTxt}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
        <TextInput
          style={styles.searchInput}
          placeholder="Ara kullanıcı..."
          placeholderTextColor="#ddd"
          value={searchName}
          onChangeText={setSearchName}
          onSubmitEditing={fetchUsers}
        />
      </View>

      {usersLoading
        ? <ActivityIndicator size="large" color="#fff" style={{marginTop:20}}/>
        : (
          <FlatList
            data={users}
            keyExtractor={u => String(u.kullaniciid)}
            contentContainerStyle={{ padding:16 }}
            ListEmptyComponent={<Text style={styles.emptyText}>Kullanıcı bulunamadı.</Text>}
            renderItem={({ item }) => (
              <View style={styles.userCard}>
                <View style={{ flex:1 }}>
                  <Text style={styles.userName}>
                    {item.ad} {item.soyad} ({item.kullaniciadi})
                  </Text>
                  <Text style={styles.userMeta}>
                    {item.email} • {item.kullanicirolu}
                  </Text>
                </View>

                {userFilter === 'admin' ? (
                  // Admin listeleniyorsa: silme butonu
                  toggling[item.kullaniciid]
                    ? <ActivityIndicator size="small" color="#fff" />
                    : (
                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleRemoveAdmin(item.kullaniciid)}
                      >
                        <Icon name="remove-circle-outline" size={24} color="#fff" />
                      </TouchableOpacity>
                    )
                ) : (
                  // Diğer filtrelerde: toggle ile aktif/pasif
                  toggling[item.kullaniciid]
                    ? <ActivityIndicator size="small" color="#ff8a5c" />
                    : (
                      <Switch
                        value={!!item.aktifmi}
                        onValueChange={val => handleToggleUser(item.kullaniciid, val)}
                      />
                    )
                )}
              </View>
            )}
          />
        )
      }
    </LinearGradient>
  );
}


  // TAB_DATA tanımı
  const TAB_DATA = {
    forum: {
      data: forums,
      renderItem: ({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity
            style={{ flex:1 }}
            onPress={() => navigation.navigate('AdminForumDetay', { forum:item, token })}
          >
            <Text style={styles.cardTitle}>{item.baslik}</Text>
            <Text style={styles.cardMeta}>ID: {item.forumid}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteForum(item.forumid)}
          >
            <Icon name="trash-outline" size={20} color="#fff"/>
          </TouchableOpacity>
        </View>
      ),
      keyExtractor: item => String(item.forumid),
      empty: 'Forum bulunamadı.',
    },
    soru: {
      data: sorular,
      renderItem: ({ item }) => (
        <View style={styles.card}>
          <TouchableOpacity
            style={{ flex:1 }}
            onPress={() => navigation.navigate('AdminSoruDetay', { soru:item, token })}
          >
            <Text style={styles.cardTitle}>{item.icerik}</Text>
            <Text style={styles.cardMeta}>ID: {item.soruid}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteSoru(item.soruid)}
          >
            <Icon name="trash-outline" size={20} color="#fff"/>
          </TouchableOpacity>
        </View>
      ),
      keyExtractor: item => String(item.soruid),
      empty: 'Soru bulunamadı.',
    },
    grup: {
      data: gruplar,
      renderItem: ({ item }) => (
        <View style={styles.card}>
          <View style={{ flex:1 }}>
            <Text style={styles.cardTitle}>{item.ad}</Text>
            <Text style={styles.cardMeta}>ID: {item.grupid}</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteGrup(item.grupid)}
          >
            <Icon name="trash-outline" size={20} color="#fff"/>
          </TouchableOpacity>
        </View>
      ),
      keyExtractor: item => String(item.grupid),
      empty: 'Grup bulunamadı.',
    },
  };

  // ——— Ana Admin Panel Görünümü ———
  return (
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>

      <View style={styles.header}>
  <Text style={styles.headerTitle}>SuperUser</Text>
  <View style={styles.headerButtons}>
     <TouchableOpacity style={styles.navBtn} onPress={() => navigation.replace('Home',{ user })}>
     <Icon name="home-outline" size={20} color="#fff"/>
     <Text style={styles.navTxt}>Ana Sayfa</Text>
   </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => navigation.navigate('EntityActivation')}>
     <Icon name="settings-outline" size={20} color="#fff"/>
     <Text style={styles.navTxt}>Yönet</Text>
   </TouchableOpacity>

    <TouchableOpacity style={styles.navBtn} onPress={onPressListe}>
    <Icon name="people-outline" size={20} color="#fff"/>
     <Text style={styles.navTxt}>Liste</Text>
   </TouchableOpacity>
  </View>
</View>


      <View style={styles.tabBar}>
        {TAB_LIST.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabBtn, activeTab===tab.key && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabBtnText, activeTab===tab.key && styles.tabBtnTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContent}>
        {loading
          ? <ActivityIndicator size="large" color="#fff" style={{ marginTop:24 }} />
          : (
            <FlatList
              data={TAB_DATA[activeTab].data}
              renderItem={TAB_DATA[activeTab].renderItem}
              keyExtractor={TAB_DATA[activeTab].keyExtractor}
              ListEmptyComponent={<Text style={styles.emptyText}>{TAB_DATA[activeTab].empty}</Text>}
            />
          )}
      </View>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // HEADER
  header: {
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#f75c5b',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },

  // NAV BUTTONS (şimdi hepsi tek satıra sığacak)
  headerButtons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginLeft: 12,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff8a5c',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginLeft: 6,
  },
  navTxt: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
    fontSize: 14,
  },

  // TAB BAR
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 10,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    backgroundColor: '#ffe3db',
    borderBottomColor: '#f75c5b',
  },
  tabBtnText: {
    color: '#2D3436',
    fontSize: 16,
    fontWeight: '600',
  },
  tabBtnTextActive: {
    color: '#f75c5b',
  },

  // TAB CONTENT
  tabContent: {
    flex: 1,
    paddingHorizontal: 15,
  },

  // CARD
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f75c5b',
  },
  cardMeta: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  deleteBtn: {
    backgroundColor: '#ff5252',
    padding: 8,
    borderRadius: 8,
  },

  emptyText: {
    textAlign: 'center',
    color: '#fff',
    marginTop: 40,
    fontSize: 16,
  },

  // KULLANICI LİSTELEME
  userFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#fff',
  },
  filterTxt: {
    color: '#2D3436',
    fontWeight: '600',
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#fff',
    color: '#333',
  },

  userCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f75c5b',
  },
  userMeta: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
    flex: 1,
  },
});
