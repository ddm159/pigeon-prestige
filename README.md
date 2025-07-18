# Pigeon Prestige

[![Build Status](https://github.com/your-org/your-repo/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/your-repo/actions)

## Overview
Pigeon Prestige is a professional multiplayer pigeon racing game built with Vite, React, TypeScript, and Supabase. The game features detailed pigeon stats, breeding, racing, and a robust admin system for managing game data.

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

---

For more details, see code comments and the `/src/pages/AdminPage.tsx` file.
