# MVP Tasks

## 🔴 Critical (Must Have)

### Authentication & Sessions

- [x] Add session management (cookies or JWT)
- [x] Hash passwords with bcrypt before storing
- [x] Implement logout functionality
- [x] Protect/hide dashboard routes (faculty only)
- [x] Get current user from session in API routes

### Authorization

- [x] Middleware to check user role on protected routes
- [x] Only Faculty can create/edit/delete announcements
- [x] Only logged-in users can like/comment
- [x] Show/hide UI elements based on auth state

### Core Features

- [x] Like toggle (prevent duplicate likes per user)
- [x] Unlike functionality
- [x] Delete own comments (users)
- [x] Subscription toggle for notifications

## 🟡 Important (Should Have)

### User Experience

- [x] Loading states for async actions
- [x] Success/error toast notifications
- [x] Redirect after form submissions with feedback
- [x] Empty state improvements

### Developer

- [x] Add endpoint to seed database /dev/db/seed
- [x] Add endpoint to delete all the data in database /dev/db/clean

### Notifications

- [ ] Request browser notification permission
- [ ] Store push subscription in database
- [ ] Send browser notifications on new announcements
- [ ] Mark notifications as read


## 🟢 Nice to Have

### Polish

- [ ] Mobile-responsive navigation (hamburger menu)
- [ ] Optimistic UI updates for likes

## 📁 File Structure Reference

```
app/
├── api/
│   ├── auth/
│   │   ├── login/route.ts      # Add session creation
│   │   ├── register/route.ts   # Add password hashing
│   │   └── logout/route.ts     # TODO: Create
│   └── announcements/
│       └── [id]/
│           └── like/route.ts   # TODO: Toggle logic
├── proxy.ts               # TODO: Create for auth
└── lib/
    └── auth.ts                 # TODO: Session helpers
```

## Quick Wins

1. **Add bcrypt**: `pnpm add bcrypt @types/bcrypt`
2. **Add cookies**: Use `cookies()` from `next/headers`
3. **Create proxy.ts** in app root for route protection

Good to know: Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same.

