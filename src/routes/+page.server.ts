import type { Actions, PageServerLoad } from './$types';
import type { Message, LoginResponse, MessagesResponse } from '$lib/types';
import { env } from '$env/dynamic/private';

const API_URL = env.API_URL || 'https://www.call2all.co.il/ym/api/';
const API_USERNAME = env.API_USERNAME;
const API_PASSWORD = env.API_PASSWORD;
const CLIENT_USERNAME = env.CLIENT_USERNAME;
const CLIENT_PASSWORD = env.CLIENT_PASSWORD;

async function loginToApi(): Promise<string> {
    const response = await fetch(`${API_URL}Login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
            username: API_USERNAME,
            password: API_PASSWORD
        })
    });

    const data: LoginResponse = await response.json();

    if (data.responseStatus === 'OK' && data.token) {
        return data.token;
    }
    
    throw new Error(data.message || 'שגיאה בהתחברות');
}

async function getMessagesFromApi(token: string): Promise<Message[]> {
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

async function logoutFromApi(token: string): Promise<void> {
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

export const load: PageServerLoad = async ({ cookies }) => {
    const token = cookies.get('session');
    if (!token) {
        return {
            messages: []
        };
    }

    try {
        const messages = await getMessagesFromApi(token);
        return {
            messages
        };
    } catch (error) {
        cookies.delete('session', { path: '/' });
        return {
            messages: []
        };
    }
};

export const actions: Actions = {
    login: async ({ cookies, request }) => {
        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (!username || !password) {
            return {
                success: false,
                error: 'נא להזין שם משתמש וסיסמה'
            };
        }

        // בדיקת פרטי התחברות
        if (username !== CLIENT_USERNAME || password !== CLIENT_PASSWORD) {
            return {
                success: false,
                error: 'שם משתמש או סיסמה שגויים'
            };
        }

        try {
            const token = await loginToApi();
            cookies.set('session', token, { path: '/' });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה בהתחברות'
            };
        }
    },

    logout: async ({ cookies }) => {
        const token = cookies.get('session');
        if (token) {
            await logoutFromApi(token);
            cookies.delete('session', { path: '/' });
        }
        return { success: true };
    },

    refresh: async ({ cookies }) => {
        const token = cookies.get('session');
        if (!token) {
            return {
                success: false,
                error: 'לא מחובר'
            };
        }

        try {
            const messages = await getMessagesFromApi(token);
            return {
                success: true,
                messages
            };
        } catch (error) {
            cookies.delete('session', { path: '/' });
            return {
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה בטעינת ההודעות'
            };
        }
    }
};