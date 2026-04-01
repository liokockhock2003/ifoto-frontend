import { useState, type SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Forgot password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

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
                </CardContent>
            </Card>
        </div>
    );
}
