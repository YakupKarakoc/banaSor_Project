// src/screens/MyContentScreen.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function MyContentScreen() {
  const navigation = useNavigation();

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const tiles = [
    { label: 'Sorularım',   icon: 'help-circle',      target: 'MyQuestions', color: '#6c5ce7' },
    { label: 'Cevaplarım',  icon: 'chatbubbles',      target: 'MyAnswers',    color: '#00b894' },
    { label: 'Forumlarım',  icon: 'people-circle',    target: 'MyForums',     color: '#e17055' },
    { label: 'Entrylerim',  icon: 'document-text',    target: 'MyEntries',    color: '#0984e3' },
    { label: 'Gruplarım',   icon: 'people',           target: 'MyGroups',     color: '#00bcd4' }, // YENİ EKLEDİK
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar backgroundColor="#f75c5b" barStyle="light-content" />
      <LinearGradient colors={['#f75c5b', '#ff8a5c']} style={styles.container}>
        
        {/* Premium Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.modernBackBtn} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.modernHeaderTitle}>Bana Ait İçerikler</Text>
              <Text style={styles.modernHeaderSubtitle}>Kişisel Panel</Text>
            </View>
            <View style={styles.modernHeaderIcon}>
              <Ionicons name="folder-open" size={24} color="#fff" />
            </View>
          </View>
        </View>

        {/* Modern Menu Cards */}
        <View style={styles.modernMenuContainer}>
          {tiles.map((tile, index) => (
            <TouchableOpacity
              key={index}
              style={styles.modernMenuCard}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(tile.target)}
            >
              <View style={styles.modernCardContent}>
                <View style={[styles.modernIconContainer, { backgroundColor: tile.color }]}>
                  <Ionicons name={tile.icon} size={28} color="#fff" />
                </View>
                
                <View style={styles.modernCardInfo}>
                  <Text style={styles.modernCardTitle}>{tile.label}</Text>
                  <Text style={styles.modernCardSubtitle}>İçeriğimi Yönet</Text>
                </View>
                
                <View style={styles.modernArrowContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#ccc" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Info */}
        <View style={styles.modernBottomInfo}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={styles.modernInfoText}>
            Tüm içeriklerinizi görüntüleyebilir, düzenleyebilir veya silebilirsiniz
          </Text>
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

  // PREMIUM HEADER
  modernHeader: {
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 25,
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
  modernHeaderIcon: {
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

  // MODERN MENU CARDS
  modernMenuContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modernMenuCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(247, 92, 91, 0.05)',
    transform: [{ scale: 1 }],
  },
  modernCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  modernIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modernCardInfo: {
    flex: 1,
  },
  modernCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  modernCardSubtitle: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  modernArrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },

  // BOTTOM INFO
  modernBottomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  infoIconContainer: {
    marginRight: 12,
  },
  modernInfoText: {
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
});
