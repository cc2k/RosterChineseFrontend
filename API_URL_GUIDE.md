# API URL Configuration Guide

## Issue Resolution: Consistent API URL Usage

This document explains the API URL configuration for the Roster Chinese Frontend application.

## Problem
The application had inconsistent API URL patterns:
- Some components used full URLs: `http://localhost:4000/api/...`
- Others used relative URLs: `/api/...`

## Solution
All API calls now use **relative URLs** (`/api/...`) consistently across the application.

## How it Works
The application uses a proxy configuration in `package.json`:
```json
{
  "proxy": "http://localhost:4000"
}
```

This proxy automatically forwards all requests starting with `/api/` to `http://localhost:4000/api/` during development.

## Benefits of Using Relative URLs
1. **Environment Portability**: Code works across different environments (dev, staging, production) without changes
2. **Cleaner Code**: Shorter, more readable URLs
3. **Better Maintainability**: Single point of configuration for backend URL
4. **Consistency**: All API calls follow the same pattern

## Files Updated
- `roster-app/src/pages/RosterPage.js`: Updated 12 fetch calls
- `roster-app/src/pages/LoginPage.js`: Updated 1 fetch call
- `roster-app/src/pages/ProfilePage.js`: Already used correct pattern

## Usage Examples

### ✅ Correct (Relative URLs)
```javascript
// Login
fetch('/api/login', { method: 'POST', ... })

// Get users
fetch('/api/users')

// Create shift assignment
fetch('/api/shift_assignments', { method: 'POST', ... })
```

### ❌ Incorrect (Full URLs - removed)
```javascript
// Don't use these anymore
fetch('http://localhost:4000/api/login', ...)
fetch('http://localhost:4000/api/users')
```

## For Production Deployment
When deploying to production, ensure your web server or hosting platform is configured to proxy `/api/*` requests to your backend server.

## Answer to Original Question
**"What link I need to use to commit?"**

Use relative URLs starting with `/api/` for all backend API calls:
- `/api/login`
- `/api/users`
- `/api/shift_assignments`
- `/api/user_unavailability`
- `/api/roles`
- `/api/free_shifts`
- `/api/change_password`

The proxy configuration in `package.json` handles forwarding these to the backend server automatically.