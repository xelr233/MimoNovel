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

  const progressPercent = totalCount > 0 ? (generatedCount / totalCount) * 100 : 0;

  return (
    <div className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
      {/* Section header */}
      <div className="px-6 py-4 border-b border-ink-800/40">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-rose-500/10 flex items-center justify-center">
            <span className="text-rose-400 text-xs font-bold">叁</span>
          </div>
          <h2 className="text-sm font-semibold text-ink-300 tracking-wide">有声书播放器</h2>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            className="relative group/btn flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600
              py-3.5 text-sm font-semibold text-ink-950 tracking-wide
              hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed
              transition-all shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
            onClick={handleGenerate}
            disabled={isGenerating || segments.length === 0}
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                生成中 {generatedCount}/{totalCount}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                生成有声书
              </span>
            )}
          </button>

          {audioChunks.length > 0 && !isGenerating && (
            <button
              className="flex-1 rounded-xl border border-ink-700/50 bg-ink-800/50 py-3.5
                text-sm font-medium text-ink-300 hover:bg-ink-800 hover:border-ink-600
                transition-all"
              onClick={() => (isPlaying ? setIsPlaying(false) : playChunk(0))}
            >
              {isPlaying ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                  暂停
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="6,3 20,12 6,21" />
                  </svg>
                  播放
                </span>
              )}
            </button>
          )}
        </div>

        {/* Progress bar */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded-full bg-ink-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-xs text-ink-500 text-center">
              正在合成第 {generatedCount} / {totalCount} 段...
            </p>
          </div>
        )}

        {/* Playback info */}
        {isPlaying && !isGenerating && (
          <div className="flex items-center justify-center gap-3 py-3">
            <div className="flex gap-1">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-amber-400 rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.random() * 12}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm text-ink-400">
              第 <span className="text-amber-400 font-medium">{currentChunkIndex + 1}</span> / {audioChunks.length} 段
            </p>
          </div>
        )}

        {/* Done state */}
        {!isGenerating && audioChunks.length > 0 && !isPlaying && (
          <p className="text-xs text-ink-500 text-center">
            已生成 {audioChunks.length} 段音频
          </p>
        )}

        <audio ref={audioRef} />
      </div>
    </div>
  );
}
