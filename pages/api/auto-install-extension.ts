import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create extension package
    const extensionPath = path.join(process.cwd(), 'extension', 'dist');
    const tempZipPath = path.join(process.cwd(), 'public', 'auto-install-extension.zip');
    
    if (!fs.existsSync(extensionPath)) {
      return res.status(404).json({ error: 'Extension files not found' });
    }

    // Create ZIP package
    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log('Auto-install extension package created');
    });

    archive.on('error', (err: any) => {
      console.error('Error creating auto-install package:', err);
      return res.status(500).json({ error: 'Failed to create extension package' });
    });

    archive.pipe(output);
    archive.directory(extensionPath, false);
    await archive.finalize();

    // Create a special installation trigger
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const installUrl = `${baseUrl}/auto-install-extension.zip`;
    
    // Return installation data
    res.status(200).json({
      success: true,
      message: 'Extension ready for automatic installation',
      installUrl: installUrl,
      extensionId: 'sensai-extension-auto',
      autoInstall: true
    });

  } catch (error) {
    console.error('Auto-install error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to prepare extension for installation'
    });
  }
} 