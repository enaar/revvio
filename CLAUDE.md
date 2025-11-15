# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js SaaS starter template with authentication, Stripe payments, and team management. Built with Next.js 15 (canary), React 19, TypeScript, Drizzle ORM, and PostgreSQL.

## Development Commands

### Initial Setup
```bash
pnpm install                # Install dependencies
pnpm db:setup              # Create .env file (interactive)
pnpm db:migrate            # Run database migrations
pnpm db:seed               # Seed database with test user (test@test.com / admin123)
```

### Development
```bash
pnpm dev                   # Start dev server with Turbopack
pnpm build                 # Build for production
pnpm start                 # Start production server
```

### Database Operations
```bash
pnpm db:generate           # Generate Drizzle migrations
pnpm db:migrate            # Apply migrations
pnpm db:studio             # Open Drizzle Studio GUI
```

### Stripe Local Testing
```bash
stripe login              # Login to Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook  # Listen for webhooks
```

## Architecture

### Authentication & Authorization

**Session Management**
- JWT-based sessions stored in HTTP-only cookies (24-hour expiry)
- Session tokens signed with `AUTH_SECRET` using jose library
- Automatic session renewal on GET requests via global middleware (`middleware.ts:18-33`)
- Session functions in `lib/auth/session.ts`: `getSession()`, `setSession()`, `verifyToken()`

**Route Protection**
- Global middleware protects all `/dashboard/*` routes (`middleware.ts:5,10-14`)
- Unauthenticated users redirected to `/sign-in`
- User data fetched via `getUser()` from `lib/db/queries.ts:7-37`

**Server Action Middleware**
Three middleware patterns for Server Actions in `lib/auth/middleware.ts`:
1. `validatedAction` - Validates Zod schema only
2. `validatedActionWithUser` - Validates schema + ensures authenticated user
3. `withTeam` - Ensures user has team membership

### Database Schema

**Core Tables** (`lib/db/schema.ts`)
- `users` - User accounts with soft delete support (deletedAt)
- `teams` - Team entities with Stripe integration fields
- `teamMembers` - Many-to-many join table (users ↔ teams) with roles
- `activityLogs` - Audit trail for user actions
- `invitations` - Pending team invitations

**Relationships**
- Users can belong to multiple teams via `teamMembers`
- Each team has multiple members with roles (owner/member)
- Activity logs track all user actions per team
- Drizzle relations defined at bottom of schema file

**Key Queries** (`lib/db/queries.ts`)
- `getUser()` - Gets current authenticated user from session cookie
- `getTeamForUser()` - Fetches user's team with all members (uses Drizzle relational queries)
- `getActivityLogs()` - Returns last 10 activity logs for current user

### Stripe Integration

**Payment Flow**
1. User clicks pricing tier → `createCheckoutSession()` called
2. Redirects to Stripe Checkout with 14-day trial
3. On success, redirects to `/api/stripe/checkout?session_id={id}`
4. Webhook updates team subscription data

**Webhook Handling** (`app/api/stripe/webhook/route.ts`)
- Listens for `customer.subscription.updated` and `customer.subscription.deleted`
- Verifies webhook signature with `STRIPE_WEBHOOK_SECRET`
- Updates team subscription status via `handleSubscriptionChange()`

**Customer Portal** (`lib/payments/stripe.ts:49-115`)
- Dynamically creates or reuses Billing Portal configuration
- Allows users to update subscription, payment method, or cancel

### App Structure

**Route Groups**
- `app/(login)/*` - Public auth pages (sign-in, sign-up)
- `app/(dashboard)/*` - Protected dashboard pages
- `app/api/*` - API routes for Stripe and data endpoints

**Server Actions Pattern**
- All mutations use Server Actions (marked with `'use server'`)
- Actions in `app/(login)/actions.ts` handle auth, account, and team operations
- Each action logs activity via `logActivity()` helper function
- Actions return `ActionState` type with error/success messages

**Data Fetching**
- Uses SWR for client-side data fetching with SSR fallback
- Initial data preloaded in root layout via SWRConfig fallback (`app/layout.tsx:30-37`)
- API routes at `/api/user` and `/api/team` provide fresh data

### Activity Logging

All user actions are logged to `activityLogs` table via `logActivity()` helper in `app/(login)/actions.ts:29-45`. Tracked events include:
- Authentication: SIGN_UP, SIGN_IN, SIGN_OUT
- Account: UPDATE_PASSWORD, DELETE_ACCOUNT, UPDATE_ACCOUNT
- Teams: CREATE_TEAM, REMOVE_TEAM_MEMBER, INVITE_TEAM_MEMBER, ACCEPT_INVITATION

### Key Patterns

**Soft Deletes**
- Users are soft-deleted with timestamp and email mangling
- Query filters include `isNull(users.deletedAt)` check
- See `deleteAccount` action in `app/(login)/actions.ts:295-339`

**Form Validation**
- Zod schemas define validation rules
- Server Actions use middleware to validate before execution
- Errors returned in ActionState format

**TypeScript Path Aliases**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Use for all imports: `@/lib/db/queries`, `@/components/ui/button`, etc.

## Environment Variables

Required variables (see `.env.example`):
- `POSTGRES_URL` - PostgreSQL connection string
- `AUTH_SECRET` - JWT signing secret (generate with `openssl rand -base64 32`)
- `BASE_URL` - Application URL (http://localhost:3000 for dev)
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

## Next.js Configuration

Experimental features enabled in `next.config.ts`:
- `ppr: true` - Partial Prerendering
- `clientSegmentCache: true` - Client-side segment caching
- `nodeMiddleware: true` - Node.js middleware support

Development uses Turbopack for faster builds.
