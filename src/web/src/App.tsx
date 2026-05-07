import { useState } from "react";
import TextInput from "./components/TextInput";
import CharacterPanel from "./components/CharacterPanel";
import SegmentList from "./components/SegmentList";
import AudioPlayer from "./components/AudioPlayer";
import Header from "./components/Header";
import StepIndicator from "./components/StepIndicator";
import { useNovelStore } from "./stores/novel";

type Step = "input" | "result" | "play";

export default function App() {
  const { segments } = useNovelStore();

  const currentStep: Step =
    segments.length > 0 ? "result" : "input";

  return (
    <div className="noise-bg min-h-screen bg-ink-950 text-ink-300">
      {/* Ambient gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[300px] bg-rose-500/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="mx-auto max-w-5xl px-6 py-10">
          <StepIndicator current={currentStep} />

          <div className="mt-8 space-y-8">
            {/* Step 1: Input */}
            <section className="animate-fade-in-up">
              <TextInput />
            </section>

            {/* Step 2: Results */}
            {segments.length > 0 && (
              <>
                <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                  <CharacterPanel />
                </section>

                <section className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <SegmentList />
                </section>

                <section className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
                  <AudioPlayer />
                </section>
              </>
            )}
          </div>
        </main>

        <footer className="text-center py-8 text-ink-600 text-xs tracking-widest uppercase">
          MimoNovel &middot; Powered by Xiaomi MiMo
        </footer>
      </div>
    </div>
  );
}
