import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Ayah } from '../types/+api';
import { usePlayer } from '../store/usePlayer';
import { useRouter } from 'expo-router';

export default function AyahCard({ ayah, active }: { ayah: Ayah; active?: boolean }) {
  const player = usePlayer();
  const router = useRouter();
  const onPlay = () => player.setQueue([{ id: ayah.id, surahId: ayah.surahId, numberInSurah: ayah.numberInSurah }], 0);

  return (
    <View style={{ borderWidth: 1, borderColor: active ? '#333' : '#eee', backgroundColor: active ? '#111' : '#fff', padding: 14, borderRadius: 12, marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ color: active ? '#fff' : '#111', fontWeight: '700' }}>{ayah.numberInSurah}</Text>
        <Text style={{ color: active ? '#fff' : '#111', fontSize: 18 }} numberOfLines={2}>{ayah.arabic}</Text>
      </View>
      <Text style={{ color: active ? '#fff' : '#333', marginBottom: 10 }}>{ayah.translation}</Text>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity onPress={onPlay}><Text style={{ color: active ? '#fff' : '#111' }}>▶ Play</Text></TouchableOpacity>
  <TouchableOpacity onPress={() => router.push({ pathname: '/TafsirScreen', params: { ayahId: ayah.id } })}><Text style={{ color: active ? '#fff' : '#111' }}>📖 Tafsir</Text></TouchableOpacity>
      </View>
    </View>
  );
}
