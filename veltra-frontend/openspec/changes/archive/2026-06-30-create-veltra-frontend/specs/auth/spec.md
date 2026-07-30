## ADDED Requirements

### Requirement: User can sign in exclusively via Strava OAuth2
The system SHALL provide a single sign-in method: "Entrar com Strava". No email/password login or registration form SHALL exist.

#### Scenario: Initiate Strava OAuth2 flow
- **WHEN** the user clicks "Entrar com Strava" on the Login page
- **THEN** the browser redirects to the backend's `GET /api/v1/auth/strava/connect` endpoint, which redirects to Strava's OAuth authorization page with scopes `read,activity:read_all`

#### Scenario: Successful Strava callback
- **WHEN** the user authorizes on Strava and is redirected to the backend callback
- **THEN** the backend exchanges the authorization code for tokens, creates/updates the user in PostgreSQL, caches the Strava access token in Redis (`strava:token:{userId}`), creates a session UUID in Redis (`app:session:{uuid}` → `userId` with 7-day TTL), sets an httpOnly cookie named `user_session`, and returns `{ success: true, message: "Autenticado com sucesso!" }`. The frontend then redirects the user to the Dashboard.

### Requirement: Session is managed via httpOnly cookie named `user_session`
The system SHALL NOT store any token in localStorage, sessionStorage, or client-side JavaScript. The backend SHALL manage the session via an httpOnly cookie.

#### Scenario: Cookie attributes
- **WHEN** the backend sets the `user_session` cookie
- **THEN** the cookie SHALL have: `httpOnly: true`, `secure: true` in production (`false` in dev), `sameSite: 'lax'` in dev (`'none'` in production), `maxAge: 604800000` (7 days)

#### Scenario: Page reload stays authenticated
- **WHEN** the user reloads the page
- **THEN** the frontend calls `GET /api/v1/auth/me` — the `user_session` cookie is automatically sent, and the backend returns the current user data. No manual token rehydration is needed.

#### Scenario: Unauthenticated user redirected to login
- **WHEN** `GET /api/v1/auth/me` returns 401
- **THEN** the frontend immediately redirects to `/login`

#### Scenario: Authenticated user visits login
- **WHEN** an authenticated user navigates to `/login`
- **THEN** `GET /api/v1/auth/me` returns user data and the user is redirected to `/dashboard`

### Requirement: User can log out
The system SHALL call the backend to clear the `user_session` httpOnly cookie, which deletes the session from Redis (`app:session:{uuid}`).

#### Scenario: Logout from navigation
- **WHEN** the user clicks "Sair" in the sidebar
- **THEN** the frontend calls `POST /api/v1/auth/logout`, the backend clears the `user_session` cookie and deletes the session from Redis. The frontend redirects to `/login`.

### Requirement: Minimal auth state on the frontend
The frontend SHALL hold only a `user` object (id, name, stravaId) in React context/state, derived from `GET /api/v1/auth/me`. No tokens SHALL be stored client-side.

#### Scenario: Auth context initialization
- **WHEN** the app boots
- **THEN** a `useAuth` hook or AuthProvider calls `GET /api/v1/auth/me` and stores the returned user object in React context. A loading state is shown until the response resolves.

#### Scenario: Auth-driven route protection
- **WHEN** the auth state is `unauthenticated`
- **THEN** all routes under `(authenticated)` layout redirect to `/login`
