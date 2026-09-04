import { create } from 'zustand';
import { Track, RepeatMode } from '../types';

interface PlayerStore {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  showFullPlayer: boolean;

  playTrack: (track: Track, queue?: Track[], index?: number) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  toggleFullPlayer: () => void;
  clearQueue: () => void;
  removeFromQueue: (index: number) => void;
  setProgress: (p: number) => void;
}

// ── Safe audio module import ──
// expo-audio may not be available in all Expo Go versions
let AudioModule: any = null;
try {
  AudioModule = require('expo-audio');
} catch {
  console.warn('expo-audio not available — playback will use UI-only mode');
}

let audioPlayer: any = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;
let audioModeConfigured = false;

async function ensureAudioMode() {
  if (!AudioModule || audioModeConfigured) return;
  try {
    await AudioModule.setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    });
    audioModeConfigured = true;
  } catch {}
}

async function playAudio(url: string): Promise<boolean> {
  if (!AudioModule) return false;
  try {
    // Stop existing playback
    if (audioPlayer) {
      try {
        audioPlayer.pause();
        audioPlayer.release();
      } catch {}
      audioPlayer = null;
    }
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    await ensureAudioMode();

    // Create new player with the audio URL
    audioPlayer = AudioModule.createAudioPlayer(url);
    audioPlayer.play();
    return true;
  } catch (e) {
    console.warn('Audio playback error:', e);
    audioPlayer = null;
    return false;
  }
}

function stopProgressTracking() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function startProgressTracking(getState: () => PlayerStore, setState: (partial: Partial<PlayerStore>) => void) {
  stopProgressTracking();
  progressInterval = setInterval(() => {
    if (!audioPlayer) {
      stopProgressTracking();
      return;
    }
    try {
      if (audioPlayer.paused) return;

      const currentTime = audioPlayer.currentTime || 0;
      const duration = audioPlayer.duration || 0;
      const repeat = getState().repeat;
      const queue = getState().queue;
      const queueIndex = getState().queueIndex;

      // Check if track ended
      if (duration > 0 && currentTime >= duration - 0.3) {
        if (repeat === 'one') {
          audioPlayer.seekTo(0);
          audioPlayer.play();
          setState({ progress: 0 });
        } else {
          const nextIdx = queueIndex + 1;
          if (nextIdx < queue.length) {
            stopProgressTracking();
            getState().next();
          } else if (repeat === 'all') {
            stopProgressTracking();
            const firstTrack = queue[0];
            if (firstTrack) getState().playTrack(firstTrack, queue, 0);
          } else {
            setState({ isPlaying: false, progress: duration });
            stopProgressTracking();
          }
        }
      } else {
        setState({ progress: currentTime, duration: duration > 0 ? duration : getState().duration });
      }
    } catch {}
  }, 300);
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  shuffle: false,
  repeat: 'off',
  error: null,
  showFullPlayer: false,

  playTrack: async (track, queue, index) => {
    const state = get();
    const newQueue = queue || [track];
    const newIndex = index !== undefined ? index : newQueue.indexOf(track);

    // Toggle if same track
    if (state.currentTrack?.id === track.id) {
      if (audioPlayer && AudioModule) {
        if (audioPlayer.paused) {
          audioPlayer.play();
          set({ isPlaying: true });
          startProgressTracking(get, set);
        } else {
          audioPlayer.pause();
          set({ isPlaying: false });
          stopProgressTracking();
        }
      } else {
        set(s => ({ isPlaying: !s.isPlaying }));
      }
      return;
    }

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      isPlaying: true,
      isLoading: true,
      progress: 0,
      duration: track.duration || 30,
      error: null,
    });

    // Try real audio playback
    if (track.previewUrl && AudioModule) {
      const success = await playAudio(track.previewUrl);
      if (success) {
        startProgressTracking(get, set);
        // Update duration from actual audio after a brief delay
        setTimeout(() => {
          try {
            const actualDuration = audioPlayer?.duration;
            if (actualDuration && actualDuration > 0) {
              set({ duration: actualDuration, isLoading: false });
            } else {
              set({ isLoading: false });
            }
          } catch {
            set({ isLoading: false });
          }
        }, 500);
      } else {
        // Audio module failed — still show player UI with progress simulation
        set({ isLoading: false, error: 'Real audio unavailable' });
      }
    } else {
      // No preview URL or no audio module — UI-only mode
      set({ isLoading: false });
    }
  },

  togglePlay: () => {
    const { currentTrack, isPlaying } = get();
    if (!currentTrack) return;

    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.pause();
        set({ isPlaying: false });
        stopProgressTracking();
      } else {
        audioPlayer.play();
        set({ isPlaying: true });
        startProgressTracking(get, set);
      }
    } else {
      // UI-only toggle
      set(s => ({ isPlaying: !s.isPlaying }));
    }
  },

  pause: () => {
    if (audioPlayer) {
      try { audioPlayer.pause(); } catch {}
    }
    set({ isPlaying: false });
    stopProgressTracking();
  },

  resume: () => {
    if (audioPlayer) {
      try { audioPlayer.play(); } catch {}
      set({ isPlaying: true });
      startProgressTracking(get, set);
    } else {
      set({ isPlaying: true });
    }
  },

  next: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
    } else {
      nextIdx = queueIndex + 1;
    }

    if (nextIdx >= queue.length) {
      if (repeat === 'all') {
        nextIdx = 0;
      } else {
        set({ isPlaying: false, progress: 0 });
        stopProgressTracking();
        return;
      }
    }

    if (queue[nextIdx]) {
      get().playTrack(queue[nextIdx], queue, nextIdx);
    }
  },

  previous: () => {
    const { queue, queueIndex, progress } = get();
    if (queue.length === 0) return;

    if (progress > 3 && audioPlayer) {
      try { audioPlayer.seekTo(0); } catch {}
      set({ progress: 0 });
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;

    if (queue[prevIdx]) {
      get().playTrack(queue[prevIdx], queue, prevIdx);
    }
  },

  seek: (time) => {
    if (audioPlayer) {
      try { audioPlayer.seekTo(time); } catch {}
    }
    set({ progress: time });
  },

  setProgress: (p) => set({ progress: p }),
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    return { repeat: modes[(modes.indexOf(s.repeat) + 1) % modes.length] };
  }),
  toggleFullPlayer: () => set(s => ({ showFullPlayer: !s.showFullPlayer })),

  clearQueue: () => {
    if (audioPlayer) {
      try { audioPlayer.pause(); audioPlayer.release(); } catch {}
      audioPlayer = null;
    }
    stopProgressTracking();
    set({
      queue: [], queueIndex: -1, isPlaying: false, currentTrack: null,
      progress: 0, duration: 0, error: null,
    });
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
