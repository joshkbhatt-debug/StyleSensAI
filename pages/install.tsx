import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function Install() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()
  const { session_id } = router.query

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // If there's a session_id, confirm the subscription
    if (session_id) {
      confirmSubscription()
    }
  }, [user, session_id, router])

  const confirmSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session_id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to confirm subscription')
      }

      // Clear the session_id from URL
      router.replace('/install', undefined, { shallow: true })
    } catch (error) {
      console.error('Error confirming subscription:', error)
      setError('Failed to confirm subscription')
    }
  }

  const handleContinue = () => {
    router.push('/finish')
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            You're all set!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your subscription is active. Now let's install the browser extension.
          </p>
        </div>

        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Install Browser Extension
          </h3>

          {process.env.NEXT_PUBLIC_CWS_URL ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Install the StyleSensAI browser extension to use it on any website.
              </p>
              <a
                href={process.env.NEXT_PUBLIC_CWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.11 2 14 2.89 14 4V8H18C19.11 8 20 8.89 20 10V18C20 19.11 19.11 20 18 20H6C4.89 20 4 19.11 4 18V10C4 8.89 4.89 8 6 8H10V4C10 2.89 10.89 2 12 2M12 4V8H12.5C12.78 8 13 8.22 13 8.5V9.5C13 9.78 12.78 10 12.5 10H11.5C11.22 10 11 9.78 11 9.5V8.5C11 8.22 11.22 8 11.5 8H12V4Z"/>
                </svg>
                Add to Chrome
              </a>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Browser extension publishing soon!
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <p className="text-sm text-yellow-800">
                  We're working on publishing the extension to the Chrome Web Store. 
                  You'll be notified when it's available!
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-3">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Logged in</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-700">Plan active</span>
              </div>
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-gray-500">Extension installed</span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleContinue}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Continue
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-center">
            <div className="text-red-600 text-sm">
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 