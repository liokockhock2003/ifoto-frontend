import { NavLink } from 'react-router-dom'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/mode-toggle'
import { menuItems } from '@/routerMenuItems'

export function AppSidebar() {
    return (
        <Sidebar>
            {/* Header */}
            <SidebarHeader className="px-4 py-6">
                <h1 className="text-xl font-bold">iFoto</h1>
            </SidebarHeader>

            {/* Nav links */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map(({ to, label, icon: Icon }) => (
                                <SidebarMenuItem key={to}>
                                    <SidebarMenuButton asChild>
                                        <NavLink
                                            to={to}
                                            end
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 transition-colors ${isActive
                                                    ? 'text-blue-600 font-semibold'
                                                    : 'text-muted-foreground hover:text-foreground'
                                                }`
                                            }
                                        >
                                            <Icon size={18} />
                                            <span>{label}</span>
                                        </NavLink>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            {/* Footer with theme toggle */}
            <SidebarFooter className="px-4 py-4">
                <div className="flex items-center gap-3">
                    <ModeToggle />
                    <span className="text-sm text-muted-foreground">Toggle theme</span>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}