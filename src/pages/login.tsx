import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '@/store/queries/auth';
import { setAccessToken } from '@/utils/axios-instance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const loginMutation = useLogin();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');

        loginMutation.mutate(
            { username, password },
            {
                onSuccess(data) {
                    // access token → memory only (never localStorage)
                    setAccessToken(data.accessToken);
                    // only non-sensitive user info persisted
                    localStorage.setItem('user', JSON.stringify({
                        username: data.username,
                        email:    data.email,
                        fullName: data.fullName,
                        roles:    data.roles,
                    }));
                    navigate('/', { replace: true });
                },
                onError(err) {
                    setError(err instanceof Error ? err.message : 'Login failed');
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive">{error}</p>
                        )}
                        <Button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="w-full"
                        >
                            {loginMutation.isPending ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}