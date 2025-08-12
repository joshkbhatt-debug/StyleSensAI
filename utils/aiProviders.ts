import { OpenAI } from 'openai';

/**
 * Returns an instance of the OpenAI client using the server-side env var.
 * Never expose this key to the browser.
 */
export function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set. Add it to .env.local');
  }
  return new OpenAI({ apiKey });
} 