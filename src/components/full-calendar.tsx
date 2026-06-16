import { useMemo, useState, type ReactNode } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventInput, EventClickArg, DateSelectArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import type { EventResizeDoneArg, DateClickArg } from '@fullcalendar/interaction';
import { parseISO, format, addDays, subDays, set } from 'date-fns';
import { CalendarDays, Clock, Package, User } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge, type BadgeProps } from '@/components/reui/badge';
import type { Rental, RentalStatus } from '@/store/schemas/rental';
import type { EquipmentRequest, RequestStatus } from '@/store/schemas/request';
import { RENTAL_STATUS_LABEL, RENTAL_STATUS_BADGE } from '@/constants/rentalStatus';
import { REQUEST_STATUS_LABEL, REQUEST_STATUS_BADGE } from '@/constants/requestStatus';

// ── Public types ──────────────────────────────────────────────────────────────

export type ScheduleEntry = {
    id: number | string;
    title: string;
    start: string;        // YYYY-MM-DDTHH:mm(:ss) — carries a time component
    end: string;
    // Event colours go through FullCalendar's inline-style props (not classNames):
    // FC's own event CSS is unlayered and would override any Tailwind/badge class.
    // Pass CSS-var tokens (e.g. var(--badge-warning-bg)) so they track light/dark.
    backgroundColor?: string;
    textColor?: string;
    borderColor?: string;
    // Optional rich hover-card content shown when hovering the entry chip.
    detail?: ReactNode;
};

export type ScheduleCalendarProps = {
    entries: ScheduleEntry[];
    rentals?: Rental[];
    requests?: EquipmentRequest[];
    onSelectRange: (startDatetime: string, endDatetime: string) => void;
    onEntryClick: (id: number) => void;
    onEntryDatesChange: (id: number, startDatetime: string, endDatetime: string) => void;
    // Optional: make rental events clickable (e.g. the rental-logistics workspace).
    onRentalClick?: (rentalId: number) => void;
    // Optional: emphasize the currently-selected rental event.
    selectedRentalId?: number;
    // Optional: make request events clickable (e.g. the event-equipment logistics workspace).
    onRequestClick?: (requestId: number) => void;
    // Optional: emphasize the currently-selected request event.
    selectedRequestId?: number;
    // Optional: read-only schedule events (equipment statuses / quantity holds) overlaid
    // for the selected rental/request. Non-interactive — no drag, no click handler.
    scheduleOverlay?: ScheduleEntry[];
};

// ── Date helpers ──────────────────────────────────────────────────────────────

const DATE = 'yyyy-MM-dd';
const DATETIME = "yyyy-MM-dd'T'HH:mm";

// FullCalendar all-day `end` is exclusive — render one day past the inclusive end.
function displayEnd(endISO: string): string {
    return format(addDays(parseISO(endISO), 1), DATE);
}

// Read-only rentals/requests: when a logistics window (pickup/return datetimes)
// exists, render a *timed* event so Week view positions it by time-of-day and
// Month view shows the time; otherwise fall back to an all-day span over the
// program/event period (date-only, exclusive end).
function eventSpan(
    pickup: string | null | undefined,
    ret: string | null | undefined,
    fallbackStart: string,
    fallbackEnd: string,
): Pick<EventInput, 'start' | 'end' | 'allDay'> {
    if (pickup && ret) return { start: pickup, end: ret, allDay: false };
    return { start: format(parseISO(fallbackStart), DATE), end: displayEnd(fallbackEnd), allDay: true };
}

// Merge a calendar-picked date (midnight) with the original entry's time-of-day,
// so a month-grid drag/resize never clobbers the stored pickup/return times.
function mergeDateTime(calendarDate: Date, originalISO: string): string {
    const o = parseISO(originalISO);
    return format(
        set(calendarDate, { hours: o.getHours(), minutes: o.getMinutes(), seconds: 0, milliseconds: 0 }),
        DATETIME,
    );
}

function fmtDay(iso: string): string {
    return format(parseISO(iso), 'd MMM yyyy');
}

function fmtDateTime(iso: string): string {
    return format(parseISO(iso), 'd MMM yyyy, h:mm a');
}

