"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile, Job, Service, Review } from '@/types';
import { SERVICES } from './services';

interface StoreContextType {
    users: UserProfile[];
    jobs: Job[];
    services: Service[];
    addUser: (user: UserProfile) => void;
    updateUser: (user: UserProfile) => void;
    addJob: (job: Job) => void;
    updateJobStatus: (jobId: string, status: Job['status'], rejectionReason?: string) => void;
    addReview: (review: Review) => void;
    addService: (service: Service) => void;
    updateService: (service: Service) => void;
    deleteService: (serviceId: string) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    // Load initial data from localStorage or start empty (Supabase will be primary source)
    useEffect(() => {
        const storedUsers = localStorage.getItem('mw_users');
        const storedJobs = localStorage.getItem('mw_jobs');
        const storedServices = localStorage.getItem('mw_services');

        // Users - start empty, will be populated from Supabase
        if (storedUsers) {
            try {
                setUsers(JSON.parse(storedUsers));
            } catch (e) {
                setUsers([]);
            }
        }

        // Jobs - start empty, will be populated from Supabase
        if (storedJobs) {
            try {
                setJobs(JSON.parse(storedJobs));
            } catch (e) {
                setJobs([]);
            }
        }

        // Services - use default static services if none stored
        if (storedServices) {
            try {
                const parsed = JSON.parse(storedServices);
                setServices(Array.isArray(parsed) ? parsed : SERVICES);
            } catch (e) {
                setServices(SERVICES);
            }
        } else {
            setServices(SERVICES);
            localStorage.setItem('mw_services', JSON.stringify(SERVICES));
        }
    }, []);

    // Sync with localStorage
    useEffect(() => {
        if (users.length > 0) localStorage.setItem('mw_users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (jobs.length > 0) localStorage.setItem('mw_jobs', JSON.stringify(jobs));
    }, [jobs]);

    useEffect(() => {
        if (services.length > 0) localStorage.setItem('mw_services', JSON.stringify(services));
    }, [services]);

    const addUser = (user: UserProfile) => {
        setUsers(prev => [...prev, user]);
    };

    const updateUser = (updatedUser: UserProfile) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    };

    const addJob = (job: Job) => {
        setJobs(prev => [...prev, job]);
    };

    const updateJobStatus = (jobId: string, status: Job['status'], rejectionReason?: string) => {
        setJobs(prev => prev.map(j => {
            if (j.id !== jobId) return j;
            return { ...j, status, rejectionReason };
        }));
    };

    const addReview = (review: Review) => {
        // Update target user stats
        const targetUser = users.find(u => u.id === review.targetId);
        if (targetUser) {
            if (targetUser.role === 'PROVIDER') {
                const provider = targetUser as any;
                const newCount = (provider.reviewCount || 0) + 1;
                const currentTotal = (provider.rating || 0) * (provider.reviewCount || 0);
                const newRating = (currentTotal + review.rating) / newCount;

                updateUser({
                    ...provider,
                    rating: parseFloat(newRating.toFixed(1)),
                    reviewCount: newCount,
                    reviewsReceived: [...(provider.reviewsReceived || []), review]
                });
            } else if (targetUser.role === 'CLIENT') {
                const client = targetUser as any;
                const currentReviews = client.reviewsReceived || [];
                const newRating = ((client.averageRating || 0) * currentReviews.length + review.rating) / (currentReviews.length + 1);

                updateUser({
                    ...client,
                    averageRating: parseFloat(newRating.toFixed(1)),
                    reviewsReceived: [...currentReviews, review]
                });
            }
        }

        // Update Job with review reference
        setJobs(prev => prev.map(j => {
            if (j.id === review.jobId) {
                if (review.type === 'CLIENT_TO_PROVIDER') return { ...j, clientReview: review };
                if (review.type === 'PROVIDER_TO_CLIENT') return { ...j, providerReview: review };
            }
            return j;
        }));
    };

    const addService = (service: Service) => {
        setServices(prev => [...prev, service]);
    };

    const updateService = (updatedService: Service) => {
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    };

    const deleteService = (serviceId: string) => {
        setServices(prev => prev.filter(s => s.id !== serviceId));
    };

    return (
        <StoreContext.Provider value={{
            users, jobs, services,
            addUser, updateUser,
            addJob, updateJobStatus, addReview,
            addService, updateService, deleteService
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider');
    }
    return context;
};
