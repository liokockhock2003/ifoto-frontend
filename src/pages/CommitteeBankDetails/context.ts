import { createContext, useContext, type RefObject } from 'react';
import type { CommitteeBankDetails, CommitteeBankDetailsPayload } from '@/store/schemas/user';

export type BankDetailsContextValue = {
    // server state
    data: CommitteeBankDetails | null | undefined;
    isLoading: boolean;
    isPending: boolean;
    // form state
    form: CommitteeBankDetailsPayload;
    setForm: React.Dispatch<React.SetStateAction<CommitteeBankDetailsPayload>>;
    sigPreview: string | null;
    canSubmit: boolean;
    // handlers
    fileInputRef: RefObject<HTMLInputElement | null>;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    clearSignature: () => void;
    handleSubmit: () => void;
};

export const BankDetailsContext = createContext<BankDetailsContextValue | null>(null);

export function useCommitteeBankDetailsContext(): BankDetailsContextValue {
    const ctx = useContext(BankDetailsContext);
    if (!ctx) throw new Error('useCommitteeBankDetailsContext must be used inside CommitteeBankDetailsProvider');
    return ctx;
}
