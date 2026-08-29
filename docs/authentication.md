# Authentication

TaskFlow uses **stateless JWT (JSON Web Token) authentication** with
**bcrypt** password hashing. There is no session store on the server —
the token itself carries everything needed to identify the user.

## 1. Registration (`POST /api/auth/register`)

1. The client sends `{ email, password, full_name? }`.
2. The backend checks whether a user with that email already exists
   (`auth_service.get_user_by_email`). If so, it returns `400 Bad Request`.
3. The password is hashed using **bcrypt** via `passlib`
   (`core/security.py::hash_password`). The plaintext password is
   **never stored** — only the resulting hash is saved to the `users` table.
4. A new `User` row is inserted.
5. A JWT access token is generated and returned to the client, along with
   the public user profile (id, email, full_name, created_at — never the
   password hash).

## 2. Login (`POST /api/auth/login`)

1. The client sends `{ email, password }`.
2. The backend looks up the user by email.
3. `verify_password()` compares the submitted plaintext password against
   the stored bcrypt hash. Bcrypt hashing is intentionally slow and
   salted, which makes brute-forcing and rainbow-table attacks impractical.
4. If the password matches, a new JWT is issued. If not, the backend
   returns `401 Unauthorized` with a generic "Incorrect email or
   password" message — it deliberately does **not** reveal whether the
   email exists, to avoid leaking account information.

## 3. The JWT itself

Tokens are created in `core/security.py::create_access_token()`:

- **Payload (`sub` claim):** the user's numeric ID.
- **Expiration (`exp` claim):** now + `ACCESS_TOKEN_EXPIRE_MINUTES`
  (default 60 minutes), configurable via environment variable.
- **Signature:** HMAC-SHA256 (`HS256`), signed with `SECRET_KEY` from
  the environment. Anyone who doesn't know `SECRET_KEY` cannot forge a
  valid token or tamper with an existing one without invalidating its
  signature.

The frontend stores the returned token in `localStorage` under the key
`taskflow_token` (see `frontend/src/hooks/AuthContext.tsx`).

## 4. Authenticated requests

Every subsequent request to a protected endpoint includes:

```
Authorization: Bearer <token>
```

This is attached automatically by an Axios request interceptor
(`frontend/src/services/apiClient.ts`) — individual components never
need to think about attaching the token manually.

On the backend, protected routes declare a dependency on
`get_current_user` (`app/core/deps.py`):

1. FastAPI extracts the bearer token from the `Authorization` header.
2. `decode_access_token()` verifies the signature and expiration.
3. If valid, the `sub` claim (user ID) is used to load the `User` row
   from the database.
4. If the token is missing, invalid, expired, or the user no longer
   exists, the request is rejected with `401 Unauthorized`.

## 5. Per-user data isolation

Every task query in `app/services/task_service.py` filters explicitly by
`user_id`. There is no endpoint that returns tasks without scoping to
`current_user.id`, and looking up another user's task by ID returns
`404 Not Found` rather than `403 Forbidden` — this avoids confirming to
an attacker that a task with that ID exists at all.

## 6. Logout

JWTs are stateless, so there is no server-side "session" to destroy.
"Logging out" simply means the frontend discards the token
(`frontend/src/services/authService.ts::clearSession()`), after which
the browser can no longer make authenticated requests. If you later want
server-side token revocation (e.g. for "log out everywhere" features),
you would need to introduce a token blocklist or move to shorter-lived
tokens with refresh tokens — that's a good candidate for a future
enhancement, not implemented here to keep things simple.

## 7. Secrets

`SECRET_KEY` must be a long, random string in any real deployment.
Generate one with:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Never commit a real `SECRET_KEY` to version control — always supply it
via environment variables (see `.env.example`).
