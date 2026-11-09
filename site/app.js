// Mail list data (Figma: انواع الوارد) — key picks the reading-pane state in READ below
// the six mail types; the older groups repeat them as filler examples
const M = {
  fin: { key: 'fin', sender: 'وكيل وزارة المالية', subj: 'خطاب بشأن تفعيل خدمة التوقيع الإلكتروني على المعاملات الصادرة من البلدية', src: 'assets/snd_finance.jpg', tags: ['للحفظ', 'خطاب وارد'] },
  proc: { key: 'proc', sender: 'وكيل وزارة العدل', subj: 'مذكرة بشأن تزويد وزارة العدل ببيانات العقارات المنزوعة ملكيتها لتحديث السجل العقاري', av: 'و‌ع', tags: ['للاعتماد', 'مذكرة'] },
  ops: { key: 'ops', sender: 'مدير إدارة التشغيل والصيانة', subj: 'طلب إجازة اعتيادية لمدة (10) أيام عمل اعتبارًا من 15/06/1448هـ', av: 'MA', tags: ['للاعتماد', 'طلب'] },
  hr: { key: 'hr', sender: 'نظام الموارد البشرية', subj: 'طلب اعتماد انتداب (4) من منسوبي إدارة صحة البيئة إلى محافظة جدة — بانتظار اعتمادكم', src: 'assets/snd_hr_system.jpg', tags: ['للاطلاع', 'نظام خارجي'] },
  permits: { key: 'permits', sender: 'نظام الرخص البلدية', subj: 'طلب رخصة بناء جديد — حي النرجس، القطعة (412) — بانتظار اعتمادكم', src: 'assets/snd_permits.jpg', tags: ['للاطلاع', 'نظام خارجي'] },
  leave1: { key: 'leave', sender: 'رئيس قسم خدمات المواطنين', subj: 'مذكرة مراجعة مذكرة قانونية بخصوص تجديد اتفاقية الشراكة.', img: 'av_building', tags: ['للتعميم', 'تكليف خارج الدوام'] },
  leave2: { key: 'leave', sender: 'مشرف خدمات المواطنين', subj: 'طلب مراجعة مذكرة قانونية بخصوص تجديد اتفاقية الشراكة.', av: 'NS', tags: ['للحفظ', 'طلب إذن'] },
  leave3: { key: 'leave', sender: 'مدير خدمات المواطنين', subj: 'طلب مراجعة مذكرة قانونية بخصوص تجديد اتفاقية الشراكة مع الجهة الخارجية المعنية', img: 'av_gov', tags: ['للمفاهمة', 'إخلاء طرف'] },
};
// what each mail answers to in the inbox filter, by type (its status comes from the row: new, late, flagged, needs signing)
const FACTS = {
  fin: { act: 'حفظ', type: 'الاتصالات الإدارية', cls: 'رسائل', src: 'وزارة البلديات والإسكان', dir: 'للاطلاع' },
  proc: { act: 'استكمال للدراسة', type: 'الاتصالات الإدارية', cls: 'رسائل', src: 'ديوان المراقبة العامة', dir: 'للإفادة' },
  ops: { act: 'إحالة سريعة', type: 'موارد بشرية', cls: 'طلبات', src: 'الإدارة العامة للموارد البشرية', dir: 'لإكمال اللازم' },
  hr: { act: 'إحالة سريعة', type: 'موارد بشرية', cls: 'طلبات', src: 'الإدارة العامة للموارد البشرية', dir: 'للإحاطة' },
  permits: { act: 'استكمال للدراسة', type: 'التطوير', cls: 'طلبات', src: 'مكتب الأمين', dir: 'للإطلاع و التوجيه' },
  leave: { act: 'حفظ', type: 'الاتصالات الإدارية', cls: 'معاملات', src: 'الإدارة العامة للمراجعة الداخلية', dir: 'إعادة ومراجعة' },
};
// Outlook-style groups; each row shows its group's date unless it has its own
const MAILS = [
  { day: 'اليوم', date: '01/11/2026 - 20/5/1448', items: [
    { ...M.fin, time: '10:24 ص', active: true }, { ...M.proc, time: '09:48 ص' }, { ...M.ops, time: '09:15 ص', flag: true }, { ...M.hr, time: '08:02 ص' },
  ]},
  { day: 'أمس', date: '31/10/2026 - 19/5/1448', items: [
    { ...M.permits, time: '03:40 م' }, { ...M.leave1, time: '01:12 م', late: true }, { ...M.leave2, time: '11:30 ص' }, { ...M.leave3, time: '09:05 ص' },
  ]},
  { day: 'هذا الأسبوع', items: [
    { ...M.hr, key: 'hrThread', date: '29/10/2026 - 17/5/1448', time: '02:20 م' }, { ...M.fin, date: '29/10/2026 - 17/5/1448', time: '10:10 ص' },
    { ...M.permits, date: '28/10/2026 - 16/5/1448', time: '12:45 م' }, { ...M.proc, date: '28/10/2026 - 16/5/1448', time: '09:30 ص', flag: true },
    { ...M.leave2, date: '27/10/2026 - 15/5/1448', time: '11:05 ص' },
  ]},
  { day: 'الأسبوع الماضي', items: [
    { ...M.ops, date: '24/10/2026 - 12/5/1448', time: '01:35 م' }, { ...M.leave3, date: '23/10/2026 - 11/5/1448', time: '10:50 ص', late: true },
    { ...M.fin, date: '22/10/2026 - 10/5/1448', time: '09:20 ص' }, { ...M.hr, date: '21/10/2026 - 9/5/1448', time: '02:05 م' },
    { ...M.permits, date: '20/10/2026 - 8/5/1448', time: '11:40 ص' }, { ...M.proc, date: '20/10/2026 - 8/5/1448', time: '08:55 ص' },
  ]},
  { day: 'هذا الشهر', items: [
    { ...M.leave1, date: '15/10/2026 - 3/5/1448', time: '12:15 م' }, { ...M.fin, date: '14/10/2026 - 2/5/1448', time: '10:00 ص', flag: true },
    { ...M.ops, date: '12/10/2026 - 30/4/1448', time: '09:40 ص' }, { ...M.hr, date: '11/10/2026 - 29/4/1448', time: '01:25 م' },
    { ...M.permits, date: '08/10/2026 - 26/4/1448', time: '11:10 ص' }, { ...M.leave2, date: '06/10/2026 - 24/4/1448', time: '10:30 ص' },
    { ...M.proc, date: '05/10/2026 - 23/4/1448', time: '08:45 ص' },
  ]},
  { day: 'الشهر الماضي', items: [
    { ...M.hr, date: '28/09/2026 - 16/4/1448', time: '11:20 ص' }, { ...M.leave3, date: '24/09/2026 - 12/4/1448', time: '09:35 ص' },
    { ...M.fin, date: '17/09/2026 - 5/4/1448', time: '01:50 م' }, { ...M.ops, date: '10/09/2026 - 28/3/1448', time: '10:15 ص' },
    { ...M.permits, date: '03/09/2026 - 21/3/1448', time: '12:40 م' },
  ]},
  // older than last month: one group per month name, like Outlook
  { day: 'أغسطس', items: [
    { ...M.proc, date: '26/08/2026 - 13/3/1448', time: '09:10 ص' }, { ...M.leave1, date: '19/08/2026 - 6/3/1448', time: '11:45 ص' },
    { ...M.hr, date: '11/08/2026 - 27/2/1448', time: '02:30 م' }, { ...M.fin, date: '04/08/2026 - 20/2/1448', time: '08:55 ص' },
  ]},
  { day: 'يوليو', items: [
    { ...M.permits, date: '28/07/2026 - 13/2/1448', time: '10:05 ص' }, { ...M.leave2, date: '21/07/2026 - 6/2/1448', time: '01:15 م' },
    { ...M.ops, date: '14/07/2026 - 29/1/1448', time: '09:25 ص' }, { ...M.proc, date: '07/07/2026 - 22/1/1448', time: '11:00 ص' },
  ]},
];

