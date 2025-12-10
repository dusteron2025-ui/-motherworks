"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '@/types';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    signup: (data: Partial<User> & { password: string } & Record<string, unknown>) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Initialize auth from Supabase session
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Check Supabase session
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // Get user profile - use maybeSingle() to avoid error when profile doesn't exist
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    const userObj: User = {
                        id: session.user.id,
                        email: session.user.email || '',
                        name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
                        role: (profile?.role as Role) || 'CLIENT',
                        avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
                        createdAt: profile?.created_at || session.user.created_at,
                    };
                    setUser(userObj);
                }
            } catch (error) {
                console.error('Auth init error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event);
            if (event === 'SIGNED_IN' && session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle();

                const userObj: User = {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: profile?.name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
                    role: (profile?.role as Role) || 'CLIENT',
                    avatarUrl: profile?.avatar_url || session.user.user_metadata?.avatar_url,
                    createdAt: profile?.created_at || session.user.created_at,
                };
                setUser(userObj);
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw new Error(error.message);
            }

            if (data.user) {
                // Get profile to determine role
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .maybeSingle();

                const userObj: User = {
                    id: data.user.id,
                    email: data.user.email || '',
                    name: profile?.name || data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
                    role: (profile?.role as Role) || 'CLIENT',
                    avatarUrl: profile?.avatar_url,
                    createdAt: profile?.created_at || data.user.created_at,
                };
                setUser(userObj);

                // Redirect based on role
                if (userObj.role === 'ADMIN') router.push('/admin');
                else if (userObj.role === 'PROVIDER') router.push('/provider');
                else router.push('/client');
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (data: Partial<User> & { password: string } & Record<string, unknown>) => {
        setIsLoading(true);
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email || '',
                password: data.password,
                options: {
                    data: {
                        full_name: data.name,
                        role: data.role || 'CLIENT',
                    }
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            if (authData.user) {
                // Create profile in profiles table
                await supabase.from('profiles').upsert({
                    id: authData.user.id,
                    email: authData.user.email,
                    name: data.name,
                    role: data.role || 'CLIENT',
                    phone: data.phone,
                    created_at: new Date().toISOString(),
                });

                const userObj: User = {
                    id: authData.user.id,
                    email: authData.user.email || '',
                    name: data.name || '',
                    role: (data.role as Role) || 'CLIENT',
                    createdAt: new Date().toISOString(),
                };
                setUser(userObj);

                if (userObj.role === 'PROVIDER') router.push('/provider/onboarding');
                else router.push('/client');
            }
        } catch (error) {
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await supabase.auth.signOut();
            setUser(null);
            router.push('/login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                signup,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
