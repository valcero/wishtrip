import { PrismaClient, PlaceCategory, CostLevel } from '@prisma/client'

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
      category: PlaceCategory.ATTRACTION,
      latitude: 35.7147,
      longitude: 139.7967,
      defaultDurationMinutes: 120,
      estimatedCost: CostLevel.FREE,
      interests: ['Culture', 'History'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '06:00', close: '17:00' },
    },
    {
      name: 'Meiji Jingu',
      description: 'Shinto shrine surrounded by a large forest in Shibuya.',
      category: PlaceCategory.NATURE,
      latitude: 35.6764,
      longitude: 139.6993,
      defaultDurationMinutes: 90,
      estimatedCost: CostLevel.FREE,
      interests: ['Culture', 'History', 'Nature'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '05:00', close: '18:00' },
    },
    {
      name: 'Tokyo Skytree',
      imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000',
      description: 'Iconic broadcasting and observation tower.',
      category: PlaceCategory.ATTRACTION,
      latitude: 35.7100,
      longitude: 139.8107,
      defaultDurationMinutes: 120,
      estimatedCost: CostLevel.MID_RANGE,
      interests: ['Culture', 'Adventure'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends'],
      openingHours: { open: '10:00', close: '21:00' },
    },
    {
      name: 'Shinjuku Gyoen National Garden',
      imageUrl: 'https://images.unsplash.com/photo-1493780474015-ba834fd0ce2f?auto=format&fit=crop&q=80&w=1000',
      description: 'Spacious park with diverse gardens.',
      category: PlaceCategory.NATURE,
      latitude: 35.6852,
      longitude: 139.7100,
      defaultDurationMinutes: 120,
      estimatedCost: CostLevel.BUDGET,
      interests: ['Nature', 'Wellness'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '09:00', close: '16:00' },
    },
    {
      name: 'Sukiyabashi Jiro',
      imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=1000',
      description: 'World-famous sushi restaurant.',
      category: PlaceCategory.RESTAURANT,
      latitude: 35.6726,
      longitude: 139.7641,
      defaultDurationMinutes: 90,
      estimatedCost: CostLevel.PREMIUM,
      interests: ['Food', 'Culture'],
      travellerTypes: ['Solo', 'Couple', 'Friends'],
      openingHours: { open: '17:00', close: '22:00' }, // Simplified
    },
    {
      name: 'Ichiran Shibuya',
      imageUrl: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&q=80&w=1000',
      description: 'Famous tonkotsu ramen focused on solo dining.',
      category: PlaceCategory.RESTAURANT,
      latitude: 35.6617,
      longitude: 139.7005,
      defaultDurationMinutes: 45,
      estimatedCost: CostLevel.BUDGET,
      interests: ['Food'],
      travellerTypes: ['Solo', 'Friends'],
      openingHours: { open: '00:00', close: '23:59' }, // 24 hours
    },
    {
      name: 'Akihabara Electric Town',
      imageUrl: 'https://images.unsplash.com/photo-1541359927273-d8c178ac9ad9?auto=format&fit=crop&q=80&w=1000',
      description: 'Hub for anime, manga, and electronics.',
      category: PlaceCategory.SHOPPING,
      latitude: 35.6983,
      longitude: 139.7731,
      defaultDurationMinutes: 180,
      estimatedCost: CostLevel.MID_RANGE,
      interests: ['Shopping', 'Culture'],
      travellerTypes: ['Solo', 'Friends'],
      openingHours: { open: '10:00', close: '20:00' },
    },
    {
      name: 'Shibuya Crossing',
      imageUrl: 'https://images.unsplash.com/photo-1542051812871-75f1067584cd?auto=format&fit=crop&q=80&w=1000',
      description: 'The famous scramble crossing.',
      category: PlaceCategory.ATTRACTION,
      latitude: 35.6595,
      longitude: 139.7004,
      defaultDurationMinutes: 30,
      estimatedCost: CostLevel.FREE,
      interests: ['Culture', 'Adventure'],
      travellerTypes: ['Solo', 'Couple', 'Friends', 'Family'],
      openingHours: { open: '00:00', close: '23:59' },
    },
    {
      name: 'Ueno Park',
      description: 'Large public park with museums and zoo.',
      category: PlaceCategory.NATURE,
      latitude: 35.7141,
      longitude: 139.7741,
      defaultDurationMinutes: 180,
      estimatedCost: CostLevel.FREE,
      interests: ['Nature', 'Culture', 'History'],
      travellerTypes: ['Solo', 'Couple', 'Family', 'Friends', 'Seniors'],
      openingHours: { open: '05:00', close: '23:00' },
    },
    {
      name: 'Golden Gai',
      imageUrl: 'https://images.unsplash.com/photo-1517457222165-27a9c7161b20?auto=format&fit=crop&q=80&w=1000',
      description: 'Small atmospheric bars in narrow alleys.',
      category: PlaceCategory.NIGHTLIFE,
      latitude: 35.6938,
      longitude: 139.7034,
      defaultDurationMinutes: 180,
      estimatedCost: CostLevel.MID_RANGE,
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
        imageUrl: placeData.imageUrl,
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
