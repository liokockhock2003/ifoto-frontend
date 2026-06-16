import { createContext, useContext } from 'react';
import type { UseMutateFunction } from '@tanstack/react-query';
import type { UserProfile, UpdateUserProfilePayload } from '@/store/schemas/user';

export type ProfileContextValue = {
    data:          UserProfile | null | undefined;
    isLoading:     boolean;
    isPending:     boolean;
    updateProfile: UseMutateFunction<UserProfile, Error, UpdateUserProfilePayload>;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function useProfileContext(): ProfileContextValue {
    const ctx = useContext(ProfileContext);
    if (!ctx) throw new Error('useProfileContext must be used inside ProfileProvider');
    return ctx;
}
