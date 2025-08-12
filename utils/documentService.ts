// Client-side service for document operations
export interface SaveDocumentParams {
  text: string
  rewrittenText: string
  user_id: string
}

export interface SaveDocumentResult {
  success: boolean
  data?: any
  error?: string
}

/**
 * Save a document to Supabase via the API route
 * @param params - Document data to save
 * @returns Promise with save result
 */
export async function saveDocument(params: SaveDocumentParams): Promise<SaveDocumentResult> {
  try {
    const response = await fetch('/api/save-doc', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || `HTTP ${response.status}: ${response.statusText}`
      }
    }

    return result
  } catch (error) {
    console.error('Error saving document:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
} 