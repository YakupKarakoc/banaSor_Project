import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import axios from 'axios';

const BASE = 'http://10.0.2.2:3000';

export default function LikeButton({ soruId, likedInit = false, countInit = 0, dark = false }) {
  const [liked, setLiked] = useState(!!likedInit);
  const [count, setCount] = useState(Number(countInit));
  const [busy,  setBusy]  = useState(false);

  const toggle = async () => {
    if (busy) return;
    // optimistic
    const optimisticLiked = !liked;
    const optimisticCount = count + (optimisticLiked ? 1 : -1);
    setLiked(optimisticLiked);
    setCount(optimisticCount);

    setBusy(true);
    try {
      const { data } = await axios.post(`${BASE}/api/soru/begeni`, { soruId });
      // backend kesin sonucu döndürüyorsa onu kullan
      if (typeof data?.likeCount === 'number') {
        setLiked(!!data.liked);
        setCount(Number(data.likeCount));
      }
      // *** eğer kullanıcı ID bazlı cache istersen burada AsyncStorage.setItem('question_like_'+userId+'_'+soruId, data.liked?'1':'0')
    } catch (err) {
      // rollback
      setLiked(liked);
      setCount(count);
      console.warn('like err', err.response?.data || err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity style={styles.row} onPress={toggle} disabled={busy}>
      {busy ? (
        <ActivityIndicator size="small" color="#f75c5b" />
      ) : (
        <Icon
          name={liked ? 'heart' : 'heart-outline'}
          size={18}
          color={liked ? '#f75c5b' : dark ? '#2D3436' : '#fff'}
        />
      )}
      <Text style={[styles.txt, { color: dark ? '#444' : '#fff' }]}>{count}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row:{ flexDirection:'row',alignItems:'center',marginLeft:8 },
  txt:{ fontSize:12,marginLeft:2 },
});
