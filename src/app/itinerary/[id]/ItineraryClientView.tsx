"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Printer } from 'lucide-react';

export default function ItineraryClientView({ itinerary }: { itinerary: any }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between no-print">
          <Link href="/" className="text-blue-600 hover:underline font-medium text-sm flex items-center gap-1">
            &larr; Plan another trip
          </Link>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Trip to <span className="font-semibold text-gray-900">{itinerary.destination}</span>
            </div>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition shadow-sm text-sm"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-white shadow-2xl rounded-3xl overflow-hidden border border-gray-100"
        >
          {/* Header Image & AI Summary */}
          <div className="relative h-64 sm:h-80 bg-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80" 
              alt="Tokyo" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
              <h1 className="text-4xl font-extrabold text-white mb-2">Your Personalized Itinerary</h1>
              <div className="flex flex-wrap gap-3 text-sm text-white/90">
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{itinerary.partySize} {itinerary.travellerType}</span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{itinerary.pace} Pace</span>
                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{itinerary.budget} Budget</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {itinerary.personalizedSummary && (
              <motion.div variants={itemVariants} className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl mb-12 shadow-sm print-break-inside-avoid">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">Trip Overview</h3>
                <p className="text-gray-700 italic text-lg leading-relaxed">{itinerary.personalizedSummary}</p>
              </motion.div>
            )}

            {/* Daily Schedule */}
            <div className="space-y-16">
              {itinerary.days.map((day: any) => (
                <motion.div variants={itemVariants} key={day.id} className="relative print-break-inside-avoid">
                  
                  {/* Timeline line */}
                  <div className="absolute left-4 top-16 bottom-0 w-0.5 bg-gray-200 no-print" />

                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                      <span className="bg-blue-600 shadow-lg text-white w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 relative">
                        {day.dayNumber}
                      </span>
                      {day.theme || `Day ${day.dayNumber}`}
                    </h3>
                    <p className="text-sm text-blue-600 font-semibold pl-14 mt-1 uppercase tracking-wide">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    {day.description && <p className="text-gray-600 mt-2 pl-14 text-lg">{day.description}</p>}
                  </div>

                  <div className="pl-14 space-y-6">
                    {day.activities.map((activity: any) => (
                      <div key={activity.id} className="bg-white rounded-2xl p-0 flex flex-col md:flex-row border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group print-break-inside-avoid">
                        
                        {activity.imageUrl && (
                          <div className="md:w-1/3 h-48 md:h-auto overflow-hidden">
                            <img 
                              src={activity.imageUrl} 
                              alt={activity.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        )}
                        
                        <div className="p-6 flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-blue-600 font-bold text-xl">{activity.startTime}</p>
                              <p className="text-sm text-gray-400 font-medium">{activity.durationMinutes} mins</p>
                            </div>
                            <div className="flex gap-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {activity.category}
                              </span>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                                {activity.estimatedCost}
                              </span>
                            </div>
                          </div>
                          <h4 className="font-extrabold text-gray-900 text-xl mt-2">{activity.name}</h4>
                          <p className="text-gray-600 mt-3 leading-relaxed">{activity.reason}</p>
                        </div>
                      </div>
                    ))}
                    {day.activities.length === 0 && (
                      <p className="text-gray-400 italic">No activities planned for this day. Relax and explore!</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
