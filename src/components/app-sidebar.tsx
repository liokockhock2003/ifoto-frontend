import { NavLink, matchPath, useLocation } from 'react-router-dom'
import { Check, ChevronUp, LogOut, Settings, User2 } from 'lucide-react'
import { toast } from 'sonner'
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
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { menuItems } from '@/routerMenuItems'
import { useAuth } from '@/store/auth-context'
import { useSwitchActiveRole } from '@/store/queries/auth'

export function AppSidebar() {
    const { user, logout, hasRole, updateUserRoles } = useAuth()
    const location = useLocation()
    const switchRoleMutation = useSwitchActiveRole()
    const sidebarItems = menuItems.filter((item) => {
        if (!item.allowedRoles || item.allowedRoles.length === 0) {
            return true
        }

        return item.allowedRoles.some((role) => hasRole(role))
    })

    const roleSummary = user?.activeRole ?? 'No active role'
    const availableRoles = user?.roles ?? []

    async function handleSwitchRole(roleName: string) {
        if (!user || roleName === user.activeRole || switchRoleMutation.isPending) {
            return
        }

        try {
            const result = await switchRoleMutation.mutateAsync({
                username: user.username,
                roleName,
            })

            updateUserRoles(result.roles, result.activeRole)
            toast.success(`Active role switched to ${result.activeRole}`)
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to switch active role'
            toast.error(message)
        }
    }

    return (
        <Sidebar collapsible="icon" variant='floating' className='bg-background'>
            {/* ── Header: Logo ── */}
            <SidebarHeader className="transition-all group-data-[collapsible=icon]:px-2">
                <div className="flex items-center gap-3 rounded-xl py-2">
                    <div className="flex items-center justify-center text-primary-foreground shrink-0">
                        <img src="/kfk_logo_2.svg" alt="KFK logo" className="w-16 h-16 object-contain transition-all group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8" />
                    </div>
                    <span className="flex text-2xl font-bold tracking-tight text-primary group-data-[collapsible=icon]:hidden">IFoto</span>
                </div>
            </SidebarHeader>

            {/* ── Content: Nav group ── */}
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className='text-primary font-semibold mb-2'>Main Menu</SidebarGroupLabel>
                    <SidebarGroupContent className='pl-2 group-data-[collapsible=icon]:p-0'>
                        <SidebarMenu className='gap-2'>
                            {sidebarItems.length > 0 ? (
                                sidebarItems.map(({ to, label, icon: Icon }) => {
                                    const isActive = !!matchPath({ path: to, end: true }, location.pathname)

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
                                })
                            ) : (
                                <SidebarMenuItem>
                                    <div className="px-3 py-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                                        No menu available for your current role.
                                    </div>
                                </SidebarMenuItem>
                            )}
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
                                <SidebarMenuButton className="h-auto justify-start items-center p-2 transition-all group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:pl-1!" tooltip="Account">
                                    <div className="flex items-center justify-center rounded-full bg-muted group-data-[collapsible=icon]:p-0">
                                        <User2 />
                                    </div>
                                    <div className="flex flex-col text-left leading-none group-data-[collapsible=icon]:hidden">
                                        <span className="text-sm font-medium">{user?.fullName ?? user?.username}</span>
                                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                                        <span className="mt-1 line-clamp-1 text-[10px] text-muted-foreground/80">{roleSummary}</span>
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
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger inset>
                                        Switch role
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        {availableRoles.length > 0 ? (
                                            availableRoles.map((role) => {
                                                const isCurrent = user?.activeRole === role

                                                return (
                                                    <DropdownMenuItem
                                                        key={role}
                                                        onClick={() => handleSwitchRole(role)}
                                                        disabled={isCurrent || switchRoleMutation.isPending}
                                                    >
                                                        <Check className={isCurrent ? 'mr-2 size-4 opacity-100' : 'mr-2 size-4 opacity-0'} />
                                                        <span>{role}</span>
                                                    </DropdownMenuItem>
                                                )
                                            })
                                        ) : (
                                            <DropdownMenuItem disabled>
                                                No roles available
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
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
