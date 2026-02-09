'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ChatProactiveTrigger() {
  const [showBubble, setShowBubble] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (dismissed) return

    // Show after 30 seconds
    const timer = setTimeout(() => {
      setShowBubble(true)
    }, 30000)

    // Or show on 50% scroll
    let scrollTriggered = false
    const handleScroll = () => {
      if (scrollTriggered) return
      const scrollableHeight = document.body.scrollHeight - window.innerHeight
      if (scrollableHeight <= 0) return
      const scrollPercent = window.scrollY / scrollableHeight
      if (scrollPercent > 0.5) {
        scrollTriggered = true
        setShowBubble(true)
        window.removeEventListener('scroll', handleScroll)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [dismissed])

  // Auto-dismiss after 8 seconds
  useEffect(() => {
    if (!showBubble) return
    const timer = setTimeout(() => {
      setShowBubble(false)
      setDismissed(true)
    }, 8000)
    return () => clearTimeout(timer)
  }, [showBubble])

  const handleClick = () => {
    setShowBubble(false)
    setDismissed(true)
    // Open the chat widget by clicking its button (uses aria-label from vael-chat.js)
    const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement
    if (chatButton) chatButton.click()
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowBubble(false)
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {showBubble && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={handleClick}
          className="fixed bottom-24 right-6 z-50 max-w-xs cursor-pointer"
        >
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-4 pr-8 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-stone-400 hover:text-stone-600 transition-colors"
              aria-label="Dismiss"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <p className="text-sm text-stone-700 font-medium">
              Have questions about our packages?
            </p>
            <p className="text-xs text-stone-500 mt-1">
              I can help! Click to chat.
            </p>
            {/* Small triangle pointer toward the chat button */}
            <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white border-r border-b border-stone-200 transform rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
