import { useMutation, useQuery } from '@tanstack/react-query';
import { extractApiErrorMessage } from '@/utils/api-error';
import { QueryFactory } from '@/store/query-factory';
import {
    EventSchema,
    CreateEventPayloadSchema,
    UpdateEventPayloadSchema,
    DeleteEventPayloadSchema,
    type Event,
    type CreateEventPayload,
    type UpdateEventPayload,
    type DeleteEventPayload,
} from '@/store/schemas/event';

const eventQuery = QueryFactory<Event>(
    'events',
    {
        single: EventSchema,
        list: EventSchema.array(),
    },
    '/api/v1/events',
);

// ── Query keys ────────────────────────────────────────────────────────────────

export const eventKeys = {
    all: eventQuery.qk(),
    list: () => eventQuery.lists(),
    userEvents: (userId: number) => [...eventQuery.qk(), 'users', userId],
};

// ── Mutation configs ──────────────────────────────────────────────────────────

const createEventMutation = eventQuery.customMutation<CreateEventPayload>({
    method: 'post',
    urlSuffix: '',
    inputSchema: CreateEventPayloadSchema,
    toastMsg: 'Event created',
    invalidateKeys: () => [eventKeys.all],
});

const updateEventMutation = eventQuery.customMutation<UpdateEventPayload>({
    method: 'put',
    urlSuffix: ({ id }) => `/${id}`,
    inputSchema: UpdateEventPayloadSchema,
    toastMsg: 'Event updated',
    invalidateKeys: () => [eventKeys.all],
});

const deleteEventMutation = eventQuery.customMutation<DeleteEventPayload>({
    method: 'delete',
    urlSuffix: ({ id }) => `/${id}`,
    inputSchema: DeleteEventPayloadSchema,
    toastMsg: 'Event deleted',
    invalidateKeys: () => [eventKeys.all],
});

// ── Query configs ─────────────────────────────────────────────────────────────

const eventsByCommitteeQuery = eventQuery.customQuery<Event[], number>({
    responseSchema: EventSchema.array(),
    urlSuffix: (userId) => `/users/${userId}`,
    queryKeySuffix: (userId) => ['users', userId],
});

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useEvents() {
    return useQuery(eventQuery.list()());
}

export function useEventsByCommittee(userId: number, options?: { enabled?: boolean }) {
    return useQuery(eventsByCommitteeQuery(userId, options));
}

// ── Mutation hooks ────────────────────────────────────────────────────────────

export function useCreateEvent() {
    return useMutation<Event, Error, CreateEventPayload>({
        ...createEventMutation,
        mutationFn: async (input) => {
            try {
                return await createEventMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useUpdateEvent() {
    return useMutation<Event, Error, UpdateEventPayload>({
        ...updateEventMutation,
        mutationFn: async (input) => {
            try {
                return await updateEventMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}

export function useDeleteEvent() {
    return useMutation<Event, Error, DeleteEventPayload>({
        ...deleteEventMutation,
        mutationFn: async (input) => {
            try {
                return await deleteEventMutation.mutationFn(input);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
    });
}
