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

let progressInterval: ReturnType<typeof setInterval> | null = null;

function stopProgressTracking() {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
}

function startProgressTracking(getState: () => PlayerStore, setState: (partial: Partial<PlayerStore>) => void) {
  stopProgressTracking();
  progressInterval = setInterval(() => {
    try {
      const state = getState();
      if (!state.isPlaying) return;

      const newProgress = state.progress + 0.3;

      if (newProgress >= state.duration) {
        const { queue, queueIndex, repeat } = state;
        if (repeat === 'one') {
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
            setState({ isPlaying: false, progress: state.duration });
            stopProgressTracking();
          }
        }
      } else {
        setState({ progress: newProgress });
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

  playTrack: (track, queue, index) => {
    const state = get();
    const newQueue = queue || [track];
    const newIndex = index !== undefined ? index : newQueue.indexOf(track);

    // Toggle if same track
    if (state.currentTrack?.id === track.id) {
      if (state.isPlaying) {
        stopProgressTracking();
        set({ isPlaying: false });
      } else {
        startProgressTracking(get, set);
        set({ isPlaying: true });
      }
      return;
    }

    stopProgressTracking();

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      isPlaying: true,
      isLoading: false,
      progress: 0,
      duration: track.duration || 30,
      error: null,
    });

    startProgressTracking(get, set);
  },

  togglePlay: () => {
    const { currentTrack, isPlaying } = get();
    if (!currentTrack) return;

    if (isPlaying) {
      stopProgressTracking();
      set({ isPlaying: false });
    } else {
      startProgressTracking(get, set);
      set({ isPlaying: true });
    }
  },

  pause: () => {
    stopProgressTracking();
    set({ isPlaying: false });
  },

  resume: () => {
    startProgressTracking(get, set);
    set({ isPlaying: true });
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

    if (progress > 3) {
      set({ progress: 0 });
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;

    if (queue[prevIdx]) {
      get().playTrack(queue[prevIdx], queue, prevIdx);
    }
  },

  seek: (time) => set({ progress: time }),
  setProgress: (p) => set({ progress: p }),
  toggleShuffle: () => set(s => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set(s => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    return { repeat: modes[(modes.indexOf(s.repeat) + 1) % modes.length] };
  }),
  toggleFullPlayer: () => set(s => ({ showFullPlayer: !s.showFullPlayer })),

  clearQueue: () => {
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
