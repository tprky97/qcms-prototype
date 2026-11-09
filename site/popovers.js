// Popovers, menus, notes panel and dialogs
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const svg = k => ICONS[k] || '';
const injectIcons = root => $$('i[data-i]', root).forEach(el => { el.outerHTML = svg(el.dataset.i); });
injectIcons(document);

// Makeen "Notification Toast" (RTL, desktop): white card, coloured edge, round icon, close button.
// Confirmations ("تم …") show as success, anything else as info.
const TOAST_ICON = {
  success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.25" stroke="currentColor" stroke-width="1.5"/><path d="m8 12.5 2.75 2.75L16 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9.25" stroke="currentColor" stroke-width="1.5"/><path d="M12 16.5v-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="12" cy="8" r="1" fill="currentColor"/></svg>',
};
function toast(msg, type = /^تمت?\s/.test(msg) ? 'success' : 'info') {
  const t = $('#toast');
  t.className = 'toast ' + type;
  t.innerHTML = '<span class="t-ic">' + TOAST_ICON[type] + '</span><span class="t-msg"></span><button class="t-close" aria-label="إغلاق"><svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5.5 5.5l9 9M14.5 5.5l-9 9" stroke="#384250" stroke-width="1.5" stroke-linecap="round"/></svg></button>';
  $('.t-msg', t).textContent = msg;
  void t.offsetWidth;  // restart the slide-in when a toast replaces another
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 3000);
}
$('#toast').addEventListener('click', e => { if (e.target.closest('.t-close')) e.currentTarget.classList.remove('show'); });

// ---------- positioning ----------
let current = null, currentTrigger = null;

function place(pop, trigger, mode) {
  const r = trigger.getBoundingClientRect();
  if (pop.classList.contains('drawer')) {        // drawers are pinned to the left edge by CSS
    // the chat grows out of its trigger (offsets ignore the running scale animation)
    if (pop.classList.contains('chat')) pop.style.transformOrigin = `${r.left + r.width / 2 - pop.offsetLeft}px ${r.top + r.height / 2 - pop.offsetTop}px`;
    return;
  }
  pop.style.left = pop.style.top = '0px';
  const w = pop.offsetWidth, h = pop.offsetHeight, vw = innerWidth, vh = innerHeight, m = 8;
  let x, y;
  if (mode === 'side') {                       // rail panels open to the left of the rail
    x = r.left - w - 14; y = r.top - 8;
  } else if (mode === 'beside') {              // tall panels sit next to their trigger instead of covering it
    x = r.left - w - 8; y = r.top;
  } else {
    x = r.right - w;                           // RTL: align right edges
    if (x < m) x = r.left;                     // not enough room → align left edges
    y = r.bottom + 6;
    if (y + h > vh - m && r.top - h - 6 > m) y = r.top - h - 6;  // flip above
  }
  pop.style.left = Math.max(m, Math.min(x, vw - w - m)) + 'px';
  pop.style.top = Math.max(m, Math.min(y, vh - h - m)) + 'px';
}

function openPop(id, trigger, mode) {
  const pop = document.getElementById(id);
  if (current === pop && currentTrigger === trigger) return closePop();
  closePop();
  pop.classList.add('open');
  place(pop, trigger, mode);
  trigger.setAttribute('aria-expanded', 'true');
  current = pop; currentTrigger = trigger;
  if (id === 'pop-notes') renderNotes();
  if (id === 'pop-notifs') renderNotifs();
  if (id === 'pop-apps') fitAppNames();
  if (id === 'pop-ai') syncAiMenu();
}

function closePop() {
  if (!current) return;
  current.classList.remove('open');
  currentTrigger && currentTrigger.setAttribute('aria-expanded', 'false');
  closeNoteActions();
  current.querySelectorAll('.mi-sub.open').forEach(s => { s.classList.remove('open'); s.firstElementChild.setAttribute('aria-expanded', 'false'); });  // submenus start closed next time
  current = currentTrigger = null;
}

// ---------- wire triggers ----------
const toolbar = label => $(`.rtool [aria-label="${label}"]`);
const TRIGGERS = [
  [$('.rtool .rbtn.ai'), 'pop-ai'],
  [$$('.rtool .rbtn')[1], 'pop-ihala'],
  [toolbar('المزيد'), 'pop-edit'],
  [toolbar('متابعة'), 'pop-follow'],
  [$('.list [aria-label="ترتيب"]'), 'pop-sort'],
  [$('.list [aria-label="تصفية"]'), 'pop-filter', 'beside'],
  [$('.split'), 'pop-sign'],
  [$$('.actions > .btn')[1], 'pop-tashir'],
  [$('#user-btn'), 'pop-account'],
  [$('.utility .tool'), 'pop-a11y'],
  [$('.rail [aria-label="المساعدة"]'), 'pop-help', 'side'],
  [$('.rail [aria-label="الملاحظات"]'), 'pop-notes', 'side'],
  [$('.header [aria-label="إنشاء"]'), 'pop-create'],
  [$('#sp-new-req'), 'pop-request'],
  [$('.header [aria-label="الإشعارات"]'), 'pop-notifs'],
  [$('.header .rail-btn.platforms'), 'pop-apps'],
  [$('.header .rail-btn.ai'), 'pop-chat'],
  [$('.ai-float'), 'pop-chat'],
];
TRIGGERS.forEach(([el, id, mode]) => {
  if (!el) return;
  el.setAttribute('aria-haspopup', 'true');
  el.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openPop(id, el, mode); });
});

// قبول / رفض on a request answer it right away
$('.actions').addEventListener('click', e => {
  const b = e.target.closest('.ok, .no');
  if (b) toast(b.classList.contains('ok') ? 'تم قبول الطلب' : 'تم رفض الطلب');
});

// Sender arrow opens the transaction details (Figma overlay)
const senderArrow = $('.sender-arrow');
senderArrow.addEventListener('click', e => { e.stopPropagation(); openPop('pop-details', senderArrow); });

// Selection bar actions
const selFwd = $('#sel-fwd'), selMore = $('#sel-more');
selFwd.addEventListener('click', e => { e.stopPropagation(); openPop('pop-ihala', selFwd); });
selMore.addEventListener('click', e => { e.stopPropagation(); openPop('pop-edit', selMore); });

// Mail-row "⋮" opens the edit menu
$('#items').addEventListener('click', e => {
  const more = e.target.closest('.more');
  if (more) { e.stopPropagation(); openPop('pop-edit', more); }
}, true);

// Toolbar tooltips
[['حفظ', 'حفظ مؤقت'], ['غير مقروء', 'تحديد كغير مقروءة'], ['متابعة', 'عاجلة'], ['المزيد', 'المزيد']].forEach(([label, tip]) => {
  const b = toolbar(label);
  if (!b) return;
  b.classList.add('tt');
  b.insertAdjacentHTML('beforeend', `<span class="tip">${tip}</span>`);
});

// Close on outside click / Escape / scroll — except the AI chat, which closes only from its round X button
const pinned = () => current === chatEl;
document.addEventListener('click', e => {
  if (!current || pinned()) return;
  if (!e.target.isConnected || current.contains(e.target) || $('#confirm').contains(e.target)) return;
  closePop();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if ($('#confirm.open')) return closeConfirm(); if (!pinned()) closePop(); } });
addEventListener('resize', () => { if (!pinned()) closePop(); });
$$('[data-close]').forEach(b => b.addEventListener('click', closePop));

// Generic: menu items close their menu
$$('.pop.menu, .pop.help, .pop.account').forEach(menu => menu.addEventListener('click', e => {
  const item = e.target.closest('button');
  if (!item) return;
  if (item.dataset.open) { const t = currentTrigger; closePop(); openPop(item.dataset.open, $('.rail [aria-label="الملاحظات"]') || t, 'side'); return; }
  if (item.dataset.act === 'print') { closePop(); print(); return; }
  if (item.dataset.acc === 'lang') return;  // opens its submenu instead of closing the menu
  if (item.hasAttribute('data-sub')) { const s = item.parentElement, on = s.classList.toggle('open'); item.setAttribute('aria-expanded', String(on)); return; }  // same for a submenu item
  closePop();
}));

// ---------- account menu: links and the language submenu ----------
const accLang = $('#pop-account .acc-lang');
const setAccLang = on => { accLang.classList.toggle('open', on); $('[data-acc="lang"]', accLang).setAttribute('aria-expanded', String(on)); };
$('#pop-account').addEventListener('click', e => {
  const item = e.target.closest('[data-acc],[data-lang]');
  if (!item) return;
  if (item.dataset.acc === 'lang') return setAccLang(!accLang.classList.contains('open'));
  if (item.dataset.lang) {
    $$('.acc-opt', accLang).forEach(o => { const on = o === item; o.classList.toggle('on', on); o.setAttribute('aria-checked', String(on)); });
    $('.acc-val', accLang).textContent = item.textContent.trim();
    if (item.dataset.lang === 'en') toast('الواجهة الإنجليزية قيد التطوير');
    return setAccLang(false);
  }
  toast('جارٍ فتح ' + item.textContent.trim());
});
$('#user-btn').addEventListener('click', () => setAccLang(false));  // the submenu starts closed each time

// ---------- follow-up flag ----------
$('#pop-follow').addEventListener('click', e => {
  const item = e.target.closest('[data-flag]');
  if (!item) return;
  const mail = $('.mail.active');
  if (mail) {
    const on = item.dataset.flag === '1';
    setFlag(mail, on);
    toast(on ? 'تمت إضافة علامة متابعة: ' + item.textContent.trim() : item.textContent.trim());
  }
}, true);

