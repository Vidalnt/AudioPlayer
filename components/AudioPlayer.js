import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import RainEffect from './RainEffect';

const AudioPlayer = () => {
  const router = useRouter();
  const audioLink = router.query.link;
  const [isHovered, setHovered] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = audioLink; // Actualiza el src del elemento de audio
    }

    const playListener = () => {
      setPlaying(true);
    };

    const pauseListener = () => {
      setPlaying(false);
    };

    audioRef.current.addEventListener('play', playListener);
    audioRef.current.addEventListener('pause', pauseListener);

    return () => {
      audioRef.current.removeEventListener('play', playListener);
      audioRef.current.removeEventListener('pause', pauseListener);
    };
  }, [audioLink]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative">
      {isPlaying && <RainEffect isPlaying={isPlaying} />}
      <h2
        className={`text-3xl mb-4 transition-transform transform ${isHovered ? 'scale-110' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        Click the play button to listen to the audio
      </h2>
      <audio ref={audioRef} className="mb-4" controls>
        <source src={audioLink} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
