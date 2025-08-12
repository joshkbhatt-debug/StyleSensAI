import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a special installation trigger
    const extensionPath = path.join(process.cwd(), 'extension', 'dist');
    const manifestPath = path.join(extensionPath, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: 'Extension manifest not found' });
    }

    // Read the manifest to get extension details
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Create a special installation URL that Chrome can recognize
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const extensionUrl = `${baseUrl}/api/extension-files`;
    
    // Return installation instructions and triggers
    res.status(200).json({
      success: true,
      message: 'Extension installation triggered',
      extensionId: manifest.name?.toLowerCase().replace(/\s+/g, '-') || 'sensai-extension',
      manifestUrl: `${extensionUrl}?file=manifest.json`,
      extensionUrl: extensionUrl,
      installTriggers: [
        // Method 1: Chrome Extension Installation API
        {
          method: 'chrome-api',
          url: `chrome-extension://install`,
          description: 'Chrome Extension Installation API'
        },
        // Method 2: Direct manifest loading
        {
          method: 'manifest-load',
          url: `${extensionUrl}?file=manifest.json`,
          description: 'Direct manifest loading'
        },
        // Method 3: Extension package download
        {
          method: 'package-download',
          url: '/SensAI-extension.zip',
          description: 'Extension package download'
        }
      ]
    });

  } catch (error) {
    console.error('Extension installation trigger error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger extension installation',
      message: 'Please try manual installation'
    });
  }
} 