// ---------- sort ----------
$('#pop-sort').addEventListener('click', e => {
  const item = e.target.closest('[data-sort]');
  if (!item || item.classList.contains('sel')) return;
  $$('#pop-sort [data-sort]').forEach(x => {
    const on = x === item;
    x.classList.toggle('sel', on);
    x.firstElementChild.outerHTML = on ? svg('m_tick') : '<span class="ph"></span>';
  });
  $$('.day-items').forEach(g => [...g.children].reverse().forEach(c => g.appendChild(c)));
}, true);

// ---------- attachments view ----------
// ⋮ beside «المرفقات» picks all cards at once (wrapped) or one row to scroll through; the choice stays across mails
$('.attachments').addEventListener('click', e => {
  const dots = e.target.closest('.dots');
  if (dots) { e.stopPropagation(); openPop('pop-attview', dots); }
});
$('#pop-attview').addEventListener('click', e => {
  const item = e.target.closest('[data-view]');
  if (!item) return;
  $('.attachments').classList.toggle('seq', item.dataset.view === 'seq');
  closePop();
});

// ---------- filter ----------
// Figma «تصفية» flow: every field is a multi-select dropdown; picks show in the field, and «عرض النتائج (N)» filters the inbox
const FILTERS = [
  { k: 'act', label: 'الإجراءات', ph: 'اختر الإجراء', opts: ['إحالة سريعة', 'حفظ', 'استكمال للدراسة'] },
  { k: 'st', label: 'الحالة', ph: 'اختر الحالة', opts: ['الجديد', 'مؤجل', 'عاجلة', 'للتوقيع'] },
  { k: 'type', label: 'نوع المعاملة', ph: 'اختر نوع المعاملة', opts: ['موارد بشرية', 'الاتصالات الإدارية', 'التطوير'] },
  { k: 'cls', label: 'التصنيف', ph: 'اختر التصنيف', opts: ['معاملات', 'رسائل', 'طلبات'] },
  { k: 'src', label: 'مصدر المعاملة', ph: 'اختر الجهة المرسلة', groups: [
    ['داخلي', ['مكتب الأمين', 'الإدارة العامة للموارد البشرية', 'الإدارة العامة للمراجعة الداخلية', 'الإدارة العامة للشؤون الخارجية']],
    ['خارجي', ['وزارة البلديات والإسكان', 'ديوان المراقبة العامة', 'هيئة الرقابة ومكافحة الفساد']]] },
  { k: 'dir', label: 'التوجيه', ph: 'اختر التوجيه', opts: ['لإكمال اللازم', 'للإطلاع و التوجيه', 'للإفادة', 'للاطلاع', 'للإحاطة', 'إعادة ومراجعة'] },
];
const fPop = $('#pop-filter'), fDates = $$('.date input', fPop);
const optRow = (k, o) => `<label class="dd-opt"><input type="checkbox" data-k="${k}" value="${o}"><span>${o}</span></label>`;
$('.f-dds', fPop).outerHTML = FILTERS.map(f => `
    <div class="fld" data-k="${f.k}">${f.label}
      <div class="dd">
        <div class="select" role="button" tabindex="0" aria-haspopup="listbox"><span class="val">${f.ph}</span><button class="clr" aria-label="مسح ${f.label}" hidden>${svg('x18')}</button><i data-i="fl_chev"></i></div>
        <div class="dd-menu">${f.groups
          ? `<label class="lsearch"><i data-i="search16"></i><input placeholder="ابحث"></label>` + f.groups.map(([g, list], i) =>
            `<div class="dd-grp${i ? '' : ' open'}"><button class="dd-gh">${g}<i data-i="fl_chev"></i></button><div class="dd-gl">${list.map(o => optRow(f.k, o)).join('')}</div></div>`).join('')
          : f.opts.map(o => optRow(f.k, o)).join('')}</div>
      </div>
    </div>`).join('');
injectIcons(fPop);

const picked = k => $$(`.dd-opt input[data-k="${k}"]:checked`, fPop).map(i => i.value);
// a row matches when, in every field with picks, it has at least one of them
function rowFacts(row) {
  const m = ALL_MAILS[row.dataset.i], g = $('.lbl', row.closest('.day-items').previousElementSibling).textContent;
  return { ...FACTS[m.key], st: [['اليوم', 'أمس'].includes(g) && 'الجديد', row.classList.contains('late') && 'مؤجل', row.classList.contains('flag') && 'عاجلة', READ[m.key].acts.sign && 'للتوقيع'],
    day: (m.date || MAILS.find(x => x.items.includes(m)).date).slice(0, 10).split('/').reverse().join('-') };
}
function matches(row) {
  const f = rowFacts(row), [from, to] = fDates.map(i => i.value);
  return FILTERS.every(({ k }) => { const p = picked(k); return !p.length || p.some(v => [].concat(f[k]).includes(v)); })
    && (!from || f.day >= from) && (!to || f.day <= to);
}
const dateRadios = $$('#pop-filter input[name="dt"]');
const anyPick = () => !!$('.dd-opt input:checked', fPop) || fDates.some(i => i.value);
function syncFilter() {
  FILTERS.forEach(({ k, ph }) => {
    const fld = $(`.fld[data-k="${k}"]`, fPop), p = picked(k);
    $('.val', fld).textContent = p.join('، ') || ph;
    fld.classList.toggle('has', !!p.length);
    $('.clr', fld).hidden = !p.length;
  });
  const on = anyPick();
  $('#f-apply').disabled = !on;
  $('#f-apply').textContent = on ? `عرض النتائج (${$$('#items .mail:not(.out)').filter(matches).length})` : 'عرض النتائج';
  $('#f-reset').disabled = !on && dateRadios[0].checked;
}
// one dropdown open at a time; it drops over the fields below it
const closeDD = () => $$('.dd.open', fPop).forEach(d => d.classList.remove('open'));
fPop.addEventListener('click', e => {
  const sel = e.target.closest('.select'), clr = e.target.closest('.clr'), gh = e.target.closest('.dd-gh');
  if (clr) { $$('.dd-opt input', clr.closest('.dd')).forEach(i => { i.checked = false; }); closeDD(); return syncFilter(); }
  if (gh) { const grp = gh.parentElement; $$('.dd-grp', grp.parentElement).forEach(x => x.classList.toggle('open', x === grp && !grp.classList.contains('open'))); return; }
  if (sel) { const dd = sel.parentElement, was = dd.classList.contains('open'); closeDD(); dd.classList.toggle('open', !was); return; }
  if (!e.target.closest('.dd-menu')) closeDD();
});
fPop.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.select')) { e.preventDefault(); e.target.click(); } });
fPop.addEventListener('change', e => { if (e.target.matches('.dd-opt input')) syncFilter(); });
// the source list narrows as you type
$('.dd-menu .lsearch input', fPop).addEventListener('input', e => {
  const q = e.target.value.trim(), menu = e.target.closest('.dd-menu');
  $$('.dd-opt', menu).forEach(o => { o.hidden = !!q && !o.textContent.includes(q); });
  if (q) $$('.dd-grp', menu).forEach(g => g.classList.add('open'));
});
// dates: the field opens the native picker and shows the pick as يوم/شهر/سنة
fDates.forEach(inp => {
  const box = inp.closest('.date');
  box.addEventListener('click', e => { e.preventDefault(); try { inp.showPicker(); } catch { inp.focus(); } });
  inp.addEventListener('change', () => {
    $('.dv', box).textContent = inp.value ? inp.value.split('-').reverse().join('/') : 'يوم/شهر/سنة';
    box.classList.toggle('filled', !!inp.value);
    syncFilter();
  });
});
dateRadios.forEach(r => r.addEventListener('change', syncFilter));
// apply hides the rows that don't match, and any date group left empty; the group counts follow
const filterBtn = $('.list [aria-label="تصفية"]');
function applyFilter(on) {
  $$('#items .mail').forEach(r => { r.hidden = on && !matches(r); });
  syncDays();   // app.js: groups follow the rows the open folder and the filter leave
  filterBtn.classList.toggle('filtered', on);
  const empty = on && !$$('#items .mail:not([hidden]):not(.out)').length;
  $('#items').hidden = empty;
  $('#filter-empty').hidden = !empty;
}
$('#f-apply').addEventListener('click', () => {
  const n = $$('#items .mail:not(.out)').filter(matches).length;
  applyFilter(true); closePop(); toast(`تم تطبيق التصفية — ${n} معاملة`);
});
$('#f-reset').addEventListener('click', () => {
  $$('.dd-opt input', fPop).forEach(i => { i.checked = false; });
  fDates.forEach(i => { i.value = ''; i.dispatchEvent(new Event('change')); });
  dateRadios[0].checked = true;
  closeDD(); syncFilter(); applyFilter(false);
});
syncFilter();

// ---------- accessibility ----------
let zoom = 1;
$$('#pop-a11y .opt').forEach(o => o.addEventListener('click', () => {
  const a = o.dataset.a;
  if (a === 'hc') { o.classList.toggle('on', document.body.classList.toggle('hc')); }
  if (a === 'voice') { o.classList.toggle('on'); toast(o.classList.contains('on') ? 'تم تفعيل القراءة الصوتية' : 'تم إيقاف القراءة الصوتية'); }
  if (a === 'zin') zoom = Math.min(1.3, zoom + .1);
  if (a === 'zout') zoom = Math.max(.8, zoom - .1);
  document.documentElement.style.zoom = zoom;
}));
$('#a11y-reset').addEventListener('click', () => {
  zoom = 1; document.documentElement.style.zoom = '';
  document.body.classList.remove('hc');
  $$('#pop-a11y .opt').forEach(o => o.classList.remove('on'));
});

