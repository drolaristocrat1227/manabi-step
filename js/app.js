/*
 * まなびステップ 本体
 * データはこの端末の localStorage にだけ保存する。外部への送信は一切しない。
 */
(function () {
  'use strict';

  // 学年（コース）ごとに、記録を別々のキーに保存する（中2は以前からのキーのまま）
  const COURSE_KEY = 'manabi-step-course';
  let DEMO = false;
  try { DEMO = sessionStorage.getItem('manabi-step-demo') === '1'; } catch (e) { /* 使えない環境ではデモなし */ }
  const storeKey = (c) => (DEMO ? 'manabi-demo-' + c : c === 'j2' ? 'manabi-step-v1' : 'manabi-step-' + c + '-v1');
  let course = 'j2';
  try { const c = localStorage.getItem(COURSE_KEY); if (c && window.COURSES[c]) course = c; } catch (e) { /* 既定は中2 */ }
  const SK = window.COURSES[course];
  const KEY = storeKey(course);
  const PREV = Number(Object.keys(SK.gradeName).find((g) => Number(g) !== SK.main)); // さかのぼり用の学年
  const gname = (g) => SK.gradeName[g];
  const gcdN = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const SUBJECTS = [['math', '📐', '数学'], ['eng', '🔤', '英語'], ['jpn', '📖', '国語'], ['sci', '🔬', '理科'], ['soc', '🌏', '社会']];
  const GROUPS = [['e6', '小学6年'], ['j2', '中学2年']];
  const courseOf = (group, subj) => Object.keys(window.COURSES).find((c) => window.COURSES[c].group === group && window.COURSES[c].subjKey === subj);
  const subjName = (C) => (C.subjKey === 'math' ? C.subj : SUBJECTS.find((x) => x[0] === C.subjKey)[2]);
  const isCalc = SK.subjKey === 'math';
  function peek(c) { // ほかの学年の保存データ（名前の表示用）
    try { const o = JSON.parse(localStorage.getItem(storeKey(c)) || 'null'); return o && o.profile ? o : null; } catch (e) { return null; }
  }
  const PRACTICE_N = 5;
  const REVIEW_N = 10;
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');

  // ---------- 計算メモ（手書き。書いた内容は端末の外に出さず、次の問題で消える） ----------
  const memo = document.createElement('div');
  memo.id = 'memo'; memo.hidden = true;
  memo.innerHTML = '<div class="memo-bar"><b>✏️ メモ</b><button data-memo="pen" class="on">ペン</button><button data-memo="eraser">消しゴム</button><button data-memo="clear">全部消す</button><button data-memo="close" aria-label="閉じる">✕</button></div><canvas></canvas>';
  document.body.appendChild(memo);
  const cvs = memo.querySelector('canvas'), ctx = cvs.getContext('2d');
  let memoOwner = null, eraser = false, pen = null;
  function memoSize() {
    const r = cvs.getBoundingClientRect(), d = window.devicePixelRatio || 1, w = Math.round(r.width * d), h = Math.round(r.height * d);
    if (cvs.width !== w || cvs.height !== h) { cvs.width = w; cvs.height = h; }
  }
  const memoClear = () => ctx.clearRect(0, 0, cvs.width, cvs.height);
  function memoOpen() { memo.hidden = false; document.body.classList.add('memo-open'); memoSize(); if (memoOwner !== P) { memoClear(); memoOwner = P; } }
  function memoClose() { memo.hidden = true; document.body.classList.remove('memo-open'); }
  const memoPos = (e) => { const r = cvs.getBoundingClientRect(), d = window.devicePixelRatio || 1; return [(e.clientX - r.left) * d, (e.clientY - r.top) * d]; };
  cvs.addEventListener('pointerdown', (e) => { e.preventDefault(); cvs.setPointerCapture(e.pointerId); pen = memoPos(e); });
  cvs.addEventListener('pointermove', (e) => {
    if (!pen) return;
    e.preventDefault();
    const d = window.devicePixelRatio || 1;
    ctx.globalCompositeOperation = eraser ? 'destination-out' : 'source-over';
    ctx.strokeStyle = getComputedStyle(document.body).color; ctx.lineWidth = (eraser ? 22 : 2.6) * d; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // すばやく書いたときも線がとぎれないよう、間の点もつなぐ
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    ctx.beginPath(); ctx.moveTo(pen[0], pen[1]);
    (evs.length ? evs : [e]).forEach((ev) => { pen = memoPos(ev); ctx.lineTo(pen[0], pen[1]); });
    ctx.stroke();
  });
  // 書いている間に画面がスクロールしないようにする（iPhone の Safari は touch-action だけでは止まらない）
  ['touchstart', 'touchmove'].forEach((ev) => cvs.addEventListener(ev, (e) => e.preventDefault(), { passive: false }));
  memo.querySelector('.memo-bar').addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  ['pointerup', 'pointercancel'].forEach((ev) => cvs.addEventListener(ev, () => { pen = null; }));
  memo.addEventListener('click', (e) => {
    const b = e.target.closest('[data-memo]'); if (!b) return;
    const m = b.dataset.memo;
    if (m === 'close') { memoClose(); if (P && (screen === 'practice' || screen === 'diag')) rerender(); return; }
    if (m === 'clear') return memoClear();
    eraser = m === 'eraser';
    memo.querySelectorAll('[data-memo=pen],[data-memo=eraser]').forEach((x) => x.classList.toggle('on', x.dataset.memo === m));
  });

  // ---------- 保存 ----------
  const blank = () => ({ v: 1, profile: null, diag: null, skills: {}, log: [], goal: null, today: null, badges: {}, goalDays: [], ahead: { sets: 0, days: 0 }, coach: null, cards: {}, spent: 0 });
  let st = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const o = JSON.parse(raw); if (o && o.v === 1) return Object.assign(blank(), o); }
    } catch (e) { /* 読めない環境でも動くようにする */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(st)); }
    catch (e) { toast('この端末に保存できませんでした。ブラウザの設定を確認してください。'); }
  }

  // ---------- 小道具 ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pad = (n) => String(n).padStart(2, '0');
  const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dayStr(new Date());
  const parseDay = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parseDay(s); d.setDate(d.getDate() + n); return dayStr(d); };
  const daysBetween = (a, b) => Math.round((parseDay(b) - parseDay(a)) / 86400000);
  const WD = ['日', '月', '火', '水', '木', '金', '土'];
  const fmtDay = (s) => { const d = parseDay(s); return (d.getMonth() + 1) + '/' + d.getDate() + '（' + WD[d.getDay()] + '）'; };
  const sk = (id) => (st.skills[id] = st.skills[id] || { score: 0, diag: null, q: 0, c: 0 });
  const starsOf = (score) => (score >= 90 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0);
  const stars = (score) => { const n = starsOf(score); return '<span class="stars">' + '★'.repeat(n) + '<i>' + '☆'.repeat(3 - n) + '</i></span>'; };
  const fmtMin = (sec) => (sec < 60 ? sec + '秒' : Math.round(sec / 60) + '分');
  let toastTimer;
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  // ---------- ことば（やる気を支える声かけ） ----------
  const MSG = {
    ok: ['正解！その調子！', 'すばらしい！', 'いいね、力がついてきてる！', 'バッチリ！', 'ナイス！自信を持っていこう'],
    okHint: ['ヒントを使って正解！ヒントを使いこなせるのも実力だよ', '正解！考え方がつかめてきたね', 'よく粘ったね、正解！'],
    retry: ['おしい！もう一度考えてみよう', 'あと一歩！ヒントを見てみる？', 'だいじょうぶ、もう一回チャレンジ！'],
    giveup: ['ここで覚えれば、次は解ける！', '解説を読むのも立派な勉強だよ', 'まちがいは伸びしろ。解説をチェックしよう'],
    tips: ['毎日少しずつが一番の近道。', '「わからない」がわかるのも前進です。', 'まちがえた問題こそ、宝物。', '昨日の自分より1問多く。', '5分だけでもOK。続けることが力になる。'],
  };

  // ---------- コーチ（js/coach.js の絵とセリフを使う） ----------
  const CO = window.COACH;
  const coachOf = () => (st.coach && CO && CO.byId(st.coach)) || null;
  function bubble(cat, mood, vars, small) {
    const c = coachOf();
    if (!c) return '';
    const text = CO.line(c.id, cat, Object.assign({ name: esc(st.profile ? st.profile.name : '') }, vars || {}));
    return `<div class="coach ${small ? 'sm' : ''}"><div class="cface">${CO.svg(c.id, mood)}</div><div class="cbubble"><b>${esc(c.name)}</b>${text}</div></div>`;
  }
  // 練習中の声かけ：コーチがいればコーチ、いなければこれまでの言葉
  const fbHead = (emoji, cat, mood, fallback) => (coachOf() ? bubble(cat, mood, null, true) : `<div class="fb-h">${emoji} ${pick(fallback)}</div>`);

  // ---------- 記録の集計 ----------
  function streak() {
    const days = new Set(st.log.map((l) => l.d));
    const d = new Date();
    if (!days.has(dayStr(d))) d.setDate(d.getDate() - 1); // 今日まだでも昨日まで続いていれば継続中
    let n = 0;
    while (days.has(dayStr(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function totals(filterDay) {
    let q = 0, c = 0, sec = 0;
    st.log.forEach((l) => { if (!filterDay || l.d === filterDay) { q += l.q; c += l.c; sec += l.sec; } });
    return { q, c, sec };
  }
  // 月曜はじまりの週で、今週と先週に解いた問題数
  function weekCompare() {
    const d = new Date(); const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const thisStart = dayStr(mon), lastStart = addDays(thisStart, -7);
    let now = 0, last = 0;
    st.log.forEach((l) => { if (l.d >= thisStart) now += l.q; else if (l.d >= lastStart) last += l.q; });
    return { now, last };
  }

  // ---------- レベルと称号 ----------
  const TITLES = SK.titles;
  const AHEAD_SET_PT = 10, AHEAD_DAY_PT = 30;
  const aheadOf = () => st.ahead || { sets: 0, days: 0 };
  function xp() {
    const a = aheadOf();
    return st.log.reduce((acc, l) => acc + l.c * 10 + (l.mode === 'diag' ? 50 : 20), 0) + a.sets * AHEAD_SET_PT + a.days * AHEAD_DAY_PT;
  }
  function levelOf(x) {
    let lv = 1; while (x >= 50 * lv * (lv + 1)) lv++;          // 次のレベルまで：100, 300, 600, 1000 …
    const from = 50 * (lv - 1) * lv, to = 50 * lv * (lv + 1);
    return { lv, title: TITLES[Math.min(lv, TITLES.length) - 1], pct: Math.round(((x - from) / (to - from)) * 100), rest: to - x };
  }

  // ---------- バッジ ----------
  const BADGES = [
    { id: 'first', icon: '🌱', name: 'はじめの一歩', hint: '練習を1セットやる', ok: (s) => s.sessions >= 1 },
    { id: 'diag', icon: '🎯', name: '実力チェック完了', hint: '実力チェックを最後まで受ける', ok: () => !!st.diag },
    { id: 'goal', icon: '📌', name: '目標を決めた', hint: '目標を設定する', ok: () => !!st.goal },
    { id: 'day1', icon: '✅', name: '今日の目標達成', hint: '今日のメニューをすべて終える', ok: () => st.goalDays.length >= 1 },
    { id: 'day7', icon: '🗓', name: '目標達成 7日', hint: '今日のメニューを7日分終える', ok: () => st.goalDays.length >= 7 },
    { id: 'st3', icon: '🔥', name: '3日連続', hint: '3日続けて学習する', ok: (s) => s.streak >= 3 },
    { id: 'st7', icon: '🔥', name: '1週間連続', hint: '7日続けて学習する', ok: (s) => s.streak >= 7 },
    { id: 'st14', icon: '💪', name: '2週間連続', hint: '14日続けて学習する', ok: (s) => s.streak >= 14 },
    { id: 'st30', icon: '👑', name: '30日連続', hint: '30日続けて学習する', ok: (s) => s.streak >= 30 },
    { id: 'q50', icon: '✏️', name: '50問達成', hint: '合計50問解く', ok: (s) => s.q >= 50 },
    { id: 'q200', icon: '📚', name: '200問達成', hint: '合計200問解く', ok: (s) => s.q >= 200 },
    { id: 'q500', icon: '🏔', name: '500問達成', hint: '合計500問解く', ok: (s) => s.q >= 500 },
    { id: 'perfect', icon: '💯', name: '全問正解', hint: '1セットを全問正解する', ok: (s) => s.perfect >= 1 },
    { id: 'perfect10', icon: '🌟', name: '全問正解 10回', hint: '全問正解を10回', ok: (s) => s.perfect >= 10 },
    { id: 'review', icon: '🔁', name: '総復習デビュー', hint: '総復習（10問）をやる', ok: (s) => s.reviews >= 1 },
    { id: 'over1', icon: '🦋', name: '苦手克服', hint: '実力チェックで「復習しよう」だった単元を★2にする', ok: (s) => s.overcome >= 1 },
    { id: 'over5', icon: '🚀', name: '苦手克服 5個', hint: '苦手だった単元を5つ★2にする', ok: (s) => s.overcome >= 5 },
    { id: 'master', icon: '⭐', name: 'はじめてのマスター', hint: 'どれか1つの単元を★3にする', ok: (s) => s.master >= 1 },
    { id: 'unit', icon: '🏅', name: '単元制覇', hint: '1つの単元のスキルをすべて★2にする', ok: (s) => s.units >= 1 },
    { id: 'lv5', icon: '🎖', name: 'レベル5', hint: 'レベル5になる', ok: (s) => s.lv >= 5 },
    { id: 'ahead1', icon: '🚀', name: '前倒しデビュー', hint: '次の日の分を1セット前倒しでやる', ok: () => aheadOf().sets >= 1 },
    { id: 'aheadDay1', icon: '⏩', name: '1日分前倒し', hint: '次の日の分を、1日分すべて前倒しで終える', ok: () => aheadOf().days >= 1 },
    { id: 'aheadDay5', icon: '🏃', name: '前倒し5日分', hint: '合計5日分を前倒しで終える', ok: () => aheadOf().days >= 5 },
    { id: 'ahead20', icon: '🌠', name: '前倒し20セット', hint: '合計20セットを前倒しでやる', ok: () => aheadOf().sets >= 20 },
    { id: 'cards10', icon: '🎴', name: 'カード10枚', hint: '知識カードを10枚集める', ok: () => Object.keys(st.cards || {}).length >= 10 },
    { id: 'cardsAll', icon: '📚', name: 'カード全部', hint: 'この教科の知識カードを全部集める', ok: () => SK.list.every((x) => (st.cards || {})[x.id]) },
  ];
  function badgeStats() {
    const sess = st.log.filter((l) => l.mode !== 'diag');
    return {
      sessions: sess.length,
      reviews: st.log.filter((l) => l.mode === 'review').length,
      perfect: sess.filter((l) => l.q >= PRACTICE_N && l.c === l.q).length,
      q: totals().q,
      streak: streak(),
      overcome: SK.list.filter((s) => sk(s.id).diag === 'ng' && sk(s.id).score >= 70).length,
      master: SK.list.filter((s) => sk(s.id).score >= 90).length,
      units: SK.units.filter((u) => u.skills.every((id) => sk(id).score >= 70)).length,
      lv: levelOf(xp()).lv,
    };
  }
  // 新しく取れたバッジを記録して返す
  function checkBadges() {
    const s = badgeStats();
    const got = BADGES.filter((b) => !st.badges[b.id] && b.ok(s));
    got.forEach((b) => { st.badges[b.id] = today(); });
    if (got.length) save();
    return got;
  }
  const badgeChips = (list) => list.map((b) => `<span class="chip">${b.icon} ${esc(b.name)}</span>`).join('');

  // ---------- おすすめ・目標・今日のメニュー ----------
  // 学ぶ順番（前提から順に。苦手 → 今の学年 → 残り）
  function recommendOrder() {
    const L = SK.list, out = [];
    const untested = (s) => sk(s.id).diag === 'untested' || (st.diag && !sk(s.id).diag);
    const push = (f) => L.forEach((s) => { if (f(s) && !out.includes(s)) out.push(s); });
    push((s) => sk(s.id).score < 40 && !untested(s));
    push((s) => s.grade === SK.main && sk(s.id).score < 70);
    push((s) => sk(s.id).score < 70);
    push((s) => sk(s.id).score < 90);
    return out;
  }
  const recommend = () => recommendOrder()[0] || null;
  const setsNeeded = (id) => { const v = sk(id).score; return v >= 90 ? 0 : v >= 70 ? 1 : v >= 40 ? 2 : 3; };

  const GOALS = SK.goals;

  // テスト範囲のスキル（前の学年の苦手もふくめる設定なら、範囲の単元に直接つながる前の学年の苦手も入れる）
  const basePrereqs = (id) => SK.byId[id].prereq.filter((a) => SK.byId[a].grade !== SK.main && sk(a).score < 40);
  function examRange(g) {
    const ids = new Set();
    g.exam.units.forEach((u) => SK.unitById[u].skills.forEach((id) => ids.add(id)));
    if (g.exam.base) [...ids].forEach((id) => basePrereqs(id).forEach((a) => ids.add(a)));
    return SK.list.filter((s) => ids.has(s.id)).map((s) => s.id);
  }
  // テストまでの計画：苦手ほど多く、同じ単元はなるべく間をあけてくり返す。最終日は総復習。
  function examPlan(g) {
    const range = examRange(g);
    const left = daysBetween(today(), g.exam.date);                   // 今日〜テスト前日までの日数
    if (left <= 0) return { range, left, days: [], over: false };
    const reviewDay = left >= 3;
    const cap = (left - (reviewDay ? 1 : 0)) * g.daily;
    // 1巡目：範囲の単元を順に。その直前に、関係する中1の苦手を1回ずつはさむ
    // 2・3巡目：範囲の単元だけをくり返す（テスト範囲を優先する）
    const core = SK.list.filter((s) => g.exam.units.includes(s.unit)).map((s) => s.id);
    const tasks = [], seen = new Set();
    core.forEach((id) => {
      if (g.exam.base) basePrereqs(id).forEach((a) => { if (!seen.has(a)) { seen.add(a); tasks.push({ kind: 'skill', id: a }); } });
      if (setsNeeded(id) >= 1) tasks.push({ kind: 'skill', id });
    });
    for (let pass = 2; pass <= 3; pass++) core.forEach((id) => { if (setsNeeded(id) >= pass) tasks.push({ kind: 'skill', id }); });
    const over = tasks.length > cap;
    tasks.length = Math.min(tasks.length, cap);
    const days = [];
    for (let i = 0; i < left; i++) {
      const d = addDays(today(), i);
      let t;
      if (reviewDay && i === left - 1) t = Array.from({ length: Math.min(g.daily, 2) }, () => ({ kind: 'review', ids: range }));
      else { t = tasks.slice(i * g.daily, (i + 1) * g.daily); if (!t.length) t = [{ kind: 'review', ids: range }]; }
      days.push({ d, tasks: t });
    }
    return { range, left, days, over };
  }
  function buildMenu() {
    const g = st.goal;
    if (!g) return [];
    if (g.type === 'exam') { const p = examPlan(g); return p.days.length ? p.days[0].tasks : []; }
    const n = g.daily;
    if (g.type === 'entrance') {
      const strong = SK.list.filter((s) => sk(s.id).score >= 70).map((s) => s.id);
      const weak = SK.list.filter((s) => sk(s.id).score < 70).map((s) => s.id);    // 未確認の中1もふくめ、全範囲を前提順に
      const withReview = strong.length >= 2 && (n >= 2 || !weak.length);
      const t = weak.slice(0, n - (withReview ? 1 : 0)).map((id) => ({ kind: 'skill', id }));
      if (withReview) t.push({ kind: 'review', ids: strong });
      return t;
    }
    return recommendOrder().slice(0, n).map((s) => ({ kind: 'skill', id: s.id }));
  }
  // 今日のメニューは1日の最初に決めて固定する（途中で点数が変わっても入れかわらない）
  function todayMenu() {
    const key = JSON.stringify(st.goal);
    if (!st.today || st.today.d !== today() || st.today.key !== key) {
      const tasks = buildMenu();
      st.today = { d: today(), key, tasks, done: tasks.map(() => false) };
      save();
    }
    return st.today;
  }
  // 前倒し：n 日先の分のメニュー。定期テストは計画表の n 日先、それ以外はまだやっていない次のおすすめ
  function nextBatch(n) {
    const g = st.goal, m = todayMenu();
    if (g.type === 'exam') {
      const pl = examPlan(g), day = pl.days[n];
      return day ? day.tasks : [{ kind: 'review', ids: pl.range }];
    }
    const used = new Set(m.tasks.filter((t) => t.kind === 'skill').map((t) => t.id));
    const order = g.type === 'entrance' ? SK.list.filter((x) => sk(x.id).score < 70) : recommendOrder();
    const t = order.filter((x) => !used.has(x.id)).slice(0, g.daily).map((x) => ({ kind: 'skill', id: x.id }));
    if (t.length) return t;
    const strong = SK.list.filter((x) => sk(x.id).score >= 40).map((x) => x.id);
    return [{ kind: 'review', ids: strong.length >= 2 ? strong : SK.list.map((x) => x.id) }];
  }
  const batchOf = (t) => t.b || 0;
  const batchDone = (m, b) => m.tasks.every((t, k) => batchOf(t) !== b || m.done[k]);
  const lastBatch = (m) => m.tasks.reduce((a, t) => Math.max(a, batchOf(t)), 0);
  function addAhead() {
    const m = todayMenu(), b = lastBatch(m) + 1;
    nextBatch(b).forEach((t) => { m.tasks.push(Object.assign({}, t, { b })); m.done.push(false); });
    save();
    return b;
  }
  const taskName = (t) => (t.kind === 'review' ? `総復習（${REVIEW_N}問）` : SK.byId[t.id].name);

  // ---------- 画面切りかえ ----------
  let screen = 'home';
  const SESSION = (n) => n === 'practice' || n === 'diag';
  // opt.pop：「戻る」で来たとき（履歴を足さない）、opt.replace：今の履歴を置きかえる
  function go(name, arg, opt) {
    opt = opt || {};
    screen = name;
    try {
      const state = { s: name, a: arg === undefined ? null : arg };
      if (opt.pop) { /* 何もしない */ } else if (opt.replace || !history.state) history.replaceState(state, '');
      else history.pushState(state, '');
    } catch (e) { /* 履歴が使えない環境でも動く */ }
    window.scrollTo(0, 0);
    (SCREENS[name] || SCREENS.home)(arg);
    const inSession = name === 'practice' || name === 'diag';
    if (!inSession) memoClose();
    nav.hidden = !st.profile || inSession || name === 'setup';
    nav.querySelectorAll('[data-go]').forEach((b) => b.classList.toggle('on', b.dataset.go === name || (name === 'lesson' && b.dataset.go === 'map') || (name === 'card' && b.dataset.go === 'zukan')));
  }
  const render = (html) => { app.innerHTML = html; };

  // ---------- 各画面 ----------
  const SCREENS = {};

  let setupSel = null;
  SCREENS.setup = function (keep) {
    if (!keep) setupSel = course;
    const renaming = !!st.profile;
    const C = window.COURSES[setupSel];
    render(`
<section class="hero">
  <div class="logo">まなび<b>ステップ</b></div>
  <p>自分のペースで、一歩ずつ。</p>
</section>
<div class="card">
  <label class="lbl" for="nm">ニックネーム</label>
  <input id="nm" class="inp" maxlength="12" placeholder="例：たろう" autocomplete="off" value="${esc(st.profile ? st.profile.name : '')}">
  <p class="note">本名は入れなくてOK。</p>
  ${renaming ? `<p class="muted small">${esc(SK.title)}</p>` : `<div class="lbl">学年</div>
  <div class="seg">
    ${GROUPS.map(([g, n]) => `<button class="${C.group === g ? 'on' : ''}" data-act="setupCourse" data-c="${courseOf(g, C.subjKey) || courseOf(g, 'math')}">${n}</button>`).join('')}
    <button disabled>中1<small>準備中</small></button><button disabled>中3<small>準備中</small></button>
  </div>
  <p class="note">ほかの学年は準備中です。</p>
  <div class="lbl">教科</div>
  <div class="subjects">
    ${SUBJECTS.map(([k, ic, n]) => { const c = courseOf(C.group, k); return c ? `<button class="subj ${c === setupSel ? 'on' : ''}" data-act="setupCourse" data-c="${c}">${ic}<span>${k === 'math' ? window.COURSES[c].subj : n}</span></button>` : `<button class="subj" disabled>${ic}<span>${n}</span><small>準備中</small></button>`; }).join('')}
  </div>
  <p class="note">ほかの教科は、あとからホーム画面で切りかえられます。</p>`}
  <button class="btn primary big" data-act="start">${renaming ? '変更する' : 'はじめる'}</button>
  ${renaming ? '<button class="btn ghost" data-go="records">やめる</button>' : ''}
</div>
<p class="privacy">🔒 記録はこの端末の中だけに保存され、外部には送信されません。</p>`);
  };

  function goalCardHTML() {
    const g = st.goal, G = GOALS[g.type];
    let sub = '';
    if (g.type === 'exam') {
      const left = daysBetween(today(), g.exam.date);
      sub = left > 0 ? `<div class="count"><b>${esc(g.exam.name)}</b>まで あと <span>${left}</span> 日</div>`
        : left === 0 ? `<div class="count"><b>${esc(g.exam.name)}</b>は今日！がんばって！</div>`
          : `<div class="count small">${esc(g.exam.name)}は終わりました。おつかれさま！次の目標を決めよう。</div>`;
      sub += `<div class="muted small">範囲：${g.exam.units.map((u) => esc(SK.unitById[u].name)).join('・')}</div>`;
    } else if (g.type === 'entrance') {
      const ok = SK.list.filter((s) => sk(s.id).score >= 70).length;
      sub = `<div class="muted small">土台づくり：★2以上 ${ok} / ${SK.list.length}</div><div class="bar sm"><i style="width:${Math.round((ok / SK.list.length) * 100)}%"></i></div>`;
    }
    return `<div class="goalbar"><span class="gi">${G.icon}</span><div class="gt"><div class="small muted">目標：${G.name}</div>${sub}</div>
<button class="btn small soft" data-go="goal">変更</button></div>`;
  }

  function menuCardHTML() {
    const m = todayMenu();
    if (!m.tasks.length) return '';
    const idx0 = m.tasks.map((t, i) => i).filter((i) => batchOf(m.tasks[i]) === 0);
    const done = idx0.filter((i) => m.done[i]).length, all = idx0.length;
    const finished = done === all, last = lastBatch(m), canAhead = finished && batchDone(m, last);
    const row = (t, i, no) => `<button class="task ${m.done[i] ? 'done' : ''} ${batchOf(t) ? 'ahead' : ''}" data-act="task" data-i="${i}">
    <span class="ck">${m.done[i] ? '✓' : no}</span><span class="nm">${esc(taskName(t))}${t.kind === 'skill' ? `<small>${SK.byId[t.id].grade === SK.main ? gname(SK.main) : gname(SK.byId[t.id].grade) + 'の復習'}・${stars(sk(t.id).score)}</small>` : '<small>いろいろな単元から出題</small>'}</span>
    <span class="go">${m.done[i] ? 'もう一度' : 'はじめる ›'}</span></button>`;
    let aheadHTML = '';
    for (let b = 1; b <= last; b++) {
      const ids = m.tasks.map((t, i) => i).filter((i) => batchOf(m.tasks[i]) === b);
      aheadHTML += `<div class="ahead-h">🚀 前倒し：${b === 1 ? '明日' : b + '日先'}の分 <span>${ids.filter((i) => m.done[i]).length} / ${ids.length}</span>${batchDone(m, b) ? ' <b>達成！</b>' : ''}</div>`
        + ids.map((i, k) => row(m.tasks[i], i, k + 1)).join('');
    }
    return `<div class="card accent">
  <div class="row between"><div class="tag">今日のメニュー</div><span class="muted small">${done} / ${all} セット</span></div>
  <div class="bar"><i style="width:${Math.round((done / all) * 100)}%"></i></div>
  ${idx0.map((i, k) => row(m.tasks[i], i, k + 1)).join('')}
  ${finished ? '<div class="done-msg">🎉 今日の目標達成！よくがんばったね！</div>' : ''}
  ${aheadHTML}
  ${canAhead ? `<button class="btn soft big" data-act="ahead">🚀 ${last ? (last + 1) + '日先' : '明日'}の分を前倒しでやる</button><p class="note center">前倒しした分はボーナスポイントがもらえます。明日以降のメニューも軽くなります。</p>` : ''}
  ${st.goal.type === 'exam' ? '<button class="btn ghost" data-go="plan">テストまでの計画を見る</button>' : ''}
</div>`;
  }

  // ホームのコーチの声かけ（前回の続き → 久しぶり → 実力チェック前 → メニュー達成 → テスト直前 → 次のメニュー → 連続日数 → あいさつ）
  function homeCoach(rl, s, h) {
    if (rl) return bubble('resume', 'normal');
    const last = st.log.length ? st.log[st.log.length - 1].d : null;
    if (last && daysBetween(last, today()) >= 3) return bubble('comeback', 'happy');
    if (!st.diag) return bubble('diag', 'happy');
    if (st.goal) {
      const m = todayMenu(), i = m.tasks.findIndex((t, k) => !m.done[k]);
      if (m.tasks.length && batchDone(m, 0) && i < 0) return bubble('menu_done', 'happy');
      if (st.goal.type === 'exam') { const left = daysBetween(today(), st.goal.exam.date); if (left > 0 && left <= 3) return bubble('exam', 'normal', { exam: esc(st.goal.exam.name), days: left }); }
      if (i >= 0) return bubble('menu_todo', 'normal', { task: esc(taskName(m.tasks[i])) });
    }
    if (s >= 3) return bubble('streak', 'happy', { streak: s });
    return bubble(h < 11 ? 'morning' : h < 18 ? 'afternoon' : 'evening', 'happy');
  }
  // コーチを選ぶ
  const coachChoices = () => CO.LIST.map((c) => `<button class="cpick ${st.coach === c.id ? 'on' : ''}" data-act="coachPick" data-c="${c.id}"><span class="cface">${CO.svg(c.id, 'happy')}</span><b>${esc(c.name)}</b><small>${esc(c.kind)}</small></button>`).join('');
  const coachPickCard = () => (CO ? `<div class="card"><div class="tag">はじめに</div><h3>いっしょに学ぶコーチを選ぼう</h3><p class="muted small">あとから「記録」→「設定」で変えられます。</p><div class="cpicks">${coachChoices()}</div></div>` : '');
  SCREENS.coach = function () {
    render(`
<button class="back" data-go="records">‹ 学習の記録</button>
<h1 class="page-h">コーチを選ぶ</h1>
${CO.LIST.map((c) => `<button class="card cpick-row ${st.coach === c.id ? 'on' : ''}" data-act="coachPick" data-c="${c.id}"><span class="cface">${CO.svg(c.id, 'happy')}</span><span><b>${esc(c.name)}</b>（${esc(c.kind)}）<small>${esc(c.desc)}</small><small class="say">「${CO.line(c.id, 'ok', {})}」</small></span></button>`).join('')}`);
  };

  SCREENS.home = function () {
    const p = st.profile, s = streak(), t = totals(today());
    const h = new Date().getHours();
    const hello = h < 11 ? 'おはよう' : h < 18 ? 'こんにちは' : 'こんばんは';
    const L = levelOf(xp()), wk = weekCompare();
    const total = SK.list.length;
    let main;
    if (!st.diag) {
      main = `<div class="card accent">
  <div class="tag">STEP 1</div>
  <h2>まずは実力チェック</h2>
  <p>今どこまでわかっているかを確かめて、あなた専用の学習の順番を作ります。約${Math.max(10, Math.round(SK.list.filter((x) => x.grade === SK.main && x.diag !== false).length / 5) * 5)}分。</p>
  <button class="btn primary big" data-act="diagIntro">実力チェックをはじめる</button>
</div>`;
    } else if (!st.goal) {
      const r = recommend();
      main = `<div class="card accent">
  <div class="tag">STEP 2</div>
  <h2>目標を決めよう</h2>
  <p>${Object.values(GOALS).map((x) => '「' + x.name + '」').join('')}から選ぶと、毎日のメニューを作ります。</p>
  <button class="btn primary big" data-go="goal">目標を決める</button>
</div>
${r ? `<div class="card"><div class="tag">おすすめ</div><h3>${esc(r.name)}</h3><button class="btn soft" data-act="lesson" data-id="${r.id}">はじめる（${PRACTICE_N}問）</button></div>` : ''}`;
    } else {
      const menu = menuCardHTML();
      const r = recommend();
      main = goalCardHTML() + (menu || (r ? `<div class="card accent"><div class="tag">おすすめ</div><h2>${esc(r.name)}</h2>
<button class="btn primary big" data-act="lesson" data-id="${r.id}">はじめる（${PRACTICE_N}問）</button></div>` : `<div class="card accent"><h2>🎉 全スキル マスター！</h2><p>すごい！好きな単元で腕だめししよう。</p></div>`));
    }
    const subs = SUBJECTS.map((x) => [x, courseOf(SK.group, x[0])]).filter((x) => x[1]);
    const rl = resumeLabel();
    if (rl) main = `<div class="card resume"><div class="tag">前回の続き</div><h3>📌 ${rl}</h3><p class="muted small">途中までの答えはそのまま残っています。</p>
<button class="btn primary big" data-act="resume">続きから再開</button><button class="btn ghost" data-act="resumeDrop">続きを破棄する</button></div>` + main;
    render(`
${subs.length > 1 ? `<div class="subjbar">${subs.map(([x, c]) => `<button class="${c === course ? 'on' : ''}" data-act="switchSubj" data-c="${c}"><span>${x[1]}</span>${c === course ? subjName(SK) : subjName(window.COURSES[c])}</button>`).join('')}</div>` : ''}
${st.coach ? homeCoach(rl, s, h) : `<div class="greet">${hello}、<b>${esc(p.name)}</b> さん</div>${coachPickCard()}`}
<div class="lvcard"><div class="lv">Lv.${L.lv}</div><div class="lvt"><b>${esc(L.title)}</b><div class="bar sm"><i style="width:${L.pct}%"></i></div><span class="muted small">次のレベルまで ${L.rest} pt</span></div></div>
<div class="stats">
  <div class="stat"><div class="v">🔥 ${s}</div><div class="k">日連続</div></div>
  <div class="stat"><div class="v">${t.q}</div><div class="k">今日の問題</div></div>
  <div class="stat"><div class="v">${wk.now}</div><div class="k">今週の問題${wk.last ? `<br><span class="${wk.now >= wk.last ? 'up' : ''}">先週 ${wk.last}</span>` : ''}</div></div>
</div>
${main}
<div class="card">
  <div class="row between"><b>全体の進み具合</b><span class="muted">${Math.round(SK.list.reduce((a, x) => a + sk(x.id).score, 0) / total)}%</span></div>
  <div class="bar"><i style="width:${Math.round(SK.list.reduce((a, x) => a + sk(x.id).score, 0) / total)}%"></i></div>
  ${SK.units.filter((u) => u.grade === SK.main).map((u) => {
    const avg = Math.round(u.skills.reduce((a, id) => a + sk(id).score, 0) / u.skills.length);
    return `<div class="mini"><span>${esc(u.name)}</span><div class="bar sm"><i style="width:${avg}%"></i></div></div>`;
  }).join('')}
</div>
<p class="tip">💡 ${pick(MSG.tips)}</p>`);
  };

  // ----- 目標の設定 -----
  let G = null; // 設定中の目標
  function goalDraft() {
    const g = st.goal ? JSON.parse(JSON.stringify(st.goal)) : { type: 'improve', daily: 2 };
    g.exam = g.exam || { name: GOALS.exam.names[0], date: addDays(today(), 14), units: [], base: true };
    return g;
  }
  function readGoalForm() {
    const nm = document.getElementById('exname'), dt = document.getElementById('exdate');
    if (nm) G.exam.name = nm.value;
    if (dt) G.exam.date = dt.value;
  }
  SCREENS.goal = function (keep) {
    if (!keep || !G) G = goalDraft();
    const e = G.exam;
    render(`
<button class="back" data-go="home">‹ ホーム</button>
<h1 class="page-h">目標を決める</h1>
<div class="card">
  <div class="lbl">目的</div>
  ${Object.keys(GOALS).map((k) => `<button class="gopt ${G.type === k ? 'on' : ''}" data-act="goalType" data-k="${k}"><span class="gi">${GOALS[k].icon}</span><span><b>${GOALS[k].name}</b><small>${GOALS[k].desc}</small></span></button>`).join('')}
  <div class="lbl">1日の目標</div>
  <div class="seg three">${[1, 2, 3].map((n) => `<button class="${G.daily === n ? 'on' : ''}" data-act="goalDaily" data-n="${n}">${n}セット<small>約${n * 10}分</small></button>`).join('')}</div>
</div>
${G.type === 'exam' ? `<div class="card">
  <div class="lbl">テスト</div>
  <div class="seg two">${GOALS.exam.names.map((n) => `<button class="${e.name === n ? 'on' : ''}" data-act="goalExName" data-n="${n}">${n}</button>`).join('')}</div>
  <input type="hidden" id="exname" value="${esc(e.name)}">
  <label class="lbl" for="exdate">テストの日</label>
  <input type="date" id="exdate" class="inp" value="${esc(e.date)}" min="${addDays(today(), 1)}">
  <div class="lbl">テスト範囲（${SK.subj}）</div>
  <div class="units">${SK.units.filter((u) => u.grade === SK.main).map((u) => `<button class="uopt ${e.units.includes(u.id) ? 'on' : ''}" data-act="goalUnit" data-u="${u.id}">${e.units.includes(u.id) ? '☑' : '☐'} ${esc(u.name)}</button>`).join('')}</div>
  <button class="uopt wide ${e.base ? 'on' : ''}" data-act="goalBase">${e.base ? '☑' : '☐'} ${gname(PREV)}の苦手もいっしょに復習する</button>
  <p class="note">範囲は、学校で配られるテスト範囲の表を見て選んでください。</p>
</div>` : ''}
<button class="btn primary big" data-act="goalSave">この目標で決定</button>
${st.goal ? '<button class="btn ghost" data-act="goalClear">目標を設定しない</button>' : ''}`);
  };

  // 同じ内容が続く行は「× 2」にまとめる
  function planLines(tasks) {
    const names = tasks.map(taskName), out = [];
    names.forEach((n) => { const last = out[out.length - 1]; if (last && last.n === n) last.k++; else out.push({ n, k: 1 }); });
    return out.map((x) => esc(x.n) + (x.k > 1 ? ' × ' + x.k : '')).join('<br>');
  }
  // ----- テストまでの計画 -----
  SCREENS.plan = function () {
    const g = st.goal;
    if (!g || g.type !== 'exam') return go('home');
    const p = examPlan(g);
    render(`
<button class="back" data-go="home">‹ ホーム</button>
<h1 class="page-h">${esc(g.exam.name)}までの計画</h1>
<p class="muted small">毎日の練習の結果に合わせて、計画は自動で調整されます。今日のメニューを終えたら、ホームの「前倒しでやる」で明日の分に進めます。前倒しした分だけ、先の計画は軽くなります。</p>
${p.over ? `<div class="card warn">⏰ 全部を回るには日数が足りないので、<b>苦手なところを優先</b>しています。1日のセット数を増やすと、もっと回れます。</div>` : ''}
<div class="card">
${p.days.map((d, i) => `<div class="pday ${i === 0 ? 'now' : ''}"><div class="pd">${i === 0 ? '今日' : fmtDay(d.d)}</div><div class="pt">${planLines(i === 0 ? todayMenu().tasks : d.tasks)}</div></div>`).join('')}
<div class="pday exam"><div class="pd">${fmtDay(g.exam.date)}</div><div class="pt">📝 <b>${esc(g.exam.name)} 本番</b></div></div>
</div>
<div class="card"><b>範囲のスキル</b>${p.range.map((id) => `<div class="mini"><span class="wide">${esc(SK.byId[id].name)}</span>${stars(sk(id).score)}</div>`).join('')}</div>`);
  };

  // ----- 実力チェック -----
  SCREENS.diagIntro = function () {
    render(`
${bubble('diag', 'happy')}
<div class="card">
  <h2>実力チェック</h2>
  <ul class="list">
    <li>${gname(SK.main)}の内容から出題します（約${SK.list.filter((s) => s.grade === SK.main && s.diag !== false).length}〜${SK.list.filter((s) => s.diag !== false).length}問）。途中でやめると最初からになります。</li>
    <li>まちがえた単元は、<b>${gname(PREV)}の内容にさかのぼって</b>確認します。</li>
    <li>成績ではありません。わからない問題は<b>「わからない」</b>を押してOK。</li>
    <li>結果をもとに、あなた専用の学習の順番を作ります。</li>
  </ul>
  <button class="btn primary big" data-act="diagStart">スタート</button>
  <button class="btn ghost" data-go="home">あとで</button>
</div>`);
  };

  let D = null; // 実力チェック中の状態
  let newBadges = []; // 直前に取れたバッジ（結果画面で表示）
  let newCards = []; // 実力チェックで手に入ったカード
  function diagStart() {
    D = { queue: SK.list.filter((s) => s.grade === SK.main && s.diag !== false).map((s) => s.id), tested: {}, start: Date.now(), cur: null, items: [] };
    nextDiag();
  }
  function nextDiag() {
    while (D.queue.length && D.tested[D.queue[0]] !== undefined) D.queue.shift();
    if (!D.queue.length) return finishDiag();
    const id = D.queue[0];
    P = newQ({ mode: 'diag', skill: SK.byId[id] });
    go('diag', undefined, { replace: screen === 'diag' });
  }
  function diagAnswer(correct) {
    const id = P.skill.id;
    D.tested[id] = correct;
    D.queue.shift();
    if (!correct) {
      // さかのぼり：前提スキルを次に確認する
      P.skill.prereq.slice().reverse().forEach((pid) => {
        if (D.tested[pid] === undefined && !D.queue.includes(pid)) D.queue.unshift(pid);
      });
    }
    nextDiag();
  }
  function ancestors(id, out = new Set()) {
    SK.byId[id].prereq.forEach((p) => { if (!out.has(p)) { out.add(p); ancestors(p, out); } });
    return out;
  }
  function finishDiag() {
    const okIds = Object.keys(D.tested).filter((id) => D.tested[id]);
    const inferred = new Set(); okIds.forEach((id) => ancestors(id).forEach((a) => inferred.add(a)));
    const results = {};
    SK.list.forEach((s) => {
      const t = D.tested[s.id];
      const r = t === true ? 'ok' : t === false ? 'ng' : inferred.has(s.id) ? 'inferred' : 'untested';
      results[s.id] = r;
      const o = sk(s.id);
      o.diag = r;
      o.diagScore = { ok: 60, inferred: 50, ng: 10, untested: 0 }[r];
      o.score = o.diagScore;
    });
    const n = Object.keys(D.tested).length, c = okIds.length;
    const sec = Math.round((Date.now() - D.start) / 1000);
    st.diag = { date: today(), results, items: D.items };
    st.log.push({ d: today(), t: Date.now(), mode: 'diag', skill: null, q: n, c, sec });
    st.today = null; // 結果に合わせて今日のメニューを作り直す
    save();
    D = null; P = null;
    st.resume = null; save();
    newCards = syncCards(); save();
    newBadges = checkBadges();
    go('diagResult', undefined, { replace: true });
  }

  SCREENS.diagResult = function () {
    const res = st.diag.results;
    const ok = SK.list.filter((s) => res[s.id] === 'ok' || res[s.id] === 'inferred').length;
    const r = recommend();
    const mark = { ok: ['◎', 'できている', 'ok'], inferred: ['○', 'たぶんOK', 'inf'], ng: ['！', '復習しよう', 'ng'], untested: ['−', '未確認', 'un'] };
    const nb = newBadges; newBadges = [];
    const nc = newCards; newCards = [];
    render(`
<div class="card accent center">
  <div class="big-emoji">🎯</div>
  <h2>実力チェック完了！</h2>
  ${bubble('diag_done', 'happy')}
  ${ok ? `<p>できていることが <b class="hl">${ok}個</b> 見つかりました。</p>` : '<p>おつかれさま！ここからが本当のスタート。<br>一歩ずつ、ぐんぐん伸ばしていこう！</p>'}
  <p class="muted">「！」の単元を伸ばしていけば、もっと解けるようになります。</p>
  ${nb.length ? `<div class="newbadge">🏅 バッジ獲得！<div>${badgeChips(nb)}</div></div>` : ''}
  ${nc.length ? `<div class="newcard">🎴 知識カードを ${nc.length}枚 ゲット！<button class="btn soft small" data-go="zukan">図鑑を見る</button></div>` : ''}
</div>
${st.goal ? '' : `<div class="card"><div class="tag">次はここ</div><h3>目標を決めよう</h3><p class="muted small">目的に合わせて、毎日のメニューを作ります。</p><button class="btn primary big" data-go="goal">目標を決める</button></div>`}
${SK.units.map((u) => `
<div class="card">
  <div class="unit-h">${gname(u.grade)}・${esc(u.name)}</div>
  ${u.skills.map((id) => { const m = mark[res[id]]; return `<div class="res ${m[2]}"><span class="mk">${m[0]}</span><span class="nm">${esc(SK.byId[id].name)}</span><span class="st">${m[1]}</span></div>`; }).join('')}
</div>`).join('')}
${st.diag.items && st.diag.items.length ? `<div class="card">
  <b>答えと解説</b>
  <p class="muted small">見たいときだけ確認できます。</p>
  <div class="row"><button class="btn soft" data-act="review" data-f="all">全問（${st.diag.items.length}問）</button>
  <button class="btn soft" data-act="review" data-f="ng">まちがえた問題（${st.diag.items.filter((x) => !x.ok).length}問）</button></div>
</div>` : ''}
${r && st.goal ? `<div class="card"><div class="tag">まずはここから</div><h3>${esc(r.name)}</h3><button class="btn primary big" data-act="lesson" data-id="${r.id}">学習をはじめる</button></div>` : ''}
<button class="btn ghost" data-go="home">ホームへ</button>`);
  };

  SCREENS.diagReview = function (filter) {
    const items = (st.diag.items || []).map((x, i) => Object.assign({ no: i + 1 }, x)).filter((x) => filter !== 'ng' || !x.ok);
    render(`
<button class="back" data-go="diagResult">‹ 実力チェックの結果</button>
<h1 class="page-h">答えと解説</h1>
<div class="seg two"><button class="${filter !== 'ng' ? 'on' : ''}" data-act="review" data-f="all">全問</button><button class="${filter === 'ng' ? 'on' : ''}" data-act="review" data-f="ng">まちがえた問題</button></div>
${items.length ? items.map((x) => { const s = SK.byId[x.skill]; return `
<div class="card rv ${x.ok ? 'ok' : 'ng'}">
  <div class="rv-h"><span class="mk">${x.ok ? '⭕' : '❌'}</span><span class="muted small">第${x.no}問・${gname(s.grade)}・${esc(s.name)}</span></div>
  <div class="q">${x.q}</div>
  <div class="rv-a"><span class="muted small">あなたの答え</span><div>${x.user}</div></div>
  <div class="rv-a"><span class="muted small">正解</span><div>${x.ans}</div></div>
  <details${x.ok ? '' : ' open'}><summary>解説を見る</summary><div class="exp">${x.explain}</div></details>
  ${x.ok ? '' : `<button class="btn soft small" data-act="lesson" data-id="${x.skill}">この単元を練習する</button>`}
</div>`; }).join('') : '<div class="card center">🎉 まちがえた問題はありません！</div>'}`);
  };

  // ----- 単元マップ -----
  SCREENS.map = function () {
    const r = recommend();
    const strong = SK.list.filter((s) => sk(s.id).score >= 40).map((s) => s.id);
    render(`
<h1 class="page-h">単元マップ</h1>
<p class="muted small">★1：基本OK　★2：しっかり　★3：マスター</p>
<button class="btn soft" data-act="printOpen" data-back="map">🖨 プリントを作る（紙で練習）</button>
${strong.length >= 2 ? `<button class="btn soft" data-act="reviewStart" data-ids="${strong.join(',')}">🔁 総復習（★1以上の単元から${REVIEW_N}問）</button>` : ''}
${[SK.main, PREV].map((g) => `
<h2 class="grade-h">${SK.gradeTitle[g]}</h2>
${SK.units.filter((u) => u.grade === g).map((u) => `
<div class="card">
  <div class="unit-h">${esc(u.name)}</div>
  ${u.skills.map((id) => { const o = sk(id); return `<button class="skill ${r && r.id === id ? 'rec' : ''}" data-act="lesson" data-id="${id}">
    <span class="nm">${esc(SK.byId[id].name)}${r && r.id === id ? '<em>おすすめ</em>' : ''}</span>${stars(o.score)}</button>`; }).join('')}
</div>`).join('')}`).join('')}`);
  };

  // ----- 解説 -----
  SCREENS.lesson = function (id) {
    const s = SK.byId[id], o = sk(id);
    const pre = s.prereq.filter((p) => sk(p).score < 40);
    render(`
<button class="back" data-go="map">‹ 単元マップ</button>
<div class="card">
  <div class="muted small">${gname(s.grade)}・${esc(SK.unitById[s.unit].name)}</div>
  <h2>${esc(s.name)}</h2>
  <div>${stars(o.score)} <span class="muted small">${o.q ? `これまで ${o.c}/${o.q} 問正解` : 'まだ練習していません'}</span></div>
</div>
${pre.length ? `<div class="card warn">💡 先に <b>${pre.map((p) => esc(SK.byId[p].name)).join('、')}</b> を練習すると、もっとわかりやすくなるよ。
  <div class="row">${pre.map((p) => `<button class="btn small" data-act="lesson" data-id="${p}">${esc(SK.byId[p].name)}へ</button>`).join('')}</div></div>` : ''}
${bubble('lesson', 'normal', null, true)}
<div class="card lesson"><div class="tag">ポイント</div>${s.lesson}</div>
<button class="btn primary big" data-act="practice" data-id="${id}">練習する（${PRACTICE_N}問）</button>
<button class="btn soft" data-act="printOpen" data-skill="${id}" data-back="map">🖨 この単元のプリントを作る</button>`);
  };

  // ----- 問題（練習・総復習・実力チェック共通） -----
  let P = null;
  function newQ(base) {
    const q = base.skill.gen();
    const slots = [];
    (q.fields || []).forEach((f, k) => {
      if (f.frac) slots.push({ k, part: 'd' }, { k, part: 'n' });
      else slots.push({ k });
    });
    return Object.assign(base, { q, slots, inputs: slots.map(() => ''), ord: [], active: 0, hint: 0, tries: 0, done: false, feedback: null });
  }
  // 欄 k の入力値（分数なら "分子/分母"）
  function fieldValue(k) {
    const f = P.q.fields[k];
    const at = (part) => P.inputs[P.slots.findIndex((s) => s.k === k && s.part === part)];
    if (!f.frac) return at(undefined);
    const n = at('n'), d = at('d');
    return d === '' ? n : n + '/' + d;
  }
  const slotName = (i) => { const s = P.slots[i]; return s.part === 'd' ? '分母' : s.part === 'n' ? '分子' : P.q.fields[s.k].label; };
  // "1/6" → 分数の見た目に
  function fmtVal(v) {
    const t = String(v).replace(/-/g, '−');
    const m = t.match(/^(−?)(\d+)\/(\d+)$/);
    return m ? m[1] + '<span class="fr"><span>' + m[2] + '</span><span>' + m[3] + '</span></span>' : esc(t);
  }

  let S = null; // 練習セッション
  // ids が1つなら通常の練習（5問）、複数なら総復習（いろいろな単元から10問）
  function startSession(ids) {
    const mixed = ids.length > 1, n = mixed ? REVIEW_N : PRACTICE_N;
    let order = [];
    while (order.length < n) order = order.concat(shuffle(ids));
    const before = {}; ids.forEach((id) => { before[id] = sk(id).score; });
    S = { ids, mixed, n, order: order.slice(0, n), i: 0, results: [], start: Date.now(), before, lvBefore: levelOf(xp()).lv };
    P = newQ({ mode: 'practice', skill: SK.byId[S.order[0]] });
    go('practice');
  }

  function questionHTML() {
    const q = P.q;
    const isDiag = P.mode === 'diag';
    let head;
    if (isDiag) {
      const n = Object.keys(D.tested).length, all = n + D.queue.length;
      head = `<div class="qhead"><button class="x" data-act="quitDiag" aria-label="やめる">×</button>
<div class="bar"><i style="width:${Math.round((n / all) * 100)}%"></i></div><span>${n + 1}/${all}</span></div>
<div class="muted small">${P.skill.grade === SK.main ? gname(SK.main) : gname(P.skill.grade) + 'さかのぼり'}・${esc(SK.unitById[P.skill.unit].name)}</div>`;
    } else {
      head = `<div class="qhead"><button class="x" data-act="quitPractice" aria-label="やめる">×</button>
<div class="dots">${Array.from({ length: S.n }, (_, k) => `<i class="${k < S.results.length ? (S.results[k] ? 'ok' : 'ng') : k === S.i ? 'cur' : ''}"></i>`).join('')}</div>
<span>${S.i + 1}/${S.n}</span></div>
<div class="muted small">${S.mixed ? '総復習・' : ''}${esc(P.skill.name)}</div>`;
    }
    const body = `<div class="card qcard"><div class="q">${q.q}</div>${q.form ? `<div class="form">答えの形：${q.form}</div>` : ''}</div>`;
    let input = '';
    if (q.choices) {
      const long = q.choices.some((c) => c.replace(/<[^>]+>/g, '').length > 8) ? 'long' : '';
      input = `<div class="choices">${q.choices.map((c, k) => {
        let cls = '';
        if (P.done) cls = k === q.correct ? 'ok' : P.picked === k ? 'ng' : '';
        else if (P.wrongPicks && P.wrongPicks.includes(k)) cls = 'ng';
        return `<button class="choice ${cls} ${long}" data-act="choose" data-k="${k}" ${P.done || cls ? 'disabled' : ''}>${c}</button>`;
      }).join('')}</div>`;
    } else if (q.order) {
      const T = q.order.tokens, ok = P.done && ordText() === q.order.answer.join(' ');
      input = `<div class="ord-ans ${P.done ? (ok ? 'ok' : 'ng') : ''}">${P.ord.length ? P.ord.map((i, k) => `<button class="tok on" data-act="ordDel" data-k="${k}" ${P.done ? 'disabled' : ''}>${esc(T[i])}</button>`).join('') : '<span class="muted small">下の語をタップして、文を作ろう</span>'}</div>
${P.done ? '' : `<div class="ord-pool">${T.map((t, i) => (P.ord.includes(i) ? `<span class="tok used">${esc(t)}</span>` : `<button class="tok" data-act="ordAdd" data-i="${i}">${esc(t)}</button>`)).join('')}</div>
<div class="row"><button class="btn soft small" data-act="ordBack">↩ 1つもどす</button><button class="btn soft small" data-act="ordClear">全部もどす</button></div>`}`;
    } else {
      const box = (i, k) => {
        const res = P.done ? (SK.sameValue(fieldValue(k), q.answer[k]) ? 'ok' : 'ng') : '';
        return `<span class="field ${i === P.active && !P.done ? 'on' : ''} ${res}">${esc(P.inputs[i].replace(/-/g, '−')) || '<i>?</i>'}</span>`;
      };
      input = `<div class="fields">${q.fields.map((f, k) => {
        if (f.frac) {
          const d = P.slots.findIndex((s) => s.k === k && s.part === 'd'), n = d + 1;
          return `<div class="frow"><span class="flbl">${esc(f.label)}</span>
<div class="fracin"><div class="fpart" data-act="focus" data-k="${n}">${box(n, k)}<small>② 分子</small></div><div class="fline"></div>
<div class="fpart" data-act="focus" data-k="${d}">${box(d, k)}<small>① 分母</small></div></div></div>`;
        }
        const i = P.slots.findIndex((s) => s.k === k);
        return `<div class="frow" data-act="focus" data-k="${i}"><span class="flbl">${esc(f.label)}</span>${box(i, k)}
${f.post ? `<span class="fpost">${esc(f.post)}</span>` : ''}</div>`;
      }).join('')}</div>`;
      if (!P.done) input += keypadHTML();
    }
    let hints = '';
    if (P.hint > 0) hints = `<div class="hints">${q.hints.slice(0, P.hint).map((h, k) => `<div class="hint"><b>ヒント${k + 1}</b> ${h}</div>`).join('')}</div>`;

    let fb = '', actions = '';
    if (P.feedback) fb = `<div class="fb ${P.feedback.type}">${P.feedback.html}</div>`;
    if (P.done) {
      actions = `<button class="btn primary big" data-act="next">${isDiag ? '次へ' : S.i + 1 >= S.n ? '結果を見る' : '次の問題へ'}</button>`;
    } else if (isDiag) {
      actions = `${q.choices ? '' : `<button class="btn primary big" data-act="check">答える</button>`}<div class="row"><button class="btn soft" data-act="memo">${memo.hidden ? (isCalc ? '✏️ 計算メモ' : '✏️ メモ') : '✏️ メモを閉じる'}</button><button class="btn soft" data-act="dunno">わからない</button></div>`;
    } else {
      actions = `${q.choices ? '' : '<button class="btn primary big" data-act="check">答え合わせ</button>'}
<div class="row">${P.hint < q.hints.length ? `<button class="btn soft" data-act="hint">💡 ヒント（${P.hint + 1}/${q.hints.length}）</button>` : ''}<button class="btn soft" data-act="reveal">答えを見る</button></div>
<button class="btn soft" data-act="memo">${memo.hidden ? (isCalc ? '✏️ 計算メモ（指で書けます）' : '✏️ メモ（指で書けます）') : '✏️ メモを閉じる'}</button>`;
    }
    // 「もう一度」の声かけは問題のすぐ下、正解・解説は入力欄の下に出す
    return P.done ? head + body + hints + input + fb + actions : head + body + fb + hints + input + actions;
  }

  function keypadHTML() {
    const dec = !!P.q.dec;
    const keys = ['7', '8', '9', 'back', '4', '5', '6', '-', '1', '2', '3', 'tab', '0'].concat(dec ? ['.', 'clr'] : ['clr']);
    const label = { back: '⌫', '-': '−', clr: 'C', tab: '次の欄 →' };
    const multi = P.slots.length > 1;
    const wide = (k) => (k === 'clr' || (k === '0' && !dec) ? 'wide' : '');
    return `<div class="keypad">${keys.map((k) => (k === 'tab' && !multi ? '<span></span>' :
      `<button class="key ${/\d/.test(k) ? '' : 'fn'} ${wide(k)}" data-act="key" data-k="${k}">${label[k] || k}</button>`)).join('')}</div>`;
  }

  SCREENS.practice = SCREENS.diag = function () { rerender(); };
  // 学習中の状態（今の問題・入力・進み具合）を端末に保存する
  function saveSession() {
    if (!P || !SESSION(screen)) return;
    const pq = Object.assign({}, P, { skill: P.skill.id });
    st.resume = P.mode === 'diag'
      ? { type: 'diag', D: { queue: D.queue, tested: D.tested, start: D.start, items: D.items }, P: pq, at: Date.now() }
      : { type: 'practice', S: Object.assign({}, S), P: pq, at: Date.now() };
    save();
  }
  function clearSession() { if (st.resume) { st.resume = null; save(); } }
  // 保存した続きから再開する
  function resumeSession() {
    const r = st.resume;
    try {
      const sk1 = SK.byId[r.P.skill];
      if (!sk1) throw new Error('skill');
      P = Object.assign({}, r.P, { skill: sk1 });
      if (r.type === 'diag') { D = r.D; S = null; go('diag'); }
      else { S = r.S; if (S.ids.some((id) => !SK.byId[id])) throw new Error('skill'); go('practice'); }
    } catch (e) { clearSession(); toast('続きを読みこめませんでした'); go('home'); }
  }
  function resumeLabel() {
    const r = st.resume;
    if (!r || !SK.byId[r.P && r.P.skill]) return null;
    if (r.type === 'diag') { const n = Object.keys(r.D.tested).length; return `実力チェック（${n + 1}問目 / 全${n + r.D.queue.length}問）`; }
    return `${r.S.mixed ? '総復習' : esc(SK.byId[r.S.ids[0]].name)}（${r.S.i + 1}問目 / 全${r.S.n}問）`;
  }

  function rerender() {
    render(questionHTML());
    saveSession();
    if (!memo.hidden && memoOwner !== P) { memoClear(); memoOwner = P; }
  }

  function key(k) {
    if (P.done) return;
    let v = P.inputs[P.active];
    if (k === 'back') v = v.slice(0, -1);
    else if (k === 'clr') v = '';
    else if (k === 'tab') { P.active = (P.active + 1) % P.inputs.length; return rerender(); }
    else if (k === '-') v = v.startsWith('-') ? v.slice(1) : '-' + v;
    else if (/^\d$/.test(k) && v.length < 6) v += k;
    else if (k === '.' && P.q.dec && /\d$/.test(v) && !v.includes('.')) v += '.';
    P.inputs[P.active] = v;
    rerender();
  }

  const ordText = () => P.ord.map((i) => P.q.order.tokens[i]).join(' ');
  function check() {
    const q = P.q;
    if (q.order) {
      if (P.ord.length < q.order.tokens.length) return toast('すべての語を使って文を作ってね');
      return judge(ordText() === q.order.answer.join(' '));
    }
    const filled = (i) => P.inputs[i] !== undefined && P.inputs[i].replace('-', '') !== '';
    const empty = P.inputs.findIndex((v, i) => !filled(i) && !(P.slots[i].part === 'd' && filled(i + 1)));
    if (empty >= 0) {
      P.active = empty; rerender();
      return toast('「' + slotName(empty) + '」を入力してね');
    }
    const bad = q.fields.findIndex((f, k) => SK.parseAnswer(fieldValue(k)) === null);
    if (bad >= 0) return toast(q.fields[bad].frac ? '分母に 0 は使えないよ' : '数の入れ方を確かめてね');
    const notLowest = q.fields.some((f, k) => { if (!f.lowest) return false; const v = SK.parseAnswer(fieldValue(k)); return v && SK.sameValue(fieldValue(k), q.answer[k]) && gcdN(v.n, v.d) !== 1; });
    if (notLowest) return toast('答えの大きさは合っているよ！もっと約分できるかな？');
    judge(q.fields.every((f, k) => SK.sameValue(fieldValue(k), q.answer[k])));
  }

  function choose(k) {
    P.picked = k;
    judge(k === P.q.correct);
  }

  function answerText() {
    const q = P.q;
    if (q.choices) return q.choices[q.correct];
    if (q.order) return esc(q.order.answer.join(' '));
    return q.fields.map((f, k) => `${esc(f.label)} <b>${fmtVal(q.answer[k])}</b>${esc(f.post || '')}`).join('　');
  }
  function userText() {
    const q = P.q;
    if (q.choices) return P.picked === undefined ? '' : q.choices[P.picked];
    if (q.order) return esc(ordText());
    return q.fields.map((f, k) => `${esc(f.label)} <b>${fmtVal(fieldValue(k))}</b>${esc(f.post || '')}`).join('　');
  }
  // 実力チェックの1問を、あとで答えと解説を見られるように記録する
  function diagRecord(correct, dunno) {
    D.items.push({ skill: P.skill.id, q: P.q.q, user: dunno ? 'わからない' : userText(), ans: answerText(), explain: P.q.explain, ok: correct });
  }

  function judge(correct) {
    if (P.mode === 'diag') {
      log1(correct);
      diagRecord(correct, false);
      return diagAnswer(correct);
    }
    if (correct) {
      const clean = P.tries === 0 && P.hint === 0;
      finishQ(true, clean ? 15 : 7);
      P.feedback = { type: 'ok', html: `${fbHead('⭕', clean ? 'ok' : 'okHint', 'happy', clean ? MSG.ok : MSG.okHint)}<details><summary>解き方を確認</summary>${P.q.explain}</details>` };
    } else if (P.tries === 0) {
      P.tries = 1;
      if (P.q.choices) { P.wrongPicks = [P.picked]; }
      if (P.hint === 0) P.hint = 1;
      P.feedback = { type: 'retry', html: fbHead('🤔', 'retry', 'think', MSG.retry) };
    } else {
      reveal();
      return;
    }
    rerender();
  }

  function reveal() {
    finishQ(false, -5);
    P.feedback = { type: 'ng', html: `${fbHead('📘', 'giveup', 'normal', MSG.giveup)}<div class="ans">答え：${answerText()}</div><div class="exp">${P.q.explain}</div>` };
    rerender();
  }

  function finishQ(correct, delta) {
    P.done = true;
    S.results.push(correct);
    const o = sk(P.skill.id);
    o.q++; if (correct) o.c++;
    o.score = Math.max(0, Math.min(100, o.score + delta));
    save();
  }

  function log1(correct) {
    const o = sk(P.skill.id);
    o.q++; if (correct) o.c++;
  }

  function next() {
    if (P.mode === 'diag') return nextDiag();
    S.i++;
    if (S.i >= S.n) return finishPractice();
    P = newQ({ mode: 'practice', skill: SK.byId[S.order[S.i]] });
    rerender();
    window.scrollTo(0, 0);
  }

  function finishPractice() {
    const c = S.results.filter(Boolean).length, sec = Math.round((Date.now() - S.start) / 1000);
    st.log.push({ d: today(), t: Date.now(), mode: S.mixed ? 'review' : 'practice', skill: S.mixed ? null : S.ids[0], q: S.results.length, c, sec });
    // 今日のメニューにチェック（最後まで解いたときだけ）
    S.menuDone = false; S.aheadSet = false; S.aheadDay = 0;
    if (st.goal && S.results.length === S.n) {
      const m = todayMenu();
      const i = m.tasks.findIndex((t, k) => !m.done[k] && (S.mixed ? t.kind === 'review' : t.kind === 'skill' && t.id === S.ids[0]));
      if (i >= 0) {
        m.done[i] = true;
        const b = batchOf(m.tasks[i]);
        if (b === 0 && batchDone(m, 0) && !st.goalDays.includes(today())) { st.goalDays.push(today()); S.menuDone = true; }
        if (b > 0) {
          st.ahead = aheadOf(); st.ahead.sets++; S.aheadSet = true;
          if (batchDone(m, b)) { st.ahead.days++; S.aheadDay = b; }
        }
      }
    }
    save();
    st.resume = null; P = null;
    save();
    S.newCards = syncCards(S.ids); save();
    S.badges = checkBadges();
    S.lvAfter = levelOf(xp()).lv;
    go('summary', undefined, { replace: true });
  }

  SCREENS.summary = function () {
    const c = S.results.filter(Boolean).length, n = S.results.length;
    const msg = c === n ? '全問正解！完ぺきです！' : c >= n - 1 ? 'すばらしい！あと少しで完ぺき！' : c >= n / 2 ? 'いい調子！くり返すともっと伸びるよ' : 'チャレンジしたことが一番大事。解説を見て、もう1セットやってみよう';
    let detail;
    if (S.mixed) {
      const ups = S.ids.filter((id) => starsOf(sk(id).score) > starsOf(S.before[id]));
      detail = ups.length ? `<div class="levelup">⭐ ${ups.map((id) => esc(SK.byId[id].name)).join('、')} の★が上がった！</div>` : '';
    } else {
      const id = S.ids[0], after = sk(id).score, before = S.before[id];
      const up = starsOf(after) > starsOf(before);
      detail = `${up ? `<div class="levelup">⭐ ★アップ！ ${stars(after)}</div>` : `<div>${stars(after)}</div>`}
  <div class="bar"><i style="width:${after}%"></i></div>
  <p class="muted small">${esc(SK.byId[id].name)}　習熟度 ${after > before ? `${before} → <b>${after}</b>` : after}</p>`;
    }
    const L = levelOf(xp());
    const m = st.goal ? todayMenu() : null;
    const nextTask = m ? m.tasks.findIndex((t, k) => !m.done[k]) : -1;
    const r = recommend();
    const upAny = S.mixed ? S.ids.some((id) => starsOf(sk(id).score) > starsOf(S.before[id])) : starsOf(sk(S.ids[0]).score) > starsOf(S.before[S.ids[0]]);
    const coachSay = S.aheadDay ? bubble('ahead', 'happy') : c === n ? bubble('sum_perfect', 'happy') : upAny ? bubble('sum_up', 'happy') : c >= n - 1 ? bubble('sum_good', 'happy') : bubble('sum_try', 'normal');
    render(`
${S.menuDone ? '<div class="card celebrate center"><div class="big-emoji">🎉</div><h2>今日の目標達成！</h2><p>よくがんばったね！この調子で続けよう。</p></div>' : ''}
${S.aheadDay ? `<div class="card celebrate center"><div class="big-emoji">🚀</div><h2>前倒し達成！</h2><p>${S.aheadDay === 1 ? '明日' : S.aheadDay + '日先'}の分まで終わったよ。すごい！</p><div class="levelup">前倒しボーナス +${AHEAD_SET_PT + AHEAD_DAY_PT}pt</div><p class="muted small">これまでの前倒し：${aheadOf().days}日分・${aheadOf().sets}セット</p></div>`
  : S.aheadSet ? `<div class="card center"><b>🚀 前倒しボーナス +${AHEAD_SET_PT}pt</b><p class="muted small">先の分を進めているよ。この調子！</p></div>` : ''}
<div class="card accent center">
  <div class="big-emoji">${c === n ? '🏆' : c >= n / 2 ? '✨' : '🌱'}</div>
  <h2>${S.mixed ? '総復習　' : ''}${c} / ${n} 問正解</h2>
  ${coachSay ? `<div class="coach-in">${coachSay}</div>` : `<p>${msg}</p>`}
  ${detail}
  ${S.lvAfter > S.lvBefore ? `<div class="levelup big">🎊 レベルアップ！ Lv.${L.lv}「${esc(L.title)}」</div>` : ''}
  ${S.badges.length ? `<div class="newbadge">🏅 バッジ獲得！<div>${badgeChips(S.badges)}</div></div>` : ''}
  ${S.newCards && S.newCards.length ? `<div class="newcard">🎴 ${S.newCards.every((c) => c.from) ? 'カードが進化した！' : S.newCards.some((c) => c.from) ? '新しいカードと、進化したカード！' : '新しいカードをゲット！'}<div>${S.newCards.map((c) => cardMini(c.id)).join('')}</div><button class="btn soft small" data-go="zukan">図鑑を見る</button></div>` : ''}
  <p class="muted small">🔥 ${streak()}日連続で学習中</p>
</div>
${nextTask >= 0 ? `<button class="btn primary big" data-act="task" data-i="${nextTask}">次のメニュー：${esc(taskName(m.tasks[nextTask]))}</button>` : ''}
${m && nextTask < 0 && m.tasks.length ? `<button class="btn primary big" data-act="ahead">🚀 ${lastBatch(m) ? (lastBatch(m) + 1) + '日先' : '明日'}の分を前倒しでやる</button>` : ''}
<button class="btn ${nextTask >= 0 ? 'soft' : 'primary'} big" data-act="again">もう1セット</button>
${nextTask < 0 && r && (S.mixed || r.id !== S.ids[0]) ? `<button class="btn soft big" data-act="lesson" data-id="${r.id}">おすすめ：${esc(r.name)}</button>` : ''}
<button class="btn ghost" data-go="home">ホームへ</button>`);
  };

  // ----- 印刷用プリント -----
  let PR = null;
  const KANA = ['ア', 'イ', 'ウ', 'エ'];
  const diagWrong = () => (st.diag && st.diag.items ? st.diag.items.filter((x) => !x.ok) : []);
  function printDefaults(opt) {
    const src = st.goal && todayMenu().tasks.length ? 'menu' : st.diag ? 'weak' : 'units';
    return Object.assign({ src, units: [], skill: null, n: 10, inc: { q: true, a: true, e: true }, back: 'map' }, opt || {});
  }
  function printSkills() {
    if (PR.src === 'skill') return [PR.skill];
    if (PR.src === 'menu') {
      const ids = [];
      todayMenu().tasks.forEach((t) => (t.kind === 'review' ? t.ids : [t.id]).forEach((id) => { if (!ids.includes(id)) ids.push(id); }));
      return ids;
    }
    if (PR.src === 'weak') return recommendOrder().slice(0, 4).map((s) => s.id);
    if (PR.src === 'units') return SK.list.filter((s) => PR.units.includes(s.unit)).map((s) => s.id);
    return [];
  }
  function blankOf(p) {
    if (p.choices) return `<div class="sh-ch">${p.choices.map((c, k) => `<span>${KANA[k]}　${c}</span>`).join('')}</div>`;
    if (p.order) return `<div class="sh-ord">（ ${p.order.tokens.map(esc).join(' / ')} ）</div><div class="sh-line"></div>`;
    return `<div class="sh-blank">${p.fields.map((f) => `<span>${esc(f.label)}${f.frac ? '（分数）' : ''} <i class="ul"></i>${esc(f.post || '')}</span>`).join('')}</div>`;
  }
  function ansOf(p) {
    if (p.choices) return `${KANA[p.correct]}　${p.choices[p.correct]}`;
    if (p.order) return esc(p.order.answer.join(' '));
    return p.fields.map((f, k) => `${esc(f.label)} <b>${fmtVal(p.answer[k])}</b>${esc(f.post || '')}`).join('　');
  }
  // 画面のキーパッド用の案内（分母→分子の順、小数キー）は紙では不要なので出さない
  const printForm = (p) => (!p.form || p.dec || (p.fields && p.fields.some((f) => f.frac)) ? '' : `<div class="form">答えの形：${p.form}</div>`);
  function printItems() {
    if (PR.src === 'diag') return diagWrong().slice(0, PR.n).map((x) => ({ name: SK.byId[x.skill].name, q: x.q, blank: '', ans: x.ans, explain: x.explain }));
    const ids = printSkills();
    if (!ids.length) return [];
    let order = [];
    while (order.length < PR.n) order = order.concat(shuffle(ids));
    let prev = null; // 読解：同じ文章が続くときは、文章を1回だけ印刷する
    return order.slice(0, PR.n).map((id) => {
      const sk1 = SK.byId[id], p = sk1.gen();
      const q = p.passage && p.passage === prev ? p.stem : p.q;
      prev = p.passage || null;
      return { name: sk1.name, q: q + printForm(p), blank: blankOf(p), ans: ansOf(p), explain: p.explain };
    });
  }

  SCREENS.printSetup = function (keep) {
    if (!keep || !PR) PR = printDefaults();
    const menuOK = st.goal && todayMenu().tasks.length, dw = diagWrong().length;
    const opt = (k, name, sub) => `<button class="gopt ${PR.src === k ? 'on' : ''}" data-act="printSrc" data-k="${k}"><span><b>${name}</b>${sub ? `<small>${sub}</small>` : ''}</span></button>`;
    render(`
<button class="back" data-go="${PR.back}">‹ 戻る</button>
<h1 class="page-h">プリントを作る</h1>
<p class="muted small">紙に印刷して、途中式を書きながら解けます。PDFにして保存もできます。</p>
<div class="card">
  <div class="lbl">問題の範囲</div>
  ${PR.skill ? opt('skill', esc(SK.byId[PR.skill].name), 'この単元だけ') : ''}
  ${menuOK ? opt('menu', '今日のメニュー', todayMenu().tasks.map((t) => esc(taskName(t))).join('・')) : ''}
  ${st.diag ? opt('weak', '苦手な単元', 'おすすめ順に4つの単元から') : ''}
  ${opt('units', '単元を選ぶ', '')}
  ${dw ? opt('diag', '実力チェックで間違えた問題', `${dw}問（同じ問題をもう一度）`) : ''}
  ${PR.src === 'units' ? `<div class="units">${[SK.main, PREV].map((g) => SK.units.filter((u) => u.grade === g).map((u) => `<button class="uopt ${PR.units.includes(u.id) ? 'on' : ''}" data-act="printUnit" data-u="${u.id}">${PR.units.includes(u.id) ? '☑' : '☐'} ${g !== SK.main ? gname(g) + ' ' : ''}${esc(u.name)}</button>`).join('')).join('')}</div>` : ''}
  <div class="lbl">問題数</div>
  <div class="seg three">${[5, 10, 20].map((n) => `<button class="${PR.n === n ? 'on' : ''}" data-act="printN" data-n="${n}">${n}問</button>`).join('')}</div>
  ${PR.src === 'diag' ? `<p class="note">間違えた問題が${dw}問なので、最大${dw}問になります。</p>` : ''}
  <div class="lbl">印刷する内容</div>
  <div class="seg three">${[['q', '問題'], ['a', '解答'], ['e', '解説']].map(([k, n]) => `<button class="${PR.inc[k] ? 'on' : ''}" data-act="printInc" data-k="${k}">${PR.inc[k] ? '☑' : '☐'} ${n}</button>`).join('')}</div>
  <p class="note">解答・解説は、問題とは別のページに印刷されます。答え合わせのときに使えます。</p>
</div>
<button class="btn primary big" data-act="printMake">プリントを作る</button>`);
  };

  SCREENS.printPreview = function () {
    const it = PR.items, inc = PR.inc, d = parseDay(today());
    const title = PR.src === 'skill' ? SK.byId[PR.skill].name : PR.src === 'units' ? PR.units.map((u) => SK.unitById[u].name).join('・') : { menu: '今日のメニュー', weak: '苦手な単元', diag: '実力チェックの見直し' }[PR.src];
    const head = (sub) => `<div class="sh-head"><div><b>まなびステップ　練習プリント</b>${sub ? `<span class="sh-sub">${sub}</span>` : ''}</div><div class="sh-meta">${esc(title)}　${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日　名前（　　　　　　　）</div></div>`;
    const qs = inc.q ? `<section class="sh-page">${head('')}<ol class="sh-qs">${it.map((x) => `<li class="sh-q"><div class="sh-skill">${esc(x.name)}</div><div class="q">${x.q}</div>${x.blank}<div class="sh-work"></div></li>`).join('')}</ol></section>` : '';
    const as = inc.a || inc.e ? `<section class="sh-page ${inc.q ? 'brk' : ''}">${head(inc.a && inc.e ? '解答・解説' : inc.a ? '解答' : '解説')}<ol class="sh-as">${it.map((x) => `<li class="sh-a">${inc.q ? '' : `<div class="sh-skill">${esc(x.name)}</div><div class="q">${x.q}</div>`}${inc.a ? `<div class="sh-ans">答え　${x.ans}</div>` : ''}${inc.e ? `<div class="exp">${x.explain}</div>` : ''}</li>`).join('')}</ol></section>` : '';
    render(`
<div class="no-print">
  <button class="back" data-act="printBack">‹ 設定にもどる</button>
  <div class="card">
    <b>プリントができました（${it.length}問）</b>
    <button class="btn primary big" data-act="printNow">🖨 印刷する / PDFで保存</button>
    ${PR.src === 'diag' ? '' : '<button class="btn soft" data-act="printMake">🔄 別の問題で作り直す</button>'}
    <p class="note">PDFで保存するときは、印刷の画面で送信先（プリンター）を「PDFに保存」にしてください。下はプレビューです。</p>
  </div>
</div>
<div class="sheet">${qs}${as}</div>`);
  };

  // ----- 知識カード（図鑑）：★1で銅、★2で銀、★3で金。一度もらったカードはなくならない -----
  const TIERS = ['', '銅', '銀', '金'];
  const tierOf = (score) => (score >= 90 ? 3 : score >= 70 ? 2 : score >= 40 ? 1 : 0);
  // 今の習熟度にあわせてカードを更新し、新しく手に入った（進化した）カードを返す（from：前の段階、0 なら新しいカード）
  function syncCards(ids) {
    st.cards = st.cards || {};
    const got = [];
    (ids || SK.list.map((x) => x.id)).forEach((id) => {
      const t = tierOf(sk(id).score);
      if (t > (st.cards[id] || 0)) { got.push({ id, from: st.cards[id] || 0 }); st.cards[id] = t; }
    });
    return got;
  }
  // カードの表に書く「覚えておきたいポイント」（解説の最初の要点）
  function cardPoint(x) {
    const d = document.createElement('div'); d.innerHTML = x.lesson;
    const pt = d.querySelector('.pt');
    return (pt ? pt.textContent : d.textContent).trim();
  }
  const cardMini = (id) => { const t = (st.cards || {})[id] || 0; return `<span class="cmini t${t}">${SK.icon || '🎴'} ${esc(SK.byId[id].name)}${t ? `<i>${TIERS[t]}</i>` : ''}</span>`; };
  SCREENS.zukan = function () {
    const cards = st.cards || {}, all = SK.list.length, have = SK.list.filter((x) => cards[x.id]).length;
    const n = (t) => SK.list.filter((x) => cards[x.id] === t).length;
    render(`
<h1 class="page-h">知識カード図鑑</h1>
<div class="card"><div class="row between"><b>${have} / ${all} 枚</b><span class="small"><span class="tier t3">金 ${n(3)}</span> <span class="tier t2">銀 ${n(2)}</span> <span class="tier t1">銅 ${n(1)}</span></span></div>
<div class="bar"><i style="width:${Math.round((have / all) * 100)}%"></i></div>
<p class="note">★1で銅、★2で銀、★3で金のカードになります。カードを開くと、その単元のポイントを見直せます。</p></div>
${[SK.main, PREV].map((g) => `<h2 class="grade-h">${SK.gradeTitle[g]}</h2>${SK.units.filter((u) => u.grade === g).map((u) => `<div class="card"><div class="unit-h">${esc(u.name)}</div><div class="cards">${u.skills.map((id) => {
      const t = cards[id] || 0, x = SK.byId[id];
      return t ? `<button class="kcard t${t}" data-act="cardOpen" data-id="${id}"><span class="kc-ic">${SK.icon || '🎴'}</span><b>${esc(x.name)}</b><span class="kc-tier">${TIERS[t]}</span></button>`
        : `<button class="kcard locked" data-act="cardOpen" data-id="${id}"><span class="kc-ic">？</span><b>${esc(x.name)}</b><span class="kc-tier">★1でゲット</span></button>`;
    }).join('')}</div></div>`).join('')}`).join('')}`);
  };
  SCREENS.card = function (id) {
    const x = SK.byId[id];
    if (!x) return go('zukan', undefined, { replace: true });
    const t = (st.cards || {})[id] || 0;
    render(`
<button class="back" data-go="zukan">‹ 図鑑</button>
<div class="bigcard t${t}">
  <div class="bc-top"><span>${SK.icon || '🎴'} ${esc(SK.subj)}・${gname(x.grade)}</span><span>${t ? TIERS[t] + 'のカード' : 'まだ持っていません'}</span></div>
  <h2>${esc(x.name)}</h2>
  <div class="bc-unit">${esc(SK.unitById[x.unit].name)}</div>
  ${t ? `<div class="bc-point">${esc(cardPoint(x))}</div>` : `<div class="bc-point locked">練習して★1になると、このカードが手に入ります。</div>`}
  <div class="bc-stars">${stars(sk(id).score)}</div>
</div>
${t ? `<div class="card lesson"><div class="tag">ポイントの見直し</div>${x.lesson}</div>` : ''}
${t && t < 3 ? `<p class="note center">あと${t === 1 ? '★2で銀' : '★3で金'}のカードに進化します。</p>` : ''}
<button class="btn primary big" data-act="practice" data-id="${id}">練習する（${PRACTICE_N}問）</button>`);
  };

  // ----- 学習記録 -----
  SCREENS.records = function () {
    const all = totals(), s = streak(), L = levelOf(xp());
    const days = []; const d = new Date(); d.setDate(d.getDate() - 13);
    for (let i = 0; i < 14; i++) { const k = dayStr(d); days.push({ k, label: (d.getMonth() + 1) + '/' + d.getDate(), q: totals(k).q }); d.setDate(d.getDate() + 1); }
    const max = Math.max(5, ...days.map((x) => x.q));
    const practiced = SK.list.filter((x) => sk(x.id).q > 0 || sk(x.id).diag);
    const logs = st.log.slice().reverse().slice(0, 30);
    const got = BADGES.filter((b) => st.badges[b.id]).length;
    const logName = (l) => (l.mode === 'diag' ? '実力チェック' : l.mode === 'review' ? '総復習' : esc(SK.byId[l.skill] ? SK.byId[l.skill].name : ''));
    render(`
<h1 class="page-h">学習の記録</h1>
<div class="print-only print-head">まなびステップ 学習記録　${esc(st.profile.name)} さん（${esc(SK.title)}）　${today()} 出力</div>
<div class="lvcard"><div class="lv">Lv.${L.lv}</div><div class="lvt"><b>${esc(L.title)}</b><div class="bar sm"><i style="width:${L.pct}%"></i></div><span class="muted small">合計 ${xp()} pt・次のレベルまで ${L.rest} pt</span></div></div>
<div class="stats">
  <div class="stat"><div class="v">🔥 ${s}</div><div class="k">日連続</div></div>
  <div class="stat"><div class="v">${all.q}</div><div class="k">解いた問題</div></div>
  <div class="stat"><div class="v">${all.q ? Math.round((all.c / all.q) * 100) : 0}%</div><div class="k">正答率</div></div>
  <div class="stat"><div class="v">${fmtMin(all.sec)}</div><div class="k">学習時間</div></div>
</div>
${aheadOf().sets ? `<div class="card"><b>🚀 前倒しの記録</b><p>前倒しで終えた分：<b>${aheadOf().days}日分</b>（${aheadOf().sets}セット）</p><p class="muted small">前倒しボーナス 合計 ${aheadOf().sets * AHEAD_SET_PT + aheadOf().days * AHEAD_DAY_PT}pt</p></div>` : ''}
<div class="card">
  <div class="row between"><b>バッジ</b><span class="muted small">${got} / ${BADGES.length}</span></div>
  <div class="badges">${BADGES.map((b) => st.badges[b.id]
    ? `<div class="badge got"><span>${b.icon}</span><b>${esc(b.name)}</b><small>${st.badges[b.id].slice(5).replace('-', '/')}</small></div>`
    : `<div class="badge"><span>🔒</span><b>${esc(b.name)}</b><small>${esc(b.hint)}</small></div>`).join('')}</div>
</div>
<div class="card">
  <b>この2週間</b>
  <div class="chart">${days.map((x) => `<div class="col"><div class="b ${st.goalDays.includes(x.k) ? 'goal' : ''}" style="height:${Math.round((x.q / max) * 100)}%" title="${x.q}問"></div><span>${x.label.split('/')[1]}</span></div>`).join('')}</div>
  <p class="note">緑の日は「今日のメニュー」を達成した日（達成 ${st.goalDays.length}日）</p>
</div>
<div class="card">
  <b>スキルの伸び</b>
  ${practiced.length ? `<table class="tbl"><tr><th>スキル</th><th>チェック時</th><th>今</th></tr>
  ${practiced.map((x) => { const o = sk(x.id); return `<tr><td>${esc(x.name)}</td><td>${o.diagScore !== undefined ? stars(o.diagScore) : '−'}</td><td>${stars(o.score)}</td></tr>`; }).join('')}</table>` : '<p class="muted">まだ記録がありません</p>'}
</div>
<div class="card">
  <b>最近の学習</b>
  ${logs.length ? logs.map((l) => `<div class="log"><span class="muted">${l.d.slice(5).replace('-', '/')}</span><span>${logName(l)}</span><span>${l.c}/${l.q}</span></div>`).join('') : '<p class="muted">まだ記録がありません</p>'}
</div>
<div class="card no-print">
  <b>保存・出力</b>
  <button class="btn soft" data-act="printOpen" data-back="records">📝 練習プリントを作る</button>
  <button class="btn soft" data-act="print">🖨 この記録を印刷 / PDFで保存</button>
  <button class="btn soft" data-act="export">💾 バックアップを保存（ファイル）</button>
  <label class="btn soft">📂 バックアップから復元<input type="file" accept=".json,application/json" id="imp" hidden></label>
  <p class="note">機種変更のときは、バックアップファイルを新しい端末で復元してください。</p>
</div>
<div class="card no-print">
  <b>設定</b>
  <button class="btn soft" data-go="goal">目標を${st.goal ? '変更' : '決める'}</button>
  <button class="btn soft" data-go="coach">コーチを${st.coach ? '変える（いま：' + esc((coachOf() || {}).name || '') + '）' : '選ぶ'}</button>
  <button class="btn soft" data-act="rename">ニックネームを変更</button>
  <button class="btn soft" data-go="course">学年・教科を切りかえる（いま：${esc(SK.title)}）</button>
  ${st.diag ? '<button class="btn soft" data-go="diagResult">前回の実力チェックの結果・解説</button>' : ''}
  <button class="btn soft" data-act="diagIntro">実力チェックをやり直す</button>
</div>
<p class="privacy no-print">🔒 記録はこの端末の中だけに保存され、外部には送信されません。</p>
<details class="more no-print"><summary>その他</summary><button class="linkish" data-go="owner">保護者メニュー</button><button class="linkish" data-go="reset">データの初期化</button></details>`);
    const imp = document.getElementById('imp');
    if (imp) imp.addEventListener('change', importFile);
  };

  // ----- 学年の切りかえ（学年ごとに記録は別々。きょうだいで1台を使うときにも） -----
  SCREENS.course = function () {
    render(`
<button class="back" data-go="records">‹ 学習の記録</button>
<h1 class="page-h">学年・教科を切りかえる</h1>
<p class="muted small">学年・教科ごとに、記録・目標・バッジは別々に保存されます。</p>
<div class="card">
${GROUPS.flatMap(([g]) => SUBJECTS.map(([k]) => courseOf(g, k)).filter(Boolean)).map((c) => { const o = c === course ? st : peek(c); return `<button class="gopt ${c === course ? 'on' : ''}" data-act="switchCourse" data-c="${c}"><span><b>${esc(window.COURSES[c].title)}</b><small>${o ? esc(o.profile.name) + ' さん' : 'まだ使っていません'}${c === course ? '（いま使用中）' : ''}</small></span></button>`; }).join('')}
</div>`);
  };

  // ----- 保護者メニュー（暗証番号つき。子どもが答えを見られないようにする簡単な鍵） -----
  const OWNER_KEY = 'manabi-step-owner';
  let ownerOK = false;
  const pinHash = (pin) => String([...(pin + ':manabi-step')].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7));
  function ownerData() { try { return JSON.parse(localStorage.getItem(OWNER_KEY) || 'null'); } catch (e) { return null; } }
  const pinInput = (id, ph) => `<input id="${id}" class="inp pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="${ph}">`;
  SCREENS.owner = function (mode) {
    const od = ownerData();
    if (!od || mode === 'change') {
      return render(`
<button class="back" data-go="records">‹ 学習の記録</button>
<h1 class="page-h">保護者メニュー</h1>
<div class="card"><b>${od ? '新しい暗証番号' : '暗証番号を決めてください'}</b>
  <p class="muted small">保護者メニューを開くための4けたの数字です。お子さんが問題の答えを見られないようにするための、簡単な鍵です。</p>
  ${pinInput('pin1', '4けたの数字')}${pinInput('pin2', 'もう一度')}
  <button class="btn primary big" data-act="ownerSet">決定</button></div>`);
    }
    if (!ownerOK) {
      return render(`
<button class="back" data-go="records">‹ 学習の記録</button>
<h1 class="page-h">保護者メニュー</h1>
<div class="card"><b>暗証番号を入れてください</b>${pinInput('pin1', '4けたの数字')}
  <button class="btn primary big" data-act="ownerLogin">開く</button></div>
<details class="more"><summary>暗証番号を忘れたとき</summary><p class="note">「リセット」と入力して決定すると、暗証番号だけを消して設定し直せます（学習の記録は消えません）。</p><input id="pinreset" class="inp" placeholder="リセット"><button class="btn soft" data-act="ownerReset">暗証番号を消す</button></details>`);
    }
    render(`
<button class="back" data-go="records">‹ 学習の記録</button>
<h1 class="page-h">保護者メニュー</h1>
<div class="card"><b>🔍 デモデータで画面を見る</b>
  <p class="muted small">実力チェック済み・目標設定済み・2週間分の記録がある状態で、すべての画面を確認できます。デモ用のデータは別の場所に保存するので、本当の記録には影響しません。</p>
  ${DEMO ? '<button class="btn soft" data-act="demoExit">デモを終了して本当の画面にもどる</button>' : '<button class="btn primary big" data-act="demoStart">デモ表示をはじめる</button>'}</div>
<div class="card"><b>📝 問題を確認する</b>
  <p class="muted small">各単元の問題を、答え・解説つきで見られます。記録には残りません。</p>
  <button class="btn soft" data-go="ownerQ">問題の一覧を開く</button></div>
<div class="card"><b>🔑 暗証番号</b><button class="btn soft" data-act="ownerChange">暗証番号を変更する</button></div>`);
  };
  SCREENS.ownerQ = function () {
    if (!ownerOK) return go('owner', undefined, { replace: true });
    render(`
<button class="back" data-go="owner">‹ 保護者メニュー</button>
<h1 class="page-h">問題を確認する</h1>
<p class="muted small">${esc(SK.title)}。ほかの教科はホームの教科タブで切りかえてから開いてください。</p>
${[SK.main, PREV].map((g) => `<h2 class="grade-h">${SK.gradeTitle[g]}</h2>${SK.units.filter((u) => u.grade === g).map((u) => `<div class="card"><div class="unit-h">${esc(u.name)}</div>${u.skills.map((id) => `<button class="skill" data-act="ownerSkill" data-id="${id}"><span class="nm">${esc(SK.byId[id].name)}</span><span class="muted small">見る ›</span></button>`).join('')}</div>`).join('')}`).join('')}`);
  };
  SCREENS.ownerSkill = function (id) {
    if (!ownerOK || !SK.byId[id]) return go('owner', undefined, { replace: true });
    const s1 = SK.byId[id];
    const qs = Array.from({ length: 3 }, () => s1.gen());
    render(`
<button class="back" data-go="ownerQ">‹ 問題の一覧</button>
<h1 class="page-h">${esc(s1.name)}</h1>
<p class="muted small">${gname(s1.grade)}・${esc(SK.unitById[s1.unit].name)}　${s1.diag === false ? '（実力チェックでは出題しない）' : ''}</p>
${qs.map((q, k) => `<div class="card rv"><div class="rv-h"><span class="muted small">例 ${k + 1}</span></div><div class="q">${q.q}</div>
  ${q.choices ? `<div class="sh-ch">${q.choices.map((c, i) => `<span>${KANA[i]}　${c}</span>`).join('')}</div>` : q.order ? `<div class="sh-ord">（ ${q.order.tokens.map(esc).join(' / ')} ）</div>` : ''}
  <div class="rv-a"><span class="muted small">正解</span><div>${ansOf(q)}</div></div>
  <div class="rv-a"><span class="muted small">ヒント</span><div class="small">${q.hints.join('<br>')}</div></div>
  <details open><summary>解説</summary><div class="exp">${q.explain}</div></details></div>`).join('')}
<button class="btn primary big" data-act="ownerSkill" data-id="${id}">🔄 別の問題を見る</button>`);
  };

  // デモ用の記録（実力チェック・目標・2週間分の学習・バッジ・前倒し）を作る
  function seedDemo() {
    st = blank();
    st.profile = { name: 'デモ', course, created: today() };
    const results = {}, items = [];
    SK.list.forEach((x, i) => {
      const main = x.grade === SK.main;
      const r = x.diag === false ? (main ? 'untested' : 'inferred') : main ? (i % 3 === 1 ? 'ng' : 'ok') : (i % 2 ? 'ng' : 'inferred');
      results[x.id] = r;
      const o = sk(x.id);
      o.diag = r; o.diagScore = { ok: 60, inferred: 50, ng: 10, untested: 0 }[r];
      o.score = Math.min(100, o.diagScore + [0, 15, 30, 45][i % 4]);
      o.q = 5 + (i % 4) * 5; o.c = Math.round(o.q * 0.7);
      if (main && x.diag !== false) {
        const q = x.gen(), ok = r === 'ok';
        items.push({ skill: x.id, q: q.q, user: ok ? ansOf(q) : 'わからない', ans: ansOf(q), explain: q.explain, ok });
      }
    });
    st.diag = { date: addDays(today(), -13), results, items };
    st.log.push({ d: addDays(today(), -13), t: Date.now() - 13 * 864e5, mode: 'diag', skill: null, q: items.length, c: items.filter((x) => x.ok).length, sec: 900 });
    const pool = SK.list.filter((x) => x.grade === SK.main);
    for (let k = 12; k >= 1; k--) {
      if (k % 5 === 0) continue; // ところどころ休んだ日
      const n = 1 + (k % 3);
      for (let j = 0; j < n; j++) {
        const x = pool[(k * 3 + j) % pool.length];
        st.log.push({ d: addDays(today(), -k), t: Date.now() - k * 864e5 + j, mode: j === 2 ? 'review' : 'practice', skill: j === 2 ? null : x.id, q: j === 2 ? REVIEW_N : PRACTICE_N, c: j === 2 ? 7 : 3 + (k % 3), sec: 420 });
      }
      if (n >= 2) st.goalDays.push(addDays(today(), -k));
    }
    st.goal = { type: 'exam', daily: 2, exam: { name: GOALS.exam.names[0], date: addDays(today(), 10), units: SK.units.filter((u) => u.grade === SK.main).slice(0, 2).map((u) => u.id), base: true } };
    st.ahead = { sets: 3, days: 1 };
    st.coach = 'owl';
    checkBadges();
    save();
  }

  // ----- データの初期化（誤操作を防ぐため、確認を2回はさむ） -----
  SCREENS.reset = function (step) {
    step = step || 0;
    const t = totals();
    const cancel = '<button class="btn primary big" data-go="records">やめる</button>';
    if (step === 0) {
      render(`
<button class="back" data-go="records">‹ 学習の記録</button>
<div class="card">
  <h2>データの初期化</h2>
  <p>この端末に保存されている<b>${esc(SK.title)}</b>の、次のデータをすべて削除して最初の状態に戻します。ほかの学年のデータは消えません。</p>
  <ul class="list">
    <li>ニックネーム（${esc(st.profile ? st.profile.name : '')}）</li>
    <li>実力チェックの結果、目標</li>
    <li>学習の記録（${t.q}問・${streak()}日連続）、レベル、バッジ</li>
  </ul>
  <p class="muted small">削除すると元に戻せません。残しておきたい場合は、先に「記録」→「バックアップを保存」をしてください。</p>
</div>
${cancel}
<button class="btn ghost" data-act="resetStep" data-step="1">初期化に進む</button>`);
    } else if (step === 1) {
      render(`
<div class="card warn center">
  <div class="tag">確認 1 / 2</div>
  <h2>本当に初期化しますか？</h2>
  <p>これまでの学習の記録が<b>すべて消えます</b>。</p>
</div>
${cancel}
<button class="btn danger" data-act="resetStep" data-step="2">はい、初期化します</button>`);
    } else {
      render(`
<div class="card warn center">
  <div class="tag">確認 2 / 2（最後の確認）</div>
  <h2>削除すると元に戻せません</h2>
  <p>本当に、すべてのデータを削除しますか？</p>
</div>
${cancel}
<button class="btn danger" data-act="doReset">すべて削除する</button>`);
    }
  };

  // ---------- 保存・出力 ----------
  function exportFile() {
    const blob = new Blob([JSON.stringify(Object.assign({ course }, st), null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manabi-backup-' + course + '-' + today() + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('バックアップを保存しました');
  }
  function importFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      try {
        const o = JSON.parse(rd.result);
        if (!o || o.v !== 1 || !o.profile || !Array.isArray(o.log) || typeof o.skills !== 'object') throw new Error('bad');
        if ((o.course || 'j2') !== course) { const C = window.COURSES[o.course || 'j2']; return toast(`このファイルは「${C ? C.title : '別の学年'}」のバックアップです。学年を切りかえてから復元してね`); }
        delete o.course;
        if (!confirm('今の記録をバックアップの内容で置きかえます。よろしいですか？')) return;
        st = Object.assign(blank(), o); save(); toast('復元しました'); go('home');
      } catch (err) { toast('このファイルは読み込めませんでした'); }
    };
    rd.readAsText(f);
  }

  // ---------- 操作 ----------
  const ACT = {
    start() {
      const name = document.getElementById('nm').value.trim();
      if (!name) return toast('ニックネームを入れてね');
      if (st.profile) { st.profile.name = name; save(); return go('records'); }
      if (setupSel !== course) { // ちがう学年で始める：その学年の保存場所に作って読みこみ直す
        try {
          const o = peek(setupSel) || blank();
          o.profile = { name, course: setupSel, created: today() };
          localStorage.setItem(storeKey(setupSel), JSON.stringify(o));
          localStorage.setItem(COURSE_KEY, setupSel);
        } catch (e) { return toast('この端末に保存できませんでした'); }
        return location.reload();
      }
      st.profile = { name, course, created: today() };
      try { localStorage.setItem(COURSE_KEY, course); } catch (e) { /* 既定のまま */ }
      save(); go('home');
    },
    setupCourse: (d) => { const v = document.getElementById('nm').value; setupSel = d.c; go('setup', true); document.getElementById('nm').value = v; },
    // 同じ学年のほかの教科へ。はじめての教科なら、いまのニックネームで始める
    switchSubj: (d) => {
      if (d.c === course) return;
      try {
        if (!DEMO && !peek(d.c)) { const o = blank(); o.profile = { name: st.profile.name, course: d.c, created: today() }; o.coach = st.coach; localStorage.setItem(storeKey(d.c), JSON.stringify(o)); }
        localStorage.setItem(COURSE_KEY, d.c);
      } catch (e) { return toast('切りかえられませんでした'); }
      location.reload();
    },
    switchCourse: (d) => {
      if (d.c === course) return go('home');
      try { localStorage.setItem(COURSE_KEY, d.c); } catch (e) { return toast('切りかえられませんでした'); }
      location.reload();
    },
    diagIntro: () => go('diagIntro'),
    diagStart,
    lesson: (d) => go('lesson', d.id),
    practice: (d) => startSession([d.id]),
    reviewStart: (d) => startSession(d.ids.split(',')),
    again: () => startSession(S.ids),
    task: (d) => {
      const t = todayMenu().tasks[Number(d.i)];
      if (!t) return go('home');
      if (t.kind === 'review') startSession(t.ids.length > 1 ? t.ids : SK.list.map((s) => s.id));
      else go('lesson', t.id);
    },
    key: (d) => key(d.k),
    ordAdd: (d) => { const i = Number(d.i); if (!P.done && !P.ord.includes(i)) { P.ord.push(i); rerender(); } },
    ordDel: (d) => { if (!P.done) { P.ord.splice(Number(d.k), 1); rerender(); } },
    ordBack: () => { if (!P.done) { P.ord.pop(); rerender(); } },
    ordClear: () => { if (!P.done) { P.ord = []; rerender(); } },
    focus: (d) => { if (!P.done) { P.active = Number(d.k); rerender(); } },
    check,
    choose: (d) => { if (!P.done) choose(Number(d.k)); },
    hint: () => { P.hint = Math.min(P.hint + 1, P.q.hints.length); rerender(); },
    reveal: () => reveal(),
    dunno: () => { log1(false); diagRecord(false, true); diagAnswer(false); },
    review: (d) => go('diagReview', d.f || 'all'),
    next,
    quitPractice: () => {
      if (!confirm('練習をやめますか？（ここまでの結果は残ります）')) return;
      if (S.results.length) return finishPractice();
      const back = S.mixed ? null : S.ids[0];
      S = null; P = null; clearSession();
      if (back) go('lesson', back, { replace: true }); else go('home', undefined, { replace: true });
    },
    quitDiag: () => { if (confirm('実力チェックをやめますか？（結果は保存されません）')) { D = null; P = null; clearSession(); go('home', undefined, { replace: true }); } },
    resume: () => resumeSession(),
    cardOpen: (d) => go('card', d.id),
    coachPick: (d) => {
      const first = !st.coach;
      st.coach = d.c; save();
      toast(`${CO.byId(d.c).name}が、あなたのコーチになりました！`);
      go(first || screen === 'home' ? 'home' : 'coach', undefined, { replace: true });
    },
    ownerSet: () => {
      const a = (document.getElementById('pin1').value || '').trim(), b = (document.getElementById('pin2').value || '').trim();
      if (!/^\d{4}$/.test(a)) return toast('4けたの数字を入れてください');
      if (a !== b) return toast('2回の入力が一致しません');
      try { localStorage.setItem(OWNER_KEY, JSON.stringify({ pin: pinHash(a) })); } catch (e) { return toast('保存できませんでした'); }
      ownerOK = true; toast('暗証番号を設定しました'); go('owner', undefined, { replace: true });
    },
    ownerLogin: () => {
      const od = ownerData(), a = (document.getElementById('pin1').value || '').trim();
      if (od && pinHash(a) === od.pin) { ownerOK = true; go('owner', undefined, { replace: true }); } else toast('暗証番号がちがいます');
    },
    ownerReset: () => {
      if ((document.getElementById('pinreset').value || '').trim() !== 'リセット') return toast('「リセット」と入力してください');
      try { localStorage.removeItem(OWNER_KEY); } catch (e) { /* そのまま */ }
      ownerOK = false; toast('暗証番号を消しました。新しく設定してください'); go('owner', undefined, { replace: true });
    },
    ownerChange: () => go('owner', 'change'),
    ownerSkill: (d) => go('ownerSkill', d.id, { replace: screen === 'ownerSkill' }),
    demoStart: () => {
      try { sessionStorage.setItem('manabi-step-demo', '1'); sessionStorage.setItem('manabi-step-demo-course', course); } catch (e) { return toast('この環境ではデモを使えません'); }
      location.reload();
    },
    demoExit: () => {
      try {
        Object.keys(localStorage).filter((k) => k.startsWith('manabi-demo-')).forEach((k) => localStorage.removeItem(k));
        const back = sessionStorage.getItem('manabi-step-demo-course');
        if (back) localStorage.setItem(COURSE_KEY, back); // デモ中に教科を切りかえても、もとの教科にもどす
        sessionStorage.removeItem('manabi-step-demo'); sessionStorage.removeItem('manabi-step-demo-course');
      } catch (e) { /* そのまま */ }
      location.reload();
    },
    ahead: () => {
      if (!st.goal) return;
      const b = addAhead();
      toast(`${b === 1 ? '明日' : b + '日先'}の分を、今日のメニューに追加しました`);
      const m = todayMenu(), i = m.tasks.findIndex((t, k) => !m.done[k]);
      go('home');
      if (i >= 0) { const el = document.querySelector(`[data-act=task][data-i="${i}"]`); if (el && el.scrollIntoView) el.scrollIntoView({ block: 'center' }); }
    },
    resumeDrop: () => { if (confirm('前回の続きを破棄しますか？')) { clearSession(); go('home', undefined, { replace: true }); } },
    // 目標の設定
    goalType: (d) => { readGoalForm(); G.type = d.k; go('goal', true); },
    goalDaily: (d) => { readGoalForm(); G.daily = Number(d.n); go('goal', true); },
    goalExName: (d) => { readGoalForm(); G.exam.name = d.n; go('goal', true); },
    goalUnit: (d) => {
      readGoalForm();
      const u = G.exam.units, i = u.indexOf(d.u);
      if (i >= 0) u.splice(i, 1); else u.push(d.u);
      go('goal', true);
    },
    goalBase: () => { readGoalForm(); G.exam.base = !G.exam.base; go('goal', true); },
    goalSave: () => {
      readGoalForm();
      if (G.type === 'exam') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(G.exam.date || '')) return toast('テストの日を入れてね');
        if (daysBetween(today(), G.exam.date) < 1) return toast('テストの日は明日以降にしてね');
        if (!G.exam.units.length) return toast('テスト範囲を1つ以上選んでね');
      }
      const g = { type: G.type, daily: G.daily };
      if (G.type === 'exam') g.exam = { name: G.exam.name, date: G.exam.date, units: SK.units.filter((u) => G.exam.units.includes(u.id)).map((u) => u.id), base: G.exam.base };
      st.goal = g; st.today = null; save(); G = null;
      checkBadges();
      toast('目標を決めました。今日のメニューを作りました！');
      go('home');
    },
    goalClear: () => {
      if (!confirm('目標の設定をやめますか？（学習の記録は消えません）')) return;
      st.goal = null; st.today = null; save(); G = null; go('home');
    },
    print: () => window.print(),
    memo: () => { if (memo.hidden) memoOpen(); else memoClose(); rerender(); },
    printOpen: (d) => { PR = printDefaults(d.skill ? { src: 'skill', skill: d.skill, back: d.back } : { back: d.back }); go('printSetup', true); },
    printSrc: (d) => { PR.src = d.k; go('printSetup', true); },
    printUnit: (d) => { const u = PR.units, i = u.indexOf(d.u); if (i >= 0) u.splice(i, 1); else u.push(d.u); go('printSetup', true); },
    printN: (d) => { PR.n = Number(d.n); go('printSetup', true); },
    printInc: (d) => { PR.inc[d.k] = !PR.inc[d.k]; go('printSetup', true); },
    printBack: () => go('printSetup', true),
    printMake: () => {
      if (!PR.inc.q && !PR.inc.a && !PR.inc.e) return toast('問題・解答・解説のどれかを選んでね');
      if (PR.src === 'units' && !PR.units.length) return toast('単元を1つ以上選んでね');
      PR.items = printItems();
      if (!PR.items.length) return toast('プリントにできる問題がありません');
      go('printPreview');
    },
    printNow: () => window.print(),
    export: exportFile,
    rename: () => go('setup'),
    resetStep: (d) => go('reset', Number(d.step)),
    doReset: () => {
      P = null; S = null; D = null;
      try { localStorage.removeItem(KEY); } catch (e) { /* 消せない環境でも画面上は初期化する */ }
      st = blank();
      toast('すべての記録を削除しました');
      go('setup');
    },
  };

  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-go]');
    if (g) { e.preventDefault(); return go(g.dataset.go); }
    const a = e.target.closest('[data-act]');
    if (a && ACT[a.dataset.act]) { e.preventDefault(); ACT[a.dataset.act](a.dataset); }
  });
  // PCのキーボードでも入力できるようにする
  document.addEventListener('keydown', (e) => {
    if ((screen !== 'practice' && screen !== 'diag') || !P) return;
    if (P.done) { if (e.key === 'Enter') next(); return; }
    if (P.q.choices || P.q.order) return;
    if (/^[0-9]$/.test(e.key)) key(e.key);
    else if (e.key === '-' || e.key === '.') key(e.key);
    else if (e.key === 'Backspace') key('back');
    else if (e.key === 'Tab') { e.preventDefault(); key('tab'); }
    else if (e.key === 'Enter') check();
  });

  // ブラウザ・スマホの「戻る」：学習中はその場にとどまり、それ以外はアプリ内の前の画面へ
  window.addEventListener('popstate', (e) => {
    if (SESSION(screen) && P && (P.mode === 'diag' ? D : S)) {
      try { history.pushState({ s: screen, a: null }, ''); } catch (err) { /* そのまま */ }
      return toast('学習中です。やめるときは左上の × を押してね（途中までの内容は保存されています）');
    }
    const t = e.state || { s: st.profile ? 'home' : 'setup', a: null };
    // その場でしか作れない画面（結果・プリント・問題）に戻ってきたときは、ホームへ
    const needs = { practice: false, diag: false, summary: !!S, printPreview: !!(PR && PR.items), diagResult: !!st.diag, diagReview: !!st.diag, plan: !!st.goal };
    const name = t.s in needs && !needs[t.s] ? 'home' : t.s;
    go(name, t.a, { pop: true });
  });

  // オフライン対応（http/https で開いたときだけ）
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  if (DEMO) {
    if (!st.profile) seedDemo();
    const bar = document.createElement('div');
    bar.id = 'demobar';
    bar.innerHTML = '<span>🔍 デモ表示中（本当の記録には影響しません）</span><button data-act="demoExit">終了</button>';
    document.body.prepend(bar);
    document.body.classList.add('demo');
  }
  if (st.profile && syncCards().length) save();
  go(st.profile ? 'home' : 'setup', undefined, { replace: true });
})();
