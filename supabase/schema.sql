-- ============================================
-- MOTHERWORKS PLATFORM - SUPABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'CLIENT' CHECK (role IN ('CLIENT', 'PROVIDER', 'ADMIN')),
    verified_status BOOLEAN DEFAULT FALSE,
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROVIDER PROFILES
-- ============================================
CREATE TABLE public.provider_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bio TEXT,
    rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    service_count INTEGER DEFAULT 0,
    profile_score INTEGER DEFAULT 0,
    service_radius_km INTEGER DEFAULT 10,
    offered_services TEXT[] DEFAULT '{}',
    accepted_location_types TEXT[] DEFAULT '{}',
    accepts_subscriptions BOOLEAN DEFAULT FALSE,
    location_lat DECIMAL(10,7),
    location_lng DECIMAL(10,7),
    location_address TEXT,
    schedule_constraints JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CLIENT PROFILES
-- ============================================
CREATE TABLE public.client_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    saved_addresses JSONB DEFAULT '[]',
    subscription_type TEXT,
    subscription_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SERVICES CATALOG
-- ============================================
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    duration_hours INTEGER DEFAULT 2,
    category TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- JOBS (BOOKINGS)
-- ============================================
CREATE TABLE public.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES public.users(id),
    provider_id UUID REFERENCES public.users(id),
    service_id UUID REFERENCES public.services(id),
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED', 'PAID')),
    date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    duration_hours INTEGER NOT NULL,
    location_lat DECIMAL(10,7) NOT NULL,
    location_lng DECIMAL(10,7) NOT NULL,
    location_address TEXT NOT NULL,
    location_type TEXT,
    price_total DECIMAL(10,2) NOT NULL,
    provider_payout DECIMAL(10,2) NOT NULL,
    agency_fee DECIMAL(10,2) NOT NULL,
    frequency TEXT DEFAULT 'ONCE' CHECK (frequency IN ('ONCE', 'WEEKLY', 'BIWEEKLY', 'MONTHLY')),
    stripe_session_id TEXT,
    cancellation_reason TEXT,
    cancelled_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WALLETS
-- ============================================
CREATE TABLE public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    balance DECIMAL(10,2) DEFAULT 0,
    pending_balance DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WALLET TRANSACTIONS
-- ============================================
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT', 'PAYOUT', 'REFUND')),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    description TEXT,
    job_id UUID REFERENCES public.jobs(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS
-- ============================================
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id),
    target_id UUID NOT NULL REFERENCES public.users(id),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    type TEXT NOT NULL CHECK (type IN ('CLIENT_TO_PROVIDER', 'PROVIDER_TO_CLIENT')),
    flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHATS & MESSAGES
-- ============================================
CREATE TABLE public.chats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES public.jobs(id),
    participant_1 UUID NOT NULL REFERENCES public.users(id),
    participant_2 UUID NOT NULL REFERENCES public.users(id),
    last_message_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ADMIN LOGS
-- ============================================
CREATE TABLE public.admin_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES public.users(id),
    action TEXT NOT NULL,
    target_id UUID NOT NULL,
    target_type TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_jobs_client ON public.jobs(client_id);
CREATE INDEX idx_jobs_provider ON public.jobs(provider_id);
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_date ON public.jobs(date);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX idx_reviews_target ON public.reviews(target_id);
CREATE INDEX idx_wallet_transactions_wallet ON public.wallet_transactions(wallet_id);
CREATE INDEX idx_chat_messages_chat ON public.chat_messages(chat_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Users: can read all, update own
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Provider Profiles: can read all, update own
CREATE POLICY "Anyone can view provider profiles" ON public.provider_profiles FOR SELECT USING (true);
CREATE POLICY "Providers can update own profile" ON public.provider_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Client Profiles: owners only
CREATE POLICY "Clients can view own profile" ON public.client_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Clients can update own profile" ON public.client_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Jobs: participants can view their jobs
CREATE POLICY "Users can view their jobs" ON public.jobs FOR SELECT USING (auth.uid() = client_id OR auth.uid() = provider_id);
CREATE POLICY "Clients can create jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Participants can update jobs" ON public.jobs FOR UPDATE USING (auth.uid() = client_id OR auth.uid() = provider_id);

-- Wallets: owner only
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own wallet" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

-- Wallet Transactions: wallet owner only
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT 
    USING (wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid()));

-- Reviews: can read all, create for own jobs
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their jobs" ON public.reviews FOR INSERT 
    WITH CHECK (auth.uid() = author_id);

-- Notifications: owner only
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Chats: participants only
CREATE POLICY "Participants can view chats" ON public.chats FOR SELECT 
    USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Chat Messages: chat participants only
CREATE POLICY "Participants can view messages" ON public.chat_messages FOR SELECT 
    USING (chat_id IN (SELECT id FROM public.chats WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()));
CREATE POLICY "Participants can send messages" ON public.chat_messages FOR INSERT 
    WITH CHECK (chat_id IN (SELECT id FROM public.chats WHERE participant_1 = auth.uid() OR participant_2 = auth.uid()));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER provider_profiles_updated_at BEFORE UPDATE ON public.provider_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER client_profiles_updated_at BEFORE UPDATE ON public.client_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'), COALESCE(NEW.raw_user_meta_data->>'role', 'CLIENT'));
    
    -- Create wallet for user
    INSERT INTO public.wallets (user_id) VALUES (NEW.id);
    
    -- Create profile based on role
    IF NEW.raw_user_meta_data->>'role' = 'PROVIDER' THEN
        INSERT INTO public.provider_profiles (user_id) VALUES (NEW.id);
    ELSE
        INSERT INTO public.client_profiles (user_id) VALUES (NEW.id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update provider rating on new review
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.type = 'CLIENT_TO_PROVIDER' THEN
        UPDATE public.provider_profiles
        SET 
            rating = (SELECT AVG(rating) FROM public.reviews WHERE target_id = NEW.target_id AND type = 'CLIENT_TO_PROVIDER'),
            review_count = (SELECT COUNT(*) FROM public.reviews WHERE target_id = NEW.target_id AND type = 'CLIENT_TO_PROVIDER')
        WHERE user_id = NEW.target_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created
    AFTER INSERT ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION update_provider_rating();
