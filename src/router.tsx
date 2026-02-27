import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/Layout'
import App from '@/pages/App'
import LoginPage from '@/pages/login'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,        // ← sidebar wraps all child routes
        children: [
            { index: true, element: <App /> },
            { path: 'login', element: <LoginPage /> },
        ],
    },
])