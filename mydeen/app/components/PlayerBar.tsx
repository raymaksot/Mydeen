import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { usePlayer } from '../store/usePlayer';

export const PlayerBar = () => {
  const { current, isPlaying, toggle, next } = usePlayer();
  if (!current) return null;
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text numberOfLines={1} style={{ maxWidth: '70%' }}>Surah {current.surahId} • Ayah {current.numberInSurah}</Text>
      <View style={{ flexDirection: 'row', gap: 18 }}>
        <TouchableOpacity onPress={toggle}><Text>{isPlaying ? '⏸' : '▶'}</Text></TouchableOpacity>
        <TouchableOpacity onPress={next}><Text>⏭</Text></TouchableOpacity>
      </View>
    </View>
  );
};
