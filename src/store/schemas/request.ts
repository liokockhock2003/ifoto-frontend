import { z } from 'zod';

export const EquipmentRequestItemSchema = z.object({
    id: z.number().int(),
    mainEquipmentId: z.number().int(),
    equipmentType: z.string(),
    brand: z.string().nullable(),
    model: z.string().nullable(),
    serialNumber: z.string().nullable(),
});

export const EquipmentRequestSubItemSchema = z.object({
    id: z.number().int(),
    subEquipmentId: z.number().int(),
    equipmentType: z.string(),
    brand: z.string().nullable(),
    borrowedQuantity: z.number().int().positive().optional(),
});

export const RequestStatusSchema = z.enum([
    'PENDING_REVIEW',
    'APPROVED',
    'PICKED_UP',
    'REJECTED',
    'CANCELLED',
    'ACTIVE',
    'RETURNED',
]);

export const EquipmentRequestSchema = z.object({
    id: z.number().int(),
    requestNumber: z.string(),
    eventId: z.number().int(),
    eventName: z.string(),
    requestedByUsername: z.string(),
    reviewedByUsername: z.string().nullable(),
    reviewedByFullName: z.string().nullable().optional(),
    status: RequestStatusSchema,
    startDatetime: z.string(),
    endDatetime: z.string(),
    pickupDatetime: z.string().nullable().optional(),
    returnDatetime: z.string().nullable().optional(),
    durationDays: z.number().int().nullable().optional(),
    rejectionReason: z.string().nullable(),
    committeeNotes: z.string().nullable(),
    requesterNotes: z.string().nullable(),
    items: z.array(EquipmentRequestItemSchema),
    subItems: z.array(EquipmentRequestSubItemSchema),
    createdAt: z.string(),
    approvedAt: z.string().nullable().optional(),
    pickedUpAt: z.string().nullable().optional(),
});

export const PaginatedEquipmentRequestSchema = z.object({
    content: z.array(EquipmentRequestSchema),
    totalElements: z.number().int(),
    totalPages: z.number().int(),
    number: z.number().int(),
    size: z.number().int(),
    first: z.boolean(),
    last: z.boolean(),
    empty: z.boolean(),
    numberOfElements: z.number().int(),
});

export const RequestFiltersSchema = z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    page: z.number().int().min(0).optional(),
    size: z.number().int().positive().optional(),
});

export const SubEquipmentEntrySchema = z.object({
    subEquipmentId: z.number().int(),
    quantity: z.number().int().positive(),
});

export const SubmitRequestPayloadSchema = z.object({
    eventId: z.number().int(),
    equipmentIds: z.array(z.number().int()).min(1),
    subEquipmentEntries: z.array(SubEquipmentEntrySchema).optional(),
    notes: z.string().optional(),
});

const ApproveRequestPayloadSchema = z.object({
    action: z.literal('APPROVE'),
    equipmentIds: z.array(z.number().int()).optional(),
    subEquipmentEntries: z.array(SubEquipmentEntrySchema).optional(),
    committeeNotes: z.string().optional(),
    pickupDatetime: z.string().optional(),
    returnDatetime: z.string().optional(),
});

export const UpdateRequestLogisticsPayloadSchema = z.object({
    pickupDatetime: z.string(),
    returnDatetime: z.string(),
});

export const UpdateRequestEquipmentPayloadSchema = z.object({
    equipmentIds: z.array(z.number().int()),
    subEquipmentEntries: z.array(SubEquipmentEntrySchema).optional(),
});

const RejectRequestPayloadSchema = z.object({
    action: z.literal('REJECT'),
    rejectionReason: z.string().optional(),
    committeeNotes: z.string().optional(),
});

export const ReviewRequestPayloadSchema = z.discriminatedUnion('action', [
    ApproveRequestPayloadSchema,
    RejectRequestPayloadSchema,
]);

export type EquipmentRequestItem = z.infer<typeof EquipmentRequestItemSchema>;
export type EquipmentRequestSubItem = z.infer<typeof EquipmentRequestSubItemSchema>;
export type RequestStatus = z.infer<typeof RequestStatusSchema>;
export type EquipmentRequest = z.infer<typeof EquipmentRequestSchema>;
export type PaginatedEquipmentRequest = z.infer<typeof PaginatedEquipmentRequestSchema>;
export type RequestFilters = z.infer<typeof RequestFiltersSchema>;
export type SubEquipmentEntry = z.infer<typeof SubEquipmentEntrySchema>;
export type SubmitRequestPayload = z.infer<typeof SubmitRequestPayloadSchema>;
export type ReviewRequestPayload = z.infer<typeof ReviewRequestPayloadSchema>;
export type UpdateRequestLogisticsPayload = z.infer<typeof UpdateRequestLogisticsPayloadSchema>;
export type UpdateRequestEquipmentPayload = z.infer<typeof UpdateRequestEquipmentPayloadSchema>;
