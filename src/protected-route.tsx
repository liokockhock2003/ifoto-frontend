import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/auth-context';

interface Props {
    children: React.ReactNode;
    requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();

    // still restoring session — show spinner instead of blank/redirect flash
    if (isLoading) return (
        <div className="flex h-full items-center justify-center p-8">
            <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
    );

    // not logged in → login page
    if (!isAuthenticated) return <Navigate to="/login" replace />;

    // logged in but missing required role → home
    if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/" replace />;

    return <>{children}</>;
}