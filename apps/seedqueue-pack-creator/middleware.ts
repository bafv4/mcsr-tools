import { NextRequest, NextResponse } from 'next/server';

export const config = {
  matcher: '/',
};

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

export default async function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const url = new URL(request.url);
  const layoutParam = url.searchParams.get('layout');

  // If it's a bot and has layout parameter, serve custom HTML with OG tags
  if (isBotRequest(userAgent) && layoutParam) {
    const ogImageUrl = `${url.origin}/api/og?layout=${encodeURIComponent(layoutParam)}`;

    const html = `
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SeedQueue Wall Maker - Shared Layout</title>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url.toString()}" />
    <meta property="og:title" content="SeedQueue Wall Maker - Shared Layout" />
    <meta property="og:description" content="Check out this custom wall layout for SeedQueue mod" />
    <meta property="og:image" content="${ogImageUrl}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url.toString()}" />
    <meta name="twitter:title" content="SeedQueue Wall Maker - Shared Layout" />
    <meta name="twitter:description" content="Check out this custom wall layout for SeedQueue mod" />
    <meta name="twitter:image" content="${ogImageUrl}" />

    <meta http-equiv="refresh" content="0;url=${url.toString()}" />
  </head>
  <body>
    <p>Redirecting...</p>
  </body>
</html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  }

  // For normal users, continue to the app
  return NextResponse.next();
}