// Reuse the rental-status badge tokens (badge-success/…) as reui Badge semantic variants.
const RENTAL_BADGE_VARIANT: Record<string, BadgeProps['variant']> = {
    'badge-success': 'success-light',
    'badge-warning': 'warning-light',
    'badge-info': 'info-light',
    'badge-danger': 'destructive-light',
};

function rentalBadgeVariant(status: RentalStatus): BadgeProps['variant'] {
    return RENTAL_BADGE_VARIANT[RENTAL_STATUS_BADGE[status]] ?? 'secondary';
}

function requestBadgeVariant(status: RequestStatus): BadgeProps['variant'] {
    return RENTAL_BADGE_VARIANT[REQUEST_STATUS_BADGE[status]] ?? 'secondary';
}

// ── Rental hover-card detail ──────────────────────────────────────────────────

function RentalDetails({ rental }: { rental: Rental }) {
    const subItems = rental.subItems ?? [];
    return (
        <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{rental.rentalNumber}</span>
                <Badge variant={rentalBadgeVariant(rental.status)} size="sm">
                    {RENTAL_STATUS_LABEL[rental.status]}
                </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{rental.renterUsername}</span>
            </div>

            <div className="flex items-start gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                    {fmtDay(rental.programStartDate)} – {fmtDay(rental.programEndDate)}
                    {rental.durationDays != null &&
                        ` · ${rental.durationDays} day${rental.durationDays !== 1 ? 's' : ''}`}
                </span>
            </div>

            {(rental.pickupDatetime ?? rental.returnDatetime) && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>
                        {rental.pickupDatetime ? `Pickup ${fmtDateTime(rental.pickupDatetime)}` : ''}
                        {rental.pickupDatetime && rental.returnDatetime ? ' · ' : ''}
                        {rental.returnDatetime ? `Return ${fmtDateTime(rental.returnDatetime)}` : ''}
                    </span>
                </div>
            )}

            {rental.items.length > 0 && (
                <div className="space-y-0.5">
                    <p className="flex items-center gap-1 font-medium text-foreground uppercase tracking-wide text-[10px]">
                        <Package className="h-3 w-3" /> Equipment
                    </p>
                    {rental.items.map((it) => (
                        <p key={it.id} className="text-muted-foreground">
                            {it.brand} {it.model}
                            {it.serialNumber ? ` · S/N ${it.serialNumber}` : ''}
                        </p>
                    ))}
                </div>
            )}

            {subItems.length > 0 && (
                <div className="space-y-0.5">
                    <p className="font-medium text-foreground uppercase tracking-wide text-[10px]">Accessories</p>
                    {subItems.map((s) => (
                        <p key={s.id} className="text-muted-foreground">
                            {s.equipmentType}
                            {s.brand ? ` — ${s.brand}` : ''} × {s.borrowedQuantity}
                        </p>
                    ))}
                </div>
            )}

            {rental.renterNotes && (
                <div className="rounded-md bg-muted/50 px-2.5 py-2">
                    <p className="font-medium text-foreground uppercase tracking-wide text-[10px] mb-0.5">
                        Renter Notes
                    </p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{rental.renterNotes}</p>
                </div>
            )}

            <div className="flex items-center justify-between border-t pt-2">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold text-foreground">RM {(rental.totalAmount / 100).toFixed(2)}</span>
            </div>
        </div>
    );
}

