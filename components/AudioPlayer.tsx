"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart } from "lucide-react"
import RainEffect from "./RainEffect"

interface FavoriteAudio {
  id: string
  url: string
  title: string
  addedAt: string
}

interface AudioPlayerProps {
  audioUrl: string
  isNight: boolean
  favorites: FavoriteAudio[]
  setFavorites: React.Dispatch<React.SetStateAction<FavoriteAudio[]>>
}

export default function AudioPlayer({ audioUrl, isNight, favorites, setFavorites }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          // Reset any previous errors
          audioRef.current.load()

          // Asegurar volumen antes de reproducir
          audioRef.current.volume = volume
          audioRef.current.muted = isMuted

          // Try to play with better error handling
          const playPromise = audioRef.current.play()

          if (playPromise !== undefined) {
            await playPromise
            setIsPlaying(true)
          }
        }
      } catch (error) {
        console.error("Error playing audio:", error)
        setIsPlaying(false)

        // Show user-friendly error message
        alert(
          "No se pudo reproducir el audio. Verifica que la URL sea válida y que el servidor permita la reproducción.",
        )
      }
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Reset states when URL changes
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)

    // Asegurar que el volumen esté configurado correctamente
    audio.volume = volume
    audio.muted = isMuted

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e: Event) => {
      console.error("Audio error:", e)
      setIsPlaying(false)
      alert("Error al cargar el audio. Verifica que la URL sea correcta y accesible.")
    }
    const handleLoadStart = () => {
      console.log("Loading audio...")
    }
    const handleCanPlay = () => {
      console.log("Audio can play")
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("loadstart", handleLoadStart)
    audio.addEventListener("canplay", handleCanPlay)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("loadstart", handleLoadStart)
      audio.removeEventListener("canplay", handleCanPlay)
    }
  }, [audioUrl, volume, isMuted])

  const handleTimeChange = (newValue: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newValue[0]
      setCurrentTime(newValue[0])
    }
  }

  const handleVolumeChange = (newValue: number[]) => {
    const newVolume = newValue[0]
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)

      // Asegurar que no esté muteado si hay volumen
      if (newVolume > 0) {
        audioRef.current.muted = false
      }
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      const newMutedState = !isMuted
      audioRef.current.muted = newMutedState
      setIsMuted(newMutedState)

      // Si desmutea, restaurar el volumen
      if (!newMutedState && volume === 0) {
        audioRef.current.volume = 0.5
        setVolume(0.5)
      }
    }
  }

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(Math.max(currentTime + seconds, 0), duration)
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const getAudioTitle = (url: string) => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      const filename = pathname.split("/").pop() || "Audio"
      return filename.replace(/\.[^/.]+$/, "") // Remove extension
    } catch {
      return "Audio sin título"
    }
  }

  const isCurrentAudioFavorite = () => {
    return favorites.some((fav) => fav.url === audioUrl)
  }

  const toggleFavorite = () => {
    const audioTitle = getAudioTitle(audioUrl)
    const existingFavorite = favorites.find((fav) => fav.url === audioUrl)

    if (existingFavorite) {
      // Remove from favorites
      setFavorites((prev) => prev.filter((fav) => fav.url !== audioUrl))
    } else {
      // Add to favorites
      const newFavorite: FavoriteAudio = {
        id: Date.now().toString(),
        url: audioUrl,
        title: audioTitle,
        addedAt: new Date().toLocaleString(),
      }
      setFavorites((prev) => [newFavorite, ...prev])
    }
  }

  return (
    <>
      <RainEffect isPlaying={isPlaying} isNight={isNight} />

      <div className="w-full max-w-4xl mx-auto relative">
        {/* Dynamic Glow Effect */}
        <div
          className={`absolute inset-0 rounded-3xl blur-xl transition-all duration-1000 ease-in-out ${
            isNight
              ? "bg-gradient-to-r from-gray-900/10 via-black/20 to-gray-900/10"
              : "bg-gradient-to-r from-blue-400/20 via-white/20 to-blue-400/20"
          }`}
        ></div>

        {/* Main Player */}
        <div
          className={`relative backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border transition-all duration-1000 ease-in-out ${
            isNight
              ? "bg-black/70 text-white border-gray-900/40 hover:border-gray-800/40"
              : "bg-white/70 text-blue-900 border-white/40 hover:border-blue-300/40"
          }`}
        >
          <audio ref={audioRef} src={audioUrl} preload="auto" controls={false} style={{ display: "none" }} />

          {/* Current Track Info */}
          <div className="mb-6">
            <h3
              className={`text-lg font-semibold mb-2 transition-colors duration-1000 ease-in-out ${
                isNight ? "text-white" : "text-blue-900"
              }`}
            >
              {getAudioTitle(audioUrl)}
            </h3>
            {/* Now Playing Indicator */}
            {isPlaying && (
              <div
                className={`flex items-center gap-2 transition-colors duration-1000 ease-in-out ${
                  isNight ? "text-gray-400" : "text-blue-600"
                }`}
              >
                <div className="flex gap-1">
                  <div
                    className={`w-1 h-4 rounded-full animate-pulse transition-colors duration-1000 ease-in-out ${
                      isNight ? "bg-gray-500" : "bg-blue-500"
                    }`}
                  ></div>
                  <div
                    className={`w-1 h-6 rounded-full animate-pulse animation-delay-200 transition-colors duration-1000 ease-in-out ${
                      isNight ? "bg-gray-400" : "bg-blue-400"
                    }`}
                  ></div>
                  <div
                    className={`w-1 h-5 rounded-full animate-pulse animation-delay-400 transition-colors duration-1000 ease-in-out ${
                      isNight ? "bg-gray-500" : "bg-blue-500"
                    }`}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {isNight ? "Sonando en la oscuridad" : "Sonando bajo el cielo azul"}
                </span>
              </div>
            )}
          </div>

          {/* Time slider */}
          <div className="mb-8">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleTimeChange}
              className={`my-6 transition-all duration-1000 ease-in-out ${
                isNight
                  ? "[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-gray-600 [&_[role=slider]]:to-gray-500 [&_[role=slider]]:shadow-gray-800/50"
                  : "[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-blue-500 [&_[role=slider]]:to-blue-600 [&_[role=slider]]:shadow-blue-500/50"
              } [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg`}
            />
            <div
              className={`flex justify-between text-sm transition-colors duration-1000 ease-in-out ${
                isNight ? "text-gray-400/70" : "text-blue-700/70"
              }`}
            >
              <span className="font-mono">{formatTime(currentTime)}</span>
              <span className="font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <button
              onClick={() => skip(-10)}
              className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 group ${
                isNight ? "hover:bg-gray-800/30" : "hover:bg-blue-100/30"
              }`}
            >
              <SkipBack
                className={`w-8 h-8 transition-colors duration-1000 ease-in-out ${
                  isNight ? "group-hover:text-gray-300" : "group-hover:text-blue-600"
                }`}
              />
            </button>

            <button
              onClick={togglePlay}
              className={`p-6 rounded-full transition-all duration-1000 ease-in-out transform hover:scale-110 shadow-lg ${
                isNight
                  ? "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 hover:shadow-gray-800/50"
                  : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50"
              }`}
            >
              {isPlaying ? <Pause className="w-10 h-10 text-white" /> : <Play className="w-10 h-10 ml-1 text-white" />}
            </button>

            <button
              onClick={() => skip(10)}
              className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 group ${
                isNight ? "hover:bg-gray-800/30" : "hover:bg-blue-100/30"
              }`}
            >
              <SkipForward
                className={`w-8 h-8 transition-colors duration-1000 ease-in-out ${
                  isNight ? "group-hover:text-gray-300" : "group-hover:text-blue-600"
                }`}
              />
            </button>
          </div>

          {/* Volume control */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleMute}
              className={`p-3 rounded-xl transition-all duration-300 group ${
                isNight ? "hover:bg-gray-800/30" : "hover:bg-blue-100/30"
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-6 h-6 group-hover:text-red-400 transition-colors" />
              ) : (
                <Volume2
                  className={`w-6 h-6 transition-colors duration-1000 ease-in-out ${
                    isNight ? "group-hover:text-gray-300" : "group-hover:text-blue-600"
                  }`}
                />
              )}
            </button>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className={`w-40 transition-all duration-1000 ease-in-out ${
                isNight
                  ? "[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-gray-600 [&_[role=slider]]:to-gray-700"
                  : "[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-blue-500 [&_[role=slider]]:to-blue-600"
              } [&_[role=slider]]:border-0`}
            />
            <div
              className={`text-sm min-w-[3rem] transition-colors duration-1000 ease-in-out ${
                isNight ? "text-gray-400/70" : "text-blue-700/70"
              }`}
            >
              {Math.round(volume * 100)}%
            </div>
            <button
              onClick={toggleFavorite}
              className="p-2 rounded-lg transition-all duration-300 transform hover:scale-110"
            >
              <Heart
                className={`w-5 h-5 transition-all duration-300 ${
                  isCurrentAudioFavorite() ? "text-red-500 fill-red-500" : "text-red-500/60 hover:text-red-400"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
