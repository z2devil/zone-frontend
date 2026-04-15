import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const appId = searchParams.get('appId');

  if (!appId) {
    return NextResponse.json({ error: 'App ID is required' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&filters=movies`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch Steam data' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data[appId]?.success) {
      return NextResponse.json(
        { error: 'App not found or no data available' },
        { status: 404 }
      );
    }

    const movies = data[appId]?.data?.movies;

    if (!movies || movies.length === 0) {
      return NextResponse.json(
        { error: 'No videos available for this app' },
        { status: 404 }
      );
    }

    const movie = movies[0];

    return NextResponse.json({
      hlsUrl:
        movie.webm?.max ||
        movie.webm?.['480'] ||
        movie.mp4?.max ||
        movie.mp4?.['480'],
      thumbnailUrl: movie.thumbnail,
      title: movie.name,
    });
  } catch (error) {
    console.error('Error fetching Steam video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
