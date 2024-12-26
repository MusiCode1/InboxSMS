const API_URL = 'https://www.call2all.co.il/ym/api/';

import type { LoginResponse, Message, MessagesResponse } from './types';

export async function login(username: string, password: string): Promise<string> {
    const response = await fetch(`${API_URL}Login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    });

    const data: LoginResponse = await response.json();

    if (data.responseStatus === 'OK' && data.token) {
        return data.token;
    }
    
    throw new Error(data.message || 'שגיאה בהתחברות');
}

export async function logout(token: string): Promise<void> {
    try {
        await fetch(`${API_URL}Logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
}

export async function getMessages(token: string): Promise<Message[]> {
    const response = await fetch(`${API_URL}GetSmsIncomingLog`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            token,
            limit: 100
        })
    });

    const data: MessagesResponse = await response.json();

    if (data.responseStatus === 'OK' && data.rows) {
        return data.rows;
    }
    
    throw new Error(data.message || 'שגיאה בטעינת ההודעות');
}