// Reading-pane states. body: paragraphs; a leading '!' marks a bold line, [[text]] is a link
const SALUTE_GM = '!سعادة مدير عام الشؤون الإدارية والمالية المحترم، السلام عليكم ورحمة الله وبركاته، وبعد :';
const READ = {
  fin: {
    org: 'وزارة المالية', avatar: 'assets/snd_finance.jpg', warn: true,
    to: ['مكتب رئيس البلدية', 'الشؤون الإدارية والمالية', 'إدارة تقنية المعلومات'], toMore: 3, cc: ['إدارة الاتصالات الإدارية', 'إدارة الشؤون القانونية'], ccMore: 1,
    body: ['!بسم الله الرحمن الرحيم', '!سعادة رئيس البلدية المحترم السلام عليكم ورحمة الله وبركاته، وبعد :',
      'إشارة إلى خطاب سعادتكم رقم (4587/ب) وتاريخ 02/09/2026م بشأن طلب تفعيل خدمة التوقيع الإلكتروني على المعاملات الصادرة من البلدية، نفيد سعادتكم بأنه تمت الموافقة على الطلب، وسيتم تفعيل الخدمة اعتبارًا من يوم الأحد 15/11/2026م.',
      'وعليه نأمل التكرم بتزويدنا بأسماء المخوّلين بالتوقيع وحدود صلاحياتهم وفق النموذج المرفق، في موعد أقصاه 08/11/2026م، ليتم إصدار الشهادات الرقمية الخاصة بهم.',
      'كما نحيطكم علمًا بأن الدليل الإرشادي لاستخدام الخدمة متاح ضمن المرفقات، ويمكن الاطلاع على الشروط والضوابط عبر الرابط: [[دليل خدمة التوقيع الإلكتروني]]',
      'شاكرين لسعادتكم حسن تعاونكم، ونأمل التوجيه بإحالة الخطاب إلى الإدارة المختصة لاستكمال اللازم.',
      '!وتقبلوا خالص التحية والتقدير،،،', '!وكيل وزارة المالية'],
    files: [['نموذج_التفويض.docx', 'doc', 'مقيد', '86 KB'], ['خطاب_وزارة_المالية.pdf', 'pdf', 'سري', '86 KB'], ['متطلبات_تفعيل_الخدمة.XLS', 'xls', 'سري للغاية', '240 KB']],
    acts: { fwd: 'إحالة للتوقيع', tashir: 'تأشير الخطاب', sign: 'توقيع الخطاب' },
  },
  proc: {
    org: 'وزارة العدل',
    to: ['سعود العنزي', 'إدارة الأملاك والاستثمار', 'إدارة نزع الملكية'], toMore: 3, cc: ['إدارة المراجعة الداخلية', 'إدارة التخطيط العمراني'], ccMore: 1,
    body: ['!بسم الله الرحمن الرحيم', '!سعادة الأستاذ/ سعود العنزي المحترم، السلام عليكم ورحمة الله وبركاته، وبعد :',
      'إشارة إلى قرار مجلس الوزراء القاضي بتوحيد بيانات الملكيات العقارية وربطها إلكترونيًا بالسجل العقاري، واستنادًا إلى نظام نزع ملكية العقارات للمنفعة العامة ووضع اليد المؤقت على العقار، تعمل وزارة العدل حاليًا على تحديث صكوك الملكية المتأثرة بمشاريع نزع الملكية في نطاق البلدية.',
      'وعليه نأمل تزويد الوزارة ببيان العقارات التي صدرت بشأنها قرارات نزع ملكية خلال الأعوام 1445هـ – 1448هـ، متضمنًا رقم الصك وتاريخه، ورقم قرار النزع، والمساحة المنزوعة، ومبلغ التعويض المصروف، وحالة الإفراغ لكل عقار، وذلك خلال مدة لا تتجاوز (30) يومًا من تاريخه.',
      'مرفق لسعادتكم نموذج البيان المطلوب وتعميم الوزارة المنظم لآلية التحديث. ويمكن الاطلاع على حالة الطلب وإرسال البيانات إلكترونيًا عبر الرابط: [[بوابة السجل العقاري]]',
      'شاكرين لكم حسن تعاونكم، ونأمل التوجيه لمن يلزم بالاطلاع والإفادة لنتمكن من استكمال تحديث السجلات وفق الأنظمة والتعليمات المتبعة.',
      '!وتفضلوا بقبول خالص التحية والتقدير،،،', '!وكيل وزارة العدل'],
    files: [['نموذج_بيان_العقارات.xlsx', 'xls', 'مقيد', '64 KB'], ['تعميم_وزارة_العدل.pdf', 'pdf', 'سري', '86 KB']],
    acts: { tashir: 'تأشير المذكرة', sign: 'توقيع المذكرة' },
  },
  ops: {
    org: 'إدارة التشغيل والصيانة', initials: 'MA',
    to: ['عبدالعزيز السبيعي', 'مدير إدارة الموارد البشرية', 'إدارة شؤون الموظفين'], toMore: 2, cc: ['ماجد الحربي', 'إدارة الحضور والانصراف'], ccMore: 1,
    hidden: ['مدير عام الشؤون الإدارية والمالية', 'إدارة الرواتب والبدلات', 'سكرتارية إدارة التشغيل والصيانة'],
    body: ['!بسم الله الرحمن الرحيم', '!سعادة وكيل البلدية للخدمات المهندس/ عبدالعزيز السبيعي المحترم، السلام عليكم ورحمة الله وبركاته، وبعد :',
      'أتقدم لسعادتكم بطلب إجازة اعتيادية لمدة (10) أيام عمل، تبدأ من يوم الأحد 15/06/1448هـ وتنتهي بنهاية دوام يوم الخميس 26/06/1448هـ، على أن تكون المباشرة يوم الأحد 29/06/1448هـ، وذلك من رصيد إجازاتي الاعتيادية البالغ (34) يومًا.',
      'وقد تم ترتيب سير العمل خلال فترة الإجازة، بحيث يتولى نائب مدير الإدارة المهندس ماجد الحربي تسيير الأعمال اليومية والصلاحيات الإدارية للإدارة، مع بقائي متاحًا للتواصل عند الحاجة.',
      'مرفق لسعادتكم نموذج طلب الإجازة وخطة تسليم المهام. ويمكن الاطلاع على رصيد الإجازات وسجل الموافقات عبر الرابط: [[فتح الطلب في نظام الموارد البشرية]]',
      'عليه، نأمل من سعادتكم التكرم بالموافقة على الطلب، وإحالته إلى إدارة الموارد البشرية لإصدار قرار الإجازة.',
      '!وتفضلوا بقبول خالص التحية والتقدير،،،', '!مدير إدارة التشغيل والصيانة'],
    files: [['نموذج_طلب_الإجازة.pdf', 'pdf', 'مقيد', '86 KB'], ['خطة_تسليم_المهام.docx', 'doc', 'مقيد', '64 KB']],
    acts: { ok: 'قبول', no: 'رفض' },
  },
  hr: {
    org: 'إدارة الموارد البشرية', avatar: 'assets/snd_hr_system.jpg',
    to: ['الشؤون الإدارية والمالية', 'إدارة الموارد البشرية', 'إدارة الرواتب والبدلات'], toMore: 3,
    body: [SALUTE_GM,
      'نحيط سعادتكم علمًا بورود طلب انتداب عبر نظام الموارد البشرية برقم (HR-1448-11873)، مقدَّم من إدارة صحة البيئة، لانتداب عدد (4) من منسوبيها إلى محافظة جدة للمشاركة في أعمال الحملة الميدانية للرقابة على المنشآت الغذائية، لمدة (3) أيام اعتبارًا من 18/05/1448هـ.',
      'وقد اعتُمد الطلب من مدير الإدارة المختصة، وراجعته إدارة الموارد البشرية وتحققت من توفر الاعتماد المالي على بند الانتدابات، وفقًا لنظام الخدمة المدنية ولائحة الحقوق والمزايا المالية.',
      'علمًا بأن هذا الإشعار للاطلاع فقط، ولا يمكن اتخاذ أي إجراء على الطلب من خلال البريد، ويمكن الاطلاع على تفاصيل الطلب واتخاذ الإجراء عبر الرابط: [[فتح الطلب في نظام الموارد البشرية]]',
      'عليه، نأمل من سعادتكم التكرم بالاطلاع واتخاذ ما ترونه مناسبًا حيال الطلب، علمًا بأنه سيُصعَّد آليًا إلى صاحب الصلاحية الأعلى في حال عدم اتخاذ إجراء خلال (48) ساعة.',
      '!نظام الموارد البشرية'],
    acts: { ext: 'الانتقال إلى نظام الموارد البشرية' },
  },
  permits: {
    org: 'وكالة التعمير والمشاريع', avatar: 'assets/snd_permits.jpg',
    to: ['فهد العتيبي', 'وكالة التعمير والمشاريع', 'إدارة رخص البناء', 'إدارة التخطيط العمراني'], toMore: 3,
    template: {
      system: 'نظام الرخص البلدية', systemEn: 'MUNICIPAL PERMITS SYSTEM',
      head: 'طلب رخصة بناء جديد بانتظار اعتمادكم', ref: 'رقم الطلب BP-1448-20931 · ورد بتاريخ 22/05/1448هـ',
      before: [['ما تفاصيل الطلب؟', 'تقدّم المالك بطلب رخصة بناء سكني على القطعة رقم (412) بالمخطط (1290) في حي النرجس، بمساحة إجمالية قدرها (625) م² وعدد (2) دور وملحق علوي.', 'وقد استُكملت المراجعة الفنية من إدارة التخطيط العمراني، وتبيّن مطابقة المخططات لاشتراطات البناء المعتمدة، وأوصت الإدارة بالموافقة على إصدار الرخصة.'],
        ['ما المطلوب من سعادتكم؟', 'اعتماد الطلب أو إعادته بملاحظات خلال (5) أيام عمل من تاريخ وروده، وفقًا لدليل إجراءات إصدار رخص البناء المعتمد.']],
      cta: 'مراجعة الطلب في النظام',
      after: [['ماذا يحدث بعد الاعتماد؟', 'يُصدر النظام الرخصة إلكترونيًا ويُشعر المالك برسالة نصية، وتُحال المعاملة إلى إدارة الرقابة الميدانية لجدولة زيارة الموقع.']],
    },
    acts: {},
  },
  // the older mails that have no state in Figma keep the original leave memo
  leave: {
    org: 'إدارة الموارد البشرية', warn: true,
    to: ['أحمد سليم بن عبدالله', 'سارة القحطاني', 'خالد أحمد علي'], toMore: 3, cc: ['إدارة شؤون الموظفين', 'مكتب رئيس البلدية'], ccMore: 1,
    body: ['!بسم الله الرحمن الرحيم', '!سعادة مدير عام الشؤون الإدارية والمالية السلام عليكم ورحمة الله وبركاته، وبعد :',
      'نفيد سعادتكم بأن الموظف/ أحمد سليم بن عبدالله (الرقم الوظيفي 104582)، أخصائي أول تخطيط بإدارة الاتصالات الإدارية، قد تقدّم بطلب إجازة اعتيادية لمدة خمسة (5) أيام عمل، تبدأ من يوم الأحد 18/10/2026م وتنتهي بنهاية دوام يوم الخميس 22/10/2026م، على أن يباشر عمله يوم الأحد 25/10/2026م.',
      'وبعد مراجعة رصيد الموظف من الإجازات الاعتيادية تبيّن أن رصيده المتاح (24) يومًا، وأن الطلب مستوفٍ للشروط الواردة في لائحة الإجازات المعتمدة، ولا يتعارض مع جدول الإجازات المعتمد للإدارة خلال الربع الرابع.',
      'علمًا بأن التفويض ساري خلال فترة الإجازة فقط وينتهي تلقائيًا بمباشرة الموظف لعمله، وقد أُرفق نموذج طلب الإجازة ومذكرة التفويض وكشف رصيد الإجازات. ويمكن الاطلاع على تفاصيل الطلب وسجل الموافقات عبر الرابط: [[فتح الطلب في نظام الموارد البشرية]]',
      'نأمل من سعادتكم التكرم بالاطلاع والتوجيه باعتماد الطلب، وإحالته إلى إدارة شؤون الموظفين لاستكمال الإجراءات النظامية.',
      '!وتقبلوا خالص التحية والتقدير،،،'],
    files: [['نموذج_الطلب.docx', 'doc', 'مقيد', '86 KB'], ['مذكرة_الإجازة.pdf', 'pdf', 'سري للغاية', '86 KB'], ['مذكرة_الإجازة.XLS', 'xls', null, '240 KB']],
    acts: { fwd: 'احالة للتوقيع', tashir: 'تأشير المذكرة', sign: 'توقيع المذكرة' },
  },
};

