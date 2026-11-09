# qCMS — نموذج تصميم تجريبي

بروتوتايب لنظام إدارة المراسلات والمعاملات (qCMS) — عربي RTL، **HTML/CSS/JS سادة من غير أي framework ولا build tools**.

> ⚠️ ده نموذج تصميم تجريبي للعرض فقط — مفيش backend ولا بيانات حقيقية.

---

## التشغيل

مفيش `npm install` ولا build step مطلوب للتطوير. أي static server يكفي:

```bash
node serve.js
```

وبعدين افتح `http://localhost:8770/site/index.html`

> **ملحوظة ويندوز:** سيرفر `python -m http.server` بيبعت ملفات SVG كـ `application/octet-stream` فالأيقونات بتظهر مكسورة محليًا بس. استخدم `node serve.js` عشان تتجنب ده.

---

## هيكل المشروع

```
site/                    ← المصدر الوحيد للحقيقة (كل الشغل هنا)
  index.html             ← كل الصفحة + كل الـ popovers والبانلات
  styles.css             ← ستايل الصفحة
  popovers.css           ← ستايل المنيوهات والبانلات
  dashboard.css          ← ستايل الصفحة الرئيسية (لوحة الإحصائيات)
  login.css              ← شاشة الدخول + بوب أب التعريف
  app.js                 ← بيانات الإيميلات وعرضها (MAILS / READ / renderReader) + الفولدرات
  popovers.js            ← المنيوهات، الملاحظات، الإشعارات، منيو المنصات، شات Qemam AI
  dashboard.js           ← الصفحة الرئيسية كلها (DASHBOARD_DATA + كل الرسوم)
  rules.js               ← قواعد البريد (زي Outlook)
  login.js               ← لوجيك شاشة الدخول والـ onboarding
  icons.js / icons2.js   ← كل الأيقونات SVG في object اسمه ICONS
  assets/                ← الصور والأيقونات

sync.js                  ← 🔁 بعد أي تعديل في site/ شغّله: بيعمل src/ والنسخة المدمجة و deploy/
build-single.js          ← بيولّد site/qcms-inbox.html (نسخة ملف واحد) — sync.js بينده عليه
serve.js                 ← static server بسيط على بورت 8770
HANDOFF-qCMS.md          ← 📖 كل تاريخ المشروع والقرارات — اقراه قبل ما تبدأ
```

### بعد أي تعديل

```bash
node sync.js
```

بيعمل: نسخ `site/` ← `src/` · يولّد `site/qcms-inbox.html` · يعمل `deploy/index.html` و`deploy-public/index.html` (الحركة شغالة دايمًا فيهم، وسطر «موقع حكومي رسمي…» متبدّل بـ «نموذج تصميم تجريبي — qCMS» في النسخة العامة).

### ملفات مش في الريبو (مولّدة محليًا)

`site/qcms-inbox.html` · `src/` · `deploy/` · `deploy-public/` — كلها ناتج `sync.js`. اتعملها ignore عن قصد: ملف 9MB بيتغير بالكامل مع أي تعديل، يعني تعارض في كل PR تقريبًا.

---

## قبل ما تبدأ شغل

1. **اقرا [`HANDOFF-qCMS.md`](HANDOFF-qCMS.md)** — فيه كل القرارات والتفاصيل (الألوان، الكومبوننتس، كل تعديل اتعمل وليه).
2. **اقرا [`CONTRIBUTING.md`](CONTRIBUTING.md)** — قواعد الشغل الجماعي وإزاي نتجنب التعارضات.

---

## الديزاين سيستم

- **Makeen Design System (Copy) last** — https://www.figma.com/design/M6lXPB1F7H3gsaoiVkni6Z/Makeen-Design-System--Copy--last
- **ملف التصميم** — https://www.figma.com/design/UCXrgqC0EYJNvEH8TO2oHJ/qCMS---Design-
- الأزرق الأساسي = primary/450 `#1D66F2` (`--blue`) · الهوفر primary/500 `#0052F2` (`--blue-700`)
- الخط: IBM Plex Sans Arabic
