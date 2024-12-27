import type { Message } from '$lib/types';

export interface RefreshResponse {
    success: boolean;
    messages?: Message[];
}

export interface LogoutResponse {
    success: boolean;
    error?: string;
}

export interface LoginResponse {
    success: boolean;
    error?: string;
    messages?: Message[];
    location?: string;
}
