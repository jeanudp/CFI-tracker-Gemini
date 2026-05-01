import type { Request, Response } from 'express';
import https from 'https';

export default function handler(req: Request, res: Response) {
  const url = 'https://aviationweather.gov/data/iffdp/gfa/conus_prog_12.png';

  https.get(url, (awcRes) => {
    if (awcRes.statusCode !== 200) {
      console.error('Failed to fetch chart from AWC:', awcRes.statusCode);
      res.status(502).send('Failed to fetch chart');
      return;
    }

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=600');
    
    awcRes.pipe(res);
  }).on('error', (err) => {
    console.error('HTTPS Proxy error:', err);
    res.status(502).send('Failed to fetch chart');
  });
}
