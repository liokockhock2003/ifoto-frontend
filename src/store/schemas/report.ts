import { z } from 'zod';

export const KpiStatsSchema = z.object({
    totalRentalsThisMonth: z.number(),
    totalRevenueCollected: z.number(),
    activeRentals: z.number(),
    overdueCount: z.number(),
});

export const RentalStatusBreakdownItemSchema = z.object({
    status: z.string(),
    count: z.number(),
});

export const RentalVolumeItemSchema = z.object({
    month: z.string(),
    count: z.number(),
});

export const RevenueItemSchema = z.object({
    month: z.string(),
    baseAmount: z.number(),
    penaltyAmount: z.number(),
});

export const EquipmentUtilizationItemSchema = z.object({
    equipmentId: z.number(),
    equipmentName: z.string(),
    rentalCount: z.number(),
    category: z.string(),
});

// ── Types ─────────────────────────────────────────────────────────────────────

export type KpiStats = z.infer<typeof KpiStatsSchema>;
export type RentalStatusBreakdownItem = z.infer<typeof RentalStatusBreakdownItemSchema>;
export type RentalVolumeItem = z.infer<typeof RentalVolumeItemSchema>;
export type RevenueItem = z.infer<typeof RevenueItemSchema>;
export type EquipmentUtilizationItem = z.infer<typeof EquipmentUtilizationItemSchema>;
