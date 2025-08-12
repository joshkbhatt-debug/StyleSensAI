import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AnalysisResult {
  id?: string;
  userId?: string;
  text: string;
  tones: string[];
  revised: string;
  explanations: Array<{
    original: string;
    revised: string;
    rationale: string;
  }>;
  createdAt?: string;
}

export async function saveAnalysis(result: AnalysisResult): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from('histories')
    .insert({
      user_id: result.userId,
      tone: result.tones.join(','),
      input_text: result.text,
      output_text: result.revised,
      explanations: result.explanations,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error saving analysis:', error);
    throw new Error('Failed to save analysis');
  }

  return { id: data.id };
}

export async function getAnalysis(id: string, userId?: string): Promise<AnalysisResult | null> {
  let query = supabase
    .from('histories')
    .select('*')
    .eq('id', id);

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    text: data.input_text,
    tones: data.tone ? data.tone.split(',') : [],
    revised: data.output_text,
    explanations: data.explanations || [],
    createdAt: data.created_at,
  };
}

export async function getUserHistory(userId: string, limit = 10): Promise<AnalysisResult[]> {
  const { data, error } = await supabase
    .from('histories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching user history:', error);
    return [];
  }

  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    text: item.input_text,
    tones: item.tone ? item.tone.split(',') : [],
    revised: item.output_text,
    explanations: item.explanations || [],
    createdAt: item.created_at,
  }));
} 