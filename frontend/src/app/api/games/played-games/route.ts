import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();

    const backendUrl = `http://backend:8000/api/v1/games/played-games${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(backendUrl);
    const data = await response.json();

    // If backend returned an error, pass it through
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching played games:', error);
    return NextResponse.json({ error: 'Failed to fetch played games from backend' }, { status: 500 });
  }
} 