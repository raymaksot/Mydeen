import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { api } from '../api/client';
import type { Ayah } from '../types/+api';
import { findLocalAudio } from '../offline/OfflineManager';

type QItem = Pick<Ayah, 'id' | 'surahId' | 'numberInSurah'>;

type PlayerState = {
  sound?: Audio.Sound;
  queue: QItem[];
  index: number;
  current?: QItem;
  isPlaying: boolean;
  onChange?: (q: QItem | undefined) => void; // для авто-скролла
  setQueue: (items: QItem[], startIndex: number) => Promise<void>;
  playAt: (index: number) => Promise<void>;
  toggle: () => Promise<void>;
  next: () => Promise<void>;
  stop: () => Promise<void>;
};

export const usePlayer = create<PlayerState>((set, get) => ({
  queue: [],
  index: -1,
  isPlaying: false,

  async setQueue(items, startIndex) {
    set({ queue: items, index: startIndex });
    await get().playAt(startIndex);
  },

  async playAt(i) {
    const { queue, sound } = get();
    if (!queue[i]) return;

    if (sound) await sound.unloadAsync();

    const item = queue[i];
    // оффлайн: ищем локальный файл (mp3)
    const local = await findLocalAudio(item.surahId, item.numberInSurah);
    let sourceUri = local;
    if (!sourceUri) {
      const { url } = await api.getAudioUrl(item.id, 'default');
      sourceUri = url;
    }
    const { sound: s } = await Audio.Sound.createAsync({ uri: sourceUri! }, { shouldPlay: true });
    s.setOnPlaybackStatusUpdate(async (st: AVPlaybackStatus) => {
      if ('didJustFinish' in st && st.didJustFinish) await get().next(); // авто-следующий
    });

    set({ sound: s, index: i, current: item, isPlaying: true });
    get().onChange?.(item);
    api.setProgress({ surahId: item.surahId, ayahNumber: item.numberInSurah }).catch(() => {});
  },

  async toggle() {
    const s = get().sound; if (!s) return;
    const st = await s.getStatusAsync();
    if ('isPlaying' in st && st.isPlaying) { await s.pauseAsync(); set({ isPlaying: false }); }
    else { await s.playAsync(); set({ isPlaying: true }); }
  },

  async next() {
    const { index, queue } = get();
    const ni = index + 1;
    if (ni < queue.length) await get().playAt(ni);
    else set({ isPlaying: false });
  },

  async stop() {
    if (get().sound) { await get().sound!.stopAsync(); set({ isPlaying: false }); }
  },
}));
