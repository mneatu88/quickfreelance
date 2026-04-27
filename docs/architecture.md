# Architecture & Technical Overview

**QuickFreelance** is built as a modern, scalable SaaS platform using Lovable.dev + Supabase.

---

## High-Level Architecture
Frontend (Lovable.dev)
↓
Supabase Backend
├── Authentication
├── PostgreSQL Database
├── Edge Functions
├── Storage (for images, course files)
└── Realtime (chat, notifications)
↓
Stripe (Payments)

---

## Main Components

| Layer              | Technology              | Purpose |
|--------------------|-------------------------|-------|
| **Frontend**       | Lovable.dev + Next.js + Tailwind | User interface, responsive design |
| **Authentication** | Supabase Auth           | Login, signup, magic links, sessions |
| **Database**       | Supabase PostgreSQL     | Users, gigs, orders, courses, enrollments |
| **Payments**       | Stripe Checkout + Webhooks | Secure payments, escrow, subscriptions |
| **File Storage**   | Supabase Storage        | Gig images, course thumbnails, videos |
| **Chat**           | Supabase Realtime       | Real-time messaging between buyer & seller |
| **AI Features**    | Grok + Claude           | Smart proposals, course generation (future) |

---

## Key Database Tables (main ones)

- `users` – buyer/seller profiles
- `gigs` – freelance services
- `orders` – marketplace orders
- `courses` – Academy courses
- `course_enrollments` – user course access
- `course_purchases` – Stripe payments for courses
- `course_payout_requests` – mentor payout requests

---

## Current Tech Decisions (Why we chose this stack)

- **Fast development** → Lovable.dev allows us to build very quickly
- **Low cost at start** → Supabase free tier + Lovable
- **Scalable** → Can grow to thousands of users without changing stack
- **Secure payments** → Stripe is industry standard
- **Real-time features** → Built-in with Supabase

---

**Future improvements planned:**
- Move to Supabase Pro when we hit usage limits
- Add proper CI/CD with GitHub Actions
- PWA for mobile app experience
- Advanced AI agents for sellers

---

**Last updated:** April 2026
