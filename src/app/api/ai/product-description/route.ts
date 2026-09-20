import { NextResponse } from 'next/server';
import { generateAIProductCopy, processAIShoppingAssistant } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { name, category } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Product name required' }, { status: 400 });
    }

    const description = await generateAIProductCopy(name, category || 'Handmade Decor');
    return NextResponse.json({ success: true, description });
  } catch (err) {
    return NextResponse.json({ error: 'AI generation error' }, { status: 500 });
  }
}
