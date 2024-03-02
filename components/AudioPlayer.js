import { useRouter } from 'next/router';
import { useState, useEffect, useRef } from 'react';
import RainEffect from './RainEffect';
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css'; // Importa los estilos de la biblioteca

const AudioPlayer = () => {
  const router = useRouter();
  let audioLink = router.asPath;
  audioLink = decodeURIComponent(audioLink.replace("link=", "").replace("/?", ""));
  const [isHovered, setHovered] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  //const audioRef = useRef(null);
  const handlePlay = () => {
    setPlaying(true);
  };

  const handlePause = () => {
    setPlaying(false);
  };

  useEffect(() => {
    if (audioLink) {
      const audioElement = document.querySelector('audio'); 
      audioElement.src = audioLink; 
    }
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
            //zIndex: 2, // Asegura que los emojis estén en una capa superior
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
      <H5AudioPlayer
        style={{
          backgroundColor: 'transparent',
          boxShadow: '0 0 3px 0 rgba(0, 0, 0, 0.2)',
          display: 'flex',
          width: '100%',
          padding: '10px 15px',
          border: '1px solid #000',
          padding: '10px',
          text_align: 'center',
          line_height: '1',
          font_family: 'inherit',
          background_color: '#333',
        }}
        autoPlay
        onPlay={handlePlay}
        onPause={handlePause}
      />
      
      <style jsx>{`
        
        .audio-container {
          background-color: #333; /* Fondo oscuro */
          border: 1px solid #000;
          border-radius: 5px;
          padding: 10px;
          text-align: center;
        }
      
        audio {
          width: 100%;
          background-color: transparent; /* Fondo transparente para el reproductor de audio */
        }
      
        audio::-webkit-media-controls-panel {
          background-color: #333; /* Fondo oscuro para los controles del reproductor de audio */
          border-radius: 5px;
        }
      
        audio::-webkit-media-controls-play-button {
          background-color: #007BFF;
          border: none;
          border-radius: 50%;
          color: #fff;
          font-size: 20px;
        }
        /* Estilos para las opciones de tres puntos */
        audio::-webkit-media-controls-overflow-button {
          color: #000; /* Color de las opciones de tres puntos en fondo oscuro */
        }
        audio::-webkit-media-controls-overflow-button:hover,
        audio::-webkit-media-controls-overflow-button:active {
          background-color: #000; /* Fondo de las opciones de tres puntos al pasar el mouse o hacer clic */
        }
      
        audio::-webkit-media-controls-volume-slider {
          width: 80px;
        }
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
