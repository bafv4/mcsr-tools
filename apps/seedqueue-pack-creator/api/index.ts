import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const currentUrl = `${protocol}://${host}${req.url}`;
  const iconUrl = `${protocol}://${host}/icon.png`;

  // Fetch and serve the index.html from the deployed site
  try {
    const indexUrl = `${protocol}://${host}/index.html`;
    const indexResponse = await fetch(indexUrl);

    if (indexResponse.ok) {
      let indexHtml = await indexResponse.text();

      // Replace empty OG tags with actual URLs
      indexHtml = indexHtml
        .replace('<meta property="og:url" content="" />', `<meta property="og:url" content="${currentUrl}" />`)
        .replace('<meta property="og:image" content="" />', `<meta property="og:image" content="${iconUrl}" />`)
        .replace('<meta name="twitter:image" content="" />', `<meta name="twitter:image" content="${iconUrl}" />`);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(indexHtml);
    }

    // Fallback: redirect to /index.html
    return res.redirect(307, '/index.html');
  } catch (error) {
    console.error('Error loading index.html:', error);
    // Fallback: redirect to /index.html
    return res.redirect(307, '/index.html');
  }
}
