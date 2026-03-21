import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/protected-route'
import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'
import UserManagementMainPage from '@/pages/UserManagement/main-page'

const ComingSoon = ({ title }: { title: string }) => (
    <div className="p-8 text-2xl font-semibold">{title} — Coming Soon</div>
)

export const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <ProtectedRoute><ComingSoon title="Home" /></ProtectedRoute>,
            },
            {
                path: 'manage-equipment',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE"]}>
                        <ComingSoon title="Manage Equipment" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'user-management',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_ADMIN"]}>
                        <UserManagementMainPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'equipment-requests',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EVENT_COMMITTEE"]}>
                        <ComingSoon title="Equipment Requests" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'equipment-rent',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_CLUB_MEMBER", "ROLE_GUEST"]}>
                        <ComingSoon title="Equipment Rent" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'event-management',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_HIGH_COMMITTEE"]}>
                        <ComingSoon title="Event Management" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'equipment-returns',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EVENT_COMMITTEE", "ROLE_CLUB_MEMBER", "ROLE_GUEST"]}>
                        <ComingSoon title="Equipment Returns" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'reporting-dashboard',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE", "ROLE_HIGH_COMMITTEE"]}>
                        <ComingSoon title="Reporting Dashboard" />
                    </ProtectedRoute>
                ),
            },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
])