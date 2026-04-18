import { useSearchParams, Link } from 'react-router-dom';
import { isAuthApiError, useVerifyEmail } from '@/store/queries/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { isLoading, isSuccess, isError, error } = useVerifyEmail(token);

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Email Verification</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {!token && (
                        <Alert variant="destructive">
                            <AlertDescription>Invalid verification link.</AlertDescription>
                        </Alert>
                    )}

                    {token && isLoading && (
                        <p className="text-sm text-muted-foreground">Verifying your email...</p>
                    )}

                    {token && isSuccess && (
                        <Alert>
                            <AlertDescription>
                                Email verified successfully! You may now log in.
                            </AlertDescription>
                        </Alert>
                    )}

                    {token && isError && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                {isAuthApiError(error) ? error.message : 'This link is invalid or has expired.'}
                            </AlertDescription>
                        </Alert>
                    )}

                    {(!token || !isLoading) && (
                        <Button asChild className="w-full">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
