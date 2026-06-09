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
    const { pathname, state } = useLocation();
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbLabel = (state as { breadcrumbLabel?: string } | null)?.breadcrumbLabel;

    if (segments.length === 0) return null;

    return (
        <Breadcrumb className='pl-6 text-muted-foreground'>
            <BreadcrumbList>
                {segments.map((segment, index) => {
                    const href   = '/' + segments.slice(0, index + 1).join('/');
                    const isLast = index === segments.length - 1;
                    const label  = (isLast && breadcrumbLabel) ? breadcrumbLabel : (SEGMENT_LABELS[segment] ?? segment);

                    return (
                        <li key={href} className="inline-flex items-center gap-1.5 text-xs italic">
                            {index > 0 && <BreadcrumbSeparator />}
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>
                                        {label}
                                    </BreadcrumbPage>
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
