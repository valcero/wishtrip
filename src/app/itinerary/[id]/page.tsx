import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function ItineraryPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const itinerary = await prisma.itinerary.findUnique({
    where: { id },
    include: {
      days: {
        orderBy: { dayNumber: 'asc' },
        include: {
          activities: {
            orderBy: { startTime: 'asc' }
          }
        }
      }
    }
  });

  if (!itinerary) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:underline font-medium text-sm flex items-center gap-1">
            &larr; Plan another trip
          </Link>
          <div className="text-sm text-gray-500">
            Trip to <span className="font-semibold text-gray-900">{itinerary.destination}</span>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 space-y-8">
          {/* Header & AI Summary */}
          <div className="border-b pb-6">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Your Personalized Itinerary</h1>
            {itinerary.personalizedSummary && (
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">Trip Overview</h3>
                <p className="text-gray-700 italic">{itinerary.personalizedSummary}</p>
              </div>
            )}
            
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">{itinerary.partySize} {itinerary.travellerType}</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">{itinerary.pace} Pace</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">{itinerary.budget} Budget</span>
            </div>
          </div>

          {/* Daily Schedule */}
          <div className="space-y-10">
            {itinerary.days.map((day) => (
              <div key={day.id} className="relative">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
                      {day.dayNumber}
                    </span>
                    {day.theme || `Day ${day.dayNumber}`}
                  </h3>
                  {day.description && <p className="text-gray-600 mt-2 pl-10">{day.description}</p>}
                  <p className="text-sm text-gray-400 pl-10 mt-1">
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="pl-10 space-y-4">
                  {day.activities.map((activity) => (
                    <div key={activity.id} className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row gap-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="md:w-32 flex-shrink-0">
                        <p className="text-blue-600 font-bold">{activity.startTime}</p>
                        <p className="text-sm text-gray-500">{activity.durationMinutes} mins</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{activity.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.reason}</p>
                        <div className="flex gap-2 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {activity.category}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {activity.estimatedCost}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {day.activities.length === 0 && (
                    <p className="text-gray-500 italic">No activities planned for this day. Relax and explore!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
