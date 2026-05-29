import { z } from 'zod';

export const KpiStatsSchema = z.object({
    totalRentalsThisMonth: z.number(),
    totalRevenueCollected: z.number(),
    activeRentals: z.number(),
    overdueCount: z.number(),
});

export const RentalStatusBreakdownSchema = z.object({
    approved:    z.number(),
    paid:        z.number(),
    active:      z.number(),
    overdue:     z.number(),
    paidOverdue: z.number(),
    returned:    z.number(),
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
export type RentalStatusBreakdown = z.infer<typeof RentalStatusBreakdownSchema>;
export type RentalVolumeItem = z.infer<typeof RentalVolumeItemSchema>;
export type RevenueItem = z.infer<typeof RevenueItemSchema>;
export type EquipmentUtilizationItem = z.infer<typeof EquipmentUtilizationItemSchema>;