// one example only (user request, 3 Nov 2026): the «هذا الأسبوع» hr notification shows earlier updates on the
// same request, collapsed below the open message like Outlook's conversation history — newest-of-the-rest first
READ.hrThread = { ...READ.hr,
  // scoped to this one instance only — the shared READ.hr body stays untouched for every other hr mail
  body: [SALUTE_GM,
    'نحيط سعادتكم علمًا بورود طلب انتداب عبر نظام الموارد البشرية برقم (HR-1448-11873)، مقدَّم من إدارة صحة البيئة، لانتداب عدد (4) من منسوبيها إلى محافظة جدة للمشاركة في أعمال الحملة الميدانية للرقابة على المنشآت الغذائية، لمدة (3) أيام اعتبارًا من 18/05/1448هـ.',
    'وقد اعتُمد الطلب من مدير إدارة صحة البيئة، وراجعته إدارة الموارد البشرية وتحققت من توفر الاعتماد المالي على بند الانتدابات، وفقًا لنظام الخدمة المدنية ولائحة الحقوق والمزايا المالية — وفق ما هو مُفصَّل في سجل المراسلات أدناه.',
    'علمًا بأن هذا الإشعار للاطلاع فقط، ولا يمكن اتخاذ أي إجراء على الطلب من خلال البريد، ويمكن الاطلاع على تفاصيل الطلب واتخاذ الإجراء عبر الرابط: [[فتح الطلب في نظام الموارد البشرية]]',
    'عليه، نأمل من سعادتكم التكرم بالاطلاع واتخاذ ما ترونه مناسبًا حيال الطلب، علمًا بأنه سيُصعَّد آليًا إلى صاحب الصلاحية الأعلى في حال عدم اتخاذ إجراء خلال (48) ساعة.',
    '!نظام الموارد البشرية'],
  thread: [
  { date: '28/10/2026 - 16/5/1448', time: '11:40 ص', sender: 'عبدالرحمن الغامدي', role: 'مدير إدارة الموارد البشرية',
    to: ['نظام الموارد البشرية'],
    preview: 'تم التحقق من توفر الاعتماد المالي على بند الانتدابات، وجاري رفع الطلب لاعتمادكم.',
    body: ['بالإشارة إلى اعتماد مدير إدارة صحة البيئة لطلب الانتداب رقم (HR-1448-11873)، قامت إدارة الموارد البشرية بمراجعة الطلب والتحقق من توفر الاعتماد المالي اللازم على بند الانتدابات لعدد (4) منسوبين لمدة (3) أيام، وفقًا للائحة الحقوق والمزايا المالية.',
      'لم يتبيّن وجود أي ملاحظات مالية أو نظامية على الطلب، وعليه تم رفعه إلكترونيًا عبر النظام لاستكمال إجراءات الاعتماد النهائي من سعادتكم.'] },
  { date: '27/10/2026 - 15/5/1448', time: '01:30 م', sender: 'ماجد الحربي', role: 'مدير إدارة صحة البيئة',
    to: ['عبدالرحمن الغامدي'],
    preview: 'اطلعت على طلب الانتداب وتأكدت من استيفاء الشروط، واعتمدته من جانب الإدارة وأحلته لمراجعة الاعتماد المالي.',
    body: ['بالإشارة إلى طلب الانتداب رقم (HR-1448-11873) المحال من نظام الموارد البشرية، أفيدكم بأنني اطلعت على الطلب وتأكدت من استيفاء المنسوبين الأربعة للشروط النظامية للمشاركة في الحملة الميدانية بمحافظة جدة، وأن جدول أعمالهم الحالي يسمح بتغطية فترة الانتداب دون تعطيل العمل.',
      'عليه، أعتمد الطلب من جانب الإدارة، وأحيله إلى إدارة الموارد البشرية لاستكمال إجراءات التحقق من توفر الاعتماد المالي على بند الانتدابات تمهيدًا لرفعه لاعتمادكم.'] },
  { date: '26/10/2026 - 14/5/1448', time: '09:15 ص',
    to: ['ماجد الحربي'],
    preview: 'تم استلام طلب الانتداب رقم (HR-1448-11873) وتوجيهه إلى مدير الإدارة المختصة لاعتماده.',
    body: ['تم استلام طلب انتداب عبر نظام الموارد البشرية برقم (HR-1448-11873)، مقدَّم من إدارة صحة البيئة لانتداب عدد (4) من منسوبيها إلى محافظة جدة للمشاركة في أعمال الحملة الميدانية للرقابة على المنشآت الغذائية، لمدة (3) أيام اعتبارًا من 18/05/1448هـ.',
      'تم توجيه الطلب آليًا إلى مدير الإدارة المختصة لمراجعته واعتماده المبدئي قبل رفعه لإدارة الموارد البشرية، وسيصلكم إشعار آخر فور اعتماده.'] },
] };

