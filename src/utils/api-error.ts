import { isAxiosError, type AxiosError } from 'axios';

export function isAxiosStatusError(err: unknown, status: number): err is AxiosError {
    return isAxiosError(err) && err.response?.status === status;
}

export function isNotFoundError(err: unknown): boolean {
    return isAxiosStatusError(err, 404);
}

export function isRateLimitError(err: unknown): boolean {
    return isAxiosStatusError(err, 429);
}

export function extractApiErrorMessage(err: unknown): string {
    if (isAxiosError(err)) {
        const data = err.response?.data;
        if (typeof data === 'string' && data.trim().length > 0) return data;
        if (data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string') {
            return (data as { message: string }).message;
        }
        if (typeof err.message === 'string' && err.message.trim().length > 0) return err.message;
    }
    if (err instanceof Error && err.message.trim().length > 0) return err.message;
    return 'Request failed';
}
