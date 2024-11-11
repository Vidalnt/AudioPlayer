'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface RainDrop {
  id: string;
  left: number;
  duration: number;
}

const RainEffect = ({ isPlaying }: { isPlaying: boolean }) => {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([]);

  const createRainDrop = useCallback(() => {
    return {
      id: Math.random().toString(36).substring(7),
      left: Math.random() * window.innerWidth,
      duration: Math.random() * 1.5 + 1, // Duration between 1-2.5s
    };
  }, []);

  const removeRainDrop = useCallback((dropId: string) => {
    setRainDrops(prev => prev.filter(drop => drop.id !== dropId));
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setRainDrops([]); // Clear all drops when not playing
      return;
    }

    const addDropInterval = setInterval(() => {
      const newDrop = createRainDrop();
      setRainDrops(prev => [...prev]);
      
      // Remove drop after animation completes
      setTimeout(() => {
        removeRainDrop(newDrop.id);
      }, newDrop.duration * 1000);
      
      setRainDrops(prev => [...prev, newDrop]);
    }, 50); // Create new drop every 50ms

    return () => {
      clearInterval(addDropInterval);
    };
  }, [isPlaying, createRainDrop, removeRainDrop]);

  return (
    <div className="rain-container">
      {rainDrops.map((drop) => (
        <div
          key={drop.id}
          className="rain-drop"
          style={{
            left: `${drop.left}px`,
            animationDuration: `${drop.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default RainEffect;