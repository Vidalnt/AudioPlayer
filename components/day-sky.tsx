"use client"
import { useEffect, useRef } from "react"
import { useSkyContext } from "../contexts/sky"

export default function DaySky() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { cloudsRef } = useSkyContext()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width: number
    let height: number
    let animationId: number

    const setCanvasDimensions = () => {
      // Use window dimensions directly like night-sky
      width = window.innerWidth
      height = window.innerHeight
      
      // Set canvas size to match window
      canvas.width = width
      canvas.height = height
      
      // Reset transformation
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      
      // Always reinitialize clouds on first load or when window size changes significantly
      // This ensures proper distribution after zoom/scale changes
      initializeClouds()
    }

    class Cloud {
      x: number
      y: number
      width: number
      height: number
      speed: number
      isVisible: boolean
      zIndex: number

      constructor() {
        this.width = Math.random() * 200 + 80
        this.height = this.width * 0.6
        this.x = width + this.width
        this.y = Math.random() * (height * 0.7)
        this.speed = Math.random() * 0.3 + 0.1
        this.isVisible = true
        // Z-index based on size and Y position (larger and higher clouds are further back)
        this.zIndex = Math.floor((this.width / 50) + (this.y / 100))
      }

      update() {
        this.x -= this.speed
        this.isVisible = this.x > -this.width && this.x < width + this.width

        if (this.x < -this.width) {
          this.x = width + this.width
          this.y = Math.random() * (height * 0.7)
          this.isVisible = true
        }

        // Sincronizar con el context
        this.syncToContext()
      }

      syncToContext() {
        const index = clouds.indexOf(this)
        if (index !== -1 && cloudsRef.current[index]) {
          cloudsRef.current[index] = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            speed: this.speed,
            isVisible: this.isVisible,
            zIndex: this.zIndex
          }
        }
      }

      draw() {
        if (!ctx) return
        ctx.save()
        ctx.translate(this.x, this.y)
        const w = this.width
        const h = this.height
        
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)"
        ctx.beginPath()
        // Cloud shape
        ctx.moveTo(w * 0.2, h * 0.8)
        ctx.lineTo(w * 0.8, h * 0.8)
        ctx.bezierCurveTo(w * 0.95, h * 0.8, w * 0.95, h * 0.6, w * 0.8, h * 0.55)
        ctx.bezierCurveTo(w * 0.85, h * 0.4, w * 0.75, h * 0.3, w * 0.6, h * 0.35)
        ctx.bezierCurveTo(w * 0.55, h * 0.2, w * 0.45, h * 0.2, w * 0.4, h * 0.35)
        ctx.bezierCurveTo(w * 0.35, h * 0.25, w * 0.15, h * 0.35, w * 0.2, h * 0.55)
        ctx.bezierCurveTo(w * 0.05, h * 0.6, w * 0.05, h * 0.8, w * 0.2, h * 0.8)
        ctx.closePath()
        ctx.fill()
        
        const gradient = ctx.createLinearGradient(0, 0, 0, h)
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.95)")
        gradient.addColorStop(1, "rgba(230, 230, 230, 0.95)")
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.restore()
      }
    }

    let clouds: Cloud[] = []

    function initializeClouds() {
      clouds = []
      cloudsRef.current = [] // Reset context clouds
      
      const cloudCount = Math.floor(width / 300) + 5
      for (let i = 0; i < cloudCount; i++) {
        const cloud = new Cloud()
        if (i % 3 === 0) {
          cloud.width = Math.random() * 100 + 60
          cloud.height = cloud.width * 0.6
        } else if (i % 3 === 1) {
          cloud.width = Math.random() * 150 + 100
          cloud.height = cloud.width * 0.6
        }
        cloud.x = Math.random() * width
        cloud.y = Math.random() * (height * 0.7)
        cloud.zIndex = Math.floor((cloud.width / 50) + (cloud.y / 100)) // Calcular z-index
        
        clouds.push(cloud)
        
        // Inicializar en el context
        cloudsRef.current.push({
          x: cloud.x,
          y: cloud.y,
          width: cloud.width,
          height: cloud.height,
          speed: cloud.speed,
          isVisible: cloud.isVisible,
          zIndex: cloud.zIndex
        })
      }
    }

    function animate() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

        // Draw sky gradient - fill the entire viewport
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "#64b5f6")
      gradient.addColorStop(0.5, "#90caf9")
      gradient.addColorStop(1, "#bbdefb")
      ctx.fillStyle = gradient
      // Fill the entire viewport, not just the canvas size
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
      const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      ctx.fillRect(0, 0, viewportWidth, viewportHeight)

      // Update and draw clouds in depth order (back to front)
      const sortedClouds = [...clouds].sort((a, b) => a.zIndex - b.zIndex)
      
      for (const cloud of sortedClouds) {
        cloud.update()
        cloud.draw()
      }

      animationId = requestAnimationFrame(animate)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)
    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  // Update cloud positions during resize while maintaining their distribution
  function updateCloudsForNewDimensions() {
    const oldWidth = width
    const oldHeight = height * 0.7 // Account for the 70% height limit for clouds
    
    // Update each cloud's position proportionally
    clouds.forEach(cloud => {
      // Calculate proportional position (0-1) in the old dimensions
      const propX = cloud.x / oldWidth
      const propY = (cloud.y / oldHeight) * 0.7 // Scale to 0-0.7 range
      
      // Apply to new dimensions
      cloud.x = propX * width
      cloud.y = propY * height
      
      // Adjust speed based on width change to maintain relative speed
      cloud.speed = (cloud.speed * width) / oldWidth
      
      // Ensure clouds stay within bounds
      cloud.x = Math.max(-cloud.width * 0.5, Math.min(cloud.x, width + cloud.width * 0.5))
      cloud.y = Math.max(0, Math.min(cloud.y, height * 0.7))
    })
  }

  // Add debounced resize handler
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        setCanvasDimensions()
      }, 100)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(resizeTimeout)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  }, [cloudsRef])

  return <canvas ref={canvasRef} className="w-full h-full" />
}