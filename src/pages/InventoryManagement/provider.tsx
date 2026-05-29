import { useMemo, type ReactNode } from 'react';

import { useEquipmentList } from '@/store/queries/equipment';

import { InventoryManagementContext } from './context';

// ── Equipment config (single source of truth for keys, labels, type values) ───

export const MAIN_EQUIPMENT_CONFIG = {
    cameras: { label: 'Camera', equipmentType: 'Camera' },
    lenses:  { label: 'Lens',   equipmentType: 'Lens'   },
} as const;

export const SUB_EQUIPMENT_CONFIG = {
    batteryCameras:   { label: 'Battery Camera',    typeValue: 'Battery Camera'  },
    chargerBatteries: { label: 'Charger Battery',   typeValue: 'Charger Battery' },
    speedlights:      { label: 'Speedlight',        typeValue: 'Speedlight'      },
    sdCfCards:        { label: 'SD Card / CF Card', typeValue: 'SD Card/CF Card' },
    tripods:          { label: 'Tripod',            typeValue: 'Tripod'          },
    lainLain:         { label: 'Others',            typeValue: 'Lain-Lain'       },
} as const;

export const MAIN_EQUIPMENT_KEYS = Object.keys(MAIN_EQUIPMENT_CONFIG) as (keyof typeof MAIN_EQUIPMENT_CONFIG)[];
export const SUB_EQUIPMENT_KEYS  = Object.keys(SUB_EQUIPMENT_CONFIG)  as (keyof typeof SUB_EQUIPMENT_CONFIG)[];

// ── Sub Equipment field-visibility config (shared by create & edit dialogs) ───

export type SubKindConfig = {
    equipmentTypeLabel?: string;
    placeholder?: string;
    showCameraModel?: boolean;
    showCapacity?: boolean;
};

export const SUB_KIND_CONFIG: Record<keyof typeof SUB_EQUIPMENT_CONFIG, SubKindConfig> = {
    batteryCameras:   { equipmentTypeLabel: 'Brand',     placeholder: 'e.g. Canon',           showCameraModel: true },
    chargerBatteries: { equipmentTypeLabel: 'Brand',     placeholder: 'e.g. Canon',           showCameraModel: true },
    speedlights:      {},
    sdCfCards:        { equipmentTypeLabel: 'Card Type', placeholder: 'e.g. SD Card',         showCapacity: true   },
    tripods:          {},
    lainLain:         { equipmentTypeLabel: 'Item',      placeholder: 'e.g. Kain Microfiber'                       },
};

/** Reverse-map a SubEquipment.type value → SUB_EQUIPMENT_CONFIG key */
export function subKindFromType(type: string | undefined): keyof typeof SUB_EQUIPMENT_CONFIG | undefined {
    if (!type) return undefined;
    return (Object.keys(SUB_EQUIPMENT_CONFIG) as (keyof typeof SUB_EQUIPMENT_CONFIG)[])
        .find((key) => SUB_EQUIPMENT_CONFIG[key].typeValue === type);
}

// ── Provider ──────────────────────────────────────────────────────────────────

type InventoryManagementProviderProps = {
    children: ReactNode;
};

export function InventoryManagementProvider({
    children,
}: InventoryManagementProviderProps) {
    const equipmentQuery = useEquipmentList();

    const value = useMemo(
        () => {
            const mainEquipment = equipmentQuery.data?.mainEquipment ?? [];
            const subEquipment = equipmentQuery.data?.subEquipment ?? [];

            return {
                mainEquipment,
                subEquipment,
                data: equipmentQuery.data,

                cameras:          mainEquipment.filter((e) => e.equipmentType === MAIN_EQUIPMENT_CONFIG.cameras.equipmentType),
                lenses:           mainEquipment.filter((e) => e.equipmentType === MAIN_EQUIPMENT_CONFIG.lenses.equipmentType),
                batteryCameras:   subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.batteryCameras.typeValue),
                chargerBatteries: subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.chargerBatteries.typeValue),
                speedlights:      subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.speedlights.typeValue),
                sdCfCards:        subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.sdCfCards.typeValue),
                tripods:          subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.tripods.typeValue),
                lainLain:         subEquipment.filter((e) => e.type === SUB_EQUIPMENT_CONFIG.lainLain.typeValue),

                totalMainEquipment: mainEquipment.length,
                totalSubEquipment:  subEquipment.length,

                isLoading:  equipmentQuery.isLoading,
                isFetching: equipmentQuery.isFetching,
                isError:    equipmentQuery.isError,
                error:      equipmentQuery.error ?? null,
                refetch:    equipmentQuery.refetch,
            };
        },
        [
            equipmentQuery.data,
            equipmentQuery.error,
            equipmentQuery.isError,
            equipmentQuery.isFetching,
            equipmentQuery.isLoading,
            equipmentQuery.refetch,
        ],
    );

    return (
        <InventoryManagementContext.Provider value={value}>
            {children}
        </InventoryManagementContext.Provider>
    );
}
