import { useState, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel } from '@/components/ui/field';
import { isAuthApiError, useSendForgotPasswordLink } from '@/store/queries/auth';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const forgotPasswordMutation = useSendForgotPasswordLink();

    function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        forgotPasswordMutation.mutate(
            { email },
            {
                onSuccess(data) {
                    toast.success(data.message);
                },
                onError(err) {
                    toast.error(isAuthApiError(err) ? err.message : 'Failed to send reset link');
                },
            }
        );
    }

    return (
        <div className="space-y-6 text-muted-foreground">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Forgot password</h1>
                <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                </Field>

                <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
                    {forgotPasswordMutation.isPending ? 'Sending...' : 'Send reset link'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Remember your password?{' '}
                    <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
                        Back to login
                    </Link>
                </p>
            </form>
        </div>
    );
}
