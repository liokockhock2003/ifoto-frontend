import { NavLink } from 'react-router-dom'
import { Camera, ChevronUp, User2, Settings, LogOut } from 'lucide-react'
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { menuItems } from '@/routerMenuItems'
import { useAuth } from '@/store/auth-context'

export function AppSidebar() {
    const { user, logout } = useAuth()
    return (
        <Sidebar collapsible="icon" variant='floating' className='bg-background'>
            {/* ── Header: Logo ── */}
            <SidebarHeader className="px-4 py-5 transition-all group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground shrink-0">
                        <Camera size={16} />
                    </div>
                    <span className="flex text-lg font-bold tracking-tight group-data-[collapsible=icon]:hidden">iFoto</span>
                </div>
            </SidebarHeader>

            {/* ── Content: Nav group ── */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map(({ to, label, icon: Icon }) => (
                                <SidebarMenuItem key={to}>
                                    <SidebarMenuButton asChild tooltip={label}>
                                        <NavLink
                                            to={to}
                                            end
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 transition-colors ${isActive
                                                    ? 'text-primary font-semibold'
                                                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
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

            {/* ── Footer: Account ── */}
            <SidebarFooter className="px-2 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="justify-start items-center p-2 transition-all group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:pl-1!" tooltip="Account">
                                    <div className="flex items-center justify-center rounded-full bg-muted group-data-[collapsible=icon]:p-0">
                                        <User2 />
                                    </div>
                                    <div className="flex flex-col text-left leading-none group-data-[collapsible=icon]:hidden">
                                        <span className="text-sm font-medium">{user?.fullName ?? user?.username}</span>
                                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="top" align="start" className="w-56">
                                <DropdownMenuItem>
                                    <User2 className="mr-2 size-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 size-4" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => logout()}
                                >
                                    <LogOut className="mr-2 size-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
