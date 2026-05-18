export function formatMonth(yyyyMm: string): string {
    const [year, month] = yyyyMm.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleString('default', { month: 'short', year: '2-digit' });
}
