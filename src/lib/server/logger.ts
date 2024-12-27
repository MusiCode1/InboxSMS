import pino from 'pino';

const transport = {
    write: (msg: string) => {
        const parsed = JSON.parse(msg);
        const component = parsed.component || '';
        const message = parsed.msg || '';
        
        // מסיר שדות מיוחדים מהאובייקט
        const logData = { ...parsed };
        delete logData.component;
        delete logData.msg;
        delete logData.level;
        delete logData.time;
        delete logData.pid;
        delete logData.hostname;
        delete logData.v;

        // מדפיס רק אם יש מידע נוסף
        const hasData = Object.keys(logData).length > 0;
        
        switch (parsed.level) {
            case 30: // info
                console.log(`[${component}] ${message}${hasData ? ':' : ''}`, hasData ? logData : '');
                break;
            case 40: // warn
                console.warn(`[${component}] ${message}${hasData ? ':' : ''}`, hasData ? logData : '');
                break;
            case 50: // error
                console.error(`[${component}] ${message}${hasData ? ':' : ''}`, hasData ? logData : '');
                break;
            default: // debug and others
                console.log(`[${component}] ${message}${hasData ? ':' : ''}`, hasData ? logData : '');
        }
    }
};

export const logger = pino({ level: 'debug' }, transport);

// יצירת לוגרים ספציפיים לכל רכיב
export const authLogger = logger.child({ component: 'auth' });
export const dbLogger = logger.child({ component: 'db' });
export const apiLogger = logger.child({ component: 'api' });
export const redisLogger = logger.child({ component: 'redis' });
