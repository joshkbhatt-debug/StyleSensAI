import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { saveAnalysis } from '../../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, tones, revised, explanations } = req.body;

    // Validate input
    if (!text || !Array.isArray(tones) || !revised || !Array.isArray(explanations)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get user from auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnon, { 
      global: { headers: { cookie: req.headers.cookie || '' } } 
    });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Save to database
    const result = await saveAnalysis({
      userId: user.id,
      text,
      tones,
      revised,
      explanations,
    });

    return res.status(200).json({ id: result.id });
  } catch (error: any) {
    console.error('Error saving history:', error);
    return res.status(500).json({ error: error.message || 'Failed to save history' });
  }
} 