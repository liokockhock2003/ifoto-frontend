import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/protected-route'
import LoginPage from '@/pages/Auth/login'
import RegisterPage from '@/pages/Auth/register'
import ForgotPasswordPage from '@/pages/Auth/forgot-password'
import ResetPasswordPage from '@/pages/Auth/reset-password'
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
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
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
                    <ProtectedRoute>
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
                    <ProtectedRoute>
                        <ComingSoon title="Return Rented Equipment" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'equipment-request-returns',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EVENT_COMMITTEE"]}>
                        <ComingSoon title="Return Requested Equipment" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'equipment-booking-management',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE", "ROLE_HIGH_COMMITTEE"]}>
                        <ComingSoon title="Equipment Booking Management" />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'equipment-return-management',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE"]}>
                        <ComingSoon title="Equipment Return Management" />
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