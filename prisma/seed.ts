import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Tokyo dataset...')

  // 1. Interests
  const interestsData = ['Food', 'Culture', 'Nature', 'Beaches', 'Wellness', 'Adventure', 'Shopping', 'History', 'Nightlife']
  const interests = {} as Record<string, string>
  for (const name of interestsData) {
    const interest = await prisma.interest.create({
      data: { name },
    })
    interests[name] = interest.id
  }

  // 2. Traveller Types
  const travellerTypesData = ['Solo', 'Couple', 'Family', 'Friends', 'Seniors']
  const travellerTypes = {} as Record<string, string>
  for (const name of travellerTypesData) {
    const tt = await prisma.travellerType.create({
      data: { name },
    })
    travellerTypes[name] = tt.id
  }

  // 3. Destination
  const tokyo = await prisma.destination.create({
    data: {
      name: 'Tokyo',
      country: 'Japan',
      timezone: 'Asia/Tokyo',
    },
  })

  // 4. Places
  const places = [
    {
      name: 'Senso-ji Temple',
      description: 'Tokyo\'s oldest temple, located in Asakusa.',
      category: 'ATTRACTION',
      latitude: 35.7147,
      longitude: 139.7967,
      defaultDurationMinutes: 120,
      estimatedCost: 0,
      interests: ['Culture', 'History'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '06:00', close: '17:00' },
    },
    {
      name: 'Meiji Jingu',
      description: 'Shinto shrine surrounded by a large forest in Shibuya.',
      category: 'NATURE',
      latitude: 35.6764,
      longitude: 139.6993,
      defaultDurationMinutes: 90,
      estimatedCost: 0,
      interests: ['Culture', 'History', 'Nature'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '05:00', close: '18:00' },
    },
    {
      name: 'Tokyo Skytree',
      description: 'Iconic broadcasting and observation tower.',
      category: 'ATTRACTION',
      latitude: 35.7100,
      longitude: 139.8107,
      defaultDurationMinutes: 120,
      estimatedCost: 2,
      interests: ['Culture', 'Adventure'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends'],
      openingHours: { open: '10:00', close: '21:00' },
    },
    {
      name: 'Shinjuku Gyoen National Garden',
      description: 'Spacious park with diverse gardens.',
      category: 'NATURE',
      latitude: 35.6852,
      longitude: 139.7100,
      defaultDurationMinutes: 120,
      estimatedCost: 1,
      interests: ['Nature', 'Wellness'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '09:00', close: '16:00' },
    },
    {
      name: 'Sukiyabashi Jiro',
      description: 'World-famous sushi restaurant.',
      category: 'RESTAURANT',
      latitude: 35.6726,
      longitude: 139.7641,
      defaultDurationMinutes: 90,
      estimatedCost: 3,
      interests: ['Food', 'Culture'],
      travellerTypes: ['Solo', 'Couple', 'Friends'],
      openingHours: { open: '17:00', close: '22:00' }, // Simplified
    },
    {
      name: 'Ichiran Shibuya',
      description: 'Famous tonkotsu ramen focused on solo dining.',
      category: 'RESTAURANT',
      latitude: 35.6617,
      longitude: 139.7005,
      defaultDurationMinutes: 45,
      estimatedCost: 1,
      interests: ['Food'],
      travellerTypes: ['Solo', 'Friends'],
      openingHours: { open: '00:00', close: '23:59' }, // 24 hours
    },
    {
      name: 'Akihabara Electric Town',
      description: 'Hub for anime, manga, and electronics.',
      category: 'SHOPPING',
      latitude: 35.6983,
      longitude: 139.7731,
      defaultDurationMinutes: 180,
      estimatedCost: 2,
      interests: ['Shopping', 'Culture'],
      travellerTypes: ['Solo', 'Friends'],
      openingHours: { open: '10:00', close: '20:00' },
    },
    {
      name: 'Shibuya Crossing',
      description: 'The famous scramble crossing.',
      category: 'ATTRACTION',
      latitude: 35.6595,
      longitude: 139.7004,
      defaultDurationMinutes: 30,
      estimatedCost: 0,
      interests: ['Culture', 'Adventure'],
      travellerTypes: ['Solo', 'Couple', 'Friends', 'Family'],
      openingHours: { open: '00:00', close: '23:59' },
    },
    {
      name: 'Ueno Park',
      description: 'Large public park with museums and zoo.',
      category: 'NATURE',
      latitude: 35.7141,
      longitude: 139.7741,
      defaultDurationMinutes: 180,
      estimatedCost: 0,
      interests: ['Nature', 'Culture', 'History'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '05:00', close: '23:00' },
    },
    {
      name: 'Golden Gai',
      description: 'Small atmospheric bars in narrow alleys.',
      category: 'NIGHTLIFE',
      latitude: 35.6938,
      longitude: 139.7034,
      defaultDurationMinutes: 180,
      estimatedCost: 2,
      interests: ['Nightlife', 'Culture'],
      travellerTypes: ['Solo', 'Friends', 'Couple'],
      openingHours: { open: '18:00', close: '23:59' },
    },
  ]

  for (const placeData of places) {
    const place = await prisma.place.create({
      data: {
        destinationId: tokyo.id,
        name: placeData.name,
        description: placeData.description,
        category: placeData.category,
        latitude: placeData.latitude,
        longitude: placeData.longitude,
        defaultDurationMinutes: placeData.defaultDurationMinutes,
        estimatedCost: placeData.estimatedCost,
      },
    })

    // Interests
    for (const interestName of placeData.interests) {
      await prisma.placeInterest.create({
        data: {
          placeId: place.id,
          interestId: interests[interestName],
        },
      })
    }

    // Traveller Types
    for (const ttName of placeData.travellerTypes) {
      await prisma.placeTravellerType.create({
        data: {
          placeId: place.id,
          travellerTypeId: travellerTypes[ttName],
        },
      })
    }

    // Opening Hours (Apply to all days 0-6 for simplicity)
    for (let day = 0; day <= 6; day++) {
      await prisma.placeOpeningHours.create({
        data: {
          placeId: place.id,
          dayOfWeek: day,
          openTime: placeData.openingHours.open,
          closeTime: placeData.openingHours.close,
        },
      })
    }
  }

  console.log('Seed completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
