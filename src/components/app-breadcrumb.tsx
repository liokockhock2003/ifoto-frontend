import { Link, useLocation } from 'react-router-dom';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SEGMENT_LABELS } from '@/breadcrumbs';

export function AppBreadcrumb() {
    const { pathname } = useLocation();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    const href  = '/' + segments.slice(0, index + 1).join('/');
                    const label = SEGMENT_LABELS[segment] ?? segment;
                    const isLast = index === segments.length - 1;

                    return (
                        <li key={href} className="inline-flex items-center gap-1.5">
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild>
                                        <Link to={href}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </li>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
