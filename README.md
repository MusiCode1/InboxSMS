# פרוייקט InboxSMS - מערכת לניהול הודעות SMS נכנסות

## טכנולוגיות
- **Frontend Framework**: SvelteKit 2 עם Svelte 5
- **Styling**: TailwindCSS
- **Type Safety**: TypeScript
- **API Integration**: Server-Side API Calls
- **State Management**: Svelte 5 Runes ($state)
- **Authentication**: Form Actions + Server-Side Sessions
- **Session Storage**: Redis
- **Testing**: Playwright
- **Logging**: Pino

## מבנה הפרוייקט

### src/routes/+page.server.ts
מכיל את כל הלוגיקה של קריאות ה-API בצד שרת:
- `loginToApi()` - התחברות למערכת וקבלת טוקן
- `logoutFromApi()` - התנתקות מהמערכת
- `getMessagesFromApi()` - קבלת הודעות SMS
כל הפונקציות מתקשרות עם השרת בכתובת `https://www.call2all.co.il/ym/api/`

### src/lib/types.ts
הגדרות טיפוסים עבור TypeScript:
- `Message` - מבנה של הודעת SMS (תאריך, שולח, תוכן, נמען)
- `LoginResponse` - מבנה של תשובת שרת להתחברות
- `MessagesResponse` - מבנה של תשובת שרת לבקשת הודעות

### src/lib/components/
קומפוננטות משנה של האפליקציה:

#### LoginForm.svelte
קומפוננטת טופס התחברות:
- מציגה שדות שם משתמש וסיסמה
- תומכת ב-autocomplete
- מטפלת בשגיאות התחברות
- מעוצבת עם TailwindCSS

#### Message.svelte
קומפוננטה להצגת הודעת SMS בודדת:
- מקבלת כ-prop את פרטי ההודעה
- מציגה תאריך, שולח, תוכן ונמען
- מעוצבת עם TailwindCSS בצורה נקייה ומרווחת

#### MessageList.svelte
קומפוננטה להצגת רשימת הודעות:
- מקבלת כ-props את רשימת ההודעות ופונקציות לרענון והתנתקות
- מציגה כפתורי פעולה (רענון והתנתקות)
- מרנדרת את כל ההודעות באמצעות קומפוננטת Message

### src/routes/
הדפים והניתוב של האפליקציה:

#### +layout.svelte
תבנית הבסיס של האפליקציה:
- מייבאת את קובץ ה-CSS הראשי
- מגדירה את כיוון הטקסט לימין לשמאל (RTL)
- מגדירה צבע רקע בסיסי

#### +page.svelte
הדף הראשי של האפליקציה:
- מנהל את מצב ההתחברות באמצעות Form Actions
- מציג טופס התחברות או רשימת הודעות בהתאם למצב
- מטפל בשגיאות ומציג הודעות למשתמש

#### +page.server.ts
לוגיקת צד שרת:
- מנהל את קריאות ה-API
- מנהל את הסשן והטוקן
- מטפל בפעולות המשתמש (התחברות, התנתקות, רענון)

## ניהול State
- שימוש ב-$state של Svelte 5 לניהול משתנים ריאקטיביים:
  - `messages` - רשימת ההודעות
  - `error` - הודעות שגיאה
- שימוש בסשן בצד שרת לשמירת הטוקן

## פונקציונליות
1. **התחברות**:
   - טופס עם שדות שם משתמש וסיסמה
   - תמיכה ב-autocomplete
   - הצגת שגיאות התחברות
   - שמירת טוקן בסשן בצד שרת

2. **הצגת הודעות**:
   - טעינה אוטומטית בהתחברות
   - תצוגה מאורגנת ונקייה
   - מידע מלא על כל הודעה

3. **רענון הודעות**:
   - כפתור לטעינה מחדש
   - עדכון אוטומטי של התצוגה

4. **התנתקות**:
   - ניקוי טוקן וסשן
   - חזרה למסך התחברות

### src/lib/server/
שירותי צד שרת:

#### redis.ts
מודול התחברות ל-Redis:
- יצירת חיבור ל-Redis באמצעות Vercel KV
- ניהול החיבור והתאוששות משגיאות

#### session.ts
מודול ניהול סשנים:
- יצירת סשנים חדשים
- שמירה ושליפה של נתוני סשן
- ניקוי סשנים בהתנתקות

#### logger.ts
מודול לוגים עם Pino:
- רישום פעולות משתמש
- רישום שגיאות מערכת
- לוגרים ייעודיים לכל רכיב (auth, db, api, redis)
- פורמט מובנה ללוגים

### src/lib/utils/
כלי עזר:

#### forms.ts
עזרים לטיפול בטפסים:
- ולידציה של שדות
- טיפול בשגיאות
- עיבוד נתונים

## אבטחה
- קריאות API מתבצעות בצד שרת
- מערכת סשנים מבוססת Redis עם Vercel KV
- הפרדה בין אימות משתמש לטוקן API
- הצפנת סיסמה בתצוגה
- ניקוי נתונים בהתנתקות
- שכבת אבטחה נוספת עם שם משתמש וסיסמה למערכת
- לוגים מפורטים של פעולות משתמש

## עיצוב
- שימוש ב-TailwindCSS לעיצוב מודרני ונקי
- תמיכה מלאה בעברית ו-RTL
- ממשק משתמש אינטואיטיבי
- התאמה למובייל (responsive)

## הוראות הרצה

### סביבת פיתוח
1. התקנת תלויות: `npm install`
2. הרצת טסטים: `npm test`
3. הגדרת קובץ .env עם הפרטים הבאים:
   ```
   # API Credentials
   API_USERNAME=your_api_username
   API_PASSWORD=your_api_password

   # Client Credentials
   CLIENT_USERNAME=admin
   CLIENT_PASSWORD=123456

   # API URL
   API_URL=https://www.call2all.co.il/ym/api/
   ```
4. הרצת שרת פיתוח: `npm run dev`
5. גישה לאפליקציה בדפדפן: `http://localhost:5173`

## טסטים
הפרויקט כולל מערכת טסטים מקיפה עם Playwright:

### tests/login.spec.ts
טסטים למערכת ההתחברות:
- בדיקת התחברות תקינה
- בדיקת שגיאות התחברות
- בדיקת התנתקות

### הרצת טסטים
- הרצת כל הטסטים: `npm test`
- הרצת טסט ספציפי: `npm test tests/login.spec.ts`
- הרצה במצב UI: `npm run test:ui`

### סביבת ייצור (Vercel)
1. הגדרת Vercel KV (Redis):
   - יצירת מופע Redis חדש ב-Vercel Dashboard
   - העתקת פרטי החיבור (URL ו-Token) למשתני הסביבה:
     ```
     KV_REST_API_URL=your_kv_url
     KV_REST_API_TOKEN=your_kv_token
     ```
2. העלאת הפרויקט ל-Vercel
3. הגדרת כל משתני הסביבה ב-Vercel Dashboard

## פרטי התחברות למערכת
- שם משתמש: admin
- סיסמה: 123456
