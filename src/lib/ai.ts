import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { TripRequest } from './schema';
import { DayPlan } from './planner/types';

export const aiNarrativeSchema = z.object({
  personalizedSummary: z.string().describe("A conversational, exciting 2-3 sentence overview of the trip explaining why it fits the user's profile and pace."),
  dayNarratives: z.array(z.object({
    dayNumber: z.number(),
    theme: z.string().describe("A catchy title for the day (e.g., 'Historical Delights and Neon Nights')."),
    description: z.string().describe("1-2 sentences summarizing what they will do that day and why they'll love it.")
  }))
});

export type AINarrativeResponse = z.infer<typeof aiNarrativeSchema>;

export async function generateTripNarrative(request: TripRequest, itineraryDays: DayPlan[]): Promise<AINarrativeResponse> {
  // If no API key is provided, gracefully fallback to a mock response so the app doesn't crash
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.warn("GOOGLE_GENERATIVE_AI_API_KEY is not set. Falling back to mock narrative.");
    return {
      personalizedSummary: "We've built an amazing trip for you based on your preferences. Enjoy your time!",
      dayNarratives: itineraryDays.map(day => ({
        dayNumber: day.dayNumber,
        theme: `Day ${day.dayNumber} Adventures`,
        description: "A great day full of hand-picked activities."
      }))
    };
  }

  const prompt = `
You are a world-class, enthusiastic travel agent.
We have just generated a deterministic itinerary for a user based on their preferences.
Please review their request and the planned itinerary, and write a personalized summary and daily narratives.

User Profile:
- Destination: ${request.destination}
- Party Size: ${request.partySize} (${request.travellerType})
- Pace: ${request.pace}
- Budget: ${request.budget}
- Interests: ${request.interests.join(', ')}

Planned Itinerary (JSON):
${JSON.stringify(itineraryDays, null, 2)}
`;

  try {
    const { object } = await generateObject({
      model: google('gemini-2.5-pro'),
      schema: aiNarrativeSchema,
      prompt: prompt,
    });
    return object;
  } catch (error) {
    console.error("AI Generation failed:", error);
    // Fallback on error
    return {
      personalizedSummary: "We've built an amazing trip for you based on your preferences. Enjoy your time!",
      dayNarratives: itineraryDays.map(day => ({
        dayNumber: day.dayNumber,
        theme: `Day ${day.dayNumber} Adventures`,
        description: "A great day full of hand-picked activities."
      }))
    };
  }
}
