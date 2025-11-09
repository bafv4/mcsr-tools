import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const layoutParam = searchParams.get('layout');

    const width = 1200;
    const height = 630;

    // If no layout parameter, show default image
    if (!layoutParam) {
      // Return icon.png as fallback
      try {
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
      } catch (err) {
        console.error('Failed to fetch icon.png:', err);
      }

      return new Response('No layout parameter provided', { status: 400 });
    }

    // Decode layout from base64
    const layoutData = JSON.parse(atob(layoutParam));

    // Scale factor to fit layout into OG image
    const scaleX = width / 1920;
    const scaleY = height / 1080;

    return new ImageResponse(
      {
        type: 'div',
        props: {
          style: {
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            position: 'relative',
          },
          children: [
            // Title
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: 40,
                  left: 60,
                  fontSize: 48,
                  fontWeight: 'bold',
                  color: '#ffffff',
                },
                children: 'SeedQueue Wall Layout',
              },
            },
            // Layout visualization
            {
              type: 'div',
              props: {
                style: {
                  position: 'relative',
                  width: width - 120,
                  height: height - 160,
                  display: 'flex',
                },
                children: [
                  // Main area
                  {
                    type: 'div',
                    props: {
                      style: {
                        position: 'absolute',
                        left: layoutData.main.x * scaleX,
                        top: layoutData.main.y * scaleY,
                        width: layoutData.main.width * scaleX,
                        height: layoutData.main.height * scaleY,
                        backgroundColor: 'rgba(37, 99, 235, 0.3)',
                        border: '3px solid rgb(37, 99, 235)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      },
                      children: {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 24,
                            fontWeight: 'bold',
                            color: 'rgb(37, 99, 235)',
                          },
                          children: `Main${
                            layoutData.main.useGrid && layoutData.main.columns && layoutData.main.rows
                              ? ` (${layoutData.main.columns}×${layoutData.main.rows})`
                              : ''
                          }`,
                        },
                      },
                    },
                  },
                  // Locked area (if shown)
                  ...(layoutData.locked.show !== false
                    ? [
                        {
                          type: 'div',
                          props: {
                            style: {
                              position: 'absolute',
                              left: layoutData.locked.x * scaleX,
                              top: layoutData.locked.y * scaleY,
                              width: layoutData.locked.width * scaleX,
                              height: layoutData.locked.height * scaleY,
                              backgroundColor: 'rgba(234, 88, 12, 0.3)',
                              border: '3px solid rgb(234, 88, 12)',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            children: {
                              type: 'div',
                              props: {
                                style: {
                                  fontSize: 20,
                                  fontWeight: 'bold',
                                  color: 'rgb(234, 88, 12)',
                                },
                                children: 'Locked',
                              },
                            },
                          },
                        },
                      ]
                    : []),
                  // Preparing area (if shown)
                  ...(layoutData.preparing.show !== false
                    ? [
                        {
                          type: 'div',
                          props: {
                            style: {
                              position: 'absolute',
                              left: layoutData.preparing.x * scaleX,
                              top: layoutData.preparing.y * scaleY,
                              width: layoutData.preparing.width * scaleX,
                              height: layoutData.preparing.height * scaleY,
                              backgroundColor: 'rgba(22, 163, 74, 0.3)',
                              border: '3px solid rgb(22, 163, 74)',
                              borderRadius: 8,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            children: {
                              type: 'div',
                              props: {
                                style: {
                                  fontSize: 20,
                                  fontWeight: 'bold',
                                  color: 'rgb(22, 163, 74)',
                                },
                                children: 'Preparing',
                              },
                            },
                          },
                        },
                      ]
                    : []),
                ],
              },
            },
            // Footer
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: 40,
                  right: 60,
                  fontSize: 20,
                  color: '#888888',
                },
                children: 'Created with SeedQueue Wall Maker',
              },
            },
          ],
        },
      },
      {
        width,
        height,
      }
    );
  } catch (error) {
    console.error('OG image generation failed:', error);

    // Fallback to icon.png
    try {
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
    } catch (fallbackError) {
      console.error('Fallback to icon.png failed:', fallbackError);
    }

    return new Response('Failed to generate image', { status: 500 });
  }
}
