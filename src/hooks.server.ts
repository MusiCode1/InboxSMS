import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/session';
import { apiLogger } from '$lib/server/logger';

export const handle: Handle = async ({ event, resolve }) => {
    // בדיקת סשן קיים
    const sessionId = event.cookies.get('session');
    apiLogger.debug({ sessionId, path: event.url.pathname }, 'בדיקת סשן בבקשה');
    
    // בדיקת תקינות הסשן
    const isValidSession = await validateSession(sessionId);
    apiLogger.debug({ sessionId, isValidSession, path: event.url.pathname }, 'תוצאת בדיקת סשן');
    
    // הוספת מצב האימות ל-locals
    event.locals.authenticated = isValidSession;

    const response = await resolve(event);
    
    apiLogger.debug({ 
        path: event.url.pathname,
        method: event.request.method,
        status: response.status
    }, 'סיום טיפול בבקשה');
    
    return response;
};
