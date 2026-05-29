import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import AuthLayout from '@/pages/Auth/layout'
import ProtectedRoute from '@/protected-route'
import { useAuth } from '@/store/auth-context'
import LoginPage from '@/pages/Auth/login'
import RegisterPage from '@/pages/Auth/register'
import ForgotPasswordPage from '@/pages/Auth/forgot-password'
import ResetPasswordPage from '@/pages/Auth/reset-password'
import VerifyEmailPage from '@/pages/Auth/verify-email'
import UserManagementMainPage from '@/pages/UserManagement/main-page'
import InventoryManagementMainPage from '@/pages/InventoryManagement/main-page'
import EventManagementMainPage from '@/pages/EventManagement/main-page'
import RentalPricingMainPage from '@/pages/RentalPricing/main-page'
import EquipmentRentalMainPage from '@/pages/MyRentalList/EquipmentRental/main-page'
import RentalListPage from '@/pages/MyRentalList/main-page'
import RentalManagementMainPage from '@/pages/RentalManagement/main-page'
import EventEquipmentMainPage from '@/pages/EventEquipment/main-page'
import ReportingDashboardMainPage from '@/pages/ReportingDashboard/main-page'
import EquipmentRequestListMainPage from '@/pages/EventManagement/EquipmentRequestList/main-page'
import EquipmentRequestMainPage from '@/pages/EventManagement/EquipmentRequestList/EquipmentRequest/main-page'

function RoleRedirect() {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    if (isLoading) return (
        <div className="flex h-full items-center justify-center p-8">
            <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
    );
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (hasRole('ROLE_ADMIN')) return <Navigate to="/user-management" replace />;
    if (hasRole('ROLE_EQUIPMENT_COMMITTEE')) return <Navigate to="/manage-inventory" replace />;
    if (hasRole('ROLE_HIGH_COMMITTEE')) return <Navigate to="/event-management" replace />;
    if (hasRole('ROLE_EVENT_COMMITTEE')) return <Navigate to="/equipment-requests" replace />;
    return <Navigate to="/equipment-rent" replace />;
}

export const router = createBrowserRouter([
    {
        element: <AuthLayout />,
        children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
    },
    {
        path: '/verify-email',
        element: <VerifyEmailPage />,
    },
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                index: true,
                element: <RoleRedirect />,
            },
            {
                path: 'manage-inventory',
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE"]}>
                                <InventoryManagementMainPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'rental-pricing',
                        element: (
                            <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE"]}>
                                <RentalPricingMainPage />
                            </ProtectedRoute>
                        ),
                    },
                ],
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
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute allowedRoles={["ROLE_EVENT_COMMITTEE"]}>
                                <EventManagementMainPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: ':eventId',
                        children: [
                            {
                                index: true,
                                element: (
                                    <ProtectedRoute allowedRoles={["ROLE_EVENT_COMMITTEE"]}>
                                        <EquipmentRequestListMainPage />
                                    </ProtectedRoute>
                                ),
                            },
                            {
                                path: 'new',
                                element: (
                                    <ProtectedRoute allowedRoles={["ROLE_EVENT_COMMITTEE"]}>
                                        <EquipmentRequestMainPage />
                                    </ProtectedRoute>
                                ),
                            },
                        ],
                    },
                ],
            },
            {
                path: 'equipment-rent',
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute allowedRoles={["ROLE_STUDENT", "ROLE_NON_STUDENT"]}>
                                <RentalListPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'new',
                        element: (
                            <ProtectedRoute allowedRoles={["ROLE_STUDENT", "ROLE_NON_STUDENT"]}>
                                <EquipmentRentalMainPage />
                            </ProtectedRoute>
                        ),
                    },
                ],
            },
            {
                path: 'event-management',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_HIGH_COMMITTEE"]}>
                        <EventManagementMainPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'rental-management',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE"]}>
                        <RentalManagementMainPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'event-equipment',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE"]}>
                        <EventEquipmentMainPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'reporting-dashboard',
                element: (
                    <ProtectedRoute allowedRoles={["ROLE_EQUIPMENT_COMMITTEE", "ROLE_HIGH_COMMITTEE"]}>
                        <ReportingDashboardMainPage />
                    </ProtectedRoute>
                ),
            },
            { path: '*', element: <Navigate to="/" replace /> },
        ],
    },
])