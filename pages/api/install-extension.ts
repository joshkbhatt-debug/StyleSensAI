import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const extensionPath = path.join(process.cwd(), 'extension', 'SensAI-extension.zip');
    
    // Check if extension file exists
    if (!fs.existsSync(extensionPath)) {
      // If extension doesn't exist, show modal instructions
      return res.status(404).json({ 
        error: 'Extension not found',
        instructions: {
          title: 'Install StyleSensAI Extension',
          steps: [
            'Open chrome://extensions',
            'Toggle "Developer mode"',
            'Click "Load unpacked"',
            'Select the "extension" folder from this project'
          ]
        }
      });
    }

    // Set headers for file download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename=SensAI-extension.zip');
    
    // Stream the file
    const fileStream = fs.createReadStream(extensionPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error serving extension:', error);
    res.status(500).json({ error: 'Failed to serve extension' });
  }
} 