const SOCIAL_SVG = '<svg width="108" height="18" viewBox="0 0 108 18" fill="none"><path d="M17.9987 9.00265C17.9987 13.5494 14.6294 17.3083 10.2524 17.9183C9.84312 17.975 9.4244 18.0047 8.99937 18.0047C8.50876 18.0047 8.02698 17.9656 7.55781 17.8899C3.27284 17.1998 0 13.4832 0 9.00265C0 4.03075 4.02957 0 9 0C13.9704 0 18 4.03075 18 9.00265H17.9987Z" fill="#1F2A37"/><path d="M3.64695 3.96484L7.79759 9.51581L3.62109 14.0291H4.56133L8.21821 10.0778L11.1726 14.0291H14.3717L9.98768 8.16591L13.8754 3.96484H12.9351L9.5677 7.60388L6.84664 3.96484H3.64757H3.64695ZM5.02923 4.65745H6.49855L12.9881 13.3365H11.5188L5.02923 4.65745Z" fill="white"/><path d="M39.0205 0H38.9795C34.0203 0 30 4.02144 30 8.98215V9.02315C30 13.9839 34.0203 18.0053 38.9795 18.0053H39.0205C43.9797 18.0053 48 13.9839 48 9.02315V8.98215C48 4.02144 43.9797 0 39.0205 0Z" fill="#007AB9"/><path d="M34.2906 5.98478C34.0535 5.76462 33.9355 5.49212 33.9355 5.16788C33.9355 4.84364 34.0541 4.55914 34.2906 4.33836C34.5277 4.1182 34.8329 4.00781 35.2069 4.00781C35.5808 4.00781 35.8741 4.1182 36.1106 4.33836C36.3477 4.55851 36.4656 4.83544 36.4656 5.16788C36.4656 5.50032 36.3471 5.76462 36.1106 5.98478C35.8735 6.20493 35.5726 6.31532 35.2069 6.31532C34.8411 6.31532 34.5277 6.20493 34.2906 5.98478ZM36.2663 7.24767V13.9974H34.1342V7.24767H36.2663Z" fill="#FEFFFC"/><path d="M43.3632 7.91713C43.828 8.42178 44.0601 9.11442 44.0601 9.9963V13.8808H42.0351V10.2701C42.0351 9.82534 41.9197 9.47965 41.6896 9.23364C41.4594 8.98762 41.1491 8.86398 40.7606 8.86398C40.3722 8.86398 40.0619 8.98699 39.8317 9.23364C39.6015 9.47965 39.4861 9.82534 39.4861 10.2701V13.8808H37.4492V7.23144H39.4861V8.11331C39.6923 7.81935 39.9705 7.58722 40.3198 7.41627C40.6692 7.24532 41.0621 7.16016 41.4991 7.16016C42.2773 7.16016 42.8991 7.41248 43.3632 7.9165V7.91713Z" fill="#FEFFFC"/><path d="M69.0205 0H68.9795C64.0203 0 60 4.02145 60 8.98215V9.02315C60 13.9839 64.0203 18.0053 68.9795 18.0053H69.0205C73.9797 18.0053 78 13.9839 78 9.02315V8.98215C78 4.02145 73.9797 0 69.0205 0Z" fill="url(#ig_grad)"/><path d="M71.786 3.66406H66.2163C64.6776 3.66406 63.4258 4.91623 63.4258 6.45541V11.5524C63.4258 13.0916 64.6776 14.3437 66.2163 14.3437H71.786C73.3247 14.3437 74.5765 13.0916 74.5765 11.5524V6.45541C74.5765 4.91623 73.3247 3.66406 71.786 3.66406ZM64.4102 6.45541C64.4102 5.45936 65.2205 4.64876 66.2163 4.64876H71.786C72.7818 4.64876 73.5921 5.45936 73.5921 6.45541V11.5524C73.5921 12.5484 72.7818 13.359 71.786 13.359H66.2163C65.2205 13.359 64.4102 12.5484 64.4102 11.5524V6.45541Z" fill="white"/><path d="M69 11.5991C70.4309 11.5991 71.5956 10.4346 71.5956 9.00268C71.5956 7.57073 70.4315 6.40625 69 6.40625C67.5684 6.40625 66.4043 7.57073 66.4043 9.00268C66.4043 10.4346 67.5684 11.5991 69 11.5991ZM69 7.39158C69.8885 7.39158 70.6112 8.11449 70.6112 9.00331C70.6112 9.89212 69.8885 10.615 69 10.615C68.1114 10.615 67.3887 9.89212 67.3887 9.00331C67.3887 8.11449 68.1114 7.39158 69 7.39158Z" fill="white"/><path d="M71.838 6.82883C72.2233 6.82883 72.5374 6.51532 72.5374 6.12926C72.5374 5.7432 72.224 5.42969 71.838 5.42969C71.4521 5.42969 71.1387 5.7432 71.1387 6.12926C71.1387 6.51532 71.4521 6.82883 71.838 6.82883Z" fill="white"/><path d="M107.999 9.00265C107.999 13.5494 104.629 17.3083 100.252 17.9182C99.8431 17.975 99.4244 18.0047 98.9994 18.0047C98.5088 18.0047 98.027 17.9656 97.5578 17.8899C93.2728 17.1998 90 13.4832 90 9.00265C90 4.03075 94.0296 0 99 0C103.97 0 108 4.03075 108 9.00265H107.999Z" fill="#1976D2"/><path d="M100.252 7.22815V9.18928H102.677L102.293 11.831H100.252V17.9175C99.8424 17.9743 99.4237 18.004 98.9986 18.004C98.508 18.004 98.0262 17.9648 97.5571 17.8892V11.831H95.3203V9.18928H97.5571V6.78975C97.5571 5.30109 98.7634 4.09375 100.252 4.09375V4.09501C100.257 4.09501 100.26 4.09375 100.265 4.09375H102.678V6.37848H101.101C100.633 6.37848 100.252 6.75885 100.252 7.22752L100.252 7.22815Z" fill="white"/><defs><linearGradient id="ig_grad" x1="60.8932" y1="19.8058" x2="78.1028" y2="2.43325" gradientUnits="userSpaceOnUse"><stop stop-color="#FFDD55"/><stop offset="0.5" stop-color="#FF543E"/><stop offset="1" stop-color="#C837AB"/></linearGradient></defs></svg>';
const EMBLEM_SVG = '<svg width="48" height="48" viewBox="0 0 48 48" fill="none"><path d="M24 1L30.6 8.1L40.3 7.7L39.9 17.4L47 24L39.9 30.6L40.3 40.3L30.6 39.9L24 47L17.4 39.9L7.7 40.3L8.1 30.6L1 24L8.1 17.4L7.7 7.7L17.4 8.1L24 1Z" fill="#1D66F2"/><path d="M15 33V24C15 19.03 19.03 15 24 15C28.97 15 33 19.03 33 24V33H28.5V24C28.5 21.51 26.49 19.5 24 19.5C21.51 19.5 19.5 21.51 19.5 24V33H15Z" fill="white"/><path d="M25 24H23C22.4477 24 22 24.4477 22 25V32C22 32.5523 22.4477 33 23 33H25C25.5523 33 26 32.5523 26 32V25C26 24.4477 25.5523 24 25 24Z" fill="white"/><path d="M34 34.5H14C13.4477 34.5 13 34.9477 13 35.5C13 36.0523 13.4477 36.5 14 36.5H34C34.5523 36.5 35 36.0523 35 35.5C35 34.9477 34.5523 34.5 34 34.5Z" fill="white"/></svg>';
const ARROW_UR = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17 7 6 18M11 6.13s5.63-.47 6.49.38c.85.86.38 6.49.38 6.49" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ARROW_L = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 12h16M4 12l6-6M4 12l6 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const BADGE = { 'مقيد': 'green', 'سري': 'amber', 'سري للغاية': 'red' };
const para = line => {
  const strong = line.startsWith('!');
  const html = (strong ? line.slice(1) : line).replace(/\[\[(.+?)\]\]/g, '<a href="#">$1</a>');
  return `<p${strong ? ' class="strong"' : ''}>${html}</p>`;
};
const chips = list => list.map(n => `<span class="chip person">${n}</span>`).join('');
// thread recipients (one example only): same chip, with a small initials avatar in front like the person cards behind +N
const chipsAv = list => list.map(n => `<span class="chip person"><span class="chip-av" style="${avTone(n)}">${initials(n)}</span>${n}</span>`).join('');
// the people behind +N: exactly N names, never one already shown as a chip (a mail can name its own in `hidden`, to's first)
const HIDDEN_RECIPS = ['فهد العتيبي', 'إدارة الموارد البشرية', 'خالد الشمري', 'ريم الدوسري', 'إدارة الشؤون القانونية', 'عبدالرحمن الغامدي'];
const moreChip = (names, n) => `<button class="chip more" data-who="${names.splice(0, n).join('|')}">+${n}</button>`;

