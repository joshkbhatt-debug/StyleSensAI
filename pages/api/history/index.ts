import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { getUserHistory } from '../../../lib/supabaseServer';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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

    // Get user history from database
    const history = await getUserHistory(user.id, 20); // Limit to 20 items

    return res.status(200).json(history);
  } catch (error: any) {
    console.error('Error fetching history:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch history' });
  }
} 