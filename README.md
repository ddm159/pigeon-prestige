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
