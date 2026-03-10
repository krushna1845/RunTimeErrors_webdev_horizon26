-- Database schema for Supabase (OpsPulse)

-- Profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    business_name TEXT,
    role TEXT DEFAULT 'owner', -- 'owner' | 'manager'
    plan TEXT DEFAULT 'free', -- 'free' | 'premium'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time metrics log (for history/trends)
CREATE TABLE public.metrics_history (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    revenue NUMERIC,
    orders INTEGER,
    refunds INTEGER,
    inventory_risk_count INTEGER,
    support_ticket_count INTEGER,
    stress_score INTEGER,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts table
CREATE TABLE public.alerts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    type TEXT, -- 'crisis' | 'opportunity' | 'anomaly'
    title TEXT,
    message TEXT,
    severity TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recommendations log
CREATE TABLE public.recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    title TEXT,
    detail TEXT,
    priority TEXT,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
