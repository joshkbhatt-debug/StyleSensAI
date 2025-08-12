import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return installation instructions and download info
    const response = {
      success: true,
      message: 'StyleSensei Extension Ready for Installation',
      instructions: [
        '1. The extension files are included in your StyleSensei folder',
        '2. Go to chrome://extensions/',
        '3. Turn ON "Developer mode" (top-right toggle)',
        '4. Click "Load unpacked"',
        '5. Navigate to your StyleSensei folder',
        '6. Select the folder and click "Select Folder"',
        '7. The extension is now installed!'
      ],
      usage: [
        '• Go to any website (Gmail, Google Docs, etc.)',
        '• Select text you want to improve', 
        '• Look for the small "S" icon near your selection',
        '• Click it to transform your text!'
      ],
      features: [
        'Works on ANY website',
        'No API keys required from users',
        '6 different tones available',
        '9 different actions available',
        'Instant text replacement',
        'Copy to clipboard functionality'
      ]
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in extension download endpoint:', error);
    res.status(500).json({ error: 'Failed to provide extension information' });
  }
} 