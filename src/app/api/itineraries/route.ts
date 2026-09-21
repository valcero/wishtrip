import { NextResponse } from 'next/server';
import { tripRequestSchema } from '@/lib/schema';
import { generateItinerary } from '@/lib/planner/engine';
import { generateTripNarrative } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = tripRequestSchema.parse(body);

    // Generate itinerary using the deterministic planning engine
    const result = await generateItinerary(validatedData);

    // Pass the deterministic result to the AI for a conversational wrapper
    const narrative = await generateTripNarrative(validatedData, result.days);

    // Return the structured JSON representing the complete itinerary + AI context
    const responsePayload = {
      trip: validatedData,
      days: result.days,
      assumptions: result.assumptions,
      planningMetadata: result.planningMetadata,
      aiNarrative: narrative
    };

    return NextResponse.json(responsePayload);

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
