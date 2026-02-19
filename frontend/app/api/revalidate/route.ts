import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tag = searchParams.get('tag');

  if (!tag) {
    return NextResponse.json({ error: 'Tag is required' }, { status: 400 });
  }

  try {
    revalidateTag(tag, { expire: 86400 });
    return NextResponse.json({ revalidated: true, tag });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json({ error: 'Failed to revalidate', tag }, { status: 500 });
  }
}
