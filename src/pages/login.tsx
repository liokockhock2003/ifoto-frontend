import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/features/api/auth';        // @/features  → src/features
import { Button } from '@/components/ui/button';    // @/components/ui → src/components/ui
import { Input } from '@/components/ui/input';      // shadcn Input
import { Label } from '@/components/ui/label';      // shadcn Label
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // shadcn Card
import { cn } from '@/lib/utils';                   // @/lib → src/lib

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await login({ username, password });
            console.log('JWT token:', data.token);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={cn('flex min-h-screen items-center justify-center bg-background')}>
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
                            <p className={cn('text-sm text-destructive')}>{error}</p>
                        )}
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}