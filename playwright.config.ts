import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// טעינת משתני סביבה מקובץ .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* הרצת בדיקות במקביל */
  fullyParallel: true,
  /* כישלון בבנייה ב-CI אם נשאר test.only בקוד */
  forbidOnly: !!process.env.CI,
  /* ניסיונות חוזרים רק ב-CI */
  retries: process.env.CI ? 2 : 0,
  /* ביטול בדיקות מקבילות ב-CI */
  workers: process.env.CI ? 1 : undefined,
  /* סוג הדיווח על תוצאות */
  reporter: [
    ['list'], // רשימת בדיקות במסוף
  ],
  /* הגדרות משותפות לכל הפרויקטים */
  use: {
    /* כתובת בסיס לשימוש בפעולות */
    baseURL: 'http://localhost:5173',
    /* איסוף מידע על שגיאות */
    trace: 'on-first-retry',
    /* הגדרות מהירות */
    launchOptions: {
      slowMo: 1000, // המתנה של שנייה בין פעולות
    },
    /* צילום מסך בכל שלב */
    screenshot: 'on',
    /* הצגת צעדי הבדיקה */
    video: 'on',
  },

  /* הגדרת דפדפנים לבדיקה */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  /* הפעלת שרת פיתוח לפני הבדיקות */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe', // הצגת פלט רגיל של השרת
    stderr: 'pipe', // הצגת פלט שגיאות של השרת
    timeout: 120000, // זמן המתנה ארוך יותר לעליית השרת (2 דקות)
  },
});
