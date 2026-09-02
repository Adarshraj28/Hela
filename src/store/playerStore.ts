import { create } from 'zustand';
import type { PlayerState, RepeatMode } from '../types';

// Global HTML audio element for actual playback
let audioElement: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'auto';
  }
  return audioElement;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  volume: 0.8,
  isMuted: false,
  shuffle: false,
  repeat: 'off',
  progress: 0,
  duration: 0,
  isLoading: false,
  error: null,
  showFullPlayer: false,

  playTrack: (track, queue, index) => {
    const audio = getAudio();
    const state = get();
    
    // If playing the same track, just toggle play
    if (state.currentTrack?.id === track.id) {
      if (state.isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio.play().catch(() => set({ error: 'Playback failed' }));
        set({ isPlaying: true });
      }
      return;
    }

    const newQueue = queue || [track];
    const newIndex = index !== undefined ? index : 0;

    audio.src = track.previewUrl || '';
    audio.load();

    audio.play().catch(() => {
      set({ error: 'Playback failed. No preview available.' });
    });

    // Set up event listeners
    audio.ontimeupdate = () => {
      set({ progress: audio.currentTime });
    };
    audio.onloadedmetadata = () => {
      set({ duration: audio.duration, isLoading: false });
    };
    audio.onended = () => {
      const s = get();
      if (s.repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        s.next();
      }
    };
    audio.onwaiting = () => set({ isLoading: true });
    audio.oncanplay = () => set({ isLoading: false });
    audio.onerror = () => set({ error: 'Failed to load track preview', isLoading: false });

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex,
      isPlaying: true,
      progress: 0,
      duration: track.duration || 0,
      error: null,
      isLoading: false,
    });
  },

  playQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return;
    const { playTrack } = get();
    playTrack(tracks[startIndex], tracks, startIndex);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (!currentTrack) return;
    
    if (isPlaying) {
      getAudio().pause();
      set({ isPlaying: false });
    } else {
      if (getAudio().src) {
        getAudio().play().catch(() => set({ error: 'Playback failed' }));
        set({ isPlaying: true });
      } else if (queue.length > 0) {
        get().next();
      }
    }
  },

  pause: () => {
    getAudio().pause();
    set({ isPlaying: false });
  },

  resume: () => {
    if (getAudio().src) {
      getAudio().play().catch(() => set({ error: 'Playback failed' }));
      set({ isPlaying: true });
    }
  },

  next: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
      // Avoid same track
      if (nextIndex === queueIndex && queue.length > 1) {
        nextIndex = (nextIndex + 1) % queue.length;
      }
    } else {
      nextIndex = queueIndex + 1;
    }

    if (nextIndex >= queue.length) {
      if (repeat === 'all') {
        nextIndex = 0;
      } else {
        getAudio().pause();
        set({ isPlaying: false, progress: 0 });
        return;
      }
    }

    get().playTrack(queue[nextIndex], queue, nextIndex);
  },

  previous: () => {
    const { queue, queueIndex, progress } = get();
    if (queue.length === 0) return;

    // If more than 3 seconds in, restart current track
    if (progress > 3) {
      getAudio().currentTime = 0;
      set({ progress: 0 });
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1;

    get().playTrack(queue[prevIndex], queue, prevIndex);
  },

  seek: (time) => {
    const audio = getAudio();
    if (audio.src) {
      audio.currentTime = time;
      set({ progress: time });
    }
  },

  setVolume: (volume) => {
    const audio = getAudio();
    audio.volume = volume;
    set({ volume, isMuted: volume === 0 });
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const audio = getAudio();
    if (isMuted) {
      audio.volume = volume || 0.8;
      set({ isMuted: false });
    } else {
      audio.volume = 0;
      set({ isMuted: true });
    }
  },

  toggleShuffle: () => {
    set((state) => ({ shuffle: !state.shuffle }));
  },

  cycleRepeat: () => {
    set((state) => {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(state.repeat);
      return { repeat: modes[(currentIndex + 1) % modes.length] };
    });
  },

  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  toggleFullPlayer: () => set((state) => ({ showFullPlayer: !state.showFullPlayer })),

  removeFromQueue: (index) => {
    const { queue, queueIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    let newIndex = queueIndex;
    if (index < queueIndex) newIndex--;
    if (index === queueIndex && newIndex >= newQueue.length) newIndex = newQueue.length - 1;
    set({ queue: newQueue, queueIndex: Math.max(0, newIndex) });
  },

  clearQueue: () => {
    getAudio().pause();
    set({ queue: [], queueIndex: -1, isPlaying: false, currentTrack: null, progress: 0, duration: 0 });
  },

  reorderQueue: (fromIndex, toIndex) => {
    const { queue, queueIndex } = get();
    const newQueue = [...queue];
    const [moved] = newQueue.splice(fromIndex, 1);
    newQueue.splice(toIndex, 0, moved);
    
    // Track the current playing item's new index
    let newIndex = queueIndex;
    if (fromIndex === queueIndex) {
      newIndex = toIndex;
    } else if (fromIndex < queueIndex && toIndex >= queueIndex) {
      newIndex = queueIndex - 1;
    } else if (fromIndex > queueIndex && toIndex <= queueIndex) {
      newIndex = queueIndex + 1;
    }
    
    set({ queue: newQueue, queueIndex: newIndex });
  },
}));

// Initialize volume on load
getAudio().volume = 0.8;
