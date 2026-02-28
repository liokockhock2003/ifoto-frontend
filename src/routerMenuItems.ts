import { Home, LogIn } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
    to: string
    label: string
    icon: LucideIcon
}

export const menuItems: MenuItem[] = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/login', label: 'Login', icon: LogIn },
    { to: '/gallery', label: 'Gallery', icon: LogIn },
]