# Chik Time

Chik Time is a modern routine and time management web app built with **Next.js 16**, **React 19**, **Tailwind CSS**, and **Supabase**. It helps users plan daily routines, manage timed tasks, and track progress with a polished neumorphic-style interface.

## 🌟 Project Overview

This project includes:

- A **login screen** with email/password sign-in, sign-up, Google OAuth, and password reset flows.
- A **dashboard** that loads user-specific time slots from Supabase.
- A **routine onboarding flow** for creating and customizing time slots.
- A **task manager / active timer** experience for running scheduled tasks.
- Light/dark theme support, responsive UI, and animated interactions.

## 🚀 Key Features

- **Supabase authentication** using email/password, Google OAuth, and password reset links.
- **User-specific data** stored in Supabase `time_slots`.
- **Timer workflow** that moves through routine tasks and records progress.
- **Neumorphic UI styling** with custom components and soft shadows.
- **Theme support** with a class-based theme provider and toggle.
- **Responsive layout** optimized for desktop and mobile use.

## 📁 App Structure

- `app/` — Next.js App Router pages and routes
  - `app/login/page.tsx` — authentication UI and Supabase login flows
  - `app/dashboard/page.tsx` — authenticated dashboard and task selection
  - `app/onboarding/page.tsx` — routine creation and slot onboarding
  - `app/active-timer/page.tsx` — active timer interface for tasks
  - `app/reset-password/` — password reset flow pages
- `components/` — reusable UI components and feature widgets
- `lib/` — application logic, Supabase client, and routine state store
- `styles/` — global CSS and theme utilities

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication / Database:** Supabase
- **State:** React context and local component state
- **Icons:** Lucide React
- **Utilities:** Zod, React Hook Form, Recharts, Sonner

## 💻 Installation

```bash
npm install
npm run dev
```

Open the app at `http://localhost:3000`.

## 🔧 Environment Variables

Create a `.env.local` file with the following keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Recommended Usage

1. Register or sign in using email/password or Google.
2. Create a new routine in the onboarding flow.
3. Start the active timer and complete each task in sequence.
4. Use the theme toggle for light/dark mode.

## 📌 Notes

- This repo uses a Supabase backend for authentication and time slot storage.
- The UI is tailored for a clean, modern experience with soft neumorphic elements.
- The project can be deployed to Vercel or any Next.js-compatible hosting provider.

## 🧩 License

This repository is ready for GitHub upload and can be used as a starting point for a time-management or habit-building app.
