import { z } from 'zod';

export const RoleSchema = z.string().trim().min(1).transform((role) => {
    const normalized = role.toUpperCase();
    return normalized.startsWith('ROLE_') ? normalized : `ROLE_${normalized}`;
});

// Schema for User (embedded in response/JWT)
export const AuthResponseSchema = z.object({
    accessToken: z.string(),
    expiresIn: z.number(),
    username: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    roles: z.array(RoleSchema),
    profilePicture: z.string().nullish(),
});

// Schema for full login response
export const UserSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    roles: z.array(RoleSchema),
    profilePicture: z.string().nullish(),
});

export const ForgotPasswordPayloadSchema = z.object({
    email: z.string().email(),
});

export const ForgotPasswordResponseSchema = z.union([
    z.string().transform((message) => ({ message })),
    z.object({
        message: z.string(),
    }),
]);

export const ResetPasswordPayloadSchema = z.object({
    token: z.uuid(),
    newPassword: z.string().min(1),
});

export const ResetPasswordResponseSchema = z.union([
    z.string().transform((message) => ({ message })),
    z.object({
        message: z.string(),
    }),
]);

// Infer types
export type User = z.infer<typeof UserSchema>;
export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordPayloadSchema>;
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;
export type ResetPasswordPayload = z.infer<typeof ResetPasswordPayloadSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;