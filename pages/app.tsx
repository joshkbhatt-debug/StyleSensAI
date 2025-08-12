import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import Editor from '../components/Editor'
import Toolbar from '../components/Toolbar'
import Sidebar from '../components/Sidebar'
import Toast from '../components/Toast'
import { saveDocument } from '../utils/documentService'
import { getUserAccess, checkWordLimit } from '../utils/access.client'
import { requestWithTimeout } from '../utils/requestWithTimeout'
import { STYLE_OPTIONS, StyleId } from '../utils/constants'

interface Suggestion {
  original: string
  suggestion: string
  explanation: string
}

interface HistoryItem {
  id: string
  originalText: string
  transformedText: string
  style: string
  timestamp: Date
}

export default function AppPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [text, setText] = useState('')
  const [selectedStyle, setSelectedStyle] = useState<StyleId | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)
  const [docId, setDocId] = useState<string | null>(null)
  const [showBeforeAfter, setShowBeforeAfter] = useState(false)
  const [originalText, setOriginalText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [userAccess, setUserAccess] = useState<any>(null)
  const [showDemo, setShowDemo] = useState(false)
  const [showAuthToast, setShowAuthToast] = useState(false)
  const [showTimeoutToast, setShowTimeoutToast] = useState(false)
  
  // Editor ref for auto-focus
  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  
  // History feature
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (authLoading) return

    // Check for demo parameter
    if (router.query.demo === '1') {
      setShowDemo(true)
      // Clear the demo parameter
      router.replace('/app', undefined, { shallow: true })
    }

    // Check for pre-filled text from restart
    if (router.query.text && typeof router.query.text === 'string') {
      setText(decodeURIComponent(router.query.text))
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Check for demo parameter
    if (router.query.demo === '1') {
      setShowDemo(true)
      // Clear the demo parameter
      router.replace('/app', undefined, { shallow: true })
    }
  }, [router.query.demo])

  // Auto-focus the editor on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  const handleStyleChange = (styleId: StyleId | null) => {
    setSelectedStyle(styleId)
  }

  const handleFinish = async () => {
    if (!text.trim() || !selectedStyle) return

    // Store payload for the result page to process
    const payload = {
      text: text.trim(),
      style: selectedStyle
    }
    
    localStorage.setItem('sensai_payload', JSON.stringify(payload))
    router.push('/result')
  }

  const handleRestart = () => {
    setText(originalText)
    setShowBeforeAfter(false)
    setSidebarOpen(false)
    setSuggestions([])
  }

  const handleNewDraft = () => {
    setText('')
    setOriginalText('')
    setSelectedStyle(null)
    setSuggestions([])
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Text copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleSaveDocument = async () => {
    if (!user) {
      setShowAuthToast(true)
      setTimeout(() => setShowAuthToast(false), 3000)
      return
    }

    setSaving(true)
    setSaveStatus('idle')

    try {
      const result = await saveDocument({
        user_id: user.id,
        text: originalText,
        rewrittenText: text,
      })

      if (result.success) {
        setDocId(result.data?.id)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error saving document:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setSaving(false)
    }
  }

  const loadHistoryItem = (item: HistoryItem) => {
    setText(item.transformedText)
    setOriginalText(item.originalText)
    setSelectedStyle(item.style as StyleId)
    setShowBeforeAfter(true)
    setShowHistory(false)
  }

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Tour Overlay */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Welcome to StyleSensAI!</h3>
            <p className="text-gray-600 mb-4">
              Let's take a quick tour of the main features:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 mb-6">
              <li>• <strong>Tone Selection:</strong> Choose how you want your text to sound</li>
              <li>• <strong>AI Editor:</strong> Write or paste your text here</li>
              <li>• <strong>Explanations:</strong> See why changes were made</li>
            </ul>
            <button
              onClick={() => setShowDemo(false)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Start Writing
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Writing Controls</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Choose tones and transform your text
                </p>
              </div>
              
              <div className="p-6">
                {/* Style Selection */}
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Choose Your Style</h3>
                    <p className="text-sm text-gray-600 mt-1">Select a writing style to apply</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {STYLE_OPTIONS.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => handleStyleChange(selectedStyle === style.id ? null : style.id as StyleId)}
                        className={`group relative w-full text-left rounded-xl border p-4 transition-all duration-200 ${
                          selectedStyle === style.id
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className={`text-sm font-medium transition-colors ${
                              selectedStyle === style.id
                                ? 'text-purple-600'
                                : 'text-gray-900 group-hover:text-purple-600'
                            }`}>
                              {style.label}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{style.description}</div>
                          </div>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                            selectedStyle === style.id
                              ? 'bg-purple-500'
                              : 'bg-gray-100 group-hover:bg-purple-100'
                          }`}>
                            {selectedStyle === style.id ? (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 text-gray-400 group-hover:text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Quick Tips
                    </h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Enter your text in the editor</li>
                      <li>• Select a style for your writing</li>
                      <li>• Click "Finish" to transform your text</li>
                      <li>• View SensAI's explanations for detailed insights</li>
                    </ul>
                  </div>

                  {/* Finish Button */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleFinish}
                      disabled={!text.trim() || !selectedStyle || loadingAction}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loadingAction ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Transforming...
                        </div>
                      ) : (
                        'Finish'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Editor and Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editor Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Writing Editor</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Write or paste your text here, then select tones and click Finish
                </p>
              </div>
              <Editor 
                ref={editorRef}
                value={text} 
                onChange={setText} 
                disabled={loadingAction} 
              />
            </div>

            {/* Before/After Comparison - Only show in results */}
            {showBeforeAfter && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-green-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Before & After Comparison</h3>
                  <p className="text-sm text-gray-600 mt-1">See the transformation in action</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                        <span className="w-4 h-4 bg-red-400 rounded-full mr-3"></span>
                        Original Text
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{originalText}</p>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                      <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
                        SensAI ({selectedStyle})
                      </h4>
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{text}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Sidebar suggestions={suggestions} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {showAuthToast && (
        <Toast
          message="History isn't saved. Log in or sign up to keep your edits."
          actions={[
            { label: 'Log in', href: '/login', variant: 'primary' },
            { label: 'Sign up', href: '/signup', variant: 'secondary' }
          ]}
          onClose={() => setShowAuthToast(false)}
          duration={0}
        />
      )}
      {showTimeoutToast && (
        <Toast
          message="SensAI timed out—please try again."
          onClose={() => setShowTimeoutToast(false)}
          duration={5000}
        />
      )}
    </div>
  )
} 