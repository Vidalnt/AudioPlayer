'use client';

import React, { useEffect, useState, useCallback } from 'react';

interface Emoji {
  id: string;
  x: number;
  y: number;
  emoji: string;
  createdAt: number;
}

const MUSIC_EMOJIS = ['🎵', '🎶', '🎸', '🎤', '🎧'];
const EMOJI_COOLDOWN = 300; // ms between emoji spawns
const EMOJI_LIFETIME = 5000; // ms until emoji disappears

export default function EmojiTrail({ isPlaying }: { isPlaying: boolean }) {
  const [emojis, setEmojis] = useState<Emoji[]>([]);
  const [lastEmojiTime, setLastEmojiTime] = useState(0);

  const createEmoji = useCallback((x: number, y: number) => {
    const currentTime = Date.now();
    if (currentTime - lastEmojiTime >= EMOJI_COOLDOWN) {
      const newEmoji = {
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        emoji: MUSIC_EMOJIS[Math.floor(Math.random() * MUSIC_EMOJIS.length)],
        createdAt: currentTime,
      };
      
      setLastEmojiTime(currentTime);
      setEmojis(prev => [...prev, newEmoji]);

      // Remove emoji after lifetime
      setTimeout(() => {
        setEmojis(prev => prev.filter(emoji => emoji.id !== newEmoji.id));
      }, EMOJI_LIFETIME);
    }
  }, [lastEmojiTime]);

  useEffect(() => {
    if (!isPlaying) {
      setEmojis([]);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (isPlaying) {
        createEmoji(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPlaying, createEmoji]);

  return (
    <div className="emoji-trail-container">
      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="emoji-particle"
          style={{
            left: emoji.x,
            top: emoji.y,
          }}
        >
          {emoji.emoji}
        </div>
      ))}
    </div>
  );
}