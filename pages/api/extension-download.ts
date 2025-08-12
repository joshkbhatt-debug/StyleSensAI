import type { NextApiRequest, NextApiResponse } from 'next';
import { createReadStream } from 'fs';
import { join } from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = join(process.cwd(), 'public', 'extension.zip');
    
    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="StyleSensAI-extension.zip"');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Stream the file
    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving extension file:', error);
    res.status(404).json({ error: 'Extension file not found' });
  }
} 