function RequestDetails({ request }: { request: EquipmentRequest }) {
    const subItems = request.subItems ?? [];
    return (
        <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{request.requestNumber}</span>
                <Badge variant={requestBadgeVariant(request.status)} size="sm">
                    {REQUEST_STATUS_LABEL[request.status]}
                </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="h-3 w-3 shrink-0" />
                <span className="truncate">{request.eventName}</span>
            </div>

            <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{request.requestedByUsername}</span>
            </div>

            <div className="flex items-start gap-1.5 text-muted-foreground">
                <CalendarDays className="h-3 w-3 mt-0.5 shrink-0" />
                <span>
                    {fmtDay(request.startDatetime)} – {fmtDay(request.endDatetime)}
                    {request.durationDays != null &&
                        ` · ${request.durationDays} day${request.durationDays !== 1 ? 's' : ''}`}
                </span>
            </div>

            {(request.pickupDatetime ?? request.returnDatetime) && (
                <div className="flex items-start gap-1.5 text-muted-foreground">
                    <Clock className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>
                        {request.pickupDatetime ? `Pickup ${fmtDateTime(request.pickupDatetime)}` : ''}
                        {request.pickupDatetime && request.returnDatetime ? ' · ' : ''}
                        {request.returnDatetime ? `Return ${fmtDateTime(request.returnDatetime)}` : ''}
                    </span>
                </div>
            )}

            {request.items.length > 0 && (
                <div className="space-y-0.5">
                    <p className="flex items-center gap-1 font-medium text-foreground uppercase tracking-wide text-[10px]">
                        <Package className="h-3 w-3" /> Equipment
                    </p>
                    {request.items.map((it) => (
                        <p key={it.id} className="text-muted-foreground">
                            {it.brand} {it.model}
                            {it.serialNumber ? ` · S/N ${it.serialNumber}` : ''}
                        </p>
                    ))}
                </div>
            )}

            {subItems.length > 0 && (
                <div className="space-y-0.5">
                    <p className="font-medium text-foreground uppercase tracking-wide text-[10px]">Accessories</p>
                    {subItems.map((s) => (
                        <p key={s.id} className="text-muted-foreground">
                            {s.equipmentType}
                            {s.brand ? ` — ${s.brand}` : ''}
                            {s.borrowedQuantity != null ? ` × ${s.borrowedQuantity}` : ''}
                        </p>
                    ))}
                </div>
            )}

            {request.requesterNotes && (
                <div className="rounded-md bg-muted/50 px-2.5 py-2">
                    <p className="font-medium text-foreground uppercase tracking-wide text-[10px] mb-0.5">
                        Requester Notes
                    </p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{request.requesterNotes}</p>
                </div>
            )}
        </div>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ScheduleCalendar({
    entries,
    rentals,
    requests,
    onSelectRange,
    onEntryClick,
    onEntryDatesChange,
    onRentalClick,
    selectedRentalId,
    onRequestClick,
    selectedRequestId,
    scheduleOverlay,
}: ScheduleCalendarProps) {
    const entryById = useMemo(() => new Map(entries.map((e) => [e.id, e])), [entries]);
    const isMobile = useIsMobile();

    // On mobile, tapping an event opens this bottom sheet (hover cards don't work on touch).
    const [detailEvent, setDetailEvent] = useState<{
        title: string;
        content: ReactNode;
        action?: { label: string; run: () => void };
    } | null>(null);

    // Build the rich detail node for an event (shared by the desktop hover card and the mobile sheet).
    function detailContentFor(props: { kind?: string; rental?: Rental; request?: EquipmentRequest; detail?: ReactNode }): ReactNode {
        const { kind, rental, request, detail } = props;
        if (kind === 'rental' && rental) return <RentalDetails rental={rental} />;
        if (kind === 'request' && request) return <RequestDetails request={request} />;
        if ((kind === 'entry' || kind === 'overlay') && detail) return detail;
        return null;
    }

    function detailTitleFor(props: { kind?: string; rental?: Rental; request?: EquipmentRequest }): string {
        const { kind, rental, request } = props;
        if (kind === 'rental' && rental) return rental.rentalNumber;
        if (kind === 'request' && request) return request.requestNumber;
        return 'Details';
    }

    // Custom event rendering: rental/request/entry/overlay chips reveal full detail on hover.
    function renderEventContent(arg: EventContentArg) {
        // Hover cards are pointer-hover only and would swallow taps on touch — on mobile
        // render the plain chip so taps reach FullCalendar's eventClick (details open in a sheet).
        if (isMobile) return <div className="w-full truncate px-1">{arg.event.title}</div>;

        const props = arg.event.extendedProps as {
            kind?: string;
            rental?: Rental;
            request?: EquipmentRequest;
            detail?: ReactNode;
        };
        const chip = <div className="w-full truncate px-1 cursor-pointer">{arg.event.title}</div>;

        const content = detailContentFor(props);
        if (!content) return <div className="w-full truncate px-1">{arg.event.title}</div>;

        return (
            <HoverCard openDelay={120} closeDelay={60}>
                <HoverCardTrigger asChild>{chip}</HoverCardTrigger>
                <HoverCardContent align="start" className="w-80">
                    {content}
                </HoverCardContent>
            </HoverCard>
        );
    }

    const events = useMemo<EventInput[]>(() => {
        const evs: EventInput[] = entries.map((e) => ({
            id: `e-${e.id}`,
            title: e.title,
            // Entries (statuses / holds) carry start+end datetimes — render timed so
            // Week view positions them by time-of-day and Month view shows the time.
            start: e.start,
            end: e.end,
            allDay: false,
            backgroundColor: e.backgroundColor,
            borderColor: e.borderColor ?? e.backgroundColor,
            textColor: e.textColor,
            classNames: ['cursor-pointer'],
            extendedProps: { kind: 'entry', entryId: e.id, detail: e.detail },
        }));

        for (const r of rentals ?? []) {
            if (r.status === 'CANCELLED' || r.status === 'REJECTED') continue;
            const isSelected = selectedRentalId === r.id;
            const pending = r.status === 'PENDING_REVIEW';
            evs.push({
                id: `r-${r.id}`,
                title: `${r.renterUsername} · ${RENTAL_STATUS_LABEL[r.status]}`,
                ...eventSpan(r.pickupDatetime, r.returnDatetime, r.programStartDate, r.programEndDate),
                editable: false,
                backgroundColor: pending ? 'var(--badge-warning-bg)' : 'var(--badge-success-bg)',
                borderColor: isSelected ? 'var(--primary)' : 'transparent',
                textColor: pending ? 'var(--badge-warning-fg)' : 'var(--badge-success-fg)',
                classNames: isSelected ? ['cursor-pointer', 'ring-2', 'ring-primary'] : ['cursor-pointer'],
                extendedProps: { kind: 'rental', rental: r },
            });
        }

        for (const req of requests ?? []) {
            if (req.status === 'CANCELLED' || req.status === 'REJECTED') continue;
            const isSelected = selectedRequestId === req.id;
            const pending = req.status === 'PENDING_REVIEW';
            evs.push({
                id: `req-${req.id}`,
                title: `${req.eventName} · ${REQUEST_STATUS_LABEL[req.status]}`,
                ...eventSpan(req.pickupDatetime, req.returnDatetime, req.startDatetime, req.endDatetime),
                editable: false,
                backgroundColor: pending ? 'var(--badge-warning-bg)' : 'var(--badge-info-bg)',
                borderColor: isSelected ? 'var(--primary)' : 'transparent',
                textColor: pending ? 'var(--badge-warning-fg)' : 'var(--badge-info-fg)',
                classNames: isSelected ? ['cursor-pointer', 'ring-2', 'ring-primary'] : ['cursor-pointer'],
                extendedProps: { kind: 'request', request: req },
            });
        }

        // Read-only overlay: the selected rental/request's equipment statuses + holds.
        for (const ov of scheduleOverlay ?? []) {
            evs.push({
                id: `ov-${ov.id}`,
                title: ov.title,
                start: ov.start,
                end: ov.end,
                allDay: false,
                editable: false,
                backgroundColor: ov.backgroundColor,
                borderColor: ov.borderColor ?? 'transparent',
                textColor: ov.textColor,
                classNames: ['cursor-default'],
                extendedProps: { kind: 'overlay', detail: ov.detail },
            });
        }

        return evs;
    }, [entries, rentals, requests, selectedRentalId, selectedRequestId, scheduleOverlay]);

    function handleSelect(arg: DateSelectArg) {
        if (arg.allDay) {
            // Month / all-day-row select: arg.end is exclusive — default a full-day window.
            const start = format(arg.start, DATE) + 'T00:00';
            const end = format(subDays(arg.end, 1), DATE) + 'T23:59';
            onSelectRange(start, end);
        } else {
            // Week timed select: use the exact picked datetimes.
            onSelectRange(format(arg.start, DATETIME), format(arg.end, DATETIME));
        }
        arg.view.calendar.unselect();
    }

    // Touch devices can't reliably drag-select a range, so a single tap on a day
    // opens the add flow for that day (mouse users keep using drag-select).
    function handleDateClick(arg: DateClickArg) {
        if (!isMobile) return;
        if (arg.allDay) {
            onSelectRange(format(arg.date, DATE) + 'T00:00', format(arg.date, DATE) + 'T23:59');
        } else {
            onSelectRange(format(arg.date, DATETIME), format(arg.date, DATETIME));
        }
    }

    function handleEventClick(arg: EventClickArg) {
        const props = arg.event.extendedProps as {
            kind: string;
            entryId?: number;
            detail?: ReactNode;
            rental?: Rental;
            request?: EquipmentRequest;
        };
        const { kind, entryId, rental, request } = props;

        // Mobile: no hover, so a tap opens a detail sheet (with the relevant action inside)
        // instead of firing the action directly.
        if (isMobile) {
            let action: { label: string; run: () => void } | undefined;
            if (kind === 'entry' && entryId != null) action = { label: 'Edit / delete', run: () => onEntryClick(entryId) };
            else if (kind === 'rental' && rental && onRentalClick) action = { label: 'Select rental', run: () => onRentalClick(rental.id) };
            else if (kind === 'request' && request && onRequestClick) action = { label: 'Select request', run: () => onRequestClick(request.id) };

            setDetailEvent({ title: detailTitleFor(props), content: detailContentFor(props), action });
            return;
        }

        if (kind === 'entry' && entryId != null) onEntryClick(entryId);
        // Rentals/requests are clickable only when a handler is supplied (logistics workspace);
        // elsewhere their details surface on hover (see renderEventContent).
        else if (kind === 'rental' && rental && onRentalClick) onRentalClick(rental.id);
        else if (kind === 'request' && request && onRequestClick) onRequestClick(request.id);
    }

    function handleDatesChange(arg: EventDropArg | EventResizeDoneArg) {
        const { kind, entryId } = arg.event.extendedProps as { kind: string; entryId?: number };
        if (kind !== 'entry' || entryId == null || !arg.event.start) {
            arg.revert();
            return;
        }
        if (arg.event.allDay) {
            // All-day path: end is exclusive; preserve the entry's original time-of-day.
            const original = entryById.get(entryId);
            if (!original) {
                arg.revert();
                return;
            }
            const endExclusive = arg.event.end ?? addDays(arg.event.start, 1);
            onEntryDatesChange(
                entryId,
                mergeDateTime(arg.event.start, original.start),
                mergeDateTime(subDays(endExclusive, 1), original.end),
            );
            return;
        }
        // Timed path: drag/resize yields exact datetimes.
        const end = arg.event.end ?? arg.event.start;
        onEntryDatesChange(entryId, format(arg.event.start, DATETIME), format(end, DATETIME));
    }

    return (
        <>
            <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                headerToolbar={
                    isMobile
                        ? { left: 'prev,next', center: 'title', right: 'today' }
                        : { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek' }
                }
                footerToolbar={isMobile ? { center: 'dayGridMonth,timeGridWeek' } : undefined}
                height={isMobile ? 'auto' : 520}
                eventDisplay="block"
                selectable
                selectMirror
                editable
                eventStartEditable
                eventDurationEditable
                // Shorten the touch long-press so drag-select and drag/resize trigger reliably on mobile.
                longPressDelay={250}
                selectLongPressDelay={250}
                eventLongPressDelay={250}
                events={events}
                eventContent={renderEventContent}
                select={handleSelect}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                eventDrop={handleDatesChange}
                eventResize={handleDatesChange}
            />

            {/* Mobile-only: tapping an event opens its details (and any action) in a bottom sheet. */}
            {isMobile && (
                <Sheet open={!!detailEvent} onOpenChange={(open) => !open && setDetailEvent(null)}>
                    <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto text-foreground">
                        <SheetHeader>
                            <SheetTitle>{detailEvent?.title}</SheetTitle>
                        </SheetHeader>
                        <div className="px-4 pb-2">{detailEvent?.content}</div>
                        {detailEvent?.action && (
                            <SheetFooter>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        detailEvent.action?.run();
                                        setDetailEvent(null);
                                    }}
                                >
                                    {detailEvent.action.label}
                                </Button>
                            </SheetFooter>
                        )}
                    </SheetContent>
                </Sheet>
            )}
        </>
    );
}
