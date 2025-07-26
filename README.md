# Pigeon Prestige

[![Build Status](https://github.com/your-org/your-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/your-repo/actions)

## Overview
Pigeon Prestige is a professional multiplayer pigeon racing game built with Vite, React, TypeScript, and Supabase. The game features detailed pigeon stats, breeding, racing, and a robust admin system for managing game data.

## 🏠 Home Base Onboarding Flow

Players must select a permanent home base during onboarding. The flow is:

1. **City Selection:**
   - Players choose from Mendonk, Sint-Kruis-Winkel, or Wachtebeke (sub-municipalities of Gent, or Wachtebeke proper).
2. **Address Autocomplete:**
   - Players type their street and house number in an address field.
   - The field uses Photon (OpenStreetMap-based) for real-time address suggestions, filtered to the selected city/locality.
3. **Map Preview:**
   - A Leaflet map shows a marker at the selected address.
   - The marker updates as the player changes their selection.
4. **Confirmation:**
   - Players click “Set Home Base” to save their address and coordinates.
   - The home base is saved to Supabase and cannot be changed.
5. **Integration:**
   - The homepage and race maps show the player’s home base marker at the exact coordinates.

### Technical Details
- **Photon API** is used for address autocomplete (see `src/services/geocodingService.ts`).
- **Leaflet** is used for map rendering and marker placement.
- **Supabase** stores the home base address and coordinates (see `src/services/homeBaseService.ts`).
- **Tests** cover the full onboarding flow, including validation and error handling.

### User Experience
- The onboarding is mobile-friendly and accessible.
- Error messages are shown if the city or address is missing.
- The home base is immutable after selection.

---

## Homepage Map
- The homepage features a Leaflet map of Western Europe.
- **Features:**
  - All race locations are shown as markers
  - The player’s home base is shown as a special marker
  - Map is interactive and ready for future features (clustering, tooltips, etc.)

## Supabase Schema: home_bases
| column_name | data_type           | nullable | description |
|-------------|---------------------|----------|-------------|
| user_id     | uuid                | NO       | PK, references auth.users(id) |
| city        | text                | NO       | Must be one of allowed cities |
| street      | text                | NO       |             |
| number      | text                | NO       |             |
| lat         | double precision    | NO       |             |
| lng         | double precision    | NO       |             |
| created_at  | timestamptz         | NO       | Default now()|

- **Constraints:**
  - PK: user_id
  - UNIQUE: user_id
  - FK: user_id → auth.users(id) ON DELETE CASCADE
  - CHECK: city in ('Mendonk', 'Sint-Kruis-Winkel', 'Wachtebeke')

## Admin Page

### Access
- Go to `/admin` (must be logged in as an admin; currently, admin check is a placeholder prop for development/testing).

### Features
- **Manage Pigeon Name Lists:**
  - View, add, edit, and remove male, female, and last names used for pigeon generation.
- **Future Extensions:**
  - The admin page is designed to be extended for managing game parameters (race speed, breeding speed, development speed, etc.) as these features are implemented.

### How to Extend
- To add new admin controls (e.g., for game settings), add new sections/components to `AdminPage.tsx`.
- Backend persistence for name lists and settings can be added via a new `adminService.ts` (see code comments for TODOs).
- Replace the `isAdmin` prop with real authentication/authorization logic when ready.

## Testing & Linting
- Run all tests: `npm run test:run`
- Run linter: `npm run lint`
- Run type checks: `npm run type-check`
- All new features must include tests and pass lint/type checks before merging.

## Code Quality
- Modular, type-safe, and maintainable codebase.
- All external services are mocked in tests.
- No hidden stats are ever shown to players.
- Admin features are protected and easy to extend.

## TODOs
- [ ] Connect admin page to backend for persistent name list and settings management.
- [ ] Implement real admin authentication/authorization.
- [ ] Add controls for game parameters as new features are built.

## 🧪 Resetting Your Home Base for Testing

If you need to test the onboarding flow again, you can reset your home base in Supabase:

1. **Find your user ID** (from the Supabase users table or your app session).
2. **Run this SQL in the Supabase SQL editor:**

```sql
DELETE FROM home_bases WHERE user_id = 'your-user-id';
```

- Replace `'your-user-id'` with your actual user ID.
- This will delete your home base, allowing you to go through onboarding again.

---

## Test Mock Linter Override

In `src/services/__tests__/foodService.test.ts`, we disable `@typescript-eslint/no-explicit-any` for test mocks only. This is necessary due to the complexity of mocking Supabase's types for the SDK. All production code remains fully type-safe and linter clean. Do not use `any` in production code. See comments in the test file for details.

---

For more details, see code comments and the `/src/pages/AdminPage.tsx` file.

# Race Replay System

## Overview
The Race Replay System provides a scalable, maintainable, and engaging way to visualize pigeon races, using stat-driven event scripts and efficient data flows. It is designed for performance, extensibility, and a great player experience.

## Architecture
- **Backend:**
  - Stat-driven event generation (`generatePigeonRaceResult` in `src/services/raceService.ts`)
  - Race simulation and results (`simulateRaceWithEvents` in `src/services/raceService.ts`)
  - Data models and types (`src/types/race.ts`, `src/types/pigeon.ts`)
- **Frontend:**
  - Data fetching hook (`useRaceReplayData` in `src/hooks/useRaceReplayData.ts`)
  - Canvas visualization (`RaceCanvas` in `src/components/RaceCanvas.tsx`)
  - Leaderboard (`RaceLeaderboard` in `src/components/RaceLeaderboard.tsx`)
  - Replay controls and integration (`RaceReplayPage` in `src/components/RaceReplayPage.tsx`)
  - Top-level container (`RaceReplayContainer` in `src/pages/RaceReplayContainer.tsx`)

## Features
- Stat-driven, event-based race simulation (few events per pigeon, not 1000s of points)
- Efficient, scalable data model (works for thousands of pigeons)
- Canvas-based, animated race replay with smooth/stepwise toggle
- Live leaderboard and user pigeon highlighting
- Extensible for new stats, events, and features (e.g., food impact, commentary)
- Fully tested and type-safe

## Extensibility
- Add new event types or stat logic in `generatePigeonRaceResult`
- Add new UI features or visualizations in the React components
- Easily integrate food, weather, or AI commentary in the future

## Coding Standards
- All code, tests, and documentation follow [PRO_CODING_GUIDELINES.md](./PRO_CODING_GUIDELINES.md)
  - Strict typing, separation of concerns, accessibility, and test coverage
  - All public functions and components are documented with JSDoc
  - Tests are colocated and comprehensive

## Main Files
- `src/services/raceService.ts`
- `src/types/race.ts`, `src/types/pigeon.ts`
- `src/hooks/useRaceReplayData.ts`
- `src/components/RaceCanvas.tsx`, `src/components/RaceLeaderboard.tsx`, `src/components/RaceReplayPage.tsx`
- `src/pages/RaceReplayContainer.tsx`

## How to Extend
- To add new race events, update the event generation logic and types
- To add new UI features, extend the React components and hooks
- To add new data sources, update the data fetching hook

---

For more details, see the code and [PRO_CODING_GUIDELINES.md](./PRO_CODING_GUIDELINES.md).

## 🏁 Why Simulate Race Progress Client-Side When Outcomes Are Pre-Scripted?

**The race script (generated at race start) stores the outcome and key events for each pigeon.**
- This ensures scalability, fairness, and minimal storage (especially with thousands of pigeons per race).

**However, client-side simulation is still essential for:**

- **Live Standings & Animation:**
  - Players want to see real-time progress, who is leading, and how far their pigeons are.
  - The simulation interpolates each pigeon's position, speed, and state at any moment, based on the script and elapsed time.
- **Dynamic Commentary & Drama:**
  - The UI can generate live commentary and highlight dramatic moments as events are reached in the script.
- **Replay & Consistency:**
  - The same script can be replayed at any time, always producing the same race visualization.
  - All clients see the same race progress, since it's deterministic from the script and current time.
- **Scalability:**
  - The server only stores the script and outcome, not every position update.
  - All "live" experience is generated on the client, using the script as the source of truth.

**In short:**
- The script is the “movie script.”
- The simulation is the “movie player.”
- You need both for a scalable, engaging, and visually rich racing game.

## 🧠 AI Player System

### Overview
- AI users are automatically created to fill empty slots in leagues during season transitions.
- Each AI user is assigned a unique name and email, and is flagged with `player_type: 'ai'`.
- For every new AI user, 10 pigeons are generated with randomized stats, gender, and age.

### League Filling Logic
- At the end of each season, inactive human players are replaced by AI.
- No league exceeds the player cap (20).
- AI users are assigned to leagues and included in all race logic.

### Testing
- Integration tests verify that AI users and pigeons are created and assigned as expected.
- To run the test:
  ```sh
  npx vitest run src/services/__tests__/competitionService.integration.test.ts
  ```
- The test asserts:
  - AI user creation
  - League assignment upserts
  - AI pigeon creation
  - Pigeon retirement for inactive users

### Extending the System
- To adjust the number or quality of AI pigeons, edit the logic in `competitionService.ts` (`fillWithAI`).
- To add smarter AI, implement additional logic for AI race participation and decision-making.

## Development & Testing Tools

### Dev-Only Race Time Slider

When running the app in development mode, the Racing page includes a **race time slider** at the top of the race card. This slider allows you to manually set the current race time (in seconds) for the simulation. As you move the slider, the standings table updates in real time to reflect the state of the race at that moment.

- **Purpose:**
  - Test and demo the race simulation and standings logic at any point in a race.
  - Scrub through the race timeline to see how events and outcomes affect standings.
  - Useful for development, debugging, and QA before real races are live.

- **How to use:**
  1. Start the app in development mode (`npm run dev`).
  2. Go to the Racing page.
  3. Use the slider labeled "Race Time (seconds)" to set the simulated race time.
  4. Observe the standings table update instantly.

- **Note:**
  - The slider is only visible in development mode and does not appear in production builds.
  - The simulation currently uses stub/mock data; integrate real data as it becomes available.

---
