# Supabase Required Setup
All browser components write to `/api/*` endpoints rather than accessing Supabase directly. This isolates core rules (e.g., scoping everything to a single default store) while providing cross-device persistence.

### 1) Initialize Supabase
1. Create a free project at [database.new](https://database.new)
2. Obtain your `Project URL`, `anon key` (public), and `service_role secret` (private) from **Settings > API**.

### 2) Set Environment Variables
Copy `.env.example` to `.env.local` if you haven't yet, and populate the following keys. **Do not put your `service_role` key under a `VITE_` prefix.**
```ini
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
DEMO_STORE_ID=00000000-0000-0000-0000-000000000000
```
*(In Vercel, simply add these directly in Project Settings -> Environment Variables)*

### 3) Apply Database Schema
Go to **SQL Editor** in the Supabase Dashboard, copy the contents of `supabase/schema.sql`, and hit `Run`.

### 4) Storage Configuration (For COAs)
*(If you need file uploads, otherwise skip)*
1. Go to **Storage > Create Bucket**.
2. Name the bucket `coas`.
3. Check **"Public bucket"**.
4. (Optional) In Storage > Policies, create an unconditional `INSERT` policy if doing direct client uploads.

Backend APIs handles the rest!
