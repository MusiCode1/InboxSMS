# פרוייקט InboxSMS - מערכת לניהול הודעות SMS נכנסות

## טכנולוגיות
- **Frontend Framework**: SvelteKit 2 עם Svelte 5
- **Styling**: TailwindCSS
- **Type Safety**: TypeScript
- **API Integration**: Fetch API
- **State Management**: Svelte 5 Runes ($state)

## מבנה הפרוייקט

### src/lib/api.ts
מכיל את כל הלוגיקה של קריאות ה-API:
- `login(username: string, password: string)` - התחברות למערכת וקבלת טוקן
- `logout(token: string)` - התנתקות מהמערכת
- `getMessages(token: string)` - קבלת הודעות SMS
כל הפונקציות מתקשרות עם השרת בכתובת `https://www.call2all.co.il/ym/api/`

### src/lib/types.ts
הגדרות טיפוסים עבור TypeScript:
- `Message` - מבנה של הודעת SMS (תאריך, שולח, תוכן, נמען)
- `LoginResponse` - מבנה של תשובת שרת להתחברות
- `MessagesResponse` - מבנה של תשובת שרת לבקשת הודעות

### src/lib/components/
קומפוננטות משנה של האפליקציה:

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
- מנהל את מצב ההתחברות באמצעות $state
- מציג טופס התחברות או רשימת הודעות בהתאם למצב
- מטפל בשגיאות ומציג הודעות למשתמש

## ניהול State
- שימוש ב-$state של Svelte 5 לניהול משתנים ריאקטיביים:
  - `token` - טוקן ההתחברות
  - `messages` - רשימת ההודעות
  - `username/password` - פרטי התחברות
  - `error` - הודעות שגיאה

## פונקציונליות
1. **התחברות**:
   - טופס עם שדות שם משתמש וסיסמה
   - תמיכה ב-autocomplete
   - הצגת שגיאות התחברות
   - שמירת טוקן בזיכרון

2. **הצגת הודעות**:
   - טעינה אוטומטית בהתחברות
   - תצוגה מאורגנת ונקייה
   - מידע מלא על כל הודעה

3. **רענון הודעות**:
   - כפתור לטעינה מחדש
   - עדכון אוטומטי של התצוגה

4. **התנתקות**:
   - ניקוי טוקן וזיכרון
   - חזרה למסך התחברות

## אבטחה
- שימוש בטוקן לאימות בקשות
- הצפנת סיסמה בתצוגה
- ניקוי נתונים בהתנתקות

## עיצוב
- שימוש ב-TailwindCSS לעיצוב מודרני ונקי
- תמיכה מלאה בעברית ו-RTL
- ממשק משתמש אינטואיטיבי
- התאמה למובייל (responsive)

## הוראות הרצה
1. התקנת תלויות: `npm install`
2. הרצת שרת פיתוח: `npm run dev`
3. גישה לאפליקציה בדפדפן: `http://localhost:5173` (או פורט אחר שיוקצה)
