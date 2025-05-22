// src/components/EntryReaction.js

import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';

/**
 * props:
 *  - type:       "Like" | "Dislike"
 *  - entryId:    integer
 *  - countInit:  number (initial toplam sayı)
 */
export default function EntryReaction({ type, entryId, countInit = 0 }) {
  const [count, setCount]   = useState(countInit);
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);

  // On mount: fetch whether the user has already reacted
  useEffect(() => {
    let cancelled = false;
    const fetchTepki = async () => {
      try {
        const res = await axios.get(`${BASE}/api/forum/entry/tepki/${entryId}`);
        if (cancelled) return;
        const tepki = res.data?.tepki; // "Like" | "Dislike" | null
        setActive(tepki === type);
      } catch (err) {
        console.error('Entry tepki yüklenemedi', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchTepki();
    return () => { cancelled = true; };
  }, [entryId, type]);

  const onPress = async () => {
    if (busy || loading) return;
    setBusy(true);

    const wasActive = active;
    const newTepki = wasActive ? null : type;

    // optimistic UI update
    setActive(!wasActive);
    setCount(c => c + (wasActive ? -1 : 1));

    try {
      // **POST** to the shared tepki endpoint (not PUT)
      await axios.post(
        `${BASE}/api/forum/entry/tepki`,
        { entryId, tepki: newTepki }
      );
    } catch (err) {
      console.error('Entry tepki güncellenemedi', err);
      Alert.alert('Hata', 'Tepki kaydedilemedi');
      // rollback
      setActive(wasActive);
      setCount(c => c + (wasActive ? 1 : -1));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#ff8a5c" style={{ marginLeft: 8 }} />;
  }

  const iconName = type === 'Like'
    ? active ? 'thumbs-up' : 'thumbs-up-outline'
    : active ? 'thumbs-down' : 'thumbs-down-outline';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={busy}>
      {busy
        ? <ActivityIndicator size="small" color="#ff8a5c" />
        : <Icon name={iconName} size={18} color="#ff8a5c" />
      }
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