// ---------- notes ----------
const COLORS = ['#9da4ae', '#ffb300', '#1d66f2', '#067647', '#b42318'];
let notes = [
  { t: 'متابعة معاملة رقم 4521', b: 'التواصل مع إدارة الموارد البشرية بخصوص اعتماد الطلب قبل نهاية الأسبوع الجاري', d: 'منذ ساعتين', c: '#ffb300' },
  { t: 'اجتماع لجنة المشتريات', b: 'الأحد 10 صباحاً — تجهيز ملخص العروض المقدمة ومقارنة الأسعار', d: 'أمس', c: '#1d66f2' },
  { t: 'عاجل: خطاب وزارة المالية', b: 'الرد على الخطاب الوارد قبل يوم الخميس', d: '12 أكتوبر 2026', c: '#b42318' },
  { t: 'أرقام التواصل', b: 'مكتب الشؤون القانونية: تحويلة 2210', d: '8 أكتوبر 2026', c: '#9da4ae' },
  { t: 'تم الإنجاز', b: 'رفع تقرير الربع الثالث للإدارة العليا', d: '5 أكتوبر 2026', c: '#067647' },
];
let noteView = 'list', editing = null, query = '', pendingDelete = null;
const notesEl = $('#pop-notes');
const swatches = sel => `<div class="swatches">${COLORS.map(c => `<button class="sw${c === sel ? ' on' : ''}" style="--c:${c}" data-c="${c}" aria-label="لون"></button>`).join('')}</div>`;

function renderNotes() {
  if (noteView === 'edit') return renderEditor();
  const list = notes.filter(n => !query || (n.t + n.b).includes(query));
  notesEl.innerHTML = `
    <div class="hd"><h4>الملاحظات</h4><span class="n">${notes.length}</span><span class="sp"></span>
      ${notes.length ? `<button class="add-note" data-n="add">${svg('n_add')}إضافة ملاحظة</button>` : ''}
      <button class="xbtn" data-n="close" aria-label="إغلاق">${svg('x18')}</button></div>
    ${notes.length ? `
      <label class="nsearch">${svg('n_search')}<input placeholder="ابحث في الملاحظات..." value="${query}"></label>
      <div class="nlist">${list.map((n, i) => `
        <div class="note" style="--c:${n.c}" data-idx="${notes.indexOf(n)}">
          <div class="t"><span>${n.t}</span><button class="dots" data-n="actions" aria-label="خيارات">${svg('n_more')}</button></div>
          <div class="b">${n.b}</div><div class="d">${n.d}</div>
        </div>`).join('')}</div>`
    : `<div class="empty"><span class="ic">${svg('h_note')}</span><b>لا توجد ملاحظات بعد</b><button data-n="add">${svg('n_add')}إضافة ملاحظة</button></div>`}`;
  const inp = $('.nsearch input', notesEl);
  if (inp) inp.addEventListener('input', () => { query = inp.value; const pos = inp.selectionStart; renderNotes(); const ni = $('.nsearch input', notesEl); ni.focus(); ni.setSelectionRange(pos, pos); });
  if (currentTrigger) place(notesEl, currentTrigger);
}

function renderEditor() {
  const n = editing;
  notesEl.innerHTML = `
    <div class="editor" style="display:flex;flex-direction:column">
      <div class="hd"><button class="xbtn bk" data-n="back" aria-label="رجوع">${svg('bc_arrow')}</button><h4>${n.isNew ? 'ملاحظة جديدة' : 'تعديل الملاحظة'}</h4><span class="sp"></span>
        ${n.isNew ? '' : `<button class="xbtn" data-n="del-edit" aria-label="حذف">${svg('n_delete')}</button><span class="vsep"></span>`}
        <button class="xbtn" data-n="close" aria-label="إغلاق">${svg('x18')}</button></div>
      <div class="card" style="--c:${n.c}"><input id="ne-t" placeholder="عنوان الملاحظة" value="${n.t}"><textarea id="ne-b" placeholder="اكتب ملاحظتك هنا…">${n.b}</textarea></div>
      <div class="colors"><span>لون الملاحظة</span>${swatches(n.c)}</div>
      <div class="ft"><button class="btn-primary" data-n="save">${n.isNew ? 'حفظ الملاحظة' : 'حفظ التعديلات'}</button><button class="btn" data-n="back" style="height:40px">إلغاء</button></div>
    </div>`;
  if (currentTrigger) place(notesEl, currentTrigger);
  $('#ne-t', notesEl).focus();
}

let actionsEl = null;
function closeNoteActions() { actionsEl && actionsEl.remove(); actionsEl = null; }
function openNoteActions(dots, idx) {
  closeNoteActions();
  actionsEl = document.createElement('div');
  actionsEl.className = 'pop open menu note-actions';
  actionsEl.style.display = 'flex';
  actionsEl.innerHTML = `
    <button class="mi" data-n="edit">${svg('m_edit1')}تعديل</button>
    <div class="mi-sep"></div>
    <button class="mi danger" data-n="del">${svg('n_delete')}حذف</button>
    <div class="mi-sep"></div>
    <div class="lab">لون الملاحظة</div>${swatches(notes[idx].c)}`;
  actionsEl.dataset.idx = idx;
  notesEl.appendChild(actionsEl);
  const pr = notesEl.getBoundingClientRect(), dr = dots.getBoundingClientRect();
  actionsEl.style.position = 'absolute';
  actionsEl.style.left = (dr.left - pr.left - 4) + 'px';
  actionsEl.style.top = (dr.bottom - pr.top + 4) + 'px';
}

notesEl.addEventListener('click', e => {
  const sw = e.target.closest('.sw');
  if (sw) {
    if (actionsEl && actionsEl.contains(sw)) { notes[+actionsEl.dataset.idx].c = sw.dataset.c; closeNoteActions(); renderNotes(); }
    else if (editing) { editing.t = $('#ne-t').value; editing.b = $('#ne-b').value; editing.c = sw.dataset.c; renderEditor(); }
    return;
  }
  const act = e.target.closest('[data-n]');
  const card = e.target.closest('.note');
  if (!act) {
    if (actionsEl && !actionsEl.contains(e.target)) return closeNoteActions();
    if (card && !actionsEl) { editing = { ...notes[+card.dataset.idx], idx: +card.dataset.idx }; noteView = 'edit'; renderNotes(); }
    return;
  }
  const a = act.dataset.n;
  const idx = actionsEl ? +actionsEl.dataset.idx : card ? +card.dataset.idx : null;
  if (a === 'close') return closePop();
  if (a === 'add') { editing = { t: '', b: '', c: '#ffb300', isNew: true }; noteView = 'edit'; return renderNotes(); }
  if (a === 'actions') { return actionsEl && +actionsEl.dataset.idx === idx ? closeNoteActions() : openNoteActions(act, idx); }
  if (a === 'edit') { closeNoteActions(); editing = { ...notes[idx], idx }; noteView = 'edit'; return renderNotes(); }
  if (a === 'del') { closeNoteActions(); return askDelete(idx); }
  if (a === 'del-edit') return askDelete(editing.idx);
  if (a === 'back') { noteView = 'list'; editing = null; return renderNotes(); }
  if (a === 'save') {
    const t = $('#ne-t').value.trim(), b = $('#ne-b').value.trim();
    if (!t && !b) { $('#ne-t').focus(); return; }
    const n = { t: t || 'بدون عنوان', b, c: editing.c, d: editing.isNew ? 'الآن' : notes[editing.idx].d };
    if (editing.isNew) notes.unshift(n); else notes[editing.idx] = n;
    toast(editing.isNew ? 'تمت إضافة الملاحظة' : 'تم حفظ التعديلات');
    noteView = 'list'; editing = null; renderNotes();
  }
});

// ---------- confirm dialog ----------
function askDelete(idx) { pendingDelete = idx; $('#confirm').classList.add('open'); $('#confirm-no').focus(); }
function closeConfirm() { $('#confirm').classList.remove('open'); pendingDelete = null; }
$('#confirm-no').addEventListener('click', closeConfirm);
$('#confirm').addEventListener('click', e => { if (e.target.id === 'confirm') closeConfirm(); });
$('#confirm-yes').addEventListener('click', () => {
  notes.splice(pendingDelete, 1);
  closeConfirm();
  noteView = 'list'; editing = null; renderNotes();
  toast('تم حذف الملاحظة');
});

syncToolbar();

// ---------- hover cards: a person (user) and an attachment (files) ----------
const DEPTS = {
  'مدير إدارة الموارد البشرية': 'إدارة الموارد البشرية',
  'أحمد سليم بن عبدالله': 'إدارة المالية',
  'سارة القحطاني': 'إدارة الموارد البشرية',
  'خالد أحمد علي': 'إدارة الشؤون الإدارية',
  'إدارة شؤون الموظفين': 'جهة داخلية',
  'مكتب رئيس البلدية': 'جهة داخلية',
  'فهد العتيبي': 'إدارة المشتريات',
  'إدارة الموارد البشرية': 'جهة داخلية',
  'خالد الشمري': 'إدارة تقنية المعلومات',
  'عبدالعزيز السبيعي': 'وكيل البلدية للخدمات',
  'ماجد الحربي': 'نائب مدير إدارة التشغيل والصيانة',
  'مدير عام الشؤون الإدارية والمالية': 'الشؤون الإدارية والمالية',
  'وكيل وزارة العدل': 'وزارة العدل',
  'سعود العنزي': 'إدارة الأملاك والاستثمار',
  'ريم الدوسري': 'إدارة التخطيط العمراني',
  'عبدالرحمن الغامدي': 'إدارة الشؤون المالية',
};
const FILE_TYPES = { pdf: 'مستند PDF', docx: 'مستند Word', doc: 'مستند Word', xls: 'جدول Excel', xlsx: 'جدول Excel' };
const hcUser = $('#hc-user'), hcFile = $('#hc-file');
let hcTimer, hcOpen = null;

