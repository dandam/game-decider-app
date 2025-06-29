import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const backendUrl = `http://backend:8000/api/v1/games/curated/count`;
    const response = await fetch(backendUrl);
    const data = await response.json();

    // If backend returned an error, pass it through
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching curated games count:', error);
    return NextResponse.json({ error: 'Failed to fetch curated games count from backend' }, { status: 500 });
  }
} 