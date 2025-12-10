-- ================================================================
-- FIX: Master Admin RLS Policy
-- Execute this in Supabase SQL Editor if you're getting "Acesso Negado"
-- ================================================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Master admins can manage admins" ON master_admins;

-- Allow authenticated users to check if they are master admin (read their own row)
CREATE POLICY "Users can check own master status" ON master_admins
    FOR SELECT USING (auth.uid() = user_id);

-- Allow master admins to manage the table
CREATE POLICY "Master admins can insert" ON master_admins
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM master_admins));

CREATE POLICY "Master admins can update" ON master_admins
    FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM master_admins));

CREATE POLICY "Master admins can delete" ON master_admins
    FOR DELETE USING (auth.uid() IN (SELECT user_id FROM master_admins));
