import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  try {
    const response = await fetch('https://aviationweather.gov/data/iffdp/gfa/conus_prog_12.png');
    
    if (!response.ok) {
      console.error('Failed to fetch from AWC:', response.status);
      return res.status(502).json({ error: 'Failed to fetch image from AWC' });
    }

    const contentType = response.headers.get('content-type') || 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=600');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(502).json({ error: 'Proxy error' });
  }
}
