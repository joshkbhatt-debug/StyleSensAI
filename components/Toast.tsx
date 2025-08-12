import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ToastProps {
  message: string
  actions?: {
    label: string
    href: string
    variant?: 'primary' | 'secondary'
  }[]
  onClose?: () => void
  duration?: number
}

export default function Toast({ message, actions, onClose, duration = 5000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(() => onClose?.(), 300) // Wait for fade out animation
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <p className="text-sm text-gray-700">{message}</p>
            {actions && actions.length > 0 && (
              <div className="flex space-x-2 mt-3">
                {actions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      action.variant === 'primary'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose?.(), 300)
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
} 