function templateHTML(t) {
  const sec = ([h, ...ps]) => `<section><h4>${h}</h4>${ps.map(p => `<p>${p}</p>`).join('')}</section>`;
  return `<div class="tpl-wrap"><div class="tpl">
    <div class="tpl-brand">${EMBLEM_SVG}<div><b>${t.system}</b><span>${t.systemEn}</span></div></div>
    <div class="tpl-box"><b>${t.head}</b><span>${t.ref}</span></div>
    ${t.before.map(sec).join('')}
    <button class="tpl-cta">${t.cta}${ARROW_L}</button>
    ${t.after.map(sec).join('')}
    <div class="tpl-foot"><span>تابعنا من خلال :</span>${SOCIAL_SVG}</div>
  </div></div>`;
}

// Fill the reading pane for one mail
function renderReader(m) {
  const r = READ[m.key] || READ.leave;
  document.getElementById('m-title').textContent = m.subj;
  document.getElementById('m-sender').textContent = m.sender;
  document.querySelector('.who .org').textContent = `<${r.org}>`;
  // mails without their own state reuse the avatar shown in the list
  const pic = r.avatar || m.src || (m.img && (typeof AVATARS !== 'undefined' ? AVATARS[m.img] : `assets/${m.img}.png`));
  const ini = r.initials || (!pic && m.av);
  const av = document.querySelector('.content .sender-av');
  av.className = 'sender-av' + (pic ? ' pic' : ini ? ' init' : '');
  av.innerHTML = pic ? `<img src="${pic}" alt="">` : (ini || '');
  av.style.cssText = pic ? '' : avTone(m.sender);
  document.querySelector('.review-note').hidden = !r.warn;
  const hidden = r.hidden ? [...r.hidden] : HIDDEN_RECIPS.filter(n => !r.to.includes(n) && !r.cc?.includes(n));
  document.querySelector('.recips').innerHTML = `<span class="lab">موجه إلى</span>${chips(r.to)}${moreChip(hidden, r.toMore)}` +
    (r.cc ? `<span class="gap10"></span><span class="lab">صورة إلى</span>${chips(r.cc)}${moreChip(hidden, r.ccMore)}` : '');
  const letter = document.querySelector('.letter');
  letter.classList.toggle('is-tpl', !!r.template);
  letter.innerHTML = r.template ? templateHTML(r.template) : r.body.map(para).join('');
  const thread = document.getElementById('thread');
  thread.hidden = !r.thread;
  if (r.thread) thread.innerHTML = r.thread.map(t => {
    // a thread entry names its own sender (a person who acted on the request) or falls back to this mail's own sender/avatar
    const tPic = t.sender ? null : pic, tIni = t.sender ? initials(t.sender) : ini, tName = t.sender ? `${t.sender}${t.role ? ' · ' + t.role : ''}` : m.sender;
    return `
    <div class="t-item">
      <button class="t-head" aria-expanded="false">
        <span class="t-row">
          <span class="t-av${tPic ? ' pic' : ' init'}" ${tPic ? '' : `style="${avTone(t.sender || m.sender)}"`}>${tPic ? `<img src="${tPic}" alt="">` : (tIni || '')}</span>
          <span class="t-top"><span class="t-name">${tName}</span><span class="t-date">${t.date} · ${t.time}</span></span>
        </span>
        <span class="t-prev">${t.preview}</span>
      </button>
      <div class="t-body" hidden>
        ${t.to ? `<div class="t-to"><span class="lab">موجه إلى</span>${chipsAv(t.to)}</div>` : ''}
        ${t.body.map(para).join('')}
      </div>
    </div>`;
  }).join('');
  const att = document.querySelector('.attachments');
  att.hidden = !r.files;
  if (r.files) att.innerHTML = `<div class="att-head"><h3>المرفقات (${r.files.length})</h3><button class="ibtn dots" aria-label="طريقة العرض">${icon('tb_more')}</button></div><div class="files">${r.files.map(([n, kind, b, size]) => `
    <div class="file"><div class="info">${icon('f_' + kind)}<div class="txt"><div class="top"><span class="fname">${n}</span>${b ? `<span class="badge ${BADGE[b]}">${b}</span>` : ''}</div><span class="size">${size}</span></div></div>
    <button class="dl tt" aria-label="تحميل">${icon('download')}<span class="tip">تحميل</span></button></div>`).join('')}</div>`;
  // footer actions differ per mail type; a system notice only links out
  const a = r.acts, foot = document.querySelector('.actions');
  const [fwd, tashir] = foot.querySelectorAll(':scope > .btn');
  const setLabel = (btn, text) => { if (text) [...btn.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()).textContent = text; btn.hidden = !text; };
  setLabel(fwd, a.fwd); setLabel(tashir, a.tashir);
  foot.querySelector('.split').hidden = !a.sign;
  if (a.sign) setLabel(foot.querySelector('.split .btn'), a.sign);
  // the sign and tashir menus open with this mail's own action, and approvals swap the verb (توقيع → اعتماد)
  if (a.tashir) setLabel(document.querySelector('#pop-tashir .mi'), a.tashir);
  if (a.sign) {
    const verb = a.sign.split(' ')[0];
    document.querySelectorAll('#pop-sign .mi').forEach((mi, i) => {
      const t = [...mi.childNodes].find(n => n.nodeType === 3 && n.textContent.trim());
      t.textContent = i ? t.textContent.replace(/^\S+/, verb) : a.sign;
    });
  }
  const go = foot.querySelector('.go');
  go.hidden = !a.ext;
  if (a.ext) go.firstChild.textContent = a.ext;
  foot.querySelector('.ok').hidden = !a.ok;
  foot.querySelector('.no').hidden = !a.no;
  foot.hidden = !a.fwd && !a.tashir && !a.sign && !a.ext && !a.ok;
  document.querySelector('.content').scrollTop = 0;
}

// thread history (user request, 3 Nov 2026): click a collapsed earlier message to expand it in place
document.getElementById('thread').addEventListener('click', e => {
  const head = e.target.closest('.t-head');
  if (!head) return;
  const open = head.getAttribute('aria-expanded') === 'true';
  head.setAttribute('aria-expanded', !open);
  head.parentElement.querySelector('.t-body').hidden = open;
});

const icon = k => ICONS[k] || '';

