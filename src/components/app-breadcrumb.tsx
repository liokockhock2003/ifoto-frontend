import { Link, useLocation } from 'react-router-dom';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { HIDDEN_SEGMENTS, SEGMENT_LABELS } from '@/breadcrumbs';

export function AppBreadcrumb() {
    const { pathname, state } = useLocation();
    const segments = pathname.split('/').filter(Boolean);
    const s = state as { breadcrumbLabel?: string; breadcrumbLabels?: Record<string, string> } | null;
    const breadcrumbLabel = s?.breadcrumbLabel;
    const breadcrumbLabels = s?.breadcrumbLabels ?? {};

    if (segments.length === 0) return null;

    // The last URL segment is always the active page; everything before it is a link.
    const lastIndex = segments.length - 1;

    // Resolve each segment to its href/label, then drop segments with no landing
    // page of their own so they don't appear as dead links in the trail.
    const crumbs = segments
        .map((segment, index) => ({
            segment,
            href: '/' + segments.slice(0, index + 1).join('/'),
            isLast: index === lastIndex,
            label: (index === lastIndex && breadcrumbLabel)
                ? breadcrumbLabel
                : (breadcrumbLabels[segment] ?? SEGMENT_LABELS[segment] ?? segment),
        }))
        .filter((c) => c.isLast || !HIDDEN_SEGMENTS.has(c.segment));

    return (
        <Breadcrumb className='pl-6 text-muted-foreground'>
            <BreadcrumbList>
                {crumbs.map(({ href, isLast, label }, index) => (
                    <li key={href} className="inline-flex items-center gap-1.5 text-xs italic">
                        {index > 0 && <BreadcrumbSeparator />}
                        <BreadcrumbItem>
                            {isLast ? (
                                <BreadcrumbPage>
                                    {label}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link to={href} state={{ breadcrumbLabel: label }}>{label}</Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </li>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
