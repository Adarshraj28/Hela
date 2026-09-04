import { create } from 'zustand';
import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
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

let audioPlayer: AudioPlayer | null = null;
let progressInterval: ReturnType<typeof setInterval> | null = null;

function getAudioPlayer(): AudioPlayer {
  if (!audioPlayer) {
    audioPlayer = createAudioPlayer('');
  }
  return audioPlayer;
}

async function playAudio(url: string) {
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

    // Create new player with the audio URL
    audioPlayer = createAudioPlayer(url);

    // Configure audio mode for music playback
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: false,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    });

    audioPlayer.play();

    return true;
  } catch (e) {
    console.warn('Audio playback error:', e);
    return false;
  }
}

function startProgressTracking(getState: () => PlayerStore, setState: (partial: Partial<PlayerStore>) => void) {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
  progressInterval = setInterval(() => {
    if (audioPlayer && !audioPlayer.paused) {
      try {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        const repeat = getState().repeat;
        const queue = getState().queue;
        const queueIndex = getState().queueIndex;

        // Check if track ended
        if (duration > 0 && currentTime >= duration - 0.5) {
          if (repeat === 'one') {
            audioPlayer.seekTo(0);
            audioPlayer.play();
            setState({ progress: 0 });
          } else {
            // Auto-advance to next
            const nextIdx = queueIndex + 1;
            if (nextIdx < queue.length) {
              clearInterval(progressInterval!);
              progressInterval = null;
              getState().next();
            } else if (repeat === 'all') {
              clearInterval(progressInterval!);
              progressInterval = null;
              // Play from start
              const firstTrack = queue[0];
              if (firstTrack) {
                getState().playTrack(firstTrack, queue, 0);
              }
            } else {
              setState({ isPlaying: false, progress: duration });
              clearInterval(progressInterval!);
              progressInterval = null;
            }
          }
        } else {
          setState({ progress: currentTime, duration: duration || getState().duration });
        }
      } catch {}
    }
  }, 250);
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
      if (audioPlayer) {
        if (audioPlayer.paused) {
          audioPlayer.play();
          set({ isPlaying: true });
          startProgressTracking(get, set);
        } else {
          audioPlayer.pause();
          set({ isPlaying: false });
          if (progressInterval) {
            clearInterval(progressInterval);
            progressInterval = null;
          }
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

    // Play audio from preview URL
    if (track.previewUrl) {
      const success = await playAudio(track.previewUrl);
      if (success) {
        startProgressTracking(get, set);
        // Update duration from actual audio
        try {
          const actualDuration = audioPlayer?.duration;
          if (actualDuration && actualDuration > 0) {
            set({ duration: actualDuration, isLoading: false });
          }
        } catch {}
      } else {
        set({ isLoading: false, error: 'Playback failed' });
      }
    } else {
      set({ isLoading: false, duration: track.duration || 30 });
    }
  },

  togglePlay: () => {
    const { currentTrack, isPlaying } = get();
    if (!currentTrack) return;

    if (audioPlayer) {
      if (isPlaying) {
        audioPlayer.pause();
        set({ isPlaying: false });
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
      } else {
        audioPlayer.play();
        set({ isPlaying: true });
        startProgressTracking(get, set);
      }
    }
  },

  pause: () => {
    if (audioPlayer && !audioPlayer.paused) {
      audioPlayer.pause();
    }
    set({ isPlaying: false });
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  },

  resume: () => {
    if (audioPlayer && audioPlayer.paused) {
      audioPlayer.play();
      set({ isPlaying: true });
      startProgressTracking(get, set);
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
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }
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

    // If more than 3 seconds in, restart current track
    if (progress > 3 && audioPlayer) {
      audioPlayer.seekTo(0);
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
      try {
        audioPlayer.seekTo(time);
      } catch {}
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
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
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
