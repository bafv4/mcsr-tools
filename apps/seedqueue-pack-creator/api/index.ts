import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const host = req.headers.host || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const currentUrl = `${protocol}://${host}${req.url}`;
  const iconUrl = `${protocol}://${host}/public/icon.png`;

  // Extract name parameter from URL
  const shareName = req.query.name as string | undefined;
  const ogTitle = shareName || 'SeedQueue Wall Maker';
  const ogDescription = shareName
    ? `${shareName} - SeedQueue Wall Layout`
    : 'Create custom wall layouts for SeedQueue mod';

  // Fetch and serve the index.html from the deployed site
  try {
    const indexUrl = `${protocol}://${host}/index.html`;
    const indexResponse = await fetch(indexUrl);

    if (indexResponse.ok) {
      let indexHtml = await indexResponse.text();

      // Replace empty OG tags with actual URLs and custom name
      indexHtml = indexHtml
        .replace('<meta property="og:url" content="" />', `<meta property="og:url" content="${currentUrl}" />`)
        .replace('<meta property="og:title" content="SeedQueue Wall Maker" />', `<meta property="og:title" content="${ogTitle}" />`)
        .replace('<meta property="og:description" content="Create custom wall layouts for SeedQueue mod" />', `<meta property="og:description" content="${ogDescription}" />`)
        .replace('<meta property="og:image" content="" />', `<meta property="og:image" content="${iconUrl}" />`)
        .replace('<meta name="twitter:title" content="SeedQueue Wall Maker" />', `<meta name="twitter:title" content="${ogTitle}" />`)
        .replace('<meta name="twitter:description" content="Create custom wall layouts for SeedQueue mod" />', `<meta name="twitter:description" content="${ogDescription}" />`)
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
