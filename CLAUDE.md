# CLAUDE.md

Guidance for Claude when working inside `mos-frontend`. Read this before making changes — especially before adding a new page, feature, or API integration.

## 1. Project Overview

- **Name:** `mos-frontend` — the React/Next.js frontend for MOS (Medical Outreach Management System).
- **Purpose:** Web dashboard for managing medical outreach events, bookings, packages, vendors, users, and related entities. Used by super admins, outreach admins, doctors, nurses, pharmacists, and data clerks.
- **Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Redux Toolkit + redux-logger, Formik + Yup, ShadCN UI, Axios + qs, Sonner (toasts).
- **Package manager:** `npm` (see [package.json](package.json)).
- **Sibling repo:** `../mos-backend` — the NestJS REST API this frontend consumes.
- **Push target:** Always push to `develop` — never merge directly to `main`.

---

## 2. Directory Layout

```
/
├── app/
│   ├── (auth)/               # Unauthenticated routes (login, change-password)
│   ├── (dashboard)/          # Authenticated routes (protected by middleware)
│   │   ├── layout.tsx        # Renders DashboardShell
│   │   └── */page.tsx        # Feature pages
│   ├── api/auth/[...nextauth]/   # NextAuth route handler (kept for future use)
│   ├── assets/               # Custom styles, fonts, images
│   ├── components/
│   │   ├── ui/               # ShadCN primitive components (button, input, card …)
│   │   └── layout/           # DashboardShell (sidebar + topbar)
│   ├── core/
│   │   └── store.ts          # Redux configureStore (rootStore) with redux-logger
│   ├── hooks/
│   │   └── redux.ts          # useAppDispatch / useAppSelector typed hooks
│   ├── screens/              # Page-level client components (feature UI logic)
│   ├── source/               # HTTP request layer
│   │   ├── processor.ts      # processRequest() — Axios wrapper with error handling + toasts
│   │   ├── index.tsx         # Re-exports each source as a namespace + processRequest
│   │   └── *Source.tsx       # Feature-specific API functions
│   ├── store/
│   │   ├── index.ts          # Root combineReducers map (add new slices here)
│   │   └── <feature>/
│   │       ├── <feature>.actions.ts   # createAsyncThunk actions
│   │       ├── <feature>.slice.ts     # createSlice (state + reducers)
│   │       ├── <feature>.types.ts     # TypeScript types/interfaces for this slice
│   │       └── index.ts               # Re-exports (default reducer + named actions/types)
│   ├── types/                # Shared TypeScript types and enums
│   ├── globals.css           # Tailwind v4 + ShadCN CSS variables (teal medical theme)
│   ├── layout.tsx            # Root layout — 'use client', Redux Provider, head tags
│   └── page.tsx              # Root page — redirects to /login
├── lib/
│   └── utils.ts              # cn() helper (clsx + tailwind-merge)
├── public/                   # Static assets
├── components.json           # ShadCN configuration
├── middleware.ts             # Route guard — reads accessToken cookie, redirects to /login
├── .env.example              # Environment variable template
├── .env.local                # Local dev env vars (not committed)
└── next.config.ts            # Next.js config
```

---

## 3. Source Layer Pattern (`app/source/`)

The source layer is the **only** place that makes HTTP requests. Never call `axios` directly in components or slices.

### `processor.ts` — request function

`processRequest` is a named async function (not an axios instance). It reads the token from `localStorage`/`sessionStorage`, attaches it as `Authorization: Bearer`, serialises query params with `qs`, and shows a `sonner` toast on error.

```ts
// Usage
import { processRequest } from '@/app/source';

await processRequest({ method: 'GET', url: 'users', params: { page: 1 } });
await processRequest({ method: 'POST', url: 'users', data: payload });
await processRequest({
  method: 'POST',
  url: 'some/endpoint',
  showErrorToaster: false,
}); // suppress toast
```

Options: `method`, `url`, `data`, `params`, `headers`, `showErrorToaster` (default `true`), `customErrorMessage`, `customErrorData`.

### `source/index.tsx` — namespace re-exports

Each source file is re-exported as a **namespace object**, not individual functions:

```ts
// app/source/index.tsx
import * as AuthSource from './AuthSource';
// import * as UsersSource from './UsersSource';
import { processRequest } from './processor';
export { AuthSource, processRequest };
```

**To add a new source:** import it with `import * as XSource from './XSource'` and add it to the exports.

### `*Source.tsx` — per-feature API functions

```ts
// app/source/UsersSource.tsx
import { processRequest } from './processor';

export const fetchUsersRequest = (params?: Record<string, unknown>) =>
  processRequest({ method: 'GET', url: 'users', params });

export const createUserRequest = (data: unknown) =>
  processRequest({ method: 'POST', url: 'users', data });

export const updateUserRequest = (id: string, data: unknown) =>
  processRequest({ method: 'PATCH', url: `users/${id}`, data });

export const deleteUserRequest = (id: string) =>
  processRequest({ method: 'DELETE', url: `users/${id}` });
```

### Consuming in actions

Import the namespace from `@/app/source`, then call its methods:

```ts
import { UsersSource } from '@/app/source';

const result = await UsersSource.fetchUsersRequest(params);
```

---

## 4. Redux Store Pattern (`app/store/<feature>/`)

### `<feature>.types.ts`

Define state shape and any `IXxx` interfaces (DTOs, payloads):

```ts
export interface ICreateUser {
  email: string;
  firstName: string; /* … */
}

export interface UserState {
  list: User[];
  isLoadingUsers: boolean;
  userError: string | null;
}
```

