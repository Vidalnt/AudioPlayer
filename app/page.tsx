"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight, Music, Moon, Sun, Heart, Play, Trash2 } from "lucide-react"
import AudioPlayer from "@/components/AudioPlayer"

interface FavoriteAudio {
  id: string
  url: string
  title: string
  addedAt: string
}

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const link = searchParams.get("link")
  const [editableLink, setEditableLink] = useState(link || "")
  const [isNight, setIsNight] = useState(true)
  const [activeTab, setActiveTab] = useState<"play" | "historial">("play")
  const [favorites, setFavorites] = useState<FavoriteAudio[]>([])
  const exampleUrls = [
    "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    "https://files.catbox.moe/5bl6mi.flac",
    "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  ]

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem("audioPlayerFavorites")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem("audioPlayerFavorites", JSON.stringify(favorites))
  }, [favorites])

  const handleRedirect = () => {
    router.push(`/?link=${encodeURIComponent(editableLink)}`)
  }

  const useExampleUrl = (url: string) => {
    setEditableLink(url)
    router.push(`/?link=${encodeURIComponent(url)}`)
  }

  const toggleTheme = () => {
    setIsNight(!isNight)
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

  const playFromHistory = (url: string) => {
    router.push(`/?link=${encodeURIComponent(url)}`)
    setActiveTab("play")
  }

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id))
  }

  return (
    <div
      className={`min-h-screen relative overflow-hidden transition-all duration-1000 ease-in-out ${
        isNight ? "night-theme" : "day-theme"
      }`}
    >
      {/* Dynamic Background */}
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
          isNight
            ? "bg-gradient-to-b from-black via-gray-950 to-black"
            : "bg-gradient-to-b from-blue-400 via-blue-300 to-blue-500"
        }`}
      ></div>

      {/* Animated Background Layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`transition-opacity duration-1000 ease-in-out ${isNight ? "opacity-100" : "opacity-0"}`}>
          <div className="dark-cloud-layer-1"></div>
          <div className="dark-cloud-layer-2"></div>
          <div className="dark-cloud-layer-3"></div>
        </div>

        <div className={`transition-opacity duration-1000 ease-in-out ${isNight ? "opacity-0" : "opacity-100"}`}>
          <div className="light-cloud-layer-1"></div>
          <div className="light-cloud-layer-2"></div>
          <div className="light-cloud-layer-3"></div>
        </div>
      </div>

      {/* Stars (only at night) */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out ${
          isNight ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="dim-star dim-star-1"></div>
        <div className="dim-star dim-star-2"></div>
        <div className="dim-star dim-star-3"></div>
        <div className="dim-star dim-star-4"></div>
        <div className="dim-star dim-star-5"></div>
        <div className="dim-star dim-star-6"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 gap-8">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div
              className={`p-3 backdrop-blur-lg rounded-2xl border shadow-lg transition-all duration-1000 ease-in-out ${
                isNight
                  ? "bg-black/60 border-gray-800/40 shadow-black/40"
                  : "bg-white/60 border-white/40 shadow-blue-500/20"
              }`}
            >
              <Music
                className={`w-8 h-8 transition-colors duration-1000 ease-in-out ${
                  isNight ? "text-gray-300" : "text-blue-700"
                }`}
              />
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full transition-all duration-500 ease-in-out transform hover:scale-110 ${
                isNight ? "bg-yellow-500/20 hover:bg-yellow-500/30" : "bg-indigo-500/20 hover:bg-indigo-500/30"
              }`}
            >
              <div className="relative w-6 h-6">
                <Sun
                  className={`absolute inset-0 w-6 h-6 text-yellow-500 transition-all duration-500 ease-in-out ${
                    isNight ? "opacity-0 rotate-180 scale-0" : "opacity-100 rotate-0 scale-100"
                  }`}
                />
                <Moon
                  className={`absolute inset-0 w-6 h-6 text-indigo-300 transition-all duration-500 ease-in-out ${
                    isNight ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-180 scale-0"
                  }`}
                />
              </div>
            </button>
          </div>

          <h1
            className={`text-6xl font-bold mb-4 animate-fade-in transition-all duration-1000 ease-in-out ${
              isNight
                ? "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-blue-800 via-blue-700 to-blue-900 bg-clip-text text-transparent"
            }`}
          >
            Audio Player
          </h1>

          <p
            className={`text-xl max-w-2xl mx-auto leading-relaxed animate-fade-in-delayed transition-colors duration-1000 ease-in-out ${
              isNight ? "text-gray-300/70" : "text-blue-800/80"
            }`}
          >
            {isNight
              ? "Música en la oscuridad de la noche, acompañada por la lluvia silenciosa"
              : "Disfruta la música bajo el cielo azul con la lluvia refrescante del día"}
          </p>
        </div>

        {/* Tab Navigation - SIEMPRE VISIBLE en la parte superior */}
        <div className="w-full max-w-2xl mx-auto">
          <div
            className={`flex rounded-2xl p-1 transition-all duration-1000 ease-in-out ${
              isNight
                ? "bg-black/40 backdrop-blur-xl border border-gray-800/30"
                : "bg-white/40 backdrop-blur-xl border border-white/30"
            }`}
          >
            <button
              onClick={() => setActiveTab("play")}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === "play"
                  ? isNight
                    ? "bg-gray-700 text-white shadow-lg"
                    : "bg-white text-blue-900 shadow-lg"
                  : isNight
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-blue-600 hover:text-blue-800"
              }`}
            >
              Play
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`flex-1 py-3 px-6 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === "historial"
                  ? isNight
                    ? "bg-gray-700 text-white shadow-lg"
                    : "bg-white text-blue-900 shadow-lg"
                  : isNight
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-blue-600 hover:text-blue-800"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Heart className="w-4 h-4" />
                Favoritos ({favorites.length})
              </div>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "play" ? (
          <>
            {/* Input Section */}
            <div className="w-full max-w-2xl mx-auto">
              <div
                className={`backdrop-blur-xl border rounded-3xl p-8 shadow-2xl transition-all duration-1000 ease-in-out hover:scale-105 ${
                  isNight
                    ? "bg-black/40 border-gray-800/30 hover:shadow-black/50"
                    : "bg-white/40 border-white/30 hover:shadow-blue-500/25"
                }`}
              >
                <div className="flex gap-4 items-center">
                  <div className="flex-1 relative">
                    <Input
                      type="url"
                      placeholder="https://ejemplo.com/audio.mp3"
                      value={editableLink}
                      onChange={(e) => setEditableLink(e.target.value)}
                      className={`h-14 text-lg rounded-2xl transition-all duration-1000 ease-in-out ${
                        isNight
                          ? "bg-black/30 border-gray-700/40 text-gray-200 placeholder:text-gray-400/60 focus:border-gray-600 focus:ring-gray-600/50"
                          : "bg-white/30 border-blue-300/40 text-blue-900 placeholder:text-blue-600/60 focus:border-blue-500 focus:ring-blue-500/50"
                      }`}
                    />
                    <div
                      className={`absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-all duration-300 pointer-events-none ${
                        isNight
                          ? "bg-gradient-to-r from-gray-800/10 to-gray-700/10"
                          : "bg-gradient-to-r from-blue-400/10 to-blue-500/10"
                      }`}
                    ></div>
                  </div>
                  <Button
                    onClick={handleRedirect}
                    className={`h-14 px-8 rounded-2xl shadow-lg transition-all duration-1000 ease-in-out transform hover:scale-105 ${
                      isNight
                        ? "bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 hover:shadow-gray-800/50"
                        : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-blue-500/50"
                    }`}
                    size="lg"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
                {/* Example URLs */}
                <div className="mt-4">
                  <p
                    className={`text-sm mb-2 transition-colors duration-1000 ease-in-out ${
                      isNight ? "text-gray-400" : "text-blue-600"
                    }`}
                  >
                    URLs de ejemplo:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {exampleUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setEditableLink(url)
                          router.push(`/?link=${encodeURIComponent(url)}`)
                        }}
                        className={`px-3 py-1 text-xs rounded-lg transition-all duration-300 hover:scale-105 ${
                          isNight
                            ? "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                            : "bg-blue-100/50 text-blue-700 hover:bg-blue-200/50"
                        }`}
                      >
                        Ejemplo {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Player */}
            {link && (
              <div className="w-full animate-slide-up">
                <AudioPlayer audioUrl={link} isNight={isNight} favorites={favorites} setFavorites={setFavorites} />
              </div>
            )}
          </>
        ) : (
          /* Historial Tab Content */
          <div className="w-full max-w-4xl mx-auto">
            <div
              className={`backdrop-blur-2xl p-10 rounded-3xl shadow-2xl border transition-all duration-1000 ease-in-out ${
                isNight ? "bg-black/70 text-white border-gray-900/40" : "bg-white/70 text-blue-900 border-white/40"
              }`}
            >
              <h3
                className={`text-xl font-semibold mb-6 transition-colors duration-1000 ease-in-out ${
                  isNight ? "text-white" : "text-blue-900"
                }`}
              >
                Audios Favoritos
              </h3>

              {favorites.length === 0 ? (
                <div
                  className={`text-center py-12 transition-colors duration-1000 ease-in-out ${
                    isNight ? "text-gray-400" : "text-blue-600"
                  }`}
                >
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg mb-2">No tienes audios favoritos aún</p>
                  <p className="text-sm opacity-70">Dale corazón a tus audios favoritos para verlos aquí</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                        isNight
                          ? "bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"
                          : "bg-white/30 border-blue-200/30 hover:bg-white/50"
                      }`}
                    >
                      <button
                        onClick={() => playFromHistory(favorite.url)}
                        className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                          isNight ? "bg-gray-700 hover:bg-gray-600" : "bg-blue-100 hover:bg-blue-200"
                        }`}
                      >
                        <Play
                          className={`w-4 h-4 transition-colors duration-1000 ease-in-out ${
                            isNight ? "text-gray-300" : "text-blue-700"
                          }`}
                        />
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium truncate transition-colors duration-1000 ease-in-out ${
                            isNight ? "text-white" : "text-blue-900"
                          }`}
                        >
                          {favorite.title}
                        </h4>
                        <p
                          className={`text-sm opacity-70 transition-colors duration-1000 ease-in-out ${
                            isNight ? "text-gray-400" : "text-blue-600"
                          }`}
                        >
                          Agregado: {favorite.addedAt}
                        </p>
                      </div>

                      <button
                        onClick={() => removeFavorite(favorite.id)}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                          isNight ? "hover:bg-red-900/30" : "hover:bg-red-100/30"
                        }`}
                      >
                        <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400 transition-colors" />
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
