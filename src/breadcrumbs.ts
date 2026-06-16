// Map each URL segment to its display label.
// Adding a new route only requires registering its segment here — no full-path entries needed.
export const SEGMENT_LABELS: Record<string, string> = {
    'manage-inventory':               'Inventory Management',
    'rental-pricing':                 'Rental Pricing',
    'status':                         'Manage Status',
    'holds':                          'Manage Holds',
    'user-management':                'User Management',
    'event-management':               'Event Management',
    'rental-management':              'Rental Management',
    'event-equipment':                'Event Equipment',
    'calendar':                       'Calendar',
    'equipment-rent':                 'Equipment Rental',
    'new':                            'New Rental',
    'equipment-returns':              'Return Rented Equipment',
    'equipment-requests':             'Equipment Request',
    'equipment-request-returns':      'Return Requested Equipment',
    'equipment-booking-management':   'Rental Management',
    'equipment-request-management':   "Event's Equipment",
    'equipment-return-management':    'Equipment Return Management',
    'reporting-dashboard':            'Reporting Dashboard',
    'committee-bank-details':         'Committee Bank Details',
};

// Intermediate path segments that have no landing page of their own and should
// be omitted from the breadcrumb trail (e.g. /manage-inventory/status/:id —
// "status" links nowhere on its own).
export const HIDDEN_SEGMENTS = new Set<string>([
    'status',
    'holds',
]);
