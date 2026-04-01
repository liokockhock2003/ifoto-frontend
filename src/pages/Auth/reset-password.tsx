import { useMemo, useState, type SyntheticEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { isAuthApiError, useResetPassword } from '@/store/queries/auth';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const resetPasswordMutation = useResetPassword();

    const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);

    function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!token) {
            toast.error('Missing reset token');
            return;
        }

        resetPasswordMutation.mutate(
            { token, newPassword },
            {
                onSuccess(data) {
                    toast.success(data.message);
                    setNewPassword('');
                },
                onError(err) {
                    toast.error(isAuthApiError(err) ? err.message : 'Failed to reset password');
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Reset password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {!token && (
                            <Alert variant="destructive">
                                <AlertDescription>Missing or invalid reset token in URL.</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                                disabled={!token}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={!token || resetPasswordMutation.isPending}
                        >
                            {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset password'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Back to{' '}
                            <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
                                Login
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
