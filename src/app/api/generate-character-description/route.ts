import { NextResponse } from 'next/server';
import { generateCharacterDescription } from '@/ai/flows/generate-character-description';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await generateCharacterDescription(body);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'AI generation failed.' }, { status: 500 });
  }
}
