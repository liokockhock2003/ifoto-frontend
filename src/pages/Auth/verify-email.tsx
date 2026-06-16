import { useSearchParams, Link } from 'react-router-dom';
import { Loader2, MailCheck, CircleCheck, CircleX } from 'lucide-react';
import { isAuthApiError, useVerifyEmail } from '@/store/queries/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function VerifyEmailPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const { isLoading, isSuccess, error } = useVerifyEmail(token);

    // Resolve the current state into a single view model.
    const view = (() => {
        if (!token) {
            return {
                tone: 'error' as const,
                icon: CircleX,
                title: 'Invalid verification link',
                description: 'This link is missing its verification token. Please use the link from your email.',
                showLogin: true,
            };
        }
        if (isLoading) {
            return {
                tone: 'loading' as const,
                icon: Loader2,
                title: 'Verifying your email',
                description: 'Hang tight while we confirm your account…',
                showLogin: false,
            };
        }
        if (isSuccess) {
            return {
                tone: 'success' as const,
                icon: CircleCheck,
                title: 'Email verified!',
                description: 'Your account is now active. You can log in and start using IFoto.',
                showLogin: true,
            };
        }
        return {
            tone: 'error' as const,
            icon: CircleX,
            title: 'Verification failed',
            description: isAuthApiError(error) ? error.message : 'This link is invalid or has expired.',
            showLogin: true,
        };
    })();

    const Icon = view.icon;

    const iconWrap = {
        loading: 'bg-primary/10 text-primary',
        success: 'bg-emerald-500/10 text-emerald-500',
        error: 'bg-destructive/10 text-destructive',
    }[view.tone];

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <Card className="w-full max-w-sm border-border/60 shadow-sm">
                <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center">
                    {/* Brand */}
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MailCheck className="size-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Email Verification</span>
                    </div>

                    {/* Status icon */}
                    <div className={`flex size-16 items-center justify-center rounded-full ${iconWrap}`}>
                        <Icon className={`size-8 ${view.tone === 'loading' ? 'animate-spin' : ''}`} />
                    </div>

                    {/* Message */}
                    <div className="space-y-1.5">
                        <h1 className="text-xl font-semibold text-foreground">{view.title}</h1>
                        <p className="text-sm text-muted-foreground leading-relaxed">{view.description}</p>
                    </div>

                    {/* Action */}
                    {view.showLogin && (
                        <Button asChild className="w-full">
                            <Link to="/login">Go to Login</Link>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
