import { create } from 'zustand';
import type { PlayerState, RepeatMode } from '../types';

// ---- Global Audio Element ----
let audioEl: HTMLAudioElement | null = null;
function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio();
    audioEl.preload = 'auto';
    // Do NOT set crossOrigin — it blocks playback of iTunes preview URLs
  }
  return audioEl;
}

// ---- Media Session API (lock screen / OS integration) ----
function updateMediaSession(track: import('../types').Track | null) {
  if (!('mediaSession' in navigator) || !track) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: track.album || '',
    artwork: track.artwork ? [
      { src: track.artwork, sizes: '512x512', type: 'image/jpeg' },
    ] : [],
  });
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

    // Toggle play/pause if same track
    if (state.currentTrack?.id === track.id && !track.previewUrl?.startsWith('data:')) {
      if (state.isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio.play().catch((err) => {
          console.error('Play failed:', err);
          set({ error: 'Playback failed' });
        });
        set({ isPlaying: true });
      }
      return;
    }

    const newQueue = queue || [track];
    const newIndex = index !== undefined ? index : newQueue.indexOf(track);

    // Clean up previous listeners
    audio.ontimeupdate = null;
    audio.onloadedmetadata = null;
    audio.onended = null;
    audio.onwaiting = null;
    audio.oncanplay = null;
    audio.onerror = null;

    if (!track.previewUrl) {
      set({ error: 'No preview available for this track', isLoading: false });
      return;
    }

    audio.src = track.previewUrl;
    audio.load();

    audio.ontimeupdate = () => {
      if (!audio.paused) set({ progress: audio.currentTime });
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
    audio.onerror = (e) => {
      console.error('Audio error:', e);
      set({ error: 'Failed to load preview', isLoading: false });
    };

    audio.play().catch((err) => {
      console.error('Autoplay blocked:', err);
      set({ error: 'Tap play to start listening', isPlaying: false });
    });

    updateMediaSession(track);

    // Media Session action handlers
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => get().resume());
      navigator.mediaSession.setActionHandler('pause', () => get().pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => get().previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => get().next());
    }

    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      isPlaying: true,
      progress: 0,
      duration: track.duration || 0,
      error: null,
      isLoading: false,
    });
  },

  playQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return;
    get().playTrack(tracks[startIndex], tracks, startIndex);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack, queue } = get();
    if (!currentTrack) return;
    const audio = getAudio();

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      if (audio.src) {
        audio.play().catch((err) => {
          console.error('Resume failed:', err);
          set({ error: 'Playback failed' });
        });
        set({ isPlaying: true });
      } else if (queue.length > 0) {
        get().next();
      }
    }
  },

  pause: () => { getAudio().pause(); set({ isPlaying: false }); },
  resume: () => {
    if (getAudio().src) {
      getAudio().play().catch(() => {});
      set({ isPlaying: true });
    }
  },

  next: () => {
    const { queue, queueIndex, shuffle, repeat } = get();
    if (queue.length === 0) return;

    let nextIdx: number;
    if (shuffle) {
      nextIdx = Math.floor(Math.random() * queue.length);
      if (nextIdx === queueIndex && queue.length > 1) nextIdx = (nextIdx + 1) % queue.length;
    } else {
      nextIdx = queueIndex + 1;
    }

    if (nextIdx >= queue.length) {
      if (repeat === 'all') {
        nextIdx = 0;
      } else {
        getAudio().pause();
        set({ isPlaying: false, progress: 0 });
        return;
      }
    }

    get().playTrack(queue[nextIdx], queue, nextIdx);
  },

  previous: () => {
    const { queue, queueIndex, progress } = get();
    if (queue.length === 0) return;

    if (progress > 3) {
      getAudio().currentTime = 0;
      set({ progress: 0 });
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;
    get().playTrack(queue[prevIdx], queue, prevIdx);
  },

  seek: (time) => {
    const audio = getAudio();
    if (audio.src) { audio.currentTime = time; set({ progress: time }); }
  },

  setVolume: (volume) => {
    const audio = getAudio();
    audio.volume = volume;
    set({ volume, isMuted: volume === 0 });
    try { localStorage.setItem('hela-volume', String(volume)); } catch {}
  },

  toggleMute: () => {
    const { isMuted, volume } = get();
    const audio = getAudio();
    if (isMuted) { audio.volume = volume || 0.8; set({ isMuted: false }); }
    else { audio.volume = 0; set({ isMuted: true }); }
  },

  toggleShuffle: () => set((s) => ({ shuffle: !s.shuffle })),
  cycleRepeat: () => set((s) => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    return { repeat: modes[(modes.indexOf(s.repeat) + 1) % modes.length] };
  }),

  setProgress: (p) => set({ progress: p }),
  setDuration: (d) => set({ duration: d }),
  setLoading: (l) => set({ isLoading: l }),
  setError: (e) => set({ error: e }),
  toggleFullPlayer: () => set((s) => ({ showFullPlayer: !s.showFullPlayer })),

  removeFromQueue: (idx) => {
    const { queue, queueIndex } = get();
    const newQueue = queue.filter((_, i) => i !== idx);
    let newIdx = queueIndex;
    if (idx < queueIndex) newIdx--;
    if (idx === queueIndex) newIdx = Math.min(newIdx, newQueue.length - 1);
    set({ queue: newQueue, queueIndex: Math.max(0, newIdx) });
  },

  clearQueue: () => {
    getAudio().pause();
    set({ queue: [], queueIndex: -1, isPlaying: false, currentTrack: null, progress: 0, duration: 0 });
    if ('mediaSession' in navigator) navigator.mediaSession.metadata = null;
  },

  reorderQueue: (from, to) => {
    const { queue, queueIndex } = get();
    const q = [...queue];
    const [item] = q.splice(from, 1);
    q.splice(to, 0, item);
    let newIdx = queueIndex;
    if (from === queueIndex) newIdx = to;
    else if (from < queueIndex && to >= queueIndex) newIdx = queueIndex - 1;
    else if (from > queueIndex && to <= queueIndex) newIdx = queueIndex + 1;
    set({ queue: q, queueIndex: newIdx });
  },
}));

// Init volume from localStorage
try {
  const saved = localStorage.getItem('hela-volume');
  if (saved) getAudio().volume = parseFloat(saved);
  else getAudio().volume = 0.8;
} catch { getAudio().volume = 0.8; }

// ---- Keyboard Shortcuts ----
if (typeof window !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.contentEditable === 'true') return;

    const store = usePlayerStore.getState();
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        store.togglePlay();
        break;
      case 'KeyM':
        store.toggleMute();
        break;
      case 'ArrowLeft':
        if (e.shiftKey) store.previous();
        else store.seek(Math.max(0, store.progress - 10));
        break;
      case 'ArrowRight':
        if (e.shiftKey) store.next();
        else store.seek(Math.min(store.duration, store.progress + 10));
        break;
    }
  });
}
