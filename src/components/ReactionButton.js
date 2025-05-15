// src/components/ReactionButton.js
import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';

/**
 *  props
 *  -----
 *  type      : "Like" | "Dislike"
 *  entryId   : (isteğe bağlı) Forum entry ID
 *  cevapId   : (isteğe bağlı) Cevap ID
 *  countInit : İlk sayı
 */
export default function ReactionButton({
  type = 'Like',
  entryId = null,
  cevapId = null,
  countInit = 0,
}) {
  const [count,    setCount]    = useState(Number(countInit));
  const [selected, setSelected] = useState(false);
  const [busy,     setBusy]     = useState(false);

  /* ---------------- helpers ---------------- */
  const iconName  =
    type === 'Like'
      ? selected ? 'thumbs-up'   : 'thumbs-up-outline'
      : selected ? 'thumbs-down' : 'thumbs-down-outline';

  const iconColor = selected ? '#f75c5b' : '#ff8a5c';

  const isEntry   = !!entryId;                   // entry mi, cevap mı?
  const url       = isEntry
      ? '/api/forum/entry/tepki'
      : '/api/soru/cevap/tepki';

  const payload   = isEntry
      ? { entryId, tepki: type }
      : { cevapId, tepki: type };

  /* ---------------- action ----------------- */
  const toggle = async () => {
    if (busy) return;

    // optimistic update
    const delta = selected ? -1 : 1;
    setSelected(!selected);
    setCount(c => c + delta);
    setBusy(true);

    try {
      await axios.post(`${BASE}${url}`, payload);
      // (dilerseniz sunucudan güncel sayı dönüyorsa burada setCount(data.count) yapabilirsiniz)
    } catch (err) {
      // rollback
      setSelected(s => !s);
      setCount(c => c - delta);
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  /* ---------------- render ----------------- */
  return (
    <TouchableOpacity style={styles.row} onPress={toggle} disabled={busy}>
      {busy
        ? <ActivityIndicator size="small" color="#f75c5b" />
        : <Icon name={iconName} size={18} color={iconColor} />}
      <Text style={styles.txt}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  txt: { marginLeft: 4, fontSize: 13, color: '#ff8a5c', fontWeight: '600' },
});
