import {
    BarChart3,
    CalendarCog,
    ClipboardList,
    Package,
    ShoppingCart,
    Undo2,
    UserCog,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AppRole =
    | 'ROLE_ADMIN'
    | 'ROLE_CLUB_MEMBER'
    | 'ROLE_EQUIPMENT_COMMITTEE'
    | 'ROLE_EVENT_COMMITTEE'
    | 'ROLE_GUEST'
    | 'ROLE_HIGH_COMMITTEE'

export interface MenuItem {
    to: string
    label: string
    icon: LucideIcon
    allowedRoles?: AppRole[]
}

export const menuItems: MenuItem[] = [
    {
        to: '/manage-equipment',
        label: 'Manage Equipment',
        icon: Package,
        allowedRoles: ['ROLE_EQUIPMENT_COMMITTEE'],
    },
    {
        to: '/user-management',
        label: 'User Management',
        icon: UserCog,
        allowedRoles: ['ROLE_ADMIN'],
    },
    {
        to: '/equipment-requests',
        label: 'Equipment Requests',
        icon: ClipboardList,
        allowedRoles: ['ROLE_EVENT_COMMITTEE'],
    },
    {
        to: '/equipment-rent',
        label: 'Equipment Rent',
        icon: ShoppingCart,
        allowedRoles: ['ROLE_CLUB_MEMBER', 'ROLE_GUEST'],
    },
    {
        to: '/event-management',
        label: 'Event Management',
        icon: CalendarCog,
        allowedRoles: ['ROLE_HIGH_COMMITTEE'],
    },
    {
        to: '/equipment-returns',
        label: 'Equipment Returns',
        icon: Undo2,
        allowedRoles: ['ROLE_EVENT_COMMITTEE', 'ROLE_CLUB_MEMBER', 'ROLE_GUEST'],
    },
    {
        to: '/reporting-dashboard',
        label: 'Reporting Dashboard',
        icon: BarChart3,
        allowedRoles: ['ROLE_EQUIPMENT_COMMITTEE', 'ROLE_HIGH_COMMITTEE'],
    },
]
