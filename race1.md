# 🏁 Pigeon Racing Simulation: Detailed System Design

---

## 1. Data Storage & Race Scripting

- **Minimal Storage:**  
  - For each pigeon in a race, only store:
    - **Race outcome:** (finish time, DNF, lost, accident, etc.)
    - **3–5 stat-driven events:** (e.g., “joined group”, “strayed”, “slowed by wind”, “overshot home”, “miracle finish”, “lost and returned after 2 days”, “death”)
    - **Timestamps for each event** (e.g., at t=2h, t=4h, etc.)
  - **No full position history** is stored; all positions are calculated on the fly from the event script and pigeon stats.

---

## 2. Realistic Flight Simulation

- **Group Flight Dynamics:**
  - **Pigeons prefer to fly in groups** for most of the race.
  - Groups are **dynamic**: pigeons can join/leave based on speed, focus, aggression, and random chance.
  - **Closer to home base:** groups split up, and pigeons fly more individually.
  - **Group composition:** random mix of players’ pigeons, not by owner.

- **Stat-Driven Behavior:**
  - **Aggression & Laser Focus:**  
    - High aggression/focus pigeons may break from the group earlier, take risks, or fly straighter.
  - **Navigation & Sky IQ:**  
    - Poor navigation/sky IQ = higher chance to drift astray, overshoot, or get lost.
    - Good navigation = more direct, less likely to get lost.
  - **Experience:**  
    - Reduces risk of accidents, getting lost, or dying.
    - Increases chance to recover if lost.
  - **Wind Resistance, Endurance, etc.:**  
    - Affects how much weather slows/speeds them up.

- **Flight Path:**
  - **Not a straight line:**  
    - Paths are “wobbly” (curved, with random deviations).
    - Groups and individuals can drift, overshoot, or correct course.
    - Some pigeons may fly past their home base, then turn back (stat-driven).
  - **Drifting & Correction:**  
    - Pigeons/groups can drift off course (bad weather, low stats), then correct after a delay.
    - Correction is stat-driven (navigation, sky IQ, experience).

- **Accidents & Drama:**
  - **Events:**  
    - “Lost”, “accident”, “miracle finish”, “returns after 2 days”, “death”.
    - All are stat-driven and timestamped in the event script.
    - Used for commentary and visualization.

---

## 3. Weather Effects

- **Weather Zone:**
  - Only one per race, matches homepage (e.g., “windy 30%”).
  - Placed between race start and home base triangle.
  - **Area-of-effect:**  
    - Any pigeon or group passing through is affected (speed up, slow down, stray, etc.).
    - Effect is stat-modified (wind resistance, focus, etc.).
  - **Visualization:**  
    - Shown as a polygon/circle with icon and severity.

---

## 4. On-the-Fly Position Calculation

- **How it works:**
  - At any time t, a pigeon’s position is calculated by:
    1. **Base path:** From start to home, with group/individual deviations.
    2. **Apply events:**  
       - If “joined group”, follow group path.
       - If “strayed”, deviate from group/route.
       - If “overshot”, continue past home, then correct.
       - If “lost”, stop or wander.
       - If “returns”, resume after delay.
    3. **Apply weather effects:**  
       - If in weather zone at t, modify speed/stray chance.
    4. **Apply stat modifiers:**  
       - All deviations, corrections, and risks are stat-driven.

- **Group logic:**  
  - Groups are virtual: at each t, check which pigeons are close enough (speed, direction, events).
  - If in a group, pigeons’ paths are more similar; if solo, more deviation.

---

## 5. Visualization & UX

- **Map/Canvas:**
  - Shows race start, home bases, weather zone.
  - Animates only top 100 + user’s pigeons for performance.
  - Pigeons fly in groups, split near home, with wobbly/realistic paths.
  - Events (stray, overshoot, lost, etc.) are visualized (e.g., icons, color changes, commentary popups).

- **Legend & Feedback:**
  - Home bases, weather, and group/solo status are clearly indicated.
  - User’s home base and pigeons are highlighted.

---

## 6. Performance & Scalability

- **Efficient storage:**  
  - Only events and outcome per pigeon.
  - All positions and groupings are calculated on the fly, not stored.
- **Efficient rendering:**  
  - Only a subset of pigeons are animated at once.
  - Group logic and weather effects are calculated in-memory for visible pigeons.

---

## 7. Example Data Model

```ts
type PigeonRaceEvent =
  | { type: 'joined_group'; t: number; groupId: string }
  | { type: 'left_group'; t: number }
  | { type: 'strayed'; t: number; duration: number }
  | { type: 'overshot'; t: number; distance: number }
  | { type: 'lost'; t: number }
  | { type: 'returned'; t: number }
  | { type: 'accident'; t: number }
  | { type: 'miracle_finish'; t: number }
  | { type: 'death'; t: number };

type PigeonRaceScript = {
  pigeonId: string;
  events: PigeonRaceEvent[];
  outcome: 'finished' | 'lost' | 'dnf' | 'dead' | 'returned';
  finishTime?: number;
};
```

---

## 8. Example Position Calculation (Pseudo-code)

```ts
function getPigeonPositionAtTime(pigeonScript, stats, t, weatherZone, groupData) {
  // 1. Determine if in group or solo at t
  // 2. Calculate base path (start to home, with wobble)
  // 3. Apply group path if in group, else solo path
  // 4. Apply event deviations (stray, overshot, lost, etc.)
  // 5. If in weather zone, apply speed/stray modifiers
  // 6. If near home, increase chance to split from group
  // 7. Return current position
}
```

---

## 9. Summary Table

| Feature                | Implementation Approach                                 |
|------------------------|--------------------------------------------------------|
| Storage                | Only events + outcome per pigeon                       |
| Group flight           | Dynamic, stat-driven, virtual groups                   |
| Weather                | Single zone, area-of-effect, stat-modified             |
| Path realism           | Wobbly, group/solo, overshoot, stray, correction       |
| Events                 | Stat-driven, timestamped, used for drama/commentary    |
| Performance            | On-the-fly calculation, only top 100 + user animated   |
| Visualization          | Map/canvas, home bases, weather, groups, events        |

---

**This design ensures:**
- Realistic, dramatic, and stat-driven races.
- Minimal storage and maximum scalability.
- Visual and gameplay fidelity to real pigeon racing. 