# 🚀 מדריך הפעלה ואחסון בחינם (0$ הוצאות) עבור SubSnap

מדריך זה מפרט שלב אחר שלב כיצד להפעיל, לארח ולתחזק את **SubSnap** בעלות של **0$ לחודש** (ללא שום הוצאות על AI, שרתים או בסיסי נתונים).

---

## 1. הגדרת בינה מלאכותית חינמית (Google Gemini Free Tier)
המערכת משתמשת כעת באופן בלעדי ב-**Gemini 2.5 Flash / Gemini 2.0 Flash**.

- **איך מקבלים מפתח חינם:**
  1. נכנסים לאתר [Google AI Studio](https://aistudio.google.com/).
  2. מתחברים עם חשבון Google ולוחצים על **"Get API key"** -> **"Create API key"**.
  3. מעתיקים את המפתח שנוצר.
- **מה המגבלות החינמיות של גוגל:**
  - עד **15 בקשות לדקה (RPM)**.
  - עד **1,500 סריקות תדפיסים ביום** ללא עלות!

---

## 2. הגדרת Redis חינמי (Upstash Redis Free Tier)
המערכת משתמשת ב-Redis לניהול סריקות, קצב בקשות (Rate Limiting) ומניעת עומסים.
*(הערה: אם תבחר לא להגדיר Redis, המערכת תפעל אוטומטית במצב In-Memory מקומי ללא שגיאות!)*

- **איך מקבלים חשבון חינם:**
  1. נכנסים ל-[Upstash](https://upstash.com/) ונרשמים בחינם.
  2. יוצרים מסד נתונים חדש (Redis Database) במיקום הקרוב ביותר.
  3. מעתיקים את `UPSTASH_REDIS_REST_URL` ואת `UPSTASH_REDIS_REST_TOKEN`.
- **מגבלה חינמית:** עד **10,000 פקודות ביום** בחינם.

---

## 3. אחסון האתר בחינם (Vercel Free Tier)
אתר ה-Next.js ניתן לאחסון בחינם לחלוטין ב-Vercel.

1. מעלים את הפרויקט ל-GitHub (ריפו פרטי או ציבורי).
2. מתחברים ל-[Vercel.com](https://vercel.com/) ומייבאים את ה-Repository.
3. במסך ההגדרות ב-Vercel (Environment Variables), מוסיפים את:
   - `GEMINI_API_KEY` = המפתח שהוצאת מ-Google AI Studio.
   - `UPSTASH_REDIS_REST_URL` = כתובת ה-Redis מ-Upstash (אופציונלי).
   - `UPSTASH_REDIS_REST_TOKEN` = הטוקן מ-Upstash (אופציונלי).
   - `NEXT_PUBLIC_BASE_URL` = הדומיין של האתר שלך ב-Vercel (לדוגמה: `https://my-subsnap.vercel.app`).
4. לוחצים על **Deploy**. האתר באוויר ב-0$!

---

## 4. שרת האוטומציה (Playwright) ב-0$
שרת האוטומציה (`railway-server`) מיועד לביטול אוטומטי מבוסס דפדפן. יש לך 3 דרכים להריץ אותו בחינם:

1. **שימוש בקישורים ישירים (Deep Links) ללא שרת אוטומציה:**
   - הפרויקט כולל מאגר של מעל 2,400 שירותים עם קישורי ביטול ישירים (`jdm-db`).
   - המשתמש מקבל קישור ישיר לעמוד ביטול המנוי של השירות (נטפליקס, ספוטיפיי וכו') ומבטל בלחיצה אחת. אפס עלויות שרת!
2. **Render.com / Fly.io (Free Tier):**
   - ניתן להעלות את תיקיית `railway-server` כ-Web Service חינמי ב-Render או Fly.io ולהגדיר את משתנה הסביבה `RAILWAY_SERVER_URL` ב-Vercel.
3. **Oracle Cloud Always Free VPS:**
   - אורקל מספקת שרת ענן וירטואלי חינמי לתמיד (עד 4 ליבות ו-24GB RAM). ניתן להריץ עליו את שרת ה-Playwright ללא שום עלות.

---

## 5. סיכום עלויות חודשיות

| שירות | ספק | עלות חודשית |
| :--- | :--- | :--- |
| **מודל AI לניתוח תדפיסים** | Google Gemini 2.5 Flash | **0$** (עד 1,500 ביום) |
| **אירוח אתר (Frontend & API)** | Vercel Hobby Tier | **0$** |
| **בסיס נתונים ו-Rate Limiting** | Upstash Redis Free | **0$** |
| **מנוע ביטול מנויים** | קישורי Deep Links / Render Free | **0$** |
| **סה"כ עלות לבעל המוצר** | | **0.00$ לחודש** |

---

## 6. הרצה מקומית במחשב שלך

```bash
# 1. שכפול קובץ ההגדרות
cp .env.example .env.local

# 2. הוספת GEMINI_API_KEY לקובץ .env.local

# 3. התקנת תלויות
npm install

# 4. הרצת שרת הפיתוח
npm run dev
```
