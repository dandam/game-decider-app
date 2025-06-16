import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://backend:8000/api/v1/games/count');
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch games count from backend' },
      { status: 500 }
    );
  }
}
