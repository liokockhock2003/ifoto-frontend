import { CalendarClock, Minus, Package, User, X } from 'lucide-react';

import { DateTimePicker } from '@/components/date-time-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { PrimaryTabsList, PrimaryTabsTrigger } from '@/components/primary-tabs';
import { REQUEST_STATUS_BADGE, REQUEST_STATUS_LABEL } from '@/constants/requestStatus';

import { useRequestLogisticContext } from './context';

function fmtDay(iso: string) {
    return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Selected Equipment + Selected Accessories — shared by the Approve and Equipment tabs.
function SelectedLists({ editable }: { editable: boolean }) {
    const { selectedRequest, selectedMainIds, selectedSubQty, removeMain, setSubQty, availableEquipment, availableSubEquipment } =
        useRequestLogisticContext();
    const r = selectedRequest;
    if (!r) return null;

    const mainLabel = (id: number) => {
        const it = r.items.find((i) => i.mainEquipmentId === id);
        if (it) return `${it.equipmentType} · ${it.brand} ${it.model}`;
        const av = availableEquipment.find((e) => e.mainEquipmentId === id);
        if (av) return `${av.equipmentType} · ${av.brand} ${av.model}`;
        return `Equipment #${id}`;
    };

    const subLabel = (id: number) => {
        const s = r.subItems?.find((x) => x.subEquipmentId === id);
        if (s) return s.brand ? `${s.brand} ${s.equipmentType}` : s.equipmentType;
        const a = availableSubEquipment.find((x) => x.subEquipmentId === id);
        if (a) return a.brand ? `${a.brand} ${a.equipmentType}` : a.equipmentType;
        return `Accessory #${id}`;
    };

    const selectedSubs = Object.entries(selectedSubQty)
        .map(([id, qty]) => ({ id: Number(id), qty }))
        .filter((s) => s.qty > 0);

    return (
        <>
            {/* Selected Equipment */}
            <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                    Selected Equipment ({selectedMainIds.length})
                </p>
                {selectedMainIds.length === 0 ? (
                    <p className="rounded-md border py-2 text-center text-xs">No equipment selected.</p>
                ) : (
                    <ScrollArea className="max-h-40 rounded-md border bg-background">
                        <div className="divide-y pr-2">
                            {selectedMainIds.map((id) => (
                                <div key={id} className="flex items-center justify-between gap-1 px-2 py-1.5">
                                    <p className="min-w-0 truncate text-xs font-medium text-foreground">{mainLabel(id)}</p>
                                    {editable && (
                                        <button
                                            type="button"
                                            onClick={() => removeMain(id)}
                                            className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>

            {/* Selected Accessories */}
            <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">
                    Selected Accessories ({selectedSubs.length})
                </p>
                {selectedSubs.length === 0 ? (
                    <p className="rounded-md border py-2 text-center text-xs">No accessories selected.</p>
                ) : (
                    <ScrollArea className="max-h-40 rounded-md border bg-background">
                        <div className="divide-y pr-2">
                            {selectedSubs.map(({ id, qty }) => (
                                <div key={id} className="flex items-center justify-between gap-1 px-2 py-1.5">
                                    <p className="min-w-0 truncate text-xs font-medium text-foreground">{subLabel(id)}</p>
                                    <div className="flex shrink-0 items-center gap-0.5">
                                        {editable && (
                                            <button
                                                type="button"
                                                onClick={() => setSubQty(id, qty - 1)}
                                                className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                        )}
                                        <span className="w-5 text-center text-xs font-medium tabular-nums">{qty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </>
    );
}

// Pickup + Return datetime pickers, constrained to the request's event window.
function LogisticsDatetimes() {
    const { selectedRequest, pickupDatetime, returnDatetime, setPickupDatetime, setReturnDatetime } =
        useRequestLogisticContext();
    if (!selectedRequest) return null;
    const r = selectedRequest;
    return (
        <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Pickup</label>
                <DateTimePicker
                    value={pickupDatetime}
                    onChange={setPickupDatetime}
                    maxDate={r.startDatetime}
                    periodStart={r.startDatetime}
                    periodEnd={r.endDatetime}
                />
            </div>
            <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Return</label>
                <DateTimePicker
                    value={returnDatetime}
                    onChange={setReturnDatetime}
                    minDate={r.endDatetime}
                    periodStart={r.startDatetime}
                    periodEnd={r.endDatetime}
                />
            </div>
        </div>
    );
}

export function RequestActionPanel() {
    const {
        selectedRequest,
        mode,
        selectedMainIds,
        pickupDatetime,
        returnDatetime,
        committeeNotes,
        rejectionReason,
        setCommitteeNotes,
        setRejectionReason,
        approve,
        reject,
        saveEquipment,
        saveLogistics,
        isPending,
    } = useRequestLogisticContext();

    if (!selectedRequest) {
        return (
            <Card className="shadow-sm">
                <CardContent className="flex h-64 flex-col items-center justify-center gap-2 text-center">
                    <Package className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                        Select a request on the calendar to review or update it.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const r = selectedRequest;
    const equipmentLocked = r.status === 'PICKED_UP' || r.status === 'ACTIVE';

    return (
        <Card className="shadow-sm">
            <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base text-primary">{r.requestNumber}</CardTitle>
                    <Badge variant="outline" className={REQUEST_STATUS_BADGE[r.status]}>
                        {REQUEST_STATUS_LABEL[r.status]}
                    </Badge>
                </div>
                <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5"><Package className="h-3 w-3" /> {r.eventName}</p>
                    <p className="flex items-center gap-1.5"><User className="h-3 w-3" /> {r.requestedByUsername}</p>
                    <p className="flex items-center gap-1.5">
                        <CalendarClock className="h-3 w-3" /> {fmtDay(r.startDatetime)} – {fmtDay(r.endDatetime)}
                    </p>
                </div>
            </CardHeader>

            <CardContent className="pt-4 text-muted-foreground">
                {/* ── Review: Approve | Reject ── */}
                {mode === 'review' && (
                    <Tabs defaultValue="approve">
                        <PrimaryTabsList className="w-full">
                            <PrimaryTabsTrigger value="approve" className="flex-1">Approve</PrimaryTabsTrigger>
                            <PrimaryTabsTrigger value="reject" className="flex-1">Reject</PrimaryTabsTrigger>
                        </PrimaryTabsList>

                        <TabsContent value="approve" className="mt-3 space-y-4">
                            <SelectedLists editable />
                            <LogisticsDatetimes />
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-foreground">Committee Notes</label>
                                <Textarea
                                    value={committeeNotes}
                                    onChange={(e) => setCommitteeNotes(e.target.value)}
                                    placeholder="Optional notes for internal reference"
                                    rows={2}
                                    className="resize-none"
                                />
                            </div>
                            <Button
                                className="w-full"
                                disabled={selectedMainIds.length === 0 || isPending}
                                onClick={() => void approve()}
                            >
                                {isPending ? 'Working…' : 'Approve'}
                            </Button>
                        </TabsContent>

                        <TabsContent value="reject" className="mt-3 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-foreground">Rejection Reason</label>
                                <Textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Required to reject this request"
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full"
                                disabled={!rejectionReason.trim() || isPending}
                                onClick={() => void reject()}
                            >
                                Reject
                            </Button>
                        </TabsContent>
                    </Tabs>
                )}

                {/* ── Update: Equipment | Schedule ── */}
                {mode === 'update' && (
                    <Tabs defaultValue={equipmentLocked ? 'schedule' : 'equipment'}>
                        <PrimaryTabsList className="w-full">
                            {!equipmentLocked && (
                                <PrimaryTabsTrigger value="equipment" className="flex-1">Equipment</PrimaryTabsTrigger>
                            )}
                            <PrimaryTabsTrigger value="schedule" className="flex-1">Schedule</PrimaryTabsTrigger>
                        </PrimaryTabsList>

                        {!equipmentLocked && (
                            <TabsContent value="equipment" className="mt-3 space-y-4">
                                <SelectedLists editable />
                                <Button
                                    className="w-full"
                                    disabled={selectedMainIds.length === 0 || isPending}
                                    onClick={() => void saveEquipment()}
                                >
                                    {isPending ? 'Working…' : 'Save Equipment'}
                                </Button>
                            </TabsContent>
                        )}

                        <TabsContent value="schedule" className="mt-3 space-y-4">
                            <LogisticsDatetimes />
                            <Button
                                className="w-full"
                                disabled={!pickupDatetime || !returnDatetime || isPending}
                                onClick={() => void saveLogistics()}
                            >
                                {isPending ? 'Working…' : 'Save Logistics'}
                            </Button>
                        </TabsContent>
                    </Tabs>
                )}

                {/* ── View: read-only ── */}
                {mode === 'view' && (
                    <div className="space-y-4">
                        <SelectedLists editable={false} />
                        <p className="rounded-md bg-muted/40 px-3 py-2 text-xs">
                            This request is not in a reviewable or updatable state — equipment is shown read-only.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
