import { z } from 'zod';

export const MainEquipmentSchema = z.object({
    mainEquipmentId: z.number().int().nonnegative(),
    equipmentType: z.string(),
    lensType: z.string().nullish(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    condition: z.string(),
    status: z.string(),
    notes: z.string(),
});

export const SubEquipmentSchema = z.object({
    subEquipmentId: z.number().int().nonnegative(),
    type: z.string().optional(),
    equipmentType: z.string(),
    cameraModel: z.array(z.string()).optional(),
    brand: z.string().nullable(),
    capacity: z.number().int().nonnegative(),
    totalQuantity: z.number().int().nonnegative(),
    usedQuantity: z.number().int().nonnegative(),
    availableQuantity: z.number().int().nonnegative(),
    notes: z.string(),
});

export const EquipmentListResponseSchema = z.object({
    mainEquipment: z.array(MainEquipmentSchema),
    subEquipment: z.array(SubEquipmentSchema),
});

// ── Payload schemas (no id — used for create & update request bodies) ─────────

export const MainEquipmentPayloadSchema = MainEquipmentSchema.omit({ mainEquipmentId: true });
export const MainEquipmentUpdatePayloadSchema = MainEquipmentPayloadSchema.extend({
    mainEquipmentId: z.number().int().positive(),
});

export const SubEquipmentPayloadSchema = SubEquipmentSchema.omit({ subEquipmentId: true });
export const SubEquipmentUpdatePayloadSchema = SubEquipmentPayloadSchema.extend({
    subEquipmentId: z.number().int().positive(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type MainEquipment = z.infer<typeof MainEquipmentSchema>;
export type MainEquipmentPayload = z.infer<typeof MainEquipmentPayloadSchema>;
export type MainEquipmentUpdatePayload = z.infer<typeof MainEquipmentUpdatePayloadSchema>;

export type SubEquipment = z.infer<typeof SubEquipmentSchema>;
export type SubEquipmentPayload = z.infer<typeof SubEquipmentPayloadSchema>;
export type SubEquipmentUpdatePayload = z.infer<typeof SubEquipmentUpdatePayloadSchema>;

export type EquipmentListResponse = z.infer<typeof EquipmentListResponseSchema>;