function placeCard(card, target) {
  const r = target.getBoundingClientRect();
  card.classList.add('open');
  const w = card.offsetWidth, h = card.offsetHeight, m = 8;
  let x = r.right - w, y = r.bottom + 6;
  if (x < m) x = r.left;
  if (y + h > innerHeight - m) y = r.top - h - 6;
  card.style.left = Math.max(m, Math.min(x, innerWidth - w - m)) + 'px';
  card.style.top = Math.max(m, y) + 'px';
}
function showCard(card, target) {
  if (hcOpen && hcOpen !== card) hcOpen.classList.remove('open');
  if (card === hcUser) {
    const name = target.textContent.trim();
    card.querySelector('b').textContent = name;
    card.querySelector('.u-txt span').textContent = DEPTS[name] || 'جهة داخلية';
    // the open mail's sender keeps the same photo or initials shown beside the name; anyone else gets initials
    const av = card.querySelector('.sender-av'), src = target.id === 'm-sender' && $('.content .sender-av');
    av.className = src ? src.className : 'sender-av init';
    av.style.cssText = src ? src.style.cssText : avTone(name);
    if (src) av.innerHTML = src.innerHTML; else av.textContent = initials(name);
  } else {
    const fname = target.querySelector('.fname').textContent.trim();
    const ext = fname.split('.').pop().toLowerCase();
    const badge = target.querySelector('.badge');
    const rows = [
      ['التاريخ', '2025/11/08'],
      ['النوع', FILE_TYPES[ext] || 'أخرى'],
      ['المستخدم', 'موظف داخل إدارة'],
      ['الحجم', target.querySelector('.size').textContent.trim()],
      ['رقم المرفق', String(52854 + [...$$('.file')].indexOf(target))],
      ['درجة السرية', badge ? badge.textContent.trim() : 'عادي'],
    ];
    card.querySelector('dl').innerHTML = rows.map(([k, v]) => `<div><dt>${k} :</dt><dd>${v}</dd></div>`).join('');
  }
  placeCard(card, target);
  hcOpen = card;
}
function hideCard() { if (hcOpen) hcOpen.classList.remove('open'); hcOpen = null; }

// delegated, because the reading pane re-renders names and files for every mail
const cardFor = el => el.closest('.person') ? [el.closest('.person'), hcUser] : el.closest('.file') ? [el.closest('.file'), hcFile] : [];
document.addEventListener('mouseover', e => {
  // the download button has its own tooltip, so the file's details card stays out of the way there
  if (e.target.closest('.file .dl')) { clearTimeout(hcTimer); return hideCard(); }
  const [t, card] = cardFor(e.target);
  if (!t || (t.contains(e.relatedTarget) && !e.relatedTarget.closest('.dl')) || t.closest('.hcard')) return;
  clearTimeout(hcTimer); hcTimer = setTimeout(() => showCard(card, t), 250);
});
document.addEventListener('mouseout', e => {
  const [t] = cardFor(e.target);
  if (!t || t.contains(e.relatedTarget) || t.closest('.hcard')) return;
  clearTimeout(hcTimer); hcTimer = setTimeout(hideCard, 150);
});
[hcUser, hcFile].forEach(card => {
  card.addEventListener('mouseenter', () => clearTimeout(hcTimer));
  card.addEventListener('mouseleave', () => { hcTimer = setTimeout(hideCard, 150); });
});
document.addEventListener('scroll', hideCard, true);

// Recipients list opens on hover over +3 / +1 and stays while the pointer is on it
const recipPop = $('#pop-recips');
let recipTimer;
const keepRecips = () => clearTimeout(recipTimer);
const leaveRecips = () => { clearTimeout(recipTimer); recipTimer = setTimeout(() => { if (current === recipPop) closePop(); }, 200); };
const openRecips = chip => {
  keepRecips();
  if (current === recipPop && currentTrigger === chip) return;
  closePop();
  // each chip lists only its own hidden people, as initials cards
  recipPop.innerHTML = chip.dataset.who.split('|').map(n => `<div class="ucard"><span class="sender-av init" style="${avTone(n)}">${initials(n)}</span><span class="u-txt"><b>${n}</b><span>${DEPTS[n] || 'جهة داخلية'}</span></span></div>`).join('');
  recipPop.classList.add('open');
  place(recipPop, chip);
  chip.setAttribute('aria-expanded', 'true');
  current = recipPop; currentTrigger = chip;
};
document.addEventListener('mouseover', e => { const c = e.target.closest('.chip.more'); if (c && !c.contains(e.relatedTarget)) openRecips(c); });
document.addEventListener('mouseout', e => { const c = e.target.closest('.chip.more'); if (c && !c.contains(e.relatedTarget)) leaveRecips(); });
document.addEventListener('focusin', e => { const c = e.target.closest('.chip.more'); if (c) openRecips(c); });
recipPop.addEventListener('mouseenter', keepRecips);
recipPop.addEventListener('mouseleave', leaveRecips);

// ---------- notifications ----------
// each notification carries the logo of the system it came from
const NOTIFS = [
  { day: 'اليوم', sys: 'av_hr', sysName: 'الموارد البشرية', t: 'طلب إجازة بانتظار اعتمادك', acts: [['رفض', 'secondary', 'تم رفض الطلب', 'no'], ['اعتماد', 'primary', 'تم اعتماد الطلب', 'ok']], b: 'قدّم أحمد سليم بن عبدالله طلب إجازة اعتيادية لمدة خمسة أيام عمل تبدأ من 18/10/2026م وتنتهي بنهاية دوام يوم الخميس 22/10/2026م، مع تفويض صلاحياته الإدارية إلى نائبه خلال فترة الإجازة، ويحتاج الطلب إلى اعتمادك قبل نهاية الأسبوع.', d: 'منذ 5 دقائق', unread: true },
  { day: 'اليوم', sys: 'av_finance', sysName: 'وزارة المالية', t: 'تمت إحالة معاملة إليك', acts: [['فتح المعاملة', 'primary']], b: 'أحال وكيل وزارة المالية إليك مذكرة تفعيل خدمة التوقيع الإلكتروني على المعاملات الصادرة من جميع الإدارات، مرفق بها دليل الاستخدام وجدول التدريب المقترح للموظفين، مع طلب إبداء الرأي خلال ثلاثة أيام عمل.', d: 'منذ 40 دقيقة', unread: true },
  { day: 'اليوم', person: 'سارة القحطاني', t: 'أشارت إليك سارة القحطاني في ملاحظة', b: '«يرجى مراجعة المرفقات قبل اعتماد المذكرة وإبداء ملاحظاتك عليها».', d: 'منذ ساعة', unread: true, acts: [['عرض الملاحظة', 'primary']] },
  { day: 'اليوم', sys: 'av_building', sysName: 'البلدية', t: 'اقترب موعد استحقاق معاملة', acts: [['ذكّرني لاحقًا', 'secondary', 'سيتم تذكيرك غدًا', 'info'], ['اتخاذ إجراء', 'primary']], b: 'المعاملة رقم 1446-012034 تستحق خلال يومين، يرجى اتخاذ الإجراء اللازم.', d: 'منذ ساعتين', unread: true },
  { day: 'اليوم', sys: 'av_gov', sysName: 'منصة اعتماد', t: 'تم اعتماد المعاملة', acts: [['عرض', 'secondary']], b: 'اعتمد مدير إدارة الكهرباء المعاملة رقم 285400 وأُحيلت إلى إدارة شؤون الموظفين.', d: 'منذ 3 ساعات', unread: false },
  { day: 'أمس', sys: 'av_gov', sysName: 'منصة اعتماد', t: 'تعميم جديد', acts: [['قراءة التعميم', 'secondary']], b: 'صدر تعميم بشأن تحديث مواعيد الدوام الرسمي خلال شهر رمضان المبارك لجميع الإدارات والفروع، على أن يبدأ الدوام في التاسعة صباحًا وينتهي في الثالثة عصرًا، مع مراعاة استمرار تقديم الخدمات الإلكترونية للمستفيدين.', d: 'أمس، 4:20 م', unread: true },
  { day: 'أمس', sys: 'av_hr', sysName: 'الموارد البشرية', t: 'تم تحديث بياناتك الوظيفية', b: 'تم تحديث المسمى الوظيفي والدرجة في ملفك لدى إدارة الموارد البشرية.', d: 'أمس، 11:05 ص', unread: false },
  { day: 'أمس', sys: 'av_finance', sysName: 'وزارة المالية', t: 'تم رفض طلب الصرف', acts: [['تعديل الطلب', 'secondary'], ['إرفاق المستندات', 'primary']], b: 'رُفض طلب صرف بدل الانتداب لعدم اكتمال المرفقات المطلوبة.', d: 'أمس، 9:30 ص', unread: false },
];
const CHECK_ALL = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1.5 12.5 6 17 16 7M12 17l10-10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const notifsEl = $('#pop-notifs'), bellNum = $('.header [aria-label="الإشعارات"] .num');
let notifTab = 'all';
// the single-file build ships avatars as a data-URI table instead of files
const sysImg = k => typeof AVATARS !== 'undefined' && AVATARS[k] ? AVATARS[k] : `assets/${k}.png`;

