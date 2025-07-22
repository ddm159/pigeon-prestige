ch# 🛡️ Professional Coding Guidelines for Cursor Projects

## 1. Project Structure & Separation of Concerns
- **UI and Logic Separation:**
  - UI components are *stateless* or only manage local UI state.
  - All business/data logic lives in custom hooks (`src/hooks/`) or services (`src/services/`), never in UI components.
  - API/database calls are only in services, never in UI or hooks.
- **Feature-based Folders:**
  - Group related files by feature when possible.
  - Shared components/hooks/utilities go in `src/components/`, `src/hooks/`, `src/services/`, `src/utils/`, `src/types/`.

## 2. TypeScript
- **Strict Typing:**
  - All code is TypeScript. No `any` in production code.
  - All function arguments and return values are explicitly typed.
  - Use `interface` for component props, `type` for utility types.
- **Type Inference:**
  - Use Zod or similar for runtime validation and type inference when working with Supabase or external data.

## 3. React
- **Functional Components Only:**
  - Use function components, never classes.
  - Use hooks for state and side effects.
- **Component Structure:**
  - Keep components under 150 lines; split if needed.
  - Order: hooks, variables, functions, return (JSX).
  - Early return for loading/error states.
- **Naming:**
  - `PascalCase` for components, `camelCase` for functions/variables.
  - Use descriptive names (e.g., `isLoading`, `hasError`).

## 4. Supabase
- **Service Layer:**
  - All Supabase logic in `src/services/`.
  - Use Row Level Security (RLS) and policies for data access.
  - Validate all data sent/received with Zod or similar.
- **Environment:**
  - Use `.env` for Supabase keys, never hardcode secrets.

## 5. JSON & Data
- **Schema Validation:**
  - Validate all JSON data (from API, Supabase, etc.) before use.
  - Use Zod or Yup for schema validation.
- **Consistent Structure:**
  - Use camelCase for all JSON keys.

## 6. Testing
- **Test Coverage:**
  - All new features must include tests.
  - Use Jest + React Testing Library for unit/integration tests.
  - Use mocks for Supabase and external APIs, placed in `__mocks__` folders next to tests.
  - No skipped/only tests in main.
- **Test Structure:**
  - Tests colocated in `__tests__` folders next to the code they test.
  - Use `act` for all state updates in tests.

## 7. Linting, Formatting, and CI
- **Linting:**
  - Run `npm run lint` before every commit.
  - Use Prettier or team formatter for consistent style.
- **Type Checking:**
  - Run `npm run type-check` before every commit.
- **CI:**
  - All code must pass lint, type-check, and tests on GitHub CI before merging.
  - No direct commits to main/master; all changes via PR and review.

## 8. Documentation
- **JSDoc:**
  - All public functions, hooks, and components must have JSDoc comments.
- **README & Docs:**
  - Keep README and documentation up to date as features are added or changed.

## 9. Naming & File Organization
- **Directories:**
  - Use lowercase with dashes for directory names (e.g., `food-shop/`).
- **Files:**
  - Use `PascalCase` for component files, `camelCase` for hooks/services.
  - Place mocks in `__mocks__` folders next to their tests.

## 10. Error Handling
- **Early Returns:**
  - Handle errors and edge cases at the start of functions.
  - Use early returns to avoid deep nesting.
- **User Feedback:**
  - Show user-friendly error messages in the UI.

## 11. Performance & Accessibility
- **Performance:**
  - Use memoization (`useMemo`, `useCallback`) for expensive calculations.
  - Lazy load non-critical components.
- **Accessibility:**
  - Use semantic HTML and ARIA roles.
  - Ensure color contrast and keyboard navigation.

## 12. Refactoring & Extensibility
- **Refactor Often:**
  - Refactor code as features grow to maintain clarity and modularity.
- **Extensible Design:**
  - Design services and hooks to be reusable and composable.

## Tooling & Build

- The project uses [Vite](https://vitejs.dev/) for development and build.
- Use `npm run dev` to start the local dev server, `npm run build` for production builds.
- Environment variables must be prefixed with `VITE_` to be exposed to the client (see [Vite Env Docs](https://vitejs.dev/guide/env-and-mode.html)).
- Vite plugins and config changes should be documented in `vite.config.ts` and, if non-obvious, in `VITE_SETUP.md`.
- For static assets, place files in `public/` or import them directly in code.

---

## References & Inspirations
- [React + TypeScript Style Guide](https://react-typescript-style-guide.com/)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Supabase Best Practices](https://supabase.com/docs/guides)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- [Airbnb React/JSX Style Guide](https://airbnb.io/javascript/react/)

---

**These guidelines are to be followed for the entire game project. All code, tests, and documentation must adhere to these standards to ensure maintainability, scalability, and a green state on GitHub.** 