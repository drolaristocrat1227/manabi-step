/*
 * 中2数学 スキル定義
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
    { id: 'u2_prob', grade: 2, name: '確率' },
  ];
  const unitById = {}; units.forEach((u) => { unitById[u.id] = u; u.skills = []; });
  const byId = {};
  list.forEach((s) => { byId[s.id] = s; s.grade = unitById[s.unit].grade; unitById[s.unit].skills.push(s.id); });

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

  const api = { list, byId, units, unitById, parseAnswer, sameValue };
  root.SKILLS = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
