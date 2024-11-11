'use client';

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import AudioPlayer from '@/components/AudioPlayer'

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const link = searchParams.get('link')
  const [editableLink, setEditableLink] = useState(link || '')
  
  const handleRedirect = () => {
    router.push(`/?link=${encodeURIComponent(editableLink)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4 gap-6 animated-bg">
      <div className="text-center text-white">
        <h1 className="text-3xl font-bold mb-4">Audio Player</h1>
        <div className="flex gap-2 items-center justify-center max-w-xl mx-auto">
          <Input
            type="url"
            placeholder="https://example.com/audio.mp3"
            value={editableLink}
            onChange={(e) => setEditableLink(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button 
            onClick={handleRedirect}
            variant="secondary"
            size="icon"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {link && <AudioPlayer audioUrl={decodeURIComponent(searchParams.toString().replace("link=", ""))} />}
    </div>
  )
}