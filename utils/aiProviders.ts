import { OpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

export type AIProvider = 'openai' | 'anthropic' | 'google'

export interface AIResponse {
  correctedText: string
  suggestions: Array<{
    original: string
    suggestion: string
    explanation: string
  }>
}

export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }
  return new OpenAI({ apiKey })
}

export function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  return new Anthropic({ apiKey })
}

export function getGoogleAI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_AI_API_KEY is not set')
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
  const openai = getOpenAI()

  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2,
    frequency_penalty: 0.3,
    response_format: { type: 'json_object' }
  })

  const raw = completion.choices?.[0]?.message?.content || '{}'
  return parseAIResponse(raw)
}

export async function callAnthropic(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
  const anthropic = getAnthropic()

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
    temperature: 0.2,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userPrompt }
    ]
  })

  const content = message.content[0]
  const raw = content.type === 'text' ? content.text : '{}'
  return parseAIResponse(raw)
}

export async function callGoogleAI(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
  const genAI = getGoogleAI()
  const model = genAI.getGenerativeModel({
    model: process.env.GOOGLE_MODEL || 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json'
    }
  })

  const prompt = `${systemPrompt}\n\n${userPrompt}`
  const result = await model.generateContent(prompt)
  const raw = result.response.text()
  return parseAIResponse(raw)
}

function parseAIResponse(raw: string): AIResponse {
  let data: any = {}

  try {
    data = JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        data = JSON.parse(match[0])
      } catch {
        // Failed to parse
      }
    }
  }

  return {
    correctedText: data.correctedText || '',
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : []
  }
}

export async function callAIProvider(
  provider: AIProvider,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  switch (provider) {
    case 'openai':
      return callOpenAI(systemPrompt, userPrompt)
    case 'anthropic':
      return callAnthropic(systemPrompt, userPrompt)
    case 'google':
      return callGoogleAI(systemPrompt, userPrompt)
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
} 