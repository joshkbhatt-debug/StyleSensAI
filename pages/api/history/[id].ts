import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getAnalysis } from '../../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid ID' });
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

    // Get analysis from database
    const result = await getAnalysis(id, user.id);
    if (!result) {
      return res.status(404).json({ error: 'Analysis not found' });
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error fetching analysis:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch analysis' });
  }
} 