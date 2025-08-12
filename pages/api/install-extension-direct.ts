import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { browserType } = req.body;
  
  try {
    // Create a temporary extension package
    const extensionPath = path.join(process.cwd(), 'extension', 'dist');
    const tempZipPath = path.join(process.cwd(), 'public', 'temp-extension.zip');
    
    // Check if extension files exist
    if (!fs.existsSync(extensionPath)) {
      return res.status(404).json({ error: 'Extension files not found' });
    }

    // Create a new ZIP file with the extension
    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log('Extension package created successfully');
    });

    archive.on('error', (err: any) => {
      console.error('Error creating extension package:', err);
      return res.status(500).json({ error: 'Failed to create extension package' });
    });

    archive.pipe(output);
    archive.directory(extensionPath, false);
    await archive.finalize();

    // Return the download URL and installation instructions
    const downloadUrl = '/temp-extension.zip';
    
    let installationMethod = 'manual';
    let instructions = [
      'Download the extension package',
      'Extract the ZIP file to a folder',
      'Open your browser\'s extension page',
      'Enable developer mode',
      'Click "Load unpacked" and select the extracted folder'
    ];

    if (browserType === 'chrome') {
      installationMethod = 'chrome-direct';
      instructions = [
        'The extension package has been prepared',
        'Chrome will attempt to install it automatically',
        'If automatic installation fails, use the manual method below'
      ];
    }

    res.status(200).json({
      success: true,
      downloadUrl,
      installationMethod,
      instructions,
      message: 'Extension package created successfully'
    });

  } catch (error) {
    console.error('Extension installation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create extension package',
      message: 'Please try manual installation'
    });
  }
} 