import { useQuery } from '@tanstack/react-query';
import { QueryFactory } from '@/store/query-factory';
import {
    KpiStatsSchema,
    RentalStatusBreakdownItemSchema,
    RentalVolumeItemSchema,
    RevenueItemSchema,
    EquipmentUtilizationItemSchema,
    type KpiStats,
    type RentalStatusBreakdownItem,
    type RentalVolumeItem,
    type RevenueItem,
    type EquipmentUtilizationItem,
} from '@/store/schemas/report';

// ── Query factory instance ────────────────────────────────────────────────────

const reportQuery = QueryFactory<KpiStats>(
    'reports',
    {
        single: KpiStatsSchema,
        list: KpiStatsSchema.array(),
    },
    '/api/v1/reports',
);

// ── Query configs ─────────────────────────────────────────────────────────────

const kpiListQuery = reportQuery.customList<KpiStats>({
    responseSchema: KpiStatsSchema,
    urlSuffix: '/kpi',
    queryKeySuffix: 'kpi',
});

const rentalStatusListQuery = reportQuery.customList<RentalStatusBreakdownItem[]>({
    responseSchema: RentalStatusBreakdownItemSchema.array(),
    urlSuffix: '/rental-status',
    queryKeySuffix: 'rental-status',
});

const rentalVolumeQuery = reportQuery.customQuery<RentalVolumeItem[], number>({
    responseSchema: RentalVolumeItemSchema.array(),
    urlSuffix: (months) => `/rental-volume?months=${months}`,
    queryKeySuffix: (months) => ['rental-volume', months],
});

const revenueQuery = reportQuery.customQuery<RevenueItem[], number>({
    responseSchema: RevenueItemSchema.array(),
    urlSuffix: (months) => `/revenue?months=${months}`,
    queryKeySuffix: (months) => ['revenue', months],
});

const equipmentUtilizationListQuery = reportQuery.customList<EquipmentUtilizationItem[]>({
    responseSchema: EquipmentUtilizationItemSchema.array(),
    urlSuffix: '/equipment-utilization',
    queryKeySuffix: 'equipment-utilization',
});

// ── Query hooks ───────────────────────────────────────────────────────────────

export function useKpiStats() {
    return useQuery(kpiListQuery());
}

export function useRentalStatusBreakdown() {
    return useQuery(rentalStatusListQuery());
}

export function useRentalVolume(months: number) {
    return useQuery(rentalVolumeQuery(months));
}

export function useRevenueOverTime(months: number) {
    return useQuery(revenueQuery(months));
}

export function useEquipmentUtilization() {
    return useQuery(equipmentUtilizationListQuery());
}
