# Travel Itinerary Planner

## 1. Overview
WishTrip is an intelligent, full-stack travel itinerary planner. It takes user preferences—such as interests, budget, pace, and party size—and deterministically generates a practical, day-by-day itinerary.

## 2. Problem
Planning a trip is often overwhelming. Standard LLM models can generate itineraries but frequently hallucinate non-existent places, ignore geography, schedule overlapping activities, or disregard constraints like opening hours. This project solves this by using a deterministic planning engine backed by a relational database, optionally using AI only for natural-language explanations, guaranteeing factual and physically possible itineraries.

## 3. Features
- **Structured Trip Collection:** Detailed user preferences including pace, interests, and budget.
- **Relational Data Model:** Real-world constraints (opening hours, categories, locations) stored in a structured database.
- **Deterministic Planning (Upcoming):** A robust engine to filter, score, and allocate activities.
- **API-First Design:** A clear JSON API returning structured itineraries.

## 4. Architecture
```mermaid
graph TD
    A[Frontend: Next.js Form] -->|POST /api/itineraries| B[Backend: Next.js Route]
    B --> C[Deterministic Planner Engine]
    C <--> D[(PostgreSQL / SQLite Database)]
    C --> E[Structured Itinerary JSON]
    E --> A
```
- **Frontend**: Responsible for collecting inputs and rendering the final schedule.
- **API**: Validates input and orchestrates the planning.
- **Planner (Step 2)**: Core logic for filtering, scoring, and constraint checking.
- **Database**: Source of truth for all destinations and places.

## 5. Tech Stack
- **Next.js (App Router)** — Provides a unified, type-safe full-stack environment that's easy to deploy and reason about.
- **TypeScript** — Enforces type safety across API boundaries and planner logic.
- **Tailwind CSS** — Allows rapid UI prototyping.
- **Prisma** — Provides a type-safe ORM for relational data queries.
- **PostgreSQL** — Relational database providing strong schema enforcement and native Enums, running locally via Docker.
- **Zod** — End-to-end type validation for both the frontend form and API inputs.

## 6. Data Model
- **Destination**: E.g., Tokyo.
- **Place**: Attractions, restaurants, parks. Includes `category`, `latitude`, `longitude`, `defaultDurationMinutes`, `estimatedCost`.
- **PlaceOpeningHours**: Daily open/close times to validate scheduling constraints.
- **Interest** / **PlaceInterest**: Many-to-many relationship for matching user preferences to places.
- **TravellerType** / **PlaceTravellerType**: Many-to-many for checking suitability (e.g., family vs solo).

## 7. Data Sources
- **Dataset**: A manually curated subset of popular places in Tokyo, Japan.
- **Coordinates & Times**: Approximated and manually entered for the prototype to demonstrate constraint handling. They represent realistic data but are not live or exhaustive.

## Engineering Decisions & Trade-offs

## 8. Planning Algorithm
The core intelligence lives in `src/lib/planner` and operates deterministically in 4 stages:

1. **Filtering (Hard Constraints)**: `candidate-filter.ts` drops any places that strictly violate the request (e.g. incompatible traveler type like 'Family' trying to go to a Solo-only bar, or strict Budget users seeing Premium places).
2. **Scoring (Soft Constraints)**: `scorer.ts` evaluates remaining candidates. It adds points for matching interests (+5 per match), adjusts scores based on Budget (rewarding free things for budget travelers), and considers Pace (Packed pace prefers quick attractions; Easy-going prefers relaxing nature walks).
3. **Daily Allocation**: `scheduler.ts` iterates day-by-day. It determines a maximum activity count based on the user's Pace (Packed = 5, Balanced = 4, Easy = 3). It iteratively attempts to fit the highest-scored candidates into the day.
4. **Time & Constraint Validation**: `constraint-validator.ts` ensures no activities overlap in time, assumes 30 minutes of travel time between activities, and guarantees the place is actually open during the scheduled block on that specific day of the week.

## 9. AI Personalization Layer (Step 3)
Once the deterministic engine generates a bulletproof, 100% physically possible itinerary, the result is sent to an LLM (Google Gemini) via the `@ai-sdk/google` module in `src/lib/ai.ts`.
- The AI **does not** plan the trip. 
- The AI **explains** the trip. It provides a conversational summary and daily themes, acting like a friendly travel agent handing over the final packet.

## 10. Persistence Layer (Step 4)
Because a real travel app must persist itineraries so they can be viewed and shared later, we implemented a full database layer for generated trips.
- We added `Itinerary`, `ItineraryDay`, and `ItineraryActivity` models to Prisma.
- The API saves the completely generated trip into the database using a transaction.
- The frontend redirects users to `/itinerary/[id]` where the trip is retrieved and rendered.

## 11. Why This Hybrid Approach?
Using an LLM prompt to generate an itinerary directly often results in hallucinations, non-existent opening hours, and physically impossible travel schedules. This deterministic engine ensures 100% factual accuracy, reproducible results, and respects strict constraints. The AI layer on top provides the natural-language explanations, combining genuine software engineering reliability with modern AI user experience.

## 14. Engineering Decisions & Trade-offs

### Decision: Modular Deterministic Planner vs LLM
- **Why**: To guarantee factual itineraries without hallucinated places or impossible overlapping times.
- **Alternatives**: Sending user preferences to OpenAI and rendering the response.
- **Trade-off**: Requires a strictly curated, high-quality relational dataset and manual scoring weights, which takes more upfront engineering effort than a simple API call to an LLM.

### Decision: Mocked Travel Times
- **Why**: To keep the prototype focused on the allocation engine without needing a complex Google Maps API integration.
- **Alternatives**: Real-time routing API.
- **Trade-off**: Assumes a fixed 30-minute transit time between all places, which may be inaccurate in a large city like Tokyo.

### Decision: Mocked API Response in Step 1
- **Why**: To establish the API contract and verify end-to-end connectivity before writing complex planning logic.
- **Alternatives**: Building the planner immediately.
- **Trade-off**: The app returned a static response initially. (Replaced in Step 2).

## Running Locally

1. Install dependencies:
```bash
npm install
```
2. Set up environment variables in `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/wishtrip?schema=public"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
```
3. Start the local PostgreSQL database using Docker:
```bash
docker-compose up -d
```
4. Initialize database and run seed script:
```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```
4. Run tests for the planner:
```bash
npm run test
```
*(Note: If `npm run prisma:seed` fails, you can run `npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts`)*

3. Start development server:
```bash
npm run dev
```
