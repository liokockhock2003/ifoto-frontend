import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/auth-context';

interface Props {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
    const { isAuthenticated, isLoading, hasRole } = useAuth();

    // still restoring session — show spinner instead of blank/redirect flash
    if (isLoading) return (
        <div className="flex h-full items-center justify-center p-8">
            <span className="text-muted-foreground text-sm">Loading...</span>
        </div>
    );

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.some((role) => hasRole(role))) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}