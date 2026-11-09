// Mail rules (like Outlook's «Rules»): rule folders sit in the folders panel under the system folders, every folder row has a
// ⋯ menu, and one «إدارة الصناديق» popup swaps its screens inside it (list · rule · delete) — never a popup over a popup.
// Behaviour (Outlook): a rule MOVES matching mail out of الوارد into its folder. Moves stay put — pausing, reordering or
// editing a rule never brings mail back; deleting asks whether to keep the folder or return its mail to الوارد.
// «تشغيل الآن», «تطبيق على البريد الموجود» and switching a rule back on run it over what is in الوارد now.
// State lives in memory only (a refresh starts again from the two example rules).
(() => {
  const ic = k => ICONS[k] || '';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const norm = s => String(s).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').trim();
  // Arabic counted noun: رسالة واحدة · رسالتين · 3–10 رسائل · 11+ رسالة
  const msgs = n => n === 1 ? 'رسالة واحدة' : n === 2 ? 'رسالتين' : n <= 10 ? `${n} رسائل` : `${n} رسالة`;

  // ---------- what a mail answers to ----------
  // the app's mail kinds (M in app.js, told apart by sender) mapped to the rule's five mail types and three sources:
  // خطاب وارد → رسالة · مذكرة / إخلاء طرف → معاملة · طلب / طلب إذن → طلب · «نظام خارجي» notices → إشعار نظام · للتعميم → تعميم
  const KIND = Object.fromEntries(Object.entries({
    fin: ['رسالة', 'خارجي'], proc: ['معاملة', 'خارجي'], ops: ['طلب', 'داخلي'], hr: ['إشعار نظام', 'نظام'], permits: ['إشعار نظام', 'نظام'],
    leave1: ['تعميم', 'داخلي'], leave2: ['طلب', 'داخلي'], leave3: ['معاملة', 'داخلي'],
  }).map(([k, v]) => [M[k].sender, v]));
  // the box popup speaks in kinds of work: معاملات · طلبات · إجازات (a طلب about a leave) · رسائل · تعاميم · إشعارات النظام
  const TYPE_OF = (k, subj) => k === 'طلب' && /إجاز/.test(subj) ? 'إجازات' : ({ 'معاملة': 'معاملات', 'طلب': 'طلبات', 'رسالة': 'رسائل', 'إشعار نظام': 'إشعارات النظام', 'تعميم': 'تعاميم' })[k];
  // التوجيه: the purpose the mail was forwarded for — the first tag on every mail card (للاعتماد · للاطلاع · للحفظ …)
  const routeOf = m => (m.tags || [])[0] || '';
  function facts(i) {
    const m = ALL_MAILS[i], r = READ[m.key] || READ.leave, [kind, src] = KIND[m.sender] || ['رسالة', 'داخلي'], type = TYPE_OF(kind, m.subj), route = routeOf(m);
    // the padlock («سري وعاجل») marks confidential + urgent mail; a late mail is urgent too
    return { type, src, route, from: `${m.sender} ${r.org}`, subj: m.subj, conf: r.warn ? 'سري' : 'عادي', prio: r.warn || m.late ? 'عاجلة' : 'عادية', att: r.files && r.files.length ? 'نعم' : 'لا' };
  }
  // «الكل»: the condition is open — it lets every mail through until the user narrows it
  const ANY = 'الكل';
  const FIELDS = [
    { k: 'type', l: 'النوع', opts: [ANY, 'معاملات', 'طلبات', 'إجازات', 'رسائل', 'تعاميم', 'إشعارات النظام'] },
    { k: 'src', l: 'المصدر', opts: [ANY, 'داخلي', 'خارجي', 'نظام'] },
    { k: 'route', l: 'التوجيه', opts: [ANY, 'للاعتماد', 'للاطلاع', 'للحفظ', 'للتعميم', 'للمفاهمة', 'للإفادة', 'للإجراء اللازم', 'للدراسة والرأي'] },
  ];
  const FIELD = Object.fromEntries(FIELDS.map(f => [f.k, f]));
  const BOX_ICONS = ['r_folder', 'sp_folder', 'fd_all', 'fd_inbox', 'fd_sent', 'fd_saved', 'fd_fav', 'fd_urgent', 'fd_late', 'fd_archive',
    'i_calendar', 'i_time', 'i_file_check', 'i_mail_add', 'i_stats', 'm_file', 'sp_users', 'sp_task', 'sp_chart', 'sp_lock', 'sp_mega',
    'f_hier', 'f_integ', 'f_platform', 'h_book', 'ac_community', 'r_hr_line', 'r_comm_line', 'r_screen_line',
    'h_mail', 'h_cal', 'm_notes', 'm_user', 'ac_profile', 'ac_plan', 'fd_due', 'fd_sign', 'm_sig', 'r_inbox_line', 'r_home_line', 'r_set_line',
    ...Object.keys(ICONS).filter(k => k.startsWith('bx_') || k.startsWith('hg_'))];
  const isMove = t => t === 'move' || t === 'moveTo';
  const condOk = (c, f) => FIELD[c.f].opts ? c.v === ANY || f[c.f] === c.v : !!c.v.trim() && norm(f[c.f]).includes(norm(c.v));
  // rows of the same field are alternatives («المصدر: داخلي أو خارجي»); the fields then combine by the shared «و / أو» (match)
  const condGroups = conds => FIELDS.map(x => conds.filter(c => c.f === x.k)).filter(g => g.length);
  const matchesRule = (r, i) => { const f = facts(i), gs = condGroups(r.conds), ok = g => g.some(c => condOk(c, f)); return !!gs.length && (r.match === 'any' ? gs.some(ok) : gs.every(ok)); };
  // a value a field can still take in a new row: «الكل» while the field is unused, then the first value its other rows don't use
  const freeVal = (conds, k, skip) => { const taken = conds.filter((c, j) => j !== skip && c.f === k).map(c => c.v); return taken.length ? FIELD[k].opts.find(o => o !== ANY && !taken.includes(o)) : ANY; };

  // ---------- state ----------
  let seq = 0;
  const uid = p => p + (++seq);
  const FOLDERS = [];   // boxes: { id, name, icon, parent (folder key or null), rule (rule id or null) }
  const RULES = [];     // { id, name, on, match: all|any, conds: [{ f, v }], acts: [{ t, to }], existing, stop, folder }
  const ruleOf = id => RULES.find(r => r.id === id);
  const userFolder = id => FOLDERS.find(f => f.id === id);
  const sysRow = key => foldersEl.querySelector(`.frow.sys[data-fid="${key}"]`);
  const folderName = key => userFolder(key) ? userFolder(key).name : sysRow(key) ? sysRow(key).querySelector('.lbl').textContent : '';
  const exists = key => !!(userFolder(key) || sysRow(key));
  const rowOf = i => document.querySelector(`#items .mail[data-i="${i}"]`);
  const countIn = key => MAIL_FOLDER.filter(k => k === key).length;
  const tree = key => [key, ...FOLDERS.filter(f => f.parent === key).flatMap(f => tree(f.id))];
  const target = r => { const a = r.acts.find(x => isMove(x.t)); return !a ? null : a.t === 'move' ? r.folder : a.to; };

  // one rule's actions on one mail; a mail already moved by an earlier rule keeps its folder (the first move wins)
  function act(r, i, canMove = true) {
    const to = target(r), f = facts(i);
    if (canMove && to && exists(to)) MAIL_FOLDER[i] = to;
    r.acts.forEach(a => {
      if (a.t === 'read' && f.conf === 'عادي') setUnread(rowOf(i), false);   // confidential mail is never marked read by a rule
      if (a.t === 'flag') setFlag(rowOf(i), true);
    });
  }
  // one rule over الوارد now («تشغيل الآن», «تطبيق على البريد الموجود»)
  function runRule(r) {
    let n = 0;
    MAIL_FOLDER.forEach((k, i) => { if (k === 'inbox' && matchesRule(r, i)) { act(r, i); n++; } });
    return n;
  }
  // incoming mail: the rules in order; «إيقاف الصناديق التالية» stops the ones below
  function runAll(rules) {
    MAIL_FOLDER.forEach((k, i) => {
      if (k !== 'inbox') return;
      for (const r of rules) {
        if (!matchesRule(r, i)) continue;
        act(r, i, MAIL_FOLDER[i] === 'inbox');
        if (r.stop) break;
      }
    });
  }

  // ---------- folders panel ----------
  const list = foldersEl.querySelector('.fold-list');
  const moreBtn = name => `<button type="button" class="fmore" aria-label="خيارات ${esc(name)}" aria-haspopup="menu" aria-expanded="false">${ic('n_more')}</button>`;
  // the system folders become rows with their ⋯ (a button can't hold another button)
  list.querySelectorAll(':scope > .folder').forEach(f => {
    const row = document.createElement('div');
    row.className = 'frow sys';
    row.dataset.fid = f.dataset.f;
    f.replaceWith(row);
    row.append(f);
    row.insertAdjacentHTML('beforeend', moreBtn(f.querySelector('.lbl').textContent));
  });
  // the boxes in the order the user dragged them to (their rules run in that order too)
  const kids = key => FOLDERS.filter(f => f.parent === key);
  function userRow(f, lvl) {
    const r = f.rule && ruleOf(f.rule), paused = r && !r.on, n = countIn(f.id);
    const row = document.createElement('div');
    row.className = 'frow user';
    row.dataset.fid = f.id;
    row.draggable = true;
    row.style.setProperty('--lvl', lvl);
    row.innerHTML = `<button class="folder${paused ? ' paused' : ''}" data-f="${f.id}"${paused ? ' data-ftip="الصندوق متوقف"' : ''}><span class="fic">${ic(f.icon || 'r_folder')}${paused ? `<span class="fbadge" aria-hidden="true"><svg width="6" height="6" viewBox="0 0 6 6"><path d="M1.6 1v4M4.4 1v4" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/></svg></span>` : ''}</span><span class="lbl">${esc(f.name)}</span>${paused ? '<span class="db-sr">، الصندوق متوقف</span>' : ''}<span class="cnt"${n ? '' : ' hidden'}>${n}</span></button>${moreBtn(f.name)}`;
    return row;
  }
  function renderFolders() {
    list.querySelectorAll('.frow.user').forEach(n => n.remove());
    renderGroups();
    const place = (after, key, lvl) => kids(key).reduce((last, f) => { const row = userRow(f, lvl); last.after(row); return place(row, f.id, lvl + 1); }, after);
    list.querySelectorAll('.frow.sys').forEach(row => place(row, row.dataset.fid, 1));   // subfolders of a system folder sit under it
    place(emptyBoxes, null, 0);                                                         // rule and plain folders under «صناديق»
    // الوارد and مؤرشفة count the mails they hold (the other system counts are fixed in this prototype)
    ['inbox'].forEach(key => {   // الجميع counts what it holds (المؤرشفة / محذوفة were removed 8 Nov)
      const btn = sysRow(key).querySelector('.folder'), n = countIn(key);
      let c = btn.querySelector('.cnt');
      if (!c) { btn.insertAdjacentHTML('beforeend', '<span class="cnt"></span>'); c = btn.querySelector('.cnt'); }
      c.textContent = n; c.hidden = !n;
    });
    foldersEl.querySelectorAll('.folder').forEach(b => b.classList.toggle('active', b.dataset.f === curFolder));
    emptyBoxes.hidden = !!list.querySelector('.frow.user');
  }
  const emptyBoxes = document.createElement('div');
  emptyBoxes.className = 'fempty';
  emptyBoxes.innerHTML = `<span class="fempty-ic">${ic('r_folder')}</span><b>لا توجد صناديق بعد</b><button type="button" class="fempty-btn">${ic('r_plus')}إنشاء صندوق</button>`;
  foldersEl.querySelector('.fgroup').after(emptyBoxes);
  // after any change: the panel, the open folder (back to الوارد if it is gone) and its title
  function refresh() {
    renderFolders();
    const open = foldersEl.querySelector(`.folder[data-f="${curFolder}"]`);
    openFolder(open || sysRow('inbox').querySelector('.folder'));
  }

  // ---------- the ⋯ menu of a folder row ----------
  const fMenu = document.getElementById('pop-folder');
  let menuKey = null, menuBtn = null;
  const mi = (fa, icon, label, cls = '') => `<button class="mi g10${cls}" role="menuitem" data-fa="${fa}">${ic(icon)}${label}</button>`;
  const SEP = '<div class="mi-sep" role="separator"></div>';
  function buildMenu(key) {
    const f = userFolder(key), r = f && f.rule && ruleOf(f.rule);
    if (groupOf(key)) return mi('gedit', 'm_edit2', 'تعديل المجموعة') + SEP + mi('gdel', 'n_delete', 'حذف', ' danger');
    let h = mi('sub', 'm_folder_add', 'إنشاء صندوق فرعي');
    if (!f) return h + mi('read', 'm_mailread', 'تعليم الكل كمقروء') + mi('new', 'm_folder_add', 'إنشاء صندوق');
    h += mi('rename', 'm_edit1', 'إعادة تسمية') + mi('read', 'm_mailread', 'تعليم الكل كمقروء') + SEP;
    h += r ? mi('edit', 'm_edit2', 'تعديل الصندوق') + (r.on ? mi('toggle', 'm_pause', 'إيقاف الصندوق') : mi('toggle', 'm_play', 'تشغيل الصندوق'))
      : mi('newfor', 'filter18', 'إضافة شروط للصندوق');
    return h + SEP + mi('delete', 'n_delete', 'حذف', ' danger');
  }
  // «صناديق»: fold the user-made folders away, or start a new one
  const boxHead = foldersEl.querySelector('.fgroup-t');
  boxHead.addEventListener('click', () => {
    const open = boxHead.getAttribute('aria-expanded') !== 'true';
    boxHead.setAttribute('aria-expanded', String(open));
    list.classList.toggle('boxes-closed', !open);
  });
  [foldersEl.querySelector('.fgroup-add'), emptyBoxes.querySelector('.fempty-btn')].forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    boxHead.setAttribute('aria-expanded', 'true'); list.classList.remove('boxes-closed');
    openRule(blankDraft(), b);
  }));
  foldersEl.addEventListener('click', e => {
    const b = e.target.closest('.fmore');
    if (!b) return;
    e.stopPropagation();
    menuKey = b.closest('.frow').dataset.fid; menuBtn = b;
    fMenu.innerHTML = buildMenu(menuKey);
    openPop('pop-folder', b);
  });
  // the panel closes (when not pinned) once the menu is gone and the pointer is elsewhere
  document.addEventListener('click', () => setTimeout(closeFolders), true);
  fMenu.addEventListener('click', e => {
    const it = e.target.closest('[data-fa]');
    if (!it) return;
    const key = menuKey, f = userFolder(key), r = f && f.rule && ruleOf(f.rule), fa = it.dataset.fa;
    if (fa === 'gedit') return openGroup(groupOf(key), menuBtn);
    if (fa === 'gdel') return openGroupDel(groupOf(key), menuBtn);
    if (fa === 'sub') {
      const nf = { id: uid('u'), name: 'صندوق جديد', icon: (f && f.icon) || 'r_folder', parent: key, rule: null };
      FOLDERS.push(nf); refresh(); rename(nf.id, true);
    }
    if (fa === 'rename') rename(key);
    if (fa === 'read') {
      MAIL_FOLDER.forEach((k, i) => { if (k === key) setUnread(rowOf(i), false); });
      toast('تم تعليم كل الرسائل كمقروءة');
    }
    if (fa === 'new') openRule(blankDraft(), menuBtn);
    if (fa === 'newfor') openRule({ ...blankDraft(), name: f.name, acts: [{ t: 'moveTo', to: key }] }, menuBtn);
    if (fa === 'edit') openRule(draftOf(r), menuBtn);
    if (fa === 'toggle') toggleRule(r);
    if (fa === 'delete') openDelete({ folder: key }, menuBtn);
  });

  // rename in place: the row turns into a field; Enter or leaving it saves, Esc cancels
  function rename(key, isNew) {
    const row = foldersEl.querySelector(`.frow[data-fid="${key}"]`), f = userFolder(key);
    if (!row || !f) return;
    if (!foldersEl.classList.contains('pinned')) foldersEl.classList.add('open');
    row.classList.add('editing');
    row.insertAdjacentHTML('beforeend', `<div class="f-edit"><span class="fic">${ic(f.icon || 'r_folder')}</span><input type="text" maxlength="40" aria-label="اسم الصندوق" value="${esc(f.name)}"></div>`);
    const inp = row.querySelector('.f-edit input');
    let done = false;
    const finish = save => {
      if (done) return; done = true;
      const v = inp.value.trim();
      const changed = save && v && v !== f.name;
      if (changed) f.name = v;
      refresh();
      if (isNew) toast('تم إنشاء الصندوق');
      else if (changed) toast('تم تغيير اسم الصندوق');
      const b = foldersEl.querySelector(`.folder[data-f="${key}"]`);
      b && b.focus();
      setTimeout(closeFolders, 200);
    };
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); finish(true); }
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(false); }
    });
    inp.addEventListener('blur', () => finish(true));
    inp.focus(); inp.select();
  }

  function toggleRule(r, quiet) {
    r.on = !r.on;
    let n = 0;
    if (r.on && r.existing) n = runRule(r);   // back on: it catches up with what is in الوارد now
    refresh();
    if (!quiet) toast(r.on ? (n ? `تم تشغيل الصندوق وتطبيقه على ${msgs(n)}` : 'تم تشغيل الصندوق') : 'تم إيقاف الصندوق');
    return n;
  }

  // ---------- the «إدارة الصناديق» popup ----------
  const layer = document.getElementById('rules-modal'), box = layer.querySelector('.rl-modal'), rPop = layer.querySelector('.rl-pop');
  let V = null, opener = null;   // V: { screen: list|rule|del, fromList, q, open: Set, d (draft), del }
  const X_BTN = `<button type="button" class="db-m-x" data-r="close" aria-label="إغلاق">${ic('x18')}</button>`;
  const BACK_BTN = `<button type="button" class="db-m-x" data-r="back" aria-label="رجوع إلى الصناديق">${ic('r_back')}</button>`;

  function openLayerWith(fn, trigger) {
    if (!layer.classList.contains('open')) {
      opener = trigger && trigger.isConnected ? trigger : document.activeElement;
      closePop();
      layer.classList.add('open');
    }
    fn();
  }
  function closeModal() {
    closeRowMenu();
    layer.classList.remove('open');
    V = null;
    if (opener && opener.isConnected && opener.offsetParent) opener.focus();
    setTimeout(closeFolders, 0);
  }
  const focusFirst = sel => setTimeout(() => { const el = (sel && box.querySelector(sel)) || box.querySelector('input, button:not([disabled])'); el && el.focus(); }, 0);

  // ----- list screen -----
  function openList(trigger) { openLayerWith(() => showList(), trigger); }
  function showList(focusSel) {
    V = { screen: 'list', q: V && V.q || '', open: V && V.open || new Set() };
    box.className = 'db-modal rl-modal';
    box.innerHTML = `
      <header class="db-m-hd"><div><h2 id="rl-title">إدارة الصناديق</h2><p>تُطبَّق شروط الصناديق على البريد الوارد بالترتيب من الأعلى إلى الأسفل.</p></div>${X_BTN}</header>
      <div class="rl-tools"><label class="lsearch">${ic('search16')}<input type="search" placeholder="ابحث باسم الصندوق" aria-label="ابحث باسم الصندوق" value="${esc(V.q)}"></label>
        <button type="button" class="db-btn btn-primary" data-r="new">${ic('r_plus')}صندوق جديد</button></div>
      <div class="rl-body" aria-live="polite"></div>`;
    renderRows();
    focusFirst(focusSel);
  }
  const condText = r => condGroups(r.conds).map(g => `${FIELD[g[0].f].l}: ${g.map(c => esc(c.v)).join(' أو ')}`).join(r.match === 'any' ? ' أو ' : ' و');
  const actText = r => r.acts.map(a => a.t === 'move' ? `نقل إلى الصندوق «${esc(folderName(r.folder))}»` : a.t === 'moveTo' ? `نقل إلى «${esc(folderName(a.to))}»`
    : a.t === 'read' ? 'تعليم كمقروءة (عدا البريد السري)' : 'إضافة علامة متابعة').join('، ');
  function renderRows() {
    const q = norm(V.q), rows = RULES.filter(r => !q || norm(r.name).includes(q)), lock = !!q, body = box.querySelector('.rl-body');
    const empty = (t, s) => `<div class="empty-state"><span class="ic">${ic('r_folder')}</span><b>${t}</b><span>${s}</span></div>`;
    body.innerHTML = !RULES.length ? empty('لا توجد صناديق', 'أنشئ صندوقًا ليجمع البريد الوارد تلقائيًا.')
      : !rows.length ? empty('لا توجد نتائج', 'جرّب اسمًا آخر للصندوق.')
      : `<ul class="db-dr-list rl-list">${rows.map(r => {
        const i = RULES.indexOf(r), open = V.open.has(r.id), nm = esc(r.name);
        return `<li class="rl-row${r.on ? '' : ' off'}" data-id="${r.id}" draggable="${!lock}">
          <div class="rl-line">
            <span class="db-dr-grip" aria-hidden="true">${ic('r_drag')}</span>
            <span class="db-dr-n">${nm}</span>
            <button type="button" class="db-switch" role="switch" aria-checked="${r.on}" data-r="toggle" aria-label="تشغيل الصندوق ${nm}" data-ftip="${r.on ? 'إيقاف الصندوق' : 'تشغيل الصندوق'}"><i></i></button>
            <span class="db-dr-move"><button type="button" class="db-dr-mv" data-r="up" ${lock || i === 0 ? 'disabled' : ''} aria-label="تحريك ${nm} لأعلى">${ic('sp_up')}</button><button type="button" class="db-dr-mv" data-r="down" ${lock || i === RULES.length - 1 ? 'disabled' : ''} aria-label="تحريك ${nm} لأسفل">${ic('sp_down')}</button></span>
            <button type="button" class="db-act" data-r="more" aria-haspopup="menu" aria-expanded="false" aria-label="خيارات ${nm}">${ic('n_more')}</button>
            <span class="rl-div" aria-hidden="true"></span>
            <button type="button" class="db-act rl-chev" data-r="expand" aria-expanded="${open}" aria-controls="rl-sum-${r.id}" aria-label="تفاصيل ${nm}">${ic('fl_chev')}</button>
          </div>
          <dl class="rl-sum" id="rl-sum-${r.id}"${open ? '' : ' hidden'}><dt>الشروط</dt><dd>${condText(r)}</dd><dt>الإجراءات</dt><dd>${actText(r)}</dd>${r.stop ? '<dt>الخيارات</dt><dd>إيقاف الصناديق التالية</dd>' : ''}</dl>
        </li>`; }).join('')}</ul>`;
  }
  function moveRule(r, to) {
    const from = RULES.indexOf(r);
    if (to < 0 || to >= RULES.length || to === from) return;
    RULES.splice(from, 1); RULES.splice(to, 0, r);
    refresh(); renderRows();
  }
  // the row ⋯ menu: the app's .pop.menu, inside the popup's layer
  let rowMenuBtn = null;
  function openRowMenu(btn) {
    if (rowMenuBtn === btn) return closeRowMenu();
    closeRowMenu();
    rowMenuBtn = btn; btn.setAttribute('aria-expanded', 'true');
    rPop.dataset.id = btn.closest('.rl-row').dataset.id;
    rPop.innerHTML = `<button class="mi g10" role="menuitem" data-rm="edit">${ic('m_edit2')}تعديل</button><button class="mi g10" role="menuitem" data-rm="run">${ic('m_play')}تشغيل الآن</button>${SEP}<button class="mi g10 danger" role="menuitem" data-rm="delete">${ic('n_delete')}حذف</button>`;
    rPop.classList.add('open');
    place(rPop, btn);
    rPop.querySelector('.mi').focus();
  }
  function closeRowMenu(refocus) {
    if (!rowMenuBtn) return;
    rPop.classList.remove('open');
    rowMenuBtn.setAttribute('aria-expanded', 'false');
    if (refocus) rowMenuBtn.focus();
    rowMenuBtn = null;
  }
  rPop.addEventListener('click', e => {
    const it = e.target.closest('[data-rm]');
    if (!it) return;
    const r = ruleOf(rPop.dataset.id);
    closeRowMenu();
    if (it.dataset.rm === 'edit') showRule(draftOf(r), true);
    if (it.dataset.rm === 'delete') showDelete({ rule: r.id }, true);
    if (it.dataset.rm === 'run') {
      const n = runRule(r);
      refresh(); renderRows();
      toast(n ? `تم تطبيق الصندوق على ${msgs(n)}` : 'لا توجد رسائل في الوارد تنطبق عليها شروط الصندوق');
      const b = box.querySelector(`.rl-row[data-id="${r.id}"] [data-r="more"]`); b && b.focus();
    }
  });

  // ----- rule screen (new or edit) -----
  const blankDraft = () => ({ id: null, name: '', icon: 'r_folder', match: 'all', conds: [{ f: 'type', v: ANY }], acts: [{ t: 'move' }], existing: true, stop: false, notify: false });
  const draftOf = r => ({ id: r.id, name: r.name, icon: (userFolder(r.folder) || {}).icon || 'r_folder', match: r.match, conds: r.conds.map(c => ({ ...c })), acts: r.acts.map(a => ({ ...a })), existing: r.existing, stop: r.stop, notify: !!r.notify });
  function openRule(d, trigger) { openLayerWith(() => showRule(d, false), trigger); }
  function showRule(d, fromList) {
    V = { screen: 'rule', fromList, d, q: V && V.q || '', open: V && V.open || new Set(), errs: {} };
    box.className = 'db-modal rl-modal';
    box.innerHTML = `
      <header class="db-m-hd rl-hd">${fromList ? BACK_BTN : ''}<div><h2 id="rl-title">${d.id ? 'تعديل الصندوق' : 'صندوق جديد'}</h2><p>يجمع الصندوق البريد الوارد الذي يطابق الشروط تلقائيًا.</p></div>${X_BTN}</header>
      <div class="rl-body rl-form"></div>
      <footer class="db-m-ft rl-ft"><button type="button" class="db-btn btn-ghost" data-r="cancel">إلغاء</button><button type="button" class="db-btn btn-primary" data-r="save">حفظ</button></footer>`;
    renderForm();
    focusFirst('#rl-name');
  }
  // the app's single-choice dropdown (.dd / .select / .dd-menu / .dd-opt, as in the filter panel and the dashboard)
  const dd = (key, cur, opts, label, bad) => {
    const c = opts.find(([v]) => v === cur) || opts[0];
    return `<div class="dd"><div class="select${bad ? ' bad' : ''}" role="button" tabindex="0" aria-haspopup="listbox" aria-expanded="false" aria-label="${esc(label)}" data-dd="${key}"><span class="val">${esc(c[1])}</span>${ic('fl_chev')}</div>
      <div class="dd-menu" role="listbox" aria-label="${esc(label)}">${opts.map(([v, t, dis]) => `<button type="button" class="dd-opt${v === c[0] ? ' sel' : ''}" role="option" aria-selected="${v === c[0]}" data-ddv="${key}" data-v="${esc(v)}"${dis ? ' disabled' : ''}>${esc(t)}${v === c[0] ? ic('m_tick') : ''}</button>`).join('')}</div></div>`;
  };
  const folderOpts = () => FOLDERS.map(f => [f.id, f.name]);
  // the approved layout: ① name · ② «عند وصول بريد» (conditions in a grey box, «و / أو» joiners) · ③ «نفّذ ما يلي» (actions) · خيارات إضافية (collapsible)
  const ACT_FIELDS = [['mv', 'نقل إلى'], ['read', 'تعليم كمقروءة'], ['flag', 'إضافة علامة متابعة']];
  const actField = t => isMove(t) ? 'mv' : t;
  function renderForm() {
    const { d, errs } = V, body = box.querySelector('.rl-form'), top = body.scrollTop;
    const fa = document.activeElement, fsig = fa && body.contains(fa) ? ['data-dd', 'data-cv', 'data-r', 'data-opt', 'data-act'].map(a => fa.hasAttribute(a) ? `[${a}="${fa.getAttribute(a)}"]` : '').join('') + (fa.dataset.i ? `[data-i="${fa.dataset.i}"]` : '') : '';
    const err = (k, t) => errs[k] ? `<p class="rl-err" id="rl-err-${k}">${t}</p>` : '';
    const ownId = d.id && ruleOf(d.id) && ruleOf(d.id).acts.some(a => a.t === 'move') && ruleOf(d.id).folder;
    // «نقل إلى»: the rule's own folder first («مجلد جديد باسم القاعدة» until it exists), then مؤرشفة and the user folders
    const moveOpts = [['__own', 'هذا الصندوق'], ...folderOpts().filter(([k]) => k !== ownId)];
    const used = (t, i) => d.acts.some((a, j) => j !== i && actField(a.t) === t);
    const freeAct = ACT_FIELDS.find(([t]) => !used(t, -1));
    const step = (n, html) => `<section class="rl-sec">${html}</section>`;
    // Notion-style lead cell: «عندما» on the first condition, then one shared «و / أو» choice (match) on every following row
    const lead = i => !i ? '<span class="rl-lead">عندما</span>' : d.conds[i - 1].f === d.conds[i].f ? '<span class="rl-lead rl-or">أو</span>'
      : dd('match:' + i, d.match, [['all', 'و'], ['any', 'أو']], 'طريقة الربط بين الشروط');
    // a field can repeat (as «أو») while it has a value left; a value its other rows use is taken, and so is «الكل» once it repeats
    const sibs = i => d.conds.filter((o, j) => j !== i && o.f === d.conds[i].f).map(o => o.v);
    const canAdd = FIELDS.some(x => freeVal(d.conds, x.k));
    const trash = (r, i, l) => `<button type="button" class="xbtn rl-rm" data-r="${r}" data-i="${i}" aria-label="${l}">${ic('n_delete')}</button>`;
    const conds = d.conds.map((c, i) => { const f = FIELD[c.f], bad = errs.vals && (f.opts ? c.v === ANY : !c.v.trim());
      return `<div class="rl-cond">${lead(i)}${dd('cf:' + i, c.f, FIELDS.map(x => [x.k, x.l, x.k !== c.f && !freeVal(d.conds, x.k, i)]), 'حقل الشرط')}${f.opts ? dd('cv:' + i, c.v, f.opts.map(o => [o, o, o !== c.v && (sibs(i).includes(o) || o === ANY && sibs(i).length > 0)]), f.l, bad)
        : `<input class="db-input${bad ? ' bad' : ''}" data-cv="${i}" value="${esc(c.v)}" placeholder="${f.ph}" aria-label="${f.l}"${bad ? ' aria-invalid="true"' : ''}>`}${trash('rm-cond', i, 'حذف الشرط').replace('<button', d.conds.length > 1 ? '<button' : '<button disabled')}</div>`; }).join('');
    const acts = d.acts.map((a, i) => `<div class="rl-cond"><span class="rl-lead">${i ? 'و' : 'ثم'}</span>${dd('at:' + i, actField(a.t), ACT_FIELDS.map(([t, l]) => [t, l, used(t, i)]), 'الإجراء')}${
      isMove(a.t) ? dd('ato:' + i, a.t === 'move' ? '__own' : a.to, moveOpts, 'الصندوق') : '<span></span>'}${trash('rm-act', i, 'حذف الإجراء')}</div>`).join('');
    const has = t => d.acts.some(a => a.t === t);
    const opt = (attr, k, on, title, hint) => `<label class="rl-check"><input type="checkbox" ${attr}="${k}"${on ? ' checked' : ''}><span class="pick" aria-hidden="true"></span><span><b>${title}</b><small>${hint}</small></span></label>`;
    const icons = V.icons ? `<div class="rl-ic-menu" role="listbox" aria-label="أيقونة الصندوق">${BOX_ICONS.map(k => `<button type="button" class="rl-ic-opt${k === d.icon ? ' sel' : ''}" role="option" aria-selected="${k === d.icon}" data-r="icon" data-k="${k}">${ic(k)}</button>`).join('')}</div>` : '';
    // ① the icon as its own field — a large tile that opens the icon grid — then ② the required name
    body.innerHTML = step(1, `<span class="rl-label" id="rl-ic-l">أيقونة الصندوق</span>
        <div class="rl-ic"><button type="button" class="rl-ic-btn" data-r="icons" aria-haspopup="listbox" aria-expanded="${!!V.icons}" aria-labelledby="rl-ic-l" data-ftip="تغيير الأيقونة">${ic(d.icon)}<span class="rl-ic-edit" aria-hidden="true">${ic('hg_pencil')}</span></button>${icons}</div>`)
      + step(1, `<label class="rl-label" for="rl-name">اسم الصندوق <span class="rl-req" aria-hidden="true">*</span></label>
        <input class="db-input${errs.name ? ' bad' : ''}" id="rl-name" maxlength="40" required aria-required="true" placeholder="مثال: طلبات الإجازة" value="${esc(d.name)}"${errs.name ? ' aria-invalid="true" aria-describedby="rl-err-name"' : ''}>${err('name', errs.name)}`)
      + step(2, `<h3 class="rl-h" id="rl-conds">عند وصول بريد <span class="rl-req" aria-hidden="true">*</span></h3>
        <div class="rl-box" role="group" aria-labelledby="rl-conds">${conds}<button type="button" class="db-link rl-add" data-r="add-cond"${canAdd ? '' : ' disabled'}>${ic('n_add')}إضافة شرط</button></div>
        ${err('conds', errs.conds)}`)
      // no «نفّذ ما يلي»: a box always gathers its matching mail into itself (acts stay [{ t: 'move' }])
      // خيارات إضافية: always open — what else the box does with the mail it gathers
      + `<section class="rl-sec rl-more">
        <h3 class="rl-h" id="rl-more-t">خيارات إضافية</h3>
        <div class="rl-more-b" role="group" aria-labelledby="rl-more-t">
          ${opt('data-opt', 'existing', d.existing, 'تطبيق على البريد الموجود', 'تُجمع في الصندوق الرسائل المطابقة الموجودة حاليًا في الوارد.')}
          ${opt('data-act', 'read', has('read'), 'تعليم الرسائل كمقروءة', 'تُعلَّم الرسائل الواصلة للصندوق كمقروءة (عدا البريد السري).')}
          ${opt('data-opt', 'notify', d.notify, 'إشعاري عند وصول بريد جديد', 'يصلك إشعار كلما وصلت رسالة جديدة إلى الصندوق.')}
        </div></section>`;
    body.scrollTop = top;
    if (fsig) { const el = body.querySelector(fsig); el && el.focus(); }
  }
  function validate() {
    const d = V.d, e = {}, name = d.name.trim();
    // a name another box's folder already uses counts too (every box is a folder)
    if (!name) e.name = 'اسم الصندوق مطلوب.';
    else if (RULES.some(r => r.id !== d.id && norm(r.name) === norm(name))) e.name = 'يوجد صندوق بالاسم نفسه.';
    if (!d.conds.length) e.conds = 'أضف شرطًا واحدًا على الأقل.';
    else if (d.conds.every(c => c.v === ANY)) { e.conds = 'حدّد قيمة لشرط واحد على الأقل بدل «الكل».'; e.vals = true; }
    if (!d.acts.length) e.acts = 'أضف إجراءً واحدًا على الأقل.';
    V.errs = e;
    return !Object.keys(e).length;
  }
  function saveRule() {
    if (!validate()) {
      renderForm();
      const bad = box.querySelector('.rl-form .bad, .rl-form .rl-err');
      if (bad) (bad.matches('.rl-err') ? bad.previousElementSibling : bad).focus?.();
      bad && bad.scrollIntoView({ block: 'nearest' });
      return;
    }
    const d = V.d, isNew = !d.id, r = isNew ? { id: uid('r'), on: true, folder: null } : ruleOf(d.id), oldName = r.name;
    Object.assign(r, { name: d.name.trim(), match: d.match, conds: d.conds.map(c => ({ ...c, v: c.v.trim() })), acts: d.acts.map(a => ({ ...a })), existing: d.existing, stop: d.stop, notify: d.notify });
    // the rule's folder: its own (made with the rule's name), or an existing user folder it moves into that no other rule owns;
    // a folder it no longer moves into stays as a plain folder
    const prev = r.folder && userFolder(r.folder), own = r.acts.some(a => a.t === 'move'), to = r.acts.find(a => a.t === 'moveTo');
    let next = null;
    if (own) {
      next = prev || { id: uid('u'), name: r.name, icon: d.icon, parent: null, rule: r.id };
      if (!prev) FOLDERS.push(next);
      else if (prev.name === oldName) prev.name = r.name;   // the folder keeps carrying the rule's name
    } else if (to && userFolder(to.to) && (!userFolder(to.to).rule || userFolder(to.to).rule === r.id)) next = userFolder(to.to);
    if (prev && prev !== next) prev.rule = null;
    if (next) { next.rule = r.id; next.icon = d.icon; }
    r.folder = next ? next.id : null;
    if (isNew) RULES.push(r);
    const n = r.on && r.existing ? runRule(r) : 0;
    refresh();
    toast(n ? `تم حفظ الصندوق وتطبيقه على ${msgs(n)}` : 'تم حفظ الصندوق');
    if (V.fromList) { V.open.add(r.id); showList(`.rl-row[data-id="${r.id}"] [data-r="expand"]`); } else closeModal();
  }

  // ----- delete screen: a rule (from the list) or a folder (from its ⋯) -----
  function openDelete(what, trigger) { openLayerWith(() => showDelete(what, false), trigger); }
  function showDelete(what, fromList) {
    V = { screen: 'del', fromList, del: what, q: V && V.q || '', open: V && V.open || new Set() };
    const r = what.rule && ruleOf(what.rule), fkey = what.folder || (r && r.folder), f = fkey && userFolder(fkey), n = f ? tree(fkey).reduce((s, k) => s + countIn(k), 0) : 0;
    box.className = 'db-modal rl-modal sm';
    box.innerHTML = r ? `
      <header class="db-m-hd"><h2 id="rl-title">حذف الصندوق "${esc(r.name)}"؟</h2>${X_BTN}</header>
      <div class="rl-body rl-confirm"><p>${f ? (n ? `ستُنقل ${msgs(n)} إلى الوارد.` : 'الصندوق لا يحتوي على رسائل.') : 'لن تتأثر الرسائل التي نقلها الصندوق سابقًا.'}</p></div>
      <footer class="db-m-ft rl-ft col"><button type="button" class="db-btn db-danger" data-r="del-move">حذف الصندوق</button><button type="button" class="db-btn btn-ghost" data-r="cancel">إلغاء</button></footer>`
      : `
      <header class="db-m-hd"><h2 id="rl-title">حذف الصندوق "${esc(f.name)}"؟</h2>${X_BTN}</header>
      <div class="rl-body rl-confirm"><p>${n ? `ستُنقل ${msgs(n)} إلى الوارد.` : 'الصندوق لا يحتوي على رسائل.'}</p></div>
      <footer class="db-m-ft rl-ft col"><button type="button" class="db-btn db-danger" data-r="del-move">حذف الصندوق</button><button type="button" class="db-btn btn-ghost" data-r="cancel">إلغاء</button></footer>`;
    focusFirst('[data-r="cancel"]');
  }
  function dropFolder(key) {   // its mails (and its subfolders' mails) go back to الوارد; rules that moved into it lose that action
    const keys = tree(key);
    MAIL_FOLDER.forEach((k, i) => { if (keys.includes(k)) MAIL_FOLDER[i] = 'inbox'; });
    keys.forEach(k => { const f = userFolder(k); FOLDERS.splice(FOLDERS.indexOf(f), 1); });
    RULES.forEach(r => { r.acts = r.acts.filter(a => !(a.t === 'moveTo' && keys.includes(a.to))); });
    [...RULES].forEach(r => { if (keys.includes(r.folder)) RULES.splice(RULES.indexOf(r), 1); });
  }
  function doDelete(keep) {
    const { rule, folder } = V.del, r = rule && ruleOf(rule);
    if (r) {
      if (r.folder && userFolder(r.folder)) { if (keep) userFolder(r.folder).rule = null; else dropFolder(r.folder); }
      if (RULES.includes(r)) RULES.splice(RULES.indexOf(r), 1);
      V.open.delete(r.id);
    } else dropFolder(folder);
    refresh();
    toast('تم حذف الصندوق');
    if (V.fromList) showList('[data-r="new"]'); else closeModal();
  }

  // ---------- «مجموعات»: people and departments gathered under one name; a group lists its members' mail ----------
  const GROUPS = [];   // { id, name, members: [{ t: 'd' (department) | 'p' (person), n }] }
  const groupOf = id => GROUPS.find(g => g.id === id);
  const DIR_DEPTS = ['إدارة الموارد البشرية', 'إدارة الشؤون المالية', 'إدارة الشؤون الإدارية', 'إدارة المشتريات', 'إدارة تقنية المعلومات',
    'إدارة الأملاك والاستثمار', 'إدارة التخطيط العمراني', 'إدارة التشغيل والصيانة', 'إدارة صحة البيئة', 'إدارة خدمات المواطنين', 'مكتب رئيس البلدية'];
  const dirPeople = () => Object.keys(DEPTS).filter(n => !/^(مدير|إدارة|مكتب|وكيل)/.test(n));   // DEPTS (popovers.js): person → department
  const core = d => norm(d.replace(/^(إدارة|مكتب)\s+/, ''));
  // a person matches their own mail; a department matches mail from it or from anyone in it
  const inGroup = (g, i) => { const s = ALL_MAILS[i].sender, dep = DEPTS[s] || ''; return g.members.some(m => m.t === 'p' ? s === m.n : norm(s).includes(core(m.n)) || norm(dep).includes(core(m.n))); };

  const grpHead = foldersEl.querySelector('.fgroup-grp'), grpT = grpHead.querySelector('.fgroup-t');
  const emptyGroups = document.createElement('div');
  emptyGroups.className = 'fempty g';
  emptyGroups.innerHTML = `<span class="fempty-ic">${ic('sp_users')}</span><b>لا توجد مجموعات بعد</b><button type="button" class="fempty-btn">${ic('r_plus')}إنشاء مجموعة</button>`;
  grpHead.after(emptyGroups);
  function renderGroups() {
    list.querySelectorAll('.frow.grp').forEach(n => n.remove());
    GROUPS.reduce((last, g) => {
      FOLDER_FILTER[g.id] = i => inGroup(g, i);
      const n = ALL_MAILS.filter((_, i) => inGroup(g, i)).length, row = document.createElement('div');
      row.className = 'frow grp'; row.dataset.fid = g.id; row.draggable = true;
      row.innerHTML = `<button class="folder" data-f="${g.id}"><span class="fic">${ic('sp_users')}</span><span class="lbl">${esc(g.name)}</span><span class="cnt"${n ? '' : ' hidden'}>${n}</span></button>${moreBtn(g.name)}`;
      last.after(row);
      return row;
    }, emptyGroups);
    emptyGroups.hidden = !!GROUPS.length;
  }
  grpT.addEventListener('click', () => {
    const open = grpT.getAttribute('aria-expanded') !== 'true';
    grpT.setAttribute('aria-expanded', String(open));
    list.classList.toggle('groups-closed', !open);
  });
  [grpHead.querySelector('.fgroup-add'), emptyGroups.querySelector('.fempty-btn')].forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    grpT.setAttribute('aria-expanded', 'true'); list.classList.remove('groups-closed');
    openGroup(null, b);
  }));

  // ----- drag a box or a group to reorder it in the side menu (a box moves among its siblings; rules follow the boxes' order) -----
  let drag = null;
  const sameKind = (a, b) => a.classList.contains('grp') ? b.classList.contains('grp')
    : b.classList.contains('user') && userFolder(a.dataset.fid).parent === userFolder(b.dataset.fid).parent;
  const clearDrop = () => list.querySelectorAll('.drop-above, .drop-below').forEach(x => x.classList.remove('drop-above', 'drop-below'));
  list.addEventListener('dragstart', e => {
    const row = e.target.closest && e.target.closest('.frow.user, .frow.grp');
    if (!row || row.classList.contains('editing')) return;
    drag = row; row.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', row.dataset.fid); } catch (err) {}
  });
  list.addEventListener('dragover', e => {
    const row = drag && e.target.closest('.frow');
    if (!row || row === drag || !row.matches('.user, .grp') || !sameKind(drag, row)) return;
    e.preventDefault();
    const r = row.getBoundingClientRect(), below = e.clientY > r.top + r.height / 2;
    clearDrop(); row.classList.add(below ? 'drop-below' : 'drop-above');
  });
  list.addEventListener('drop', e => {
    const row = drag && list.querySelector('.drop-above, .drop-below');
    if (!row) return;
    e.preventDefault();
    const arr = drag.classList.contains('grp') ? GROUPS : FOLDERS, at = id => arr.findIndex(x => x.id === id);
    const item = arr.splice(at(drag.dataset.fid), 1)[0];
    arr.splice(at(row.dataset.fid) + (row.classList.contains('drop-below') ? 1 : 0), 0, item);
    if (arr === FOLDERS) RULES.sort((a, b) => FOLDERS.findIndex(f => f.id === a.folder) - FOLDERS.findIndex(f => f.id === b.folder));
    clearDrop();
    refresh();
  });
  list.addEventListener('dragend', () => { if (drag) drag.classList.remove('dragging'); drag = null; clearDrop(); });

  // ----- group screen (new or edit) and its delete confirmation, in the same popup -----
  const GROUP_POPUP_ON = false;   // 8 Nov: the group popup is switched off for now — + / «إنشاء مجموعة» do nothing; set true to bring it back
  function openGroup(g, trigger) { if (!GROUP_POPUP_ON) return; openLayerWith(() => showGroup(g), trigger); }
  function showGroup(g) {
    V = { screen: 'group', step: 1, d: { id: g ? g.id : null, name: g ? g.name : '', desc: g ? g.desc || '' : '', priv: g ? g.priv || 'private' : 'private', members: g ? g.members.map(m => ({ ...m })) : [] }, gq: '', errs: {} };
    box.className = 'db-modal rl-modal';
    renderGroupStep();
  }
  // two steps, like a mail client's «New group»: ① about the group (name · description · privacy) → ② its members
  function renderGroupStep() {
    const { d, step } = V, edit = !!d.id;
    box.innerHTML = `
      <header class="db-m-hd rl-hd"><div><span class="gp-step">الخطوة ${step === 1 ? '1' : '2'} من 2</span><h2 id="rl-title">${step === 1 ? (edit ? 'تعديل المجموعة' : 'مجموعة جديدة') : 'أضف أعضاء'}</h2>
        <p>${step === 1 ? 'المجموعة مساحة مشتركة تجمع أشخاصًا أو إدارات، يصلها بريدهم في مكان واحد.' : 'اختر الأشخاص أو الإدارات التي تنضم إلى «' + esc(d.name.trim()) + '».'}</p></div>${X_BTN}</header>
      <div class="rl-body rl-form gp-form"></div>
      <footer class="db-m-ft rl-ft">${step === 1 ? '<button type="button" class="db-btn btn-ghost" data-r="cancel">إلغاء</button><button type="button" class="db-btn btn-primary" data-r="gnext">التالي</button>'
        : `<button type="button" class="db-btn btn-ghost" data-r="gback">رجوع</button><button type="button" class="db-btn btn-primary" data-r="gsave">${edit ? 'حفظ' : 'إنشاء المجموعة'}</button>`}</footer>`;
    renderGroupForm();
    focusFirst(step === 1 ? '#gp-name' : '#gp-q');
  }
  const isMember = (t, n) => V.d.members.some(m => m.t === t && m.n === n);
  const gAv = (t, n) => t === 'd' ? `<span class="gp-av d">${ic('f_hier')}</span>` : `<span class="gp-av sender-av init" style="${avTone(n)}">${initials(n)}</span>`;
  const PRIV = [['private', 'خاصة', 'يرى الأعضاء فقط بريد المجموعة ومحادثاتها.'], ['public', 'عامة', 'يمكن لأي موظف في الجهة رؤية المجموعة وطلب الانضمام.']];
  function renderGroupForm() {
    const { d, errs } = V, body = box.querySelector('.gp-form'), top = body.scrollTop, q = norm(V.gq);
    const fa = document.activeElement, fsel = fa && body.contains(fa) ? (fa.id ? '#' + fa.id : fa.dataset.gm ? `[data-gm="${fa.dataset.gm}"][value="${esc(fa.value)}"]` : fa.dataset.priv ? `[data-priv="${fa.dataset.priv}"]` : '') : '';
    const err = k => errs[k] ? `<p class="rl-err" id="gp-err-${k}">${errs[k]}</p>` : '';
    if (V.step === 1) {
      body.innerHTML = `<section class="rl-sec"><label class="rl-label" for="gp-name">اسم المجموعة <span class="rl-req" aria-hidden="true">*</span></label>
          <input class="db-input${errs.name ? ' bad' : ''}" id="gp-name" maxlength="40" required aria-required="true" placeholder="مثال: فريق المشتريات" value="${esc(d.name)}"${errs.name ? ' aria-invalid="true" aria-describedby="gp-err-name"' : ''}>${err('name')}</section>
        <section class="rl-sec"><label class="rl-label" for="gp-desc">الوصف</label>
          <textarea class="db-input gp-desc" id="gp-desc" maxlength="200" rows="3" placeholder="ما الغرض من هذه المجموعة؟">${esc(d.desc)}</textarea></section>
        <section class="rl-sec"><h3 class="rl-label" id="gp-priv-l">الخصوصية</h3>
          <div class="gp-privs" role="radiogroup" aria-labelledby="gp-priv-l">${PRIV.map(([k, t, s]) => `<button type="button" class="gp-priv" role="radio" aria-checked="${d.priv === k}" data-r="gpriv" data-priv="${k}"><span class="gp-radio" aria-hidden="true"></span><span><b>${t}</b><small>${s}</small></span></button>`).join('')}</div></section>`;
    } else {
      const chips = d.members.map((m, i) => `<span class="gp-chip">${gAv(m.t, m.n)}<span>${esc(m.n)}</span><button type="button" class="gp-chip-x" data-r="gx" data-i="${i}" aria-label="إزالة ${esc(m.n)}">${ic('x18')}</button></span>`).join('');
      const opt = (t, n, sub) => q && !norm(n).includes(q) && !norm(sub).includes(q) ? ''
        : `<label class="rl-check gp-opt"><input type="checkbox" data-gm="${t}" value="${esc(n)}"${isMember(t, n) ? ' checked' : ''}><span class="pick" aria-hidden="true"></span>${gAv(t, n)}<span><b>${esc(n)}</b><small>${esc(sub)}</small></span></label>`;
      const depts = DIR_DEPTS.map(n => opt('d', n, 'إدارة — كل منسوبيها')).join(''), people = dirPeople().map(n => opt('p', n, DEPTS[n] || 'جهة داخلية')).join('');
      body.innerHTML = `<section class="rl-sec"><h3 class="rl-h" id="gp-mem">الأعضاء <span class="rl-req" aria-hidden="true">*</span>${d.members.length ? `<span class="gp-n">${d.members.length}</span>` : ''}</h3>
          ${chips ? `<div class="gp-chips">${chips}</div>` : ''}
          <label class="lsearch gp-search">${ic('search16')}<input type="search" id="gp-q" placeholder="ابحث باسم شخص أو إدارة" aria-label="ابحث باسم شخص أو إدارة" value="${esc(V.gq)}"></label>
          <div class="gp-list${errs.members ? ' bad' : ''}" role="group" aria-labelledby="gp-mem">${depts ? `<p class="gp-sub">الإدارات</p>${depts}` : ''}${people ? `<p class="gp-sub">الأشخاص</p>${people}` : ''}${depts || people ? '' : '<p class="gp-none">لا توجد نتائج</p>'}</div>${err('members')}</section>`;
    }
    body.scrollTop = top;
    const el = fsel && body.querySelector(fsel);
    if (el) { el.focus(); if (el.type === 'search' || el.type === 'text') el.setSelectionRange(el.value.length, el.value.length); }
  }
  function groupNext() {
    const d = V.d, name = d.name.trim();
    V.errs = {};
    if (!name) V.errs.name = 'اسم المجموعة مطلوب.';
    else if (GROUPS.some(g => g.id !== d.id && norm(g.name) === norm(name))) V.errs.name = 'توجد مجموعة بالاسم نفسه.';
    if (V.errs.name) { renderGroupForm(); return box.querySelector('#gp-name').focus(); }
    V.step = 2; renderGroupStep();
  }
  function pickMember(inp) {
    const t = inp.dataset.gm, n = inp.value, d = V.d;
    d.members = inp.checked ? [...d.members.filter(m => !(m.t === t && m.n === n)), { t, n }] : d.members.filter(m => !(m.t === t && m.n === n));
    if (V.errs.members && d.members.length) delete V.errs.members;
    renderGroupForm();
  }
  function saveGroup() {
    if (V.step === 1) return groupNext();
    const d = V.d;
    V.errs = {};
    if (!d.members.length) { V.errs.members = 'أضف عضوًا واحدًا على الأقل.'; renderGroupForm(); return box.querySelector('#gp-q').focus(); }
    let g = d.id && groupOf(d.id);
    if (!g) { g = { id: uid('g') }; GROUPS.push(g); }
    Object.assign(g, { name: d.name.trim(), desc: d.desc.trim(), priv: d.priv, members: d.members.map(m => ({ ...m })) });
    refresh();
    toast(d.id ? 'تم حفظ المجموعة' : 'تم إنشاء المجموعة');
    closeModal();
  }
  function openGroupDel(g, trigger) {
    openLayerWith(() => {
      V = { screen: 'gdel', g };
      box.className = 'db-modal rl-modal sm';
      box.innerHTML = `
      <header class="db-m-hd"><h2 id="rl-title">حذف المجموعة "${esc(g.name)}"؟</h2>${X_BTN}</header>
      <div class="rl-body rl-confirm"><p>لن تتأثر رسائل أعضاء المجموعة.</p></div>
      <footer class="db-m-ft rl-ft col"><button type="button" class="db-btn db-danger" data-r="gdel">حذف المجموعة</button><button type="button" class="db-btn btn-ghost" data-r="cancel">إلغاء</button></footer>`;
      focusFirst('[data-r="cancel"]');
    }, trigger);
  }
  function deleteGroup() {
    const g = V.g;
    GROUPS.splice(GROUPS.indexOf(g), 1);
    delete FOLDER_FILTER[g.id];
    refresh();
    toast('تم حذف المجموعة');
    closeModal();
  }

  // ----- events inside the popup -----
  // the icon menu closes without a re-render, so the click that closed it still lands
  function closeIcons() { V.icons = false; const m = box.querySelector('.rl-ic-menu'); m && m.remove(); const b = box.querySelector('.rl-ic-btn'); b && b.setAttribute('aria-expanded', 'false'); }
  const closeDD = except => box.querySelectorAll('.dd.open').forEach(d => { if (d !== except) { d.classList.remove('open'); d.querySelector('[data-dd]').setAttribute('aria-expanded', 'false'); } });
  box.addEventListener('click', e => {
    const t = e.target, b = t.closest('[data-r]'), dEl = t.closest('.dd');
    if (!t.closest('[data-r="more"]')) closeRowMenu();
    if (V && V.icons && !t.closest('.rl-ic')) closeIcons();
    closeDD(dEl);
    // dropdowns
    const sel = t.closest('[data-dd]');
    if (sel) { const on = dEl.classList.toggle('open'); sel.setAttribute('aria-expanded', on); if (on) { const s = dEl.querySelector('.dd-opt.sel'); s && s.focus(); } return; }
    const opt = t.closest('[data-ddv]');
    if (opt && V.screen === 'rule') {
      const [k, i] = opt.dataset.ddv.split(':'), v = opt.dataset.v, d = V.d;
      let focusKey = opt.dataset.ddv;
      if (k === 'cf' && d.conds[i].f !== v) {
        const row = { f: v, v: freeVal(d.conds, v, +i) }, rest = d.conds.filter((_, j) => j !== +i), last = rest.map(c => c.f).lastIndexOf(v);
        last < 0 ? rest.splice(+i, 0, row) : rest.splice(last + 1, 0, row);
        d.conds = rest; focusKey = 'cf:' + rest.indexOf(row);
      }
      if (k === 'cv') d.conds[i].v = v;
      if (V.errs.conds && d.conds.some(c => c.v !== ANY)) { delete V.errs.conds; delete V.errs.vals; }   // the message goes as soon as it is met
      if (k === 'match') d.match = v;
      if (k === 'at' && actField(d.acts[i].t) !== v) d.acts[i] = v === 'mv' ? { t: 'move' } : { t: v };
      if (k === 'ato') d.acts[i] = v === '__own' ? { t: 'move' } : { t: 'moveTo', to: v };
      renderForm();
      const s = box.querySelector(`[data-dd="${focusKey}"]`); s && s.focus();
      return;
    }
    if (!b) return;
    const r = b.closest('.rl-row') && ruleOf(b.closest('.rl-row').dataset.id), k = b.dataset.r;
    if (k === 'close') return closeModal();
    if (k === 'gsave') return saveGroup();
    if (k === 'gnext') return groupNext();
    if (k === 'gback') { V.step = 1; V.errs = {}; return renderGroupStep(); }
    if (k === 'gpriv') { V.d.priv = b.dataset.priv; return renderGroupForm(); }
    if (k === 'gdel') return deleteGroup();
    if (k === 'gx') { V.d.members.splice(+b.dataset.i, 1); renderGroupForm(); return box.querySelector('#gp-q').focus(); }
    if (k === 'back') return showList();
    if (k === 'cancel') return V.fromList ? showList() : closeModal();
    if (k === 'new') return showRule(blankDraft(), true);
    if (k === 'toggle') { toggleRule(r); renderRows(); const s = box.querySelector(`.rl-row[data-id="${r.id}"] [data-r="toggle"]`); return s && s.focus(); }
    if (k === 'up' || k === 'down') {
      moveRule(r, RULES.indexOf(r) + (k === 'up' ? -1 : 1));
      const row = box.querySelector(`.rl-row[data-id="${r.id}"]`), same = row.querySelector(`[data-r="${k}"]`);
      return (same.disabled ? row.querySelector(`[data-r="${k === 'up' ? 'down' : 'up'}"]`) : same).focus();
    }
    if (k === 'more') return openRowMenu(b);
    if (k === 'expand') {
      const on = !V.open.has(r.id);
      on ? V.open.add(r.id) : V.open.delete(r.id);
      b.setAttribute('aria-expanded', on);
      box.querySelector(`#rl-sum-${r.id}`).hidden = !on;
      return;
    }
    if (k === 'add-cond') {
      const cs = V.d.conds, lastF = cs.length && cs[cs.length - 1].f;
      const free = FIELDS.find(x => !cs.some(c => c.f === x.k)) || (lastF && freeVal(cs, lastF) ? FIELD[lastF] : FIELDS.find(x => freeVal(cs, x.k)));
      if (!free) return;
      const row = { f: free.k, v: freeVal(cs, free.k) }, at = cs.map(c => c.f).lastIndexOf(free.k);
      at < 0 ? cs.push(row) : cs.splice(at + 1, 0, row);
      renderForm();
      const s = box.querySelector(`[data-dd="cf:${cs.indexOf(row)}"]`); return s && s.focus();
    }
    if (k === 'rm-cond') { V.d.conds.splice(+b.dataset.i, 1); renderForm(); return box.querySelector('[data-r="add-cond"]').focus(); }
    if (k === 'add-act') {
      const free = ACT_FIELDS.find(([t]) => !V.d.acts.some(a => actField(a.t) === t));
      if (free) V.d.acts.push(free[0] === 'mv' ? { t: 'move' } : { t: free[0] });
      renderForm(); return;
    }
    if (k === 'rm-act') { V.d.acts.splice(+b.dataset.i, 1); renderForm(); return box.querySelector('[data-r="add-act"]').focus(); }
    if (k === 'icons') { V.icons = !V.icons; renderForm(); const o = box.querySelector(V.icons ? '.rl-ic-opt.sel' : '.rl-ic-btn'); return o && o.focus(); }
    if (k === 'icon') { V.d.icon = b.dataset.k; V.icons = false; renderForm(); return box.querySelector('.rl-ic-btn').focus(); }
    if (k === 'save') return saveRule();
    if (k === 'del-keep') return doDelete(true);
    if (k === 'del-move') return doDelete(false);
  });
  box.addEventListener('input', e => {
    if (!V) return;
    if (V.screen === 'list' && e.target.type === 'search') { V.q = e.target.value; return renderRows(); }
    if (V.screen === 'group') {
      if (e.target.id === 'gp-name') { V.d.name = e.target.value; if (V.errs.name && V.d.name.trim()) { delete V.errs.name; e.target.classList.remove('bad'); e.target.removeAttribute('aria-invalid'); const er = e.target.nextElementSibling; er && er.matches('.rl-err') && er.remove(); } }
      if (e.target.id === 'gp-q') { V.gq = e.target.value; renderGroupForm(); }
      if (e.target.id === 'gp-desc') V.d.desc = e.target.value;
      return;
    }
    if (V.screen !== 'rule') return;
    if (e.target.id === 'rl-name') V.d.name = e.target.value;
    if (e.target.dataset.cv != null) { V.d.conds[e.target.dataset.cv].v = e.target.value; }
    // a fixed field clears its message as soon as it is filled
    if (e.target.classList.contains('bad') && e.target.value.trim()) {
      e.target.classList.remove('bad'); e.target.removeAttribute('aria-invalid');
      const er = e.target.id === 'rl-name' && e.target.nextElementSibling;
      if (er && er.matches('.rl-err')) er.remove();
    }
  });
  box.addEventListener('change', e => {
    if (V && V.screen === 'group' && e.target.dataset.gm) return pickMember(e.target);
    if (!V || V.screen !== 'rule') return;
    const t = e.target;
    if (t.dataset.opt) V.d[t.dataset.opt] = t.checked;
    // تعليم كمقروءة / علامة متابعة ride along with the box's own move
    if (t.dataset.act) V.d.acts = t.checked ? [...V.d.acts.filter(a => a.t !== t.dataset.act), { t: t.dataset.act }] : V.d.acts.filter(a => a.t !== t.dataset.act);
  });
  box.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-dd]')) { e.preventDefault(); e.target.click(); }
    if (e.key === 'Enter' && e.target.id === 'rl-name') { e.preventDefault(); saveRule(); }
    if (e.key === 'Enter' && e.target.id === 'gp-name') { e.preventDefault(); groupNext(); }
  });
  // drag a rule row to reorder (the ↑ / ↓ buttons do the same from the keyboard)
  let dragId = null;
  box.addEventListener('dragstart', e => {
    const li = e.target.closest && e.target.closest('.rl-row[draggable="true"]');
    if (!li) return;
    dragId = li.dataset.id; li.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', dragId); } catch (err) {}
  });
  box.addEventListener('dragover', e => {
    const li = dragId && e.target.closest('.rl-row');
    if (!li) return;
    e.preventDefault();
    box.querySelectorAll('.rl-row.drop').forEach(x => x !== li && x.classList.remove('drop'));
    if (li.dataset.id !== dragId) li.classList.add('drop');
  });
  box.addEventListener('drop', e => {
    const li = dragId && e.target.closest('.rl-row');
    if (!li) return;
    e.preventDefault();
    if (li.dataset.id !== dragId) moveRule(ruleOf(dragId), RULES.indexOf(ruleOf(li.dataset.id)));
  });
  box.addEventListener('dragend', () => { dragId = null; box.querySelectorAll('.dragging, .drop').forEach(x => x.classList.remove('dragging', 'drop')); });
  // the scrim closes a confirmation, never a half-filled box or group
  layer.addEventListener('mousedown', e => { if (e.target === layer && V && V.screen !== 'rule' && V.screen !== 'group') closeModal(); });
  layer.addEventListener('click', e => { if (rowMenuBtn && !rPop.contains(e.target) && !e.target.closest('[data-r="more"]')) closeRowMenu(); });
  // Esc closes an open menu or dropdown first, then the popup; Tab stays inside it
  document.addEventListener('keydown', e => {
    if (!layer.classList.contains('open')) return;
    if (e.key === 'Escape') {
      e.stopPropagation(); e.preventDefault();
      if (rowMenuBtn) return closeRowMenu(true);
      if (V && V.icons) { closeIcons(); return box.querySelector('.rl-ic-btn').focus(); }
      const open = box.querySelector('.dd.open');
      if (open) { closeDD(); return open.querySelector('[data-dd]').focus(); }
      return closeModal();
    }
    if (e.key !== 'Tab') return;
    const scope = rowMenuBtn ? rPop : layer;
    const f = [...scope.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex="0"]')].filter(x => x.offsetParent !== null);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }, true);

  // ---------- reading pane «المزيد» (and a row's ⋮): «إنشاء صندوق» from this mail ----------
  // runs before the menu's own handler closes it, while its trigger is still known
  document.getElementById('pop-edit').addEventListener('click', e => {
    if (!e.target.closest('[data-rule="mail"]')) return;
    const trig = currentTrigger, row = (trig && trig.closest('.mail')) || document.querySelector('#items .mail.active');
    if (!row) return;
    const m = ALL_MAILS[row.dataset.i], [kind, src] = KIND[m.sender] || ['رسالة', 'داخلي'], type = TYPE_OF(kind, m.subj);
    setTimeout(() => openRule({ ...blankDraft(), name: m.sender, conds: [{ f: 'type', v: type }, { f: 'src', v: src }, { f: 'route', v: routeOf(m) || ANY }] }, trig), 0);
  }, true);

  // ---------- no boxes at first: «صناديق» shows its empty state ----------
  refresh();
})();
