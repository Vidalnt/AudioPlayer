'use client';

import { useSearchParams } from 'next/navigation';
import AudioPlayer from '@/components/AudioPlayer';

export default function Home() {
  const searchParams = useSearchParams();
  const link = searchParams.get('link');

  if (!link) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h1 className="text-3xl font-bold mb-4">Audio Player</h1>
          <p className="text-gray-400">
            Add a link parameter to the URL to play audio.
            <br />
            Example: <code className="bg-white/10 px-2 py-1 rounded">/?link=https://example.com/audio.mp3</code>
          </p>
        </div>
      </div>
    );
  }

  const audioUrl = decodeURIComponent(searchParams.toString().replace("link=", ""))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <AudioPlayer audioUrl={audioUrl} />
    </div>
  );
}