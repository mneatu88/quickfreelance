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

| Layer                  | Technology                        | Purpose |
|------------------------|-----------------------------------|-------|
| **Frontend**           | Lovable.dev + Next.js + Tailwind  | User interface, responsive design |
| **Authentication**     | Supabase Auth                     | Login, signup, sessions |
| **Database**           | Supabase PostgreSQL               | Users, gigs, orders, courses, enrollments |
| **Payments**           | Stripe Checkout + Webhooks        | Secure payments, escrow, subscriptions |
| **File Storage**       | Supabase Storage                  | Gig images, course thumbnails, videos |
| **Real-time Chat**     | Supabase Realtime                 | Live messaging between buyer and seller (available on all pages) |
| **AI Features**        | Grok + Claude                     | Smart proposals, course generation (future) |

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

## Current Tech Decisions

- **Fast development** → Lovable.dev allows us to build very quickly
- **Low cost at start** → Supabase free tier + Lovable
- **Scalable & Real-time** → Supabase Realtime for chat and notifications
- **Secure payments** → Stripe is industry standard

---

**Last updated:** April 2026
