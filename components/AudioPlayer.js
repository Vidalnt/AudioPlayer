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

  const [particles, setParticles] = useState([]);
  const [lastEmojiTime, setLastEmojiTime] = useState(0); // Rastrear el tiempo del último emoji creado
  const fallingSpeed = 1;
  
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isPlaying) {
        const currentTime = Date.now();
        const emojiCooldown = 300; // Cooldown de 300ms por emoji
        if (currentTime - lastEmojiTime >= emojiCooldown) {
          const musicEmojis = ['🎵', '🎶', '🎸', '🎤', '🎧'];
          const emoji = {
            x: event.clientX,
            y: event.clientY,
            emoji: musicEmojis[Math.floor(Math.random() * musicEmojis.length)],
            createdAt: currentTime,
          };
          setLastEmojiTime(currentTime);
          setParticles((prev) => [...prev, emoji]);
          
          // Eliminar el emoji después de 5 segundos
          setTimeout(() => {
            setParticles((prev) => prev.filter((p) => p !== emoji));
          }, 5000);
        }
      }
    };



    const removeParticles = () => {
      const currentTime = Date.now();
      setParticles((prev) => {
        const updatedParticles = prev
          .map((p) => {
            const timeElapsed = currentTime - p.createdAt;
            if (timeElapsed <= 5000) {
              return {
                ...p,
                y: p.y + fallingSpeed,
              };
            }
            return p; // Mantener emojis que no han superado el tiempo de vida
          })
          .filter((p) => p !== null);

        return updatedParticles;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    const intervalId = window.setInterval(removeParticles, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(intervalId);
    };
  }, [isPlaying, fallingSpeed, lastEmojiTime]);


  return (
    <div className="w-full h-screen flex flex-col items-center justify-center relative">
      {particles.map((p, index) => (
        <div
          key={index}
          className="falling-emoji"
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            zIndex: 2, // Asegura que los emojis estén en una capa superior
          }}
        >
          {p.emoji}
        </div>
      ))}
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
      <style jsx>{`
        .falling-emoji {
          position: absolute;
          animation: fall ${5 / fallingSpeed}s linear 25, fadeOut 4.5s forwards;
        }
        @keyframes fall {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(5vh); // Mover el emoji hasta la parte inferior de la ventana
          }
        }
        @keyframes fadeOut {
          to {
            opacity: 0;
          }
        }
      `}</style>

    </div>
  );
};

export default AudioPlayer;
