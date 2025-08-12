import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create a special Chrome extension installation package
    const extensionPath = path.join(process.cwd(), 'extension', 'dist');
    const manifestPath = path.join(extensionPath, 'manifest.json');
    
    if (!fs.existsSync(manifestPath)) {
      return res.status(404).json({ error: 'Extension manifest not found' });
    }

    // Read the manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Create a special installation URL that Chrome can recognize
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Return Chrome extension installation data
    res.status(200).json({
      success: true,
      message: 'Chrome extension installation ready',
      extensionId: manifest.name?.toLowerCase().replace(/\s+/g, '-') || 'sensai-extension',
      manifestUrl: `${baseUrl}/api/extension-files?file=manifest.json`,
      extensionUrl: `${baseUrl}/api/extension-files`,
      installMethod: 'chrome-native',
      autoInstall: true
    });

  } catch (error) {
    console.error('Chrome extension installation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to prepare Chrome extension installation'
    });
  }
} 