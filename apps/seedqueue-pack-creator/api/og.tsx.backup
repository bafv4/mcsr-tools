import { ImageResponse } from '@vercel/og';

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
  useGrid?: boolean;
  columns?: number;
  rows?: number;
  padding?: number;
  show?: boolean;
}

interface WallLayout {
  main: Area;
  locked: Area;
  preparing: Area;
}

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const layoutParam = searchParams.get('layout');

    const width = 1200;
    const height = 630;

    // If no layout parameter, show default widget
    if (!layoutParam) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1a1a1a',
              position: 'relative',
            }}
          >
            {/* Main content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 30,
              }}
            >
              {/* Title */}
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 'bold',
                  color: '#ffffff',
                  textAlign: 'center',
                }}
              >
                SeedQueue Wall Maker
              </div>

              {/* Subtitle */}
              <div
                style={{
                  fontSize: 32,
                  color: '#888888',
                  textAlign: 'center',
                }}
              >
                Create custom wall layouts for SeedQueue mod
              </div>

              {/* Feature list */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 15,
                  marginTop: 40,
                  paddingLeft: 60,
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    color: '#bbbbbb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 'rgb(37, 99, 235)',
                    }}
                  />
                  Customizable wall layouts
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: '#bbbbbb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 'rgb(234, 88, 12)',
                    }}
                  />
                  Multiple resolution support
                </div>
                <div
                  style={{
                    fontSize: 24,
                    color: '#bbbbbb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                  }}
                >
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: 'rgb(22, 163, 74)',
                    }}
                  />
                  Easy layout sharing
                </div>
              </div>
            </div>
          </div>
        ),
        {
          width,
          height,
        }
      );
    }

    // Decode layout from base64
    const layoutData: WallLayout = JSON.parse(atob(layoutParam));

    // Scale factor to fit layout into OG image
    const scaleX = width / 1920;
    const scaleY = height / 1080;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1a1a1a',
            position: 'relative',
          }}
        >
          {/* Title */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              left: 60,
              fontSize: 48,
              fontWeight: 'bold',
              color: '#ffffff',
            }}
          >
            SeedQueue Wall Layout
          </div>

          {/* Layout visualization */}
          <div
            style={{
              position: 'relative',
              width: width - 120,
              height: height - 160,
              display: 'flex',
            }}
          >
            {/* Main area */}
            <div
              style={{
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
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 'bold',
                  color: 'rgb(37, 99, 235)',
                }}
              >
                Main
                {layoutData.main.useGrid && layoutData.main.columns && layoutData.main.rows
                  ? ` (${layoutData.main.columns}×${layoutData.main.rows})`
                  : ''}
              </div>
            </div>

            {/* Locked area */}
            {layoutData.locked.show !== false && (
              <div
                style={{
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
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: 'rgb(234, 88, 12)',
                  }}
                >
                  Locked
                </div>
              </div>
            )}

            {/* Preparing area */}
            {layoutData.preparing.show !== false && (
              <div
                style={{
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
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 'bold',
                    color: 'rgb(22, 163, 74)',
                  }}
                >
                  Preparing
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              right: 60,
              fontSize: 20,
              color: '#888888',
            }}
          >
            Created with SeedQueue Wall Maker
          </div>
        </div>
      ),
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
