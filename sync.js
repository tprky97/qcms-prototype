// After editing site/: node sync.js
// site/ → src/ → site/qcms-inbox.html → deploy/index.html → deploy-public/index.html
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const root = __dirname, p = (...a) => path.join(root, ...a);

// Replace exactly the given text and fail loudly if it is missing, so a renamed string never slips through silently.
function swap(s, from, to, label) {
  if (!s.includes(from)) throw new Error(`sync: "${label}" not found — update sync.js`);
  return s.split(from).join(to);
}

// 1. css/js site → src
for (const f of fs.readdirSync(p('site')).filter(f => /\.(css|js)$/.test(f))) fs.copyFileSync(p('site', f), p('src', f));
// assets too: a picture added under site/assets must reach src/assets (the local server reads src/)
for (const f of fs.readdirSync(p('site', 'assets')).filter(f => /\.(png|jpg|svg)$/.test(f))) fs.copyFileSync(p('site', 'assets', f), p('src', 'assets', f));

// 2. src/index.html with its own <title>
fs.writeFileSync(p('src', 'index.html'),
  swap(fs.readFileSync(p('site', 'index.html'), 'utf8'), '<title>صندوق وارد qCMS</title>', '<title>qCMS – الوارد</title>', 'title'));

// 3. single file
execFileSync(process.execPath, [p('build-single.js')], { stdio: 'inherit' });

// 4. deploy: motion always on
let html = fs.readFileSync(p('site', 'qcms-inbox.html'), 'utf8');
html = swap(html, 'prefers-reduced-motion:reduce', 'prefers-reduced-motion:always-animate', 'reduced-motion CSS');
html = swap(html, "matchMedia('(prefers-reduced-motion: reduce)')", "matchMedia('(prefers-reduced-motion:always-animate)')", 'reduced-motion JS');
fs.mkdirSync(p('deploy'), { recursive: true });
fs.writeFileSync(p('deploy', 'index.html'), html);

// 5. deploy-public: no government-site banner in anything published
html = swap(html, '<span>موقع حكومي رسمي تابع لحكومة المملكة العربية السعودية</span>', '<span>نموذج تصميم تجريبي — qCMS</span>', 'gov banner');
fs.mkdirSync(p('deploy-public'), { recursive: true });
fs.writeFileSync(p('deploy-public', 'index.html'), html);

console.log('synced: src/ · deploy/index.html · deploy-public/index.html');