// initials circles get a light tone picked from the name, so each person keeps the same color everywhere
const AV_TONES = [['#eaf1fe', '#1849a9'], ['#e7f8ee', '#067647'], ['#fef0e6', '#b93815'], ['#f2eefd', '#5925dc'],
  ['#fdecf4', '#c11574'], ['#e6f7f5', '#107569'], ['#e6f4fb', '#026aa2']];
function avTone(name) {
  const [bg, tx] = AV_TONES[[...name].reduce((h, c) => h * 31 + c.charCodeAt(0) >>> 0, 7) % AV_TONES.length];
  return `--av-bg:${bg};--av-tx:${tx}`;
}

const ALL_MAILS = MAILS.flatMap(g => g.items);

function mailHTML(m) {
  const cls = ['mail', m.active && 'active', m.unread && 'unread', m.flag && 'flag', m.late && 'late'].filter(Boolean).join(' ');
  const av = m.src ? `<span class="av"><img src="${m.src}" alt=""></span>` : m.img
    ? `<span class="av"><img src="assets/${m.img}.png" alt=""></span>`
    : `<span class="av${m.teal ? ' teal' : ''}" style="${avTone(m.sender)}">${m.av}</span>`;
  const lead = `<span class="lead">${av}<button class="pick" role="checkbox" aria-checked="false" aria-label="تحديد"></button></span>`;
  const att = READ[m.key]?.files?.length;  // count the attachments the mail actually opens with
  const secret = READ[m.key]?.warn;  // the padlock marks the same mails whose reading pane says «سري وعاجل»
  const tags = m.tags.map(t => Array.isArray(t) ? `<span class="tag ${t[1]}">${t[0]}</span>` : `<span class="tag">${t}</span>`).join('');
  return `<div class="${cls}" tabindex="0" data-i="${ALL_MAILS.indexOf(m)}">
    ${lead}
    <div class="body">
      <div class="head">
        <span class="sender">${m.sender}</span>
        <span class="ind">
          ${att ? `<span class="att">${att}${icon('attach14')}</span>` : ''}
          <button class="cflag" aria-label="علامة متابعة"><span class="on">${icon('flag_solid')}</span><span class="off">${icon('m_flag')}</span></button>${m.late ? icon('clock_red') : ''}
          ${secret ? `<span class="lock" role="img" aria-label="سري وعاجل" data-ftip="سري وعاجل">${icon('lock14')}</span>` : ''}
          ${m.noMore ? '' : `<button class="more" aria-label="خيارات">${icon('vmore')}</button>`}
        </span>
      </div>
      <div class="subj">${m.subj}</div>
      <div class="meta"><span>${m.date || MAILS.find(g => g.items.includes(m)).date} · ${m.time}</span><span class="bar"></span><span class="id">ID: <b>${15896431 - ALL_MAILS.indexOf(m) * 137}</b></span></div>
      <div class="tags">${tags}</div>
    </div>
  </div>`;
}

document.getElementById('items').innerHTML = MAILS.map(g => `
  <button class="day"><span class="lbl">${g.day}${icon('up14')}</span><span class="cnt">${icon('mail16')}${g.items.length}</span></button>
  <div class="day-items">${g.items.map(mailHTML).join('')}</div>`).join('');

// Inject icons
document.querySelectorAll('i[data-i]').forEach(el => { el.outerHTML = icon(el.dataset.i); });

// Select a mail
document.getElementById('items').addEventListener('click', e => {
  const day = e.target.closest('.day');
  if (day) { day.classList.toggle('closed'); return; }
  if (e.target.closest('.more')) return;
  const pick = e.target.closest('.pick');
  if (pick) { const on = pick.getAttribute('aria-checked') !== 'true'; pick.setAttribute('aria-checked', String(on)); pick.closest('.mail').classList.toggle('picked', on); syncSelection(); return; }
  const cf = e.target.closest('.cflag');
  if (cf) { setFlag(cf.closest('.mail'), !cf.closest('.mail').classList.contains('flag')); return; }
  const mail = e.target.closest('.mail');
  if (!mail) return;
  document.querySelectorAll('.mail.active').forEach(x => x.classList.remove('active'));
  mail.classList.add('active');
  setUnread(mail, false);
  renderReader(ALL_MAILS[mail.dataset.i]);
});

// open the selected mail on load
renderReader(ALL_MAILS.find(m => m.active));

const panelEl = document.querySelector('.panel');

// Empty states and loading skeletons
const emptyState = (title, sub) => `<div class="empty-state"><span class="ic">${icon('mail16')}</span><b>${title}</b><span>${sub}</span></div>`;
document.querySelector('.items').insertAdjacentHTML('afterend', emptyState('لا توجد رسائل صادرة', 'ستظهر هنا الرسائل التي ترسلها').replace('empty-state', 'empty-state list-empty') +
  '<div class="sk-list">' + '<div class="sk-row"><i class="sk sk-av"></i><div class="sk-lines"><i class="sk" style="width:140px;height:12px"></i><i class="sk" style="width:252px;height:12px"></i><i class="sk" style="width:180px;height:10px"></i><i class="sk" style="width:90px;height:18px;border-radius:9px"></i></div></div>'.repeat(7) + '</div>');
document.querySelector('.reader').insertAdjacentHTML('beforeend', emptyState('لا توجد رسالة لعرضها', 'اختر رسالة من القائمة لعرض تفاصيلها').replace('empty-state', 'empty-state reader-empty'));
document.querySelector('.content').insertAdjacentHTML('beforebegin', '<div class="sk-content"><i class="sk" style="width:420px;height:20px"></i><i class="sk" style="width:260px;height:14px"></i><i class="sk" style="width:180px;height:12px;margin-top:24px"></i>' +
  [668, 668, 668, 520, 668, 668, 360].map(w => `<i class="sk" style="width:min(${w}px,100%);height:12px"></i>`).join('') + '</div>');



// Refresh: one full turn of the icon
const refreshBtn = document.querySelector('.ibtn.refresh');
// Refresh: the icon turns twice (1s, as in Figma Loading → Inbox) and the inbox shows skeletons until it stops
refreshBtn.addEventListener('click', () => {
  if (refreshBtn.classList.contains('spin')) return;
  refreshBtn.classList.add('spin');
  if (!panelEl.classList.contains('outbox')) panelEl.classList.add('loading');
});
refreshBtn.addEventListener('animationend', () => {
  refreshBtn.classList.remove('spin');
  panelEl.classList.remove('loading');
});

// Floating AI button: drag vertically along the left edge; a click without movement still counts as a click
(() => {
  const strip = document.querySelector('.ai-strip'), btn = strip.querySelector('.ai-float');
  let startY = 0, startTop = 0, moved = false;
  const clamp = y => Math.max(0, Math.min(y, strip.clientHeight - btn.offsetHeight - 16));
  try { const saved = localStorage.getItem('qcms-ai-y'); if (saved !== null) btn.style.setProperty('--y', clamp(+saved) + 'px'); } catch (e) {}
  btn.addEventListener('pointerdown', e => {
    startY = e.clientY; startTop = btn.offsetTop; moved = false;
    btn.setPointerCapture(e.pointerId);
  });
  btn.addEventListener('pointermove', e => {
    if (!btn.hasPointerCapture(e.pointerId)) return;
    const dy = e.clientY - startY;
    if (!moved && Math.abs(dy) < 4) return;
    moved = true;
    btn.classList.add('dragging');
    btn.style.setProperty('--y', clamp(startTop + dy) + 'px');
  });
  btn.addEventListener('pointerup', e => {
    btn.releasePointerCapture(e.pointerId);
    btn.classList.remove('dragging');
    if (moved) { try { localStorage.setItem('qcms-ai-y', btn.offsetTop); } catch (err) {} }
  });
  btn.addEventListener('click', e => { if (moved) { e.preventDefault(); e.stopImmediatePropagation(); moved = false; } }, true);
  addEventListener('resize', () => btn.style.setProperty('--y', clamp(btn.offsetTop) + 'px'));
  // the small x hides the assistant without starting a drag or opening it
  const closeBtn = btn.querySelector('.ai-close'), hide = e => { e.stopPropagation(); e.preventDefault(); strip.hidden = true; };
  closeBtn.addEventListener('pointerdown', e => e.stopPropagation());
  closeBtn.addEventListener('click', hide);
  closeBtn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') hide(e); });
})();

