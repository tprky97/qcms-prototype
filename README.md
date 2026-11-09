# qCMS — نموذج تصميم تجريبي

بروتوتايب لنظام إدارة المراسلات والمعاملات (qCMS) — عربي RTL، **HTML/CSS/JS سادة من غير أي framework ولا build tools**.

> ⚠️ ده نموذج تصميم تجريبي للعرض فقط — مفيش backend ولا بيانات حقيقية.

---

# 🚀 ابدأ من هنا

## أول مرة بس (مرة واحدة على جهازك)

**1. سطّب Git** — من https://git-scm.com/downloads (أو على ويندوز: `winget install Git.Git`)

**2. نزّل المشروع:**

```bash
git clone https://github.com/tprky97/qcms-prototype.git
```

```bash
cd qcms-prototype
```

**3. اتأكد إنه شغال:**

```bash
node serve.js
```

وبعدين افتح `http://localhost:8770/site/index.html`

**4. اقرا الاتنين دول قبل ما تكتب سطر واحد:**
- [`HANDOFF-qCMS.md`](HANDOFF-qCMS.md) — كل تاريخ المشروع والقرارات (الألوان، الكومبوننتس، كل تعديل اتعمل وليه)
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — تقسيمة الملفات بين الفريق وقواعد الكود

---

## ✅ قبل أي شغل (كل مرة)

**1. هات آخر تحديثات من الفريق:**

```bash
git checkout main
```

```bash
git pull
```

**2. اعمل فرع جديد للتاسك بتاعك** — ما تشتغلش على `main` أبدًا:

```bash
git checkout -b feature/اسم-التاسك
```

أمثلة: `feature/english-ui` · `fix/rtl-chevrons` · `feature/dashboard-w23`

**3. شغّل السيرفر وانت بتشتغل:**

```bash
node serve.js
```

> ⚠️ **اتفق مع الفريق على مين ماسك أنهي ملف قبل ما تبدأ** — الجدول في [`CONTRIBUTING.md`](CONTRIBUTING.md). ده اللي بيمنع التعارضات.

---

## 📤 بعد ما تخلص الشغل (كل مرة)

**1. شوف إيه اللي اتغير:**

```bash
git status
```

**2. اكتب سطر أو اتنين في `HANDOFF-qCMS.md`** عن اللي عملته بالتاريخ — ده مش اختياري، هو اللي بيخلي أي حد يقدر يكمّل بعدك.

**3. ضيف التعديلات واعمل commit:**

```bash
git add .
```

```bash
git commit -m "وصف قصير للي اتعمل"
```

**4. ارفع الفرع:**

```bash
git push -u origin feature/اسم-التاسك
```

**5. افتح Pull Request:**
- روح على https://github.com/tprky97/qcms-prototype
- هيظهرلك زرار أصفر **«Compare & pull request»** — اضغطه
- اكتب في الوصف: **إيه اللي اتعمل** و**أنهي ملفات اتلمست**
- استنى واحد من الفريق يراجع، وبعدين **Merge**

**6. بعد الـ merge، نضّف وراك:**

```bash
git checkout main
```

```bash
git pull
```

---

## 🔄 لو الفريق رفع حاجة وانت لسه شغال

```bash
git checkout main && git pull
```

```bash
git checkout feature/فرعك
```

```bash
git merge main
```

لو ظهر تعارض (conflict) في `index.html`، غالبًا الحل إنك تاخد **الاتنين** — كل واحد ضايف ماركب في مكان مختلف.

---

## 🌐 من غير Git (من المتصفح)

لو مش عايز تسطّب حاجة:

- **تعديلات صغيرة:** افتح الريبو واضغط زرار `.` (نقطة) على الكيبورد → بيفتح VS Code في المتصفح (github.dev). عدّل، وبعدين commit من بانل **Source Control**.
- **تحميل نسخة بس من غير تعديل:** زرار **Code ▾ → Download ZIP**.

بس للشغل الجدّي مع Claude Code، **سطّب Git** — هيوفر وقت كتير.

---

## ⚠️ قاعدة مهمة: `node sync.js` مش مع كل commit

```bash
node sync.js
```

ده بيعمل: نسخ `site/` ← `src/` · يولّد `site/qcms-inbox.html` · يعمل `deploy/index.html` و`deploy-public/index.html`.

**شغّله وقت النشر أو لما تحتاج تجرّب النسخة المدمجة بس** — مش مع كل commit. الملفات دي كلها معمولها ignore عن قصد (ملف 9MB بيتغير بالكامل مع أي تعديل = تعارض في كل PR).

---

# 📁 هيكل المشروع

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

sync.js                  ← بعد أي تعديل في site/ وقت النشر: بيعمل src/ والنسخة المدمجة و deploy/
build-single.js          ← بيولّد site/qcms-inbox.html (نسخة ملف واحد) — sync.js بينده عليه
serve.js                 ← static server بسيط على بورت 8770
HANDOFF-qCMS.md          ← 📖 كل تاريخ المشروع والقرارات
CONTRIBUTING.md          ← 👥 قواعد الشغل الجماعي وتقسيمة الملفات
```

### ملفات مش في الريبو (بتتولّد محليًا)

`site/qcms-inbox.html` · `src/` · `deploy/` · `deploy-public/` — كلها ناتج `sync.js`.

> **ملحوظة ويندوز:** سيرفر `python -m http.server` بيبعت ملفات SVG كـ `application/octet-stream` فالأيقونات بتظهر مكسورة محليًا بس. استخدم `node serve.js`.

---

# 🎨 الديزاين سيستم

- **Makeen Design System (Copy) last** — https://www.figma.com/design/M6lXPB1F7H3gsaoiVkni6Z/Makeen-Design-System--Copy--last
- **ملف التصميم** — https://www.figma.com/design/UCXrgqC0EYJNvEH8TO2oHJ/qCMS---Design-
- الأزرق الأساسي = primary/450 `#1D66F2` (`--blue`) · الهوفر primary/500 `#0052F2` (`--blue-700`)
- الخط: IBM Plex Sans Arabic
