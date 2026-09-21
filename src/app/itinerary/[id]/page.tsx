import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import ItineraryClientView from './ItineraryClientView';

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

  return <ItineraryClientView itinerary={itinerary} />;
}
