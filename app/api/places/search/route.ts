import { NextRequest, NextResponse } from 'next/server';
import { searchPlaces } from '@/lib/places/places-service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || '';

    if (!query.trim()) {
      return NextResponse.json({ data: [] });
    }

    const places = await searchPlaces(query);
    return NextResponse.json({ data: places });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Search failed', code: 'PLACES_ERROR' }, { status: 500 });
  }
}
