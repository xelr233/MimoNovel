import { useRef, useEffect, useState } from "react";
import { useAudioStore } from "../stores/audio";
import { useNovelStore } from "../stores/novel";
import { synthesizeSpeech } from "../lib/api";

export default function AudioPlayer() {
  const { segments, characterVoices } = useNovelStore();
  const {
    audioChunks,
    currentChunkIndex,
    isPlaying,
    isGenerating,
    generatedCount,
    totalCount,
    addAudioChunk,
    setCurrentChunkIndex,
    setIsPlaying,
    setIsGenerating,
    setProgress,
    reset,
  } = useAudioStore();

  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentSrc, setCurrentSrc] = useState("");

  const handleGenerate = async () => {
    if (segments.length === 0) return;
    reset();
    setIsGenerating(true);
    setProgress(0, segments.length);

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const voice = seg.character
        ? characterVoices.get(seg.character)?.voice || "冰糖"
        : "冰糖";

      try {
        const audio = await synthesizeSpeech(seg.text, {
          voice,
          style: seg.emotion ? `${seg.emotion}的语气` : undefined,
        });
        addAudioChunk(audio);
        setProgress(i + 1, segments.length);
      } catch (err) {
        console.error(`第 ${i + 1} 段合成失败:`, err);
      }
    }

    setIsGenerating(false);
  };

  const playChunk = (index: number) => {
    if (index >= audioChunks.length) {
      setIsPlaying(false);
      return;
    }
    const src = `data:audio/wav;base64,${audioChunks[index]}`;
    setCurrentSrc(src);
    setCurrentChunkIndex(index);
    setIsPlaying(true);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSrc) return;

    audio.src = currentSrc;
    audio.play();

    const onEnded = () => {
      playChunk(currentChunkIndex + 1);
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [currentSrc]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
      <h3 className="font-medium text-gray-700">有声书播放器</h3>

      <div className="flex gap-2">
        <button
          className="rounded-lg bg-green-600 px-4 py-2 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          onClick={handleGenerate}
          disabled={isGenerating || segments.length === 0}
        >
          {isGenerating
            ? `生成中 ${generatedCount}/${totalCount}`
            : "生成有声书"}
        </button>

        {audioChunks.length > 0 && !isGenerating && (
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
            onClick={() => playChunk(0)}
          >
            {isPlaying ? "播放中..." : "播放"}
          </button>
        )}
      </div>

      {isGenerating && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-600 h-2 rounded-full transition-all"
            style={{ width: `${(generatedCount / totalCount) * 100}%` }}
          />
        </div>
      )}

      {isPlaying && (
        <p className="text-sm text-gray-500">
          正在播放第 {currentChunkIndex + 1} / {audioChunks.length} 段
        </p>
      )}

      <audio ref={audioRef} />
    </div>
  );
}
