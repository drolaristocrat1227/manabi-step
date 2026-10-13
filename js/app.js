/*
 * まなびステップ 本体
 * データはこの端末の localStorage にだけ保存する。外部への送信は一切しない。
 */
(function () {
  'use strict';

  const SK = window.SKILLS;
  const KEY = 'manabi-step-v1';
  const PRACTICE_N = 5;
  const app = document.getElementById('app');
  const nav = document.getElementById('nav');

  // ---------- 保存 ----------
  const blank = () => ({ v: 1, profile: null, diag: null, skills: {}, log: [] });
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
  const pad = (n) => String(n).padStart(2, '0');
  const dayStr = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const today = () => dayStr(new Date());
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

  // 次におすすめのスキル（前提から順に）
  function recommend() {
    const L = SK.list;
    const isUntested1 = (s) => s.grade === 1 && sk(s.id).diag === 'untested';
    return L.find((s) => sk(s.id).score < 40 && !isUntested1(s))
      || L.find((s) => s.grade === 2 && sk(s.id).score < 70)
      || L.find((s) => sk(s.id).score < 70)
      || L.find((s) => sk(s.id).score < 90)
      || null;
  }

  // ---------- 画面切りかえ ----------
  let screen = 'home';
  function go(name, arg) {
    screen = name;
    window.scrollTo(0, 0);
    (SCREENS[name] || SCREENS.home)(arg);
    const inSession = name === 'practice' || name === 'diag';
    nav.hidden = !st.profile || inSession || name === 'setup';
    nav.querySelectorAll('[data-go]').forEach((b) => b.classList.toggle('on', b.dataset.go === name || (name === 'lesson' && b.dataset.go === 'map')));
  }
  const render = (html) => { app.innerHTML = html; };

  // ---------- 各画面 ----------
  const SCREENS = {};

  SCREENS.setup = function () {
    render(`
<section class="hero">
  <div class="logo">まなび<b>ステップ</b></div>
  <p>自分のペースで、一歩ずつ。</p>
</section>
<div class="card">
  <label class="lbl" for="nm">ニックネーム</label>
  <input id="nm" class="inp" maxlength="12" placeholder="例：たろう" autocomplete="off" value="${esc(st.profile ? st.profile.name : '')}">
  <p class="note">本名は入れなくてOK。</p>
  <div class="lbl">学年</div>
  <div class="seg">
    <button class="on">中学2年</button>
    <button disabled>中1<small>準備中</small></button><button disabled>中3<small>準備中</small></button><button disabled>小学生<small>準備中</small></button>
  </div>
  <div class="lbl">教科</div>
  <div class="subjects">
    <button class="subj on">📐<span>数学</span></button>
    <button class="subj" disabled>📖<span>国語</span><small>準備中</small></button>
    <button class="subj" disabled>🔬<span>理科</span><small>準備中</small></button>
    <button class="subj" disabled>🌏<span>社会</span><small>準備中</small></button>
    <button class="subj" disabled>🔤<span>英語</span><small>準備中</small></button>
  </div>
  <button class="btn primary big" data-act="start">はじめる</button>
</div>
<p class="privacy">🔒 記録はこの端末の中だけに保存され、外部には送信されません。</p>`);
  };

  SCREENS.home = function () {
    const p = st.profile, s = streak(), t = totals(today());
    const h = new Date().getHours();
    const hello = h < 11 ? 'おはよう' : h < 18 ? 'こんにちは' : 'こんばんは';
    const mastered = SK.list.filter((x) => sk(x.id).score >= 90).length;
    const total = SK.list.length;
    let main;
    if (!st.diag) {
      main = `<div class="card accent">
  <div class="tag">STEP 1</div>
  <h2>まずは実力チェック</h2>
  <p>今どこまでわかっているかを確かめて、あなた専用の学習の順番を作ります。約15分。</p>
  <button class="btn primary big" data-act="diagIntro">実力チェックをはじめる</button>
</div>`;
    } else {
      const r = recommend();
      main = r ? `<div class="card accent">
  <div class="tag">今日のおすすめ</div>
  <h2>${esc(r.name)}</h2>
  <p class="muted">${r.grade === 1 ? '中1の復習' : '中2'}・${esc(SK.unitById[r.unit].name)}　${stars(sk(r.id).score)}</p>
  <button class="btn primary big" data-act="lesson" data-id="${r.id}">はじめる（${PRACTICE_N}問）</button>
</div>` : `<div class="card accent"><h2>🎉 全スキル マスター！</h2><p>すごい！好きな単元で腕だめししよう。</p></div>`;
    }
    render(`
<div class="greet">${hello}、<b>${esc(p.name)}</b> さん</div>
<div class="stats">
  <div class="stat"><div class="v">🔥 ${s}</div><div class="k">日連続</div></div>
  <div class="stat"><div class="v">${t.q}</div><div class="k">今日の問題</div></div>
  <div class="stat"><div class="v">${mastered}<small>/${total}</small></div><div class="k">マスター</div></div>
</div>
${main}
<div class="card">
  <div class="row between"><b>全体の進み具合</b><span class="muted">${Math.round(SK.list.reduce((a, x) => a + sk(x.id).score, 0) / total)}%</span></div>
  <div class="bar"><i style="width:${Math.round(SK.list.reduce((a, x) => a + sk(x.id).score, 0) / total)}%"></i></div>
  ${SK.units.filter((u) => u.grade === 2).map((u) => {
    const avg = Math.round(u.skills.reduce((a, id) => a + sk(id).score, 0) / u.skills.length);
    return `<div class="mini"><span>${esc(u.name)}</span><div class="bar sm"><i style="width:${avg}%"></i></div></div>`;
  }).join('')}
</div>
<p class="tip">💡 ${pick(MSG.tips)}</p>`);
  };

  // ----- 実力チェック -----
  SCREENS.diagIntro = function () {
    render(`
<div class="card">
  <h2>実力チェック</h2>
  <ul class="list">
    <li>中2の内容から出題します。</li>
    <li>まちがえた単元は、<b>中1の内容にさかのぼって</b>確認します。</li>
    <li>成績ではありません。わからない問題は<b>「わからない」</b>を押してOK。</li>
    <li>結果をもとに、あなた専用の学習の順番を作ります。</li>
  </ul>
  <button class="btn primary big" data-act="diagStart">スタート</button>
  <button class="btn ghost" data-go="home">あとで</button>
</div>`);
  };

  let D = null; // 実力チェック中の状態
  function diagStart() {
    D = { queue: SK.list.filter((s) => s.grade === 2).map((s) => s.id), tested: {}, start: Date.now(), cur: null, items: [] };
    nextDiag();
  }
  function nextDiag() {
    while (D.queue.length && D.tested[D.queue[0]] !== undefined) D.queue.shift();
    if (!D.queue.length) return finishDiag();
    const id = D.queue[0];
    P = newQ({ mode: 'diag', skill: SK.byId[id] });
    go('diag');
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
    save();
    D = null;
    go('diagResult');
  }

  SCREENS.diagResult = function () {
    const res = st.diag.results;
    const ok = SK.list.filter((s) => res[s.id] === 'ok' || res[s.id] === 'inferred').length;
    const r = recommend();
    const mark = { ok: ['◎', 'できている', 'ok'], inferred: ['○', 'たぶんOK', 'inf'], ng: ['！', '復習しよう', 'ng'], untested: ['−', '未確認', 'un'] };
    render(`
<div class="card accent center">
  <div class="big-emoji">🎯</div>
  <h2>実力チェック完了！</h2>
  ${ok ? `<p>できていることが <b class="hl">${ok}個</b> 見つかりました。</p>` : '<p>おつかれさま！ここからが本当のスタート。<br>一歩ずつ、ぐんぐん伸ばしていこう！</p>'}
  <p class="muted">「！」の単元を伸ばしていけば、もっと解けるようになります。</p>
</div>
${SK.units.map((u) => `
<div class="card">
  <div class="unit-h">${u.grade === 1 ? '中1' : '中2'}・${esc(u.name)}</div>
  ${u.skills.map((id) => { const m = mark[res[id]]; return `<div class="res ${m[2]}"><span class="mk">${m[0]}</span><span class="nm">${esc(SK.byId[id].name)}</span><span class="st">${m[1]}</span></div>`; }).join('')}
</div>`).join('')}
${st.diag.items && st.diag.items.length ? `<div class="card">
  <b>答えと解説</b>
  <p class="muted small">見たいときだけ確認できます。</p>
  <div class="row"><button class="btn soft" data-act="review" data-f="all">全問（${st.diag.items.length}問）</button>
  <button class="btn soft" data-act="review" data-f="ng">まちがえた問題（${st.diag.items.filter((x) => !x.ok).length}問）</button></div>
</div>` : ''}
${r ? `<div class="card"><div class="tag">まずはここから</div><h3>${esc(r.name)}</h3><button class="btn primary big" data-act="lesson" data-id="${r.id}">学習をはじめる</button></div>` : ''}
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
  <div class="rv-h"><span class="mk">${x.ok ? '⭕' : '❌'}</span><span class="muted small">第${x.no}問・${s.grade === 1 ? '中1' : '中2'}・${esc(s.name)}</span></div>
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
    render(`
<h1 class="page-h">単元マップ</h1>
<p class="muted small">★1：基本OK　★2：しっかり　★3：マスター</p>
${[2, 1].map((g) => `
<h2 class="grade-h">${g === 2 ? '中学2年' : '中学1年（復習）'}</h2>
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
  <div class="muted small">${s.grade === 1 ? '中1' : '中2'}・${esc(SK.unitById[s.unit].name)}</div>
  <h2>${esc(s.name)}</h2>
  <div>${stars(o.score)} <span class="muted small">${o.q ? `これまで ${o.c}/${o.q} 問正解` : 'まだ練習していません'}</span></div>
</div>
${pre.length ? `<div class="card warn">💡 先に <b>${pre.map((p) => esc(SK.byId[p].name)).join('、')}</b> を練習すると、もっとわかりやすくなるよ。
  <div class="row">${pre.map((p) => `<button class="btn small" data-act="lesson" data-id="${p}">${esc(SK.byId[p].name)}へ</button>`).join('')}</div></div>` : ''}
<div class="card lesson"><div class="tag">ポイント</div>${s.lesson}</div>
<button class="btn primary big" data-act="practice" data-id="${id}">練習する（${PRACTICE_N}問）</button>`);
  };

  // ----- 問題（練習・実力チェック共通） -----
  let P = null;
  function newQ(base) {
    const q = base.skill.gen();
    const slots = [];
    (q.fields || []).forEach((f, k) => {
      if (f.frac) slots.push({ k, part: 'd' }, { k, part: 'n' });
      else slots.push({ k });
    });
    return Object.assign(base, { q, slots, inputs: slots.map(() => ''), active: 0, hint: 0, tries: 0, done: false, feedback: null });
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
  function practiceStart(id) {
    S = { skill: SK.byId[id], i: 0, results: [], start: Date.now(), before: sk(id).score };
    P = newQ({ mode: 'practice', skill: S.skill });
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
<div class="muted small">${P.skill.grade === 1 ? '中1さかのぼり' : '中2'}・${esc(SK.unitById[P.skill.unit].name)}</div>`;
    } else {
      head = `<div class="qhead"><button class="x" data-act="quitPractice" aria-label="やめる">×</button>
<div class="dots">${Array.from({ length: PRACTICE_N }, (_, k) => `<i class="${k < S.results.length ? (S.results[k] ? 'ok' : 'ng') : k === S.i ? 'cur' : ''}"></i>`).join('')}</div>
<span>${S.i + 1}/${PRACTICE_N}</span></div>
<div class="muted small">${esc(P.skill.name)}</div>`;
    }
    const body = `<div class="card qcard"><div class="q">${q.q}</div>${q.form ? `<div class="form">答えの形：${q.form}</div>` : ''}</div>`;
    let input = '';
    if (q.choices) {
      input = `<div class="choices">${q.choices.map((c, k) => {
        let cls = '';
        if (P.done) cls = k === q.correct ? 'ok' : P.picked === k ? 'ng' : '';
        else if (P.wrongPicks && P.wrongPicks.includes(k)) cls = 'ng';
        return `<button class="choice ${cls}" data-act="choose" data-k="${k}" ${P.done || cls ? 'disabled' : ''}>${c}</button>`;
      }).join('')}</div>`;
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
      actions = `<button class="btn primary big" data-act="next">${isDiag ? '次へ' : S.i + 1 >= PRACTICE_N ? '結果を見る' : '次の問題へ'}</button>`;
    } else if (isDiag) {
      actions = `${q.choices ? '' : '<button class="btn primary big" data-act="check">答える</button>'}<button class="btn ghost" data-act="dunno">わからない</button>`;
    } else {
      actions = `${q.choices ? '' : '<button class="btn primary big" data-act="check">答え合わせ</button>'}
<div class="row">${P.hint < q.hints.length ? `<button class="btn soft" data-act="hint">💡 ヒント（${P.hint + 1}/${q.hints.length}）</button>` : ''}<button class="btn soft" data-act="reveal">答えを見る</button></div>`;
    }
    // 「もう一度」の声かけは問題のすぐ下、正解・解説は入力欄の下に出す
    return P.done ? head + body + hints + input + fb + actions : head + body + fb + hints + input + actions;
  }

  function keypadHTML() {
    const keys = ['7', '8', '9', 'back', '4', '5', '6', '-', '1', '2', '3', 'tab', '0', 'clr'];
    const label = { back: '⌫', '-': '−', clr: 'C', tab: '次の欄 →' };
    const multi = P.slots.length > 1;
    return `<div class="keypad">${keys.map((k) => (k === 'tab' && !multi ? '<span></span>' :
      `<button class="key ${/\d/.test(k) ? '' : 'fn'} ${k === '0' || k === 'clr' ? 'wide' : ''}" data-act="key" data-k="${k}">${label[k] || k}</button>`)).join('')}</div>`;
  }

  SCREENS.practice = SCREENS.diag = function () { render(questionHTML()); };
  const rerender = () => render(questionHTML());

  function key(k) {
    if (P.done) return;
    let v = P.inputs[P.active];
    if (k === 'back') v = v.slice(0, -1);
    else if (k === 'clr') v = '';
    else if (k === 'tab') { P.active = (P.active + 1) % P.inputs.length; return rerender(); }
    else if (k === '-') v = v.startsWith('-') ? v.slice(1) : '-' + v;
    else if (/^\d$/.test(k) && v.length < 6) v += k;
    P.inputs[P.active] = v;
    rerender();
  }

  function check() {
    const q = P.q;
    const empty = P.inputs.findIndex((v) => v.replace('-', '') === '');
    if (empty >= 0) {
      P.active = empty; rerender();
      return toast('「' + slotName(empty) + '」を入力してね');
    }
    const bad = q.fields.findIndex((f, k) => SK.parseAnswer(fieldValue(k)) === null);
    if (bad >= 0) return toast('分母に 0 は使えないよ');
    judge(q.fields.every((f, k) => SK.sameValue(fieldValue(k), q.answer[k])));
  }

  function choose(k) {
    P.picked = k;
    judge(k === P.q.correct);
  }

  function answerText() {
    const q = P.q;
    if (q.choices) return q.choices[q.correct];
    return q.fields.map((f, k) => `${esc(f.label)} <b>${fmtVal(q.answer[k])}</b>${esc(f.post || '')}`).join('　');
  }
  function userText() {
    const q = P.q;
    if (q.choices) return P.picked === undefined ? '' : q.choices[P.picked];
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
      P.feedback = { type: 'ok', html: `<div class="fb-h">⭕ ${pick(clean ? MSG.ok : MSG.okHint)}</div><details><summary>解き方を確認</summary>${P.q.explain}</details>` };
    } else if (P.tries === 0) {
      P.tries = 1;
      if (P.q.choices) { P.wrongPicks = [P.picked]; }
      if (P.hint === 0) P.hint = 1;
      P.feedback = { type: 'retry', html: `<div class="fb-h">🤔 ${pick(MSG.retry)}</div>` };
    } else {
      reveal(true);
      return;
    }
    rerender();
  }

  function reveal(afterWrong) {
    finishQ(false, -5);
    P.feedback = { type: 'ng', html: `<div class="fb-h">📘 ${pick(MSG.giveup)}</div><div class="ans">答え：${answerText()}</div><div class="exp">${P.q.explain}</div>` };
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
    if (S.i >= PRACTICE_N) return finishPractice();
    P = newQ({ mode: 'practice', skill: S.skill });
    rerender();
    window.scrollTo(0, 0);
  }

  function finishPractice() {
    const c = S.results.filter(Boolean).length, sec = Math.round((Date.now() - S.start) / 1000);
    st.log.push({ d: today(), t: Date.now(), mode: 'practice', skill: S.skill.id, q: S.results.length, c, sec });
    save();
    go('summary');
  }

  SCREENS.summary = function () {
    const c = S.results.filter(Boolean).length, n = S.results.length;
    const after = sk(S.skill.id).score, before = S.before;
    const up = starsOf(after) > starsOf(before);
    const msg = c === n ? '全問正解！完ぺきです！' : c >= n - 1 ? 'すばらしい！あと少しで完ぺき！' : c >= n / 2 ? 'いい調子！くり返すともっと伸びるよ' : 'チャレンジしたことが一番大事。解説を見て、もう1セットやってみよう';
    const r = recommend();
    render(`
<div class="card accent center">
  <div class="big-emoji">${c === n ? '🏆' : c >= n / 2 ? '✨' : '🌱'}</div>
  <h2>${c} / ${n} 問正解</h2>
  <p>${msg}</p>
  ${up ? `<div class="levelup">⭐ レベルアップ！ ${stars(after)}</div>` : `<div>${stars(after)}</div>`}
  <div class="bar"><i style="width:${after}%"></i></div>
  <p class="muted small">${esc(S.skill.name)}　習熟度 ${after > before ? `${before} → <b>${after}</b>` : after}</p>
  <p class="muted small">🔥 ${streak()}日連続で学習中</p>
</div>
<button class="btn primary big" data-act="practice" data-id="${S.skill.id}">もう1セット</button>
${r && r.id !== S.skill.id ? `<button class="btn soft big" data-act="lesson" data-id="${r.id}">次のおすすめ：${esc(r.name)}</button>` : ''}
<button class="btn ghost" data-go="home">ホームへ</button>`);
  };

  // ----- 学習記録 -----
  SCREENS.records = function () {
    const all = totals(), s = streak();
    const days = []; const d = new Date(); d.setDate(d.getDate() - 13);
    for (let i = 0; i < 14; i++) { const k = dayStr(d); days.push({ k, label: (d.getMonth() + 1) + '/' + d.getDate(), q: totals(k).q }); d.setDate(d.getDate() + 1); }
    const max = Math.max(5, ...days.map((x) => x.q));
    const practiced = SK.list.filter((x) => sk(x.id).q > 0 || sk(x.id).diag);
    const logs = st.log.slice().reverse().slice(0, 30);
    render(`
<h1 class="page-h">学習の記録</h1>
<div class="print-only print-head">まなびステップ 学習記録　${esc(st.profile.name)} さん（中学2年・数学）　${today()} 出力</div>
<div class="stats">
  <div class="stat"><div class="v">🔥 ${s}</div><div class="k">日連続</div></div>
  <div class="stat"><div class="v">${all.q}</div><div class="k">解いた問題</div></div>
  <div class="stat"><div class="v">${all.q ? Math.round((all.c / all.q) * 100) : 0}%</div><div class="k">正答率</div></div>
  <div class="stat"><div class="v">${fmtMin(all.sec)}</div><div class="k">学習時間</div></div>
</div>
<div class="card">
  <b>この2週間</b>
  <div class="chart">${days.map((x) => `<div class="col"><div class="b" style="height:${Math.round((x.q / max) * 100)}%" title="${x.q}問"></div><span>${x.label.split('/')[1]}</span></div>`).join('')}</div>
</div>
<div class="card">
  <b>スキルの伸び</b>
  ${practiced.length ? `<table class="tbl"><tr><th>スキル</th><th>チェック時</th><th>今</th></tr>
  ${practiced.map((x) => { const o = sk(x.id); return `<tr><td>${esc(x.name)}</td><td>${o.diagScore !== undefined ? stars(o.diagScore) : '−'}</td><td>${stars(o.score)}</td></tr>`; }).join('')}</table>` : '<p class="muted">まだ記録がありません</p>'}
</div>
<div class="card">
  <b>最近の学習</b>
  ${logs.length ? logs.map((l) => `<div class="log"><span class="muted">${l.d.slice(5).replace('-', '/')}</span><span>${l.mode === 'diag' ? '実力チェック' : esc(SK.byId[l.skill] ? SK.byId[l.skill].name : '')}</span><span>${l.c}/${l.q}</span></div>`).join('') : '<p class="muted">まだ記録がありません</p>'}
</div>
<div class="card no-print">
  <b>保存・出力</b>
  <button class="btn soft" data-act="print">🖨 印刷 / PDFで保存</button>
  <button class="btn soft" data-act="export">💾 バックアップを保存（ファイル）</button>
  <label class="btn soft">📂 バックアップから復元<input type="file" accept=".json,application/json" id="imp" hidden></label>
  <p class="note">機種変更のときは、バックアップファイルを新しい端末で復元してください。</p>
</div>
<div class="card no-print">
  <b>設定</b>
  <button class="btn soft" data-act="rename">ニックネームを変更</button>
  ${st.diag ? '<button class="btn soft" data-go="diagResult">前回の実力チェックの結果・解説</button>' : ''}
  <button class="btn soft" data-act="diagIntro">実力チェックをやり直す</button>
</div>
<p class="privacy no-print">🔒 記録はこの端末の中だけに保存され、外部には送信されません。</p>
<details class="more no-print"><summary>その他</summary><button class="linkish" data-go="reset">データの初期化</button></details>`);
    const imp = document.getElementById('imp');
    if (imp) imp.addEventListener('change', importFile);
  };

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
  <p>この端末に保存されている、次のデータをすべて削除して最初の状態に戻します。</p>
  <ul class="list">
    <li>ニックネーム（${esc(st.profile ? st.profile.name : '')}）</li>
    <li>実力チェックの結果</li>
    <li>学習の記録（${t.q}問・${streak()}日連続）</li>
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
    const blob = new Blob([JSON.stringify(st, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manabi-backup-' + today() + '.json';
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
      if (st.profile) st.profile.name = name;
      else st.profile = { name, grade: '中2', subject: 'math', created: today() };
      save(); go('home');
    },
    diagIntro: () => go('diagIntro'),
    diagStart,
    lesson: (d) => go('lesson', d.id),
    practice: (d) => practiceStart(d.id),
    key: (d) => key(d.k),
    focus: (d) => { if (!P.done) { P.active = Number(d.k); rerender(); } },
    check,
    choose: (d) => { if (!P.done) choose(Number(d.k)); },
    hint: () => { P.hint = Math.min(P.hint + 1, P.q.hints.length); rerender(); },
    reveal: () => reveal(false),
    dunno: () => { log1(false); diagRecord(false, true); diagAnswer(false); },
    review: (d) => go('diagReview', d.f || 'all'),
    next,
    quitPractice: () => { if (confirm('練習をやめますか？（ここまでの結果は残ります）')) { if (S.results.length) finishPractice(); else go('lesson', S.skill.id); } },
    quitDiag: () => { if (confirm('実力チェックをやめますか？（結果は保存されません）')) { D = null; go('home'); } },
    print: () => window.print(),
    export: exportFile,
    rename: () => go('setup'),
    resetStep: (d) => go('reset', Number(d.step)),
    doReset: () => {
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
    if (P.q.choices) return;
    if (/^[0-9]$/.test(e.key)) key(e.key);
    else if (e.key === '-') key('-');
    else if (e.key === 'Backspace') key('back');
    else if (e.key === 'Tab') { e.preventDefault(); key('tab'); }
    else if (e.key === 'Enter') check();
  });

  // オフライン対応（http/https で開いたときだけ）
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  go(st.profile ? 'home' : 'setup');
})();
