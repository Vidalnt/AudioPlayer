import React, { useEffect, useState } from 'react';

const RainEffect = ({ isPlaying }) => {
  const [rainDrops, setRainDrops] = useState([]);
  const [lastRainDropTime, setLastRainDropTime] = useState(0);

  useEffect(() => {
    const addRainDrop = () => {
      const currentTime = Date.now();
      const rainCooldown = 500; // Cooldown de 300ms por gota
      if (isPlaying && currentTime - lastRainDropTime >= rainCooldown) {
        const newRainDrop = {
          left: Math.random() * window.innerWidth,
          duration: Math.random() * 2 + 1, // Duración de la animación
          delay: Math.random() * 2, // Retraso antes de la animación
          createdAt: currentTime,
        };
        setLastRainDropTime(currentTime);
        setRainDrops((prevDrops) => [...prevDrops, newRainDrop]);

        setTimeout(() => {
          setRainDrops((prev) => prev.filter((drop) => drop !== newRainDrop));
        }, 5500);

        
      }
    };

    if (isPlaying) {
      const rainInterval = setInterval(addRainDrop, 0);

      return () => {
        clearInterval(rainInterval);
      };
    }
  }, [isPlaying, lastRainDropTime]);



  const removeDrops = () => {
    const currentTime = Date.now();
    setRainDrops((prev) => {
      const updatedDrops = prev
        .map((drop) => {
          const timeElapsed = currentTime - drop.createdAt;
          if (timeElapsed <= 5500) {
            return {
              ...drop,
              top: drop.top,
            };
          }
          return drop; // Eliminar gotas que han superado el tiempo de vida
        })
        .filter((drop) => drop !== null);

      return updatedDrops;
    });
  };

  useEffect(() => {
    const dropRemovalInterval = setInterval(removeDrops, 0);

    return () => {
      clearInterval(dropRemovalInterval);
    };
  }, []);

  return (
    <div className="rain-container">
      {rainDrops.map((rainDrop, index) => (
        <div
          key={index}
          className="rain-drop"
          style={{
            position: 'absolute',
            left: rainDrop.left,
            top: rainDrop.top,
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
