import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'

export default function Finish() {
  const router = useRouter()
  const { user } = useAuth()

  const handleContinue = () => {
    router.push('/app')
  }

  const handleDemo = () => {
    router.push('/app?demo=1')
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to StyleSensAI!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You're all set up and ready to improve your writing.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Continue with StyleSensAI
          </button>
          
          <button
            onClick={handleDemo}
            className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Take a 60-sec Demo
          </button>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            What's next?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start writing in the editor</li>
            <li>• Choose your tone and action</li>
            <li>• Get AI-powered suggestions</li>
            <li>• Use the browser extension on any website</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 