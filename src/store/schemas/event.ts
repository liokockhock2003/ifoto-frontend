import { z } from 'zod';

export const EventCommitteeMemberSchema = z.object({
    id: z.number().int().nonnegative(),
    username: z.string(),
    fullName: z.string(),
});

export const EventSchema = z.object({
    eventId: z.number().int().nonnegative(),
    eventName: z.string(),
    description: z.string().nullable(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string(),
    isActive: z.boolean(),
    eventCommittee: z.array(EventCommitteeMemberSchema),
});

export const CreateEventPayloadSchema = z.object({
    eventName: z.string().min(1),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    location: z.string().min(1),
    isActive: z.boolean().default(true),
    committeeUserIds: z.array(z.number().int()).default([]),
});

export const UpdateEventPayloadSchema = z.object({
    id: z.number().int(),
    eventName: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    location: z.string().optional(),
    isActive: z.boolean().optional(),
    committeeUserIds: z.array(z.number().int()).optional(),
});

export const DeleteEventPayloadSchema = z.object({
    id: z.number().int(),
});

export type EventCommitteeMember = z.infer<typeof EventCommitteeMemberSchema>;
export type Event = z.infer<typeof EventSchema>;
export type CreateEventPayload = z.infer<typeof CreateEventPayloadSchema>;
export type UpdateEventPayload = z.infer<typeof UpdateEventPayloadSchema>;
export type DeleteEventPayload = z.infer<typeof DeleteEventPayloadSchema>;
