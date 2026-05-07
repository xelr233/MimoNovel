import { useState, useRef } from "react";
import { synthesizeSpeech, generateText } from "../lib/api";

type TTSModel = "mimo-v2.5-tts" | "mimo-v2.5-tts-voicedesign" | "mimo-v2.5-tts-voiceclone";

const MODELS: { id: TTSModel; label: string; desc: string }[] = [
  { id: "mimo-v2.5-tts", label: "预置音色", desc: "内置精品音色，开箱即用" },
  { id: "mimo-v2.5-tts-voicedesign", label: "音色设计", desc: "通过文本描述定制音色" },
  { id: "mimo-v2.5-tts-voiceclone", label: "音色克隆", desc: "基于音频样本复刻音色" },
];

const VOICES = [
  { id: "冰糖", label: "冰糖", lang: "中文", gender: "女" },
  { id: "茉莉", label: "茉莉", lang: "中文", gender: "女" },
  { id: "苏打", label: "苏打", lang: "中文", gender: "男" },
  { id: "白桦", label: "白桦", lang: "中文", gender: "男" },
  { id: "Mia", label: "Mia", lang: "英文", gender: "女" },
  { id: "Chloe", label: "Chloe", lang: "英文", gender: "女" },
  { id: "Milo", label: "Milo", lang: "英文", gender: "男" },
  { id: "Dean", label: "Dean", lang: "英文", gender: "男" },
];

