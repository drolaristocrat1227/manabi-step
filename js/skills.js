/*
 * 中2数学 スキル定義（数と式・関数・図形・データ・確率）
 * 問題はすべてプログラムで自動生成し、答えは計算で求める（正解の誤りが起きない）。
 * prereq は「その前に身についていてほしいスキル」。実力チェックのさかのぼりと学習順に使う。
 */
(function (root) {
  'use strict';

  // ---------- 小道具 ----------
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const RNZ = (a, b) => { let v; do { v = R(a, b); } while (v === 0); return v; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
  const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const COEF = [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6];
  const SUP = ['', '', '²', '³', '⁴'];

  const num = (n) => (n < 0 ? '−' + (-n) : String(n));
  const cv = (c, v) => poly([[c, v]]); // 係数つきの項（1x → x）
  const par = (n) => (n < 0 ? '(' + num(n) + ')' : num(n));

  // [[係数, 文字], ...] → "3x − y + 5"
  function poly(terms) {
    let s = '';
    terms.forEach(([c, v]) => {
      if (c === 0) return;
      const a = Math.abs(c);
      const body = v && a === 1 ? v : a + v;
      if (s === '') s = (c < 0 ? '−' : '') + body;
      else s += (c < 0 ? ' − ' : ' + ') + body;
    });
    return s || '0';
  }

  // 約分した分数（HTML）
  function F(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    if (d === 1) return num(n);
    return (n < 0 ? '−' : '') + '<span class="fr"><span>' + Math.abs(n) + '</span><span>' + d + '</span></span>';
  }
  // 約分した分数（答え用の文字列）
  function FS(n, d) {
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d); n /= g; d /= g;
    return d === 1 ? String(n) : n + '/' + d;
  }

  // 単項式  c x^ex y^ey
  function mono(c, ex, ey) {
    if (ex === 0 && ey === 0) return num(c);
    const head = c === 1 ? '' : c === -1 ? '−' : num(c);
    return head + (ex ? 'x' + SUP[ex] : '') + (ey ? 'y' + SUP[ey] : '');
  }
  const monoP = (c, ex, ey) => (c < 0 ? '(' + mono(c, ex, ey) + ')' : mono(c, ex, ey));

  const sys = (l1, l2) => '<div class="sys"><div>' + l1 + '</div><div>' + l2 + '</div></div>';
  const steps = (arr) => arr.join('<br>');

  const FORM_LIN = 'y = <b>□</b>x + <b>□</b>（例：y = 2x − 3 なら 2 と −3）';
  const FORM_XC = '<b>□</b>x + <b>□</b>（例：2x − 3 なら 2 と −3）';
  const FORM_XY = '<b>□</b>x + <b>□</b>y（例：2x − y なら 2 と −1）';
  const FORM_FRAC = '分数は <b>①分母 → ②分子</b> の順に入れよう（約分した形で）';

  // ---------- スキル ----------
  const list = [];
  const add = (s) => list.push(s);

  // ===== 中1 正負の数 =====
  add({
    id: 's1_addsub', unit: 'u1_num', name: '正負の数のたし算・ひき算', prereq: [],
    lesson: `<p class="pt">ひき算は「ひく数の符号を変えて、たし算」にできる。</p>
<p class="pt">同じ符号どうし → 絶対値をたして、その符号<br>ちがう符号どうし → 絶対値の大きい方から小さい方をひいて、大きい方の符号</p>
<div class="ex">例）−3 − (−5) = −3 + (+5) = 2</div>`,
    gen() {
      const a = RNZ(-9, 9), b = RNZ(-9, 9), plus = Math.random() < 0.5;
      const ans = plus ? a + b : a - b;
      const op = plus ? '+' : '−';
      return {
        q: `${num(a)} ${op} ${par(b)}`,
        fields: [{ label: '答え' }], answer: [ans],
        hints: [
          plus ? '符号が同じか、ちがうかを見てみよう。' : 'ひき算は「ひく数の符号を変えて、たし算」にできるよ。',
          `${num(a)} + ${par(plus ? b : -b)} と考えよう。`,
        ],
        explain: steps([`${num(a)} ${op} ${par(b)}`, `= ${num(a)} + ${par(plus ? b : -b)}`, `= ${num(ans)}`]),
      };
    },
  });

  add({
    id: 's1_muldiv', unit: 'u1_num', name: '正負の数のかけ算・わり算', prereq: ['s1_addsub'],
    lesson: `<p class="pt">答えの符号は、負の数が<b>奇数個ならマイナス</b>、<b>偶数個ならプラス</b>。</p>
<p class="pt">符号を決めたら、あとは絶対値どうしで計算する。</p>
<div class="ex">例）(−4) × 3 = −12　　(−12) ÷ (−3) = 4</div>`,
    gen() {
      if (Math.random() < 0.5) {
        const a = RNZ(-9, 9), b = RNZ(-9, 9), ans = a * b;
        return {
          q: `${par(a)} × ${par(b)}`, fields: [{ label: '答え' }], answer: [ans],
          hints: ['負の数がいくつあるか数えて、まず符号を決めよう。', `符号は ${ans < 0 ? 'マイナス' : 'プラス'}。あとは ${Math.abs(a)} × ${Math.abs(b)}。`],
          explain: steps([`符号：負の数が${(a < 0) + (b < 0)}個 → ${ans < 0 ? '−' : '+'}`, `${Math.abs(a)} × ${Math.abs(b)} = ${Math.abs(ans)}`, `答え ${num(ans)}`]),
        };
      }
      const b = RNZ(-9, 9), c = RNZ(-9, 9), a = b * c;
      return {
        q: `${par(a)} ÷ ${par(b)}`, fields: [{ label: '答え' }], answer: [c],
        hints: ['わり算も、符号のルールはかけ算と同じだよ。', `符号は ${c < 0 ? 'マイナス' : 'プラス'}。あとは ${Math.abs(a)} ÷ ${Math.abs(b)}。`],
        explain: steps([`符号：負の数が${(a < 0) + (b < 0)}個 → ${c < 0 ? '−' : '+'}`, `${Math.abs(a)} ÷ ${Math.abs(b)} = ${Math.abs(c)}`, `答え ${num(c)}`]),
      };
    },
  });

  add({
    id: 's1_mixed', unit: 'u1_num', name: '四則の混じった計算', prereq: ['s1_addsub', 's1_muldiv'],
    lesson: `<p class="pt">計算の順番：<b>かっこの中 → かけ算・わり算 → たし算・ひき算</b></p>
<div class="ex">例）5 − (−2) × 3 = 5 − (−6) = 11</div>`,
    gen() {
      const a = RNZ(-9, 9), b = RNZ(-5, 5), c = RNZ(-5, 5), t = R(0, 2);
      if (t === 2) {
        const ans = (a + b) * c;
        return {
          q: `(${num(a)} + ${par(b)}) × ${par(c)}`, fields: [{ label: '答え' }], answer: [ans],
          hints: ['かっこの中を先に計算しよう。', `かっこの中は ${num(a + b)}。`],
          explain: steps([`(${num(a)} + ${par(b)}) × ${par(c)}`, `= ${par(a + b)} × ${par(c)}`, `= ${num(ans)}`]),
        };
      }
      const plus = t === 0, m = b * c, ans = plus ? a + m : a - m, op = plus ? '+' : '−';
      return {
        q: `${num(a)} ${op} ${par(b)} × ${par(c)}`, fields: [{ label: '答え' }], answer: [ans],
        hints: ['かけ算を先に計算しよう。', `${par(b)} × ${par(c)} = ${num(m)}`],
        explain: steps([`${num(a)} ${op} ${par(b)} × ${par(c)}`, `= ${num(a)} ${op} ${par(m)}`, `= ${num(ans)}`]),
      };
    },
  });

  // ===== 中1 文字と式 =====
  add({
    id: 's1_subst', unit: 'u1_expr', name: '式の値（代入）', prereq: ['s1_muldiv'],
    lesson: `<p class="pt">文字に数をあてはめることを<b>代入</b>という。</p>
<p class="pt">負の数を代入するときは<b>かっこをつける</b>。</p>
<div class="ex">例）x = −3 のとき 2x − 5 = 2 × (−3) − 5 = −11</div>`,
    gen() {
      const x = RNZ(-5, 5), c0 = RNZ(-9, 9);
      if (Math.random() < 0.3) {
        const ans = x * x + c0;
        return {
          q: `x = ${num(x)} のとき、${poly([[1, 'x²'], [c0, '']])} の値`, fields: [{ label: '答え' }], answer: [ans],
          hints: ['x² は x × x のこと。', `${par(x)} × ${par(x)} = ${num(x * x)}`],
          explain: steps([`${par(x)}² ${c0 < 0 ? '−' : '+'} ${Math.abs(c0)}`, `= ${num(x * x)} ${c0 < 0 ? '−' : '+'} ${Math.abs(c0)}`, `= ${num(ans)}`]),
        };
      }
      const c1 = pick(COEF), ans = c1 * x + c0;
      return {
        q: `x = ${num(x)} のとき、${poly([[c1, 'x'], [c0, '']])} の値`, fields: [{ label: '答え' }], answer: [ans],
        hints: ['x のところに数を入れよう。負の数はかっこをつけて。', `${num(c1)} × ${par(x)} ${c0 < 0 ? '−' : '+'} ${Math.abs(c0)}`],
        explain: steps([`${num(c1)} × ${par(x)} ${c0 < 0 ? '−' : '+'} ${Math.abs(c0)}`, `= ${num(c1 * x)} ${c0 < 0 ? '−' : '+'} ${Math.abs(c0)}`, `= ${num(ans)}`]),
      };
    },
  });

  add({
    id: 's1_linexpr', unit: 'u1_expr', name: '一次式の計算', prereq: ['s1_addsub'],
    lesson: `<p class="pt">x の項どうし、数の項どうしをまとめる。</p>
<p class="pt">かっこの前が <b>−</b> のときは、かっこの中の<b>符号がすべて変わる</b>。</p>
<div class="ex">例）(3x + 2) − (x − 4) = 3x + 2 − x + 4 = 2x + 6</div>`,
    gen() {
      const a = RNZ(-6, 6), b = RNZ(-9, 9), c = RNZ(-6, 6), d = RNZ(-9, 9);
      if (Math.random() < 0.35) {
        const k = pick(COEF);
        return {
          q: `${num(k)}(${poly([[a, 'x'], [b, '']])})`, form: FORM_XC,
          fields: [{ label: 'x の係数' }, { label: '数の項' }], answer: [k * a, k * b],
          hints: ['かっこの外の数を、中の<b>それぞれの項</b>にかけよう（分配法則）。', `${num(k)} × ${a < 0 ? '(' + poly([[a, 'x']]) + ')' : poly([[a, 'x']])} と ${num(k)} × ${par(b)}`],
          explain: steps([`${num(k)}(${poly([[a, 'x'], [b, '']])})`, `= ${poly([[k * a, 'x'], [k * b, '']])}`]),
        };
      }
      const plus = Math.random() < 0.5, s = plus ? 1 : -1;
      const ax = a + s * c, bx = b + s * d;
      return {
        q: `(${poly([[a, 'x'], [b, '']])}) ${plus ? '+' : '−'} (${poly([[c, 'x'], [d, '']])})`, form: FORM_XC,
        fields: [{ label: 'x の係数' }, { label: '数の項' }], answer: [ax, bx],
        hints: [plus ? 'かっこをそのまま外して、x の項どうし・数の項どうしをまとめよう。' : 'かっこの前が − なので、後ろのかっこの中の符号がすべて変わるよ。',
          `かっこを外すと ${poly([[a, 'x'], [b, ''], [s * c, 'x'], [s * d, '']])}`],
        explain: steps([`= ${poly([[a, 'x'], [b, ''], [s * c, 'x'], [s * d, '']])}`, `= ${poly([[ax, 'x'], [bx, '']])}`]),
      };
    },
  });

  // ===== 中1 一次方程式 =====
  add({
    id: 's1_eq_basic', unit: 'u1_eq', name: '一次方程式（基本）', prereq: ['s1_mixed'],
    lesson: `<p class="pt">項を反対の辺へ移すことを<b>移項</b>という。移項すると<b>符号が変わる</b>。</p>
<p class="pt">最後に両辺を x の係数でわる。</p>
<div class="ex">例）3x + 5 = −7 → 3x = −7 − 5 → 3x = −12 → x = −4</div>`,
    gen() {
      const x = RNZ(-9, 9), a = pick(COEF), b = RNZ(-9, 9), c = a * x + b;
      return {
        q: `${poly([[a, 'x'], [b, '']])} = ${num(c)}`, fields: [{ label: 'x =' }], answer: [x],
        hints: [`${b < 0 ? '−' : '+'}${Math.abs(b)} を右辺に移項しよう（符号が変わる）。`, `${cv(a, 'x')} = ${num(c - b)}　→ 両辺を ${num(a)} でわる。`],
        explain: steps([`${cv(a, 'x')} = ${num(c)} ${b < 0 ? '+' : '−'} ${Math.abs(b)}`, `${cv(a, 'x')} = ${num(c - b)}`, `x = ${num(x)}`]),
      };
    },
  });

  add({
    id: 's1_eq_both', unit: 'u1_eq', name: '一次方程式（両辺に x）', prereq: ['s1_eq_basic'],
    lesson: `<p class="pt">x の項は<b>左辺</b>へ、数の項は<b>右辺</b>へ移項して整理する。</p>
<div class="ex">例）5x − 3 = 2x + 9 → 5x − 2x = 9 + 3 → 3x = 12 → x = 4</div>`,
    gen() {
      const x = RNZ(-8, 8);
      let a, c; do { a = pick(COEF); c = pick(COEF); } while (a === c);
      const b = RNZ(-9, 9), d = a * x + b - c * x;
      return {
        q: `${poly([[a, 'x'], [b, '']])} = ${poly([[c, 'x'], [d, '']])}`, fields: [{ label: 'x =' }], answer: [x],
        hints: ['x の項を左辺、数の項を右辺に移項しよう。', `${cv(a - c, 'x')} = ${num(d - b)}`],
        explain: steps([`${poly([[a, 'x'], [-c, 'x']])} = ${num(d)} ${b < 0 ? '+' : '−'} ${Math.abs(b)}`, `${cv(a - c, 'x')} = ${num(d - b)}`, `x = ${num(x)}`]),
      };
    },
  });

  add({
    id: 's1_eq_paren', unit: 'u1_eq', name: '一次方程式（かっこあり）', prereq: ['s1_eq_both', 's1_linexpr'],
    lesson: `<p class="pt">まず<b>かっこを外して</b>から、移項して解く。</p>
<div class="ex">例）2(x + 3) = x + 10 → 2x + 6 = x + 10 → x = 4</div>`,
    gen() {
      const m = pick(COEF), b = RNZ(-6, 6), x = RNZ(-6, 6);
      let c; do { c = pick([-3, -2, -1, 1, 2, 3]); } while (c === m);
      const d = m * (x + b) - c * x;
      return {
        q: `${num(m)}(${poly([[1, 'x'], [b, '']])}) = ${poly([[c, 'x'], [d, '']])}`, fields: [{ label: 'x =' }], answer: [x],
        hints: [`かっこを外すと ${poly([[m, 'x'], [m * b, '']])} になるよ。`, `移項して整理すると ${cv(m - c, 'x')} = ${num(d - m * b)}`],
        explain: steps([`${poly([[m, 'x'], [m * b, '']])} = ${poly([[c, 'x'], [d, '']])}`, `${cv(m - c, 'x')} = ${num(d - m * b)}`, `x = ${num(x)}`]),
      };
    },
  });

  // ===== 中1 比例と反比例 =====
  add({
    id: 's1_prop', unit: 'u1_func', name: '比例', prereq: ['s1_muldiv'],
    lesson: `<p class="pt">y が x に比例するとき、式は <b>y = ax</b>（a は比例定数）。</p>
<p class="pt">x と y の値を1組代入すれば a が求まる。</p>
<div class="ex">例）x = 2 のとき y = −6 → −6 = a × 2 → a = −3</div>`,
    gen() {
      const a = RNZ(-6, 6), p = RNZ(-5, 5), q = a * p;
      let r; do { r = RNZ(-6, 6); } while (r === p);
      return {
        q: `y は x に比例し、x = ${num(p)} のとき y = ${num(q)} です。`,
        fields: [{ label: '比例定数 a =' }, { label: `x = ${num(r)} のとき y =` }], answer: [a, a * r],
        hints: [`y = ax に x = ${num(p)}、y = ${num(q)} を代入しよう。`, `${num(q)} = a × ${par(p)} → a = ${num(a)}。式は y = ${poly([[a, 'x']])}`],
        explain: steps([`${num(q)} = a × ${par(p)} より a = ${num(a)}`, `y = ${poly([[a, 'x']])} に x = ${num(r)} を代入`, `y = ${num(a)} × ${par(r)} = ${num(a * r)}`]),
      };
    },
  });

  add({
    id: 's1_inv', unit: 'u1_func', name: '反比例', prereq: ['s1_prop'],
    lesson: `<p class="pt">y が x に反比例するとき、式は <b>y = a/x</b>。</p>
<p class="pt"><b>a = x × y</b> で比例定数が求まる。</p>
<div class="ex">例）x = 3 のとき y = 4 → a = 3 × 4 = 12 → y = 12/x</div>`,
    gen() {
      const a = pick([6, 8, 12, 18, 24, 36]) * pick([1, -1]);
      const divs = []; for (let i = 1; i <= Math.abs(a); i++) if (a % i === 0) { divs.push(i, -i); }
      const p = pick(divs.filter((v) => Math.abs(v) <= 9)); let r; do { r = pick(divs.filter((v) => Math.abs(v) <= 12)); } while (r === p);
      return {
        q: `y は x に反比例し、x = ${num(p)} のとき y = ${num(a / p)} です。`,
        fields: [{ label: '比例定数 a =' }, { label: `x = ${num(r)} のとき y =` }], answer: [a, a / r],
        hints: ['反比例では a = x × y だよ。', `a = ${par(p)} × ${par(a / p)} = ${num(a)}。式は y = ${num(a)}/x`],
        explain: steps([`a = ${par(p)} × ${par(a / p)} = ${num(a)}`, `y = ${F(a, 1)} ÷ ${par(r)} = ${num(a / r)}`]),
      };
    },
  });

  // ===== 中2 式の計算 =====
  add({
    id: 's2_poly', unit: 'u2_expr', name: '多項式の加法・減法', prereq: ['s1_linexpr'],
    lesson: `<p class="pt">x の項どうし、y の項どうし（<b>同類項</b>）をまとめる。</p>
<p class="pt">数×（かっこ）は分配法則で外す。かっこの前が − なら符号が変わる。</p>
<div class="ex">例）2(3x − y) − 3(x + 2y) = 6x − 2y − 3x − 6y = 3x − 8y</div>`,
    gen() {
      const a = RNZ(-6, 6), b = RNZ(-6, 6), c = RNZ(-6, 6), d = RNZ(-6, 6);
      let k1 = 1, k2 = pick([1, -1]);
      if (Math.random() < 0.5) { k1 = pick([2, 3, 4]); k2 = pick([-4, -3, -2, 2, 3]); }
      const X = k1 * a + k2 * c, Y = k1 * b + k2 * d;
      const L = (k1 === 1 ? '' : num(k1)) + `(${poly([[a, 'x'], [b, 'y']])})`;
      const Rr = (Math.abs(k2) === 1 ? '' : Math.abs(k2)) + `(${poly([[c, 'x'], [d, 'y']])})`;
      return {
        q: `${L} ${k2 < 0 ? '−' : '+'} ${Rr}`, form: FORM_XY,
        fields: [{ label: 'x の係数' }, { label: 'y の係数' }], answer: [X, Y],
        hints: [k1 !== 1 || Math.abs(k2) !== 1 ? 'まず分配法則でかっこを外そう。' : (k2 < 0 ? '後ろのかっこの中の符号がすべて変わるよ。' : 'そのままかっこを外して、同類項をまとめよう。'),
          `かっこを外すと ${poly([[k1 * a, 'x'], [k1 * b, 'y'], [k2 * c, 'x'], [k2 * d, 'y']])}`],
        explain: steps([`x：${num(k1 * a)} ${k2 * c < 0 ? '−' : '+'} ${Math.abs(k2 * c)} = ${num(X)}`, `y：${num(k1 * b)} ${k2 * d < 0 ? '−' : '+'} ${Math.abs(k2 * d)} = ${num(Y)}`, `答え ${poly([[X, 'x'], [Y, 'y']])}`]),
      };
    },
  });

  add({
    id: 's2_mono', unit: 'u2_expr', name: '単項式の乗法・除法', prereq: ['s1_muldiv'],
    lesson: `<p class="pt">かけ算：<b>係数どうし、文字どうし</b>をかける。x × x = x²</p>
<p class="pt">わり算：<b>分数の形</b>にして約分する。</p>
<div class="ex">例）(−2x) × 3xy = −6x²y　　8x²y ÷ 4x = 2xy</div>`,
    gen() {
      let q, c, ex, ey, wrong, hints;
      if (Math.random() < 0.5) {
        const a = pick(COEF), b = pick(COEF), ax = pick([1, 2]), ay = pick([0, 1]);
        c = a * b; ex = ax + 1; ey = ay + 1;
        q = `${monoP(a, ax, ay)} × ${monoP(b, 1, 1)}`;
        wrong = [[-c, ex, ey], [c, ex + 1, ey], [a + b, ex, ey], [c, ex, ey - 1], [c, ax, ay + 1], [-c, ex - 1, ey]];
        hints = ['係数どうし、文字どうしをかけよう。', `係数：${par(a)} × ${par(b)} = ${num(c)}　文字：x の数を数えよう`];
      } else {
        const k = pick(COEF), d = pick([-4, -3, -2, 2, 3, 4]), n = pick([[2, 1], [2, 2], [3, 1]]), dd = pick([[1, 0], [1, 1]]);
        c = k; ex = n[0] - dd[0]; ey = n[1] - dd[1];
        q = `${mono(k * d, n[0], n[1])} ÷ ${monoP(d, dd[0], dd[1])}`;
        wrong = [[-c, ex, ey], [c, ex + 1, ey], [k * d * d, ex, ey], [c, ex, ey + 1], [c * 2, ex, ey], [-c, ex + 1, ey]];
        hints = ['分数の形にして約分しよう。', `<span class="fr"><span>${mono(k * d, n[0], n[1])}</span><span>${mono(d, dd[0], dd[1])}</span></span>`];
      }
      const correct = mono(c, ex, ey);
      const opts = [correct];
      wrong.forEach(([wc, wx, wy]) => {
        if (wc === 0 || wx < 0 || wy < 0) return;
        const s = mono(wc, wx, wy);
        if (opts.length < 4 && !opts.includes(s)) opts.push(s);
      });
      const choices = shuffle(opts);
      return {
        q, choices, correct: choices.indexOf(correct), hints,
        explain: steps([`${q}`, `= ${correct}`]),
      };
    },
  });

  add({
    id: 's2_value', unit: 'u2_expr', name: '式の値（式を簡単にしてから代入）', prereq: ['s1_subst', 's2_poly'],
    lesson: `<p class="pt">いきなり代入せず、<b>先に式を簡単にしてから</b>代入するとミスが減る。</p>
<div class="ex">例）x = 2, y = −1 のとき 3(x + y) − (x − 2y)<br>= 2x + 5y = 4 − 5 = −1</div>`,
    gen() {
      const x = RNZ(-4, 4), y = RNZ(-4, 4), a = RNZ(-3, 3), b = RNZ(-3, 3), c = RNZ(-3, 3), d = RNZ(-3, 3);
      const k1 = pick([2, 3]), k2 = pick([1, 2]);
      const P = k1 * a - k2 * c, Q = k1 * b - k2 * d, ans = P * x + Q * y;
      return {
        q: `x = ${num(x)}、y = ${num(y)} のとき、${k1}(${poly([[a, 'x'], [b, 'y']])}) − ${k2 === 1 ? '' : k2}(${poly([[c, 'x'], [d, 'y']])}) の値`,
        fields: [{ label: '答え' }], answer: [ans],
        hints: [`まず式を簡単にしよう。→ ${poly([[P, 'x'], [Q, 'y']])}`, `${num(P)} × ${par(x)} + ${par(Q)} × ${par(y)} を計算しよう。`],
        explain: steps([`式を簡単にすると ${poly([[P, 'x'], [Q, 'y']])}`, `= ${num(P)} × ${par(x)} + ${par(Q)} × ${par(y)}`, `= ${num(P * x)} + ${par(Q * y)} = ${num(ans)}`]),
      };
    },
  });

  add({
    id: 's2_transform', unit: 'u2_expr', name: '等式の変形（y について解く）', prereq: ['s1_eq_basic'],
    lesson: `<p class="pt">「y について解く」= <b>y = ～ の形</b>にすること。方程式と同じく移項して、y の係数でわる。</p>
<div class="ex">例）6x + 2y = 8 → 2y = −6x + 8 → y = −3x + 4</div>`,
    gen() {
      const b = pick([1, -1, 2, -2, 3]), m = RNZ(-5, 5), n = RNZ(-6, 6);
      const a = -b * m, c = b * n;
      return {
        q: `${poly([[a, 'x'], [b, 'y']])} = ${num(c)} を y について解きなさい。`, form: FORM_LIN,
        fields: [{ label: 'x の係数' }, { label: '数の項' }], answer: [m, n],
        hints: ['x の項を右辺に移項しよう。', `${cv(b, 'y')} = ${poly([[-a, 'x'], [c, '']])}${b === 1 ? '' : `　→ 両辺を ${num(b)} でわる`}`],
        explain: steps([`${cv(b, 'y')} = ${poly([[-a, 'x'], [c, '']])}`, `y = ${poly([[m, 'x'], [n, '']])}`]),
      };
    },
  });

  // ===== 中2 連立方程式 =====
  add({
    id: 's2_sys_add', unit: 'u2_sys', name: '連立方程式（加減法）', prereq: ['s1_eq_basic', 's2_poly'],
    lesson: `<p class="pt">2つの式を<b>たしたり、ひいたり</b>して、x か y の一方を消す。</p>
<p class="pt">係数がそろっていないときは、式を何倍かして<b>係数の絶対値をそろえる</b>。</p>
<div class="ex">例）x + y = 5、x − y = 1<br>たすと 2x = 6 → x = 3、y = 2</div>`,
    gen() {
      const x = RNZ(-6, 6), y = RNZ(-6, 6);
      let a1, b1, a2, b2;
      do {
        if (Math.random() < 0.5) { a1 = RNZ(-5, 5); a2 = RNZ(-5, 5); b1 = R(1, 5); b2 = pick([b1, -b1]); }
        else { a1 = RNZ(-5, 5); a2 = RNZ(-5, 5); b1 = RNZ(-5, 5); b2 = RNZ(-5, 5); }
      } while (a1 * b2 - a2 * b1 === 0);
      const c1 = a1 * x + b1 * y, c2 = a2 * x + b2 * y;
      const L = lcm(b1, b2), m1 = L / Math.abs(b1) * Math.sign(b1), m2 = L / Math.abs(b2) * Math.sign(b2);
      const D = a1 * m1 - a2 * m2, E = c1 * m1 - c2 * m2;
      const same = Math.abs(b1) === Math.abs(b2);
      return {
        q: sys(`${poly([[a1, 'x'], [b1, 'y']])} = ${num(c1)}`, `${poly([[a2, 'x'], [b2, 'y']])} = ${num(c2)}`),
        fields: [{ label: 'x =' }, { label: 'y =' }], answer: [x, y],
        hints: [same ? `y の係数に注目。2つの式を${b1 === b2 ? 'ひく' : 'たす'}と y が消えるよ。` : 'どちらかの式（または両方）を何倍かして、y の係数の絶対値をそろえよう。',
          `y を消すと ${cv(D, 'x')} = ${num(E)} → x = ${num(x)}。これを片方の式に代入しよう。`],
        explain: steps([`y を消去：${cv(D, 'x')} = ${num(E)}`, `x = ${num(x)}`, `上の式に代入：${num(a1 * x)} ${b1 < 0 ? '−' : '+'} ${poly([[Math.abs(b1), 'y']])} = ${num(c1)} → y = ${num(y)}`]),
      };
    },
  });

  add({
    id: 's2_sys_sub', unit: 'u2_sys', name: '連立方程式（代入法）', prereq: ['s1_eq_paren', 's2_poly'],
    lesson: `<p class="pt">「y = ～」の式があるときは、それを<b>もう一方の式の y に代入</b>する。</p>
<p class="pt">代入するときは<b>かっこをつける</b>のがポイント。</p>
<div class="ex">例）y = 2x − 1、3x + y = 9<br>3x + (2x − 1) = 9 → 5x = 10 → x = 2、y = 3</div>`,
    gen() {
      const x = RNZ(-5, 5), m = RNZ(-4, 4), n = RNZ(-6, 6), y = m * x + n;
      let a, b; do { a = RNZ(-5, 5); b = RNZ(-4, 4); } while (a + b * m === 0);
      const c = a * x + b * y;
      return {
        q: sys(`y = ${poly([[m, 'x'], [n, '']])}`, `${poly([[a, 'x'], [b, 'y']])} = ${num(c)}`),
        fields: [{ label: 'x =' }, { label: 'y =' }], answer: [x, y],
        hints: [`上の式を下の式の y に代入しよう：${poly([[a, 'x']])} ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : Math.abs(b)}(${poly([[m, 'x'], [n, '']])}) = ${num(c)}`,
          `整理すると ${cv(a + b * m, 'x')} = ${num(c - b * n)} → x = ${num(x)}`],
        explain: steps([`${cv(a + b * m, 'x')} = ${num(c - b * n)}`, `x = ${num(x)}`, `y = ${num(m)} × ${par(x)} ${n < 0 ? '−' : '+'} ${Math.abs(n)} = ${num(y)}`]),
      };
    },
  });

  add({
    id: 's2_sys_word', unit: 'u2_sys', name: '連立方程式の文章題', prereq: ['s1_eq_both'],
    lesson: `<p class="pt">わからない数量を <b>x、y</b> とおき、<b>「個数の式」と「代金の式」</b>の2つを作る。</p>
<div class="ex">例）1個100円のりんごと1個60円のみかんを合わせて10個買い、代金は840円。<br>x + y = 10、100x + 60y = 840 → x = 6、y = 4</div>`,
    gen() {
      const T = pick([
        { a: 'りんご', b: 'みかん', u: '個', s: (p1, p2, n, m) => `1個${p1}円のりんごと1個${p2}円のみかんを、合わせて${n}個買ったら、代金は${m}円でした。りんごとみかんをそれぞれ何個買いましたか。` },
        { a: '大人', b: '子ども', u: '人', s: (p1, p2, n, m) => `入館料は大人1人${p1}円、子ども1人${p2}円です。大人と子ども合わせて${n}人で入館したら、合計${m}円でした。大人と子どもはそれぞれ何人ですか。` },
        { a: 'ノート', b: 'ボールペン', u: '冊・本', s: (p1, p2, n, m) => `1冊${p1}円のノートと1本${p2}円のボールペンを、合わせて${n}個買ったら、代金は${m}円でした。ノートとボールペンをそれぞれいくつ買いましたか。` },
      ]);
      let p1, p2; do { p1 = R(5, 15) * 10; p2 = R(3, 12) * 10; } while (p1 === p2);
      const u = R(2, 12), v = R(2, 12), n = u + v, m = p1 * u + p2 * v;
      const ua = T.u === '冊・本' ? '冊' : T.u, ub = T.u === '冊・本' ? '本' : T.u;
      return {
        q: T.s(p1, p2, n, m),
        fields: [{ label: T.a, post: ua }, { label: T.b, post: ub }], answer: [u, v],
        hints: [`${T.a}を x ${ua}、${T.b}を y ${ub}として、式を2つ作ろう。`, sys(`x + y = ${n}`, `${p1}x + ${p2}y = ${m}`)],
        explain: steps([sys(`x + y = ${n}`, `${p1}x + ${p2}y = ${m}`), `下の式から、上の式を ${p2} 倍したものをひくと ${p1 - p2}x = ${m - p2 * n}`, `x = ${u}、y = ${v}`]),
      };
    },
  });

  // ===== 中2 一次関数 =====
  add({
    id: 's2_lin_rate', unit: 'u2_lin', name: '一次関数の変化の割合', prereq: ['s1_prop'],
    lesson: `<p class="pt">一次関数 y = ax + b の<b>変化の割合はいつも a</b>（傾きと同じ）。</p>
<p class="pt"><b>y の増加量 = 変化の割合 × x の増加量</b></p>
<div class="ex">例）y = 3x − 2 で x が 1 から 5 まで増加 → y の増加量 = 3 × 4 = 12</div>`,
    gen() {
      const a = RNZ(-5, 5), b = RNZ(-8, 8), p = R(-4, 3), q = p + R(1, 5);
      return {
        q: `一次関数 y = ${poly([[a, 'x'], [b, '']])} で、x の値が ${num(p)} から ${num(q)} まで増加するとき`,
        fields: [{ label: '変化の割合' }, { label: 'y の増加量' }], answer: [a, a * (q - p)],
        hints: ['一次関数 y = ax + b の変化の割合は a だよ。', `x の増加量は ${num(q)} − ${par(p)} = ${q - p}。y の増加量 = ${num(a)} × ${q - p}`],
        explain: steps([`変化の割合 = ${num(a)}`, `x の増加量 = ${q - p}`, `y の増加量 = ${num(a)} × ${q - p} = ${num(a * (q - p))}`]),
      };
    },
  });

  add({
    id: 's2_lin_point_slope', unit: 'u2_lin', name: '直線の式（傾きと1点）', prereq: ['s1_prop', 's1_eq_basic'],
    lesson: `<p class="pt">y = ax + b に<b>傾き a</b> と<b>点の座標</b>を代入して、b を求める。</p>
<div class="ex">例）傾き 2、点 (1, 5) を通る → 5 = 2 × 1 + b → b = 3 → y = 2x + 3</div>`,
    gen() {
      const a = RNZ(-4, 4), p = RNZ(-4, 4), b = RNZ(-6, 6), q = a * p + b;
      return {
        q: `傾きが ${num(a)} で、点 (${num(p)}, ${num(q)}) を通る直線の式`, form: FORM_LIN,
        fields: [{ label: '傾き' }, { label: '切片' }], answer: [a, b],
        hints: [`y = ${poly([[a, 'x']])} + b に x = ${num(p)}、y = ${num(q)} を代入しよう。`, `${num(q)} = ${num(a)} × ${par(p)} + b → b = ${num(b)}`],
        explain: steps([`${num(q)} = ${num(a * p)} + b`, `b = ${num(b)}`, `y = ${poly([[a, 'x'], [b, '']])}`]),
      };
    },
  });

  add({
    id: 's2_lin_two', unit: 'u2_lin', name: '直線の式（2点）', prereq: ['s2_lin_point_slope'],
    lesson: `<p class="pt">まず<b>傾き = (y の増加量) ÷ (x の増加量)</b> を求め、あとは「傾きと1点」と同じ。</p>
<div class="ex">例）(1, 3) と (3, 7) を通る → 傾き = 4 ÷ 2 = 2 → 3 = 2 + b → y = 2x + 1</div>`,
    gen() {
      const a = RNZ(-3, 3), b = RNZ(-6, 6), p1 = R(-4, 3), p2 = p1 + R(1, 4), q1 = a * p1 + b, q2 = a * p2 + b;
      return {
        q: `2点 (${num(p1)}, ${num(q1)})、(${num(p2)}, ${num(q2)}) を通る直線の式`, form: FORM_LIN,
        fields: [{ label: '傾き' }, { label: '切片' }], answer: [a, b],
        hints: [`傾き = <span class="fr"><span>${num(q2)} − ${par(q1)}</span><span>${num(p2)} − ${par(p1)}</span></span>`, `傾きは ${num(a)}。y = ${poly([[a, 'x']])} + b に (${num(p1)}, ${num(q1)}) を代入しよう。`],
        explain: steps([`傾き = ${num(q2 - q1)} ÷ ${p2 - p1} = ${num(a)}`, `${num(q1)} = ${num(a)} × ${par(p1)} + b → b = ${num(b)}`, `y = ${poly([[a, 'x'], [b, '']])}`]),
      };
    },
  });

  add({
    id: 's2_lin_intersect', unit: 'u2_lin', name: '2直線の交点', prereq: ['s1_eq_both', 's2_lin_point_slope'],
    lesson: `<p class="pt">2直線の交点の座標は、<b>2つの式を連立方程式として解いた解</b>。</p>
<div class="ex">例）y = x + 1、y = −x + 5 → x + 1 = −x + 5 → x = 2、y = 3 → 交点 (2, 3)</div>`,
    gen() {
      const x = RNZ(-4, 4), y = RNZ(-6, 6);
      let m1, m2; do { m1 = RNZ(-4, 4); m2 = RNZ(-4, 4); } while (m1 === m2);
      const n1 = y - m1 * x, n2 = y - m2 * x;
      return {
        q: `2直線 y = ${poly([[m1, 'x'], [n1, '']])} と y = ${poly([[m2, 'x'], [n2, '']])} の交点の座標`,
        form: '( <b>□</b> , <b>□</b> )',
        fields: [{ label: 'x 座標' }, { label: 'y 座標' }], answer: [x, y],
        hints: [`y が等しいので ${poly([[m1, 'x'], [n1, '']])} = ${poly([[m2, 'x'], [n2, '']])}`, `${cv(m1 - m2, 'x')} = ${num(n2 - n1)} → x = ${num(x)}`],
        explain: steps([`${cv(m1 - m2, 'x')} = ${num(n2 - n1)} → x = ${num(x)}`, `y = ${num(m1)} × ${par(x)} ${n1 < 0 ? '−' : '+'} ${Math.abs(n1)} = ${num(y)}`, `交点 (${num(x)}, ${num(y)})`]),
      };
    },
  });

  // ---------- 図（SVG）：角度などの数値と図の形を一致させて描く ----------
  const f1 = (n) => Math.round(n * 10) / 10;
  const RAD = Math.PI / 180;
  // 点の集まりがちょうど入るように表示範囲を決める
  function fig(pts, body, padX = 34, padY = 30) {
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs) - padX, y0 = Math.min(...ys) - padY, w = Math.max(...xs) - Math.min(...xs) + padX * 2, h = Math.max(...ys) - Math.min(...ys) + padY * 2;
    return `<svg class="fig" viewBox="${f1(x0)} ${f1(y0)} ${f1(w)} ${f1(h)}" role="img" aria-label="図">${body}</svg>`;
  }
  const ln = (a, b, cls = '') => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" class="${cls}"/>`;
  const pg = (pts, cls = '') => `<polygon points="${pts.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ')}" class="${cls}"/>`;
  const tx = (p, s, cls = '') => `<text x="${f1(p[0])}" y="${f1(p[1])}" text-anchor="middle" dominant-baseline="central" class="${cls}">${s}</text>`;
  const add2 = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  // 頂点 v で、点 p1 の方向から点 p2 の方向への角の印と文字
  function ang(v, p1, p2, label, cls = '', r = 22) {
    const a1 = Math.atan2(p1[1] - v[1], p1[0] - v[0]), a2 = Math.atan2(p2[1] - v[1], p2[0] - v[0]);
    let d = a2 - a1; while (d <= -Math.PI) d += 2 * Math.PI; while (d > Math.PI) d -= 2 * Math.PI;
    const s = [v[0] + r * Math.cos(a1), v[1] + r * Math.sin(a1)], e = [v[0] + r * Math.cos(a1 + d), v[1] + r * Math.sin(a1 + d)];
    const m = a1 + d / 2, lr = r + 15 + (Math.abs(d) < 0.8 ? 10 : 0);
    return `<path d="M${f1(s[0])} ${f1(s[1])} A${r} ${r} 0 0 ${d > 0 ? 1 : 0} ${f1(e[0])} ${f1(e[1])}" class="arc ${cls}"/>`
      + (label ? tx([v[0] + lr * Math.cos(m), v[1] + lr * Math.sin(m)], label, 'lbl ' + cls) : '');
  }
  // 頂点の名前（図形の中心から外側へ少しずらす）
  function names(pts, labels) {
    const c = [pts.reduce((a, p) => a + p[0], 0) / pts.length, pts.reduce((a, p) => a + p[1], 0) / pts.length];
    return pts.map((p, i) => { const dx = p[0] - c[0], dy = p[1] - c[1], L = Math.hypot(dx, dy) || 1; return tx([p[0] + (dx / L) * 15, p[1] + (dy / L) * 15], labels[i]); }).join('');
  }
  // 等しい辺の印
  function tick(a, b, n = 1) {
    const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    const u = [dx / L, dy / L], nv = [-u[1] * 7, u[0] * 7];
    let s = '';
    for (let i = 0; i < n; i++) { const c = add2(m, u, (i - (n - 1) / 2) * 5); s += ln(add2(c, nv, 1), add2(c, nv, -1), 'thin'); }
    return s;
  }
  const FIGNOTE = '<div class="fignote">※ 図の形は目安です</div>';

  // ===== 中2 図形の調べ方（平行と合同） =====
  add({
    id: 'g_parallel', unit: 'u2_geo1', name: '平行線と角', prereq: [],
    lesson: `<p class="pt"><b>対頂角</b>は等しい。</p>
<p class="pt">2直線が平行なら、<b>同位角</b>は等しく、<b>錯角</b>も等しい。</p>
<p class="pt">一直線の角は <b>180°</b>。</p>
<div class="ex">例）ℓ∥m で、ℓ と交わってできる角が 70° なら、m の同じ位置（同位角）も 70°、となりの角は 180° − 70° = 110°</div>`,
    gen() {
      const a = pick([40, 45, 50, 55, 60, 65, 70, 75]);
      const c = Math.cos(a * RAD), s = Math.sin(a * RAD);
      const P = [100, 50], Q = [100 + 100 / Math.tan(a * RAD), 150];
      const val = (pos) => (pos === 'UL' || pos === 'LR' ? a : 180 - a);
      const rays = (V) => ({ R: add2(V, [60, 0]), L: add2(V, [-60, 0]), U: add2(V, [-c, -s], 40), D: add2(V, [c, s], 40) });
      const corner = { UL: ['L', 'U'], UR: ['U', 'R'], LR: ['R', 'D'], LL: ['D', 'L'] };
      const POS = ['UL', 'UR', 'LR', 'LL'], OPP = { UL: 'LR', LR: 'UL', UR: 'LL', LL: 'UR' };
      const g = pick(POS);
      const tgt = Math.random() < 0.2 ? { pt: 'P', pos: OPP[g] } : { pt: 'Q', pos: pick(POS) };
      const x = val(tgt.pos), given = val(g);
      let reason;
      if (tgt.pt === 'P') reason = '対頂角は等しい';
      else if (tgt.pos === g) reason = '平行線の同位角は等しい';
      else if ((g === 'LR' && tgt.pos === 'UL') || (g === 'LL' && tgt.pos === 'UR')) reason = '平行線の錯角は等しい';
      else reason = x === given ? '同位角と対頂角を組み合わせると、同じ大きさになる' : '同位角に移すと、∠x と合わせて一直線（180°）になる';
      const rp = rays(P), rq = rays(Q), V = tgt.pt === 'P' ? P : Q, rv = tgt.pt === 'P' ? rp : rq;
      const body = ln([10, 50], [Q[0] + 80, 50]) + ln([10, 150], [Q[0] + 80, 150]) + ln(add2(P, [-c, -s], 45), add2(Q, [c, s], 45))
        + tx([0, 50], 'ℓ') + tx([0, 150], 'm')
        + ang(P, rp[corner[g][0]], rp[corner[g][1]], given + '°')
        + ang(V, rv[corner[tgt.pos][0]], rv[corner[tgt.pos][1]], 'x', 'x', 16);
      const f = fig([[0, 50], [Q[0] + 80, 150], add2(P, [-c, -s], 45), add2(Q, [c, s], 45)], body, 20, 16);
      return {
        q: `図で ℓ∥m のとき、∠x の大きさを求めなさい。${f}`,
        fields: [{ label: '∠x =', post: '°' }], answer: [x],
        hints: ['平行線では、同位角・錯角が等しい。一直線の角は 180° だよ。', `ヒント：${reason}。`],
        explain: steps([reason + '。', x === given ? `∠x = ${given}°` : `∠x = 180° − ${given}° = ${x}°`]),
      };
    },
  });

  add({
    id: 'g_parallel_bend', unit: 'u2_geo1', name: '平行線と折れ線の角', prereq: ['g_parallel'], diag: false,
    lesson: `<p class="pt">折れ曲がった点を通り、ℓ に<b>平行な直線をひく</b>と、錯角が2つできる。</p>
<p class="pt">「く」の字の角 = <b>上の角 + 下の角</b></p>
<div class="ex">例）上の角 30°、下の角 40° → x = 30° + 40° = 70°</div>`,
    gen() {
      const a = pick([25, 30, 35, 40, 45, 50, 55]), b = pick([25, 30, 35, 40, 45, 50, 55]);
      const L = [40, 40], P = [40 + 70 / Math.tan(a * RAD), 110], M = [P[0] - 70 / Math.tan(b * RAD), 180];
      const right = Math.max(P[0], 160) + 60;
      const findA = Math.random() < 0.35;
      const body = ln([0, 40], [right, 40]) + ln([0, 180], [right, 180]) + ln(L, P) + ln(P, M) + tx([-14, 40], 'ℓ') + tx([-14, 180], 'm')
        + ang(L, [right, 40], P, findA ? 'x' : a + '°', findA ? 'x' : '') + ang(M, [right, 180], P, b + '°')
        + ang(P, L, M, findA ? (a + b) + '°' : 'x', findA ? '' : 'x', 18)
        + ln([P[0] - 30, 110], [right, 110], 'thin dash');
      const f = fig([[-14, 40], [right, 180]], body, 16, 16);
      const ans = findA ? a : a + b;
      return {
        q: `図で ℓ∥m のとき、∠x の大きさを求めなさい。${f}`,
        fields: [{ label: '∠x =', post: '°' }], answer: [ans],
        hints: ['折れ曲がった点を通り、ℓ に平行な直線（点線）をひいて考えよう。', `錯角を使うと、折れ曲がった点の角 = 上の角 + 下の角。`],
        explain: steps(findA ? [`${a + b}° = ∠x + ${b}°`, `∠x = ${a + b}° − ${b}° = ${a}°`] : ['点線の上下で、それぞれ錯角が等しい。', `∠x = ${a}° + ${b}° = ${a + b}°`]),
      };
    },
  });

  add({
    id: 'g_tri_angle', unit: 'u2_geo1', name: '三角形の内角と外角', prereq: ['g_parallel'],
    lesson: `<p class="pt">三角形の<b>内角の和は 180°</b>。</p>
<p class="pt">三角形の<b>外角は、となりにない2つの内角の和</b>に等しい。</p>
<div class="ex">例）∠A = 50°、∠B = 60° → ∠C = 70°、C の外角 = 50° + 60° = 110°</div>`,
    gen() {
      let b, c, a;
      do { b = pick([30, 35, 40, 45, 50, 55, 60, 65]); c = pick([30, 35, 40, 45, 50, 55, 60, 65]); a = 180 - b - c; } while (a < 35);
      const B = [0, 0], C = [220, 0], tb = Math.tan(b * RAD), tc = Math.tan(c * RAD);
      const A = [220 * tc / (tb + tc), -(220 * tc / (tb + tc)) * tb];
      const outer = Math.random() < 0.5, D = [290, 0];
      let body = pg([A, B, C]) + names([A, B, C], ['A', 'B', 'C']) + ang(B, C, A, b + '°');
      let ans, ex;
      if (outer) {
        body += ln(C, D) + ang(A, B, C, a + '°') + ang(C, D, A, 'x', 'x', 18);
        ans = a + b; ex = [`外角 = となりにない2つの内角の和`, `∠x = ${a}° + ${b}° = ${ans}°`];
      } else {
        body += ang(C, A, B, c + '°') + ang(A, B, C, 'x', 'x');
        ans = a; ex = [`内角の和は 180°`, `∠x = 180° − ${b}° − ${c}° = ${ans}°`];
      }
      const f = fig([A, B, C, outer ? D : C], body);
      return {
        q: `図の ∠x の大きさを求めなさい。${f}`,
        fields: [{ label: '∠x =', post: '°' }], answer: [ans],
        hints: [outer ? '∠x は三角形の外角。となりにない2つの内角に注目しよう。' : '三角形の内角の和は 180° だよ。', outer ? `∠x = ${a}° + ${b}°` : `∠x = 180° − ${b}° − ${c}°`],
        explain: steps(ex),
      };
    },
  });

  add({
    id: 'g_polygon', unit: 'u2_geo1', name: '多角形の角', prereq: ['g_tri_angle', 's1_mixed'], diag: false,
    lesson: `<p class="pt">n 角形の<b>内角の和 = 180° × (n − 2)</b></p>
<p class="pt">多角形の<b>外角の和は、いつも 360°</b>。</p>
<div class="ex">例）六角形の内角の和 = 180° × 4 = 720°、正六角形の1つの外角 = 360° ÷ 6 = 60°</div>`,
    gen() {
      const t = R(0, 3);
      if (t === 0) {
        const n = R(5, 12);
        return {
          q: `${n}角形の内角の和を求めなさい。`, fields: [{ label: '内角の和', post: '°' }], answer: [180 * (n - 2)],
          hints: ['n 角形は、1つの頂点から対角線をひくと (n − 2) 個の三角形に分けられるよ。', `180° × (${n} − 2)`],
          explain: steps([`180° × (${n} − 2) = 180° × ${n - 2} = ${180 * (n - 2)}°`]),
        };
      }
      const n = pick([5, 6, 8, 9, 10, 12]);
      if (t === 1) return {
        q: `正${n}角形の1つの内角の大きさを求めなさい。`, fields: [{ label: '1つの内角', post: '°' }], answer: [180 * (n - 2) / n],
        hints: ['まず内角の和を求めて、角の数でわろう。（または 180° − 1つの外角）', `内角の和は 180° × ${n - 2} = ${180 * (n - 2)}°`],
        explain: steps([`内角の和 ${180 * (n - 2)}° ÷ ${n} = ${180 * (n - 2) / n}°`, `（別解）180° − 360° ÷ ${n} = ${180 * (n - 2) / n}°`]),
      };
      if (t === 2) return {
        q: `正${n}角形の1つの外角の大きさを求めなさい。`, fields: [{ label: '1つの外角', post: '°' }], answer: [360 / n],
        hints: ['外角の和は、何角形でも 360° だよ。', `360° ÷ ${n}`],
        explain: steps([`360° ÷ ${n} = ${360 / n}°`]),
      };
      return {
        q: `1つの外角が ${360 / n}° の正多角形は、正何角形ですか。`, fields: [{ label: '正', post: '角形' }], answer: [n],
        hints: ['外角の和は 360°。1つの外角が何個あれば 360° になる？', `360° ÷ ${360 / n}°`],
        explain: steps([`360° ÷ ${360 / n}° = ${n}`, `正${n}角形`]),
      };
    },
  });

  const CONG = ['3組の辺がそれぞれ等しい', '2組の辺とその間の角がそれぞれ等しい', '1組の辺とその両端の角がそれぞれ等しい', '合同とはいえない'];
  add({
    id: 'g_congruence', unit: 'u2_geo1', name: '三角形の合同条件', prereq: [],
    lesson: `<p class="pt">三角形の合同条件は3つ。</p>
<p class="pt">① <b>3組の辺</b>がそれぞれ等しい<br>② <b>2組の辺とその間の角</b>がそれぞれ等しい<br>③ <b>1組の辺とその両端の角</b>がそれぞれ等しい</p>
<p class="pt">角が「辺の間」にあるか、「辺の両端」にあるかがポイント。</p>`,
    gen() {
      const A = ['A', 'B', 'C'], Dd = ['D', 'E', 'F'];
      const side = (i, j) => `${A[i]}${A[j]} = ${Dd[i]}${Dd[j]}`, angle = (i) => `∠${A[i]} = ∠${Dd[i]}`;
      const o = shuffle([0, 1, 2]), [i, j, k] = o;
      const t = R(0, 4);
      let conds, ans, why;
      if (t === 0) { conds = [side(0, 1), side(1, 2), side(2, 0)]; ans = 0; why = '3組の辺がすべて等しい。'; }
      else if (t === 1) { conds = [side(i, j), side(i, k), angle(i)]; ans = 1; why = `∠${A[i]} は、辺 ${A[i]}${A[j]} と ${A[i]}${A[k]} の間の角。`; }
      else if (t === 2) { conds = [side(i, j), angle(i), angle(j)]; ans = 2; why = `∠${A[i]} と ∠${A[j]} は、辺 ${A[i]}${A[j]} の両端の角。`; }
      else if (t === 3) { conds = [side(i, j), side(j, k), angle(i)]; ans = 3; why = `∠${A[i]} は、2つの辺 ${A[i]}${A[j]}・${A[j]}${A[k]} の間の角ではない（間の角は ∠${A[j]}）。これでは合同とはいえない。`; }
      else { conds = [angle(0), angle(1), angle(2)]; ans = 3; why = '3つの角が等しいだけでは、大きさのちがう三角形もできるので合同とはいえない。'; }
      return {
        q: `△ABC と △DEF で、次のことが成り立ちます。合同といえる場合は、その合同条件を選びなさい。<div class="conds">${shuffle(conds).join('<br>')}</div>`,
        choices: CONG, correct: ans,
        hints: ['等しい辺と角を、三角形の図にかきこんで確かめよう。', t === 4 ? '辺の条件が1つもないね。' : '角は、2つの辺の「間」にある？それとも1つの辺の「両端」にある？'],
        explain: steps([why, `答え：${CONG[ans]}`]),
      };
    },
  });

  const PROOF_R = ['対頂角', '平行線の錯角', '平行線の同位角', '共通な辺'];
  const PROOF_C = ['3組の辺', '2組の辺とその間の角', '1組の辺とその両端の角', '3組の角'];
  add({
    id: 'g_proof', unit: 'u2_geo1', name: '合同の証明', prereq: ['g_congruence', 'g_parallel'], diag: false,
    lesson: `<p class="pt">証明は「<b>仮定</b>（わかっていること）」から「<b>結論</b>（示したいこと）」へ、根拠をつけて進める。</p>
<p class="pt">よく使う根拠：<b>対頂角</b>、<b>平行線の錯角・同位角</b>、<b>共通な辺</b>、そして<b>合同条件</b>。</p>`,
    gen() {
      const T = pick([
        {
          pts: [[40, 40], [260, 160], [40, 160], [260, 40], [150, 100]], lab: ['A', 'B', 'C', 'D', 'O'],
          lines: [[0, 1], [2, 3], [0, 2], [3, 1]], ticks: [[0, 4, 1], [4, 1, 1], [2, 4, 2], [4, 3, 2]],
          head: '線分 AB と CD が点 O で交わり、AO = BO、CO = DO のとき、△AOC ≡ △BOD となることを証明します。',
          rows: (b) => ['△AOC と △BOD で', '仮定から　AO = BO …①', '仮定から　CO = DO …②', `${b(0)}は等しいから　∠AOC = ∠BOD …③`, `①、②、③より、${b(1)}がそれぞれ等しいから　△AOC ≡ △BOD`],
          blanks: [{ set: PROOF_R, ans: 0 }, { set: PROOF_C, ans: 1 }],
        },
        {
          pts: [[40, 40], [130, 40], [170, 160], [260, 160], [150, 100]], lab: ['A', 'B', 'C', 'D', 'O'],
          lines: [[0, 1], [2, 3], [0, 3], [1, 2]], ticks: [[0, 4, 1], [4, 3, 1]],
          head: '線分 AD と BC が点 O で交わり、AB∥CD、AO = DO のとき、△ABO ≡ △DCO となることを証明します。',
          rows: (b) => ['△ABO と △DCO で', '仮定から　AO = DO …①', `AB∥CD より、${b(0)}は等しいから　∠BAO = ∠CDO …②`, `${b(1)}は等しいから　∠AOB = ∠DOC …③`, `①、②、③より、${b(2)}がそれぞれ等しいから　△ABO ≡ △DCO`],
          blanks: [{ set: PROOF_R, ans: 1 }, { set: PROOF_R, ans: 0 }, { set: PROOF_C, ans: 2 }],
        },
        {
          pts: [[150, 30], [60, 110], [150, 190], [240, 110]], lab: ['A', 'B', 'C', 'D'],
          lines: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2]], ticks: [[0, 1, 1], [0, 3, 1], [1, 2, 2], [3, 2, 2]],
          head: '四角形 ABCD で、AB = AD、BC = DC のとき、△ABC ≡ △ADC となることを証明します。',
          rows: (b) => ['△ABC と △ADC で', '仮定から　AB = AD …①', '仮定から　BC = DC …②', `AC は${b(0)}だから　AC = AC …③`, `①、②、③より、${b(1)}がそれぞれ等しいから　△ABC ≡ △ADC`],
          blanks: [{ set: PROOF_R, ans: 3 }, { set: PROOF_C, ans: 0 }],
        },
      ]);
      const k = R(0, T.blanks.length - 1), bl = T.blanks[k];
      const b = (i) => (i === k ? '<b class="blank">ア</b>' : T.blanks[i].set[T.blanks[i].ans]);
      const P = T.pts;
      const body = T.lines.map(([i, j]) => ln(P[i], P[j])).join('') + T.ticks.map(([i, j, n]) => tick(P[i], P[j], n)).join('')
        + P.map((p, i) => tx(add2(p, [p[0] < 150 ? -14 : p[0] > 150 ? 14 : 0, p[1] < 100 ? -12 : p[1] > 100 ? 12 : (T.lab[i] === 'O' ? 16 : 0)]), T.lab[i])).join('');
      return {
        q: `${T.head}${fig(P, body, 26, 22)}<div class="proof">${T.rows(b).join('<br>')}</div>【ア】にあてはまることばを選びなさい。`,
        choices: bl.set, correct: bl.ans,
        hints: [bl.set === PROOF_C ? 'これまでの①〜③が「辺」か「角」か、どこにあるかを確かめよう。' : '図で、その2つの角（または辺）の位置関係を見てみよう。', bl.set === PROOF_C ? '①②③の中に、辺はいくつ、角はいくつある？' : '向かい合っている？平行線の内側でZの形？同じ辺を両方の三角形が使っている？'],
        explain: steps([`【ア】：${bl.set[bl.ans]}`, T.rows((i) => T.blanks[i].set[T.blanks[i].ans]).slice(-1)[0]]),
      };
    },
  });

  // ===== 中2 三角形と四角形 =====
  add({
    id: 'g_isosceles', unit: 'u2_geo2', name: '二等辺三角形の角', prereq: ['g_tri_angle'],
    lesson: `<p class="pt">二等辺三角形の<b>底角は等しい</b>。</p>
<p class="pt">内角の和 180° と組み合わせて考える。</p>
<div class="ex">例）頂角 40° → 底角 = (180° − 40°) ÷ 2 = 70°</div>`,
    gen() {
      const byApex = Math.random() < 0.5;
      const a = byApex ? pick([20, 30, 40, 50, 60, 70, 80, 90, 100, 110]) : null;
      const base = byApex ? (180 - a) / 2 : pick([35, 40, 45, 50, 55, 60, 65, 70, 75]);
      const apex = 180 - 2 * base;
      const h = 140, hw = h * Math.tan((apex / 2) * RAD);
      const A = [0, 0], B = [-hw, h], C = [hw, h];
      const body = pg([A, B, C]) + names([A, B, C], ['A', 'B', 'C']) + tick(A, B) + tick(A, C)
        + (byApex ? ang(A, B, C, apex + '°') + ang(B, C, A, 'x', 'x') : ang(B, C, A, base + '°') + ang(A, B, C, 'x', 'x'));
      return {
        q: `AB = AC の二等辺三角形で、∠x の大きさを求めなさい。${fig([A, B, C], body)}`,
        fields: [{ label: '∠x =', post: '°' }], answer: [byApex ? base : apex],
        hints: ['二等辺三角形の2つの底角（∠B と ∠C）は等しいよ。', byApex ? `底角2つで 180° − ${apex}° = ${180 - apex}°` : `底角は2つとも ${base}°`],
        explain: steps(byApex ? [`∠B = ∠C だから`, `∠x = (180° − ${apex}°) ÷ 2 = ${base}°`] : [`∠B = ∠C = ${base}°`, `∠x = 180° − ${base}° × 2 = ${apex}°`]),
      };
    },
  });

  add({
    id: 'g_parallelogram', unit: 'u2_geo2', name: '平行四辺形の性質', prereq: ['g_parallel'],
    lesson: `<p class="pt">平行四辺形では、</p>
<p class="pt">① <b>2組の向かい合う辺</b>はそれぞれ等しい<br>② <b>2組の向かい合う角</b>はそれぞれ等しい<br>③ <b>対角線はそれぞれの中点</b>で交わる</p>
<p class="pt">となり合う角の和は 180°。</p>`,
    gen() {
      const b = pick([50, 55, 60, 65, 70, 75, 80]), dx = 100 / Math.tan(b * RAD);
      const B = [0, 100], C = [200, 100], A = [dx, 0], D = [200 + dx, 0];
      const O = [(A[0] + C[0]) / 2, (A[1] + C[1]) / 2];
      const t = R(0, 2);
      let body = pg([A, B, C, D]) + names([A, B, C, D], ['A', 'B', 'C', 'D']), q, ans, fields, hints, ex;
      if (t < 2) {
        const atA = t === 0;
        body += ang(B, C, A, b + '°') + (atA ? ang(A, B, D, 'x', 'x') : ang(D, A, C, 'x', 'x'));
        ans = atA ? 180 - b : b; fields = [{ label: '∠x =', post: '°' }];
        q = '平行四辺形 ABCD で、∠x の大きさを求めなさい。';
        hints = [atA ? 'となり合う角の和は 180°（AD∥BC の同側内角）。' : '平行四辺形の向かい合う角は等しいよ。', atA ? `∠x = 180° − ${b}°` : `∠D は ∠B と向かい合っている。`];
        ex = [atA ? `∠A + ∠B = 180° より、∠x = 180° − ${b}° = ${ans}°` : `向かい合う角は等しいので ∠x = ∠B = ${b}°`];
      } else {
        const k = R(3, 9);
        body += ln(A, C) + ln(B, D) + tx(add2(O, [0, 16]), 'O') + tx([(A[0] + O[0]) / 2 + 8, (A[1] + O[1]) / 2 - 10], k + 'cm', 'lbl');
        ans = 2 * k; fields = [{ label: 'AC =', post: 'cm' }];
        q = `平行四辺形 ABCD の対角線の交点を O とします。AO = ${k}cm のとき、AC の長さを求めなさい。`;
        hints = ['平行四辺形の対角線は、それぞれの中点で交わるよ。', `AO = OC = ${k}cm`];
        ex = [`対角線はそれぞれの中点で交わるので OC = AO = ${k}cm`, `AC = ${k} × 2 = ${ans}cm`];
      }
      return { q: q + fig([A, B, C, D], body), fields, answer: [ans], hints, explain: steps(ex) };
    },
  });

  const QUADS = ['平行四辺形', '長方形', 'ひし形', '正方形'];
  add({
    id: 'g_quad_kind', unit: 'u2_geo2', name: '特別な平行四辺形', prereq: ['g_parallelogram'], diag: false,
    lesson: `<p class="pt"><b>長方形</b>：4つの角が等しい（対角線の長さが等しい）</p>
<p class="pt"><b>ひし形</b>：4つの辺が等しい（対角線が垂直に交わる）</p>
<p class="pt"><b>正方形</b>：4つの角も4つの辺も等しい（対角線が等しく、垂直に交わる）</p>
<p class="pt">どれも平行四辺形の性質をすべて持っている。</p>`,
    gen() {
      const E = pick([
        ['4つの角がすべて等しい四角形', 1], ['4つの辺がすべて等しい四角形', 2], ['4つの角も4つの辺もすべて等しい四角形', 3],
        ['2組の向かい合う辺がそれぞれ平行な四角形', 0], ['2組の向かい合う辺がそれぞれ等しい四角形', 0], ['2組の向かい合う角がそれぞれ等しい四角形', 0],
        ['対角線がそれぞれの中点で交わる四角形', 0], ['1組の向かい合う辺が平行で、その長さが等しい四角形', 0],
        ['対角線の長さが等しい平行四辺形', 1], ['対角線が垂直に交わる平行四辺形', 2], ['対角線の長さが等しく、垂直に交わる平行四辺形', 3],
        ['となり合う辺の長さが等しい平行四辺形', 2], ['1つの角が直角の平行四辺形', 1],
      ]);
      return {
        q: `「${E[0]}」は、必ず何になりますか。いちばんふさわしいものを選びなさい。`,
        choices: QUADS, correct: E[1],
        hints: ['辺について？角について？対角線について？を見分けよう。', '角が等しい → 長方形、辺が等しい → ひし形、両方 → 正方形。'],
        explain: steps([`「${E[0]}」→ <b>${QUADS[E[1]]}</b>`]),
      };
    },
  });

  const RIGHT = ['斜辺と1つの鋭角がそれぞれ等しい', '斜辺と他の1辺がそれぞれ等しい', '2組の辺とその間の角がそれぞれ等しい', '合同とはいえない'];
  add({
    id: 'g_right_tri', unit: 'u2_geo2', name: '直角三角形の合同条件', prereq: ['g_congruence'], diag: false,
    lesson: `<p class="pt">直角三角形では、ふつうの合同条件に加えて、</p>
<p class="pt">① <b>斜辺と1つの鋭角</b>がそれぞれ等しい<br>② <b>斜辺と他の1辺</b>がそれぞれ等しい</p>
<p class="pt">でも合同になる。<b>斜辺</b>は直角の向かい側の辺。</p>`,
    gen() {
      const t = R(0, 3);
      let conds, ans;
      if (t === 0) { conds = ['AB = DE', pick(['∠A = ∠D', '∠B = ∠E'])]; ans = 0; }
      else if (t === 1) { conds = ['AB = DE', pick(['BC = EF', 'AC = DF'])]; ans = 1; }
      else if (t === 2) { conds = ['AC = DF', 'BC = EF']; ans = 2; }
      else { conds = [pick(['∠A = ∠D', '∠B = ∠E'])]; ans = 3; }
      return {
        q: `∠C = ∠F = 90° の直角三角形 ABC と DEF で、次のことが成り立ちます。合同といえる場合は、その合同条件を選びなさい。<div class="conds">${conds.join('<br>')}</div>`,
        choices: RIGHT, correct: ans,
        hints: ['∠C が直角なので、斜辺は AB（と DE）だよ。', ans === 3 ? '辺の条件がないと、大きさが決まらないね。' : '条件に「斜辺」は入っている？'],
        explain: steps([ans === 2 ? 'AC と BC は直角をはさむ2辺。間の角（直角）も等しい。' : ans === 3 ? '角だけでは大きさが決まらない。' : '斜辺 AB = DE がある。', `答え：${RIGHT[ans]}`]),
      };
    },
  });

  add({
    id: 'g_area', unit: 'u2_geo2', name: '平行線と面積', prereq: ['g_parallelogram'], diag: false,
    lesson: `<p class="pt">底辺が共通で、<b>高さが等しい三角形は面積が等しい</b>。</p>
<p class="pt">AD∥BC なら、△ABC と △DBC は底辺 BC が共通で高さが等しいので、<b>△ABC = △DBC</b>。</p>`,
    gen() {
      const A = [70, 0], D = [190, 0], B = [0, 120], C = [270, 120];
      const ix = (p1, p2, p3, p4) => { const d = (p1[0] - p2[0]) * (p3[1] - p4[1]) - (p1[1] - p2[1]) * (p3[0] - p4[0]); const a = p1[0] * p2[1] - p1[1] * p2[0], b = p3[0] * p4[1] - p3[1] * p4[0]; return [(a * (p3[0] - p4[0]) - (p1[0] - p2[0]) * b) / d, (a * (p3[1] - p4[1]) - (p1[1] - p2[1]) * b) / d]; };
      const O = ix(A, C, B, D);
      const S = R(10, 30) * 2, t = R(3, S / 2 - 2);
      const body = pg([A, B, C, D]) + ln(A, C) + ln(B, D) + names([A, B, C, D], ['A', 'B', 'C', 'D']) + tx(add2(O, [0, 16]), 'O');
      const v = R(0, 1);
      return {
        q: `AD∥BC の台形 ABCD で、対角線の交点を O とします。△ABC = ${S}cm²${v ? `、△OBC = ${t}cm²` : ''} のとき、${v ? '△DOC' : '△DBC'} の面積を求めなさい。${fig([A, B, C, D], body)}`,
        fields: [{ label: v ? '△DOC' : '△DBC', post: 'cm²' }], answer: [v ? S - t : S],
        hints: ['AD∥BC なので、△ABC と △DBC は底辺 BC が共通で、高さが等しいよ。', v ? `△DBC = ${S}cm²。そこから △OBC をひくと？` : '高さが等しいなら、面積は？'],
        explain: steps(v ? [`△DBC = △ABC = ${S}cm²`, `△DOC = △DBC − △OBC = ${S} − ${t} = ${S - t}cm²`] : ['底辺 BC が共通で、高さが等しい', `△DBC = △ABC = ${S}cm²`]),
      };
    },
  });

  // ===== 中2 データの活用 =====
  const med = (a) => { const n = a.length, m = Math.floor(n / 2); return n % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
  function quartiles(sorted) {
    const n = sorted.length;
    return { q1: med(sorted.slice(0, Math.floor(n / 2))), q2: med(sorted), q3: med(sorted.slice(Math.ceil(n / 2))) };
  }
  add({
    id: 'd_quartile', unit: 'u2_data', name: '四分位数', prereq: [],
    lesson: `<p class="pt">データを<b>小さい順に並べ</b>、4等分する位置の値を<b>四分位数</b>という。</p>
<p class="pt">中央値（第2四分位数）でデータを前半・後半に分け、<b>前半の中央値が第1四分位数</b>、<b>後半の中央値が第3四分位数</b>。</p>
<p class="pt">データの個数が奇数のときは、中央値をどちらにも入れない。</p>
<div class="ex">例）1, 3, 4, 6, 7, 9, 10 → 中央値 6、前半 1,3,4 → 第1四分位数 3、後半 7,9,10 → 第3四分位数 9</div>`,
    gen() {
      const n = pick([7, 8, 9, 10, 11]);
      const data = Array.from({ length: n }, () => R(0, 15)), s = data.slice().sort((x, y) => x - y), q = quartiles(s);
      const what = pick(['15点満点の小テストの得点', '1か月に読んだ本の冊数', '1週間に家で勉強した時間（時間）']);
      return {
        q: `次のデータは、${n}人の${what}です。四分位数を求めなさい。<div class="conds">${data.join(', ')}</div>`,
        dec: true, form: '小数は「.」で入力（例：6.5）',
        fields: [{ label: '第1四分位数' }, { label: '第2四分位数（中央値）' }, { label: '第3四分位数' }], answer: [String(q.q1), String(q.q2), String(q.q3)],
        hints: [`まず小さい順に並べよう：${s.join(', ')}`, `中央値は ${q.q2}。${n % 2 ? '中央値を除いた' : ''}前半 ${s.slice(0, Math.floor(n / 2)).join(', ')} と後半 ${s.slice(Math.ceil(n / 2)).join(', ')} に分けよう。`],
        explain: steps([`並べると ${s.join(', ')}`, `中央値（第2四分位数）＝ ${q.q2}`, `前半 ${s.slice(0, Math.floor(n / 2)).join(', ')} の中央値 → 第1四分位数 ${q.q1}`, `後半 ${s.slice(Math.ceil(n / 2)).join(', ')} の中央値 → 第3四分位数 ${q.q3}`]),
      };
    },
  });

  add({
    id: 'd_boxplot', unit: 'u2_data', name: '箱ひげ図', prereq: ['d_quartile'], diag: false,
    lesson: `<p class="pt"><b>箱ひげ図</b>は、最小値・第1四分位数・中央値・第3四分位数・最大値の5つを表した図。</p>
<p class="pt"><b>範囲 = 最大値 − 最小値</b><br><b>四分位範囲 = 第3四分位数 − 第1四分位数</b>（箱の長さ）</p>`,
    gen() {
      const mn = R(0, 3), q1 = mn + R(2, 5), md = q1 + R(1, 4), q3 = md + R(1, 4), mx = Math.min(25, q3 + R(2, 6));
      const X = (v) => v * 12, y = 0;
      let body = ln([X(0), 40], [X(25), 40]);
      for (let v = 0; v <= 25; v++) body += ln([X(v), 40], [X(v), v % 5 ? 44 : 47], 'thin') + (v % 5 ? '' : tx([X(v), 60], v, 'sm'));
      body += ln([X(mn), y], [X(q1), y]) + ln([X(q3), y], [X(mx), y]) + `<rect x="${X(q1)}" y="${y - 12}" width="${X(q3) - X(q1)}" height="24" class="box"/>` + ln([X(md), y - 12], [X(md), y + 12]) + ln([X(mn), y - 7], [X(mn), y + 7]) + ln([X(mx), y - 7], [X(mx), y + 7]);
      const f = fig([[X(0), -12], [X(25), 60]], body, 16, 14);
      const t = R(0, 2);
      const F = [[{ label: '中央値' }, { label: '四分位範囲' }], [{ label: '範囲' }, { label: '四分位範囲' }], [{ label: '第1四分位数' }, { label: '第3四分位数' }]][t];
      const A = [[md, q3 - q1], [mx - mn, q3 - q1], [q1, q3]][t];
      return {
        q: `次の箱ひげ図は、あるクラスの小テストの得点を表したものです。${f}`,
        fields: F, answer: A,
        hints: ['左から 最小値・第1四分位数・中央値（箱の中の線）・第3四分位数・最大値 だよ。', `読み取ると ${mn}・${q1}・${md}・${q3}・${mx}。`],
        explain: steps([`最小値 ${mn}、第1四分位数 ${q1}、中央値 ${md}、第3四分位数 ${q3}、最大値 ${mx}`, `範囲 = ${mx} − ${mn} = ${mx - mn}`, `四分位範囲 = ${q3} − ${q1} = ${q3 - q1}`]),
      };
    },
  });

  // ===== 中2 確率 =====
  add({
    id: 's2_prob_die1', unit: 'u2_prob', name: '確率（さいころ1個）', prereq: [],
    lesson: `<p class="pt">確率 = <b>（あてはまる場合の数）÷（全部の場合の数）</b></p>
<p class="pt">さいころ1個なら、全部で <b>6通り</b>。</p>
<div class="ex">例）3の倍数の目が出る確率 → 3, 6 の2通り → 2/6 = 1/3</div>`,
    gen() {
      const E = pick([
        ['偶数の目が出る', [2, 4, 6]], ['奇数の目が出る', [1, 3, 5]], ['3の倍数の目が出る', [3, 6]],
        ['4以上の目が出る', [4, 5, 6]], ['5以上の目が出る', [5, 6]], ['6の約数の目が出る', [1, 2, 3, 6]],
        ['2以下の目が出る', [1, 2]], ['素数の目が出る', [2, 3, 5]], ['1の目が出ない', [2, 3, 4, 5, 6]],
      ]);
      const k = E[1].length;
      return {
        q: `1つのさいころを投げるとき、${E[0]}確率`, form: FORM_FRAC,
        fields: [{ label: '確率', frac: true }], answer: [FS(k, 6)],
        hints: ['全部で6通り。あてはまる目はいくつある？', `あてはまる目：${E[1].join('、')} の${k}通り`],
        explain: steps([`あてはまる目：${E[1].join('、')}（${k}通り）`, `${k} ÷ 6 = ${F(k, 6)}`]),
      };
    },
  });

  add({
    id: 's2_prob_die2', unit: 'u2_prob', name: '確率（さいころ2個）', prereq: ['s2_prob_die1'],
    lesson: `<p class="pt">大小2つのさいころでは、全部で <b>6 × 6 = 36通り</b>。表をかいて数えるとミスしない。</p>
<div class="ex">例）出る目の和が 5 → (1,4)(2,3)(3,2)(4,1) の4通り → 4/36 = 1/9</div>`,
    gen() {
      let label, pairs = [];
      const t = R(0, 2);
      if (t === 0) { const s = R(3, 11); label = `出る目の数の和が ${s} になる`; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i + j === s) pairs.push([i, j]); }
      else if (t === 1) { label = '同じ目が出る'; for (let i = 1; i <= 6; i++) pairs.push([i, i]); }
      else { const s = pick([4, 6, 12]); label = `出る目の数の積が ${s} になる`; for (let i = 1; i <= 6; i++) for (let j = 1; j <= 6; j++) if (i * j === s) pairs.push([i, j]); }
      const k = pairs.length, ps = pairs.map((p) => `(${p[0]},${p[1]})`).join(' ');
      return {
        q: `大小2つのさいころを同時に投げるとき、${label}確率`, form: FORM_FRAC,
        fields: [{ label: '確率', frac: true }], answer: [FS(k, 36)],
        hints: ['全部で 6 × 6 = 36通り。（大, 小）の組で書き出そう。', `あてはまるのは ${ps} の${k}通り`],
        explain: steps([`あてはまる：${ps}（${k}通り）`, `${k} ÷ 36 = ${F(k, 36)}`]),
      };
    },
  });

  add({
    id: 's2_prob_coin', unit: 'u2_prob', name: '確率（硬貨）', prereq: ['s2_prob_die1'],
    lesson: `<p class="pt">硬貨 n 枚の表裏の出方は、全部で <b>2 を n 回かけた数</b>（2枚→4通り、3枚→8通り）。</p>
<p class="pt"><b>樹形図</b>で全部書き出すと確実。</p>
<div class="ex">例）2枚投げて1枚だけ表 → 表裏、裏表 の2通り → 2/4 = 1/2</div>`,
    gen() {
      const n = pick([2, 3]), total = 2 ** n, all = [];
      for (let i = 0; i < total; i++) { let s = ''; for (let j = n - 1; j >= 0; j--) s += (i >> j) & 1 ? '裏' : '表'; all.push(s); }
      let label, ok;
      if (Math.random() < 0.6) { const k = R(0, n); label = `表がちょうど${k}枚出る`; ok = all.filter((s) => (s.match(/表/g) || []).length === k); }
      else { label = '少なくとも1枚は表が出る'; ok = all.filter((s) => s.includes('表')); }
      const k = ok.length;
      return {
        q: `${n}枚の硬貨を同時に投げるとき、${label}確率`, form: FORM_FRAC,
        fields: [{ label: '確率', frac: true }], answer: [FS(k, total)],
        hints: [`全部で ${total}通り。樹形図で書き出そう。`, `あてはまるのは ${ok.join('、')} の${k}通り`],
        explain: steps([`全部：${all.join('、')}（${total}通り）`, `あてはまる：${k}通り`, `${k} ÷ ${total} = ${F(k, total)}`]),
      };
    },
  });

  // ---------- 単元 ----------
  const units = [
    { id: 'u1_num', grade: 1, name: '正負の数' },
    { id: 'u1_expr', grade: 1, name: '文字と式' },
    { id: 'u1_eq', grade: 1, name: '一次方程式' },
    { id: 'u1_func', grade: 1, name: '比例と反比例' },
    { id: 'u2_expr', grade: 2, name: '式の計算' },
    { id: 'u2_sys', grade: 2, name: '連立方程式' },
    { id: 'u2_lin', grade: 2, name: '一次関数' },
    { id: 'u2_geo1', grade: 2, name: '図形の調べ方' },
    { id: 'u2_geo2', grade: 2, name: '三角形と四角形' },
    { id: 'u2_data', grade: 2, name: 'データの活用' },
    { id: 'u2_prob', grade: 2, name: '確率' },
  ];

  // 「答え」の文字列を分数 {n, d} にする（−, /, 小数に対応）
  function parseAnswer(str) {
    if (str === null || str === undefined) return null;
    let s = String(str).trim().replace(/[−ー–]/g, '-').replace(/\s/g, '');
    if (s === '' || s === '-') return null;
    let n, d = 1;
    if (s.includes('/')) {
      const [a, b] = s.split('/');
      if (!/^-?\d+$/.test(a) || !/^-?\d+$/.test(b) || Number(b) === 0) return null;
      n = Number(a); d = Number(b);
    } else if (/^-?\d+(\.\d+)?$/.test(s)) {
      const dec = (s.split('.')[1] || '').length;
      d = 10 ** dec; n = Math.round(Number(s) * d);
    } else return null;
    if (d < 0) { n = -n; d = -d; }
    return { n, d };
  }
  function sameValue(input, answer) {
    const a = parseAnswer(input), b = parseAnswer(answer);
    return !!a && !!b && a.n * b.d === b.n * a.d;
  }

  // ---------- 問題バンク（あらかじめ作った問題）から出題する ----------
  // 選択式：{ q, a: 正解, w: [まちがいの選択肢…], e: 解説, h: ヒント }
  // 並べかえ：{ q: 日本語など, s: '正解の文を 空白で 区切る', e, h }
  function bankQ(it, hint) {
    const hints = [hint[0], it.h || hint[1]];
    if (it.s) {
      const tokens = it.s.split(' ');
      let sh; do { sh = shuffle(tokens); } while (tokens.length > 2 && sh.join(' ') === it.s);
      return { q: it.q, order: { tokens: sh, answer: tokens }, hints, explain: it.e || `正しい文：${it.s}` };
    }
    const opts = shuffle([it.a].concat(it.w));
    // 答えは画面の「答え：」にも出るので、解説には書かない（解説がない問題だけ答えを示す）
    return { q: it.q, choices: opts, correct: opts.indexOf(it.a), hints, explain: it.e || `答えは「${it.a}」。` };
  }
  // 全部を出し切るまで同じ問題をくり返さない
  function fromBank(items, hint) {
    let pool = [];
    return function () {
      if (!pool.length) pool = shuffle(items.map((_, i) => i));
      return bankQ(items[pool.pop()], hint);
    };
  }

  // 学年ごとのコース（スキル・単元・表示名）を組み立てる
  function buildCourse(meta, skills, unitList) {
    const unitById = {}; unitList.forEach((u) => { unitById[u.id] = u; u.skills = []; });
    const byId = {};
    skills.forEach((s) => { byId[s.id] = s; s.grade = unitById[s.unit].grade; unitById[s.unit].skills.push(s.id); });
    return Object.assign({ list: skills, byId, units: unitList, unitById, parseAnswer, sameValue }, meta);
  }

  const api = buildCourse({
    id: 'j2', title: '中学2年・数学', subj: '数学', subjKey: 'math', group: 'j2', icon: '📐', main: 2,
    gradeName: { 1: '中1', 2: '中2' }, gradeTitle: { 2: '中学2年', 1: '中学1年（復習）' },
    titles: ['はじめの一歩', '見習い', 'チャレンジャー', 'がんばり屋', '努力家', '計算名人', '数学ファイター', '数学マスター', '数学博士', '伝説の数学者'],
    goals: {
      improve: { icon: '📈', name: '学力アップ', desc: '苦手なところから、自分のペースで力をのばす' },
      exam: { icon: '📝', name: '定期テスト', desc: 'テストの日と範囲から、毎日のメニューを逆算する', names: ['中間テスト', '期末テスト'] },
      entrance: { icon: '🎓', name: '高校受験', desc: '中1から全範囲の苦手をなくし、できる所も忘れないよう復習する' },
    },
  }, list, units);
  root.COURSES = root.COURSES || {};
  root.COURSES.j2 = api;
  // ほかの学年のファイルからも使う道具
  root.SKILL_KIT = { R, RNZ, pick, gcd, lcm, shuffle, num, par, poly, F, FS, steps, sys, fig, ln, pg, tx, ang, names, tick, add2, RAD, buildCourse, fromBank, J2_GOALS: api.goals };
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
