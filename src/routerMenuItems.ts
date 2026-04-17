import {
    BarChart3,
    CalendarCheck,
    CalendarCog,
    ClipboardList,
    Package,
    PackageCheck,
    RotateCcw,
    ShoppingCart,
    Undo2,
    UserCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AppRole =
    | 'ROLE_ADMIN'
    | 'ROLE_STUDENT'
    | 'ROLE_EQUIPMENT_COMMITTEE'
    | 'ROLE_EVENT_COMMITTEE'
    | 'ROLE_NON_STUDENT'
    | 'ROLE_HIGH_COMMITTEE'

export interface MenuItem {
    to: string
    label: string
    icon: LucideIcon
    allowedRoles?: AppRole[]
    activePaths?: string[]
}

export interface MenuGroup {
    label: string
    items: MenuItem[]
}

export const menuGroups: MenuGroup[] = [
    {
        label: 'Equipment Rental',
        items: [
            {
                to: '/equipment-rent',
                label: 'Equipment Rental',
                icon: ShoppingCart,
                allowedRoles: ['ROLE_STUDENT', 'ROLE_NON_STUDENT'],
            },
            {
                to: '/equipment-returns',
                label: 'Return Rented Equipment',
                icon: Undo2,
                allowedRoles: ['ROLE_STUDENT', 'ROLE_NON_STUDENT'],
            },
        ],
    },
    {
        label: 'Equipment Request',
        items: [
            {
                to: '/equipment-requests',
                label: 'Equipment Request',
                icon: ClipboardList,
                allowedRoles: ['ROLE_EVENT_COMMITTEE'],
            },
            {
                to: '/equipment-request-returns',
                label: 'Return Requested Equipment',
                icon: RotateCcw,
                allowedRoles: ['ROLE_EVENT_COMMITTEE'],
            },
        ],
    },
    {
        label: 'Admin Dashboard',
        items: [
            {
                to: '/user-management',
                label: 'User Management',
                icon: UserCog,
                allowedRoles: ['ROLE_ADMIN'],
            },
        ],
    },
    {
        label: 'Management',
        items: [
            {
                to: '/event-management',
                label: 'Event Management',
                icon: CalendarCog,
                allowedRoles: ['ROLE_HIGH_COMMITTEE'],
            },
            {
                to: '/manage-inventory',
                label: 'Inventory Management',
                icon: Package,
                allowedRoles: ['ROLE_EQUIPMENT_COMMITTEE'],
                activePaths: ['/manage-inventory/rental-pricing'],
                
            },
            {
                to: '/equipment-booking-management',
                label: 'Equipment Booking Management',
                icon: CalendarCheck,
                allowedRoles: ['ROLE_EQUIPMENT_COMMITTEE'],
            },
            {
                to: '/equipment-return-management',
                label: 'Equipment Return Management',
                icon: PackageCheck,
                allowedRoles: ['ROLE_EQUIPMENT_COMMITTEE'],
            },
            {
                to: '/reporting-dashboard',
                label: 'Reporting Dashboard',
                icon: BarChart3,
                allowedRoles: ['ROLE_EQUIPMENT_COMMITTEE', 'ROLE_HIGH_COMMITTEE'],
            },
        ],
    },
]