export default function Studio() {
  const [model, setModel] = useState<TTSModel>("mimo-v2.5-tts");
  const [voice, setVoice] = useState("冰糖");
  const [voiceDesc, setVoiceDesc] = useState("");
  const [audioFile, setAudioFile] = useState<string | null>(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [style, setStyle] = useState("");
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<"voice-desc" | "synthesis-text" | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".mp3") && !file.name.endsWith(".wav")) {
      setError("仅支持 mp3 和 wav 格式");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("文件大小不能超过 10MB");
      return;
    }
    setAudioFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAudioFile(result);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAIGenerate = async (type: "voice-desc" | "synthesis-text") => {
    const prompt = type === "voice-desc" ? voiceDesc.trim() || "温柔治愈的女声" : voiceDesc.trim() || "磁性成熟男声";
    setError(null);
    setAiLoading(type);
    try {
      const result = await generateText(type, prompt);
      if (type === "voice-desc") {
        setVoiceDesc(result);
      } else {
        setText(result);
      }
    } catch (err: any) {
      setError(err.message || "AI 生成失败");
    } finally {
      setAiLoading(null);
    }
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("请输入合成文本");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setAudioSrc(null);

    try {
      const options: { voice?: string; style?: string; model?: string } = {
        model,
      };

      if (model === "mimo-v2.5-tts") {
        options.voice = voice;
        if (style.trim()) options.style = style.trim();
      } else if (model === "mimo-v2.5-tts-voicedesign") {
        if (!voiceDesc.trim()) {
          setError("音色描述不能为空");
          setIsGenerating(false);
          return;
        }
        options.style = voiceDesc.trim();
      } else if (model === "mimo-v2.5-tts-voiceclone") {
        if (!audioFile) {
          setError("请上传音频样本");
          setIsGenerating(false);
          return;
        }
        options.voice = audioFile;
        if (style.trim()) options.style = style.trim();
      }

      const audioBase64 = await synthesizeSpeech(text.trim(), options);
      setAudioSrc(`data:audio/wav;base64,${audioBase64}`);
    } catch (err: any) {
      setError(err.message || "语音合成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Model Selector */}
      <section className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-800/40 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-amber-500/10 flex items-center justify-center">
            <span className="text-amber-400 text-xs font-bold">M</span>
          </div>
          <h2 className="text-sm font-semibold text-ink-300 tracking-wide">TTS 模型</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {MODELS.map((m) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`text-left rounded-xl border px-4 py-3 transition-all ${
                  model === m.id
                    ? "border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/5"
                    : "border-ink-800/40 bg-ink-950/40 hover:border-ink-700/60"
                }`}
              >
                <span className={`text-sm font-medium ${model === m.id ? "text-amber-400" : "text-ink-300"}`}>
                  {m.label}
                </span>
                <span className="block text-xs text-ink-500 mt-1">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Voice Config */}
      <section className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-800/40 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-purple-500/10 flex items-center justify-center">
            <span className="text-purple-400 text-xs font-bold">V</span>
          </div>
          <h2 className="text-sm font-semibold text-ink-300 tracking-wide">音色配置</h2>
        </div>
        <div className="p-6">
          {/* Preset voice selector */}
          {model === "mimo-v2.5-tts" && (
            <div>
              <label className="block text-xs text-ink-500 mb-3 uppercase tracking-wider">预置音色</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {VOICES.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoice(v.id)}
                    className={`rounded-lg border px-3 py-2 text-center transition-all ${
                      voice === v.id
                        ? "border-amber-500/50 bg-amber-500/10"
                        : "border-ink-800/40 bg-ink-950/40 hover:border-ink-700/60"
                    }`}
                  >
                    <span className={`text-sm font-medium ${voice === v.id ? "text-amber-400" : "text-ink-300"}`}>
                      {v.label}
                    </span>
                    <span className="block text-[10px] text-ink-600 mt-0.5">
                      {v.lang} {v.gender}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voice design input */}
          {model === "mimo-v2.5-tts-voicedesign" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-ink-500 uppercase tracking-wider">音色描述</label>
                <button
                  onClick={() => handleAIGenerate("voice-desc")}
                  disabled={aiLoading !== null}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all
                    border border-amber-500/30 text-amber-400 hover:bg-amber-500/10
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading === "voice-desc" ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                      <circle cx="12" cy="15" r="2" />
                    </svg>
                  )}
                  AI 生成
                </button>
              </div>
              <textarea
                value={voiceDesc}
                onChange={(e) => setVoiceDesc(e.target.value)}
                placeholder="例：一位年迈的老先生，说带北方口音的普通话，语速缓慢而沉稳，嗓音略带沙哑和沧桑感"
                className="w-full h-28 rounded-xl border border-ink-800/60 bg-ink-950/60 px-4 py-3 text-sm text-ink-300
                  placeholder:text-ink-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 resize-none transition-all"
              />
              <p className="text-[11px] text-ink-600 mt-2">
                描述越具体越好，涵盖性别、年龄、音色质感、情绪、语速等维度。输入关键词后点击「AI 生成」自动扩写。
              </p>
            </div>
          )}

          {/* Voice clone upload */}
          {model === "mimo-v2.5-tts-voiceclone" && (
            <div>
              <label className="block text-xs text-ink-500 mb-2 uppercase tracking-wider">音频样本</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.wav"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border border-dashed border-ink-700/60 bg-ink-950/40 px-4 py-8
                  hover:border-amber-500/40 hover:bg-amber-500/5 transition-all text-center"
              >
                {audioFileName ? (
                  <div>
                    <span className="text-sm text-amber-400">{audioFileName}</span>
                    <span className="block text-xs text-ink-600 mt-1">点击更换文件</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-sm text-ink-400">点击上传音频文件</span>
                    <span className="block text-xs text-ink-600 mt-1">支持 mp3 / wav，最大 10MB</span>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Style Control */}
      {model !== "mimo-v2.5-tts-voicedesign" && (
        <section className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-ink-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-rose-500/10 flex items-center justify-center">
                <span className="text-rose-400 text-xs font-bold">S</span>
              </div>
              <h2 className="text-sm font-semibold text-ink-300 tracking-wide">风格控制</h2>
            </div>
            <span className="text-xs text-ink-600">可选</span>
          </div>
          <div className="p-6">
            <textarea
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="例：用轻快上扬的语调，语速稍快，带着压抑不住的激动与小骄傲"
              className="w-full h-20 rounded-xl border border-ink-800/60 bg-ink-950/60 px-4 py-3 text-sm text-ink-300
                placeholder:text-ink-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 resize-none transition-all"
            />
            <p className="text-[11px] text-ink-600 mt-2">
              自然语言描述语音风格，放在 role: user 的消息中
            </p>
          </div>
        </section>
      )}

      {/* Synthesis Text */}
      <section className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">T</span>
            </div>
            <h2 className="text-sm font-semibold text-ink-300 tracking-wide">合成文本</h2>
          </div>
          <button
            onClick={() => handleAIGenerate("synthesis-text")}
            disabled={aiLoading !== null}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs transition-all
              border border-amber-500/30 text-amber-400 hover:bg-amber-500/10
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiLoading === "synthesis-text" ? (
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4z" />
                <circle cx="12" cy="15" r="2" />
              </svg>
            )}
            AI 生成
          </button>
        </div>
        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="输入要合成语音的文本内容，或根据音色描述点击「AI 生成」自动匹配"
            className="w-full h-32 rounded-xl border border-ink-800/60 bg-ink-950/60 px-4 py-3 text-sm text-ink-300
              placeholder:text-ink-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 resize-none transition-all"
          />
        </div>
      </section>

      {/* Generate Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="relative px-8 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all
            bg-gradient-to-r from-amber-500 to-amber-600 text-ink-950
            hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/20
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              生成中…
            </span>
          ) : (
            "生成语音"
          )}
        </button>

        {error && (
          <span className="text-sm text-rose-400">{error}</span>
        )}
      </div>

      {/* Audio Player */}
      {audioSrc && (
        <section className="rounded-2xl border border-ink-800/60 bg-ink-900/50 backdrop-blur-sm overflow-hidden animate-fade-in-up">
          <div className="px-6 py-4 border-b border-ink-800/40 flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold">P</span>
            </div>
            <h2 className="text-sm font-semibold text-ink-300 tracking-wide">试听</h2>
          </div>
          <div className="p-6">
            <audio
              ref={audioRef}
              src={audioSrc}
              controls
              className="w-full h-10 rounded-lg [&::-webkit-media-controls-panel]:bg-ink-800/50"
            />
          </div>
        </section>
      )}
    </div>
  );
}
