import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

const PURPOSE_OPTIONS = [
  { id: 'work', label: 'Work', description: 'Professional emails, reports, and documents' },
  { id: 'school', label: 'School', description: 'Essays, assignments, and academic writing' },
  { id: 'personal', label: 'Personal', description: 'Social media, personal projects, and creative writing' },
  { id: 'other', label: 'Other', description: 'Other writing needs' }
]

const GOAL_OPTIONS = [
  { id: 'clarity', label: 'Clarity', description: 'Make my writing clearer and easier to understand' },
  { id: 'conciseness', label: 'Conciseness', description: 'Make my writing more concise and to the point' },
  { id: 'politeness', label: 'Politeness', description: 'Make my writing more polite and professional' },
  { id: 'persuasive', label: 'Persuasive', description: 'Make my writing more persuasive and compelling' },
  { id: 'academic', label: 'Academic', description: 'Make my writing more formal and scholarly' },
  { id: 'creative', label: 'Creative', description: 'Make my writing more creative and engaging' }
]

const LENGTH_OPTIONS = [
  { id: 'short', label: 'Short messages', description: 'Emails, social media posts, quick notes' },
  { id: 'paragraphs', label: 'Paragraphs', description: 'Blog posts, reports, medium-length content' },
  { id: 'long-form', label: 'Long-form', description: 'Essays, articles, detailed documents' }
]

type OnboardingStep = 'purpose' | 'goal' | 'length'

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('purpose')
  const [purpose, setPurpose] = useState('')
  const [goal, setGoal] = useState('')
  const [length, setLength] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Create or update profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          purpose,
          goal,
          length,
          onboarding_complete: true
        })

      if (error) {
        setError('Failed to save your preferences')
        return
      }

      // Check if user has subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (subscription) {
        router.push('/app')
      } else {
        router.push('/pricing')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'purpose':
        return 'What are you using StyleSensAI for?'
      case 'goal':
        return 'What\'s your preferred writing goal?'
      case 'length':
        return 'How long is your typical writing?'
      default:
        return ''
    }
  }

  const getStepOptions = () => {
    switch (currentStep) {
      case 'purpose':
        return PURPOSE_OPTIONS
      case 'goal':
        return GOAL_OPTIONS
      case 'length':
        return LENGTH_OPTIONS
      default:
        return []
    }
  }

  const getCurrentValue = () => {
    switch (currentStep) {
      case 'purpose':
        return purpose
      case 'goal':
        return goal
      case 'length':
        return length
      default:
        return ''
    }
  }

  const setCurrentValue = (value: string) => {
    switch (currentStep) {
      case 'purpose':
        setPurpose(value)
        break
      case 'goal':
        setGoal(value)
        break
      case 'length':
        setLength(value)
        break
    }
  }

  const handleNext = () => {
    if (currentStep === 'purpose') {
      setCurrentStep('goal')
    } else if (currentStep === 'goal') {
      setCurrentStep('length')
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep === 'goal') {
      setCurrentStep('purpose')
    } else if (currentStep === 'length') {
      setCurrentStep('goal')
    }
  }

  const canProceed = () => {
    return getCurrentValue() !== ''
  }

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Tell us about your writing
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This helps us personalize your experience
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {(['purpose', 'goal', 'length'] as OnboardingStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : index < (['purpose', 'goal', 'length'] as OnboardingStep[]).indexOf(currentStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              {index < 2 && (
                <div className={`w-8 h-1 mx-2 ${
                  index < (['purpose', 'goal', 'length'] as OnboardingStep[]).indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-gray-900 text-center">
            {getStepTitle()}
          </h3>

          <div className="space-y-3">
            {getStepOptions().map((option) => (
              <button
                key={option.id}
                onClick={() => setCurrentValue(option.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  getCurrentValue() === option.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            {currentStep !== 'purpose' && (
              <button
                onClick={handleBack}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : currentStep === 'length' ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 