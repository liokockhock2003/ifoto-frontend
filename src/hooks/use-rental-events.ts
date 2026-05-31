import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { getAccessToken } from '@/utils/axios-instance';
import {
    invoiceByRentalQuery,
    penaltyInvoiceByRentalQuery,
    receiptByRentalQuery,
    penaltyReceiptByRentalQuery,
    rentalEventsStream,
} from '@/store/queries/receipt';
import { RentalEventSchema } from '@/store/schemas/receipt';

const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000];

export function useRentalEvents(rentalId: number | null): { isConnected: boolean } {
    const queryClient = useQueryClient();
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!rentalId) return;
        const id = rentalId; // non-null capture — TypeScript loses the guard inside async closures

        let active = true;
        let attempt = 0;
        const controller = new AbortController();

        async function connect() {
            while (active) {
                try {
                    const token = getAccessToken();
                    const res = await fetch(rentalEventsStream.url(id), {
                        headers: {
                            Authorization: token ? `Bearer ${token}` : '',
                            Accept: 'text/event-stream',
                        },
                        signal: controller.signal,
                    });

                    if (!res.ok || !res.body) return; // fatal server error — don't reconnect

                    attempt = 0;
                    if (active) setIsConnected(true);

                    const reader = res.body.getReader();
                    const decoder = new TextDecoder();
                    let buffer = '';

                    while (active) {
                        const { value, done } = await reader.read();
                        if (done) break;

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop() ?? '';

                        for (const line of lines) {
                            if (!line.startsWith('data:')) continue;

                            let parsed: unknown;
                            try { parsed = JSON.parse(line.slice(5).trim()); } catch { continue; }

                            const result = RentalEventSchema.safeParse(parsed);
                            if (!result.success) continue;

                            const { documentType, rentalId: rid } = result.data;
                            const keyMap = {
                                INVOICE:         invoiceByRentalQuery(rid).queryKey,
                                RECEIPT:         receiptByRentalQuery(rid).queryKey,
                                OVERDUE_INVOICE: penaltyInvoiceByRentalQuery(rid).queryKey,
                                OVERDUE_RECEIPT: penaltyReceiptByRentalQuery(rid).queryKey,
                            };
                            queryClient.invalidateQueries({ queryKey: keyMap[documentType] });
                        }
                    }
                } catch (err: unknown) {
                    if (!active || (err instanceof Error && err.name === 'AbortError')) return;
                    // network error — fall through to reconnect
                }

                if (!active) return;
                setIsConnected(false);

                const delay = RECONNECT_DELAYS_MS[Math.min(attempt, RECONNECT_DELAYS_MS.length - 1)];
                attempt++;
                await new Promise<void>((resolve) => setTimeout(resolve, delay));
            }
        }

        connect().catch(console.error);

        return () => {
            active = false;
            controller.abort();
            setIsConnected(false);
        };
    }, [rentalId, queryClient]);

    return { isConnected };
}
