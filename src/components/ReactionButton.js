// src/components/ReactionButton.js

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';

export default function ReactionButton({
  type,      // "Like" veya "Dislike"
  cevapId,   // Tepki verilecek cevabın ID'si
  countInit, // Başlangıç toplam sayısı
}) {
  const [count, setCount]   = useState(countInit);
  const [active, setActive] = useState(false);

  // Başlangıçta sunucudan kullanıcının daha önce tepki verip vermediğini çek
  useEffect(() => {
    axios
      .get(`${BASE}/api/soru/cevap/tepki/${cevapId}`)
      .then(res => {
        // res.data.tepki ya "Like", "Dislike" veya null
        setActive(res.data.tepki === type);
      })
      .catch(err => {
        console.error('Tepki alınamadı', err);
      });
  }, [cevapId, type]);

  const onPress = async () => {
    try {
      const newTepki = active ? null : type;
      // Sunucuya POST ile tepkiyi güncelle
      await axios.post(
        `${BASE}/api/soru/cevap/tepki/${cevapId}`,
        { tepki: newTepki }
      );
      // UI'ı güncelle
      setActive(!active);
      setCount(c => c + (active ? -1 : 1));
    } catch (err) {
      console.error('Tepki kaydedilemedi', err);
      Alert.alert('Hata', 'Tepki kaydedilemedi');
    }
  };

  // İkon seçimi
  const iconName = type === 'Like'
    ? active ? 'thumbs-up' : 'thumbs-up-outline'
    : active ? 'thumbs-down' : 'thumbs-down-outline';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Icon name={iconName} size={20} color={active ? '#f75c5b' : '#aaa'} />
      <Text style={[styles.count, active && styles.countActive]}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  count: {
    marginLeft: 4,
    fontSize: 13,
    color: '#666',
  },
  countActive: {
    color: '#f75c5b',
    fontWeight: '700',
  },
});
