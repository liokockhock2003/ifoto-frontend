import { Camera, Package, ClipboardList, Undo2, ShoppingCart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
    to: string
    label: string
    icon: LucideIcon
}

export const menuItems: MenuItem[] = [
    { to: '/rent-equipment',     label: 'Rent Equipment',     icon: Camera        },
    { to: '/manage-equipment',   label: 'Manage Equipment',   icon: Package       },
    { to: '/equipment-requests', label: 'Equipment Requests', icon: ClipboardList },
    { to: '/equipment-returns',  label: 'Equipment Returns',  icon: Undo2         },
    { to: '/orders',             label: 'Orders',             icon: ShoppingCart  },
]