// the bell badge always shows how many are still unread
function syncBell() {
  const n = NOTIFS.filter(x => x.unread).length;
  bellNum.textContent = n;
  bellNum.hidden = !n;
}

// actions with a result swap to a status line once taken; the rest open the item
const RESULT_ICON = { ok: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m5 12.5 4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  no: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="m7 7 10 10M17 7 7 17" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4.5l3 1.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' };
// people without a photo get their initials; systems get their logo
// skip the article 'ال' so القحطاني gives ق, not ا
const initials = name => name.split(' ').slice(0, 2).map(w => (w.startsWith('ال') && w.length > 2 ? w[2] : w[0])).join('‌');
const notifAvatar = x => x.person
  ? `<span class="sys init" style="${avTone(x.person)}" title="${x.person}" aria-label="${x.person}">${initials(x.person)}</span>`
  : `<span class="sys" title="${x.sysName}"><img src="${sysImg(x.sys)}" alt="${x.sysName}"></span>`;
function notifActs(x) {
  if (x.done) return `<span class="nres ${x.done[1]}">${RESULT_ICON[x.done[1]]}${x.done[0]}</span>`;
  if (!x.acts) return '';
  return `<span class="nacts">${x.acts.map(([l, k], j) => `<button class="nact ${k}" data-a="${j}">${l}</button>`).join('')}</span>`;
}

function renderNotifs() {
  const unread = NOTIFS.filter(x => x.unread).length;
  const tabs = [['all', 'الكل', NOTIFS.length], ['unread', 'غير مقروءة', unread], ['read', 'مقروءة', NOTIFS.length - unread]];
  const list = NOTIFS.filter(x => notifTab === 'all' || (notifTab === 'unread') === x.unread);
  const days = [...new Set(list.map(x => x.day))];
  notifsEl.innerHTML = `
    <div class="hd"><h4>الإشعارات</h4><span class="sp"></span>
      <button class="read-all" data-nf="read-all"${unread ? '' : ' disabled'}>${CHECK_ALL}تحديد الكل كمقروء</button>
      <button class="xbtn" data-nf="close" aria-label="إغلاق">${svg('x18')}</button></div>
    <div class="ntabs" role="tablist">${tabs.map(([k, l, c]) => `<button class="ntab${k === notifTab ? ' on' : ''}" role="tab" aria-selected="${k === notifTab}" data-tab="${k}">${l}<span class="c">${c}</span></button>`).join('')}</div>
    ${list.length ? `<div class="nfeed">${days.map(day => `<div class="nday">${day}</div>` + list.filter(x => x.day === day).map(x => `
      <div class="nitem${x.unread ? ' unread' : ''}" data-i="${NOTIFS.indexOf(x)}" role="button" tabindex="0">
        ${notifAvatar(x)}
        <span class="txt"><span class="tt">${x.t}</span><span class="dt">${x.d}</span><span class="ds">${x.b}</span>${notifActs(x)}</span>
      </div>`).join('')).join('')}</div>`
    : `<div class="empty"><span class="ic">${svg('h_bell')}</span><b>${notifTab === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}</b></div>`}`;
}

notifsEl.addEventListener('click', e => {
  const t = e.target.closest('[data-a],[data-tab],[data-nf],.nitem');
  if (!t) return;
  if (t.dataset.a) {
    const x = NOTIFS[t.closest('.nitem').dataset.i], [label, , result, kind] = x.acts[t.dataset.a];
    x.unread = false;
    if (result) x.done = [result, kind];
    toast(result || label);
  } else if (t.dataset.tab) notifTab = t.dataset.tab;
  else if (t.dataset.nf === 'close') return closePop();
  else if (t.dataset.nf === 'read-all') { NOTIFS.forEach(x => { x.unread = false; }); toast('تم تحديد كل الإشعارات كمقروءة'); }
  else NOTIFS[t.dataset.i].unread = false;  // opening a notification marks it read
  notifsEl.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('nitem')) { e.preventDefault(); e.target.click(); } });
syncBell();
  renderNotifs();
});
syncBell();

// Linked platforms: opening a system just confirms for now
// each name box shrinks to its widest line, so the arrow beside it sits right against the text
function fitAppNames() {
  $$('#pop-apps .nm').forEach(nm => {
    nm.style.width = '';
    const r = document.createRange();
    r.selectNodeContents(nm);
    nm.style.width = Math.ceil(Math.max(...[...r.getClientRects()].map(l => l.width))) + 'px';
  });
}
$$('#pop-apps .apl').forEach(a => a.addEventListener('click', () => { closePop(); toast('جارٍ فتح ' + a.getAttribute('aria-label')); }));

// ---------- AI assistant (Figma: I — Glass Prompt Cards) ----------
// A reply goes through three states: thinking (live steps), typing (streamed words) and done (actions)
const chatEl = $('#pop-chat'), chatLog = $('.chat-log', chatEl), chatWelcome = $('.chat-welcome', chatEl);
const chatBody = $('.chat-body', chatEl), chatForm = $('.chat-input', chatEl), chatField = $('input', chatForm), chatSend = $('.chat-send', chatForm);
const AI_ICON = {
  // Hugeicons «sent» (stroke rounded), mirrored to point the RTL way
  send: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" style="transform:scaleX(-1)"><path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" stroke-width="1.5"/><path d="M11.4999 12.5L14.9999 9" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg>',
  stop: '<svg width="14" height="14" viewBox="0 0 14 14"><rect width="14" height="14" rx="3" fill="currentColor"/></svg>',
  chat: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 10.5h8M8 14h5.5M12 21a9 9 0 1 0-8.1-5.1L3 21l5.1-.9A9 9 0 0 0 12 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="13" height="13" rx="3" stroke="currentColor" stroke-width="1.7"/><path d="M16 8V6a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h2" stroke="currentColor" stroke-width="1.7"/></svg>',
  like: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 10v11H4a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h3Zm0 0 4-7a2.5 2.5 0 0 1 2.9 2.9L13 10h5.6a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 17.1 21H7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',
  regen: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};
const avatarHTML = '<span class="chat-av"><img src="' + $('.chat-hd .chat-av img').getAttribute('src') + '" alt=""></span>';

