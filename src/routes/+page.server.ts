import type { Actions, PageServerLoad } from './$types';
import type { Message } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createSession, deleteSession } from '$lib/server/session';
import { apiLogger, authLogger } from '$lib/server/logger';
import { loginToApi, getMessagesFromApi } from '$lib/server/api';

const CLIENT_USERNAME = env.CLIENT_USERNAME;
const CLIENT_PASSWORD = env.CLIENT_PASSWORD;

export const load: PageServerLoad = async ({ locals, depends }) => {
    depends('app:auth');
    
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

        let sessionId: string;
        let messages: Message[];

        try {
            authLogger.info({ username }, 'פרטי התחברות תקינים, יוצר סשן');
            // יצירת סשן חדש
            sessionId = await createSession(username);
            cookies.set('session', sessionId, {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });

            apiLogger.debug('מתחבר ל-API לאחר התחברות משתמש');
            // קבלת טוקן API והודעות
            const token = await loginToApi();
            messages = await getMessagesFromApi(token);
            authLogger.info({ username }, 'התחברות הושלמה בהצלחה');
        } catch (error) {
            authLogger.error({ error: error instanceof Error ? error.message : 'unknown error' }, 'שגיאה בהתחברות');
            return {
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה בהתחברות'
            };
        }

        // אם אין JavaScript, נעשה redirect
        if (!request.headers.get('accept')?.includes('application/json')) {
            throw redirect(303, '/');
        }
        
        // אם יש JavaScript, נחזיר את המידע לעדכון דינמי
        return {
            success: true,
            messages,
            authenticated: true
        };
    },

    logout: async ({ cookies, request }) => {
        const sessionId = cookies.get('session');
        
        try {
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
        } catch (error) {
            authLogger.error({ error: error instanceof Error ? error.message : 'unknown error' }, 'שגיאה בהתנתקות');
        }

        // אם אין JavaScript, נעשה redirect
        if (!request.headers.get('accept')?.includes('application/json')) {
            throw redirect(303, '/');
        }

        return { success: true };
    },

    refresh: async ({ locals, cookies, request }) => {
        apiLogger.debug('התחלת רענון הודעות');
        if (!locals.authenticated) {
            authLogger.warn('ניסיון רענון הודעות ללא חיבור');
            if (!request.headers.get('accept')?.includes('application/json')) {
                throw redirect(303, '/');
            }
            return {
                success: false,
                error: 'לא מחובר'
            };
        }

        let messages: Message[];

        try {
            apiLogger.debug('מתחבר ל-API לרענון הודעות');
            // קבלת טוקן חדש בכל פעם
            const token = await loginToApi();
            messages = await getMessagesFromApi(token);
            apiLogger.debug({ count: messages.length }, 'רענון הודעות הושלם');
        } catch (error) {
            apiLogger.error({ error: error instanceof Error ? error.message : 'unknown error' }, 'שגיאה ברענון הודעות');
            cookies.delete('session', {
                path: '/',
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            }); // מחיקת סשן במקרה של שגיאה

            if (!request.headers.get('accept')?.includes('application/json')) {
                throw redirect(303, '/');
            }

            return {
                success: false,
                error: error instanceof Error ? error.message : 'שגיאה בטעינת ההודעות'
            };
        }

        // אם אין JavaScript, נעשה redirect
        if (!request.headers.get('accept')?.includes('application/json')) {
            throw redirect(303, '/');
        }

        return {
            success: true,
            messages
        };
    }
};
