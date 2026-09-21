"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { tripRequestSchema, TripRequest } from "@/lib/schema";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TripRequest>({
    resolver: zodResolver(tripRequestSchema),
    defaultValues: {
      origin: "",
      destination: "Tokyo",
      startDate: "",
      endDate: "",
      travellerType: "Solo",
      partySize: 1,
      interests: [],
      pace: "Balanced",
      budget: "Mid-range",
    },
  });

  const onSubmit = async (data: TripRequest) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/itineraries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate itinerary.");
      }

      const responseData = await response.json();
      
      if (responseData.success && responseData.itineraryId) {
        router.push(`/itinerary/${responseData.itineraryId}`);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-600 tracking-tight">WishTrip Planner</h1>
          <p className="text-gray-500 mt-2 text-lg">Intelligent itinerary generation for your next adventure.</p>
        </header>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Origin */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Origin City</label>
                <input
                  {...register("origin")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  placeholder="e.g. New York"
                />
                {errors.origin && <p className="text-red-500 text-xs mt-1">{errors.origin.message}</p>}
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <input
                  {...register("destination")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-gray-100"
                  readOnly
                />
                <p className="text-gray-400 text-xs mt-1">Currently limited to Tokyo for prototype.</p>
                {errors.destination && <p className="text-red-500 text-xs mt-1">{errors.destination.message}</p>}
              </div>

              {/* Dates */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  {...register("startDate")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  {...register("endDate")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                />
              </div>

              {/* Traveller Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Traveller Type</label>
                <select
                  {...register("travellerType")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="Solo">Solo</option>
                  <option value="Couple">Couple</option>
                  <option value="Family">Family</option>
                  <option value="Friends">Friends</option>
                  <option value="Seniors">Seniors</option>
                </select>
              </div>

              {/* Party Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Party Size</label>
                <input
                  type="number"
                  {...register("partySize", { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                  min="1"
                  max="20"
                />
                {errors.partySize && <p className="text-red-500 text-xs mt-1">{errors.partySize.message}</p>}
              </div>

              {/* Interests */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests (Select multiple)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['Food', 'Culture', 'Nature', 'Beaches', 'Wellness', 'Adventure', 'Shopping', 'History', 'Nightlife'].map(interest => (
                    <label key={interest} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        value={interest}
                        {...register("interests")}
                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
                {errors.interests && <p className="text-red-500 text-xs mt-1">{errors.interests.message}</p>}
              </div>

              {/* Pace & Budget */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Pace</label>
                <select
                  {...register("pace")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="Easy-going">Easy-going</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Packed">Packed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Budget</label>
                <select
                  {...register("budget")}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
                >
                  <option value="Budget">Budget</option>
                  <option value="Mid-range">Mid-range</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-right">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {loading ? "Planning..." : "Generate Itinerary"}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

      </div>
    </main>
  );
}
