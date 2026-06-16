import type React from 'react';
import { CalendarDays } from 'lucide-react';

import { RangeDatePicker } from '@/components/range-date-picker';
import { Button } from '@/components/ui/button';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

import { useEquipmentRentalContext } from '../context';

const FAQ: { q: string; a: React.ReactNode }[] = [
    {
        q: 'Which dates should I enter?',
        a: 'Enter the dates you actually need the equipment — the start and end of your program or event. For personal use, enter the days you plan to use it. These dates are used to calculate your rental cost, so keep them accurate.',
    },
    {
        q: 'What happens after I submit?',
        a: 'Your request will be reviewed by the Equipment Committee. A committee member will be personally assigned to your rental within 1–2 working days. You will be notified once your request is approved.',
    },
    {
        q: 'When will my pickup & return times be confirmed?',
        a: 'Your assigned Equipment Committee member will set the exact pickup date & time and return date & time after your request is approved. You do not need to choose these yourself.',
    },
    {
        q: 'How and when do I pay?',
        a: 'Payment is made after you have collected the equipment. Once you pick up the equipment, your rental status will update and a payment option will appear. You can pay online or in cash — your committee member will guide you.',
    },
    {
        q: 'Can I cancel my request?',
        a: 'Yes. You can cancel your request any time before the equipment has been picked up — as long as the status is still Pending Review or Approved. Head to My Rentals and use the Cancel option on your request.',
    },
    {
        q: 'What if I return the equipment late?',
        a: 'Overdue is only counted after your confirmed return date has passed. If you return the equipment late, a penalty fee will be applied based on the number of overdue days. The penalty amount will appear in your rental details and must be settled to avoid affecting your future rental requests.',
    },
    {
        q: 'Who do I contact for further enquiries?',
        a: (<>Reach out to Ipan at <span className="font-medium text-foreground">[Ipan's number]</span> for any questions about your rental.</>),
    },
];

export function PickDateRange({ onNext }: { onNext: () => void }) {
    const { startDate, endDate, setStartDate, setEndDate } = useEquipmentRentalContext();
    const canAdvance = !!startDate && !!endDate;

    return (
        <div className="space-y-4 flex flex-col sm:flex-row sm:items-start sm:gap-12">
            <div className='flex-2 flex flex-col items-start'>
                <div>
                    <div className="flex items-center gap-2 text-primary pb-2">
                        <CalendarDays className="h-5 w-5" />
                        <h2 className="font-semibold">Pick Rental Period</h2>
                    </div>
                    <div className="auto-cols-max grid w-full gap-4 pb-8">
                        <RangeDatePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartChange={setStartDate}
                            onEndChange={setEndDate}
                            placeholder="Date Range"
                        // minDate={new Date()}
                        />
                    </div>
                </div>
                <Button onClick={onNext} disabled={!canAdvance} size="sm">
                    Next
                </Button>
            </div>

            <div className='flex-5'>
                <p className="flex text-lg font-bold text-foreground pt-4 sm:pt-0">FAQ</p>
                <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
                    {FAQ.map((item, i) => (
                        <div key={i}>
                            <AccordionItem value={`faq-${i}`} className="border-b-0">
                                <AccordionTrigger className="text-xs py-2.5 hover:no-underline text-foreground">
                                    {item.q}
                                </AccordionTrigger>
                                <AccordionContent className="text-xs text-muted-foreground pb-3">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                            {i < FAQ.length - 1 && <Separator />}
                        </div>
                    ))}
                </Accordion>
            </div>
        </div>
    );
}
