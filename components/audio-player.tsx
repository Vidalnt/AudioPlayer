"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart } from "lucide-react"
import RainEffect from "./rain-effect"
import { useLanguage } from "@/hooks/use-language"

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
  const { t } = useLanguage()
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
          audioRef.current.volume = volume
          audioRef.current.muted = isMuted

          const playPromise = audioRef.current.play()
          if (playPromise !== undefined) {
            await playPromise
            setIsPlaying(true)
          }
        }
      } catch (error) {
        console.error("Error playing audio:", error)
        setIsPlaying(false)
        alert(t("alerts.playError"))
      }
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const currentSrc = audio.src
    const newSrc = audioUrl

    if (currentSrc !== newSrc) {
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
      audio.src = audioUrl
      audio.load()
    }

    audio.volume = volume
    audio.muted = isMuted

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    const handleError = (e: Event) => {
      console.error("Audio error:", e)
      setIsPlaying(false)
      alert(t("alerts.loadError"))
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("loadedmetadata", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("loadedmetadata", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [audioUrl, volume, isMuted, t])

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
      return filename.replace(/\.[^/.]+$/, "")
    } catch {
      return t("player.untitledAudio")
    }
  }

  const isCurrentAudioFavorite = () => {
    return favorites.some((fav) => fav.url === audioUrl)
  }

  const toggleFavorite = () => {
    const audioTitle = getAudioTitle(audioUrl)
    const existingFavorite = favorites.find((fav) => fav.url === audioUrl)

    if (existingFavorite) {
      setFavorites((prev) => prev.filter((fav) => fav.url !== audioUrl))
    } else {
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

      <div className="w-full max-w-2xl mx-auto relative">
        <div
          className={`relative backdrop-blur-sm border rounded-2xl transition-all duration-1000 ease-in-out ${
            isNight
              ? "bg-black/10 border-white/5 shadow-lg shadow-black/20"
              : "bg-white/10 border-white/10 shadow-lg shadow-blue-500/5"
          }`}
        >
          <audio ref={audioRef} src={audioUrl} preload="auto" controls={false} style={{ display: "none" }} />

          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3
                  className={`text-base font-medium truncate transition-colors duration-1000 ease-in-out ${
                    isNight ? "text-white/90" : "text-blue-900/90"
                  }`}
                >
                  {getAudioTitle(audioUrl)}
                </h3>
                {isPlaying && (
                  <div className={`flex items-center gap-2 mt-1 ${isNight ? "text-white/60" : "text-blue-700/70"}`}>
                    <div className="flex gap-1">
                      <div
                        className={`w-0.5 h-3 rounded-full animate-pulse ${isNight ? "bg-white/40" : "bg-blue-500/60"}`}
                      ></div>
                      <div
                        className={`w-0.5 h-4 rounded-full animate-pulse ${isNight ? "bg-white/60" : "bg-blue-400/80"}`}
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                      <div
                        className={`w-0.5 h-3 rounded-full animate-pulse ${isNight ? "bg-white/40" : "bg-blue-500/60"}`}
                        style={{ animationDelay: "0.4s" }}
                      ></div>
                    </div>
                    <span className="text-xs font-light">
                      {isNight ? t("player.playingNight") : t("player.playingDay")}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={toggleFavorite}
                className="p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ml-4"
              >
                <Heart
                  className={`w-4 h-4 transition-all duration-300 ${
                    isCurrentAudioFavorite()
                      ? "text-red-400 fill-red-400"
                      : isNight
                        ? "text-white/40 hover:text-red-400"
                        : "text-blue-600/50 hover:text-red-400"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="px-6 pb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleTimeChange}
              className={`transition-all duration-1000 ease-in-out ${
                isNight
                  ? "[&_[role=slider]]:bg-white/80 [&_[role=slider]]:border-white/20 [&_.bg-primary]:bg-white/30"
                  : "[&_[role=slider]]:bg-blue-600 [&_[role=slider]]:border-blue-500/20 [&_.bg-primary]:bg-blue-500/40"
              }`}
            />
            <div
              className={`flex justify-between text-xs mt-2 font-mono ${isNight ? "text-white/50" : "text-blue-600/60"}`}
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 px-6 pb-4">
            <button
              onClick={() => skip(-10)}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isNight ? "hover:bg-white/10" : "hover:bg-blue-500/10"
              }`}
            >
              <SkipBack className={`w-5 h-5 ${isNight ? "text-white/70" : "text-blue-700/70"}`} />
            </button>

            <button
              onClick={togglePlay}
              className={`p-4 rounded-full transition-all duration-300 transform hover:scale-105 ${
                isNight
                  ? "bg-white/15 hover:bg-white/25 backdrop-blur-sm"
                  : "bg-blue-600/20 hover:bg-blue-600/30 backdrop-blur-sm"
              }`}
            >
              {isPlaying ? (
                <Pause className={`w-6 h-6 ${isNight ? "text-white" : "text-blue-800"}`} />
              ) : (
                <Play className={`w-6 h-6 ml-0.5 ${isNight ? "text-white" : "text-blue-800"}`} />
              )}
            </button>

            <button
              onClick={() => skip(10)}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isNight ? "hover:bg-white/10" : "hover:bg-blue-500/10"
              }`}
            >
              <SkipForward className={`w-5 h-5 ${isNight ? "text-white/70" : "text-blue-700/70"}`} />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 px-6 pb-6">
            <button
              onClick={toggleMute}
              className={`p-1.5 rounded-lg transition-all duration-300 ${
                isNight ? "hover:bg-white/10" : "hover:bg-blue-500/10"
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className={`w-4 h-4 ${isNight ? "text-white/60" : "text-blue-600/70"}`} />
              )}
            </button>

            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className={`w-24 transition-all duration-1000 ease-in-out ${
                isNight
                  ? "[&_[role=slider]]:bg-white/60 [&_[role=slider]]:border-white/20 [&_.bg-primary]:bg-white/20"
                  : "[&_[role=slider]]:bg-blue-500 [&_[role=slider]]:border-blue-400/20 [&_.bg-primary]:bg-blue-400/30"
              }`}
            />

            <div
              className={`text-xs min-w-[2.5rem] text-center font-mono ${isNight ? "text-white/50" : "text-blue-600/60"}`}
            >
              {Math.round(volume * 100)}%
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
