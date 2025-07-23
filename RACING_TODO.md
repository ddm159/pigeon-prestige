# 🏁 Racing System TODO

## 1. Data Storage (Server/Data Layer)
- [ ] Store only essential race data per pigeon:
  - [ ] Race events (3–5 per pigeon, stat-driven)
  - [ ] Start/end times
  - [ ] Optionally, positions every 2 minutes (t=0, t=2, ...), or calculate on the fly
- [ ] Keep data usage low for Supabase free tier

## 2. Canvas Visualization Modes (Client/UI Layer)
- [ ] **Linear Flight (Smooth Mode):**
  - [ ] Animate at 60 FPS
  - [ ] Interpolate pigeon positions between 2-minute updates for smooth movement
- [ ] **2-Minute Update (Stepwise Mode):**
  - [ ] Update pigeon positions only every 2 minutes (stepwise/jumpy)
- [ ] **Player Toggle:**
  - [ ] Add a toggle button to switch between "Smooth Flight" and "2-Minute Update" modes
  - [ ] Tooltip/label explaining the difference

## 3. Implementation Details
- [ ] **Data Model:**
  - [ ] Store/calculate pigeon positions at 2-minute intervals (array of {t, position})
- [ ] **Interpolation Logic:**
  - [ ] For smooth mode, interpolate between last and next 2-min update
  - [ ] For stepwise mode, use last completed 2-min mark
- [ ] **Canvas Component:**
  - [ ] Accepts a prop for mode ("smooth" or "stepwise")
  - [ ] Uses appropriate logic for each frame
- [ ] **UI/UX:**
  - [ ] Toggle button for switching modes
  - [ ] Filter/search for pigeons (top 100 + user’s pigeons always visible)
  - [ ] Leaderboard toggle (standings vs. live race)

## 4. Stat-Driven Event Generation
- [ ] Use all pigeon stats (speed, stamina, navigation, weather resistance, etc.) to generate events:
  - [ ] Low stamina = mid-race slowdown
  - [ ] High sprint = late-race boost
  - [ ] Bad navigation = chance to get lost (DNF)
  - [ ] Weather resistance = less affected by weather events
  - [ ] Grit = chance for dramatic recovery
- [ ] Use real homepage weather to seed race weather patterns
- [ ] Place weather icons/zones on map (wind, rain, heat, etc.)
- [ ] Area-of-effect: pigeons passing through zones are affected based on stats

## 5. Commentary & Drama
- [ ] Use LLM or scripts to generate fun, stat-based commentary lines
- [ ] Show dramatic events (miracle finish, got lost, etc.)

## 6. Performance & Accessibility
- [ ] Only render top 100 + user’s pigeons in Canvas
- [ ] Use memoization for expensive calculations
- [ ] Ensure Canvas and leaderboard are accessible (ARIA, keyboard nav)

## 7. Testing & Documentation
- [ ] Place tests in `__tests__` folders next to code
- [ ] Use Jest + React Testing Library
- [ ] Add JSDoc comments to all public functions/hooks/components
- [ ] Update README with race system overview

## 8. Extensibility
- [ ] Design event model to easily add new event types
- [ ] Add new stats/event rules as needed

---

## Example: Canvas Component API

```tsx
<RaceCanvas
  pigeons={pigeonRaceResults}
  currentTime={animationTime}
  userPigeonIds={userPigeonIds}
  weatherZones={weatherZones}
  mode={flightMode} // "smooth" or "stepwise"
/>
```

---

## Feature Table

| Feature                | Server-Stored | Client-Generated | Notes                                  |
|------------------------|:------------:|:----------------:|----------------------------------------|
| End time/position      |      ✅      |        ❌        | Pre-calculated at race start           |
| 2-min positions        |      ✅/❌    |        ✅        | Store or calculate as needed           |
| Events (per pigeon)    |      ✅      |        ❌        | 3–5 per pigeon, plus shared events     |
| Position at t          |      ❌      |        ✅        | Interpolated or stepwise               |
| Leaderboard at t       |      ❌      |        ✅        | Client-side, every 2 min or smooth     |
| Commentary             |      ❌      |        ✅        | LLM or script, based on events         |
| Animation              |      ❌      |        ✅        | Canvas, only visible pigeons           |
| **Flight mode toggle** |      ❌      |        ✅        | Player can choose smooth or stepwise   |

---

**Follow all [PRO_CODING_GUIDELINES.md](./PRO_CODING_GUIDELINES.md) for structure, typing, testing, and documentation.** 