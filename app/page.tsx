"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Music, Moon, Sun, Heart, Play, Trash2 } from "lucide-react"
import AudioPlayer from "@/components/audio-player"
import DaySky from "@/components/day-sky"
import NightSky from "@/components/night-sky"
import RainEffect from "@/components/rain-effect"
import LanguageSelector from "@/components/language-selector"
import { useLanguage } from "@/hooks/use-language"
import { SkyProvider } from "@/contexts/sky"

interface FavoriteAudio {
  id: string
  url: string
  title: string
  addedAt: string
}

// Global theme state to prevent flicker
let globalTheme: boolean | null = null
let themeInitialized = false

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
          <Music className="w-6 h-6 text-white/80 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-white/60 text-sm font-light">Loading...</p>
      </div>
    </div>
  )
}

function HomeContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const link = searchParams.get("link")
  const [editableLink, setEditableLink] = useState(link || "")
  const [isNight, setIsNight] = useState(() => {
    return globalTheme !== null ? globalTheme : false
  })
  const [themeLoaded, setThemeLoaded] = useState(themeInitialized)
  const [activeTab, setActiveTab] = useState<"play" | "favorites">("play")
  const [favorites, setFavorites] = useState<FavoriteAudio[]>([])

  const exampleUrls = [
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    "https://files.catbox.moe/5bl6mi.flac",
    "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  ]

  // Update editableLink when URL changes
  useEffect(() => {
    setEditableLink(link || "")
  }, [link])

  // Load saved theme preference
  useEffect(() => {
    if (!themeInitialized) {
      const loadTheme = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))

        const savedTheme = localStorage.getItem("audioPlayerTheme")
        const newTheme = savedTheme === "night"

        setIsNight(newTheme)
        globalTheme = newTheme
        setThemeLoaded(true)
        themeInitialized = true
      }

      loadTheme()
    } else {
      if (globalTheme !== null) {
        setIsNight(globalTheme)
      }
      setThemeLoaded(true)
    }
  }, [])

  useEffect(() => {
    const savedFavorites = localStorage.getItem("audioPlayerFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("audioPlayerFavorites", JSON.stringify(favorites))
  }, [favorites])

  const handleRedirect = () => {
    router.push(`/?link=${encodeURIComponent(editableLink)}`)
  }

  const toggleTheme = () => {
    const newTheme = !isNight
    setIsNight(newTheme)
    globalTheme = newTheme
    localStorage.setItem("audioPlayerTheme", newTheme ? "night" : "day")
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

  const playFromHistory = (url: string) => {
    router.push(`/?link=${encodeURIComponent(url)}`)
    setActiveTab("play")
  }

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
  }

  // Show loading screen only on first ever page load
  if (!themeLoaded) {
    return <LoadingFallback />
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Sky Backgrounds */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${
          isNight ? "opacity-0" : "opacity-100"
        }`}
      >
        <DaySky />
      </div>

      <div
        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out z-0 ${
          isNight ? "opacity-100" : "opacity-0"
        }`}
      >
        <NightSky />
      </div>

      {/* Rain Effect - Controlado por el reproductor de audio */}
      <RainEffect isPlaying={!!link} isNight={isNight} />

      {/* Language Selector */}
      <LanguageSelector isNight={isNight} />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 gap-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div
              className={`p-3 backdrop-blur-sm rounded-xl border transition-all duration-1000 ease-in-out ${
                isNight ? "bg-black/10 border-white/10" : "bg-white/10 border-white/20"
              }`}
            >
              <Music
                className={`w-7 h-7 transition-colors duration-1000 ease-in-out ${
                  isNight ? "text-white/80" : "text-blue-800/80"
                }`}
              />
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 ${
                isNight ? "bg-yellow-400/10 hover:bg-yellow-400/20" : "bg-indigo-500/10 hover:bg-indigo-500/20"
              }`}
            >
              <div className="relative w-5 h-5">
                <Sun
                  className={`absolute inset-0 w-5 h-5 text-yellow-400 transition-all duration-500 ease-in-out ${
                    isNight ? "opacity-0 rotate-180 scale-0" : "opacity-100 rotate-0 scale-100"
                  }`}
                />
                <Moon
                  className={`absolute inset-0 w-5 h-5 text-indigo-200 transition-all duration-500 ease-in-out ${
                    isNight ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-0"
                  }`}
                />
              </div>
            </button>
          </div>

          <h1
            className={`text-5xl font-light mb-4 transition-all duration-1000 ease-in-out ${
              isNight ? "text-white/90 drop-shadow-2xl" : "text-blue-900/90 drop-shadow-lg"
            }`}
          >
            {t("header.title")}
          </h1>

          <p
            className={`text-lg max-w-xl mx-auto leading-relaxed font-light transition-colors duration-1000 ease-in-out ${
              isNight ? "text-white/60" : "text-blue-800/70"
            }`}
          >
            {isNight ? t("header.description.night") : t("header.description.day")}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="w-full max-w-lg mx-auto">
          <div
            className={`flex rounded-xl p-1 transition-all duration-1000 ease-in-out ${
              isNight
                ? "bg-black/10 backdrop-blur-sm border border-white/5"
                : "bg-white/10 backdrop-blur-sm border border-white/10"
            }`}
          >
            <button
              onClick={() => setActiveTab("play")}
              className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-light transition-all duration-300 ${
                activeTab === "play"
                  ? isNight
                    ? "bg-white/15 text-white/90"
                    : "bg-white/20 text-blue-900/90"
                  : isNight
                    ? "text-white/60 hover:text-white/80"
                    : "text-blue-700/70 hover:text-blue-900/80"
              }`}
            >
              {t("navigation.play")}
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 py-2.5 px-5 rounded-lg text-sm font-light transition-all duration-300 ${
                activeTab === "favorites"
                  ? isNight
                    ? "bg-white/15 text-white/90"
                    : "bg-white/20 text-blue-900/90"
                  : isNight
                    ? "text-white/60 hover:text-white/80"
                    : "text-blue-700/70 hover:text-blue-900/80"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-3.5 h-3.5" />
                {t("navigation.favorites")} ({favorites.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "play" ? (
          <>
            {/* Input Section */}
            <div className="w-full max-w-xl mx-auto">
              <div
                className={`backdrop-blur-sm border rounded-xl p-6 transition-all duration-1000 ease-in-out hover:scale-[1.02] ${
                  isNight ? "bg-black/10 border-white/10" : "bg-white/10 border-white/15"
                }`}
              >
                <div className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <Input
                      type="url"
                      placeholder={t("input.placeholder")}
                      value={editableLink}
                      onChange={(e) => setEditableLink(e.target.value)}
                      className={`h-11 text-sm rounded-lg transition-all duration-1000 ease-in-out border-0 ${
                        isNight
                          ? "bg-black/20 text-white/90 placeholder:text-white/40 focus:bg-black/30"
                          : "bg-white/20 text-blue-900/90 placeholder:text-blue-600/50 focus:bg-white/30"
                      }`}
                    />
                  </div>
                  <Button
                    onClick={handleRedirect}
                    className={`h-11 px-6 rounded-lg transition-all duration-1000 ease-in-out transform hover:scale-105 ${
                      isNight
                        ? "bg-white/15 hover:bg-white/25 text-white border-0"
                        : "bg-blue-600/20 hover:bg-blue-600/30 text-blue-800 border-0"
                    }`}
                    size="sm"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Example URLs */}
                <div className="mt-4">
                  <p
                    className={`text-xs mb-2 font-light transition-colors duration-1000 ease-in-out ${
                      isNight ? "text-white/50" : "text-blue-700/60"
                    }`}
                  >
                    {t("input.examples")}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exampleUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setEditableLink(url)
                          router.push(`/?link=${encodeURIComponent(url)}`)
                        }}
                        className={`px-2.5 py-1 text-xs rounded-md transition-all duration-300 hover:scale-105 font-light ${
                          isNight
                            ? "bg-white/10 text-white/70 hover:bg-white/20"
                            : "bg-white/15 text-blue-700/80 hover:bg-white/25"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Player */}
            {link && (
              <div className="w-full">
                <AudioPlayer audioUrl={link} isNight={isNight} favorites={favorites} setFavorites={setFavorites} />
              </div>
            )}
          </>
        ) : (
          /* Favorites Tab */
          <div className="w-full max-w-3xl mx-auto">
            <div
              className={`backdrop-blur-sm p-8 rounded-xl border transition-all duration-1000 ease-in-out ${
                isNight ? "bg-black/10 text-white border-white/10" : "bg-white/10 text-blue-900 border-white/15"
              }`}
            >
              <h3 className="text-lg font-light mb-6">{t("favorites.title")}</h3>

              {favorites.length === 0 ? (
                <div
                  className={`text-center py-12 transition-colors duration-1000 ease-in-out ${
                    isNight ? "text-white/60" : "text-blue-700/70"
                  }`}
                >
                  <Heart className="w-10 h-10 mx-auto mb-4 opacity-40" />
                  <p className="text-base mb-2 font-light">{t("favorites.empty.title")}</p>
                  <p className="text-sm opacity-70 font-light">{t("favorites.empty.description")}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto overflow-x-hidden">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-300 ${
                        isNight
                          ? "bg-white/5 border-white/5 hover:bg-white/10"
                          : "bg-white/10 border-white/10 hover:bg-white/20"
                      }`}
                    >
                      <button
                        onClick={() => playFromHistory(favorite.url)}
                        className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                          isNight ? "bg-white/10 hover:bg-white/20" : "bg-blue-100/30 hover:bg-blue-200/40"
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-light truncate text-sm">{favorite.title}</h4>
                        <p
                          className={`text-xs opacity-60 font-light ${isNight ? "text-white/50" : "text-blue-700/60"}`}
                        >
                          {t("favorites.added")} {favorite.addedAt}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className="p-1.5 rounded-lg transition-all duration-300 hover:scale-110 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400/70 hover:text-red-400 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <SkyProvider>
      <Suspense fallback={<LoadingFallback />}>
        <HomeContent />
      </Suspense>
    </SkyProvider>
  )
}