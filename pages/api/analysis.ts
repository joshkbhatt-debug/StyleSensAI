import type { NextApiRequest, NextApiResponse } from 'next';
import { getOpenAI } from '../../utils/aiProviders';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../utils/prompts';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { text, style } = req.body as { text?: string; style?: string; };
  if (!text || !style) return res.status(400).json({ error: 'Missing text or style' });

  let openai;
  try { 
    openai = getOpenAI(); 
  } catch (e: any) {
    return res.status(500).json({ error: e.message || 'OpenAI configuration error' });
  }

  const userPrompt = buildUserPrompt(text, style);

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      frequency_penalty: 0.3
    });

    const raw = completion.choices?.[0]?.message?.content || '';
    let data: any = {};
    try {
      data = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) data = JSON.parse(match[0]);
    }
    if (!data.correctedText) data.correctedText = '';
    if (!Array.isArray(data.suggestions)) data.suggestions = [];

    res.status(200).json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'OpenAI request failed' });
  }
}