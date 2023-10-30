import React, { useEffect, useState } from 'react';

const RainEffect = ({ isPlaying }) => {
  const [rainDrops, setRainDrops] = useState([]);

  useEffect(() => {
    const addRainDrop = () => {
      const newRainDrop = {
        left: Math.random() * window.innerWidth,
        duration: Math.random() * 2 + 1, // Duración de la animación
        delay: Math.random() * 2, // Retraso antes de la animación
      };
      setRainDrops((prevDrops) => [...prevDrops, newRainDrop]);
    };

    if (isPlaying) {
      // Agrega una gota de lluvia cada 0.5 segundos mientras se reproduce el audio
      const rainInterval = setInterval(addRainDrop, 500);

      return () => {
        clearInterval(rainInterval);
      };
    }
  }, [isPlaying]);

  return (
    <div className="rain-container">
      {rainDrops.map((rainDrop, index) => (
        <div
          key={index}
          className="rain-drop"
          style={{
            left: rainDrop.left,
            animation: `rain-fall ${rainDrop.duration}s linear infinite`,
            animationDelay: `${rainDrop.delay}s`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};

export default RainEffect;
