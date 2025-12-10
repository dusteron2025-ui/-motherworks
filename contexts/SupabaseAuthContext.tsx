"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User, AuthError } from '@supabase/supabase-js';

// User profile type
interface UserProfile {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    avatarUrl: string | null;
    role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
    verifiedStatus: boolean;
    createdAt: string;
}

interface SupabaseAuthContextType {
    user: UserProfile | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (email: string, password: string, metadata?: { name?: string; role?: string }) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
    refreshUser: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch user profile from database
    const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !data) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return {
            id: data.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            avatarUrl: data.avatar_url,
            role: data.role,
            verifiedStatus: data.verified_status,
            createdAt: data.created_at,
        };
    };

    // Initialize auth state
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session: initialSession } } = await supabase.auth.getSession();
                setSession(initialSession);

                if (initialSession?.user) {
                    const profile = await fetchUserProfile(initialSession.user.id);
                    setUser(profile);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            console.log('Auth state changed:', event);
            setSession(newSession);

            if (newSession?.user) {
                const profile = await fetchUserProfile(newSession.user.id);
                setUser(profile);
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Sign up with email/password
    const signUp = async (email: string, password: string, metadata?: { name?: string; role?: string }) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: metadata?.name || 'Usuário',
                    role: metadata?.role || 'CLIENT',
                },
            },
        });
        return { error };
    };

    // Sign in with email/password
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
        return { error };
    };

    // Sign out
    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    // Reset password (send email)
    const resetPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        return { error };
    };

    // Update password (after reset)
    const updatePassword = async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        return { error };
    };

    // Update user profile
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return { error: new Error('No user logged in') };

        const dbUpdates: Record<string, unknown> = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.phone) dbUpdates.phone = updates.phone;
        if (updates.avatarUrl) dbUpdates.avatar_url = updates.avatarUrl;

        const { error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', user.id);

        if (!error) {
            setUser({ ...user, ...updates });
        }

        return { error: error ? new Error(error.message) : null };
    };

    // Refresh user data
    const refreshUser = async () => {
        if (session?.user) {
            const profile = await fetchUserProfile(session.user.id);
            setUser(profile);
        }
    };

    return (
        <SupabaseAuthContext.Provider value={{
            user,
            session,
            isLoading,
            signUp,
            signIn,
            signInWithGoogle,
            signOut,
            resetPassword,
            updatePassword,
            updateProfile,
            refreshUser,
        }}>
            {children}
        </SupabaseAuthContext.Provider>
    );
}

export function useSupabaseAuth() {
    const context = useContext(SupabaseAuthContext);
    if (context === undefined) {
        throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
    }
    return context;
}
