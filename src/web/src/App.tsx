import TextInput from "./components/TextInput";
import CharacterPanel from "./components/CharacterPanel";
import SegmentList from "./components/SegmentList";
import AudioPlayer from "./components/AudioPlayer";
import { useNovelStore } from "./stores/novel";

export default function App() {
  const { segments } = useNovelStore();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-bold">MimoNovel</h1>
        <p className="text-sm text-gray-500">小说有声书 · Powered by MiMo</p>
      </header>
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <TextInput />
        {segments.length > 0 && (
          <>
            <CharacterPanel />
            <SegmentList />
            <AudioPlayer />
          </>
        )}
      </main>
    </div>
  );
}
