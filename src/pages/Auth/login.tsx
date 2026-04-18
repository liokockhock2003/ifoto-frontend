import { useState, type SyntheticEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { isAuthApiError, useLogin } from '@/store/queries/auth';
import { setAccessToken } from '@/utils/axios-instance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/field';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const registered = searchParams.get('registered') === 'true';
    const loginMutation = useLogin();

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoginError('');

        loginMutation.mutate(
            { username, password },
            {
                onSuccess(data) {
                    setAccessToken(data.accessToken);
                    localStorage.setItem('user', JSON.stringify({
                        username: data.username,
                        email: data.email,
                        fullName: data.fullName,
                        roles: data.roles,
                    }));
                    toast.success('Login successful');
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 700);
                },
                onError(err) {
                    const message = isAuthApiError(err) ? err.message : 'Login failed';
                    setLoginError(message);
                    toast.error(message);
                },
            }
        );
    }

    return (
        <div className="space-y-6 text-muted-foreground">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="mt-1 text-sm text-muted-foreground">Sign in to your IFoto account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {registered && (
                    <Alert>
                        <AlertDescription>
                            Registration successful. Please verify your email before logging in.
                        </AlertDescription>
                    </Alert>
                )}

                {loginError && (
                    <Alert variant="destructive">
                        <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                )}

                <Field>
                    <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        placeholder="Username"
                        required
                    />
                </Field>

                <Field>
                    <div className="relative">
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="pr-10"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <div className="flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-xs font-medium text-foreground/80 underline-offset-4 hover:text-foreground"
                        >
                            Forgot password?
                        </Link>
                    </div>
                </Field>

                <Button type="submit" disabled={loginMutation.isPending} className="w-full">
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
                        Register
                    </Link>
                </p>
            </form>
        </div>
    );
}
