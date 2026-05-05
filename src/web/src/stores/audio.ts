import { create } from "zustand";

interface AudioState {
  audioChunks: string[];
  currentChunkIndex: number;
  isPlaying: boolean;
  isGenerating: boolean;
  generatedCount: number;
  totalCount: number;

  addAudioChunk: (base64: string) => void;
  setCurrentChunkIndex: (i: number) => void;
  setIsPlaying: (v: boolean) => void;
  setIsGenerating: (v: boolean) => void;
  setProgress: (generated: number, total: number) => void;
  reset: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  audioChunks: [],
  currentChunkIndex: 0,
  isPlaying: false,
  isGenerating: false,
  generatedCount: 0,
  totalCount: 0,

  addAudioChunk: (base64) =>
    set((state) => ({ audioChunks: [...state.audioChunks, base64] })),
  setCurrentChunkIndex: (i) => set({ currentChunkIndex: i }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setProgress: (generated, total) =>
    set({ generatedCount: generated, totalCount: total }),
  reset: () =>
    set({
      audioChunks: [],
      currentChunkIndex: 0,
      isPlaying: false,
      isGenerating: false,
      generatedCount: 0,
      totalCount: 0,
    }),
}));
