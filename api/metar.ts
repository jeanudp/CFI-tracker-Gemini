import type { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  const { ids } = req.query;

  if (!ids) {
    return res.status(400).json({ error: 'Missing ids parameter' });
  }

  try {
    const response = await fetch(`https://aviationweather.gov/api/data/metar?ids=${ids}&format=json`);
    
    if (!response.ok) {
      console.error('Failed to fetch METAR from AWC:', response.status);
      return res.status(502).json({ error: 'Failed to fetch METAR from AWC' });
    }

    const data = await response.json();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.status(200).json(data);
  } catch (error) {
    console.error('METAR Proxy error:', error);
    res.status(502).json({ error: 'Proxy error' });
  }
}
