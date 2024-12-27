import type { Actions, PageServerLoad } from './$types';
import type { Message, LoginResponse, MessagesResponse } from '$lib/types';
import { env } from '$env/dynamic/private';
import { createSession, deleteSession } from '$lib/server/session';
import { apiLogger, authLogger } from '$lib/server/logger';

const API_URL = env.API_URL || 'https://www.call2all.co.il/ym/api/';
const API_USERNAME = env.API_USERNAME;
const API_PASSWORD = env.API_PASSWORD;
const CLIENT_USERNAME = env.CLIENT_USERNAME;
const CLIENT_PASSWORD = env.CLIENT_PASSWORD;

async function loginToApi(): Promise<string> {
    apiLogger.debug('שליחת בקשת התחברות ל-API');
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
    apiLogger.debug({ status: data.responseStatus }, 'תשובת שרת להתחברות');

    if (data.responseStatus === 'OK' && data.token) {
        apiLogger.debug('התקבל טוקן חדש');
        return data.token;
    }
    
    apiLogger.error({ error: data.message }, 'שגיאה בהתחברות ל-API');
    throw new Error(data.message || 'שגיאה בהתחברות');
}

async function getMessagesFromApi(token: string): Promise<Message[]> {
    apiLogger.debug('שליחת בקשה לקבלת הודעות');
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
    apiLogger.debug({ status: data.responseStatus, count: data.rows?.length }, 'תשובת שרת להודעות');

    if (data.responseStatus === 'OK' && data.rows) {
        return data.rows;
    }
    
    apiLogger.error({ error: data.message }, 'שגיאה בקבלת הודעות');
    throw new Error(data.message || 'שגיאה בטעינת ההודעות');
}

export const load: PageServerLoad = async ({ locals }) => {
    authLogger.debug({ authenticated: locals.authenticated }, 'טעינת דף');
    
    if (!locals.authenticated) {
        authLogger.debug('משתמש לא מחובר, מחזיר דף התחברות');
        return {
            messages: [],
            authenticated: false
        };
    }

    try {
        apiLogger.debug('מתחבר ל-API לקבלת הודעות');
        // קבלת טוקן חדש בכל פעם - אין צורך לשמור אותו
        const token = await loginToApi();
        const messages = await getMessagesFromApi(token);
        apiLogger.debug({ count: messages.length }, 'התקבלו הודעות');
        return {
            messages,
            authenticated: true
        };
    } catch (error) {
        apiLogger.error({ error: error instanceof Error ? error.message : 'unknown error' }, 'שגיאה בטעינת הודעות');
        return {
            messages: [],
            authenticated: false
        };
    }
};

export const actions: Actions = {
    login: async ({ cookies, request }) => {
        authLogger.info('התחלת תהליך התחברות');
        const data = await request.formData();
        const username = data.get('username')?.toString();
        const password = data.get('password')?.toString();

        if (!username || !password) {
            authLogger.warn('חסרים פרטי התחברות');
            return {
                success: false,
                error: 'נא להזין שם משתמש וסיסמה'
            };
        }

        // בדיקת פרטי התחברות
        if (username !== CLIENT_USERNAME || password !== CLIENT_PASSWORD) {
            authLogger.warn({ username }, 'פרטי התחברות שגויים');
            return {
                success: false,
                error: 'שם משתמש או סיסמה שגויים'
            };
        }

        try {
            authLogger.info({ username }, 'פרטי התחברות תקינים, יוצר סשן');
            // יצירת סשן חדש
            const sessionId = await createSession(username);
            cookies.set('session', sessionId, { 
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            apiLogger.debug('מתחבר ל-API לאחר התחברות משתמש');
            // קבלת טוקן API והודעות
            const token = await loginToApi();
            const messages = await getMessagesFromApi(token);

            authLogger.info({ username }, 'התחברות הושלמה בהצלחה');
            return { 
                success: true,
                messages,
                authenticated: true
            };
        } catch (error) {
            authLogger.error({ error: error instanceof Error ? error.message : 'unknown error' }, 'שגיאה בהתחברות');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה בהתחברות'
            };
        }
    },

    logout: async ({ cookies }) => {
        const sessionId = cookies.get('session');
        authLogger.info({ sessionId }, 'התחלת תהליך התנתקות');
        if (sessionId) {
            await deleteSession(sessionId);
            cookies.delete('session', { 
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
            authLogger.info({ sessionId }, 'התנתקות הושלמה');
        }
        return { success: true };
    },

    refresh: async ({ locals, cookies }) => {
        apiLogger.debug('התחלת רענון הודעות');
        if (!locals.authenticated) {
            authLogger.warn('ניסיון רענון הודעות ללא חיבור');
            return {
                success: false,
                error: 'לא מחובר'
            };
        }

        try {
            apiLogger.debug('מתחבר ל-API לרענון הודעות');
            // קבלת טוקן חדש בכל פעם
            const token = await loginToApi();
            const messages = await getMessagesFromApi(token);
            apiLogger.debug({ count: messages.length }, 'רענון הודעות הושלם');
            return {
                success: true,
                messages
            };
        } catch (error) {
            apiLogger.error({ error: error instanceof Error ? error.message : 'unknown error' }, 'שגיאה ברענון הודעות');
            cookies.delete('session', { 
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            }); // מחיקת סשן במקרה של שגיאה
            return {
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה בטעינת ההודעות'
            };
        }
    }
};
