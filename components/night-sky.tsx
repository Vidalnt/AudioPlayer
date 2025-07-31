"use client"

import { useEffect, useRef } from "react"

export default function NightSky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width: number
    let height: number

    const setCanvasDimensions = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initializeEntities()
    }

    class Star {
      x: number
      y: number
      size: number
      speed: number
      brightness: number
      twinkleSpeed: number
      twinkleDirection: number
      originalY: number
      yOffset: number
      ySpeed: number

      constructor(options: { x: number; y: number }) {
        this.x = options.x
        this.y = options.y
        this.originalY = options.y
        this.size = Math.random() * 1.5
        this.speed = Math.random() * 0.05 + 0.02
        this.brightness = Math.random() * 0.5 + 0.5
        this.twinkleSpeed = Math.random() * 0.02 + 0.005
        this.twinkleDirection = Math.random() > 0.5 ? 1 : -1
        this.yOffset = 0
        this.ySpeed = Math.random() * 0.02 - 0.01
      }

      reset() {
        this.size = Math.random() * 1.5
        this.speed = Math.random() * 0.05 + 0.02
        this.x = width
        this.y = Math.random() * height
        this.originalY = this.y
        this.brightness = Math.random() * 0.5 + 0.5
      }

      update() {
        this.x -= this.speed

        this.yOffset += this.ySpeed
        if (Math.abs(this.yOffset) > 2) {
          this.ySpeed = -this.ySpeed
        }
        this.y = this.originalY + this.yOffset

        this.brightness += this.twinkleSpeed * this.twinkleDirection
        if (this.brightness > 1) {
          this.brightness = 1
          this.twinkleDirection = -1
        } else if (this.brightness < 0.2) {
          this.brightness = 0.2
          this.twinkleDirection = 1
        }

        if (this.x < 0) {
          this.reset()
        } else if (ctx) {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness})`
          ctx.beginPath()
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    class ShootingStar {
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
        this.x = Math.random() * width
        this.y = 0
        this.len = Math.random() * 80 + 20
        this.speed = Math.random() * 15 + 8
        this.size = Math.random() * 1.5 + 0.5
        this.waitTime = new Date().getTime() + Math.random() * 2000 + 500
        this.active = false
        this.opacity = 1
      }

      update() {
        if (this.active) {
          this.x -= this.speed * 0.8
          this.y += this.speed
          this.opacity -= 0.02

          if (this.x < -this.len || this.y >= height || this.opacity <= 0) {
            this.reset()
          } else if (ctx) {
            const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.len, this.y - this.len)
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`)
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

            ctx.strokeStyle = gradient
            ctx.lineWidth = this.size
            ctx.beginPath()
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(this.x + this.len, this.y - this.len)
            ctx.stroke()
          }
        } else {
          if (this.waitTime < new Date().getTime()) {
            this.active = true
          }
        }
      }
    }

    class Moon {
      x: number
      y: number
      radius: number

      constructor() {
        this.x = width * 0.8
        this.y = height * 0.2
        this.radius = Math.min(width, height) * 0.05
      }

      draw() {
        if (!ctx) return

        // Moon glow
        const glowGradient = ctx.createRadialGradient(
          this.x,
          this.y,
          this.radius * 0.5,
          this.x,
          this.y,
          this.radius * 3,
        )
        glowGradient.addColorStop(0, "rgba(210, 220, 230, 0.3)")
        glowGradient.addColorStop(0.5, "rgba(210, 220, 230, 0.1)")
        glowGradient.addColorStop(1, "rgba(210, 220, 230, 0)")

        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2)
        ctx.fill()

        // Moon
        ctx.fillStyle = "#e1e5eb"
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.fill()

        // Craters
        ctx.fillStyle = "rgba(200, 200, 210, 0.4)"
        ctx.beginPath()
        ctx.arc(this.x - this.radius * 0.3, this.y - this.radius * 0.2, this.radius * 0.15, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(this.x + this.radius * 0.4, this.y + this.radius * 0.3, this.radius * 0.1, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(this.x + this.radius * 0.1, this.y - this.radius * 0.4, this.radius * 0.12, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    let entities: (Star | ShootingStar)[] = []
    let moon: Moon

    function initializeEntities() {
      entities = []
      const numStars = Math.min(Math.floor(height / 2), 1000)

      for (let i = 0; i < numStars; i++) {
        entities.push(
          new Star({
            x: Math.random() * width,
            y: Math.random() * height,
          }),
        )
      }

      for (let i = 0; i < 5; i++) {
        entities.push(new ShootingStar())
      }

      moon = new Moon()
    }

    function animate() {
      if (!ctx) return

      ctx.fillStyle = "#0d0d0d"
      ctx.fillRect(0, 0, width, height)

      moon.draw()

      for (let i = 0; i < entities.length; i++) {
        entities[i].update()
      }

      requestAnimationFrame(animate)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)
    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}
