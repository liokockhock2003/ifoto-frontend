const base = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    const res = await fetch(`${base}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });

    if (!res.ok) {
        throw new Error(`Login failed: ${res.status} ${res.statusText}`);
    }

    return res.json();
}