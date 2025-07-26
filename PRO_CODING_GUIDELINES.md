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

---

# 🟢 Step-by-Step: Automate Game Time with Supabase Edge Function

## **1. Install Supabase CLI (if you haven’t already)**
```sh
npm install -g supabase
```

---

## **2. Initialize Supabase in Your Project (if you haven’t already)**
```sh
supabase init
```
- This creates a `supabase/` folder in your project.

---

## **3. Create the Edge Function**
```sh
supabase functions new advance-game-time
```
- This creates: `supabase/functions/advance-game-time/index.ts`

---

## **4. Replace the Function Code**

Open `supabase/functions/advance-game-time/index.ts` and **replace all contents** with:

```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Get current state
  const { data: state, error } = await supabase
    .from("game_time_state")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !state) {
    return new Response("Failed to get game time state", { status: 500 });
  }

  // Advance by one day
  const newDate = new Date(state.current_game_date);
  newDate.setDate(newDate.getDate() + 1);

  // Update state
  await supabase
    .from("game_time_state")
    .update({
      current_game_date: newDate.toISOString().split("T")[0],
      last_update_time: new Date().toISOString(),
      next_update_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      update_count: state.update_count + 1,
      updated_at: new Date().toISOString(),
    })
    .eq("id", state.id);

  // Log the update
  await supabase.from("game_time_log").insert({
    game_date: newDate.toISOString().split("T")[0],
    update_time: new Date().toISOString(),
    update_type: "scheduled",
    description: "Automatic game time advancement",
  });

  return new Response("Game time advanced", { status: 200 });
});
```

---

## **5. Deploy the Edge Function**
```sh
supabase functions deploy advance-game-time
```
- This uploads your function to Supabase.
- After deploying, you’ll see a URL like:  
  `https://<project-ref>.functions.supabase.co/advance-game-time`

---

## **6. Get Your Service Role Key**
- Go to your Supabase dashboard → Project Settings → API.
- Copy the `service_role` key (keep it secret!).

---

## **7. Test the Function Manually**

Replace `<project-ref>` and `<SERVICE_ROLE_KEY>` with your values:

```sh
curl -X POST "https://<project-ref>.functions.supabase.co/advance-game-time" \
  -H "Authorization: Bearer <SERVICE_ROLE_KEY>"
```
- You should see: `Game time advanced`
- Check your Supabase tables to confirm the date advanced.

---

## **8. Schedule the Function (Every 6 Hours or Weekly)**

### **A. Go to [cron-job.org](https://cron-job.org/) and create a free account.**
### **B. Create a new CRON job:**
- **URL:** Your function’s URL (from step 5)
- **Method:** POST
- **Headers:**  
  - `Authorization: Bearer <SERVICE_ROLE_KEY>`
- **Schedule:**  
  - Every 6 hours: `0 */6 * * *`
  - Every Sunday at 20:00: `0 20 * * 0`

---

## **9. Done!**

- Your game time will now advance automatically.
- You can check the logs in Supabase to confirm.

---

## **If you get stuck:**
- Copy any error or question here and I’ll walk you through the fix.
- If you want, I can generate a ready-to-paste CRON job config or help with any step.

---

**You’re almost there! Just follow these steps and your game time will be fully automated.** 