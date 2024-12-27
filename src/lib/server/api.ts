import { env } from '$env/dynamic/private';
import type { LoginResponse, MessagesResponse, Message } from '$lib/types';
import { apiLogger } from './logger';
import { redis } from './redis';

interface TokenData {
    token: string;
    expiresAt: number;
}

interface ApiResponse {
    responseStatus: string;
    message?: string;
}

// אובייקט לטיפול בקריאות API
const apiClient = {
    url: env.API_URL || 'https://www.call2all.co.il/ym/api/',
    username: env.API_USERNAME,
    password: env.API_PASSWORD,

    async call<T extends ApiResponse, R>(
        endpoint: string,
        body: Record<string, unknown>,
        logPrefix: string,
        extractResult: (data: T) => R | undefined
    ): Promise<R> {
        apiLogger.debug(`שליחת בקשת ${logPrefix}`);
        const response = await fetch(`${this.url}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data: T = await response.json();
        apiLogger.debug({ status: data.responseStatus }, `תשובת שרת ל${logPrefix}`);

        const result = extractResult(data);
        if (data.responseStatus === 'OK' && result !== undefined) {
            return result;
        }

        apiLogger.error({ error: data.message }, `שגיאה ב${logPrefix}`);
        throw new Error(data.message || `שגיאה ב${logPrefix}`);
    },

    async login(): Promise<string> {
        return this.call<LoginResponse, string>(
            'Login',
            {
                username: this.username,
                password: this.password
            },
            'התחברות',
            (data) => {
                if (data.token) {
                    apiLogger.debug('התקבל טוקן חדש');
                    return data.token;
                }
            }
        );
    },

    async getMessages(token: string): Promise<Message[]> {
        return this.call<MessagesResponse, Message[]>(
            'GetSmsIncomingLog',
            {
                token,
                limit: 100
            },
            'קבלת הודעות',
            (data) => data.rows
        );
    }
};

// אובייקט לטיפול במטמון טוקנים
const tokenCache = {
    key: 'api_token',
    ttl: 60 * 60, // שעה אחת בשניות

    async get(): Promise<string | null> {
        const storedData = await redis.get(this.key);
        if (!storedData) return null;

        try {
            const data: TokenData = JSON.parse(storedData.toString());
            if (Date.now() < data.expiresAt) {
                apiLogger.debug('נמצא טוקן תקף במטמון');
                return data.token;
            }
            apiLogger.debug('נמצא טוקן לא תקף במטמון');
            await redis.del(this.key);
        } catch (error) {
            apiLogger.error({ error }, 'שגיאה בקריאת טוקן מהמטמון');
            await redis.del(this.key);
        }
        return null;
    },

    async set(token: string): Promise<void> {
        const tokenData: TokenData = {
            token,
            expiresAt: Date.now() + this.ttl * 1000
        };
        await redis.set(this.key, JSON.stringify(tokenData));
        apiLogger.debug('טוקן נשמר במטמון');
    }
};

// פונקציות ציבוריות שמשלבות את שני האובייקטים
export async function loginToApi(): Promise<string> {
    // בדיקה אם יש טוקן תקף במטמון
    const storedToken = await tokenCache.get();
    if (storedToken) {
        return storedToken;
    }

    // אין טוקן תקף, מבצע התחברות חדשה
    const token = await apiClient.login();

    // שמירת הטוקן החדש במטמון
    await tokenCache.set(token);
    return token;
}

export async function getMessagesFromApi(token: string): Promise<Message[]> {
    return apiClient.getMessages(token);
}
