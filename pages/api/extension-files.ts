import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { file } = req.query;
  
  // Base path for extension files
  const extensionPath = path.join(process.cwd(), 'extension', 'dist');
  
  try {
    if (!file || typeof file !== 'string') {
      // Serve the main extension directory listing
      const files = fs.readdirSync(extensionPath);
      const fileList = files.map(f => ({
        name: f,
        path: `/api/extension-files?file=${f}`,
        type: fs.statSync(path.join(extensionPath, f)).isDirectory() ? 'directory' : 'file'
      }));
      
      return res.status(200).json({
        type: 'directory',
        files: fileList,
        installUrl: `/api/extension-files?file=manifest.json`
      });
    }

    // Serve specific files
    const filePath = path.join(extensionPath, file);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(filePath);
      const fileList = files.map(f => ({
        name: f,
        path: `/api/extension-files?file=${file}/${f}`,
        type: fs.statSync(path.join(filePath, f)).isDirectory() ? 'directory' : 'file'
      }));
      
      return res.status(200).json({
        type: 'directory',
        path: file,
        files: fileList
      });
    }

    // Serve the actual file
    const content = fs.readFileSync(filePath);
    const ext = path.extname(file);
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (ext === '.json') contentType = 'application/json';
    else if (ext === '.js') contentType = 'application/javascript';
    else if (ext === '.css') contentType = 'text/css';
    else if (ext === '.html') contentType = 'text/html';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.svg') contentType = 'image/svg+xml';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    return res.status(200).send(content);
    
  } catch (error) {
    console.error('Error serving extension file:', error);
    return res.status(500).json({ error: 'Failed to serve extension file' });
  }
} 