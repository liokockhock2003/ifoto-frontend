import { useMemo, useState, type SyntheticEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck, CircleX, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { isAuthApiError, useResetPassword } from '@/store/queries/auth';

const MIN_PASSWORD_LENGTH = 8;

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmTouched, setConfirmTouched] = useState(false);
    const [done, setDone] = useState(false);
    const resetPasswordMutation = useResetPassword();

    const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

    const tooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
    const mismatch = confirmTouched && confirmPassword.length > 0 && confirmPassword !== newPassword;
    const canSubmit = newPassword.length >= MIN_PASSWORD_LENGTH && confirmPassword === newPassword;

    function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setConfirmTouched(true);
        if (!token) {
            toast.error('Missing reset token');
            return;
        }
        if (!canSubmit) return;

        resetPasswordMutation.mutate(
            { token, newPassword },
            {
                onSuccess(data) {
                    toast.success(data.message);
                    setNewPassword('');
                    setConfirmPassword('');
                    setDone(true);
                },
                onError(err) {
                    toast.error(isAuthApiError(err) ? err.message : 'Failed to reset password');
                },
            }
        );
    }

    // ── Invalid / missing token ──────────────────────────────────────────────────
    if (!token) {
        return (
            <div className="space-y-6 text-center text-muted-foreground">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                    <CircleX className="size-8" />
                </div>
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-foreground">Invalid reset link</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        This password reset link is missing its token or has expired. Please request a new one.
                    </p>
                </div>
                <Button asChild className="w-full">
                    <Link to="/forgot-password">Request a new link</Link>
                </Button>
                <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    Back to login
                </Link>
            </div>
        );
    }

    // ── Success ──────────────────────────────────────────────────────────────────
    if (done) {
        return (
            <div className="space-y-6 text-center text-muted-foreground">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <CircleCheck className="size-8" />
                </div>
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-foreground">Password reset</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Your password has been updated. You can now log in with your new password.
                    </p>
                </div>
                <Button asChild className="w-full">
                    <Link to="/login">Go to login</Link>
                </Button>
            </div>
        );
    }

    // ── Form ─────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 text-muted-foreground">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Reset password</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Choose a new password for your IFoto account.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field>
                    <FieldLabel htmlFor="newPassword">New password</FieldLabel>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="newPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            className={`pl-10 pr-10 ${tooShort ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    {tooShort && <FieldError errors={[{ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` }]} />}
                </Field>

                <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            onBlur={() => setConfirmTouched(true)}
                            placeholder="Re-enter your new password"
                            className={`pl-10 ${mismatch ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            required
                        />
                    </div>
                    {mismatch && <FieldError errors={[{ message: 'Passwords do not match.' }]} />}
                </Field>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={!canSubmit || resetPasswordMutation.isPending}
                >
                    {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
                </Button>

                <Link
                    to="/login"
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                >
                    <ArrowLeft className="size-4" />
                    Back to login
                </Link>
            </form>
        </div>
    );
}
