import { z } from 'zod';

const SpringLocalDateTimeSchema = z
    .string()
    .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?$/,
        'Invalid datetime format'
    );

// Request body for POST /api/v1/register
export const RegisterPayloadSchema = z.object({
    username: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(1),
    phoneNumber: z.string().min(1),
    profilePictureUrl: z.string().url(),
});

// Response body for 201 Created from POST /api/v1/register
export const RegisterResponseSchema = z.object({
    id: z.number().int().nonnegative(),
    username: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    roles: z.array(z.string()),
    createdAt: SpringLocalDateTimeSchema,
});

export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
