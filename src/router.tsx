import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/protected-route'
import LoginPage from '@/pages/login'

const ComingSoon = ({ title }: { title: string }) => (
    <div className="p-8 text-2xl font-semibold">{title} — Coming Soon</div>
)

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,             // ← outside Layout, no AuthProvider needed
    },
    {
        path: '/',
        element: <Layout />,               // ← AuthProvider lives here
        children: [
            {
                index: true,
                element: <ProtectedRoute><ComingSoon title="Home" /></ProtectedRoute>,
            },
            {
                path: 'rent-equipment',
                element: <ProtectedRoute><ComingSoon title="Rent Equipment" /></ProtectedRoute>,
            },
            {
                path: 'manage-equipment',
                element: (
                    <ProtectedRoute requiredRole="ROLE_ADMIN">
                        <ComingSoon title="Manage Equipment" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'equipment-requests',
                element: <ProtectedRoute><ComingSoon title="Equipment Requests" /></ProtectedRoute>,
            },
            {
                path: 'equipment-returns',
                element: <ProtectedRoute><ComingSoon title="Equipment Returns" /></ProtectedRoute>,
            },
            {
                path: 'orders',
                element: <ProtectedRoute><ComingSoon title="Orders" /></ProtectedRoute>,
            },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
])