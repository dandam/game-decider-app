import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://backend:8000/api/v1/stats/db');
    const data = await response.json();

    // If backend returned an error, pass it through
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch database stats from backend' },
      { status: 500 }
    );
  }
}
