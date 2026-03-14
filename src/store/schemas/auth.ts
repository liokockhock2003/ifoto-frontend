import { z } from 'zod';

// Schema for User (embedded in response/JWT)
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    expiresIn: z.number(),
    username: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    roles: z.array(z.string()),
});

// Schema for full login response
export const UserSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    roles: z.array(z.string()),
});

// Infer types
export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;