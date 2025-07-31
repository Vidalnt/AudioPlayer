"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLanguage } from "@/hooks/use-language"

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

export default function LanguageSelector({ isNight }: { isNight: boolean }) {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0]

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-center w-12 h-12 rounded-full backdrop-blur-md border transition-all duration-300 hover:scale-110 ${
            isNight
              ? "bg-black/20 border-white/10 hover:bg-black/30 text-white"
              : "bg-white/20 border-white/20 hover:bg-white/30 text-blue-900"
          }`}
          aria-label={t("language.selector")}
        >
          <span className="text-xl">🌍</span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`absolute bottom-16 right-0 backdrop-blur-md rounded-xl border shadow-lg overflow-hidden ${
                isNight ? "bg-black/30 border-white/10" : "bg-white/30 border-white/20"
              }`}
            >
              <div className="p-2 min-w-[140px]">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as "en" | "es")
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                      language === lang.code
                        ? isNight
                          ? "bg-white/20 text-white"
                          : "bg-white/30 text-blue-900"
                        : isNight
                          ? "hover:bg-white/10 text-white/80"
                          : "hover:bg-white/20 text-blue-800/80"
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="font-medium">{lang.name}</span>
                    {language === lang.code && <span className="ml-auto text-xs opacity-60">✓</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />}
    </div>
  )
}
