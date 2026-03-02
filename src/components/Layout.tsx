import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { ModeToggle } from '@/components/mode-toggle'

export default function Layout() {
    return (
        <SidebarProvider  >
            <AppSidebar />
            <main className="flex-1 p-0 bg-background">
                <header className="flex items-center justify-between px-2 py-1">
                    <SidebarTrigger className='rounded-xl p-4' />
                    <ModeToggle />
                </header>
                <Outlet />
            </main>
        </SidebarProvider>
    )
}