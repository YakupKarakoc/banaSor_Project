import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const { width } = Dimensions.get('window');
const BASE_URL = 'http://10.0.2.2:3000';

export default function DepartmentDetail() {
  const { universite, faculty, department } = useRoute().params;
  const navigation = useNavigation();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(40));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderCard = ({ icon, title, content, onPress }) => (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }
          ]
        }
      ]}
    >
      <TouchableOpacity
        style={styles.cardBtn}
        onPress={onPress}
        activeOpacity={onPress ? 0.9 : 1}
        disabled={!onPress}
      >
        <View style={styles.cardHeader}>
          <Icon name={icon} size={20} color="#f75c5b" style={styles.cardIcon} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardItemSmall}>{content}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name="layers-outline" size={36} color="#fff" style={styles.headerIcon} />
          <Text style={styles.title}>{department.bolumadi}</Text>
          <Text style={styles.subTitle}>
            @ {faculty.fakulteadi} • {universite.universiteadi}
          </Text>
        </View>

        {/* Announcements */}
        {renderCard({
          icon: 'megaphone-outline',
          title: 'Son Duyurular',
          content: '• Staj başvuru tarihi duyurusu.'
        })}

        {/* Forum */}
        {renderCard({
          icon: 'chatbubbles-outline',
          title: 'Forum',
          content: 'Bu bölümün forum başlıklarını görüntüle',
          onPress: () => navigation.navigate('Forum', {
            universiteId: universite.universiteid,
            fakulteId: faculty.fakulteid,
            bolumId: department.bolumid,
          })
        })}

        {/* Sorular */}
        {renderCard({
          icon: 'help-circle-outline',
          title: 'Sorular',
          content: 'Bu bölümün sorularını görüntüle',
          onPress: () => navigation.navigate('QuestionList', {
            universiteId: universite.universiteid,
            fakulteId: faculty.fakulteid,
            bolumId: department.bolumid,
          })
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 30 },
  header: { alignItems: 'center', marginBottom: 18 },
  headerIcon: { marginBottom: 8 },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  subTitle: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  cardBtn: { padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardIcon: { marginRight: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#f75c5b', letterSpacing: 0.3 },
  cardItemSmall: { fontSize: 14, color: '#666', fontWeight: '500' },
});
