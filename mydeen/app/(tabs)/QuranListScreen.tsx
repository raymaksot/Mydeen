import React from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api } from '../api/client';
import type { Surah, Progress } from '../types/+api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";

export default function QuranListScreen() {
  const router = useRouter();
  const [surahs, setSurahs] = React.useState<Surah[]>([]);
  const [q, setQ] = React.useState('');
  const [progress, setProgress] = React.useState<Progress | undefined>(undefined);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 30;
 
  // Кэширование сур через AsyncStorage
  const loadSurahs = async () => {
  setLoading(true);
  setError(null);
  try {
    const cached = await AsyncStorage.getItem('surahs');
    let surahList: Surah[] = cached ? JSON.parse(cached) : [];

    // если кэш битый/усечённый — принудительно перезагружаем
    if (!surahList.length || surahList.length < 100) {
      surahList = await api.getSurahs();      // теперь бэк даёт 114
      await AsyncStorage.setItem('surahs', JSON.stringify(surahList));
    }

    setSurahs(surahList);
  } catch (e: any) {
    setError(e.message || 'Failed to load surahs');
    Alert.alert('Ошибка', e.message || 'Не удалось загрузить список сур');
  } finally {
    setLoading(false);
  }
};


  // Кэширование прогресса
  const loadProgress = async () => {
    try {
      const cached = await AsyncStorage.getItem('progress');
      let p: Progress | undefined = cached ? JSON.parse(cached) : undefined;
      if (!p) {
        p = await api.getProgress().catch(() => undefined);
        if (p) await AsyncStorage.setItem('progress', JSON.stringify(p));
      }
      if (p) setProgress(p);
    } catch {}
  };

  React.useEffect(() => {
    loadSurahs();
    loadProgress();
  }, []);

  // Пагинация
  const filtered = q ? surahs.filter(s => (s.englishName + s.arabicName).toLowerCase().includes(q.toLowerCase())) : surahs;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 64 }}>
      <Text style={{ fontSize: 24, fontWeight: '600', marginBottom: 8 }}>Al - Quran</Text>
      <TextInput placeholder="Search surah or Verse" value={q} onChangeText={setQ}
        style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 12, marginBottom: 12 }} />
      <TouchableOpacity
        disabled={!progress}
        onPress={() => progress && router.push({
          pathname: "/SurahDetailScreen",
          params: { surahId: progress.surahId, ayahNumber: progress.ayahNumber }
        })}
        style={{ opacity: progress ? 1 : 0.5, backgroundColor: '#111', borderRadius: 14, padding: 16, marginBottom: 12 }}>
        <Text style={{ color: 'white' }}>Continue reading</Text>
        <Text style={{ color: 'white', opacity: 0.8 }}>
          {progress ? `Surah ${progress.surahId} : ${progress.ayahNumber}` : '—'}
        </Text>
      </TouchableOpacity>

      {error && <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>}

      {loading ? <ActivityIndicator /> :
        <>
          <FlatList
            data={paged}
            keyExtractor={(i) => String(i.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push({
                  pathname: '/SurahDetailScreen',
                  params: { surahId: item.id }
                })}
                style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 10 }}>
                <Text style={{ fontWeight: '600' }}>{item.englishName}</Text>
                <Text style={{ color: '#666' }}>{item.arabicName} • {item.ayahCount} Verses</Text>
              </TouchableOpacity>
            )}
          />
          {totalPages > 1 && (
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 12 }}>
              <TouchableOpacity disabled={page === 1} onPress={() => setPage(page - 1)} style={{ padding: 10, opacity: page === 1 ? 0.5 : 1 }}>
                <Text>← Prev</Text>
              </TouchableOpacity>
              <Text style={{ marginHorizontal: 16 }}>{page} / {totalPages}</Text>
              <TouchableOpacity disabled={page === totalPages} onPress={() => setPage(page + 1)} style={{ padding: 10, opacity: page === totalPages ? 0.5 : 1 }}>
                <Text>Next →</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      }
    </View>
  );
}
