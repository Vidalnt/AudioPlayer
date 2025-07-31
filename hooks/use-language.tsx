"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"

type Language = "en" | "es"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  translations: any
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguageState] = useState<Language>("en")
  const [translations, setTranslations] = useState<any>({})

  const loadTranslations = async (lang: Language) => {
    try {
      const response = await fetch(`/lang/${lang}.json`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTranslations(data)
    } catch (error) {
      console.error("Error loading translations:", error)
      // Fallback to English if there's an error
      if (lang !== "en") {
        try {
          const fallbackResponse = await fetch("/lang/en.json")
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          }
        } catch (fallbackError) {
          console.error("Error loading fallback translations:", fallbackError)
          // Set empty translations as last resort
          setTranslations({})
        }
      } else {
        // Set empty translations as last resort
        setTranslations({})
      }
    }
  }

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("preferred-language", lang)
    loadTranslations(lang)
  }

  const t = (key: string): string => {
    const keys = key.split(".")
    let value = translations

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        return key // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key
  }

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem("preferred-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "es")) {
      setLanguageState(savedLanguage)
      loadTranslations(savedLanguage)
    } else {
      // Detect browser language
      const browserLang = navigator.language.toLowerCase()
      const detectedLang = browserLang.startsWith("es") ? "es" : "en"
      setLanguageState(detectedLang)
      loadTranslations(detectedLang)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>{children}</LanguageContext.Provider>
  )
}
