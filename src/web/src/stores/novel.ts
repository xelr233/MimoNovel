import { create } from "zustand";
import type { Segment, CharacterVoice } from "../lib/api";

interface NovelState {
  rawText: string;
  segments: Segment[];
  characterVoices: Map<string, CharacterVoice>;
  isAnalyzing: boolean;

  setRawText: (text: string) => void;
  setSegments: (segments: Segment[]) => void;
  setCharacterVoice: (character: string, voice: CharacterVoice) => void;
  setIsAnalyzing: (v: boolean) => void;
}

export const useNovelStore = create<NovelState>((set) => ({
  rawText: "",
  segments: [],
  characterVoices: new Map(),
  isAnalyzing: false,

  setRawText: (text) => set({ rawText: text }),
  setSegments: (segments) => set({ segments }),
  setCharacterVoice: (character, voice) =>
    set((state) => {
      const map = new Map(state.characterVoices);
      map.set(character, voice);
      return { characterVoices: map };
    }),
  setIsAnalyzing: (v) => set({ isAnalyzing: v }),
}));
