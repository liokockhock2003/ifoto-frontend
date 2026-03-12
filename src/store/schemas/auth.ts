import { z } from 'zod';

// Schema for User (embedded in response/JWT)
export const UserSchema = z.object({
    id: z.string(), // Or z.number() if ID is numeric
    username: z.string(),
    email: z.string().email(),
    roles: z.array(z.string()),
    permissions: z.array(z.string()),
    avatarUrl: z.string().url().optional(),
});

// Schema for full login response
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
    expiresIn: z.number(),
    user: UserSchema,
});

// Infer types
export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;