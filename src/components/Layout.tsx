import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

export default function Layout() {
    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 p-6 ">
                <SidebarTrigger />   {/* ← collapse/expand button */}
                <Outlet />
            </main>
        </SidebarProvider>
    )
}