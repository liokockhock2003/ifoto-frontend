import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { AppBreadcrumb } from '@/components/app-breadcrumb'
import { ModeToggle } from '@/components/mode-toggle'
import { AuthProvider } from '@/store/auth-context'
import { BankDetailsPrompt } from '@/pages/CommitteeBankDetails/bank-details-prompt'

export default function Layout() {
    return (
        <AuthProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex items-center justify-between px-4 py-2">
                        <div className="flex items-center gap-3">
                            <SidebarTrigger className='text-muted-foreground' />

                        </div>
                        <ModeToggle />
                    </header>
                    <main className="flex-1 p-2 sm:p-6">
                        <AppBreadcrumb />
                        <Outlet />
                        <BankDetailsPrompt />
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </AuthProvider>
    )
}