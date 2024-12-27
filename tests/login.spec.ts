import { test, expect } from '@playwright/test';

test.describe('מערכת הודעות נכנסות', () => {
    test('תהליך התחברות והצגת הודעות', async ({ page }) => {
        // הפעלת לוגים של הקונסול
        page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
        
        console.log('ניווט לדף הראשי');
        await page.goto('/');
        
        console.log('בדיקת כותרת דף ההתחברות');
        await expect(page.getByRole('heading', { name: 'התחברות' })).toBeVisible();
        
        console.log('מילוי פרטי התחברות');
        await page.getByLabel('שם משתמש:').fill(process.env.CLIENT_USERNAME || '');
        await page.getByLabel('סיסמה:').fill(process.env.CLIENT_PASSWORD || '');
        
        console.log('לחיצה על כפתור התחבר');
        await page.getByRole('button', { name: 'התחבר' }).click();
        
        // המתנה לסיום הטעינה
        console.log('המתנה לסיום הטעינה');
        await page.waitForLoadState('networkidle');
        
        // בדיקה אם יש הודעת שגיאה
        const errorElement = page.locator('.bg-red-100');
        if (await errorElement.isVisible()) {
            console.log('נמצאה הודעת שגיאה:', await errorElement.textContent());
            throw new Error(`התחברות נכשלה: ${await errorElement.textContent()}`);
        }
        
        console.log('המתנה לכפתור רענון');
        await expect(
            page.getByRole('button', { name: 'רענן הודעות' })
        ).toBeVisible({ timeout: 30000 });
        
        console.log('בדיקת הודעות');
        const count = await page.locator('.bg-gray-50').count();
        expect(count).toBeGreaterThan(0);
        
        console.log('בדיקת מבנה הודעה');
        const messageElement = page.locator('.bg-gray-50').first();
        await expect(messageElement.locator('span:has-text("תאריך:")')).toBeVisible();
        await expect(messageElement.locator('span:has-text("מאת:")')).toBeVisible();
        await expect(messageElement.locator('span:has-text("נשלח אל:")')).toBeVisible();
        
        console.log('בדיקת רענון הודעות');
        await page.getByRole('button', { name: 'רענן הודעות' }).click();
        await page.waitForLoadState('networkidle');
        const newCount = await page.locator('.bg-gray-50').count();
        expect(newCount).toBeGreaterThan(0);
        
        console.log('בדיקת התנתקות');
        await page.getByRole('button', { name: 'התנתק' }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByRole('heading', { name: 'התחברות' })).toBeVisible();
    });

    test('התחברות עם פרטים שגויים', async ({ page }) => {
        // הפעלת לוגים של הקונסול
        page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
        
        await page.goto('/');
        
        // מילוי פרטים שגויים
        await page.getByLabel('שם משתמש:').fill('wrong');
        await page.getByLabel('סיסמה:').fill('wrong');
        
        // לחיצה על כפתור התחברות
        await page.getByRole('button', { name: 'התחבר' }).click();
        await page.waitForLoadState('networkidle');
        
        // בדיקה שמוצגת הודעת שגיאה
        await expect(
            page.locator('.bg-red-100')
        ).toContainText('שם משתמש או סיסמה שגויים', { timeout: 30000 });
    });

    test('התחברות עם שדות ריקים', async ({ page }) => {
        // הפעלת לוגים של הקונסול
        page.on('console', msg => console.log(`[Browser] ${msg.text()}`));
        
        await page.goto('/');
        
        // לחיצה על כפתור התחברות ללא מילוי שדות
        await page.getByRole('button', { name: 'התחבר' }).click();
        await page.waitForLoadState('networkidle');
        
        // בדיקה שמוצגת הודעת שגיאה
        await expect(
            page.locator('.bg-red-100')
        ).toContainText('נא להזין שם משתמש וסיסמה', { timeout: 30000 });
    });
});
