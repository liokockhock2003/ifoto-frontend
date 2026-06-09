import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useGetBankDetails, useUpdateBankDetails } from '@/store/queries/user';
import type { CommitteeBankDetailsPayload } from '@/store/schemas/user';

import { BankDetailsContext } from './context';

export function CommitteeBankDetailsProvider({ children }: { children: ReactNode }) {
    const { data, isLoading } = useGetBankDetails();
    const { mutate, isPending } = useUpdateBankDetails();

    const [form, setForm] = useState<CommitteeBankDetailsPayload>({
        bankName: '',
        accountNo: '',
        signature: null,
    });
    const [sigPreview, setSigPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (data) {
            setForm({ bankName: data.bankName, accountNo: data.accountNo, signature: data.signature });
            setSigPreview(data.signature ? `data:image/png;base64,${data.signature}` : null);
        }
    }, [data]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            setForm((p) => ({ ...p, signature: result.split(',')[1] }));
            setSigPreview(result);
        };
        reader.readAsDataURL(file);
    }

    function clearSignature() {
        setForm((p) => ({ ...p, signature: null }));
        setSigPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    function handleSubmit() {
        mutate(form);
    }

    const canSubmit = !isPending && form.bankName.trim() !== '' && form.accountNo.trim() !== '';

    return (
        <BankDetailsContext value={{
            data,
            isLoading,
            isPending,
            form,
            setForm,
            sigPreview,
            canSubmit,
            fileInputRef,
            handleFileChange,
            clearSignature,
            handleSubmit,
        }}>
            {children}
        </BankDetailsContext>
    );
}