// Read / unread and follow-up flag state, shared by the list, toolbar and follow-up menu
const CLOSED_ICON = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="8.8" y="10.2" width="14.4" height="11.6" rx="2.6" fill="#384250"/><path d="m10.6 12.8 4.1 3.1c.8.6 1.8.6 2.6 0l4.1-3.1" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const readBtn = document.querySelector('.rtool [aria-label="غير مقروء"]');
const flagBtn = document.querySelector('.rtool [aria-label="متابعة"]');
const OPEN_ICON = readBtn.querySelector('svg').outerHTML;

function syncToolbar() {
  const m = document.querySelector('.mail.active');
  const unread = m && m.classList.contains('unread');
  // unread mail → closed filled envelope, read mail → open envelope
  readBtn.querySelector('svg').outerHTML = unread ? CLOSED_ICON : OPEN_ICON;
  const tip = readBtn.querySelector('.tip');
  if (tip) tip.textContent = unread ? 'تحديد كمقروءة' : 'تحديد كغير مقروءة';
  readBtn.setAttribute('aria-pressed', String(!!unread));
  flagBtn.classList.toggle('flagged', !!(m && m.classList.contains('flag')));
}
function setUnread(mail, on) { mail.classList.toggle('unread', on); syncToolbar(); }
function setFlag(mail, on) { mail.classList.toggle('flag', on); syncToolbar(); }
readBtn.addEventListener('click', () => {
  const m = document.querySelector('.mail.active');
  if (m) setUnread(m, !m.classList.contains('unread'));
});

// Overlay scrollbars: the native bar is hidden so content runs edge to edge; a thin thumb floats over it while scrolling
document.querySelectorAll('.items, .content').forEach(watchScroll);
function watchScroll(el) {
  const host = el.parentElement;
  if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
  const thumb = document.createElement('div');
  thumb.className = 'ov-thumb';
  host.appendChild(thumb);
  let t;
  const place = () => {
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) { thumb.style.display = 'none'; return; }
    const h = Math.max(32, clientHeight * clientHeight / scrollHeight);
    thumb.style.display = '';
    thumb.style.height = h + 'px';
    thumb.style.top = (el.offsetTop + (clientHeight - h) * scrollTop / (scrollHeight - clientHeight)) + 'px';
    thumb.style.left = (el.offsetLeft + 2) + 'px';
  };
  el.addEventListener('scroll', () => {
    place();
    thumb.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => thumb.classList.remove('show'), 900);
  }, { passive: true });
  addEventListener('resize', place);
  place();
}

// Everywhere else: one shared thumb floats over whatever is scrolling, so nothing reserves a gutter
(() => {
  const thumb = document.createElement('div');
  thumb.className = 'ov-thumb float';
  document.body.appendChild(thumb);
  let t;
  document.addEventListener('scroll', e => {
    const el = e.target === document ? document.documentElement : e.target;
    if (!(el instanceof Element) || el.matches('.items, .content')) return;  // these have their own thumb
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) return;
    const r = el === document.documentElement ? { top: 0, left: 0 } : el.getBoundingClientRect();
    const h = Math.max(32, clientHeight * clientHeight / scrollHeight);
    thumb.style.height = h + 'px';
    thumb.style.top = (r.top + (clientHeight - h) * scrollTop / (scrollHeight - clientHeight)) + 'px';
    thumb.style.left = (r.left + 2) + 'px';
    thumb.classList.add('show');
    clearTimeout(t);
    t = setTimeout(() => thumb.classList.remove('show'), 900);
  }, { capture: true, passive: true });
})();

// Selection bar: shows above the list while any card is checked
const listEl = document.querySelector('.list'), selBar = document.querySelector('.sel-bar');
const selAll = selBar.querySelector('.pick');
function setPicked(mail, on) {
  mail.classList.toggle('picked', on);
  mail.querySelector('.pick').setAttribute('aria-checked', String(on));
}
function syncSelection() {
  const all = document.querySelectorAll('.mail'), n = document.querySelectorAll('.mail.picked').length;
  selBar.hidden = !n;
  listEl.classList.toggle('selecting', !!n);
  document.getElementById('sel-count').textContent = `تم تحديد (${n})`;
  selAll.setAttribute('aria-checked', n === all.length ? 'true' : n ? 'mixed' : 'false');
}
selBar.querySelector('.sel-all').addEventListener('click', e => {
  e.preventDefault();
  const on = selAll.getAttribute('aria-checked') !== 'true';
  document.querySelectorAll('.mail').forEach(m => setPicked(m, on));
  syncSelection();
});
document.getElementById('sel-close').addEventListener('click', () => {
  document.querySelectorAll('.mail.picked').forEach(m => setPicked(m, false));
  syncSelection();
});

// Fixed-position tooltips for buttons inside clipped areas (panel toggle)
const ftip = document.createElement('div');
ftip.className = 'ftip';
document.body.appendChild(ftip);
let ftipEl = null;
document.addEventListener('mouseover', e => {
  const el = e.target.closest('[data-ftip]');
  if (el === ftipEl) return;
  ftipEl = el;
  if (!el) return ftip.classList.remove('show');
  ftip.textContent = el.dataset.ftip;
  const r = el.getBoundingClientRect();
  // the nav rail hugs the right edge, so its tooltips sit to its left instead of above
  const side = !!el.closest('.rail'), below = !side && (r.top < 60 || el.dataset.ftipPos === 'below');
  ftip.classList.toggle('below', below);
  ftip.classList.toggle('side', side);
  if (side) {
    ftip.style.left = (r.left - ftip.offsetWidth - 10) + 'px';
    ftip.style.top = (r.top + r.height / 2 - ftip.offsetHeight / 2) + 'px';
  } else {
    ftip.style.left = (r.left + r.width / 2 - ftip.offsetWidth / 2) + 'px';
    ftip.style.top = (below ? r.bottom + 8 : r.top - ftip.offsetHeight - 8) + 'px';
  }
  ftip.classList.add('show');
});
document.addEventListener('click', () => { ftip.classList.remove('show'); ftipEl = null; }, true);
document.addEventListener('scroll', () => { ftip.classList.remove('show'); ftipEl = null; }, true);

// Temporary save: the icon turns into a check, then returns to the save icon
const saveBtn = document.querySelector('.rtool [aria-label="حفظ"]');
const SAVED_ICON = '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><path d="M10.5 16.5l3.5 3.5 7.5-8" stroke="#3e9c6e" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
saveBtn.addEventListener('click', () => {
  if (saveBtn.classList.contains('saved')) return;
  const svg = saveBtn.querySelector('svg'), original = svg.outerHTML, tip = saveBtn.querySelector('.tip');
  svg.outerHTML = SAVED_ICON;
  saveBtn.classList.add('saved');
  if (tip) tip.textContent = 'تم الحفظ';
  toast('تم الحفظ');
  setTimeout(() => {
    saveBtn.querySelector('svg').outerHTML = original;
    saveBtn.classList.remove('saved');
    if (tip) tip.textContent = 'حفظ مؤقت';
  }, 1500);
});

// List search: Enter shows the list skeleton for a couple of seconds, then the results come back
const listSearch = document.querySelector('.lsearch input');
listSearch.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !listSearch.value.trim() || panelEl.classList.contains('searching')) return;
  panelEl.classList.add('searching');
  setTimeout(() => panelEl.classList.remove('searching'), 2000);
});

