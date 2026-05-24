import { useState } from 'react';
import type { Row } from '@tanstack/react-table';
import { Eye, XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { EquipmentRequest } from '@/store/schemas/request';

import { EquipmentRequestCancelDialog } from './dialog-cancel';
import { EquipmentRequestViewDialog } from './dialog-view';

type EquipmentRequestRowActionsProps = {
    row: Row<EquipmentRequest>;
};

export function EquipmentRequestRowActions({ row }: EquipmentRequestRowActionsProps) {
    const [viewOpen, setViewOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    const request = row.original;

    return (
        <>
            <div className="flex items-center gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setViewOpen(true)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                </Button>

                {request.status === 'PENDING_REVIEW' && (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="text-destructive border-destructive hover:bg-destructive/10"
                        onClick={() => setCancelOpen(true)}
                    >
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel
                    </Button>
                )}
            </div>

            <EquipmentRequestViewDialog
                open={viewOpen}
                onOpenChange={setViewOpen}
                request={request}
            />
            <EquipmentRequestCancelDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                request={request}
            />
        </>
    );
}
