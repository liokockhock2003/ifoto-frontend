import { useState, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { isAuthApiError, useSendForgotPasswordLink } from '@/store/queries/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const forgotPasswordMutation = useSendForgotPasswordLink();

    function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        forgotPasswordMutation.mutate(
            { email },
            {
                onSuccess(data) {
                    toast.success(data.message);
                    setSent(true);
                },
                onError(err) {
                    toast.error(isAuthApiError(err) ? err.message : 'Failed to send reset link');
                },
            }
        );
    }

    // ── Confirmation state ──────────────────────────────────────────────────────
    if (sent) {
        return (
            <div className="space-y-6 text-center text-muted-foreground">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <MailCheck className="size-8" />
                </div>
                <div className="space-y-1.5">
                    <h1 className="text-2xl font-bold text-foreground">Check your inbox</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        If an account exists for{' '}
                        <span className="font-medium text-foreground">{email}</span>, we&apos;ve sent a password
                        reset link. It may take a minute to arrive.
                    </p>
                </div>

                <Button
                    variant="outline"
                    className="w-full"
                    disabled={forgotPasswordMutation.isPending}
                    onClick={() => handleSubmit({ preventDefault() {} } as SyntheticEvent<HTMLFormElement>)}
                >
                    {forgotPasswordMutation.isPending ? 'Resending...' : 'Resend email'}
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

    // ── Form state ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6 text-muted-foreground">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    No worries — enter your email and we&apos;ll send you a reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="pl-10"
                            required
                        />
                    </div>
                </Field>

                <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                    {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset link'}
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
