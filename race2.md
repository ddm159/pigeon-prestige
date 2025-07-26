# 🏁 Pigeon Racing System: Standings, Storage, and UI/UX Next Steps

---

## 1. Data Model and Storage Plan

- **After a race:**  
  - Store only the race outcome for each pigeon (finish time, DNF, lost, injured, etc.).
  - Store any special events (lost, injured, dead, etc.).
  - Update pigeon stats:
    - Gain experience and racing stats (e.g., +0.12 for regional, +0.24 for international).
- **No need to store full position history or per-frame data.**

---

## 2. Extend the Types

- Add types for race outcome, pigeon stat gain, and standings info.
- Example (in `src/types/flightSim.ts`):

```ts
/** Race outcome for a pigeon */
export type PigeonRaceOutcome = 'finished' | 'lost' | 'injured' | 'dead' | 'dnf' | 'returned';

/** Standings info for leaderboard */
export interface PigeonStanding {
  pigeonId: string;
  pigeonName: string;
  ownerName: string;
  velocity: number; // m/min or km/h
  distanceLeft: number; // meters
  speed: number; // current speed (m/min or km/h)
  state: PigeonRaceOutcome;
}
```

---

## 3. Standings Calculation Logic

- **Velocity:**  
  - `velocity = totalDistance / timeElapsed` (for finished pigeons, use finish time; for in-progress, use current time).
- **Distance left:**  
  - `distanceLeft = totalDistance - distanceTravelledSoFar`
- **Speed:**  
  - Use current speed from simulation logic.
- **Leaderboard:**  
  - Sort by velocity (descending).
  - Show pigeon name, owner, velocity, distance left, speed, and state.

---

## 4. UI/UX: Race View vs. Standings View

- **Add a toggle button** to switch between:
  - **Race View:** Map/canvas with animated pigeons.
  - **Standings View:** Table/leaderboard with live standings.
- **In Standings View:**  
  - Show columns: Pigeon Name, Owner, Velocity, Distance Left, Speed, State.
  - Update live as the race progresses.

---

## 5. Stat Gain Logic

- After race completion, update each pigeon’s stats:
  - Experience and racing stats increase by a small amount (e.g., +0.12 for regional, +0.24 for international).
  - Only for pigeons that finished or participated (not dead).

---

## 6. Professional Next Steps

1. **Extend types/interfaces** in `flightSim.ts` for outcomes, standings, and stat gain.
2. **Implement a service function** in `flightSimService.ts`:
   - `calculatePigeonStandings(raceScripts, stats, t, raceConfig): PigeonStanding[]`
   - Calculates live standings for all visible pigeons.
3. **Add a UI component** (e.g., `RaceStandingsTable.tsx`) to display the standings.
4. **Add a toggle button** in the race page to switch between map and standings.
5. **Update pigeon stats after race** in the backend/service layer.
6. **Write unit tests** for standings calculation and stat gain logic.
7. **Document all new types, functions, and UI components with JSDoc and README updates.

---

## 7. Example: Standings Calculation Service (Stub)

```ts
/**
 * Calculates live standings for all pigeons in a race.
 * @param raceScripts - All pigeon race scripts
 * @param stats - All pigeon stats
 * @param t - Current race time
 * @param raceConfig - Race configuration (start, home, distance)
 * @returns Array of PigeonStanding sorted by velocity
 */
export function calculatePigeonStandings(
  raceScripts: PigeonRaceScript[],
  stats: Record<string, PigeonStats>,
  t: number,
  raceConfig: RaceConfig
): PigeonStanding[] {
  // TODO: Implement logic as described above
  return [];
}
```

---

## 8. Example: UI Toggle

```tsx
const [view, setView] = useState<'race' | 'standings'>('race');
<Button onClick={() => setView(view === 'race' ? 'standings' : 'race')}>
  {view === 'race' ? 'Show Standings' : 'Show Race'}
</Button>
{view === 'race' ? <RaceMap ... /> : <RaceStandingsTable ... />}
```

---

## 9. Summary Table

| Task                        | File/Module                        | Status      |
|-----------------------------|------------------------------------|-------------|
| Extend types for outcome    | `src/types/flightSim.ts`           | Next step   |
| Standings calculation logic | `src/services/flightSimService.ts` | Next step   |
| Stat gain logic             | Backend/service                    | Next step   |
| Standings UI                | `src/components/RaceStandingsTable.tsx` | Next step   |
| Toggle button               | Race page                          | Next step   |
| Unit tests                  | `__tests__/`                       | Next step   |
| Documentation               | JSDoc, README                      | Next step   |

---

**Would you like me to start by extending the types and scaffolding the standings calculation service and UI component?**  
Or do you want to focus on a specific part first? 