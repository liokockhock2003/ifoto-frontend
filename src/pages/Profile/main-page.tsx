import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserCircle, TriangleAlert } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import { toast } from 'sonner';
import { UpdateUserProfilePayloadSchema, type UpdateUserProfilePayload } from '@/store/schemas/user';
import { useAuth } from '@/store/auth-context';

import { ProfileProvider } from './provider';
import { useProfileContext } from './context';

// ── Page content ──────────────────────────────────────────────────────────────

function ProfileContent() {
    const { data, isLoading, isPending, updateProfile } = useProfileContext();
    const { updateUser } = useAuth();

    const form = useForm<UpdateUserProfilePayload>({
        resolver: zodResolver(UpdateUserProfilePayloadSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phoneNumber: '',
            position: '',
        },
    });

    const { formState, watch, reset } = form;
    const watchedEmail = watch('email');

    useEffect(() => {
        if (data) {
            reset({
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber ?? '',
                position: data.position ?? '',
            });
        }
    }, [data, reset]);

    function onSubmit(values: UpdateUserProfilePayload) {
        updateProfile(values, {
            onSuccess: (res) => {
                updateUser({ fullName: res.fullName, email: res.email });
                reset({
                    fullName: res.fullName,
                    email: res.email,
                    phoneNumber: res.phoneNumber ?? '',
                    position: res.position ?? '',
                });
            },
            onError: (err) => toast.error(err.message),
        });
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    const emailChanged = data?.email && watchedEmail && watchedEmail !== data.email;

    return (
        <div className="space-y-5">
            {data?.emailVerified === false && (
                <Alert>
                    <TriangleAlert className="h-4 w-4" />
                    <AlertDescription>
                        Your email address is not verified. Check your inbox for a verification link.
                    </AlertDescription>
                </Alert>
            )}

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 text-foreground">
                    <div className="space-y-1">
                        <Label className="text-sm font-medium">Username</Label>
                        <Input value={data?.username ?? ''} disabled className="text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">Username cannot be changed.</p>
                    </div>

                    <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="you@example.com" {...field} />
                                </FormControl>
                                {emailChanged && (
                                    <p className="text-sm text-muted-foreground">
                                        Changing your email requires re-verification. A new verification link will be sent.
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Phone Number
                                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="+60 12-345 6789"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Position
                                    <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="e.g. Photographer, Treasurer"
                                        {...field}
                                        value={field.value ?? ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={!formState.isDirty || !formState.isValid || isPending}
                    >
                        {isPending ? 'Saving…' : 'Save Profile'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProfileMainPage() {
    return (
        <ProfileProvider>
            <div className="space-y-6 p-2 sm:p-6 max-w-lg">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <UserCircle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl text-primary font-semibold tracking-tight">My Profile</h1>
                        <p className="text-sm text-muted-foreground">
                            View and update your personal information.
                        </p>
                    </div>
                </div>
                <ProfileContent />
            </div>
        </ProfileProvider>
    );
}
