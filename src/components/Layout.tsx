import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/sidebar'

export default function Layout() {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 p-6 bg-gray-100">
                <Outlet />   {/* ← child routes render here */}
            </main>
        </div>
    )
}