import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';     // ihtiyaçta güncelle

/**
 *  type:  "Like" | "Dislike"
 *  countInit:   ilk sayı
 *  entryId:     hedef Entry
 */
export default function ReactionButton({ type, countInit = 0, entryId }) {
  const [count, setCount]   = useState(countInit);
  const [pressed, setPr]    = useState(false);   // sadece kullanıcının kendi tepkisi
  const [busy, setBusy]     = useState(false);

  const iconName = type === 'Like'
        ? (pressed ? 'thumbs-up'   : 'thumbs-up-outline')
        : (pressed ? 'thumbs-down' : 'thumbs-down-outline');

  const toggle = async () => {
    if (busy) return;
    setBusy(true);

    // optimistic
    setPr(!pressed);
    setCount(c => c + (pressed ? -1 : 1));

    try {
      await axios.post(`${BASE}/api/forum/entry/tepki`, {
        entryId,
        tepki: type,
      });
    } catch (e) {
      // geri al
      setPr(pressed);
      setCount(c => c + (pressed ? 1 : -1));
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity style={styles.row} onPress={toggle} disabled={busy}>
      {busy
        ? <ActivityIndicator size={14} color="#ff8a5c" />
        : <Icon name={iconName} size={18} color="#ff8a5c" />}
      <Text style={styles.txt}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection:'row', alignItems:'center', marginLeft:8 },
  txt: { marginLeft:2, fontSize:13, color:'#ff8a5c', fontWeight:'600' },
});
