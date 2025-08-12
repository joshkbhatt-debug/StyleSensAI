import { NextApiRequest, NextApiResponse } from 'next'
import { supabaseServerClient, DocumentData, SaveDocumentResponse } from '../../utils/supabaseServerClient'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SaveDocumentResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST requests are accepted.'
    })
  }

  try {
    const { text, rewrittenText, user_id } = req.body

    // Validate required fields
    if (!text || !rewrittenText || !user_id) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: text, rewrittenText, and user_id are required'
      })
    }

    // Prepare document data
    const documentData: DocumentData = {
      user_id,
      original: text,
      rewritten: rewrittenText
    }

    // Insert document into Supabase
    const { data, error } = await supabaseServerClient
      .from('documents')
      .insert([documentData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return res.status(500).json({
        success: false,
        error: `Database error: ${error.message}`
      })
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: data[0] // Return the inserted document
    })

  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
} 