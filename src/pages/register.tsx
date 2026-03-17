import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { isAuthApiError, useRegister } from '@/store/queries/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterPage() {
    const navigate = useNavigate();
    const registerMutation = useRegister();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string }>({});

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setFieldErrors({});

        registerMutation.mutate(
            {
                username,
                email,
                password,
                fullName,
                phoneNumber,
                profilePictureUrl,
            },
            {
                onSuccess() {
                    toast.success('Registration successful. Please login.');
                    navigate('/login', { replace: true });
                },
                onError(err) {
                    const message = isAuthApiError(err) ? err.message : 'Registration failed';
                    setFieldErrors(isAuthApiError(err) ? (err.fieldErrors ?? {}) : {});
                    setError(message);
                    toast.error(message);
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle className="text-2xl">Create account</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => {
                                    setUsername(e.target.value);
                                    if (fieldErrors.username) {
                                        setFieldErrors(prev => ({ ...prev, username: undefined }));
                                    }
                                }}
                                placeholder="Choose a username"
                                className={fieldErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}
                                required
                            />
                            {fieldErrors.username && <p className="text-sm text-destructive">{fieldErrors.username}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={e => {
                                    setEmail(e.target.value);
                                    if (fieldErrors.email) {
                                        setFieldErrors(prev => ({ ...prev, email: undefined }));
                                    }
                                }}
                                placeholder="you@example.com"
                                className={fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
                                required
                            />
                            {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="fullName">Full name</Label>
                            <Input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                placeholder="Your full name"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="phoneNumber">Phone number</Label>
                            <Input
                                id="phoneNumber"
                                type="tel"
                                value={phoneNumber}
                                onChange={e => setPhoneNumber(e.target.value)}
                                placeholder="+60123456789"
                                required
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <Label htmlFor="profilePictureUrl">Profile picture URL</Label>
                            <Input
                                id="profilePictureUrl"
                                type="url"
                                value={profilePictureUrl}
                                onChange={e => setProfilePictureUrl(e.target.value)}
                                placeholder="https://example.com/avatar.png"
                                required
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="w-full"
                        >
                            {registerMutation.isPending ? 'Creating account...' : 'Create account'}
                        </Button>

                        <p className="text-center text-sm text-muted-foreground">
                            Already have an account?{' '}
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
