import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

// List of bot user agents that need OG tags
const BOT_USER_AGENTS = [
  'twitterbot',
  'facebookexternalhit',
  'discordbot',
  'slackbot',
  'telegrambot',
  'whatsapp',
  'linkedinbot',
];

function isBotRequest(userAgent: string): boolean {
  const lowerUA = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some((bot) => lowerUA.includes(bot));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userAgent = req.headers['user-agent'] || '';
  const layoutParam = req.query.layout as string | undefined;
  const host = req.headers.host || '';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const fullUrl = `${protocol}://${host}${req.url}`;

  // If it's a bot and has layout parameter, serve custom HTML with OG tags
  if (isBotRequest(userAgent) && layoutParam) {
    const ogImageUrl = `${protocol}://${host}/api/og?layout=${encodeURIComponent(layoutParam)}`;

    const html = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SeedQueue Wall Maker - Shared Layout</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="SeedQueue Wall Maker - Shared Layout" />
    <meta property="og:description" content="Check out this custom wall layout for SeedQueue mod" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="SeedQueue Wall Maker - Shared Layout" />
    <meta name="twitter:description" content="Check out this custom wall layout for SeedQueue mod" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <meta http-equiv="refresh" content="0;url=${fullUrl}" />
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  // For normal users, serve the index.html
  try {
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(indexHtml);
  } catch (error) {
    return res.status(500).send('Error loading page');
  }
}
