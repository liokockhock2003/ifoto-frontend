import { type ReactNode } from 'react';
import { useGetProfile, useUpdateProfile } from '@/store/queries/user';
import { ProfileContext } from './context';

export function ProfileProvider({ children }: { children: ReactNode }) {
    const { data, isLoading } = useGetProfile();
    const { mutate: updateProfile, isPending } = useUpdateProfile();

    return (
        <ProfileContext.Provider value={{ data, isLoading, isPending, updateProfile }}>
            {children}
        </ProfileContext.Provider>
    );
}
