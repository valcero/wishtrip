import { NextResponse } from 'next/server';
import { tripRequestSchema } from '@/lib/schema';
import { generateItinerary } from '@/lib/planner/engine';
import { generateTripNarrative } from '@/lib/ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = tripRequestSchema.parse(body);

    // Generate itinerary using the deterministic planning engine
    const result = await generateItinerary(validatedData);

    // Pass the deterministic result to the AI for a conversational wrapper
    const narrative = await generateTripNarrative(validatedData, result.days);

    // Save to Database
    const savedItinerary = await prisma.itinerary.create({
      data: {
        origin: validatedData.origin,
        destination: validatedData.destination,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        partySize: validatedData.partySize,
        travellerType: validatedData.travellerType,
        pace: validatedData.pace,
        budget: validatedData.budget,
        interests: validatedData.interests,
        personalizedSummary: narrative.personalizedSummary,
        days: {
          create: result.days.map(day => {
            const aiDay = narrative.dayNarratives.find(n => n.dayNumber === day.dayNumber);
            return {
              dayNumber: day.dayNumber,
              date: day.date,
              theme: aiDay?.theme,
              description: aiDay?.description,
              activities: {
                create: day.activities.map(act => ({
                  placeId: act.placeId,
                  name: act.name,
                  startTime: act.startTime,
                  endTime: act.endTime,
                  durationMinutes: act.durationMinutes,
                  reason: act.reason,
                  estimatedCost: act.estimatedCost,
                  category: act.category,
                  imageUrl: act.imageUrl
                }))
              }
            };
          })
        }
      }
    });

    // Return the ID so the frontend can redirect
    return NextResponse.json({
      success: true,
      itineraryId: savedItinerary.id
    });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