// the open mail drives the "summarise" and "extract text" answers
function openMail() {
  const m = ALL_MAILS[+($('.mail.active') || {}).dataset?.i || 0];
  return { m, r: READ[m.key] || READ.leave };
}
const AI_PROMPTS = {
  summary: {
    q: 'لخّص المعاملة المفتوحة',
    steps: ['قراءة نص المعاملة', 'مراجعة المرفقات', 'تحديد الإجراء المطلوب'],
    a: () => {
      const { m, r } = openMail(), a = r.acts;
      const files = r.files ? `${r.files.length} (${r.files.map(f => f[0]).join('، ')})` : 'لا توجد مرفقات';
      const need = [a.sign, a.tashir, a.fwd, a.ok && 'قبول الطلب', a.no && 'رفضه'].filter(Boolean).join(' أو ') || 'للاطلاع فقط';
      return `<p><b>ملخص المعاملة</b></p><ul><li><b>الموضوع:</b> ${m.subj}</li><li><b>المرسل:</b> ${m.sender} — ${r.org}</li><li><b>المرفقات:</b> ${files}</li><li><b>الإجراء المطلوب منك:</b> ${need}</li></ul><p>المعاملة مستوفية للبيانات الأساسية، وأنصح بمراجعة المرفقات قبل اتخاذ الإجراء.</p>`;
    },
  },
  ocr: {
    q: 'استخرج النص من مرفقات المعاملة',
    steps: ['تحديد المستندات المصورة', 'التعرف على النص العربي', 'تنسيق النص المستخرج'],
    a: () => {
      const { r } = openMail();
      if (!r.files) return '<p>المعاملة المفتوحة لا تحتوي على مرفقات. أرفق صورة المستند عن طريق زر <b>+</b> وسأستخرج النص منها.</p>';
      return `<p>استخرجت النص من <b>${r.files[0][0]}</b>:</p><p>«بالإشارة إلى المعاملة الواردة، نفيدكم بأنه تمت دراسة الطلب واستيفاء المتطلبات النظامية، ونأمل التكرم بالاطلاع واتخاذ ما ترونه مناسبًا.»</p><p>دقة التعرف: 97٪. يمكنك نسخ النص أو طلب استخراج مرفق آخر.</p>`;
    },
  },
  report: {
    q: 'أنشئ تقريرًا شهريًا بالمعاملات الواردة والصادرة',
    steps: ['جمع معاملات شهر أكتوبر', 'حساب المؤشرات', 'إعداد التقرير'],
    a: () => '<p><b>تقرير المعاملات — أكتوبر 2026</b></p><ul><li><b>الوارد:</b> 128 معاملة (↑ 12٪ عن سبتمبر)</li><li><b>الصادر:</b> 94 معاملة</li><li><b>المتأخرة:</b> 7 معاملات، أغلبها لدى إدارة المشتريات</li><li><b>متوسط مدة الإنجاز:</b> 2.4 يوم</li></ul><p>أقترح متابعة المعاملات المتأخرة هذا الأسبوع لتقليل متوسط مدة الإنجاز.</p>',
  },
  stats: {
    q: 'كم عدد المعاملات حسب الإدارة والحالة؟',
    steps: ['قراءة بيانات الإدارات', 'تجميع المعاملات حسب الحالة'],
    a: () => '<p>عدد المعاملات حسب الإدارة والحالة لهذا الشهر:</p><table><tr><th>الإدارة</th><th>جديدة</th><th>قيد الإجراء</th><th>منجزة</th></tr><tr><td>الموارد البشرية</td><td>6</td><td>4</td><td>21</td></tr><tr><td>المشتريات</td><td>3</td><td>7</td><td>12</td></tr><tr><td>التشغيل والصيانة</td><td>5</td><td>2</td><td>18</td></tr><tr><td>الشؤون المالية</td><td>2</td><td>3</td><td>15</td></tr></table><p>إدارة المشتريات لديها أعلى عدد من المعاملات قيد الإجراء.</p>',
  },
  // reading-pane AI menu: summarise the open mail's attachments
  attach: {
    q: 'لخّص مرفقات المعاملة',
    steps: ['فتح المرفقات', 'قراءة محتوى كل مرفق', 'إعداد الملخص'],
    a: () => {
      const { r } = openMail();
      if (!r.files) return '<p>المعاملة المفتوحة لا تحتوي على مرفقات.</p>';
      return `<p><b>ملخص المرفقات (${r.files.length})</b></p><ul>${r.files.map(f => `<li><b>${f[0]}</b>${f[2] ? ` — ${f[2]}` : ''}: يتضمن تفاصيل داعمة للمعاملة ويستوجب المراجعة قبل اتخاذ الإجراء.</li>`).join('')}</ul><p>أنصح بالاطلاع على المرفق الأول لأنه يحتوي على البيانات الأساسية.</p>`;
    },
  },
  // the rest of the features (header → خصائص المساعد): scripted answers built from the open mail where it makes sense
  reply: {
    q: 'صغ ردًا رسميًا على المعاملة المفتوحة',
    steps: ['قراءة نص المعاملة', 'تحديد المطلوب', 'صياغة الرد'],
    a: () => { const { m, r } = openMail(); return `<p>مسودة رد على «${m.subj}»:</p><p>«سعادة ${m.sender} — ${r.org}، السلام عليكم ورحمة الله وبركاته، وبعد: نفيدكم باستلام معاملتكم، وقد تمت دراستها وجارٍ اتخاذ الإجراء اللازم حيالها، وسنوافيكم بالنتيجة في أقرب وقت. وتقبلوا خالص التحية.»</p><p>هل تريد نبرة أقصر أو إضافة إحالة لجهة أخرى؟</p>`; },
  },
  translate: {
    q: 'ترجم المعاملة المفتوحة إلى الإنجليزية',
    steps: ['قراءة النص العربي', 'الترجمة وضبط المصطلحات'],
    a: () => `<p><b>Subject:</b> ${openMail().m.subj}</p><p>“With reference to the above transaction, we would like to inform you that the request has been reviewed and the regulatory requirements have been met. Kindly review and take the action you deem appropriate.”</p>`,
  },
  classify: {
    q: 'اقترح تصنيف المعاملة المفتوحة',
    steps: ['تحليل الموضوع', 'مطابقة التصنيفات المعتمدة'],
    a: () => { const { m } = openMail(); return `<ul><li><b>نوع المعاملة:</b> ${m.tags[1] || m.tags[0]}</li><li><b>مستوى السرية المقترح:</b> ${m.tags.includes('سري') ? 'سري' : 'عام'}</li><li><b>الجهة المختصة:</b> ${m.sender}</li></ul><p>التصنيف مقترح فقط ويمكنك تعديله قبل الحفظ.</p>`; },
  },
  dates: {
    q: 'استخرج المواعيد والمهام من المعاملة المفتوحة',
    steps: ['البحث عن التواريخ في النص', 'تحديد المهام المرتبطة'],
    a: () => '<ul><li><b>تاريخ الورود:</b> 01/11/2026</li><li><b>آخر موعد للرد:</b> 08/11/2026 (بعد 7 أيام)</li><li><b>المهمة:</b> اتخاذ الإجراء على المعاملة وإشعار الجهة المرسلة</li></ul><p>هل تريد إضافة تذكير بآخر موعد للرد؟</p>',
  },
  related: {
    q: 'ابحث عن معاملات مرتبطة بالمعاملة المفتوحة',
    steps: ['استخراج الكلمات المفتاحية', 'البحث في صندوق الوارد'],
    a: () => { const { m } = openMail(), rel = ALL_MAILS.filter(x => x !== m && x.sender === m.sender).slice(0, 3); return rel.length ? `<p>وجدت ${rel.length} معاملات من نفس الجهة:</p><ul>${rel.map(x => `<li>${x.subj}</li>`).join('')}</ul>` : '<p>لم أجد معاملات مرتبطة بنفس الموضوع في صندوق الوارد.</p>'; },
  },
  compare: {
    q: 'قارن بين نسختي مرفق المعاملة',
    steps: ['قراءة النسختين', 'مطابقة الفقرات', 'تحديد الفروقات'],
    a: () => '<p>أبرز الفروقات بين النسختين:</p><ul><li><b>البند 3:</b> تغيّرت مدة التنفيذ من 30 يومًا إلى 45 يومًا.</li><li><b>البند 5:</b> أُضيفت فقرة عن آلية الدفع.</li><li><b>التوقيع:</b> النسخة الثانية موقّعة إلكترونيًا.</li></ul>',
  },
};
const freeReply = q => ({
  q, steps: ['فهم السؤال', 'البحث في معاملاتك'],
  a: () => `<p>بحثت في معاملاتك عن «${q.replace(/</g, '&lt;')}».</p><p>وجدت معاملة مرتبطة: <b>${openMail().m.subj}</b>. هل تريد أن ألخصها لك أو أنشئ تقريرًا عنها؟</p>`,
});

let chatRun = null;  // the reply being generated, so it can be stopped
const wait = ms => new Promise(res => { const t = setTimeout(res, ms); chatRun && chatRun.timers.push(t); });

function syncComposer() {
  const busy = !!chatRun, has = !!chatField.value.trim();
  chatSend.disabled = !busy && !has;  // always shown; inactive until there is something to send
  chatSend.innerHTML = busy ? AI_ICON.stop : AI_ICON.send;
  chatSend.classList.toggle('stop', busy);
  chatSend.setAttribute('aria-label', busy ? 'إيقاف الرد' : 'إرسال');
  chatSend.dataset.ftip = busy ? 'إيقاف الرد' : 'إرسال';
}
const scrollChat = () => { chatBody.scrollTop = chatBody.scrollHeight; };

// Real answers: inside a Claude viewer (the published artifact) the chat asks Claude on the viewer's own account;
// anywhere else, or if the viewer declines, the scripted demo answers above are used
let aiSample = null, chatTurns = [];  // chatTurns: the conversation so far, oldest first
window.claude?.use('sample').then(s => { aiSample = s; }).catch(() => {});
const AI_RULES = 'أنت «Qemam AI»، المساعد الذكي داخل نظام qCMS لإدارة المراسلات والمعاملات في بلدية سعودية، وتساعد الموظف الذي يستخدم صندوق الوارد. أجب بالعربية الفصحى بإيجاز ووضوح وبنبرة مهنية ودودة. اعتمد فقط على البيانات أدناه: لا تخترع أرقامًا أو معاملات أو تواريخ غير موجودة، وإن لم تتوفر المعلومة فقل ذلك. محتوى ملفات المرفقات غير متاح لك، فلا تدّعِ أنك قرأته. التنسيق: فقرات قصيرة، والنقاط تبدأ بـ «- »، والخط العريض بـ **النص**، وجدول Markdown فقط عند الحاجة، وبدون عناوين #.';
function aiContext() {
  const { m, r } = openMail(), clean = l => l.replace(/^!/, '').replace(/\[\[(.+?)\]\]/g, '$1');
  const body = r.body ? r.body.map(clean).join('\n') : [r.template.head, r.template.ref, ...[...r.template.before, ...r.template.after].flat()].join('\n');
  const files = r.files ? r.files.map(f => f[0] + (f[2] ? ` (${f[2]})` : '')).join('، ') : 'لا يوجد';
  const inbox = MAILS.map(g => g.items.map(i => `- [${g.day}] ${i.sender}: ${i.subj} (${i.tags.join('، ')}${i.late ? '، متأخرة' : ''})`).join('\n')).join('\n');
  return `المعاملة المفتوحة الآن:\nالموضوع: ${m.subj}\nالمرسل: ${m.sender} — ${r.org}\nالمرفقات: ${files}\nالإجراءات المتاحة للموظف: ${Object.values(r.acts).join('، ') || 'لا يوجد'}\nالنص:\n${body}\n\nصندوق الوارد (${ALL_MAILS.length} معاملات):\n${inbox}`;
}
// the small Markdown subset the rules ask for: paragraphs, "- " lists, **bold**, pipe tables
function mdToHTML(src) {
  const inline = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const out = []; let list = null, table = null;
  const flush = () => { if (list) out.push(`<ul>${list.join('')}</ul>`); if (table) out.push(`<table>${table.join('')}</table>`); list = table = null; };
  for (const line of src.split('\n').map(l => l.trim())) {
    if (/^\|.*\|$/.test(line)) {
      if (/^\|[\s:|-]+\|$/.test(line)) continue;
      if (list) flush();
      const tag = table ? 'td' : 'th';
      (table ||= []).push(`<tr>${line.slice(1, -1).split('|').map(c => `<${tag}>${inline(c.trim())}</${tag}>`).join('')}</tr>`);
    } else if (/^[-*•]\s+/.test(line)) {
      if (table) flush();
      (list ||= []).push(`<li>${inline(line.replace(/^[-*•]\s+/, ''))}</li>`);
    } else { flush(); if (line) out.push(`<p>${inline(line.replace(/^#+\s*/, ''))}</p>`); }
  }
  flush();
  return out.join('');
}

