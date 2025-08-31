import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { api } from './api/client';
import type { Ayah } from './types/+api';
import AyahCard from './components/AyahCard';
import { usePlayer } from './store/usePlayer';
import { downloadSurahDirect } from './offline/OfflineManager';

export default function SurahDetailScreen() {
  const { params } = useRoute<any>();
  const surahId = params?.surahId ?? 1;
  const ayahNumber = params?.ayahNumber as number | undefined;

  const [ayahs, setAyahs] = React.useState<Ayah[]>([]);
  const [loading, setLoading] = React.useState(true);
  const listRef = React.useRef<FlatList<Ayah>>(null);
  const player = usePlayer();

  React.useEffect(() => {
    setLoading(true);
    api.getAyahs(surahId).then(setAyahs).finally(() => setLoading(false));
  }, [surahId]);

  // авто-скролл при смене текущего аята
  React.useEffect(() => {
    player.onChange = (q) => {
      if (!q) return;
      const idx = ayahs.findIndex(a => a.id === q.id);
      if (idx >= 0) listRef.current?.scrollToIndex({ index: idx, viewPosition: 0.35 });
    };
    return () => { player.onChange = undefined; };
  }, [ayahs]);

  // стартовая очередь
  React.useEffect(() => {
    if (!ayahs.length) return;
    const startIdx = ayahNumber ? Math.max(0, ayahs.findIndex(a => a.numberInSurah === ayahNumber)) : 0;
    const queue = ayahs.map(a => ({ id: a.id, surahId: a.surahId, numberInSurah: a.numberInSurah }));
    player.setQueue(queue, startIdx).catch(()=>{});
  }, [ayahs]);

  const onOffline = async () => {
    try { await downloadSurahDirect(surahId, ayahs, 'default', 'en'); Alert.alert('Offline', 'Surah downloaded'); }
    catch { Alert.alert('Offline', 'Download failed'); }
  };

  return (
    <View style={{ flex: 1, padding: 16, paddingBottom: 64 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 20, fontWeight: '700' }}>Surah {surahId}</Text>
        <TouchableOpacity onPress={onOffline}><Text>⇩ Offline</Text></TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator /> :
        <FlatList
          ref={listRef}
          data={ayahs}
          keyExtractor={(i) => i.id}
          getItemLayout={(_, index) => ({ length: 140, offset: 140 * index, index })}
          renderItem={({ item }) => (
            <AyahCard ayah={item} active={player.current?.id === item.id && player.isPlaying} />
          )}
        />
      }
    </View>
  );
}
