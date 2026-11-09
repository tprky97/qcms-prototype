// Bundles site/index.html into the single-file site/qcms-inbox.html: node build-single.js
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'site');
const read = f => fs.readFileSync(path.join(dir, f), 'utf8');
const mime = { '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const dataUri = f => `data:${mime[path.extname(f)]};base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}`;
const inlineAssets = s => s.replace(/assets\/[\w-]+\.(png|jpg|svg)/g, dataUri);

let html = read('index.html');
html = html.replace(/<link rel="stylesheet" href="([^"]+)">/g, (_, f) => `<style>\n${inlineAssets(read(f))}\n</style>`);
html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, f) => {
  let js = read(f);
  if (f === 'app.js') {
    // mail and notification avatars are picked at runtime, so ship them as a lookup table
    const names = fs.readdirSync(path.join(dir, 'assets')).filter(f => /^av_\w+\.png$/.test(f)).map(f => f.slice(0, -4));
    const table = Object.fromEntries(names.map(n => [n, dataUri(`assets/${n}.png`)]));
    js = `const AVATARS = ${JSON.stringify(table)};\n` + js.replace('src="assets/${m.img}.png"', 'src="${AVATARS[m.img]}"');
  }
  return `<script>\n${js}\n</script>`;
});
html = inlineAssets(html);
fs.writeFileSync(path.join(dir, 'qcms-inbox.html'), html);
console.log('qcms-inbox.html', Math.round(html.length / 1024) + ' KB');
