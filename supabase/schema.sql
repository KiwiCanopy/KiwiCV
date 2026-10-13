-- ==========================================
-- 1. CLEANUP (Remove existing structures)
-- ==========================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS tr_protect_premium_fields ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS tr_set_updated_at ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS tr_set_updated_at_ai_jobs ON public.ai_jobs CASCADE;

DROP FUNCTION IF EXISTS public.add_timepass(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.fulfill_stripe_order(text, uuid, text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.get_ai_usage_status(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_ai_usage_status(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.reserve_ai_usage(uuid, integer, public.ai_request_type) CASCADE;
DROP FUNCTION IF EXISTS public.ai_usage_count_today(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.protect_premium_fields() CASCADE;
DROP FUNCTION IF EXISTS public.set_current_timestamp_updated_at() CASCADE;

DROP TABLE IF EXISTS public.ai_jobs CASCADE;
DROP TABLE IF EXISTS public.processed_payments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.usage_logs CASCADE;
DROP TABLE IF EXISTS public.used_freebies CASCADE; -- retired with the sign-up trial (2026-10-08)
DROP TABLE IF EXISTS public.user_tracking CASCADE;

DROP TYPE IF EXISTS public.ai_request_type CASCADE;
DROP TYPE IF EXISTS public.job_status CASCADE;
DROP TYPE IF EXISTS public.package_type CASCADE;
DROP TYPE IF EXISTS public.tier_type CASCADE;

-- ==========================================
-- 2. EXTENSIONS & TYPES
-- ==========================================
-- pgcrypto is no longer used (its last caller hashed trial emails); the live extension is left installed.

-- Types for validation (prevents typos in application logic)
CREATE TYPE public.tier_type AS ENUM ('free', 'pro');
CREATE TYPE public.package_type AS ENUM ('pro', 'trial');

CREATE TYPE public.ai_request_type AS ENUM (
  'cv_parsing',           -- Document to JSON conversion
  'cv_full_optimize',     -- Full CV optimization
  'cv_section_optimize',  -- Optimization of a specific section
  'cv_item_optimize',     -- Optimization of a single bullet point
  'cover_letter_gen',     -- Cover letter generation
  'other'                 -- Miscellaneous
);

CREATE TYPE public.job_status AS ENUM (
  'processing',
  'completed',
  'failed'
);

-- ==========================================
-- 3. TABLE CREATION
-- ==========================================

-- User Profiles
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  account_tier public.tier_type DEFAULT 'free',
  premium_until timestamptz,
  stripe_customer_id text,
  -- Legal timestamps (for TOS/Privacy compliance proof)
  accepted_terms boolean DEFAULT false,
  accepted_terms_at timestamptz,
  accepted_privacy boolean DEFAULT false,
  accepted_privacy_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Processed Payments (Idempotency-Schutz für Stripe)
CREATE TABLE public.processed_payments (
  stripe_session_id text PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  fulfillment_type text CHECK (fulfillment_type IN ('timepass')),
  fulfillment_value integer,
  created_at timestamptz DEFAULT now()
);

-- Usage Logs (Metrics for analytics, debugging & billing)
CREATE TABLE public.usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  request_type public.ai_request_type NOT NULL,
  package_used public.package_type DEFAULT 'pro',

  -- Token tracking
  tokens_input integer,
  tokens_output integer,
  -- Fallback only: reserve_ai_usage inserts NULL, and the worker's settle writes
  -- the model the call used (parsing PARSING_MODEL, improvement MODEL).
  model_used text DEFAULT 'gemini-3.5-flash-lite',

  -- Flexible metadata (e.g., latency, region, or specific prompt IDs)
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  -- Set by reserve_ai_usage, cleared when the worker settles the row. A pending
  -- row holds its slot until this passes, so a crashed worker frees it.
  pending_until timestamptz
);

-- AI Background Jobs
CREATE TABLE public.ai_jobs (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status public.job_status DEFAULT 'processing',
  payload jsonb,
  result jsonb,
  error text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now()
);


-- Internal user tracking (not visible to users)
CREATE TABLE public.user_tracking (
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  user_number int GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now()
);

-- ==========================================
-- 4. SECURITY (Row Level Security)
-- ==========================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tracking ENABLE ROW LEVEL SECURITY;
-- Live only, not created here: Supabase's `rls_auto_enable()` event trigger also
-- enables RLS on every new `public` table. An event-trigger function cannot be
-- called over RPC, so it needs no REVOKE.

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view own logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own payments" ON public.processed_payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own jobs" ON public.ai_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.ai_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.ai_jobs FOR DELETE USING (auth.uid() = user_id);

-- ==========================================
-- 5. TRIGGER LOGIC
-- ==========================================

-- Automatically create a profile entry when a new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- New accounts start without a Pass; the sign-up trial ended with 4.5.1.
  INSERT INTO public.profiles (
    id, email, full_name, avatar_url,
    accepted_terms, accepted_terms_at, accepted_privacy, accepted_privacy_at
  )
  VALUES (
    new.id, new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'User'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    true, now(), true, now()
  );

  -- Track the internal user number (for notifications/stats)
  INSERT INTO public.user_tracking (user_id) VALUES (new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Tamper protection: Prevents users from manually raising their tier via API
CREATE OR REPLACE FUNCTION public.protect_premium_fields()
RETURNS trigger AS $$
BEGIN
  -- Only the 'service_role' (backend/admin) is allowed to modify these fields
  IF (current_setting('role') != 'service_role') THEN
    NEW.account_tier := OLD.account_tier;
    NEW.premium_until := OLD.premium_until;
    NEW.stripe_customer_id := OLD.stripe_customer_id;
    NEW.email := OLD.email;

    -- Consent timestamps: never cleared, and a client write records the server's
    -- clock, so a user cannot backdate or future-date a consent.
    IF (NEW.accepted_terms_at IS NULL) THEN
      NEW.accepted_terms_at := OLD.accepted_terms_at;
    ELSIF (NEW.accepted_terms_at IS DISTINCT FROM OLD.accepted_terms_at) THEN
      NEW.accepted_terms_at := now();
    END IF;

    IF (NEW.accepted_privacy_at IS NULL) THEN
      NEW.accepted_privacy_at := OLD.accepted_privacy_at;
    ELSIF (NEW.accepted_privacy_at IS DISTINCT FROM OLD.accepted_privacy_at) THEN
      NEW.accepted_privacy_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- Auto-update the updated_at column on every row update
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = '';

-- ==========================================
-- 6. ADMIN FUNCTIONS (SECURITY DEFINER)
-- ==========================================

-- Activate or extend Pro-Tier membership
CREATE OR REPLACE FUNCTION public.add_timepass(user_id uuid, days_to_add integer)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET account_tier = 'pro',
      premium_until = CASE
        -- If already pro, extend from existing expiration
        -- Use Berlin wall-clock days for DST safety
        WHEN premium_until > now() THEN 
          (premium_until AT TIME ZONE 'Europe/Berlin' + (days_to_add * interval '1 day')) AT TIME ZONE 'Europe/Berlin'
        
        -- If new or expired, start from NOW and round UP to the end of the N-th day in Berlin
        -- This ensures they get the rest of today + N full days, ending at 23:59:59 Berlin time.
        ELSE 
          (date_trunc('day', now() AT TIME ZONE 'Europe/Berlin') + ((days_to_add + 1) * interval '1 day')) AT TIME ZONE 'Europe/Berlin' - interval '1 microsecond'
      END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- On stripe order fullfilled
CREATE OR REPLACE FUNCTION public.fulfill_stripe_order(
  p_session_id text,
  p_user_id uuid,
  p_type text,
  p_value integer
)
RETURNS void AS $$
BEGIN
  -- 1. Idempotency Check
  IF EXISTS (SELECT 1 FROM public.processed_payments WHERE stripe_session_id = p_session_id) THEN
    RETURN;
  END IF;

  -- 2. Fulfillment Logic
  IF p_type = 'timepass' THEN
    PERFORM public.add_timepass(p_user_id, p_value);
  ELSE
    RAISE EXCEPTION 'Invalid fulfillment type: %', p_type;
  END IF;

  -- 3. Mark as processed
  INSERT INTO public.processed_payments (
    stripe_session_id,
    user_id,
    fulfillment_type,
    fulfillment_value
  )
  VALUES (
    p_session_id,
    p_user_id,
    p_type,
    p_value
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- The allowance count, owned here only: both functions below call it. The
-- literal package_used list keeps idx_usage_logs_user_today_pro usable; an
-- expired reservation (pending_until passed) no longer holds its slot.
CREATE OR REPLACE FUNCTION public.ai_usage_count_today(p_user_id uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM public.usage_logs
  WHERE user_id = p_user_id
    AND package_used IN ('pro', 'trial')
    AND (created_at AT TIME ZONE 'Europe/Berlin')::date = (now() AT TIME ZONE 'Europe/Berlin')::date
    AND (pending_until IS NULL OR pending_until > now());
$$ LANGUAGE sql STABLE SET search_path = '';

-- Returns the authoritative Pro usage for the current Berlin day.
CREATE OR REPLACE FUNCTION public.get_ai_usage_status(
  p_user_id uuid DEFAULT auth.uid(),
  p_limit integer DEFAULT 1
)
RETURNS TABLE (
  pro_requests_today integer,
  pro_limit_reached boolean,
  berlin_day_start timestamptz
) AS $$
DECLARE
  -- Only the service role may ask about another user; a client always gets its own.
  v_user_id uuid := CASE
    WHEN current_setting('role') = 'service_role' THEN COALESCE(p_user_id, auth.uid())
    ELSE auth.uid()
  END;
  -- Robustly calculate the start of the current day in Berlin (UTC)
  v_berlin_day_start timestamptz := date_trunc('day', now() AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'Europe/Berlin';
  v_pro_requests_today integer := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'USER_ID_REQUIRED';
  END IF;

  v_pro_requests_today := public.ai_usage_count_today(v_user_id);

  RETURN QUERY
  SELECT
    v_pro_requests_today,
    v_pro_requests_today >= GREATEST(p_limit, 0),
    v_berlin_day_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Takes one allowance slot before a billed AI call, or refuses with a NULL id.
-- The per-user lock makes count-then-insert atomic (.claude/rules/database.md).
CREATE OR REPLACE FUNCTION public.reserve_ai_usage(
  p_user_id uuid,
  p_limit integer,
  p_request_type public.ai_request_type
)
RETURNS TABLE (
  reservation_id uuid,
  pro_requests_today integer
) AS $$
DECLARE
  v_count integer;
  v_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'USER_ID_REQUIRED';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text));

  v_count := public.ai_usage_count_today(p_user_id);

  IF v_count >= GREATEST(p_limit, 0) THEN
    RETURN QUERY SELECT NULL::uuid, v_count;
    RETURN;
  END IF;

  -- 20 minutes outlasts Netlify's 15-minute background-function limit.
  INSERT INTO public.usage_logs (user_id, request_type, package_used, model_used, pending_until)
  VALUES (p_user_id, p_request_type, 'pro', NULL, now() + interval '20 minutes')
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, v_count + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- SECURITY DEFINER functions bypass RLS, and every function is callable over
-- /rest/v1/rpc by default. Billing runs only from the service role
-- (netlify/functions/lib/stripe-fulfillment.mjs), and so does the allowance
-- reservation (netlify/functions/lib/ai/usage.js); the usage status is the
-- signed-in client's own (src/utils/ai.ts).
REVOKE EXECUTE ON FUNCTION public.add_timepass(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.fulfill_stripe_order(text, uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_timepass(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.fulfill_stripe_order(text, uuid, text, integer) TO service_role;
REVOKE EXECUTE ON FUNCTION public.get_ai_usage_status(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_ai_usage_status(uuid, integer) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.reserve_ai_usage(uuid, integer, public.ai_request_type) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_ai_usage(uuid, integer, public.ai_request_type) TO service_role;
-- Its callers run as their owner, so they need no grant here; this pair only
-- closes the direct RPC route.
REVOKE EXECUTE ON FUNCTION public.ai_usage_count_today(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ai_usage_count_today(uuid) TO service_role;

-- ==========================================
-- 7. TRIGGER ACTIVATION
-- ==========================================
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
CREATE TRIGGER tr_protect_premium_fields BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.protect_premium_fields();
CREATE TRIGGER tr_set_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();
CREATE TRIGGER tr_set_updated_at_ai_jobs BEFORE UPDATE ON public.ai_jobs FOR EACH ROW EXECUTE PROCEDURE public.set_current_timestamp_updated_at();

-- Index for performance optimization when querying user history
CREATE INDEX idx_usage_logs_user_today_pro ON public.usage_logs (user_id, created_at) 
WHERE package_used IN ('pro', 'trial');
CREATE INDEX IF NOT EXISTS idx_processed_payments_user ON public.processed_payments(user_id);

-- ==========================================
-- 8. SCHEDULED JOBS (Cleanup)
-- ==========================================
-- Clean up orphaned AI jobs (requires pg_cron extension). The legal pages promise
-- deletion within 24 hours; an hourly tick on a 23-hour predicate keeps the worst
-- case under that. Changing either side means changing the other.
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA extensions;

SELECT cron.schedule(
  'cleanup_old_ai_jobs',
  '0 * * * *', -- Run every hour at minute 0
  $$ DELETE FROM public.ai_jobs WHERE created_at < now() - interval '23 hours'; $$
);

-- Allowance reservations no worker settled or released (a crash, a lost
-- response). They stop counting at pending_until; this removes the row.
SELECT cron.schedule(
  'cleanup_expired_usage_reservations',
  '30 * * * *', -- Run every hour at minute 30
  $$ DELETE FROM public.usage_logs WHERE pending_until IS NOT NULL AND pending_until < now(); $$
);
