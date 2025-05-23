// src/utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async token => {
  try {
    await AsyncStorage.setItem('authToken', token);
  } catch (e) {
    console.error('Token kaydedilemedi', e);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (e) {
    console.error('Token okunamadı', e);
    return null;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem('authToken');
  } catch (e) {
    console.error('Token silinemedi', e);
  }
};