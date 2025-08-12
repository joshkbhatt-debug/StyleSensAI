import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { TONES } from '../data/tones'

interface HistoryItem {
  id: string
  text: string
  tones: string[]
  revised: string
  explanations: Array<{
    original: string
    revised: string
    rationale: string
  }>
  createdAt: string
}

export default function HistoryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        if (user) {
          // Load from Supabase
          const response = await fetch('/api/history')
          if (response.ok) {
            const data = await response.json()
            setHistory(data)
          }
        } else {
          // Load from localStorage
          const localHistory = JSON.parse(localStorage.getItem('sensai_history') || '[]')
          setHistory(localHistory)
        }
      } catch (error) {
        console.error('Error loading history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [user])

  const handleViewResult = (item: HistoryItem) => {
    router.push(`/result?id=${item.id}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getToneNames = (toneIds: string[]) => {
    return toneIds.map(id => TONES.find(t => t.id === id)?.name).filter(Boolean).join(', ')
  }

  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading history...</h2>
          <p className="text-gray-600">Please wait while we retrieve your past transformations.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                StyleSensAI
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/app')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Analysis
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your History</h1>
          <p className="text-gray-600">
            {user ? 'Your saved transformations from Supabase' : 'Your recent transformations (stored locally)'}
          </p>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No History Yet</h3>
            <p className="text-gray-500 mb-6">
              Start transforming your text to see your history here.
            </p>
            <button
              onClick={() => router.push('/app')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Your First Analysis
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewResult(item)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {getToneNames(item.tones)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Original Text
                    </h3>
                    <p className="text-gray-700 mb-4">
                      {truncateText(item.text)}
                    </p>
                    <h4 className="text-md font-semibold text-gray-900 mb-2">
                      Transformed Text
                    </h4>
                    <p className="text-gray-700">
                      {truncateText(item.revised)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 