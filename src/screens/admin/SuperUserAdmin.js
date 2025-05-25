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
  StatusBar,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const BASE_URL = 'http://10.0.2.2:3000';
const TAB_LIST = [
  { key: 'forum', label: 'Forumlar', icon: 'chatbubbles-outline' },
  { key: 'soru',  label: 'Sorular', icon: 'help-circle-outline' },
  { key: 'grup',  label: 'Gruplar', icon: 'people-outline' },
];

export default function SuperUserAdmin({ navigation, route }) {
  const { token, user } = route.params || {};

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
  const [toggling,     setToggling]     = useState({});      // 
  // 
  // { [id]: boolean }

  const [pending,       setPending]       = useState([]);
  const [loadingPending,setLoadingPending]= useState(false);
  const [actionLoading, setActionLoading] = useState({}); // { [oneriId]: bool }
  useEffect(() => {
    fetchData();
      // yeni ekledik
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

  const makeDirectAdmin = async kullaniciId => {
  try {
    await axios.post(
      `${BASE_URL}/api/admin/dogrudanAdmin`,
      { kullaniciId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    Alert.alert('Başarılı', 'Kullanıcı doğrudan admin yapıldı.');
    // istersen listeyi yenile:
    fetchUsers();
  } catch (e) {
    Alert.alert('Hata', e.response?.data?.mesaj || e.message);
  }
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
  // sayfanın üst kısmında, diğer handler'larla beraber:
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
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>

        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={onBackFromUsers}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Kullanıcı Yönetimi</Text>
              <Text style={styles.modernHeaderSubtitle}>Super Admin</Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>
        </View>

        {/* Enhanced Filter System */}
        <View style={styles.modernFilterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScrollContent}>
            {[
              { key: 'all', label: 'Tümü', icon: 'people' },
              { key: 'mezun', label: 'Mezunlar', icon: 'school' },
              { key: 'admin', label: 'Adminler', icon: 'shield-checkmark' }
            ].map(btn => (
              <TouchableOpacity
                key={btn.key}
                style={[
                  styles.modernFilterChip,
                  userFilter === btn.key && styles.modernFilterChipActive
                ]}
                onPress={() => {
                  setUserFilter(btn.key);
                  fetchUsers();
                }}
              >
                <View style={styles.filterIconContainer}>
                  <Icon name={btn.icon} size={18} color={userFilter === btn.key ? '#f75c5b' : '#fff'} />
                </View>
                <Text style={[styles.modernFilterText, userFilter === btn.key && styles.modernFilterTextActive]}>
                  {btn.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modernSearchContainer}>
            <View style={styles.searchIconContainer}>
              <Icon name="search" size={22} color="#f75c5b" />
            </View>
            <TextInput
              style={styles.modernSearchInput}
              placeholder="Kullanıcı ara..."
              placeholderTextColor="#999"
              value={searchName}
              onChangeText={setSearchName}
              onSubmitEditing={fetchUsers}
            />
          </View>
        </View>

        {/* Enhanced User List */}
        {usersLoading
          ? <View style={styles.modernLoadingContainer}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
              <Text style={styles.modernLoadingText}>Kullanıcılar yükleniyor...</Text>
            </View>
            : (
              <FlatList
                data={users}
                keyExtractor={u => String(u.kullaniciid)}
                contentContainerStyle={styles.modernListContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.modernEmptyContainer}>
                    <View style={styles.emptyIconContainer}>
                      <Icon name="people-outline" size={80} color="rgba(255,255,255,0.4)" />
                    </View>
                    <Text style={styles.modernEmptyText}>Kullanıcı bulunamadı</Text>
                    <Text style={styles.modernEmptySubText}>Farklı filtreler deneyebilirsiniz</Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <View style={styles.modernUserCard}>
                    <View style={styles.modernUserAvatar}>
                      <Icon name="person" size={26} color="#fff" />
                    </View>

                    <View style={styles.modernUserInfo}>
                      <Text style={styles.modernUserName}>
                        {item.ad} {item.soyad}
                      </Text>
                      <Text style={styles.modernUserHandle}>@{item.kullaniciadi}</Text>
                      <Text style={styles.modernUserMeta}>
                        {item.email} • {item.kullanicirolu}
                      </Text>
                    </View>

                    <View style={styles.modernUserActions}>
                      {userFilter === 'admin' ? (
                        toggling[item.kullaniciid]
                          ? <View style={styles.actionLoadingContainer}>
                            <ActivityIndicator size="small" color="#ff6b6b" />
                          </View>
                          : (
                            <TouchableOpacity
                              style={styles.modernRemoveBtn}
                              onPress={() => handleRemoveAdmin(item.kullaniciid)}
                            >
                              <Icon name="remove-circle" size={26} color="#ff6b6b" />
                            </TouchableOpacity>
                          )
                      ) : (
                        <View style={styles.modernToggleContainer}>
                          {toggling[item.kullaniciid] ? (
                            <View style={styles.actionLoadingContainer}>
                              <ActivityIndicator size="small" color="#f75c5b" />
                            </View>
                          ) : (
                            <Switch
                              value={!!item.aktifmi}
                              onValueChange={val => handleToggleUser(item.kullaniciid, val)}
                              trackColor={{ false: '#e0e0e0', true: '#f75c5b' }}
                              thumbColor={item.aktifmi ? '#fff' : '#f4f3f4'}
                            />
                          )}
                        </View>
                      )}

                      <TouchableOpacity
                        style={styles.modernMakeAdminBtn}
                        onPress={() => makeDirectAdmin(item.kullaniciid)}
                      >
                        <Icon name="shield-checkmark" size={22} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              />
            )
        }
      </LinearGradient>
    </SafeAreaView>
  );
}

  

  // TAB_DATA tanımı
  const TAB_DATA = {
    forum: {
      data: forums,
      renderItem: ({ item }) => (
        <TouchableOpacity
          style={styles.modernContentCard}
          onPress={() => navigation.navigate('AdminForumDetay', { forum: item, token })}
          activeOpacity={0.8}
        >
          <View style={styles.modernCardIconContainer}>
            <Icon name="chatbubbles" size={28} color="#fff" />
          </View>
          <View style={styles.modernCardContent}>
            <Text style={styles.modernCardTitle} numberOfLines={2}>{item.baslik}</Text>
            <Text style={styles.modernCardSubtitle}>Forum ID: {item.forumid}</Text>
            <View style={styles.modernCardBadge}>
              <Text style={styles.modernCardBadgeText}>Forum</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modernDeleteBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteForum(item.forumid);
            }}
          >
            <Icon name="trash" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </TouchableOpacity>
      ),
      keyExtractor: item => String(item.forumid),
      empty: 'Forum bulunamadı.',
      emptyIcon: 'chatbubbles-outline'
    },
    soru: {
      data: sorular,
      renderItem: ({ item }) => (
        <TouchableOpacity
          style={styles.modernContentCard}
          onPress={() => navigation.navigate('AdminSoruDetay', { soru: item, token })}
          activeOpacity={0.8}
        >
          <View style={styles.modernCardIconContainer}>
            <Icon name="help-circle" size={28} color="#fff" />
          </View>
          <View style={styles.modernCardContent}>
            <Text style={styles.modernCardTitle} numberOfLines={2}>{item.icerik}</Text>
            <Text style={styles.modernCardSubtitle}>Soru ID: {item.soruid}</Text>
            <View style={styles.modernCardBadge}>
              <Text style={styles.modernCardBadgeText}>Soru</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modernDeleteBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleDeleteSoru(item.soruid);
            }}
          >
            <Icon name="trash" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </TouchableOpacity>
      ),
      keyExtractor: item => String(item.soruid),
      empty: 'Soru bulunamadı.',
      emptyIcon: 'help-circle-outline'
    },
    grup: {
      data: gruplar,
      renderItem: ({ item }) => (
        <View style={styles.modernContentCard}>
          <View style={styles.modernCardIconContainer}>
            <Icon name="people" size={28} color="#fff" />
          </View>
          <View style={styles.modernCardContent}>
            <Text style={styles.modernCardTitle} numberOfLines={2}>{item.ad}</Text>
            <Text style={styles.modernCardSubtitle}>Grup ID: {item.grupid}</Text>
            <View style={styles.modernCardBadge}>
              <Text style={styles.modernCardBadgeText}>Grup</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.modernDeleteBtn}
            onPress={() => handleDeleteGrup(item.grupid)}
          >
            <Icon name="trash" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      ),
      keyExtractor: item => String(item.grupid),
      empty: 'Grup bulunamadı.',
      emptyIcon: 'people-outline'
    },
  };

  // ——— Ana SuperUser Panel Görünümü ———
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>

        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>SuperUser Panel</Text>
              <Text style={styles.modernHeaderSubtitle}>Üst Yönetim</Text>
            </View>
            <View style={styles.modernHeaderActions}>
              <TouchableOpacity
                style={styles.modernHeaderBtn}
                onPress={() => navigation.replace('Home', { user })}
              >
                <Icon name="home" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modernHeaderBtn}
                onPress={() => navigation.navigate('EntityActivation')}
              >
                <Icon name="settings" size={22} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modernHeaderBtn}
                onPress={onPressListe}
              >
                <Icon name="people" size={22} color="#fff" />
              </TouchableOpacity>

                <TouchableOpacity
   style={styles.modernHeaderBtn}
    onPress={() => navigation.navigate('PendingSuggestions', { token })}
  >
    <Icon name="time" size={22} color="#fff" />
  </TouchableOpacity>

             

            </View>
          </View>
        </View>

        {/* Enhanced Tab System */}
        <View style={styles.modernTabContainer}>
          <View style={styles.modernTabBar}>
            {TAB_LIST.map(tab => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.modernTabBtn, activeTab === tab.key && styles.modernTabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <View style={styles.tabIconContainer}>
                  <Icon
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.key ? '#fff' : '#999'}
                  />
                </View>
                <Text style={[styles.modernTabText, activeTab === tab.key && styles.modernTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.modernContent}>
          {loading
            ? <View style={styles.modernLoadingContainer}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
              <Text style={styles.modernLoadingText}>Veriler yükleniyor...</Text>
            </View>
            : (
              <FlatList
                data={TAB_DATA[activeTab].data}
                renderItem={TAB_DATA[activeTab].renderItem}
                keyExtractor={TAB_DATA[activeTab].keyExtractor}
                contentContainerStyle={styles.modernListContainer}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.modernEmptyContainer}>
                    <View style={styles.emptyIconContainer}>
                      <Icon name={TAB_DATA[activeTab].emptyIcon} size={80} color="rgba(255,255,255,0.4)" />
                    </View>
                    <Text style={styles.modernEmptyText}>{TAB_DATA[activeTab].empty}</Text>
                    <Text style={styles.modernEmptySubText}>Henüz içerik bulunmuyor</Text>
                  </View>
                }
              />
            )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // MAIN CONTAINERS
  safeContainer: {
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  container: {
    flex: 1,
  },

  // PREMIUM HEADER DESIGN
  modernHeader: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  modernHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  modernHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSpacer: {
    width: 36,
  },
  modernHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  modernHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // COMPACT TAB DESIGN
  modernTabContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modernTabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  modernTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 16,
    marginHorizontal: 2,
  },
  modernTabBtnActive: {
    backgroundColor: '#f75c5b',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ translateY: -2 }, { scale: 1.02 }],
  },
  tabIconContainer: {
    marginRight: 6,
  },
  modernTabText: {
    color: '#777',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modernTabTextActive: {
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // CONTENT CONTAINERS
  modernContent: {
    flex: 1,
  },
  modernListContainer: {
    padding: 20,
    paddingTop: 0,
  },

  // COMPACT PREMIUM CARD DESIGN
  modernContentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernCardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernCardContent: {
    flex: 1,
  },
  modernCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  modernCardSubtitle: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  modernCardBadge: {
    backgroundColor: '#f75c5b',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modernCardBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modernDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1.5,
    borderColor: '#ffdddd',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  // COMPACT FILTER & SEARCH SYSTEM
  modernFilterContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  filterScrollContent: {
    paddingRight: 20,
  },
  modernFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modernFilterChipActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1.05 }],
    borderColor: 'rgba(247, 92, 91, 0.3)',
  },
  filterIconContainer: {
    marginRight: 6,
  },
  modernFilterText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modernFilterTextActive: {
    color: '#f75c5b',
  },
  modernSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 12,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.1)',
  },
  searchIconContainer: {
    marginRight: 12,
  },
  modernSearchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },

  // COMPACT USER CARDS
  modernUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  modernUserInfo: {
    flex: 1,
  },
  modernUserName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  modernUserHandle: {
    fontSize: 12,
    color: '#f75c5b',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  modernUserMeta: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  modernUserActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modernToggleContainer: {
    marginRight: 12,
  },
  actionLoadingContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modernRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#ffdddd',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  modernMakeAdminBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // COMPACT PROPOSAL CARDS
  modernProposalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
  },
  modernProposalHeader: {
    marginBottom: 14,
  },
  modernProposalUsers: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  modernProposalUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernProposalAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    shadowColor: '#f75c5b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  modernProposalUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    letterSpacing: 0.2,
  },
  modernArrowIcon: {
    marginHorizontal: 8,
    color: '#ccc',
  },
  modernProposalDate: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modernProposalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modernProposalLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  modernProposalLoadingText: {
    marginLeft: 8,
    color: '#f75c5b',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  modernApproveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 14,
    flex: 0.48,
    justifyContent: 'center',
    shadowColor: '#4caf50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modernRejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 14,
    flex: 0.48,
    justifyContent: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modernActionBtnText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 5,
    fontSize: 12,
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // COMPACT LOADING & EMPTY STATES
  modernLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modernLoadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
  },
  modernEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  modernEmptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  modernEmptySubText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
});
