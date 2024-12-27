import { v4 as uuidv4 } from 'uuid';
import { redis, type SessionData } from './redis';
import { authLogger } from './logger';

const SESSION_TTL = 24 * 60 * 60; // תוקף סשן - 24 שעות בשניות

export async function createSession(userId: string): Promise<string> {
    const sessionId = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    
    const sessionData: SessionData = {
        userId,
        createdAt: now,
        expiresAt: now + SESSION_TTL
    };
    
    authLogger.info({ sessionId, userId }, 'יצירת סשן חדש');
    
    // שמירת הסשן ב-Redis עם TTL
    await redis.set(`session:${sessionId}`, JSON.stringify(sessionData));
    await redis.expire(`session:${sessionId}`, SESSION_TTL);
    
    return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
    authLogger.debug({ sessionId }, 'קבלת סשן');
    
    const data = await redis.get(`session:${sessionId}`);
    if (!data) {
        authLogger.debug('סשן לא נמצא');
        return null;
    }
    
    const session = JSON.parse(data as string) as SessionData;
    const now = Math.floor(Date.now() / 1000);
    
    // בדיקת תוקף הסשן
    if (session.expiresAt < now) {
        authLogger.debug({ sessionId }, 'סשן פג תוקף');
        await deleteSession(sessionId);
        return null;
    }
    
    authLogger.debug({ sessionId, userId: session.userId }, 'סשן תקין');
    return session;
}

export async function deleteSession(sessionId: string): Promise<void> {
    authLogger.info({ sessionId }, 'מחיקת סשן');
    await redis.del(`session:${sessionId}`);
}

export async function validateSession(sessionId: string | undefined): Promise<boolean> {
    authLogger.debug({ sessionId }, 'בדיקת תקינות סשן');
    if (!sessionId) {
        authLogger.debug('אין מזהה סשן');
        return false;
    }
    const session = await getSession(sessionId);
    const isValid = session !== null;
    authLogger.debug({ sessionId, isValid }, 'תוצאת בדיקת סשן');
    return isValid;
}
