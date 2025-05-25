import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SectionList,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  FlatList,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';
import { getToken } from '../../utils/auth';

const BASE_URL = 'http://10.0.2.2:3000';

export default function EntityActivationScreen({ navigation }) {
  const isFocused = useIsFocused();

  const [unis, setUnis] = useState([]);
  const [filteredUnis, setFilteredUnis] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedUni, setSelectedUni] = useState(null);
  const [selectedUniName, setSelectedUniName] = useState('');
  const [showUniModal, setShowUniModal] = useState(false);
  const [facs, setFacs] = useState([]);
  const [loadingFac, setLoadingFac] = useState(false);
  const [deptMap, setDeptMap] = useState({});
  const [loadingDept, setLoadingDept] = useState({});
  const [expanded, setExpanded] = useState({});
  const [toggling, setToggling] = useState({});
  const [loading, setLoading] = useState(true);

  // Navigation options ayarını component mount olduğunda yap
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

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
      .then(res => {
        setUnis(res.data || []);
        setFilteredUnis(res.data || []);
      })
      .catch(() => Alert.alert('Hata', 'Üniversiteler yüklenemedi.'));
  }, []);

  // Search fonksiyonu
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredUnis(unis);
    } else {
      const filtered = unis.filter(uni => 
        uni.universiteadi.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredUnis(filtered);
    }
  }, [searchText, unis]);

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

  // University selection functions
  const handleSelectUniversity = (uni) => {
    setSelectedUni(uni.universiteid);
    setSelectedUniName(uni.universiteadi);
    setShowUniModal(false);
    setSearchText('');
    setFilteredUnis(unis); // Reset filtered list
  };

  const openUniModal = () => {
    setShowUniModal(true);
    setSearchText('');
    setFilteredUnis(unis);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
        <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Fakülteleri aktif/pasif olarak ayır
  const activeFacs = facs.filter(f => f.aktifMi);
  const passiveFacs = facs.filter(f => !f.aktifMi);
  const facultySections = [
    { title: `Aktif Fakülteler (${activeFacs.length})`, data: activeFacs },
    { title: `Pasif Fakülteler (${passiveFacs.length})`, data: passiveFacs },
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
    <LinearGradient colors={['#f75c5b','#ff8a5c']} style={styles.container}>
        
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={20} color="#fff"/>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Eğitim Aktivasyonu</Text>
              <Text style={styles.modernHeaderSubtitle}>Üniversite & Fakülte Yönetimi</Text>
            </View>
            <TouchableOpacity style={styles.headerActionBtn}>
              <Icon name="analytics" size={18} color="#fff"/>
            </TouchableOpacity>
          </View>
        </View>

        {/* Enhanced University Picker */}
        <View style={styles.pickerSection}>
          <TouchableOpacity style={styles.modernPickerWrapper} onPress={openUniModal}>
            <View style={styles.pickerIconWrapper}>
              <Icon name="school" size={20} color="#f75c5b" />
            </View>
            <View style={styles.pickerTextContainer}>
              <Text style={styles.pickerLabel}>Üniversite</Text>
              <Text style={[styles.pickerText, !selectedUniName && styles.pickerPlaceholder]}>
                {selectedUniName || "Bir üniversite seçin"}
              </Text>
            </View>
            <View style={styles.pickerChevronWrapper}>
              <Icon name="chevron-down" size={18} color="#666" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        {selectedUni && (
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statsCard}>
                <View style={styles.statsIconContainer}>
                  <Icon name="library" size={22} color="#4CAF50"/>
                </View>
                <Text style={styles.statsNumber}>{facs.filter(f => f.aktifMi).length}</Text>
                <Text style={styles.statsLabel}>Aktif Fakülte</Text>
              </View>
              
              <View style={styles.statsCard}>
                <View style={styles.statsIconContainer}>
                  <Icon name="pause-circle" size={22} color="#FF9800"/>
                </View>
                <Text style={styles.statsNumber}>{facs.filter(f => !f.aktifMi).length}</Text>
                <Text style={styles.statsLabel}>Pasif Fakülte</Text>
              </View>
              
             
            </View>
          </View>
        )}

        {/* University Selection Modal */}
        <Modal
          visible={showUniModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowUniModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Icon name="school" size={22} color="#f75c5b" style={styles.modalTitleIcon} />
                  <Text style={styles.modalTitle}>Üniversite Seç</Text>
                </View>
                <TouchableOpacity 
                  style={styles.modalCloseBtn} 
                  onPress={() => setShowUniModal(false)}
                >
                  <Icon name="close" size={18} color="#666" />
                </TouchableOpacity>
      </View>

              {/* Modal Search */}
              <View style={styles.modalSearchContainer}>
                <View style={styles.modalSearchWrapper}>
                  <Icon name="search" size={16} color="#f75c5b" style={styles.searchIcon} />
                  <TextInput
                    style={styles.modalSearchInput}
                    placeholder="Üniversite ara..."
                    placeholderTextColor="#999"
                    value={searchText}
                    onChangeText={setSearchText}
                    autoFocus={true}
                  />
                  {searchText.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearBtn}>
                      <Icon name="close-circle" size={16} color="#999" />
                      </TouchableOpacity>
                    )}
                </View>
              </View>

              {/* University List */}
              <FlatList
                data={filteredUnis}
                keyExtractor={item => String(item.universiteid)}
                contentContainerStyle={styles.modalListContainer}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalListItem,
                      selectedUni === item.universiteid && styles.modalListItemSelected
                    ]}
                    onPress={() => handleSelectUniversity(item)}
                  >
                    <View style={[
                      styles.modalItemIconContainer,
                      selectedUni === item.universiteid && styles.modalItemIconSelected
                    ]}>
                      <Icon name="school" size={16} color={selectedUni === item.universiteid ? "#fff" : "#f75c5b"} />
                    </View>
                    <Text style={[
                      styles.modalListItemText,
                      selectedUni === item.universiteid && styles.modalListItemTextSelected
                    ]}>
                      {item.universiteadi}
                    </Text>
                    {selectedUni === item.universiteid && (
                      <Icon name="checkmark-circle" size={18} color="#f75c5b" />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.modalEmptyContainer}>
                    <View style={styles.modalEmptyIconContainer}>
                      <Icon name="search-outline" size={40} color="#ddd" />
                    </View>
                    <Text style={styles.modalEmptyText}>Üniversite bulunamadı</Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>

        {/* Content Area */}
        {selectedUni ? (
          loadingFac ? (
            <View style={styles.modernLoadingContainer}>
              <View style={styles.loadingSpinner}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
              <Text style={styles.modernLoadingText}>Fakülteler yükleniyor...</Text>
            </View>
          ) : facs.length > 0 ? (
            <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
              <View style={styles.facultiesContainer}>
                {facultySections.map((section, sectionIndex) => (
                  <View key={sectionIndex} style={styles.facultySection}>
                    {section.data.length > 0 && (
                      <>
                        <View style={styles.sectionHeader}>
                          <View style={styles.sectionHeaderContent}>
                            <Icon 
                              name={section.title.includes('Aktif') ? 'checkmark-circle' : 'pause-circle'} 
                              size={16} 
                              color={section.title.includes('Aktif') ? '#4CAF50' : '#FF9800'} 
                            />
                            <Text style={styles.sectionHeaderText}>{section.title}</Text>
                          </View>
                        </View>
                        
                        {section.data.map((faculty) => {
                          const busy = toggling[`fakulte:${faculty.fakulteid}`];
                          const isActive = faculty.aktifMi;
                          const isOpen = expanded[faculty.fakulteid];
                          const depts = deptMap[faculty.fakulteid] || [];
                          
                          return (
                            <View key={faculty.fakulteid} style={styles.facultyCard}>
                              {/* Faculty Header */}
                              <View style={[styles.facultyHeader, !isActive && styles.passiveFacultyHeader]}>
                                <TouchableOpacity 
                                  style={styles.facultyHeaderContent}
                                  onPress={() => toggleExpand(faculty.fakulteid)}
                                  activeOpacity={0.7}
                                >
                                  <View style={styles.facultyHeaderLeft}>
                                    <View style={[styles.facultyIcon, !isActive && styles.passiveFacultyIcon]}>
                                      <Icon name="library" size={18} color={isActive ? "#fff" : "#999"} />
                                    </View>
                                    <View style={styles.facultyInfo}>
                                      <Text style={[styles.facultyTitle, !isActive && styles.passiveFacultyTitle]}>
                                        {faculty.fakulteadi}
                                      </Text>
                                      <Text style={styles.facultyMeta}>
                                        {depts.length} bölüm • {depts.filter(d => d.aktifMi).length} aktif
                                      </Text>
                                    </View>
                                  </View>
                                  
                                  <View style={styles.facultyHeaderRight}>
                                    <View style={styles.statusBadge}>
                                      <View style={[styles.statusDot, isActive ? styles.activeDot : styles.inactiveDot]} />
                                      <Text style={[styles.statusText, isActive ? styles.activeStatus : styles.inactiveStatus]}>
                                        {isActive ? 'Aktif' : 'Pasif'}
                                      </Text>
                                    </View>
                                    
                                    {busy ? (
                                      <View style={styles.toggleContainer}>
                                        <ActivityIndicator size="small" color="#f75c5b" />
                                      </View>
                                    ) : (
                                      <TouchableOpacity 
                                        style={styles.toggleContainer}
                                        onPress={() => toggleAktif('fakulte', faculty.fakulteid)}
                                      >
                                        <Icon 
                                          name={isActive ? 'toggle' : 'toggle-outline'} 
                                          size={24} 
                                          color={isActive ? '#4CAF50' : '#ccc'} 
                                        />
                                      </TouchableOpacity>
                                    )}
                                    
                                    <View style={styles.expandContainer}>
                                      <Icon 
                                        name={isOpen ? 'chevron-up' : 'chevron-down'} 
                                        size={16} 
                                        color="#666" 
                                      />
                                    </View>
                  </View>
                </TouchableOpacity>
                              </View>
                              
                              {/* Departments */}
                              {isOpen && (
                                <View style={styles.departmentsContainer}>
                                  {loadingDept[faculty.fakulteid] ? (
                                    <View style={styles.deptLoadingContainer}>
                                      <ActivityIndicator size="small" color="#f75c5b" />
                                      <Text style={styles.deptLoadingText}>Bölümler yükleniyor...</Text>
                                    </View>
                                  ) : depts.length > 0 ? (
                                    <View style={styles.departmentsList}>
                                      {depts.map((dept) => {
                                        const deptKey = `bolum:${dept.bolumid}`;
                                        const isDeptActive = dept.aktifMi;
                                        const isDeptBusy = toggling[deptKey];
                                        
                      return (
                                          <View key={dept.bolumid} style={[styles.departmentCard, !isDeptActive && styles.passiveDepartmentCard]}>
                                            <View style={styles.departmentInfo}>
                                              <View style={[styles.departmentIcon, !isDeptActive && styles.passiveDepartmentIcon]}>
                                                <Icon name="book" size={14} color={isDeptActive ? "#fff" : "#999"} />
                                              </View>
                                              <View style={styles.departmentDetails}>
                                                <Text style={[styles.departmentTitle, !isDeptActive && styles.passiveDepartmentTitle]}>
                                                  {dept.bolumadi}
                                                </Text>
                                              </View>
                                            </View>
                                            
                                            <View style={styles.departmentActions}>
                                              <View style={styles.deptStatusBadge}>
                                                <View style={[styles.statusDot, isDeptActive ? styles.activeDot : styles.inactiveDot]} />
                                                <Text style={[styles.deptStatusText, isDeptActive ? styles.activeStatus : styles.inactiveStatus]}>
                                                  {isDeptActive ? 'Aktif' : 'Pasif'}
                                                </Text>
                                              </View>
                                              
                                              {isDeptBusy ? (
                                                <View style={styles.deptToggleContainer}>
                                                  <ActivityIndicator size="small" color="#f75c5b" />
                                                </View>
                                              ) : (
                                                <TouchableOpacity 
                                                  style={styles.deptToggleContainer}
                                                  onPress={() => toggleAktif('bolum', dept.bolumid)}
                                                >
                                                  <Icon 
                                                    name={isDeptActive ? 'toggle' : 'toggle-outline'} 
                                                    size={20} 
                                                    color={isDeptActive ? '#4CAF50' : '#ccc'} 
                                                  />
                            </TouchableOpacity>
                                              )}
                                            </View>
                                          </View>
                                        );
                                      })}
                                    </View>
                                  ) : (
                                    <View style={styles.noDepartments}>
                                      <Text style={styles.noDepartmentsText}>Bu fakültede henüz bölüm bulunmuyor</Text>
                                    </View>
                                  )}
                                </View>
                          )}
                        </View>
                      );
                        })}
                      </>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noFacultiesContainer}>
              <View style={styles.noFacultiesIcon}>
                <Icon name="library-outline" size={60} color="rgba(255,255,255,0.4)" />
              </View>
              <Text style={styles.noFacultiesTitle}>Fakülte Bulunamadı</Text>
              <Text style={styles.noFacultiesSubtitle}>Bu üniversitede henüz fakülte bulunmuyor</Text>
            </View>
          )
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Icon name="school-outline" size={80} color="rgba(255,255,255,0.4)" />
            </View>
            <Text style={styles.emptyStateTitle}>Üniversite Seçiniz</Text>
            <Text style={styles.emptyStateSubtitle}>
              Fakülte ve bölümleri yönetmek için önce bir üniversite seçin
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={openUniModal}>
              <Icon name="add-circle" size={18} color="#fff" style={styles.emptyStateButtonIcon} />
              <Text style={styles.emptyStateButtonText}>Üniversite Seç</Text>
            </TouchableOpacity>
          </View>
      )}
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f75c5b',
  },
  container: { 
    flex: 1,
  },

  // MODERN HEADER
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 15,
  },
  modernHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  modernHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },

  // PICKER
  pickerSection: {
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  modernPickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  pickerIconWrapper: {
    marginRight: 10,
  },
  pickerTextContainer: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  pickerChevronWrapper: {
    marginLeft: 8,
  },

  // LOADING STATES
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
    letterSpacing: 0.5,
  },

  // STATS
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  statsIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // MODAL STYLES
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitleIcon: {
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 0.5,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalSearchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  searchIcon: {
    marginRight: 10,
  },
  clearBtn: {
    padding: 4,
  },
  modalListContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  modalListItemSelected: {
    backgroundColor: '#fff5f5',
    borderColor: '#f75c5b',
  },
  modalItemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalItemIconSelected: {
    backgroundColor: '#f75c5b',
  },
  modalListItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 0.3,
  },
  modalListItemTextSelected: {
    color: '#f75c5b',
    fontWeight: '700',
  },
  modalEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  modalEmptyIconContainer: {
    marginBottom: 15,
  },
  modalEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },

  // CONTENT SECTION
  contentArea: {
    flex: 1,
  },
  facultiesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  facultySection: {
    marginBottom: 10,
  },
  sectionHeader: {
    marginVertical: 8,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginLeft: 8,
  },
  facultyCard: {
    marginBottom: 10,
  },
  facultyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  facultyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  facultyHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  facultyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passiveFacultyHeader: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  facultyIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passiveFacultyIcon: {
    backgroundColor: '#ccc',
  },
  facultyInfo: {
    flex: 1,
  },
  facultyTitle: {
    color: '#333',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  passiveFacultyTitle: {
    color: '#999',
  },
  facultyMeta: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeDot: {
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    backgroundColor: '#FF9800',
  },
  activeStatus: {
    color: '#4CAF50',
  },
  inactiveStatus: {
    color: '#FF9800',
  },
  toggleContainer: {
    padding: 4,
    marginRight: 8,
  },
  expandContainer: {
    padding: 4,
  },
  departmentsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
  deptLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  deptLoadingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
  },
  departmentsList: {
    paddingTop: 5,
  },
  departmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  passiveDepartmentCard: {
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  departmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  departmentIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  passiveDepartmentIcon: {
    backgroundColor: '#ccc',
  },
  departmentDetails: {
    flex: 1,
  },
  departmentTitle: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
  },
  passiveDepartmentTitle: {
    color: '#999',
  },
  departmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deptStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  deptStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  deptToggleContainer: {
    padding: 4,
  },
  noDepartments: {
    alignItems: 'center',
    padding: 20,
  },
  noDepartmentsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  noFacultiesContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noFacultiesIcon: {
    marginBottom: 15,
  },
  noFacultiesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  noFacultiesSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    marginBottom: 15,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  emptyStateButtonIcon: {
    marginRight: 8,
  },
  emptyStateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  // CONTENT SECTION
  contentSection: {
    flex: 1,
  },

  // MODERN LOADING
  modernLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  modernLoadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
    letterSpacing: 0.5,
  },

  // DEPARTMENT STYLES
  departmentSection: {
    marginLeft: 15,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 10,
  },
  departmentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  departmentHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  departmentSectionTitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginHorizontal: 15,
  },
  modernDepartmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  passiveDepartmentCard: {
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  departmentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  departmentIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f75c5b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  passiveDepartmentIcon: {
    backgroundColor: '#ccc',
  },
  departmentInfo: {
    flex: 1,
  },
  departmentTitle: {
    color: '#333',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  passiveDepartmentTitle: {
    color: '#999',
  },
  departmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  departmentListContainer: {
    paddingBottom: 10,
  },

  // PICKER TEXT STYLES
  pickerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  pickerPlaceholder: {
    color: '#999',
  },
});
