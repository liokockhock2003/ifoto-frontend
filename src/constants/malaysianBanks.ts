export const MALAYSIAN_BANKS = [
    'Maybank',
    'CIMB Bank',
    'Public Bank',
    'RHB Bank',
    'Hong Leong Bank',
    'AmBank',
    'Bank Islam',
    'Bank Rakyat',
    'Alliance Bank',
    'Affin Bank',
    'OCBC Bank',
    'Standard Chartered',
    'Citibank',
    'HSBC Bank',
    'UOB Bank',
    'Bank Muamalat',
    'BSN',
] as const;

export type MalaysianBank = typeof MALAYSIAN_BANKS[number];
