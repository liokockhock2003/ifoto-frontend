import { useState, useRef, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, IdCard, Info, Lock, Mail, Pencil, User } from 'lucide-react';
import { toast } from 'sonner';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isAuthApiError, useRegister } from '@/store/queries/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldError } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

// ── Password strength ─────────────────────────────────────────────────────────

const PASSWORD_RULES = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'Number', test: (p: string) => /[0-9]/.test(p) },
    { label: 'Special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const;

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'] as const;
const STRENGTH_COLORS = ['', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-400', 'bg-emerald-500'] as const;

function getStrength(password: string): number {
    if (!password) return 0;
    return PASSWORD_RULES.filter(r => r.test(password)).length;
}

// ── Email validation ──────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── Component ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
    const navigate = useNavigate();
    const registerMutation = useRegister();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [emailTouched, setEmailTouched] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [position, setPosition] = useState('');
    const [profilePicture, setprofilePicture] = useState('');
    const [profilePicturePreview, setProfilePicturePreview] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; email?: string }>({});

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;

    const passwordStrength = getStrength(password);
    const emailInvalid = emailTouched && email.length > 0 && !EMAIL_RE.test(email);
    const passwordWeak = passwordTouched && password.length > 0 && passwordStrength < 3;

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Only JPEG, PNG, and WebP images are allowed.');
            e.target.value = '';
            return;
        }
        if (file.size > MAX_SIZE_BYTES) {
            toast.error('Image must be smaller than 5 MB.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result as string;
            setprofilePicture(base64);
            setProfilePicturePreview(base64);
        };
        reader.readAsDataURL(file);
    }

    function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        setFieldErrors({});
        setEmailTouched(true);
        setPasswordTouched(true);

        if (!profilePicture) { toast.error('Please upload a profile picture.'); return; }
        if (!EMAIL_RE.test(email)) return;
        if (passwordStrength < 3) return;

        registerMutation.mutate(
            { username, email, password, fullName, phoneNumber, profilePicture, position: position.trim() || null },
            {
                onSuccess() {
                    toast.success('Registration successful. Please check your email to verify your account.');
                    navigate('/login?registered=true', { replace: true });
                },
                onError(err) {
                    const message = isAuthApiError(err) ? err.message : 'Registration failed';
                    setFieldErrors(isAuthApiError(err) ? (err.fieldErrors ?? {}) : {});
                    toast.error(message);
                },
            }
        );
    }

    return (
        <div className="space-y-6 text-muted-foreground">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Create account</h1>
                <p className="mt-1 text-sm text-muted-foreground">Join IFoto to start managing equipment</p>
            </div>

            {/* Avatar picker */}
            <div className="flex justify-center">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative size-24 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                    <div className="size-full rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                        {profilePicturePreview ? (
                            <img src={profilePicturePreview} alt="Profile preview" className="size-full object-cover" />
                        ) : (
                            <User className="size-10 text-muted-foreground/50" />
                        )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Pencil className="size-6 text-white" />
                    </div>
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Field>
                    <div className="relative">
                        <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value);
                                if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: undefined }));
                            }}
                            placeholder="Username"
                            className={`pl-10 ${fieldErrors.username ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            required
                        />
                    </div>
                    <FieldError errors={[{ message: fieldErrors.username }]} />
                </Field>

                <Field>
                    <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            onBlur={() => setEmailTouched(true)}
                            placeholder="Email"
                            className={`pl-10 pr-10 ${emailInvalid || fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            required
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    aria-label="Email help"
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <Info className="size-4" />
                                </button>
                            </PopoverTrigger>
                            <PopoverContent side="top" align="end" className="w-72 p-0 overflow-hidden">
                                <div className="flex items-center gap-2 border-b bg-muted/50 px-3 py-2">
                                    <Info className="size-4 shrink-0 text-primary" />
                                    <span className="text-sm font-semibold text-foreground">Are you a UTM student?</span>
                                </div>
                                <div className="px-3 py-2.5 space-y-1.5">
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Sign up with your UTM student email to unlock discounted student rental rates.
                                    </p>
                                    <p className="text-xs font-medium text-foreground">
                                        e.g. <span className="font-mono text-primary">name@graduate.utm.my</span>
                                    </p>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    {emailInvalid
                        ? <FieldError errors={[{ message: 'Please enter a valid email address.' }]} />
                        : <FieldError errors={[{ message: fieldErrors.email }]} />
                    }
                </Field>

                <Field>
                    <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            onBlur={() => setPasswordTouched(true)}
                            placeholder="Password"
                            className={`pl-10 pr-10 ${passwordWeak ? 'border-destructive focus-visible:ring-destructive' : ''}`}
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
                    {/* Strength bar */}
                    {password.length > 0 && (
                        <div className="space-y-1.5">
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < passwordStrength ? STRENGTH_COLORS[passwordStrength] : 'bg-muted'}`}
                                    />
                                ))}
                            </div>
                            <p className={`text-xs font-medium ${passwordStrength < 3 ? 'text-destructive' : 'text-emerald-500'}`}>
                                {STRENGTH_LABELS[passwordStrength]}
                            </p>
                            <ul className="space-y-0.5">
                                {PASSWORD_RULES.map(rule => {
                                    const passed = rule.test(password);
                                    return (
                                        <li key={rule.label} className={`text-xs flex items-center gap-1.5 ${passed ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                                            <span>{passed ? '✓' : '○'}</span>
                                            {rule.label}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                    {passwordWeak && <FieldError errors={[{ message: 'Password is too weak. Aim for "Good" or stronger.' }]} />}
                </Field>

                <Field>
                    <div className="relative">
                        <IdCard className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={e => setFullName(e.target.value)}
                            placeholder="Full name"
                            className="pl-10"
                            required
                        />
                    </div>
                </Field>

                <Field>
                    <PhoneInput
                        id="phoneNumber"
                        inputComponent={Input}
                        defaultCountry="MY"
                        international
                        value={phoneNumber}
                        onChange={(v) => setPhoneNumber(v ?? '')}
                        placeholder="Phone number"
                        className="flex items-center gap-2"
                    />
                </Field>

                <Field>
                    <div className="relative">
                        <Briefcase className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="position"
                            type="text"
                            value={position}
                            onChange={e => setPosition(e.target.value)}
                            placeholder="Position (optional)"
                            className="pl-10"
                        />
                    </div>
                </Field>

                <Button type="submit" disabled={registerMutation.isPending} className="w-full">
                    {registerMutation.isPending ? 'Creating account...' : 'Create account'}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-foreground underline underline-offset-4">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}