// user bubble + an AI message in its "thinking" state
function startReply(p) {
  closeFeatures(false);
  chatWelcome.hidden = true; chatLog.hidden = false; chatEl.classList.add('started');
  chatLog.insertAdjacentHTML('beforeend', `<div class="chat-msg me">${p.q.replace(/</g, '&lt;')}</div>`);
  const msg = document.createElement('div');
  msg.className = 'chat-msg ai thinking';
  msg.innerHTML = `${avatarHTML}<div class="ai-col"><div class="think live"><button class="think-hd" type="button">جارٍ التفكير…${svg('chev14')}</button><ol class="think-steps"></ol></div></div>`;
  chatLog.appendChild(msg);
  chatRun = { timers: [], stopped: false };
  syncComposer(); scrollChat();
  return msg;
}
function endThinking(msg, started) {
  $('.think', msg).classList.remove('live');
  msg.classList.remove('thinking');
  $('.think-hd', msg).firstChild.textContent = `فكّر لمدة ${Math.max(1, Math.round((Date.now() - started) / 1000))} ثوانٍ`;
}
const AI_ACTS = `<div class="ai-acts">
    <button data-act="copy" aria-label="نسخ" data-ftip="نسخ">${AI_ICON.copy}</button>
    <button data-act="like" aria-label="إجابة مفيدة" data-ftip="إجابة مفيدة">${AI_ICON.like}</button>
    <button data-act="dislike" aria-label="إجابة غير مفيدة" data-ftip="إجابة غير مفيدة" style="transform:scaleY(-1)">${AI_ICON.like}</button>
    <button data-act="regen" aria-label="إعادة التوليد" data-ftip="إعادة التوليد">${AI_ICON.regen}</button></div>`;
function endReply(msg, p) {
  $('.ai-col', msg).insertAdjacentHTML('beforeend', AI_ACTS);
  msg.dataset.q = p.q;
  msg.prompt = p;
  chatRun = null;
  syncComposer(); scrollChat();
}

async function askClaude(p) {
  const msg = startReply(p), run = chatRun, steps = $('.think-steps', msg), started = Date.now();
  run.ctl = new AbortController();
  // the steps keep coming while Claude works; the last one spins until the first words arrive
  let i = 0;
  const addStep = () => { steps.lastElementChild?.classList.add('done'); steps.insertAdjacentHTML('beforeend', `<li><span class="dot"></span>${p.steps[i++]}</li>`); scrollChat(); };
  addStep();
  const tick = setInterval(() => { if (i < p.steps.length) addStep(); }, 900);
  run.timers.push(tick);
  const bubble = document.createElement('div'), caret = document.createElement('span');
  bubble.className = 'bubble'; caret.className = 'ai-caret';
  const show = text => {
    if (!bubble.isConnected) {
      clearInterval(tick);
      while (i < p.steps.length) addStep();
      steps.lastElementChild.classList.add('done');
      endThinking(msg, started);
      $('.ai-col', msg).appendChild(bubble);
    }
    bubble.innerHTML = mdToHTML(text);
    let at = bubble; while (at.lastElementChild) at = at.lastElementChild;
    at.append(caret);
    scrollChat();
  };
  const turns = [...chatTurns, { role: 'user', content: p.q }].slice(-12);
  try {
    const { text } = await aiSample([{ role: 'user', content: `${AI_RULES}\n\n${aiContext()}` }, ...turns], { modelTier: 'quick', cache: false, signal: run.ctl.signal, onText: ({ text }) => show(text) });
    show(text);
    caret.remove();
    chatTurns = [...turns, { role: 'assistant', content: text }];
    endReply(msg, p);
  } catch (e) {
    clearInterval(tick);
    if (e.code === 'cancelled') return;  // Stop: stopReply already updated the message
    if (['not_granted', 'sampling_disabled', 'not_declared', 'capability_disabled', 'capability_removed'].includes(e.code)) {
      // Claude is off for this viewer: drop the attempt and answer with the demo instead
      aiSample = null;
      msg.previousElementSibling.remove(); msg.remove();
      chatRun = null;
      return ask(p);
    }
    if (e.code === 'refused') bubble.innerHTML = '';
    else if (e.text) show(e.text);
    caret.remove();
    if (!bubble.isConnected) { endThinking(msg, started); $('.ai-col', msg).appendChild(bubble); }
    bubble.insertAdjacentHTML('beforeend', `<p><span class="stopped">${e.code === 'rate_limited' ? 'تم تجاوز الحد المسموح من الطلبات، حاول بعد قليل.' : 'تعذّر إكمال الرد، حاول مرة أخرى.'}</span></p>`);
    endReply(msg, p);
  }
}

async function ask(p) {
  if (chatRun) return;
  if (aiSample) return askClaude(p);
  const msg = startReply(p), run = chatRun, steps = $('.think-steps', msg), started = Date.now();
  // thinking: each step spins, then gets a check
  for (const s of p.steps) {
    steps.insertAdjacentHTML('beforeend', `<li><span class="dot"></span>${s}</li>`);
    scrollChat();
    await wait(650 + Math.random() * 450);
    if (run.stopped) return;
    steps.lastElementChild.classList.add('done');
  }
  endThinking(msg, started);
  // typing: build the answer, empty its text, then refill it word by word
  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.innerHTML = p.a();
  const walker = document.createTreeWalker(bubble, NodeFilter.SHOW_TEXT), nodes = [];
  while (walker.nextNode()) nodes.push([walker.currentNode, walker.currentNode.textContent]);
  nodes.forEach(([n]) => { n.textContent = ''; });
  const caret = document.createElement('span');
  caret.className = 'ai-caret';
  $('.ai-col', msg).appendChild(bubble);
  for (const [n, text] of nodes) {
    n.after(caret);
    for (const w of text.split(/(\s+)/)) {
      n.textContent += w;
      if (w.trim()) { await wait(28 + Math.random() * 40); if (run.stopped) { caret.remove(); return; } scrollChat(); }
    }
  }
  caret.remove();
  endReply(msg, p);
}

function stopReply() {
  if (!chatRun) return;
  chatRun.stopped = true;
  chatRun.timers.forEach(clearTimeout);
  chatRun.ctl?.abort();
  $('.ai-caret', chatLog)?.remove();
  const msg = chatLog.lastElementChild;
  msg.classList.remove('thinking');
  const think = $('.think', msg);
  think.classList.remove('live');
  $('.think-hd', think).firstChild.textContent = 'تم إيقاف الرد';
  if (!$('.bubble', msg)) $('.ai-col', msg).insertAdjacentHTML('beforeend', '<div class="bubble"><span class="stopped">أوقفت الرد قبل اكتماله.</span></div>');
  chatRun = null;
  syncComposer();
}

function resetChat() {
  stopReply();
  saveChat(); chatId = null;
  closeFeatures(false);
  chatLog.innerHTML = ''; chatLog.hidden = true; chatWelcome.hidden = false; chatEl.classList.remove('started', 'scrolled');
  chatTurns = [];
  chatField.value = ''; syncComposer();
  if (!chatHist.hidden) renderHistory();
}

