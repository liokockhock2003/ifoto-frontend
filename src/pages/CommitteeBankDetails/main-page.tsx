import { Landmark, Upload, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
// import { Separator } from '@/components/ui/separator';

import { CommitteeBankDetailsProvider } from './provider';
import { useCommitteeBankDetailsContext } from './context';
import { BankNameCombobox } from './bank-name-combobox';

// ── Page content ──────────────────────────────────────────────────────────────

function BankDetailsContent() {
    const {
        isLoading, isPending, canSubmit,
        form, setForm,
        sigPreview, fileInputRef,
        handleFileChange, clearSignature, handleSubmit,
    } = useCommitteeBankDetailsContext();

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />)}
            </div>
        );
    }

    return (
        <>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4 text-foreground">
                <Field>
                    <FieldLabel>Bank Name</FieldLabel>
                    <BankNameCombobox
                        value={form.bankName}
                        onChange={(v) => setForm((p) => ({ ...p, bankName: v }))}
                    />
                </Field>

                <Field>
                    <FieldLabel>Account Number</FieldLabel>
                    <Input
                        placeholder="e.g. 1234567890"
                        value={form.accountNo}
                        onChange={(e) => setForm((p) => ({ ...p, accountNo: e.target.value }))}
                    />
                </Field>

                <Field>
                    <FieldLabel>
                        Signature
                        <span className="text-muted-foreground font-normal ml-1">(optional, PNG)</span>
                    </FieldLabel>
                    <div className="space-y-2 flex-col items-start flex">
                        {sigPreview && (
                            <div className="relative inline-block border rounded-md p-2 bg-muted">
                                <img src={sigPreview} alt="Signature preview" className="h-16 object-contain" />
                                <button
                                    type="button"
                                    onClick={clearSignature}
                                    className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                                >
                                    <X className="size-3" />
                                </button>
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="size-4 mr-1" />
                            {sigPreview ? 'Replace' : 'Upload signature'}
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                </Field>

                <Button type="submit" disabled={!canSubmit}>
                    {isPending ? 'Saving…' : 'Save Bank Details'}
                </Button>
            </form>
        </>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CommitteeBankDetailsMainPage() {
    return (
        <CommitteeBankDetailsProvider>
            <div className="space-y-6 p-2 sm:p-6 max-w-lg">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Landmark className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">Committee Bank Details</h1>
                        <p className="text-sm text-muted-foreground">
                            These details appear on rental invoices so renters can make bank transfers.
                        </p>
                    </div>
                </div>
                <BankDetailsContent />
            </div>
        </CommitteeBankDetailsProvider>
    );
}
