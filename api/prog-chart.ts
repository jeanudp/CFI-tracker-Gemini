import type { Request, Response } from 'express';
import https from 'https';

const URLS = [
  'https://aviationweather.gov/data/iffdp/gfa/US_prog_12.png',
  'https://aviationweather.gov/data/iffdp/gfa/conus_prog_12.png',
  'https://aviationweather.gov/data/iffdp/gfa/CONUS_prog_12.png'
];

export default function handler(req: Request, res: Response) {
  function attemptFetch(index: number) {
    if (index >= URLS.length) {
      res.status(502).send('Chart unavailable');
      return;
    }

    const url = URLS[index];
    https.get(url, (awcRes) => {
      if (awcRes.statusCode === 200) {
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=600');
        awcRes.pipe(res);
      } else {
        console.warn(`AWC Chart URL failed (${awcRes.statusCode}): ${url}`);
        // Consume response to free up memory/socket
        awcRes.resume();
        attemptFetch(index + 1);
      }
    }).on('error', (err) => {
      console.error(`HTTPS Proxy error for ${url}:`, err);
      attemptFetch(index + 1);
    });
  }

  attemptFetch(0);
}
