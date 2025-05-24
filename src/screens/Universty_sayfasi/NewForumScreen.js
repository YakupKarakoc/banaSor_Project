// src/screens/NewForumScreen.js
import React, { useState } from 'react';
import {
  View, 
  TextInput, 
  TouchableOpacity,
  Text, 
  Alert, 
  StyleSheet, 
  ActivityIndicator, 
  Animated,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import LinearGradient from 'react-native-linear-gradient';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');
const BASE = 'http://10.0.2.2:3000';

export default function NewForumScreen() {
  const { universiteId, fakulteId, bolumId } = useRoute().params;
  const navigation = useNavigation();

  // Navigation options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  React.useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCreate = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return Alert.alert('Hata','Lütfen başlık girin');
    if (trimmedTitle.length < 3) return Alert.alert('Hata','Başlık en az 3 karakter olmalıdır');
    
    setLoading(true);
    try {
      await axios.post(`${BASE}/api/forum/forumEkle`, {
        baslik: trimmedTitle,
        universiteId,
        fakulteId,
        bolumId
      });
      Alert.alert('Başarılı','Forum oluşturuldu.',[
        { text:'Tamam', onPress:()=>navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Hata', e.response?.data||'Forum oluşturulamadı');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
        <LinearGradient 
          colors={['#f75c5b','#ff8a5c']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          <View style={styles.modernLoadingContainer}>
            <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color="#fff" />
            </View>
            <Text style={styles.modernLoadingText}>Forum oluşturuluyor...</Text>
            <Text style={styles.modernLoadingSubText}>Lütfen bekleyin</Text>
        </View>
      </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient 
        colors={['#f75c5b','#ff8a5c']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Yeni Forum</Text>
              <Text style={styles.modernHeaderSubtitle}>BAŞLIK OLUŞTUR</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Icon name="chatbubbles" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Enhanced Content Container */}
        <KeyboardAvoidingView 
          style={styles.modernContentContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.contentWrapper}>
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ 
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 50]
                    })
                  }]
                }
              ]}
            >
              {/* Enhanced Icon Header */}
              <View style={styles.iconContainer}>
                <View style={styles.modernIconWrapper}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.98)', 'rgba(248,249,250,0.95)', 'rgba(255,255,255,0.98)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.modernIconBackground}
                  >
                    <Icon name="chatbubbles" size={44} color="#f75c5b" />
                  </LinearGradient>
                </View>
              </View>

              {/* Enhanced Form Title */}
              <Text style={styles.formTitle}>Forum Başlığı Oluştur</Text>
              <Text style={styles.formSubtitle}>
                Topluluğun tartışacağı yeni bir konu başlığı ekleyin
              </Text>

              {/* Enhanced Input Container */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Forum Başlığı</Text>
                <View style={styles.inputContainer}>
                  <LinearGradient
                    colors={['#fff', '#f8f9fa', '#fff']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.inputGradient}
                  >
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIconContainer}>
                        <Icon name="chatbubble-ellipses" size={22} color="#f75c5b" />
                      </View>
        <TextInput
                        style={styles.modernInput}
                        placeholder="Forum başlığını yazın..."
          placeholderTextColor="#999"
          value={title}
          onChangeText={setTitle}
                        maxLength={100}
                        autoCorrect={true}
                        autoCapitalize="sentences"
                        keyboardType="default"
                        textContentType="none"
                        autoComplete="off"
                        multiline={false}
        />
                    </View>
                  </LinearGradient>
                </View>
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCounter}>
                    {title.length}/100 karakter
                  </Text>
                  <View style={styles.characterBar}>
                    <LinearGradient
                      colors={
                        title.length > 80 
                          ? ['#ff6b6b', '#ff8a5c'] 
                          : title.length > 50 
                          ? ['#fdcb6e', '#ff8a5c'] 
                          : ['#00b894', '#55a3ff']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[
                        styles.characterBarFill, 
                        { width: `${(title.length / 100) * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {/* Enhanced Create Button */}
              <TouchableOpacity 
                style={[styles.modernCreateBtn, (title.trim().length < 3) && styles.modernCreateBtnDisabled]} 
                onPress={handleCreate} 
                disabled={title.trim().length < 3}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={title.trim().length < 3 ? ['#bdc3c7', '#95a5a6'] : ['#f75c5b', '#ff8a5c', '#ff6b6b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createBtnGradient}
                >
                  <Icon name="add-circle" size={22} color="#fff" style={{ marginRight: 10 }} />
                  <Text style={styles.modernCreateBtnText}>Forum Oluştur</Text>
                </LinearGradient>
        </TouchableOpacity>

              {/* Info Card */}
              <Animated.View
                style={[
                  styles.infoCard,
                  {
                    opacity: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.8]
                    }),
                    transform: [{
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0]
                      })
                    }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.infoCardGradient}
                >
                  <View style={styles.infoCardContent}>
                    <Icon name="information-circle" size={20} color="rgba(255,255,255,0.9)" />
                    <Text style={styles.infoText}>
                      Oluşturduğunuz forum başlığı topluluk üyelerinin tartışması için kullanılacaktır.
                    </Text>
                  </View>
                </LinearGradient>
              </Animated.View>

      </Animated.View>
          </View>
        </KeyboardAvoidingView>
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
    flex: 1 
  },

  // LOADING STATE
  modernLoadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: { 
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modernLoadingText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  modernLoadingSubText: { 
    color: 'rgba(255,255,255,0.9)', 
    fontSize: 15, 
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // PREMIUM HEADER
  modernHeader: {
    paddingTop: 15,
    paddingHorizontal: 22,
    paddingBottom: 25,
    backgroundColor: 'transparent',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modernBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 18,
  },
  modernHeaderTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1.2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  modernHeaderSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  modernHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // CONTENT CONTAINER
  modernContentContainer: {
    flex: 1,
    paddingTop: 20,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },

  // ENHANCED ICON HEADER
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  modernIconWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  modernIconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // FORM TITLES
  formTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1.0,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  formSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
    letterSpacing: 0.4,
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // ENHANCED INPUT SECTION
  inputSection: {
    marginBottom: 30,
  },
  inputLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: 0.6,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  inputContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGradient: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(247, 92, 91, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.2)',
  },
  modernInput: {
    flex: 1,
    fontSize: 17,
    color: '#2D3436',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  characterCounter: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  characterBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    marginLeft: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  characterBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },

  // ENHANCED CREATE BUTTON
  modernCreateBtn: {
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modernCreateBtnDisabled: {
    opacity: 0.6,
  },
  createBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modernCreateBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    letterSpacing: 0.8,
  },

  // INFO CARD
  infoCard: {
    marginTop: 20,
  },
  infoCardGradient: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 20,
  },
  infoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 15,
    flex: 1,
    lineHeight: 22,
    letterSpacing: 0.3,
  },

  // LEGACY STYLES (kept for compatibility)
  loader: { flex:1, justifyContent:'center', alignItems:'center' },
  loadingText: { color:'#fff', fontSize:16, marginTop:12, opacity:0.8 },
  iconRow: { alignItems:'center', marginBottom:16 },
  icon: { opacity:0.9 },
  title: { color:'#fff', fontSize:22, fontWeight:'700', textAlign:'center', marginBottom:18, letterSpacing:0.5 },
  input: { backgroundColor:'#fff', borderRadius:16, padding:16, fontSize:16, marginBottom:18, color:'#2D3436', shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  btn: { flexDirection:'row', alignItems:'center', justifyContent:'center', backgroundColor:'#fff', paddingVertical:14, borderRadius:25, shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:6, elevation:2 },
  btnText: { color:'#f75c5b', fontWeight:'700', fontSize:16 },
});
