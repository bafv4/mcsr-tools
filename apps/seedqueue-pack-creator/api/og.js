export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    // Always return icon.png
    // Dynamic OG image generation is disabled due to WebAssembly restrictions in Vercel Edge Runtime
    const iconUrl = new URL('/icon.png', req.url);
    const iconResponse = await fetch(iconUrl);

    if (iconResponse.ok) {
      const iconBlob = await iconResponse.blob();
      return new Response(iconBlob, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return new Response('Icon not found', { status: 404 });
  } catch (error) {
    console.error('OG image failed:', error);
    return new Response('Failed to load image', { status: 500 });
  }
}