// Folders panel: closed (icons only), opens over the list on hover, pinned pushes the list aside
const foldersEl = document.getElementById('folders'), pinBtn = document.getElementById('pin');
let leaveTimer;
function setPinned(on) {
  foldersEl.classList.toggle('pinned', on);
  foldersEl.classList.remove('open');
  pinBtn.setAttribute('aria-pressed', String(on));
  pinBtn.setAttribute('aria-label', on ? 'إلغاء تثبيت القائمة' : 'تثبيت القائمة');
  pinBtn.dataset.ftip = on ? 'إلغاء التثبيت' : 'تثبيت القائمة';
  try { localStorage.setItem('qcms-folders-pinned', on ? '1' : '0'); } catch (e) {}
}
foldersEl.addEventListener('mouseenter', () => { clearTimeout(leaveTimer); if (!foldersEl.classList.contains('pinned')) foldersEl.classList.add('open'); });
// it stays open while a folder's ⋯ menu (rules.js) is open, since the menu sits outside it
const closeFolders = () => { if (!foldersEl.querySelector('.fmore[aria-expanded="true"], input') && !foldersEl.matches(':hover')) foldersEl.classList.remove('open'); };
foldersEl.addEventListener('mouseleave', () => { leaveTimer = setTimeout(closeFolders, 120); });
pinBtn.addEventListener('click', () => setPinned(!foldersEl.classList.contains('pinned')));
try { setPinned(localStorage.getItem('qcms-folders-pinned') !== '0'); } catch (e) { setPinned(true); }

// Nav rail, level 1: icons only, or widened to icon + label (pushing the content).
// Sections open their own menu in the side panel (level 2), which closes to a floating button over level 1.
const railEl = document.getElementById('rail'), mainEl = document.querySelector('.main'), railToggleBtn = railEl.querySelector('.rail-toggle');
const railItems = [...railEl.querySelectorAll('.rail-item')];
function setRailWide(on) {
  railEl.classList.toggle('wide', on);
  railToggleBtn.setAttribute('aria-expanded', String(on));
  railToggleBtn.setAttribute('aria-label', on ? 'طي القائمة' : 'توسيع القائمة');
  // tooltips only while the labels are hidden
  railItems.forEach(it => { if (on) delete it.dataset.ftip; else it.dataset.ftip = it === railToggleBtn ? 'توسيع القائمة' : it.querySelector('.lbl').textContent; });
  try { localStorage.setItem('qcms-rail-wide', on ? '1' : '0'); } catch (e) {}
}
railToggleBtn.addEventListener('click', () => setRailWide(!railEl.classList.contains('wide')));
document.querySelector('.hd-collapse').addEventListener('click', () => setRailWide(false));  // the widened rail collapses from the header
try { setRailWide(localStorage.getItem('qcms-rail-wide') === '1'); } catch (e) { setRailWide(false); }
// a section with a menu shows it in the side panel; the others (نظرة عامة، البريد) hide the panel
const secPanel = document.getElementById('sec-panel'), secMenus = [...secPanel.querySelectorAll('[data-menu]')];
railEl.querySelectorAll('[data-sec]').forEach(it => it.addEventListener('click', e => {
  e.preventDefault();
  railEl.querySelectorAll('[data-sec]').forEach(x => x.classList.toggle('active', x === it));
  const menu = secMenus.find(m => m.dataset.menu === it.dataset.sec);
  secMenus.forEach(m => { m.hidden = m !== menu; });
  mainEl.classList.toggle('has-panel', !!menu);
  mainEl.classList.remove('panel-closed');
}));
railEl.querySelector('.rail-open').addEventListener('click', () => mainEl.classList.remove('panel-closed'));
// inside the panel: close it, fold a group, or mark the chosen page
secPanel.addEventListener('click', e => {
  const close = e.target.closest('.sp-close'), head = e.target.closest('.group > .node'), leaf = e.target.closest('.node.leaf');
  if (close) mainEl.classList.add('panel-closed');
  if (head) head.parentElement.classList.toggle('closed');
  if (leaf) { e.preventDefault(); leaf.closest('.tree').querySelectorAll('.node.leaf').forEach(x => x.classList.toggle('active', x === leaf)); }
});

// Mails live in folders: every mail starts in الوارد; mail rules (rules.js) move them into their own folders or مؤرشفة.
// A folder lists the mails it holds (الوارد and the rule folders); the folders that hold none show their empty state.
const MAIL_FOLDER = ALL_MAILS.map(() => 'inbox');
let curFolder = 'inbox';
const FOLDER_FILTER = {};   // folder key → (mail index) → shown? — groups (rules.js) list their members' mail wherever it sits
const EMPTY_TEXT = { sent: ['لا توجد رسائل صادرة', 'ستظهر هنا الرسائل التي ترسلها'], new: ['لا توجد رسائل جديدة', 'ستظهر هنا الرسائل غير المقروءة'], saved: ['لا توجد محفوظات', 'ستظهر هنا الرسائل التي تحفظها'], fav: ['لا توجد رسائل مفضلة', 'ستظهر هنا الرسائل التي تضيفها للمفضلة'] };
// date groups follow the rows they show (used by the filter too)
function syncDays() {
  document.querySelectorAll('#items .day').forEach(d => {
    const n = d.nextElementSibling.querySelectorAll('.mail:not(.out):not([hidden])').length;
    d.hidden = d.nextElementSibling.hidden = !n;
    d.querySelector('.cnt').lastChild.textContent = n;
  });
}
function showFolderMails() {
  document.querySelectorAll('#items .mail').forEach(r => r.classList.toggle('out', FOLDER_FILTER[curFolder] ? !FOLDER_FILTER[curFolder](+r.dataset.i) : MAIL_FOLDER[r.dataset.i] !== curFolder));
  syncDays();
  const rows = [...document.querySelectorAll('#items .mail:not(.out)')];
  panelEl.classList.toggle('outbox', !rows.length);
  // the reading pane always shows a mail of the open folder
  const act = document.querySelector('#items .mail.active');
  if (rows.length && (!act || act.classList.contains('out'))) {
    if (act) act.classList.remove('active');
    rows[0].classList.add('active');
    renderReader(ALL_MAILS[rows[0].dataset.i]);
    syncToolbar();
  }
}
function openFolder(f) {
  foldersEl.querySelectorAll('.folder').forEach(x => x.classList.toggle('active', x === f));
  const name = f.querySelector('.lbl').textContent;
  curFolder = f.dataset.f;
  document.getElementById('list-title').textContent = name;
  document.querySelector('.crumbs .cur').textContent = name;
  panelEl.classList.remove('loading', 'searching');
  const [title, sub] = EMPTY_TEXT[curFolder] || [`لا توجد رسائل في ${name}`, 'ستظهر هنا الرسائل عند وصولها'];
  const le = document.querySelector('.list-empty');
  le.querySelector('b').textContent = title;
  le.querySelector('span:last-child').textContent = sub;
  showFolderMails();
}
// folders are added and removed by the rules, so one listener serves them all
foldersEl.addEventListener('click', e => {
  const f = e.target.closest('.folder');
  if (f) openFolder(f);
});

// Mail list width: drag its inner edge (or use the arrow keys on it) to narrow it; 400px default is the widest, 320px the narrowest
(() => {
  const list = document.getElementById('mail-list'), grip = list.querySelector('.list-resize');
  const MIN = 320, MAX = 400;
  const setW = w => { w = Math.round(Math.max(MIN, Math.min(MAX, w))); list.style.setProperty('--list-w', w + 'px'); return w; };
  try { const saved = +localStorage.getItem('qcms-list-w'); if (saved) setW(saved); } catch (e) {}
  const save = () => { try { localStorage.setItem('qcms-list-w', Math.round(list.getBoundingClientRect().width)); } catch (e) {} };
  let startX = 0, startW = 0;
  grip.addEventListener('pointerdown', e => {
    startX = e.clientX; startW = list.getBoundingClientRect().width;
    grip.setPointerCapture(e.pointerId);
    list.classList.add('resizing'); document.body.classList.add('col-resizing');
  });
  grip.addEventListener('pointermove', e => {
    if (!grip.hasPointerCapture(e.pointerId)) return;
    setW(startW + (startX - e.clientX));   // RTL: the list grows as its left edge moves left
  });
  grip.addEventListener('pointerup', e => {
    grip.releasePointerCapture(e.pointerId);
    list.classList.remove('resizing'); document.body.classList.remove('col-resizing');
    save();
  });
  grip.addEventListener('dblclick', () => { list.style.removeProperty('--list-w'); save(); });
  grip.addEventListener('keydown', e => {
    const w = list.getBoundingClientRect().width;
    if (e.key === 'ArrowLeft') { setW(w + 20); save(); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setW(w - 20); save(); e.preventDefault(); }
  });
})();
