import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiErrorMessage } from '@/utils/api-error';
import { QueryFactory } from '@/store/query-factory';
import { invalidateQuery } from '@/store/query-client';
import { axios } from '@/utils/axios-instance';
import {
    EventSchema,
    CreateEventPayloadSchema,
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

const createEventMutation = eventQuery.customMutation<CreateEventPayload>({
    method: 'post',
    urlSuffix: '',
    inputSchema: CreateEventPayloadSchema,
    toastMsg: 'Event created',
    invalidateKeys: () => [eventKeys.all],
});

export const eventKeys = {
    all: eventQuery.qk(),
    list: () => eventQuery.lists(),
    committeeList: (userId: number) => [...eventQuery.qk(), 'committee', userId],
};

export function useEvents() {
    return useQuery(eventQuery.list()());
}

export function useEventsByCommittee(userId: number) {
    return useQuery({
        queryKey: eventKeys.committeeList(userId),
        queryFn: async () => {
            const res = await axios.get(`/api/v1/events/committee/${userId}`);
            return EventSchema.array().parse(res.data);
        },
    });
}

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
        mutationFn: async ({ id, ...body }) => {
            try {
                const res = await axios.put(`/api/v1/events/${id}`, body);
                return EventSchema.parse(res.data);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
        onSuccess: () => {
            toast('Event updated');
            invalidateQuery(eventKeys.all);
        },
    });
}

export function useDeleteEvent() {
    return useMutation<Event, Error, DeleteEventPayload>({
        mutationFn: async ({ id }) => {
            try {
                const res = await axios.delete(`/api/v1/events/${id}`);
                return EventSchema.parse(res.data);
            } catch (err) {
                throw new Error(extractApiErrorMessage(err));
            }
        },
        onSuccess: () => {
            toast('Event deleted');
            invalidateQuery(eventKeys.all);
        },
    });
}
