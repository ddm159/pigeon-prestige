# 🕊️ Pigeon Flight Path Simulation Spec

---

## 1. Purpose

Defines the logic for simulating realistic pigeon flight in races, including:
- Group dynamics
- Stat-driven deviations
- Weather effects
- Event handling
- API for map/canvas visualization

This module outputs pigeon positions and states for visualization, calculated on the fly from minimal stored data.

---

## 2. Inputs

- **Race script (per pigeon):**
  - List of timestamped events (see race1.md)
  - Outcome (finish, lost, DNF, dead, returned)
  - Pigeon stats (speed, focus, aggression, navigation, sky IQ, experience, etc.)
- **Race config:**
  - Start location (LatLng)
  - Home bases (Mendonk, Wachtebeke, Sint-Kruis-Winkel)
  - Weather zone (type, severity, area)
  - Race time (start, end, current t)
- **All pigeons’ current states:**
  - For group logic and visualization

---

## 3. Core Concepts

### a. Group Dynamics
- Pigeons form, join, and leave groups based on:
  - Proximity
  - Speed
  - Aggression
  - Focus
  - Random chance
- Groups split as pigeons approach home bases.
- Groups are virtual: recalculated at each time step.

### b. Path Generation
- **Base path:**
  - Curved/wobbly line from start to home (not straight)
  - Wobble amplitude/frequency based on stats (focus, navigation, etc.)
- **Group path:**
  - Shared by group members, with small individual deviations
- **Solo path:**
  - More deviation, especially near home
- **Overshoot/stray:**
  - Stat- and event-driven deviations from the optimal path

### c. Stat & Event Effects
- **Aggression/focus:**
  - Break from group, fly straighter, take risks
- **Navigation/sky IQ:**
  - Chance to stray, overshoot, get lost
- **Experience:**
  - Reduces risk, increases recovery
- **Weather resistance, endurance:**
  - Modifies weather impact
- **Events:**
  - At each event timestamp, update pigeon state (strayed, joined group, lost, etc.)
  - Apply event effects to path, speed, and group status

### d. Weather Effects
- If a pigeon/group is in the weather zone at time t:
  - Modify speed, stray chance, group cohesion
  - Effects are stat-modified (wind resistance, focus, etc.)

---

## 4. Outputs

For each pigeon at time t:
- **Current position:** LatLng
- **Current group:** groupId (if any)
- **Current state:** 'normal', 'strayed', 'lost', 'overshot', etc.
- **(Optional) Path history:** for trail visualization

---

## 5. API Example

```ts
// Types
import { LatLng } from './types/race';

export type PigeonFlightState = {
  position: LatLng;
  groupId?: string;
  state: 'normal' | 'strayed' | 'lost' | 'overshot' | 'dead' | 'returned';
};

export function getPigeonFlightStateAtTime(
  pigeonScript: PigeonRaceScript,
  stats: PigeonStats,
  t: number,
  weatherZone: WeatherZone,
  allPigeons: PigeonFlightState[]
): PigeonFlightState;
```
- **Called by visualization layer** (Leaflet/Canvas) for each visible pigeon at each frame.
- **Only top 100 + user’s pigeons** are simulated in real time for performance.

---

## 6. Test Cases

- Group formation and split
- Straying and correction
- Weather zone effects
- Overshooting and returning
- Lost and recovery
- Death/accident
- Stat-driven path wobble

---

## 7. Extensibility

- Add new event types or stat effects easily
- Support for new weather types or group behaviors
- Modular: can swap out path generation or group logic

---

## 8. Integration

- **Visualization layer** (Leaflet/Canvas) calls `getPigeonFlightStateAtTime` for each visible pigeon at each frame
- **Data layer** provides race scripts, stats, and config
- **Testing:** Unit tests for all core logic (grouping, straying, weather, etc.)
- **Documentation:** JSDoc for all public functions/types

---

## 9. Coding Guidelines Compliance

- All code is TypeScript, strictly typed
- No business logic in UI components
- All logic in services or hooks (e.g., `src/services/flightSimService.ts`)
- All public functions, hooks, and types have JSDoc
- Tests colocated in `__tests__` folders
- Linting, type-checking, and CI required before merge
- Documentation kept up to date

---

## 10. Next Steps

1. Implement types/interfaces in `src/types/flightSim.ts`
2. Implement simulation logic in `src/services/flightSimService.ts`
3. Write unit tests in `src/services/__tests__/flightSimService.test.ts`
4. Integrate with map/canvas visualization
5. Document and iterate 