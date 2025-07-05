import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = searchParams.get('skip') || '0';
    const limit = searchParams.get('limit') || '50';

    const backendUrl = `${process.env.BACKEND_URL || 'http://backend:8000'}/api/v1/games/curated/with-players?skip=${skip}&limit=${limit}`;
    
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch games with players' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching games with players:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 