import { NextResponse } from 'next/server';
import { processAIShoppingAssistant } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const response = await processAIShoppingAssistant(prompt);
    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({ error: 'AI Assistant error' }, { status: 500 });
  }
}
