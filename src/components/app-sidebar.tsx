import { NavLink, matchPath, useLocation } from 'react-router-dom'
import { LogOut, User2 } from 'lucide-react'
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
import { menuGroups } from '@/routerMenuItems'
import { useAuth } from '@/store/auth-context'

export function AppSidebar() {
    const { user, logout, hasRole } = useAuth()
    const location = useLocation()

    const visibleGroups = menuGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => {
                if (!item.allowedRoles || item.allowedRoles.length === 0) return true
                return item.allowedRoles.some((role) => hasRole(role))
            }),
        }))
        .filter((group) => group.items.length > 0)

    return (
        <Sidebar collapsible="icon" variant='floating' className='bg-background'>
            {/* ── Header: Logo ── */}
            <SidebarHeader className="transition-all group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-3 rounded-xl py-2">
                    <div className="flex items-center justify-center text-primary-foreground shrink-0">
                        <img src="/KFKLogo.svg" alt="KFK logo" className="w-16 h-16 object-contain transition-all group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8" />
                    </div>
                    <span className="flex text-2xl font-bold tracking-tight text-brand group-data-[collapsible=icon]:hidden">IFoto</span>
                </div>
            </SidebarHeader>

            {/* ── Content: Nav groups ── */}
            <SidebarContent>
                {visibleGroups.length > 0 ? (
                    visibleGroups.map((group) => (
                        <SidebarGroup key={group.label}>
                            <SidebarGroupLabel className='text-primary font-semibold mb-2'>
                                {group.label}
                            </SidebarGroupLabel>
                            <SidebarGroupContent className='pl-2 group-data-[collapsible=icon]:p-0'>
                                <SidebarMenu className='gap-2'>
                                    {group.items.map(({ to, label, icon: Icon, activePaths }) => {
                                        const isActive =
                                            !!matchPath({ path: to, end: true }, location.pathname) ||
                                            (activePaths?.some((p) => !!matchPath({ path: p, end: true }, location.pathname)) ?? false)

                                        return (
                                            <SidebarMenuItem key={to}>
                                                <SidebarMenuButton
                                                    asChild
                                                    tooltip={label}
                                                    isActive={isActive}
                                                    className={isActive
                                                        ? 'transition-all bg-muted text-primary hover:bg-muted hover:text-primary'
                                                        : 'transition-all text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground'}
                                                >
                                                    <NavLink
                                                        to={to}
                                                        end
                                                        className="flex items-center gap-4 rounded-lg"
                                                    >
                                                        <Icon size={18} />
                                                        <span>{label}</span>
                                                    </NavLink>
                                                </SidebarMenuButton>
                                            </SidebarMenuItem>
                                        )
                                    })}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))
                ) : (
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenuItem>
                                <div className="px-3 py-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                                    No menu available for your current role.
                                </div>
                            </SidebarMenuItem>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* ── Footer: Account ── */}
            <SidebarFooter className="px-2 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <div className="flex items-center gap-1">
                            <SidebarMenuButton className="h-auto justify-start items-center p-2 transition-all group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:pl-0!">
                                <div className="flex items-center justify-center rounded-full bg-muted overflow-hidden shrink-0 size-8 group-data-[collapsible=icon]:p-0">
                                    {user?.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.fullName ?? user.username} className="size-full object-cover" />
                                    ) : (
                                        <User2 className="size-4" />
                                    )}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col text-left leading-none group-data-[collapsible=icon]:hidden">
                                    <span className="truncate text-sm font-medium">{user?.fullName ?? user?.username}</span>
                                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                                </div>
                            </SidebarMenuButton>
                            <button
                                onClick={() => logout()}
                                className="shrink-0 p-2.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors group-data-[collapsible=icon]:hidden"
                            >
                                <LogOut className="size-4" />
                            </button>
                        </div>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}