// ---------- chat history (like qTalker): a side panel next to the chat, grouped by day ----------
// a conversation is saved when a new one starts, another is opened or the panel opens; the samples stand in for older sessions
const chatHist = $('.chat-history', chatEl), chatHistList = $('.ch-list', chatHist), chatHistField = $('.ch-search input', chatHist);
const chatHistDate = $('.ch-date input', chatHist), histBtn = $('.chat-hd [data-chat="history"]', chatEl);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sampleChat = (q, a) => `<div class="chat-msg me">${q}</div><div class="chat-msg ai" data-q="${q}">${avatarHTML}<div class="ai-col"><div class="bubble">${a}</div>${AI_ACTS}</div></div>`;
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };
const sameDay = (a, b) => a.toDateString() === b.toDateString();
const pad2 = n => String(n).padStart(2, '0');
const dayLabel = d => sameDay(d, new Date()) ? 'اليوم' : sameDay(d, daysAgo(1)) ? 'أمس' : `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
const mailRef = m => String(15896431 - ALL_MAILS.indexOf(m) * 137);  // the same ID the mail list shows
let chatId = null;
const CHATS = [
  [0, '15896294', 'لخّص مذكرة وزارة العدل', '<p><b>ملخص المذكرة</b></p><ul><li><b>الموضوع:</b> تزويد وزارة العدل ببيانات العقارات المنزوعة ملكيتها</li><li><b>الإجراء المطلوب:</b> تأشير المذكرة أو توقيعها</li></ul>'],
  [0, '15896157', 'صياغة رد على طلب إجازة اعتيادية', '<p>مقترح الرد:</p><p>«نفيدكم بالموافقة على طلب الإجازة الاعتيادية للمدة المحددة، على أن يتولى النائب المكلف تسيير الأعمال خلال فترة الغياب.»</p>'],
  [1, '15895883', 'كم عدد المعاملات المتأخرة لدى إدارة المشتريات؟', '<p>لدى إدارة المشتريات <b>4 معاملات متأخرة</b> هذا الشهر، أقدمها منذ 12 يومًا.</p><p>هل تريد أن أعدّ لك قائمة بها مع مدة تأخر كل معاملة؟</p>'],
  [1, '15896431', 'لخّص خطاب وكيل وزارة المالية', '<p><b>ملخص الخطاب</b></p><ul><li><b>الموضوع:</b> تفعيل خدمة التوقيع الإلكتروني على المعاملات الصادرة</li><li><b>الإجراء المطلوب:</b> إحالة للتوقيع أو تأشير الخطاب</li></ul>'],
  [1, '15895746', 'استخرج المواعيد من إشعار نظام الرخص', '<p>المواعيد في الإشعار:</p><ul><li><b>آخر موعد لاستكمال المتطلبات:</b> 15/11/2026</li><li><b>موعد الزيارة الميدانية:</b> 20/11/2026</li></ul>'],
  [5, '15895609', 'أنشئ تقريرًا شهريًا بالمعاملات الواردة والصادرة', AI_PROMPTS.report.a()],
  [5, '15895472', 'كم عدد المعاملات حسب الإدارة والحالة؟', AI_PROMPTS.stats.a()],
  [6, '15895335', 'ترجم خطاب تفعيل التوقيع الإلكتروني', '<p><b>Translation:</b></p><p>“We would like to inform you that the e-signature service for outgoing transactions has been activated.”</p>'],
  [6, '15895198', 'صنّف معاملة طلب الانتداب', '<p>التصنيف المقترح: <b>طلب إداري — مقيد</b>، والجهة المختصة: إدارة الموارد البشرية.</p>'],
].map(([n, ref, title, a], i) => ({ id: i + 1, date: daysAgo(n), ref, title, html: sampleChat(title, a) }));
let chatSeq = CHATS.length;
function saveChat() {
  if (chatRun || !chatLog.querySelector('.chat-msg')) return;
  const rec = CHATS.find(c => c.id === chatId), data = { date: new Date(), html: chatLog.innerHTML, turns: chatTurns };
  if (rec) { Object.assign(rec, data); CHATS.unshift(...CHATS.splice(CHATS.indexOf(rec), 1)); }
  else { chatId = ++chatSeq; CHATS.unshift({ id: chatId, ref: mailRef(openMail().m), title: $('.chat-msg.me', chatLog).textContent, ...data }); }
}
function renderHistory() {
  const q = chatHistField.value.trim(), day = chatHistDate.value, groups = {};
  CHATS.filter(c => (c.title.includes(q) || c.ref.includes(q)) && (!day || sameDay(c.date, new Date(day + 'T00:00'))))
    .forEach(c => (groups[dayLabel(c.date)] ||= []).push(c));
  $('.ch-date', chatHist).classList.toggle('on', !!day);
  const html = Object.entries(groups).map(([label, items]) => `<div class="ch-day">${label}</div>` + items.map(c => {
    const t = `${c.ref} ، ${esc(c.title)}`;
    return `<button type="button" class="ch-item${c.id === chatId ? ' on' : ''}" data-chat="open" data-id="${c.id}" title="${t}">${t}</button>`;
  }).join('')).join('');
  chatHistList.innerHTML = html || `<div class="empty-state"><span class="ic">${AI_ICON.chat}</span><b>لا توجد محادثات</b><span>${q || day ? 'لا توجد محادثات تطابق بحثك' : 'ستظهر هنا محادثاتك مع المساعد'}</span></div>`;
}
function openHistory() {
  saveChat();
  chatHistField.value = chatHistDate.value = ''; renderHistory();
  chatHist.hidden = false; chatEl.classList.add('history'); histBtn.classList.add('on');
}
function closeHistory() { chatHist.hidden = true; chatEl.classList.remove('history'); histBtn.classList.remove('on'); }
function openChat(id) {
  if (id === chatId) return;
  stopReply(); saveChat();
  const c = CHATS.find(x => x.id === id);
  chatId = c.id; chatTurns = c.turns || [];
  closeFeatures(false);
  chatLog.innerHTML = c.html; chatLog.hidden = false; chatWelcome.hidden = true; chatEl.classList.add('started');
  scrollChat(); renderHistory();
}
chatHistField.addEventListener('input', renderHistory);
// the calendar box opens the browser's date picker; a picked day filters the list
$('.ch-date', chatHist).addEventListener('click', e => { if (e.target === chatHistDate) return; e.preventDefault(); try { chatHistDate.showPicker(); } catch { chatHistDate.focus(); } });
chatHistDate.addEventListener('change', renderHistory);

// ---------- all AI features: the welcome cards plus the rest, opened from the header ----------
const chatFeats = $('.chat-features', chatEl), featsBtn = $('.chat-hd [data-chat="features"]', chatEl);
function openFeatures() {
  chatWelcome.hidden = chatLog.hidden = true; chatFeats.hidden = false;
  chatEl.classList.add('features'); featsBtn.classList.add('on'); chatBody.scrollTop = 0;
}
// back to the conversation (or the welcome screen); restore=false when the caller sets the view itself
function closeFeatures(restore = true) {
  if (chatFeats.hidden) return;
  chatFeats.hidden = true; chatEl.classList.remove('features'); featsBtn.classList.remove('on');
  if (!restore) return;
  const started = !!chatLog.querySelector('.chat-msg');
  chatLog.hidden = !started; chatWelcome.hidden = started;
  if (started) scrollChat();
}

// the AI menu names the open mail's kind: تلخيص الخطاب / المذكرة / الطلب, or الإشعار for system notices
function syncAiMenu() {
  const { r } = openMail();
  $('#pop-ai [data-ai="summary"] .lbl').textContent = 'تلخيص ' + (r.acts.tashir ? r.acts.tashir.replace(/^تأشير\s+/, '') : r.acts.ok ? 'الطلب' : 'الإشعار');
  $('#pop-ai [data-ai="attach"]').hidden = !r.files;  // only offered when the mail has attachments
}
// reading-pane "المساعد الذكي" menu: an item opens the chat out of that button and sends its request as if typed
$('#pop-ai').addEventListener('click', e => {
  const item = e.target.closest('[data-ai]');
  if (!item) return;
  e.stopPropagation();  // otherwise the outside-click handler closes the chat it just opened
  openPop('pop-chat', $('.rtool .rbtn.ai'));
  ask({ ...AI_PROMPTS[item.dataset.ai], q: item.textContent.trim() });
});
chatField.addEventListener('input', syncComposer);
// the header only casts its shadow once the conversation scrolls under it
chatBody.addEventListener('scroll', () => chatEl.classList.toggle('scrolled', chatBody.scrollTop > 0));
chatForm.addEventListener('submit', e => {
  e.preventDefault();
  if (chatRun) return stopReply();
  const q = chatField.value.trim();
  if (!q) return;
  chatField.value = '';
  ask(freeReply(q));
});
chatEl.addEventListener('click', e => {
  const t = e.target.closest('[data-prompt],[data-chat],[data-act],.think-hd,.chat-attach');
  if (!t) return;
  if (t.dataset.prompt) ask(AI_PROMPTS[t.dataset.prompt]);
  else if (t.classList.contains('chat-attach')) toast('إرفاق ملف للمساعد قريبًا');
  else if (t.classList.contains('think-hd')) { const th = t.parentElement; if (!th.classList.contains('live')) th.classList.toggle('open'); }
  else if (t.dataset.chat === 'new') resetChat();
  else if (t.dataset.chat === 'expand') { const w = chatEl.classList.toggle('wide'); t.classList.toggle('on', w); t.dataset.ftip = w ? 'تصغير' : 'توسيع'; }
  else if (t.dataset.chat === 'history') chatHist.hidden ? openHistory() : closeHistory();
  else if (t.dataset.chat === 'features') chatFeats.hidden ? openFeatures() : closeFeatures();
  else if (t.dataset.chat === 'open') openChat(+t.dataset.id);
  else if (t.dataset.act) {
    const msg = t.closest('.chat-msg');
    if (t.dataset.act === 'copy') { navigator.clipboard?.writeText($('.bubble', msg).innerText).catch(() => {}); toast('تم نسخ الرد'); }
    else if (t.dataset.act === 'regen') ask(msg.prompt || freeReply(msg.dataset.q));  // a chat reopened from the history has no prompt object
    else {
      const on = t.classList.toggle('on');
      $$(`[data-act="${t.dataset.act === 'like' ? 'dislike' : 'like'}"]`, msg).forEach(b => b.classList.remove('on'));
      if (on) toast('شكرًا على تقييمك');
    }
  }
});
syncComposer();

// «إنشاء طلب»: its menu drops straight under the button, as wide as it (set before openPop places it)
$('#sp-new-req')?.addEventListener('click', e => { document.getElementById('pop-request').style.minWidth = e.currentTarget.offsetWidth + 'px'; }, true);


// Q Stamp: the licence card opens from the rail button; ✕, Esc or a click on the dimmed backdrop closes it
(() => {
  const layer = document.getElementById('qs-layer'), btn = document.querySelector('.rail-util[aria-label="Q Stamp"]');
  if (!layer || !btn) return;
  const open = () => { layer.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); layer.querySelector('.qs-x').focus(); };
  const close = () => { layer.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus(); };
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.addEventListener('click', open);
  layer.querySelector('.qs-x').addEventListener('click', close);
  layer.addEventListener('mousedown', e => { if (e.target === layer) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && layer.classList.contains('open')) close(); });
})();
