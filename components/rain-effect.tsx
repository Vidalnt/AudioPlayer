"use client"
import { useEffect, useRef } from "react"
import { useSkyContext } from "../contexts/sky"

interface RainEffectProps {
  isPlaying: boolean
  isNight: boolean
}

export default function RainEffect({ isPlaying, isNight }: RainEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { cloudsRef } = useSkyContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width: number
    let height: number
    let effects: (RainDrop | Meteor)[] = []
    let animationId: number

    const setCanvasDimensions = () => {
      // Get the real dimensions considering the browser zoom
      const rect = canvas.getBoundingClientRect()
      const pixelRatio = window.devicePixelRatio || 1
      
      width = rect.width
      height = rect.height
      
      // Configure the canvas for high resolution y zoom
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      
      // Scale the context for high resolution
      ctx.scale(pixelRatio, pixelRatio)
    }

    class RainDrop {
      x: number
      y: number
      length: number
      speed: number
      opacity: number
      width: number
      cloudIndex: number
      active: boolean
      wind: number
      zIndex: number // Z-index of the drop based on its cloud

      constructor(cloudIndex: number) {
        this.cloudIndex = cloudIndex
        this.active = false
        this.zIndex = 0 // Will be updated in resetPosition
        
        // Properties will be calculated dynamically based on the cloud
        this.resetPosition()
      }

      calculateDropProperties() {
        const cloud = cloudsRef.current[this.cloudIndex]
        if (!cloud) return

        // Scale the drop properties based on the cloud size
        const cloudSizeRatio = cloud.width / 150 // 150 is the base reference size
        const minSizeRatio = 0.3 // Minimum relative size
        const sizeRatio = Math.max(minSizeRatio, cloudSizeRatio)

        this.length = (Math.random() * 15 + 8) * sizeRatio
        this.width = (Math.random() * 1.5 + 0.8) * sizeRatio
        this.speed = (Math.random() * 6 + 3) * Math.sqrt(sizeRatio) // Velocidad proporcional
        this.opacity = Math.random() * 0.6 + 0.4
        this.wind = (Math.random() * 1 - 0.5) * sizeRatio
      }

      resetPosition() {
        const cloud = cloudsRef.current[this.cloudIndex]
        if (cloud && cloud.isVisible) {
          // Recalculate drop properties based on the current cloud size
          this.calculateDropProperties()
          
          // Inherit the z-index of the parent cloud
          this.zIndex = cloud.zIndex
          
          // Generate position from the bottom of the cloud with precision
          const cloudBottom = cloud.y + cloud.height
          const dropStartMargin = cloud.height * 0.05 // 5% of the cloud height as margin
          
          this.x = cloud.x + Math.random() * cloud.width * 0.85 + cloud.width * 0.075
          this.y = cloudBottom - dropStartMargin + Math.random() * dropStartMargin * 2 // Small variation around the edge
          
          this.active = true
        } else {
          this.active = false
        }
      }

      update() {
        if (!this.active) {
          const cloud = cloudsRef.current[this.cloudIndex]
          if (cloud && cloud.isVisible) {
            this.resetPosition()
          }
          return
        }

        const cloud = cloudsRef.current[this.cloudIndex]
        if (!cloud || !cloud.isVisible) {
          this.active = false
          return
        }

        // Verify that the drop has not desynchronized with the cloud
        const cloudBottom = cloud.y + cloud.height
        if (this.y < cloudBottom - cloud.height * 0.1) { // If it's too high
          this.resetPosition()
          return
        }

        this.y += this.speed
        this.x += this.wind

        if (this.y > height + this.length) {
          this.resetPosition()
        }
      }

      draw() {
        if (!this.active) return
        if (!ctx) return

        // Adjust visibility control
        const RAIN_INTENSITY = 1.2 // Global intensity factor (adjust: 0.5 = faint, 2.0 = very visible)
        const MIN_DEPTH_OPACITY = 0.5 // Minimum opacity for back clouds (0.3 → 0.5)
        const DEPTH_FADE_FACTOR = 0.08 // How fast they fade (0.1 → 0.08, less fade)

        // Apply additional opacity based on z-index (further back clouds = fainter drops)
        const cloud = cloudsRef.current[this.cloudIndex]
        const depthOpacity = cloud ? Math.max(MIN_DEPTH_OPACITY, 1 - (cloud.zIndex * DEPTH_FADE_FACTOR)) : 1
        const finalOpacity = this.opacity * depthOpacity * RAIN_INTENSITY

        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.length)
        gradient.addColorStop(0, `rgba(100, 150, 255, ${finalOpacity})`)
        gradient.addColorStop(0.5, `rgba(150, 180, 255, ${finalOpacity * 0.8})`)
        gradient.addColorStop(1, "rgba(200, 220, 255, 0)")

        ctx.strokeStyle = gradient
        ctx.lineWidth = this.width
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + this.wind, this.y + this.length)
        ctx.stroke()
      }
    }

    class Meteor {
      x: number
      y: number
      len: number
      speed: number
      size: number
      waitTime: number
      active: boolean
      opacity: number

      constructor() {
        this.reset()
      }

      reset() {
        this.x = Math.random() * width + 100
        this.y = -50
        this.len = Math.random() * 60 + 30
        this.speed = Math.random() * 8 + 4
        this.size = Math.random() * 1.2 + 0.8
        this.waitTime = Date.now() + Math.random() * 3000 + 1000
        this.active = false
        this.opacity = 1
      }

      update() {
        if (this.active) {
          this.x -= this.speed * 0.7
          this.y += this.speed
          this.opacity -= 0.015

          if (this.x < -this.len || this.y >= height || this.opacity <= 0) {
            this.reset()
          }
        } else {
          if (this.waitTime < Date.now()) {
            this.active = true
          }
        }
      }

      draw() {
        if (!ctx || !this.active) return

        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.len * 0.7, this.y - this.len)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`)
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

        ctx.strokeStyle = gradient
        ctx.lineWidth = this.size
        ctx.lineCap = "round"
        ctx.beginPath()
        ctx.moveTo(this.x, this.y)
        ctx.lineTo(this.x + this.len * 0.7, this.y - this.len)
        ctx.stroke()
      }
    }

    const initializeEffects = () => {
      effects = []

      if (!isPlaying) return

      if (isNight) {
        for (let i = 0; i < 5; i++) {
          effects.push(new Meteor())
        }
      } else {
        // Use the real clouds from the context
        const dropsPerCloud = 4
        for (let i = 0; i < cloudsRef.current.length; i++) {
          for (let j = 0; j < dropsPerCloud; j++) {
            effects.push(new RainDrop(i))
          }
        }
      }
    }

    const animate = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      if (isPlaying && effects.length > 0) {
        if (isNight) {
          // For meteors, render normally
          for (const effect of effects) {
            effect.update()
            effect.draw()
          }
        } else {
          // For raindrops, render by z-index (back to front)
          const rainDrops = effects as RainDrop[]
          
          // Update all drops
          for (const drop of rainDrops) {
            drop.update()
          }
          
          // Sort by z-index to render correctly the depth
          const sortedDrops = [...rainDrops].sort((a, b) => {
            const cloudA = cloudsRef.current[a.cloudIndex]
            const cloudB = cloudsRef.current[b.cloudIndex]
            return (cloudA?.zIndex || 0) - (cloudB?.zIndex || 0)
          })
          
          // Draw in order of depth
          for (const drop of sortedDrops) {
            drop.draw()
          }
        }
      }

      animationId = requestAnimationFrame(animate)
    }

    setCanvasDimensions()
    
    // Small delay to ensure clouds are initialized
    setTimeout(() => {
      initializeEffects()
      animate()
    }, 100)

    const handleResize = () => {
      setCanvasDimensions()
      setTimeout(() => {
        initializeEffects()
      }, 100)
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isPlaying, isNight, cloudsRef])

  if (!isPlaying) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[5]"
      style={{
        mixBlendMode: isNight ? "screen" : "normal",
        opacity: isNight ? 0.6 : 0.8,
      }}
    />
  )
}