import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse('google-site-verification: google632c6eea1d4fe668.html', {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
