import { create } from 'zustand';
import type { PlayerState, RepeatMode } from '../types';

// ---- Persistent DOM Audio Element ----
// Using a real DOM <audio> element (not new Audio()) for reliable mobile playback.
// Browsers allow play() on DOM audio elements from user gestures.
let audioEl: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = document.createElement('audio');
    audioEl.preload = 'auto';
    document.body.appendChild(audioEl);
  }
  return audioEl;
}

function setAudioSrc(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = getAudio();

    // Clean up old listeners
    audio.onloadedmetadata = null;
    audio.onerror = null;
    audio.oncanplay = null;

    audio.onloadedmetadata = () => {
      console.log('[Hela] Audio loaded, duration:', audio.duration);
      resolve();
    };

    audio.onerror = () => {
      const err = audio.error;
      console.error('[Hela] Audio error:', err?.code, err?.message);
      reject(new Error(err?.message || 'Failed to load audio'));
    };

    audio.src = url;
    audio.load();
  });
}

// ---- Media Session API ----
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
    const state = get();
    const newQueue = queue || [track];
    const newIndex = index !== undefined ? index : newQueue.indexOf(track);

    console.log('[Hela] playTrack:', track.title, 'url:', track.previewUrl?.substring(0, 80));

    // Toggle play/pause if same track
    if (state.currentTrack?.id === track.id) {
      const audio = getAudio();
      if (state.isPlaying) {
        audio.pause();
        set({ isPlaying: false });
      } else {
        audio.play().then(() => set({ isPlaying: true }))
          .catch((err) => {
            console.error('[Hela] Resume failed:', err);
            set({ error: 'Tap to resume', isPlaying: false });
          });
      }
      return;
    }

    if (!track.previewUrl) {
      set({ error: 'No audio available for this track', isLoading: false });
      return;
    }

    // Set state immediately — show MiniPlayer right away
    set({
      currentTrack: track,
      queue: newQueue,
      queueIndex: newIndex >= 0 ? newIndex : 0,
      isPlaying: false,
      progress: 0,
      duration: track.duration || 0,
      error: null,
      isLoading: true,
    });

    // Set src on the DOM audio element (synchronous), then play
    const audio = getAudio();
    audio.volume = state.isMuted ? 0 : state.volume;

    // Set up event handlers BEFORE setting src
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
    audio.onerror = () => {
      const err = audio.error;
      console.error('[Hela] Audio error during playback:', err?.code, err?.message);
      set({ error: `Playback error: ${err?.message || 'Unknown'}`, isPlaying: false, isLoading: false });
    };

    // Set src and play — must be in the same synchronous block for autoplay policy
    audio.src = track.previewUrl;
    audio.load();

    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          set({ isPlaying: true, isLoading: false });
          console.log('[Hela] Now playing:', track.title);
          updateMediaSession(track);
        })
        .catch((err) => {
          console.error('[Hela] Play failed:', err.message);
          // On mobile, autoplay might be blocked. Show clear error.
          set({
            error: 'Tap play to start listening',
            isPlaying: false,
            isLoading: false,
          });
        });
    } else {
      set({ isPlaying: true, isLoading: false });
      updateMediaSession(track);
    }

    // Media Session action handlers
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => get().resume());
      navigator.mediaSession.setActionHandler('pause', () => get().pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => get().previous());
      navigator.mediaSession.setActionHandler('nexttrack', () => get().next());
    }
  },

  playQueue: (tracks, startIndex = 0) => {
    if (tracks.length === 0) return;
    get().playTrack(tracks[startIndex], tracks, startIndex);
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) return;
    const audio = getAudio();

    if (isPlaying) {
      audio.pause();
      set({ isPlaying: false });
    } else {
      if (audio.src) {
        audio.play().then(() => set({ isPlaying: true }))
          .catch((err) => {
            console.error('[Hela] Toggle play failed:', err);
            set({ error: 'Tap to play', isPlaying: false });
          });
      } else {
        // No source — re-play from track
        get().playTrack(currentTrack, get().queue, get().queueIndex);
      }
    }
  },

  pause: () => {
    const audio = getAudio();
    audio.pause();
    set({ isPlaying: false });
  },

  resume: () => {
    const audio = getAudio();
    if (audio.src) {
      audio.play().then(() => set({ isPlaying: true })).catch(() => {});
    } else if (get().currentTrack) {
      get().playTrack(get().currentTrack!, get().queue, get().queueIndex);
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
        const audio = getAudio();
        audio.pause();
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
      const audio = getAudio();
      audio.currentTime = 0;
      set({ progress: 0 });
      return;
    }

    let prevIdx = queueIndex - 1;
    if (prevIdx < 0) prevIdx = queue.length - 1;
    get().playTrack(queue[prevIdx], queue, prevIdx);
  },

  seek: (time) => {
    const audio = getAudio();
    audio.currentTime = time;
    set({ progress: time });
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
    audio.volume = isMuted ? (volume || 0.8) : 0;
    set({ isMuted: !isMuted });
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
    const audio = getAudio();
    audio.pause();
    audio.src = '';
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
  const vol = saved ? parseFloat(saved) : 0.8;
  usePlayerStore.setState({ volume: vol });
} catch {}

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
