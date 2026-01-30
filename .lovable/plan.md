

# Magic Link Callback Handler

## Overview
Create a new page to handle magic link authentication callbacks. When users click the magic link in their email, they'll be directed to `/auth/magic-link?token=...&email=...`. This page will verify the token with the API, store the access token, and redirect to the main app.

---

## 1. Create MagicLinkCallback Page

**File:** `src/pages/MagicLinkCallback.tsx`

This page will:
- Extract `token` and `email` from URL query parameters
- Display a loading spinner while verifying
- Call the confirm API endpoint
- Handle success and error states

**UI States:**
```text
+------------------------------------------+
|                                          |
|              [Spinner]                   |
|         Verifying your login...          |
|                                          |
+------------------------------------------+

On Error:
+------------------------------------------+
|                                          |
|           [Error Icon]                   |
|     Link expired or invalid              |
|         [Back to Login]                  |
|                                          |
+------------------------------------------+
```

**API Call:**
```typescript
const response = await fetch('https://internal-api.autoreply.ing/v1.0/signin/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, token }),
});
```

---

## 2. Update AuthContext

**File:** `src/context/AuthContext.tsx`

Enhance the context to:
- Store the access token in localStorage
- Store user data (id, name, email, team_member_status)
- Update the login function signature to accept the full API response

**New Interface:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  team_member_status: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  accessToken: string | null;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}
```

**Storage Keys:**
- `accessToken` - JWT token for API calls
- `user` - JSON stringified user object
- `isAuthenticated` - boolean flag

---

## 3. Add Route

**File:** `src/App.tsx`

Add the new route for the magic link callback:
```typescript
<Route path="/auth/magic-link" element={<MagicLinkCallback />} />
```

---

## Flow Diagram

```text
User clicks magic link in email
           |
           v
+---------------------------+
| /auth/magic-link?         |
| token=xxx&email=yyy       |
+---------------------------+
           |
           v
+---------------------------+
| Extract params from URL   |
| Show loading spinner      |
+---------------------------+
           |
           v
+---------------------------+
| POST /v1.0/signin/confirm |
| { email, token }          |
+---------------------------+
           |
     +-----+-----+
     |           |
  Success      Error
     |           |
     v           v
+----------+  +------------------+
| Store:   |  | Show error msg   |
| - token  |  | "Link expired"   |
| - user   |  | [Back to Login]  |
+----------+  +------------------+
     |
     v
+---------------------------+
| Update AuthContext        |
| Redirect to /             |
+---------------------------+
```

---

## Files to Create
1. `src/pages/MagicLinkCallback.tsx` - Callback handler page

## Files to Modify
1. `src/context/AuthContext.tsx` - Enhanced to store token and user data
2. `src/App.tsx` - Add route for `/auth/magic-link`

