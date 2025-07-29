"use client"

import { useEffect, useState, useCallback } from "react"

interface RainDrop {
  id: string
  left: number
  duration: number
  color: string
}

const RainEffect = ({ isPlaying, isNight }: { isPlaying: boolean; isNight: boolean }) => {
  const [rainDrops, setRainDrops] = useState<RainDrop[]>([])

  const createRainDrop = useCallback(() => {
    // Define colors inside the callback to avoid dependency issues
    const nightColors = [
      "rgba(156, 163, 175, 0.6)", // gray-400 subtle
      "rgba(209, 213, 219, 0.5)", // gray-300 subtle
      "rgba(229, 231, 235, 0.4)", // gray-200 very subtle
      "rgba(107, 114, 128, 0.7)", // gray-500 subtle
    ]

    const dayColors = [
      "rgba(29, 78, 216, 0.8)", // blue-700
      "rgba(37, 99, 235, 0.7)", // blue-600
      "rgba(59, 130, 246, 0.6)", // blue-500
      "rgba(96, 165, 250, 0.8)", // blue-400
    ]

    const colors = isNight ? nightColors : dayColors

    return {
      id: Math.random().toString(36).substring(7),
      left: Math.random() * window.innerWidth,
      duration: Math.random() * 2 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }
  }, [isNight])

  useEffect(() => {
    if (!isPlaying) {
      setRainDrops([])
      return
    }

    const addDropInterval = setInterval(
      () => {
        const newDrop = createRainDrop()

        // Add the new drop
        setRainDrops((prev) => [...prev, newDrop])

        // Schedule removal
        setTimeout(() => {
          setRainDrops((prevDrops) => prevDrops.filter((drop) => drop.id !== newDrop.id))
        }, newDrop.duration * 1000)
      },
      isNight ? 120 : 100,
    )

    return () => {
      clearInterval(addDropInterval)
    }
  }, [isPlaying, isNight, createRainDrop])

  return (
    <div className="rain-container">
      {rainDrops.map((drop) => (
        <div
          key={drop.id}
          className={`transition-all duration-1000 ease-in-out ${isNight ? "rain-drop-dark" : "rain-drop-light"}`}
          style={{
            left: `${drop.left}px`,
            animationDuration: `${drop.duration}s`,
            background: `linear-gradient(180deg, ${drop.color}, transparent)`,
          }}
        />
      ))}
    </div>
  )
}

export default RainEffect
