import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'
import App from '@/pages/App'
import LoginPage from '@/pages/login'

// Dummy placeholder page
const ComingSoon = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground bg-background">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        <p>This page is coming soon.</p>
    </div>
)

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            { index: true, element: <App /> },
            { path: 'login', element: <LoginPage /> },
            { path: 'rent-equipment', element: <ComingSoon title="Rent Equipment" /> },
            { path: 'manage-equipment', element: <ComingSoon title="Manage Equipment" /> },
            { path: 'equipment-requests', element: <ComingSoon title="Equipment Requests" /> },
            { path: 'equipment-returns', element: <ComingSoon title="Equipment Returns" /> },
            { path: 'orders', element: <ComingSoon title="Orders" /> },
        ],
    },
])