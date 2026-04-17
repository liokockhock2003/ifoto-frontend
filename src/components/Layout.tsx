import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppBreadcrumb } from '@/components/app-breadcrumb'
import { ModeToggle } from '@/components/mode-toggle'
import { AuthProvider } from '@/store/auth-context'

export default function Layout() {
    return (
        <AuthProvider>                          {/* ← must wrap AppSidebar + Outlet */}
            <SidebarProvider>
                <AppSidebar />                  {/* ← can now call useAuth() */}
                <SidebarInset>
                    <header className="flex items-center justify-between px-4 py-2 border-b">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className='text-muted-foreground' />
                            <AppBreadcrumb />
                        </div>
                        <ModeToggle />
                    </header>
                    <main className="flex-1 p-6">
                        <Outlet />              {/* ← ProtectedRoute can call useAuth() */}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>
    )
}