// Login screen + onboarding popup (Figma 2997:49872 and 2785:9715). Runs after popovers.js ($, $$, toast, closePop).

// ---------- login ----------
const loginEl = $('#login');
const brandEl = $('.lg-brand', loginEl);

// the brand art is drawn on Figma's 696×992 grid: scale it to fit the panel, centred vertically
function fitBrand() {
  const w = brandEl.clientWidth, h = brandEl.clientHeight;
  if (!w || !h) return;
  const s = Math.min(w / 696, h / 992);
  brandEl.style.setProperty('--s', s);
  brandEl.style.setProperty('--ty', (h - 992 * s) / 2 + 'px');
}
new ResizeObserver(fitBrand).observe(brandEl);

const passInput = $('input[name="pass"]', loginEl);
$('.lg-eye', loginEl).addEventListener('click', e => {
  const btn = e.currentTarget, show = passInput.type === 'password';
  passInput.type = show ? 'text' : 'password';
  btn.setAttribute('aria-pressed', show);
  btn.setAttribute('aria-label', show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور');
});
$('.lg-lang', loginEl).addEventListener('click', () => toast('النسخة الإنجليزية غير متاحة في هذا النموذج'));
$('.lg-forgot', loginEl).addEventListener('click', e => { e.preventDefault(); toast('سيتم إرسال رابط استعادة كلمة المرور إلى بريدك المسجّل'); });

// any values (even empty) log in: the login fades out, then the onboarding opens
$('#login-form').addEventListener('submit', e => {
  e.preventDefault();
  loginEl.classList.add('out');
  setTimeout(() => { loginEl.hidden = true; loginEl.classList.remove('out'); openOnboarding(); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 450);
});

// «تسجيل الخروج» in the account menu: back to the login (display:none → shown restarts its CSS timeline)
function showLogin() {
  closePop();
  closeOnboarding();
  $('#login-form').reset();
  passInput.type = 'password';
  $('.lg-eye', loginEl).setAttribute('aria-pressed', 'false');
  loginEl.hidden = false;
  fitBrand();
}
$('#pop-account .acc-item.danger').addEventListener('click', showLogin);

// ---------- onboarding ----------
const ONB = [
  { t: 'أهلاً بك في قمم', d: 'منصة واحدة لإدارة معاملاتك الإلكترونية — من الوارد والصادر حتى الأرشفة، كل شيء في مكان واحد.' },
  { t: 'البريد', d: 'استعرض الوارد، وصفِّ معاملاتك، واطّلع على تفاصيلها ومرفقاتها، ثم وقّع أو أحِل — كل ذلك من شاشة واحدة.' },
  { t: 'الإحالة والتوقيع', d: 'أحِل المعاملة للجهة المختصة بضغطة واحدة، ووقّع المذكرات أو أشّر عليها إلكترونياً من نفس الشاشة.' },
  { t: 'المساعد الذكي', d: 'اسأل المساعد الذكي لتلخيص المعاملة واقتراح الرد المناسب، ووفّر وقتك في كل خطوة.' },
  { t: 'الموارد البشرية', d: 'قدّم طلبات الإجازة وتابع رصيدك ومسار الموافقات لحظة بلحظة، كل ما يخص الموظف في مكان واحد.' },
];
const onbEl = $('#onb');
const onbIll = $('.onb-ill', onbEl);
const [onbPrev, onbNext] = [$('[data-onb="prev"]', onbEl), $('[data-onb="next"]', onbEl)];
let onbStep = 0;

function setStep(i) {
  onbStep = i;
  $$('.onb-scene', onbEl).forEach(s => { s.hidden = +s.dataset.step !== i; });   // re-showing a scene restarts its animation
  onbIll.classList.toggle('s1', i === 0);
  onbIll.style.animation = 'none'; void onbIll.offsetWidth; onbIll.style.animation = '';
  $('h3', onbEl).textContent = ONB[i].t;
  $('.onb-text p', onbEl).textContent = ONB[i].d;
  $$('.onb-dots i', onbEl).forEach((d, k) => d.classList.toggle('on', k === i));
  onbPrev.disabled = i === 0;
  onbNext.textContent = i === ONB.length - 1 ? 'ابدأ الآن' : 'التالي';
}
function openOnboarding() { setStep(0); onbEl.classList.add('open'); onbNext.focus(); }
function closeOnboarding() { onbEl.classList.remove('open'); }

onbNext.addEventListener('click', () => onbStep === ONB.length - 1 ? closeOnboarding() : setStep(onbStep + 1));
onbPrev.addEventListener('click', () => onbStep && setStep(onbStep - 1));
$('.onb-close', onbEl).addEventListener('click', closeOnboarding);
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || !onbEl.classList.contains('open')) return;
  closeOnboarding();
});
