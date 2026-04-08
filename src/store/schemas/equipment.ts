import { z } from 'zod';

export const MainEquipmentSchema = z.object({
    mainEquipmentId: z.number().int().nonnegative(),
    equipmentType: z.string(),
    brand: z.string(),
    model: z.string(),
    serialNumber: z.string(),
    condition: z.string(),
    status: z.string(),
    notes: z.string(),
});

export const SubEquipmentSchema = z.object({
    subEquipmentId: z.number().int().nonnegative(),
    equipmentType: z.string(),
    brand: z.string(),
    model: z.string(),
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

export type MainEquipment = z.infer<typeof MainEquipmentSchema>;
export type SubEquipment = z.infer<typeof SubEquipmentSchema>;
export type EquipmentListResponse = z.infer<typeof EquipmentListResponseSchema>;