### `<feature>.actions.ts`

```ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { UsersSource } from '@/app/source';
import { ICreateUser } from '.'; // import types from the slice index

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (params: Record<string, unknown> | undefined, { rejectWithValue }) => {
    try {
      return await UsersSource.fetchUsersRequest(params);
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Request failed',
      );
    }
  },
);
```

### `<feature>.slice.ts`

```ts
import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers } from './users.actions';
import { UserState } from './users.types';

const initialState: UserState = {
  list: [],
  isLoadingUsers: false,
  userError: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsersState(state) {
      state.userError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.isLoadingUsers = true;
        state.userError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, { payload }) => {
        state.isLoadingUsers = false;
        state.list = payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoadingUsers = false;
        state.userError = action.error.message ?? null;
      });
  },
});

export const { resetUsersState } = usersSlice.actions;
export default usersSlice.reducer;
```

### `index.ts`

```ts
export * from './users.actions';
export * from './users.types';
export * from './users.slice';
export { default } from './users.slice';
```

### `store/index.ts` — root reducer map

`core/store.ts` imports this file. **Add every new slice reducer here:**

```ts
import { combineReducers } from '@reduxjs/toolkit'; // or just export a plain object
import auth from './auth';
import users from './users'; // ← add here

const storeModules = { auth, users };
export default storeModules;
```

### `core/store.ts` — root Redux store

```ts
import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';
import reducer from '../store';

export const rootStore = configureStore({
  reducer,
  devTools: process.env.NODE_ENV !== 'production',
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(logger),
});

export type RootState = ReturnType<typeof rootStore.getState>;
export type AppDispatch = typeof rootStore.dispatch;
```

### Typed hooks (`app/hooks/redux.ts`)

Always use the typed hooks — never raw `useDispatch`/`useSelector`:

```ts
import { useAppDispatch, useAppSelector } from '@/app/hooks/redux';

const dispatch = useAppDispatch();
const { isLoggingInUser, authError } = useAppSelector((s) => s.auth);
```

---

## 5. Adding a New Feature

- [ ] `app/source/BookingsSource.tsx` — functions calling `processRequest`
- [ ] Add `import * as BookingsSource from './BookingsSource'` + export to `app/source/index.tsx`
- [ ] `app/store/bookings/bookings.types.ts`
- [ ] `app/store/bookings/bookings.actions.ts`
- [ ] `app/store/bookings/bookings.slice.ts`
- [ ] `app/store/bookings/index.ts`
- [ ] Add `bookings` reducer to `app/store/index.ts`
- [ ] `app/screens/BookingsScreen.tsx`
- [ ] `app/(dashboard)/bookings/page.tsx`

---

## 6. Authentication

Auth is **token-based** (no NextAuth session for API calls). The flow:

1. `LoginScreen` dispatches `loginUser` → calls `AuthSource.login` via `processRequest`.
2. `AuthSource.login` stores the token in `localStorage` AND as a cookie (`accessToken`).
3. `processRequest` reads `localStorage.getItem('accessToken')` on every request.
4. `middleware.ts` reads the `accessToken` **cookie** to protect server-side routes.
5. On logout, `AuthSource.logout` clears localStorage, sessionStorage, and the cookie.

`middleware.ts` protects all routes that are not `/login` or `/change-password`. The file must be named `middleware.ts` — Next.js 16 shows a deprecation warning suggesting `proxy.ts` but the edge runtime still resolves `middleware.ts`.

### Auth slice state shape

```ts
{
  isAuthenticated: boolean;
  isLoggingInUser: boolean;
  isRegisteringUser: boolean;
  authError: string | null;
}
```

---

## 7. UI Components — ShadCN

Components live in `app/components/ui/`. Add new ones with:

```bash
npx shadcn@latest add <component-name>
```

Import pattern:

```ts
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
```

### Design principles (medical system)

- Teal primary for key actions and active nav items.
- **Status colours:** `emerald` → active/success, `amber` → planned/pending, `slate` → closed/inactive, `red` → destructive.
- Prefer **tables** over card grids for dense data.
- One focused action per form — keep screens uncluttered.
- High contrast everywhere — accessibility is critical in clinical environments.
- Toasts via `sonner` (already wired in `processRequest`).

---

## 8. Environment Variables

| Variable              | Description                                     |
| --------------------- | ----------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:4000`) |
| `NEXTAUTH_URL`        | App URL — kept for NextAuth route handler       |
| `NEXTAUTH_SECRET`     | NextAuth session secret                         |

Copy `.env.example` to `.env.local` before starting development.

---

## 9. Commands

| Task                 | Command                        |
| -------------------- | ------------------------------ |
| Dev server           | `npm run dev`                  |
| Production build     | `npm run build`                |
| Start production     | `npm run start`                |
| Lint                 | `npm run lint`                 |
| Add ShadCN component | `npx shadcn@latest add <name>` |

Dev server: `http://localhost:3000`.

---

## 10. Conventions & Gotchas

- `app/layout.tsx` is `'use client'` — it mounts the Redux `Provider` directly with `rootStore`.
- Route groups `(auth)` and `(dashboard)` are organizational — they don't appear in the URL.
- Never import `axios` directly — always go through `processRequest`.
- Source namespaces are imported as `{ AuthSource }` from `@/app/source`, then called as `AuthSource.login(payload)`.
- `lib/utils.ts` exports `cn()` — use it for every `className` merge.
- `redux-logger` is active in development — check the browser console to trace dispatched actions.
- Never push directly to `main`; always open a PR against `develop`.

---

copyright 2025 · Contributors: Ngabo Didier
