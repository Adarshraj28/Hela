import { create } from 'zustand';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Track, RepeatMode } from '../types';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  showFullPlayer: boolean;
  sound: Audio.Sound | null;

  playTrack: (track: Track, queue?: Track[], index?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  seek: (time: number) => Promise<void>;
  setVolume: (vol: number) => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleFullPlayer: () => void;
  clearQueue: () => Promise<void>;
  removeFromQueue: (index: number) => void;
}

async function unloadSound(sound: Audio.Sound | null) {
  if (sound) {
    try { await sound.unloadAsync(); } catch {}
  }
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  shuffle: false,
  repeat: 'off',
  error: null,
  showFullPlayer: false,
  sound: null,

  playTrack: async (track, queue, index) => {
    const state = get();
    const newQueue = queue || [track];
    const newIndex = index !== undefined ? index : newQueue.indexOf(track);

    // Toggle if same track
    if (state.currentTrack?.id === track.id && state.sound) {
      if (state.isPlaying) {
        await state.sound.pauseAsync();
        set({ isPlaying: false });
      } else {
        await state.sound.playAsync();
        set({ isPlaying: true });
      }
      return;
    }

    if (!track.previewUrl) {
      set({ error: 'No audio available', isLoading: false });
      return;
    }

    // Unload old sound
    await unloadSound(state.sound);

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      isPlaying: false,
      isLoading: true,
      progress: 0,
      duration: track.duration || 0,
      error: null,
    });

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: track.previewUrl! },
        { shouldPlay: true, volume: state.volume },
        (status: AVPlaybackStatus) => {
          if (!status.isLoaded) return;
          if (status.isPlaying) {
            set({
              progress: status.positionMillis / 1000,
              duration: status.durationMillis ? status.durationMillis / 1000 : 0,
            });
          }
          if (status.didJustFinish) {
            const s = get();
            if (s.repeat === 'one') {
              sound.setPositionAsync(0);
              sound.playAsync();
            } else {
              s.next();
            }
          }
        }
      );

      set({ sound, isPlaying: true, isLoading: false });
    } catch (err: any) {
      set({ error: `Playback failed: ${err.message}`, isPlaying: false, isLoading: false });
    }
  },

  togglePlay: async () => {
    const { sound, isPlaying, currentTrack } = get();
    if (!sound || !currentTrack) return;
    if (isPlaying) {
      await sound.pauseAsync();
      set({ isPlaying: false });
    } else {
      await sound.playAsync();
      set({ isPlaying: true });
    }
  },

  pause: async () => {
    const { sound } = get();
    if (sound) await sound.pauseAsync();
    set({ isPlaying: false });
  },

  resume: async () => {
    const { sound } = get();
    if (sound) {
      await sound.playAsync();
      set({ isPlaying: true });
    }
  },

  next: async () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
    }

    if (nextIdx >= queue.length) {
      if (repeat === 'all') nextIdx = 0;
      else { set({ isPlaying: false, progress: 0 }); return; }
    }

    if (queue[nextIdx]) {
      await get().playTrack(queue[nextIdx], queue, nextIdx);
    }
  },

  previous: async () => {
    const { queue, queueIndex, progress, sound } = get();
    if (queue.length === 0) return;

    if (progress > 3 && sound) {
      await sound.setPositionAsync(0);
      set({ progress: 0 });
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;

    if (queue[prevIdx]) {
      await get().playTrack(queue[prevIdx], queue, prevIdx);
    }
  },

  seek: async (time) => {
    const { sound } = get();
    if (sound) {
      await sound.setPositionAsync(time * 1000);
      set({ progress: time });
    }
  },

  setVolume: async (vol) => {
    const { sound } = get();
    if (sound) await sound.setVolumeAsync(vol);
    set({ volume: vol });
  },

  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    return { repeat: modes[(modes.indexOf(s.repeat) + 1) % modes.length] };
  }),
  toggleFullPlayer: () => set(s => ({ showFullPlayer: !s.showFullPlayer })),

  clearQueue: async () => {
    const { sound } = get();
    await unloadSound(sound);
    set({ queue: [], queueIndex: -1, isPlaying: false, currentTrack: null, progress: 0, duration: 0, sound: null });
  },

  removeFromQueue: (index) => {
    const { queue, queueIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIdx = queueIndex;
    if (index < queueIndex) newIdx--;
    if (index === queueIndex) newIdx = Math.min(newIdx, newQueue.length - 1);
    set({ queue: newQueue, queueIndex: Math.max(0, newIdx) });
  },
}));
