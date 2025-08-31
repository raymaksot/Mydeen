import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, View, Text, Alert, useWindowDimensions } from 'react-native';
// Если Expo Router:
import { useLocalSearchParams } from 'expo-router';
// Если @react-navigation/native:  import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHTML from 'react-native-render-html';
import { api } from './api/client';
import type { Tafsir } from './types/+api';

export default function TafsirScreen() {
  // --- Получение параметров ---
  // Expo Router:
  const { ayahId } = useLocalSearchParams<{ ayahId: string }>();
  // React Navigation вариант:
  // const { params } = useRoute<any>(); const ayahId = params.ayahId as string;

  const { width } = useWindowDimensions();
  const [t, setT] = useState<Tafsir | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!ayahId) return;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const key = `tafsir:${ayahId}`;
        const cached = await AsyncStorage.getItem(key);
        let data: Tafsir | null = cached ? JSON.parse(cached) : null;
        if (!data) {
          data = await api.getTafsir(ayahId, 'en'); // 'ru' при необходимости
          await AsyncStorage.setItem(key, JSON.stringify(data));
        }
        if (!cancelled) setT(data);
      } catch (e: any) {
        const msg = e?.message ?? 'Ошибка загрузки тафсира';
        if (!cancelled) setError(msg);
        Alert.alert('Ошибка', msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [ayahId]);

  if (loading) {
    return <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><ActivityIndicator /></View>;
  }
  if (error) {
    return <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}><Text style={{ color:'red' }}>{error}</Text></View>;
  }
  if (!t) return null;

  // t.text — это HTML
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {!!t.source && <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{t.source}</Text>}
      <RenderHTML contentWidth={width} source={{ html: t.text }} baseStyle={{ fontSize: 16, lineHeight: 22 }} />
    </ScrollView>
  );
}
