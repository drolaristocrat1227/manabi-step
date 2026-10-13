/*
 * 小学6年・算数 スキル定義（さかのぼり用に小5の内容をふくむ）
 * 問題はすべてプログラムで自動生成し、答えは計算で求める（正解の誤りが起きない）。
 */
(function (root) {
  'use strict';
  const K = root.SKILL_KIT;
  const { R, pick, gcd, lcm, shuffle, F, FS, steps, fig, ln, pg, tx, buildCourse } = K;
  // 約分しないで見せる分数（途中式用）
  const fr = (n, d) => `<span class="fr"><span>${n}</span><span>${d}</span></span>`;

  // 小数を「2.35」のような文字列に（計算の誤差を消す）
  const ds = (x) => String(Math.round(x * 10000) / 10000);
  // 帯分数の見た目（例：7/3 → 2⅓）
  function MX(n, d) {
    const g = gcd(n, d); n /= g; d /= g;
    if (d === 1 || n < d) return F(n, d);
    return Math.floor(n / d) + F(n % d, d);
  }
  const both = (n, d) => { const g = gcd(n, d); return n / g >= d / g && d / g !== 1 ? `${F(n, d)}（= ${MX(n, d)}）` : F(n, d); };
  const FRAC = { label: '答え', frac: true, lowest: true };
  const FORM_FR = '分数は <b>①分母 → ②分子</b> の順に入れよう。約分して、仮分数のままでOK';
  const DEC = '小数は「.」で入力（例：28.26）';
  const circle = (c, r, cls = '') => `<circle cx="${c[0]}" cy="${c[1]}" r="${r}" class="${cls}"/>`;

  const list = [];
  const add = (s) => list.push(s);

  // ===== 小5 整数と分数 =====
  add({
    id: 'e5_lcm_gcd', unit: 'u5_int', name: '公倍数と公約数', prereq: [],
    lesson: `<p class="pt">2つの数に共通な倍数を<b>公倍数</b>、いちばん小さいものを<b>最小公倍数</b>という。</p>
<p class="pt">2つの数に共通な約数を<b>公約数</b>、いちばん大きいものを<b>最大公約数</b>という。</p>
<div class="ex">例）4 と 6 → 最小公倍数 12、最大公約数 2</div>`,
    gen() {
      let a, b; do { a = R(2, 12); b = R(2, 12); } while (a === b || lcm(a, b) > 72);
      const L = lcm(a, b), G = gcd(a, b);
      const mult = (n) => Array.from({ length: Math.min(6, Math.ceil(L / n) + 1) }, (_, i) => n * (i + 1)).join('、');
      return {
        q: `${a} と ${b} の最小公倍数と最大公約数を求めましょう。`,
        fields: [{ label: '最小公倍数' }, { label: '最大公約数' }], answer: [L, G],
        hints: [`${a} の倍数：${mult(a)}…　${b} の倍数：${mult(b)}…`, `${a} の約数と ${b} の約数を書き出して、共通なものをさがそう。`],
        explain: steps([`共通な倍数でいちばん小さいのは ${L}`, `共通な約数でいちばん大きいのは ${G}`]),
      };
    },
  });

  add({
    id: 'e5_frac_reduce', unit: 'u5_int', name: '約分', prereq: ['e5_lcm_gcd'],
    lesson: `<p class="pt">分母と分子を、同じ数（公約数）でわって簡単にすることを<b>約分</b>という。</p>
<p class="pt"><b>最大公約数</b>でわると、1回で約分できる。</p>
<div class="ex">例）12/18 → 分母と分子を 6 でわって 2/3</div>`,
    gen() {
      let n0, d0; do { d0 = R(3, 12); n0 = R(1, d0 - 1); } while (gcd(n0, d0) !== 1);
      const k = R(2, 8), n = n0 * k, d = d0 * k;
      return {
        q: `${fr(n, d)} を約分しましょう。`, form: FORM_FR,
        fields: [FRAC], answer: [`${n0}/${d0}`],
        hints: [`${n} と ${d} の公約数をさがそう。`, `最大公約数は ${k}。分母と分子を ${k} でわろう。`],
        explain: steps([`分母と分子を ${k} でわる`, `${n} ÷ ${k} = ${n0}、${d} ÷ ${k} = ${d0}`, `答え ${F(n0, d0)}`]),
      };
    },
  });

  add({
    id: 'e5_frac_add', unit: 'u5_int', name: '分数のたし算・ひき算', prereq: ['e5_frac_reduce'],
    lesson: `<p class="pt">分母がちがうときは、<b>通分</b>（分母をそろえる）してから計算する。</p>
<p class="pt">答えが約分できるときは約分する。</p>
<div class="ex">例）1/2 + 1/3 = 3/6 + 2/6 = 5/6</div>`,
    gen() {
      let a, b, c, d, plus;
      do { b = R(2, 9); d = R(2, 9); a = R(1, b - 1); c = R(1, d - 1); plus = Math.random() < 0.55; } while (b === d || (!plus && a * d <= c * b) || gcd(a, b) !== 1 || gcd(c, d) !== 1);
      const L = lcm(b, d), A = a * (L / b), C = c * (L / d), N = plus ? A + C : A - C;
      return {
        q: `${F(a, b)} ${plus ? '+' : '−'} ${F(c, d)}`, form: FORM_FR,
        fields: [FRAC], answer: [FS(N, L)],
        hints: [`分母を ${b} と ${d} の最小公倍数 ${L} にそろえよう（通分）。`, `${fr(A, L)} ${plus ? '+' : '−'} ${fr(C, L)}`],
        explain: steps([`通分すると ${fr(A, L)} ${plus ? '+' : '−'} ${fr(C, L)}`, `= ${fr(N, L)}`, `答え ${both(N, L)}`]),
      };
    },
  });

  // ===== 小5 小数のかけ算・わり算 =====
  add({
    id: 'e5_dec_muldiv', unit: 'u5_dec', name: '小数のかけ算・わり算', prereq: [],
    lesson: `<p class="pt">かけ算：小数点がないものとして計算し、<b>かけられる数とかける数の小数点の右のけた数の和</b>だけ、右から数えて小数点をうつ。</p>
<p class="pt">わり算：わる数が整数になるように、<b>わる数とわられる数の小数点を同じだけ右へ</b>移す。</p>
<div class="ex">例）1.2 × 0.3 = 0.36　　7.2 ÷ 0.8 = 72 ÷ 8 = 9</div>`,
    gen() {
      const t = R(0, 2);
      if (t === 0) {
        const a = R(11, 99), b = R(2, 9);
        return { q: `${ds(a / 10)} × ${b}`, dec: true, form: DEC, fields: [{ label: '答え' }], answer: [ds(a * b / 10)],
          hints: [`まず ${a} × ${b} を計算しよう。`, `${a} × ${b} = ${a * b}。小数点の右に1けた。`], explain: steps([`${a} × ${b} = ${a * b}`, `小数点を1けたうって ${ds(a * b / 10)}`]) };
      }
      if (t === 1) {
        const a = R(11, 99), b = R(2, 9);
        return { q: `${ds(a / 10)} × ${ds(b / 10)}`, dec: true, form: DEC, fields: [{ label: '答え' }], answer: [ds(a * b / 100)],
          hints: [`まず ${a} × ${b} を計算しよう。`, `小数点の右のけた数は、あわせて 1 + 1 = 2けた。`], explain: steps([`${a} × ${b} = ${a * b}`, `小数点を2けたうって ${ds(a * b / 100)}`]) };
      }
      const q = R(2, 12), dv = R(2, 9), byDec = Math.random() < 0.5;
      const divisor = byDec ? dv / 10 : dv, dividend = q * divisor;
      return { q: `${ds(dividend)} ÷ ${ds(divisor)}`, dec: true, form: DEC, fields: [{ label: '答え' }], answer: [String(q)],
        hints: [byDec ? 'わる数が整数になるように、両方の小数点を1けた右へ移そう。' : `${ds(dividend)} を ${dv} でわろう。`, byDec ? `${ds(dividend * 10)} ÷ ${dv}` : `九九の ${dv} の段で考えよう。`],
        explain: steps([byDec ? `${ds(dividend)} ÷ ${ds(divisor)} = ${ds(dividend * 10)} ÷ ${dv}` : `${ds(dividend)} ÷ ${dv}`, `= ${q}`]) };
    },
  });

  // ===== 小5 割合と速さ =====
  add({
    id: 'e5_ratio_pct', unit: 'u5_rate', name: '割合（百分率）', prereq: ['e5_dec_muldiv'],
    lesson: `<p class="pt"><b>比べられる量 = もとにする量 × 割合</b></p>
<p class="pt"><b>割合 = 比べられる量 ÷ もとにする量</b>。割合 0.01 を <b>1%</b> という。</p>
<div class="ex">例）300円の 20% → 300 × 0.2 = 60円</div>`,
    gen() {
      let base, pct; do { base = pick([200, 300, 400, 500, 600, 800, 1200, 1500, 2000]); pct = pick([5, 10, 15, 20, 25, 30, 40, 60, 75, 80, 120, 150]); } while ((base * pct) % 100);
      const part = base * pct / 100, t = R(0, 2);
      if (t === 0) return { q: `${base}円の ${pct}% は何円ですか。`, fields: [{ label: '答え', post: '円' }], answer: [part],
        hints: [`${pct}% を小数にすると ${ds(pct / 100)}。`, `${base} × ${ds(pct / 100)}`], explain: steps([`${pct}% = ${ds(pct / 100)}`, `${base} × ${ds(pct / 100)} = ${part}円`]) };
      if (t === 1) return { q: `${part}人は、${base}人の何%ですか。`, fields: [{ label: '答え', post: '%' }], answer: [pct],
        hints: ['割合 = 比べられる量 ÷ もとにする量。', `${part} ÷ ${base} = ${ds(pct / 100)}。これを百分率にすると？`], explain: steps([`${part} ÷ ${base} = ${ds(pct / 100)}`, `${ds(pct / 100)} → ${pct}%`]) };
      return { q: `ある数の ${pct}% が ${part} です。ある数はいくつですか。`, fields: [{ label: 'ある数' }], answer: [base],
        hints: ['もとにする量 = 比べられる量 ÷ 割合。', `${part} ÷ ${ds(pct / 100)}`], explain: steps([`${part} ÷ ${ds(pct / 100)} = ${base}`]) };
    },
  });

  add({
    id: 'e5_speed', unit: 'u5_rate', name: '速さ・道のり・時間', prereq: ['e5_dec_muldiv'],
    lesson: `<p class="pt"><b>速さ = 道のり ÷ 時間</b></p>
<p class="pt"><b>道のり = 速さ × 時間</b>　　<b>時間 = 道のり ÷ 速さ</b></p>
<div class="ex">例）時速 40km で 3時間 → 40 × 3 = 120km</div>`,
    gen() {
      const byMin = Math.random() < 0.4;
      const v = byMin ? pick([50, 60, 70, 80, 150, 200]) : pick([4, 5, 12, 15, 30, 40, 45, 60, 80]);
      const t = byMin ? R(4, 15) : R(2, 6), d = v * t, U = byMin ? ['分速', 'm', '分'] : ['時速', 'km', '時間'];
      const k = R(0, 2);
      if (k === 0) return { q: `${U[0]} ${v}${U[1]} で ${t}${U[2]} 進むと、道のりは何${U[1]}ですか。`, fields: [{ label: '道のり', post: U[1] }], answer: [d],
        hints: ['道のり = 速さ × 時間。', `${v} × ${t}`], explain: steps([`${v} × ${t} = ${d}${U[1]}`]) };
      if (k === 1) return { q: `${d}${U[1]} の道のりを ${t}${U[2]} で進みました。速さは${U[0]}何${U[1]}ですか。`, fields: [{ label: U[0], post: U[1] }], answer: [v],
        hints: ['速さ = 道のり ÷ 時間。', `${d} ÷ ${t}`], explain: steps([`${d} ÷ ${t} = ${v}`, `${U[0]} ${v}${U[1]}`]) };
      return { q: `${U[0]} ${v}${U[1]} で ${d}${U[1]} 進むには、何${U[2]}かかりますか。`, fields: [{ label: '時間', post: U[2] }], answer: [t],
        hints: ['時間 = 道のり ÷ 速さ。', `${d} ÷ ${v}`], explain: steps([`${d} ÷ ${v} = ${t}${U[2]}`]) };
    },
  });

  add({
    id: 'e5_average', unit: 'u5_rate', name: '平均', prereq: ['e5_dec_muldiv'],
    lesson: `<p class="pt"><b>平均 = 合計 ÷ 個数</b></p>
<div class="ex">例）6点、8点、7点 の平均 → (6 + 8 + 7) ÷ 3 = 7点</div>`,
    gen() {
      const n = R(4, 6), avg = R(5, 18);
      let vals = Array.from({ length: n }, () => avg + R(-4, 4));
      vals[n - 1] = avg * n - vals.slice(0, -1).reduce((a, b) => a + b, 0);
      if (vals[n - 1] < 0) vals = vals.map(() => avg);
      const what = pick([['ある週の毎日の読書の時間', '分'], ['5年生の小テストの得点', '点'], ['1日に集めたペットボトルの数', '本']]);
      return {
        q: `次の数は、${what[0]}です。平均を求めましょう。<div class="conds">${vals.map((v) => v + what[1]).join('、')}</div>`,
        fields: [{ label: '平均', post: what[1] }], answer: [avg],
        hints: ['まず全部をたして合計を出そう。', `合計 ${avg * n} を ${n} でわろう。`],
        explain: steps([`合計 ${vals.join(' + ')} = ${avg * n}`, `${avg * n} ÷ ${n} = ${avg}${what[1]}`]),
      };
    },
  });

  // ===== 小5 面積 =====
  add({
    id: 'e5_area', unit: 'u5_area', name: '三角形・四角形の面積', prereq: [],
    lesson: `<p class="pt"><b>三角形</b> = 底辺 × 高さ ÷ 2</p>
<p class="pt"><b>平行四辺形</b> = 底辺 × 高さ</p>
<p class="pt"><b>台形</b> = (上底 + 下底) × 高さ ÷ 2</p>`,
    gen() {
      const t = R(0, 2), h = R(3, 12);
      let b = R(4, 14), a = R(2, b - 1), body, area, name, how;
      if (t === 0 && (b * h) % 2) b++;
      if (t === 2 && ((a + b) * h) % 2) a = a > 2 ? a - 1 : a + 1;
      const W = 200, H = 110, lab = (p, s) => tx(p, s, 'lbl');
      const hl = (x, y0) => ln([x, y0], [x, H], 'thin dash') + `<path d="M${x} ${H - 10} h10 v10" class="thin"/>`;
      if (t === 0) {
        const A = [70, 0], B = [0, H], C = [W, H];
        body = pg([A, B, C]) + hl(70, 0) + lab([W / 2, H + 16], b + 'cm') + lab([92, H / 2], h + 'cm');
        area = b * h / 2; name = '三角形'; how = `${b} × ${h} ÷ 2 = ${area}`;
      } else if (t === 1) {
        const A = [50, 0], D = [W + 50, 0], B = [0, H], C = [W, H];
        body = pg([A, B, C, D]) + hl(60, 0) + lab([W / 2, H + 16], b + 'cm') + lab([82, H / 2], h + 'cm');
        area = b * h; name = '平行四辺形'; how = `${b} × ${h} = ${area}`;
      } else {
        const A = [50, 0], D = [150, 0], B = [0, H], C = [W, H];
        body = pg([A, B, C, D]) + hl(60, 0) + lab([100, -14], a + 'cm') + lab([W / 2, H + 16], b + 'cm') + lab([82, H / 2], h + 'cm');
        area = (a + b) * h / 2; name = '台形'; how = `(${a} + ${b}) × ${h} ÷ 2 = ${area}`;
      }
      return {
        q: `次の${name}の面積を求めましょう。${fig([[0, -14], [W + (t === 1 ? 50 : 0), H + 16]], body, 20, 16)}`,
        fields: [{ label: '面積', post: 'cm²' }], answer: [area],
        hints: [{ 0: '三角形の面積 = 底辺 × 高さ ÷ 2', 1: '平行四辺形の面積 = 底辺 × 高さ', 2: '台形の面積 = (上底 + 下底) × 高さ ÷ 2' }[t], `式：${how.split(' = ')[0]}`],
        explain: steps([`${how}cm²`]),
      };
    },
  });

  // ===== 小6 対称な図形 =====
  const SYM = ['線対称だけ', '点対称だけ', '線対称でも点対称でもある', 'どちらでもない'];
  add({
    id: 'e6_symmetry', unit: 'u6_sym', name: '線対称と点対称', prereq: [],
    lesson: `<p class="pt"><b>線対称</b>：1本の直線（<b>対称の軸</b>）で折ると、ぴったり重なる形。</p>
<p class="pt"><b>点対称</b>：ある点（<b>対称の中心</b>）のまわりに 180° 回すと、もとの形にぴったり重なる形。</p>
<div class="ex">例）正方形は線対称（軸4本）でも、点対称でもある。平行四辺形は点対称だけ。</div>`,
    gen() {
      if (Math.random() < 0.5) {
        const S = pick([['正三角形', 3], ['正方形', 4], ['長方形', 2], ['ひし形', 2], ['正五角形', 5], ['正六角形', 6], ['二等辺三角形', 1], ['正八角形', 8]]);
        return {
          q: `${S[0]}には、対称の軸が何本ありますか。`, fields: [{ label: '対称の軸', post: '本' }], answer: [S[1]],
          hints: ['紙に図をかいて、折ってぴったり重なる線をさがそう。', S[0].startsWith('正') ? '正多角形の対称の軸の数は、頂点の数と同じだよ。' : '辺のまん中や、頂点を通る線を試そう。'],
          explain: steps([`${S[0]}の対称の軸は ${S[1]}本`]),
        };
      }
      const S = pick([['正三角形', 0], ['正方形', 2], ['長方形', 2], ['ひし形', 2], ['平行四辺形', 1], ['正五角形', 0], ['正六角形', 2], ['円', 2], ['二等辺三角形', 0], ['3つの辺の長さがすべてちがう三角形', 3]]);
      return {
        q: `「${S[0]}」は、線対称・点対称のどれですか。`, choices: SYM, correct: S[1],
        hints: ['折って重なれば線対称。180° 回して重なれば点対称。', '頂点の数が奇数の正多角形は、点対称にはならないよ。'],
        explain: steps([`${S[0]} → ${SYM[S[1]]}`]),
      };
    },
  });

  // ===== 小6 文字と式 =====
  add({
    id: 'e6_letter', unit: 'u6_letter', name: '文字と式（x の値）', prereq: ['e5_dec_muldiv'],
    lesson: `<p class="pt">わからない数を <b>x</b> などの文字で表して、式に表す。</p>
<p class="pt">x を求めるときは、<b>逆の計算</b>をする（かけ算 ↔ わり算、たし算 ↔ ひき算）。</p>
<div class="ex">例）x × 6 = 48 → x = 48 ÷ 6 = 8</div>`,
    gen() {
      const t = R(0, 3), x = R(2, 15);
      if (t === 0) { const a = R(2, 9); return { q: `x × ${a} = ${a * x}　の x を求めましょう。`, fields: [{ label: 'x =' }], answer: [x], hints: ['かけ算の逆はわり算。', `x = ${a * x} ÷ ${a}`], explain: steps([`x = ${a * x} ÷ ${a} = ${x}`]) }; }
      if (t === 1) { const a = R(5, 40); return { q: `x + ${a} = ${a + x}　の x を求めましょう。`, fields: [{ label: 'x =' }], answer: [x], hints: ['たし算の逆はひき算。', `x = ${a + x} − ${a}`], explain: steps([`x = ${a + x} − ${a} = ${x}`]) }; }
      if (t === 2) {
        const p = R(3, 12) * 10, n = R(2, 6), box = pick([50, 80, 100, 120]), tot = p * n + box;
        return { q: `1個 x 円のおかしを ${n}個買って、${box}円の箱に入れてもらったら、代金は ${tot}円でした。x を求めましょう。`, fields: [{ label: 'x =', post: '円' }], answer: [p],
          hints: [`式に表すと　x × ${n} + ${box} = ${tot}`, `まず箱の代金をひこう：x × ${n} = ${tot - box}`], explain: steps([`x × ${n} + ${box} = ${tot}`, `x × ${n} = ${tot - box}`, `x = ${tot - box} ÷ ${n} = ${p}`]) };
      }
      const a = R(2, 9), b = R(1, 20);
      return { q: `x の値が ${x} のとき、x × ${a} + ${b} の値を求めましょう。`, fields: [{ label: '答え' }], answer: [x * a + b], hints: ['x のところに数を入れよう。', `${x} × ${a} + ${b}`], explain: steps([`${x} × ${a} + ${b} = ${x * a} + ${b} = ${x * a + b}`]) };
    },
  });

  // ===== 小6 分数のかけ算・わり算 =====
  const randFrac = (maxD = 9) => { let n, d; do { d = R(2, maxD); n = R(1, d + 3); } while (gcd(n, d) !== 1 || n === d); return [n, d]; };
  add({
    id: 'e6_frac_mul', unit: 'u6_frac', name: '分数のかけ算', prereq: ['e5_frac_reduce'],
    lesson: `<p class="pt">分数 × 分数は、<b>分母どうし、分子どうしをかける</b>。</p>
<p class="pt">とちゅうで<b>約分</b>してから計算すると楽。</p>
<div class="ex">例）2/3 × 9/4 = (2 × 9)/(3 × 4) = 3/2</div>`,
    gen() {
      const [a, b] = randFrac(), byInt = Math.random() < 0.3;
      const [c, d] = byInt ? [R(2, 9), 1] : randFrac();
      const N = a * c, D = b * d;
      return {
        q: `${F(a, b)} × ${byInt ? c : F(c, d)}`, form: FORM_FR, fields: [FRAC], answer: [FS(N, D)],
        hints: [byInt ? '分数 × 整数は、分子に整数をかけるよ。' : '分母どうし、分子どうしをかけよう。', 'かける前に、分母と分子で約分できるものをさがそう。'],
        explain: steps([`= <span class="fr"><span>${a} × ${c}</span><span>${b}${byInt ? '' : ' × ' + d}</span></span>`, `= ${both(N, D)}`]),
      };
    },
  });

  add({
    id: 'e6_frac_div', unit: 'u6_frac', name: '分数のわり算', prereq: ['e6_frac_mul'],
    lesson: `<p class="pt">分数でわるときは、<b>わる数の逆数をかける</b>（分母と分子を入れかえてかける）。</p>
<div class="ex">例）3/4 ÷ 2/5 = 3/4 × 5/2 = 15/8</div>`,
    gen() {
      const [a, b] = randFrac(), byInt = Math.random() < 0.3;
      const [c, d] = byInt ? [R(2, 9), 1] : randFrac();
      const N = a * d, D = b * c;
      return {
        q: `${F(a, b)} ÷ ${byInt ? c : F(c, d)}`, form: FORM_FR, fields: [FRAC], answer: [FS(N, D)],
        hints: ['わる数の逆数をかけよう。', `${F(a, b)} × ${byInt ? F(1, c) : `${fr(d, c)}`}`],
        explain: steps([`= ${F(a, b)} × ${byInt ? `<span class="fr"><span>1</span><span>${c}</span></span>` : `${fr(d, c)}`}`, `= ${both(N, D)}`]),
      };
    },
  });

  add({
    id: 'e6_frac_mix', unit: 'u6_frac', name: '逆数・分数と小数の計算', prereq: ['e6_frac_div', 'e5_frac_add'], diag: false,
    lesson: `<p class="pt">2つの数の積が 1 になるとき、一方を他方の<b>逆数</b>という（2/3 の逆数は 3/2）。</p>
<p class="pt">分数と小数がまじった計算は、<b>小数を分数になおす</b>と計算しやすい（0.4 = 2/5）。</p>
<p class="pt">かけ算とわり算がまじった式は、<b>わり算を逆数のかけ算になおして</b>、まとめて計算する。</p>`,
    gen() {
      const t = R(0, 2);
      if (t === 0) {
        const intQ = Math.random() < 0.3, [a, b] = randFrac(), n = R(2, 9);
        return { q: `${intQ ? n : F(a, b)} の逆数を求めましょう。`, form: FORM_FR, fields: [FRAC], answer: [intQ ? `1/${n}` : FS(b, a)],
          hints: ['分母と分子を入れかえた数が逆数。', intQ ? `${n} = ${n}/1 と考えよう。` : 'かけて 1 になる数だよ。'], explain: steps([intQ ? `${n} = <span class="fr"><span>${n}</span><span>1</span></span> → 逆数 ${F(1, n)}` : `${F(a, b)} → 逆数 ${fr(b, a)}`]) };
      }
      if (t === 1) {
        const dec = pick([[2, 10], [4, 10], [5, 10], [6, 10], [8, 10], [25, 100], [75, 100], [12, 10], [15, 10]]), [c, d] = randFrac();
        const mul = Math.random() < 0.5, N = mul ? dec[0] * c : dec[0] * d, D = mul ? dec[1] * d : dec[1] * c;
        return { q: `${ds(dec[0] / dec[1])} ${mul ? '×' : '÷'} ${F(c, d)}`, form: FORM_FR, fields: [FRAC], answer: [FS(N, D)],
          hints: [`${ds(dec[0] / dec[1])} を分数になおすと ${F(dec[0], dec[1])}。`, mul ? 'あとは分数のかけ算。' : 'わる数の逆数をかけよう。'], explain: steps([`${ds(dec[0] / dec[1])} = ${F(dec[0], dec[1])}`, `答え ${both(N, D)}`]) };
      }
      const [a, b] = randFrac(6), [c, d] = randFrac(6), [e, f] = randFrac(6);
      const N = a * c * f, D = b * d * e;
      return { q: `${F(a, b)} × ${F(c, d)} ÷ ${F(e, f)}`, form: FORM_FR, fields: [FRAC], answer: [FS(N, D)],
        hints: ['÷ の部分を、逆数のかけ算になおそう。', `${F(a, b)} × ${F(c, d)} × ${fr(f, e)}`],
        explain: steps([`= ${F(a, b)} × ${F(c, d)} × ${fr(f, e)}`, `= ${both(N, D)}`]) };
    },
  });

  // ===== 小6 比 =====
  const FORM_RATIO = '<b>□ : □</b> の形で、できるだけ小さい整数の比にしよう';
  add({
    id: 'e6_ratio', unit: 'u6_ratio', name: '比を簡単にする', prereq: ['e5_lcm_gcd'],
    lesson: `<p class="pt">比の両方に<b>同じ数をかけても、同じ数でわっても</b>、比は等しい。</p>
<p class="pt">できるだけ小さい整数の比にすることを「<b>比を簡単にする</b>」という。</p>
<div class="ex">例）12 : 18 = 2 : 3（6 でわる）　0.6 : 1.5 = 6 : 15 = 2 : 5</div>`,
    gen() {
      let p, q; do { p = R(1, 9); q = R(1, 9); } while (p === q || gcd(p, q) !== 1);
      const t = R(0, 2);
      let show, how;
      if (t === 0) { const k = R(2, 9); show = `${p * k} : ${q * k}`; how = `両方を ${k} でわる`; }
      else if (t === 1) { const k = pick([1, 2, 3]); show = `${ds(p * k / 10)} : ${ds(q * k / 10)}`; how = `両方に 10 をかけて ${p * k} : ${q * k}${k > 1 ? `、さらに ${k} でわる` : ''}`; }
      else {
        let a, b, c, d; do { b = R(2, 6); d = R(2, 6); a = R(1, b); c = R(1, d); } while (b === d || gcd(a, b) !== 1 || gcd(c, d) !== 1);
        const L = lcm(b, d), x = a * L / b, y = c * L / d, g = gcd(x, y); p = x / g; q = y / g;
        show = `${F(a, b)} : ${F(c, d)}`; how = `両方に ${L} をかけて ${x} : ${y}${g > 1 ? `、さらに ${g} でわる` : ''}`;
      }
      return {
        q: `${show} を簡単にしましょう。`, form: FORM_RATIO,
        fields: [{ label: '前の数' }, { label: '後ろの数' }], answer: [p, q],
        hints: [t === 0 ? '両方を同じ数（公約数）でわろう。' : t === 1 ? 'まず両方に 10 をかけて、整数の比にしよう。' : 'まず両方に分母の最小公倍数をかけて、整数の比にしよう。', `${how}。もっとわれないかな？`],
        explain: steps([`${how}`, `${show} = ${p} : ${q}`]),
      };
    },
  });

  add({
    id: 'e6_ratio_eq', unit: 'u6_ratio', name: '等しい比', prereq: ['e6_ratio'],
    lesson: `<p class="pt">a : b = c : d のとき、<b>何倍になっているか</b>を考えると、わからない数が求められる。</p>
<div class="ex">例）3 : 5 = 12 : x → 3 が 12 で 4倍、x = 5 × 4 = 20</div>`,
    gen() {
      let a, b; do { a = R(1, 9); b = R(1, 9); } while (a === b || gcd(a, b) !== 1);
      const k = R(2, 9), left = Math.random() < 0.5;
      return {
        q: left ? `${a} : ${b} = ${a * k} : x　の x を求めましょう。` : `${a} : ${b} = x : ${b * k}　の x を求めましょう。`,
        fields: [{ label: 'x =' }], answer: [left ? b * k : a * k],
        hints: [left ? `${a} が ${a * k} になるのは何倍？` : `${b} が ${b * k} になるのは何倍？`, `${k}倍だよ。`],
        explain: steps([`${k}倍になっている`, left ? `x = ${b} × ${k} = ${b * k}` : `x = ${a} × ${k} = ${a * k}`]),
      };
    },
  });

  add({
    id: 'e6_ratio_use', unit: 'u6_ratio', name: '比の利用', prereq: ['e6_ratio_eq'], diag: false,
    lesson: `<p class="pt">全体を a : b に分けるとき、全体は <b>a + b</b> にあたる。</p>
<div class="ex">例）1000円を 3 : 2 に分ける → 全体が 5、1つ分は 200円 → 600円 と 400円</div>`,
    gen() {
      let a, b; do { a = R(1, 7); b = R(1, 7); } while (a === b || gcd(a, b) !== 1);
      const u = pick([20, 30, 40, 50, 60, 100, 150, 200]), tot = (a + b) * u;
      if (Math.random() < 0.5) {
        return { q: `${tot}円を、兄と弟で ${a} : ${b} になるように分けます。兄は何円になりますか。`, fields: [{ label: '兄', post: '円' }], answer: [a * u],
          hints: [`全体は ${a} + ${b} = ${a + b} にあたるよ。`, `1つ分は ${tot} ÷ ${a + b} = ${u}円。`], explain: steps([`全体 ${a + b} → 1つ分 ${tot} ÷ ${a + b} = ${u}円`, `兄 ${u} × ${a} = ${a * u}円`]) };
      }
      return { q: `たてと横の長さの比が ${a} : ${b} の長方形があります。たてが ${a * u / 10}cm のとき、横は何cmですか。`, fields: [{ label: '横', post: 'cm' }], answer: [ds(b * u / 10)], dec: true, form: DEC,
        hints: [`${a} : ${b} = ${a * u / 10} : x と考えよう。`, `${a} が ${a * u / 10} になるのは ${ds(u / 10)}倍。`], explain: steps([`${a} : ${b} = ${a * u / 10} : x`, `x = ${b} × ${ds(u / 10)} = ${ds(b * u / 10)}cm`]) };
    },
  });

  // ===== 小6 拡大図と縮図 =====
  add({
    id: 'e6_scale', unit: 'u6_scale', name: '拡大図・縮図と縮尺', prereq: ['e6_ratio', 'e5_dec_muldiv'],
    lesson: `<p class="pt"><b>拡大図・縮図</b>は、対応する<b>角の大きさは等しく</b>、辺の長さの比はすべて等しい。</p>
<p class="pt"><b>縮尺</b> 1/25000 は、実際の長さを 25000分の1 にしたもの。<b>実際の長さ = 地図上の長さ × 25000</b></p>
<div class="ex">例）1/25000 の地図で 4cm → 4 × 25000 = 100000cm = 1000m</div>`,
    gen() {
      const t = R(0, 2);
      if (t === 0) {
        const s = pick([10000, 20000, 25000, 50000]), cm = R(2, 9), m = cm * s / 100;
        return { q: `縮尺 ${F(1, s)} の地図で ${cm}cm の長さは、実際には何m ですか。`, fields: [{ label: '実際', post: 'm' }], answer: [m],
          hints: [`実際の長さ = ${cm} × ${s}（単位は cm）`, `${cm * s}cm を m になおそう（100cm = 1m）。`], explain: steps([`${cm} × ${s} = ${cm * s}cm`, `${cm * s}cm = ${m}m`]) };
      }
      if (t === 1) {
        const s = pick([10000, 20000, 25000, 50000]), cm = R(2, 9), m = cm * s / 100;
        return { q: `実際の長さが ${m}m のきょりは、縮尺 ${F(1, s)} の地図では何cm ですか。`, fields: [{ label: '地図上', post: 'cm' }], answer: [cm],
          hints: [`${m}m を cm になおすと ${m * 100}cm。`, `${m * 100} ÷ ${s}`], explain: steps([`${m}m = ${m * 100}cm`, `${m * 100} ÷ ${s} = ${cm}cm`]) };
      }
      const k = pick([2, 3, 4]), big = Math.random() < 0.5, side = R(2, 9);
      return big
        ? { q: `辺の長さが ${side}cm の三角形の ${k}倍の拡大図をかきます。この辺に対応する辺は何cm になりますか。`, fields: [{ label: '答え', post: 'cm' }], answer: [side * k], hints: ['拡大図では、すべての辺が同じ倍の長さになるよ。', `${side} × ${k}`], explain: steps([`${side} × ${k} = ${side * k}cm`]) }
        : { q: `辺の長さが ${side * k}cm の四角形の ${F(1, k)} の縮図をかきます。この辺に対応する辺は何cm になりますか。`, fields: [{ label: '答え', post: 'cm' }], answer: [side], hints: ['縮図では、すべての辺が同じ割合で短くなるよ。', `${side * k} ÷ ${k}`], explain: steps([`${side * k} × ${F(1, k)} = ${side}cm`]) };
    },
  });

  // ===== 小6 円の面積 =====
  add({
    id: 'e6_circle', unit: 'u6_circle', name: '円の面積', prereq: ['e5_area', 'e5_dec_muldiv'],
    lesson: `<p class="pt"><b>円の面積 = 半径 × 半径 × 3.14</b></p>
<p class="pt">半円はその <b>÷ 2</b>、円の 1/4 は <b>÷ 4</b>。直径が出ているときは、まず半径（直径 ÷ 2）を出す。</p>
<div class="ex">例）半径 3cm → 3 × 3 × 3.14 = 28.26cm²</div>`,
    gen() {
      const r = R(2, 10), t = R(0, 3), c = [80, 80], S = 70;
      const div = t === 2 ? 2 : t === 3 ? 4 : 1, area = ds(314 * r * r / 100 / div);
      let body, name;
      if (t <= 1) {
        body = circle(c, S) + ln(c, t === 0 ? [c[0] + S, c[1]] : [c[0] - S, c[1]]) + (t === 1 ? ln(c, [c[0] + S, c[1]]) : '') + `<circle cx="${c[0]}" cy="${c[1]}" r="2.5" class="dot"/>`
          + tx([t === 0 ? c[0] + S / 2 : c[0], c[1] - 12], t === 0 ? r + 'cm' : 2 * r + 'cm', 'lbl');
        name = t === 0 ? `半径 ${r}cm の円` : `直径 ${2 * r}cm の円`;
      } else if (t === 2) {
        body = `<path d="M${c[0] - S} ${c[1]} A${S} ${S} 0 0 1 ${c[0] + S} ${c[1]} Z"/>` + ln(c, [c[0] + S, c[1]], 'thin') + tx([c[0] + S / 2, c[1] + 14], r + 'cm', 'lbl');
        name = `半径 ${r}cm の半円`;
      } else {
        body = `<path d="M${c[0]} ${c[1]} L${c[0] + S} ${c[1]} A${S} ${S} 0 0 0 ${c[0]} ${c[1] - S} Z"/>` + tx([c[0] + S / 2, c[1] + 14], r + 'cm', 'lbl');
        name = `半径 ${r}cm の円を 4等分した形（おうぎ形）`;
      }
      const pts = t === 3 ? [[c[0], c[1] - S], [c[0] + S, c[1] + 14]] : t === 2 ? [[c[0] - S, c[1] - S], [c[0] + S, c[1] + 14]] : [[c[0] - S, c[1] - S], [c[0] + S, c[1] + S]];
      return {
        q: `${name}の面積を求めましょう。円周率は 3.14 とします。${fig(pts, body, 20, 14)}`, dec: true, form: DEC,
        fields: [{ label: '面積', post: 'cm²' }], answer: [area],
        hints: [t === 1 ? `まず半径を出そう：${2 * r} ÷ 2 = ${r}cm` : '円の面積 = 半径 × 半径 × 3.14', `${r} × ${r} × 3.14${div > 1 ? ' ÷ ' + div : ''}`],
        explain: steps([`${r} × ${r} × 3.14${div > 1 ? ' ÷ ' + div : ''} = ${area}cm²`]),
      };
    },
  });

  // ===== 小6 角柱と円柱の体積 =====
  add({
    id: 'e6_volume', unit: 'u6_vol', name: '角柱と円柱の体積', prereq: ['e6_circle'], diag: false,
    lesson: `<p class="pt"><b>角柱・円柱の体積 = 底面積 × 高さ</b></p>
<p class="pt">円柱の底面積は、半径 × 半径 × 3.14。</p>
<div class="ex">例）底面の半径 2cm、高さ 5cm の円柱 → 2 × 2 × 3.14 × 5 = 62.8cm³</div>`,
    gen() {
      const t = R(0, 2), h = R(3, 12);
      if (t === 0) { const s = R(6, 40); return { q: `底面積が ${s}cm²、高さが ${h}cm の角柱の体積を求めましょう。`, fields: [{ label: '体積', post: 'cm³' }], answer: [s * h], hints: ['体積 = 底面積 × 高さ', `${s} × ${h}`], explain: steps([`${s} × ${h} = ${s * h}cm³`]) }; }
      if (t === 1) {
        let b = R(3, 10); const hh = R(2, 8); if ((b * hh) % 2) b++;
        return { q: `底面が、底辺 ${b}cm・高さ ${hh}cm の三角形で、高さが ${h}cm の三角柱の体積を求めましょう。`, fields: [{ label: '体積', post: 'cm³' }], answer: [b * hh / 2 * h],
          hints: [`まず底面積（三角形）を出そう：${b} × ${hh} ÷ 2`, `底面積 ${b * hh / 2}cm² × 高さ ${h}cm`], explain: steps([`底面積 ${b} × ${hh} ÷ 2 = ${b * hh / 2}cm²`, `体積 ${b * hh / 2} × ${h} = ${b * hh / 2 * h}cm³`]) };
      }
      const r = R(1, 6), v = ds(314 * r * r * h / 100);
      return { q: `底面の半径が ${r}cm、高さが ${h}cm の円柱の体積を求めましょう。円周率は 3.14 とします。`, dec: true, form: DEC, fields: [{ label: '体積', post: 'cm³' }], answer: [v],
        hints: [`底面積 = ${r} × ${r} × 3.14`, `底面積 ${ds(3.14 * r * r)}cm² × 高さ ${h}cm`], explain: steps([`底面積 ${r} × ${r} × 3.14 = ${ds(3.14 * r * r)}cm²`, `体積 ${ds(3.14 * r * r)} × ${h} = ${v}cm³`]) };
    },
  });

  // ===== 小6 比例と反比例 =====
  add({
    id: 'e6_prop', unit: 'u6_prop', name: '比例', prereq: ['e5_dec_muldiv'],
    lesson: `<p class="pt">x が 2倍、3倍…になると、y も 2倍、3倍…になるとき、<b>y は x に比例する</b>という。</p>
<p class="pt">式は <b>y = きまった数 × x</b>。きまった数 = y ÷ x</p>
<div class="ex">例）1m 80円のリボン → y = 80 × x</div>`,
    gen() {
      const k = R(2, 12), p = R(2, 6); let r; do { r = R(2, 15); } while (r === p);
      return {
        q: `y は x に比例し、x が ${p} のとき y は ${k * p} です。`,
        fields: [{ label: 'きまった数' }, { label: `x が ${r} のときの y` }], answer: [k, k * r],
        hints: ['きまった数 = y ÷ x', `${k * p} ÷ ${p} = ${k}。式は y = ${k} × x`],
        explain: steps([`きまった数 ${k * p} ÷ ${p} = ${k}`, `y = ${k} × ${r} = ${k * r}`]),
      };
    },
  });

  add({
    id: 'e6_inv', unit: 'u6_prop', name: '反比例', prereq: ['e6_prop'], diag: false,
    lesson: `<p class="pt">x が 2倍、3倍…になると、y が 1/2、1/3…になるとき、<b>y は x に反比例する</b>という。</p>
<p class="pt"><b>x × y = きまった数</b>。式は y = きまった数 ÷ x</p>
<div class="ex">例）面積 24cm² の長方形のたて x と横 y → x × y = 24</div>`,
    gen() {
      const k = pick([12, 18, 24, 30, 36, 48, 60, 72]);
      const divs = []; for (let i = 1; i <= k; i++) if (k % i === 0) divs.push(i);
      const p = pick(divs.filter((v) => v > 1 && v < k)); let r; do { r = pick(divs); } while (r === p);
      return {
        q: `y は x に反比例し、x が ${p} のとき y は ${k / p} です。`,
        fields: [{ label: 'きまった数' }, { label: `x が ${r} のときの y` }], answer: [k, k / r],
        hints: ['反比例では x × y がいつも同じ数になるよ。', `${p} × ${k / p} = ${k}`],
        explain: steps([`きまった数 ${p} × ${k / p} = ${k}`, `y = ${k} ÷ ${r} = ${k / r}`]),
      };
    },
  });

  // ===== 小6 並べ方と組み合わせ方 =====
  add({
    id: 'e6_combi', unit: 'u6_combi', name: '並べ方と組み合わせ方', prereq: [],
    lesson: `<p class="pt"><b>並べ方</b>は順番を区別する。<b>組み合わせ方</b>は順番を区別しない。</p>
<p class="pt">落ちや重なりがないように、<b>図や表にかいて</b>数える。</p>
<div class="ex">例）A・B・C の3人の並び方 → 6通り　3人から2人を選ぶ組み合わせ → 3通り</div>`,
    gen() {
      const t = R(0, 3);
      if (t === 0) { const n = pick([3, 4]); const f = n === 3 ? 6 : 24; return { q: `${n}人が1列に並ぶとき、並び方は全部で何通りありますか。`, fields: [{ label: '答え', post: '通り' }], answer: [f], hints: ['1番目、2番目…と順に、だれが来られるかを考えよう（樹形図）。', `${Array.from({ length: n }, (_, i) => n - i).join(' × ')}`], explain: steps([`${Array.from({ length: n }, (_, i) => n - i).join(' × ')} = ${f}通り`]) }; }
      if (t === 1) { const n = R(4, 6); return { q: `${n}人の中から、リレーの第1走者と第2走者を1人ずつ選びます。選び方は何通りありますか。`, fields: [{ label: '答え', post: '通り' }], answer: [n * (n - 1)], hints: ['順番があるので「並べ方」だよ。', `第1走者は ${n}通り、そのそれぞれに第2走者は ${n - 1}通り。`], explain: steps([`${n} × ${n - 1} = ${n * (n - 1)}通り`]) }; }
      if (t === 2) { const n = R(4, 7); return { q: `${n}チームで、どのチームとも1回ずつ試合をします。試合は全部で何試合ですか。`, fields: [{ label: '答え', post: '試合' }], answer: [n * (n - 1) / 2], hints: ['「AとB」と「BとA」は同じ試合。表をかいて数えよう。', `${n} × ${n - 1} ÷ 2`], explain: steps([`${n} × ${n - 1} ÷ 2 = ${n * (n - 1) / 2}試合`]) }; }
      const cards = pick([[1, 2, 3], [2, 4, 6], [1, 3, 5, 7]]), n = cards.length, two = n === 4;
      return { q: `${cards.join('、')} の${n}まいのカードから${two ? '2' : '3'}まいを並べて、${two ? '2' : '3'}けたの整数をつくります。全部で何通りできますか。`, fields: [{ label: '答え', post: '通り' }], answer: [two ? 12 : 6],
        hints: ['十の位（百の位）から順に、使えるカードを考えよう。', two ? '十の位は4通り、一の位は残りの3通り。' : '百の位3通り × 十の位2通り × 一の位1通り。'], explain: steps([two ? '4 × 3 = 12通り' : '3 × 2 × 1 = 6通り']) };
    },
  });

  // ===== 小6 データの調べ方 =====
  add({
    id: 'e6_data', unit: 'u6_data', name: '代表値（平均値・中央値・最頻値）', prereq: ['e5_average'],
    lesson: `<p class="pt"><b>平均値</b>：合計 ÷ 個数</p>
<p class="pt"><b>中央値</b>：小さい順に並べたとき、まん中の値（偶数個のときは、まん中2つの平均）</p>
<p class="pt"><b>最頻値</b>：いちばん多く出てくる値</p>`,
    gen() {
      if (Math.random() < 0.5) {
        const m = R(3, 9), others = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10].filter((v) => v !== m)).slice(0, R(3, 5));
        const data = shuffle([m, m, m].concat(others)), s = data.slice().sort((a, b) => a - b), n = s.length;
        const med = n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
        return {
          q: `次のデータは、${n}人が1か月に読んだ本の数（さつ）です。<div class="conds">${data.join('、')}</div>`, dec: true, form: DEC,
          fields: [{ label: '中央値', post: 'さつ' }, { label: '最頻値', post: 'さつ' }], answer: [ds(med), m],
          hints: [`小さい順に並べよう：${s.join('、')}`, n % 2 ? `${n}個なので、まん中は小さい方から ${(n + 1) / 2}番目。` : `${n}個なので、${n / 2}番目と${n / 2 + 1}番目の平均。`],
          explain: steps([`並べると ${s.join('、')}`, `中央値 ${ds(med)}さつ`, `いちばん多いのは ${m}（3回）→ 最頻値 ${m}さつ`]),
        };
      }
      const n = R(5, 7), avg = R(30, 60);
      const vals = Array.from({ length: n }, () => avg + R(-8, 8)); vals[n - 1] = avg * n - vals.slice(0, -1).reduce((a, b) => a + b, 0);
      return {
        q: `次のデータは、${n}回のソフトボール投げの記録（m）です。平均値を求めましょう。<div class="conds">${vals.join('、')}</div>`,
        fields: [{ label: '平均値', post: 'm' }], answer: [avg],
        hints: ['平均値 = 合計 ÷ 個数', `合計は ${avg * n}。`], explain: steps([`合計 ${avg * n} ÷ ${n} = ${avg}m`]),
      };
    },
  });

  const units = [
    { id: 'u5_int', grade: 5, name: '整数と分数' },
    { id: 'u5_dec', grade: 5, name: '小数のかけ算・わり算' },
    { id: 'u5_rate', grade: 5, name: '割合・速さ・平均' },
    { id: 'u5_area', grade: 5, name: '面積' },
    { id: 'u6_sym', grade: 6, name: '対称な図形' },
    { id: 'u6_letter', grade: 6, name: '文字と式' },
    { id: 'u6_frac', grade: 6, name: '分数のかけ算・わり算' },
    { id: 'u6_ratio', grade: 6, name: '比' },
    { id: 'u6_scale', grade: 6, name: '拡大図と縮図' },
    { id: 'u6_circle', grade: 6, name: '円の面積' },
    { id: 'u6_vol', grade: 6, name: '角柱と円柱の体積' },
    { id: 'u6_prop', grade: 6, name: '比例と反比例' },
    { id: 'u6_combi', grade: 6, name: '並べ方と組み合わせ方' },
    { id: 'u6_data', grade: 6, name: 'データの調べ方' },
  ];

  const api = buildCourse({
    id: 'e6', title: '小学6年・算数', subj: '算数', subjKey: 'math', group: 'e6', icon: '📐', main: 6,
    gradeName: { 5: '小5', 6: '小6' }, gradeTitle: { 6: '小学6年', 5: '小学5年（ふく習）' },
    titles: ['はじめの一歩', '見習い', 'チャレンジャー', 'がんばり屋', '努力家', '計算名人', '算数ファイター', '算数マスター', '算数博士', '算数の達人'],
    goals: {
      improve: { icon: '📈', name: '学力アップ', desc: 'にがてなところから、自分のペースで力をのばす' },
      exam: { icon: '📝', name: 'テスト対策', desc: 'テストの日とはんいから、毎日のメニューを作る', names: ['単元テスト', '学期末テスト'] },
      entrance: { icon: '🎒', name: '中学準備', desc: '小5からの全はんいのにがてをなくして、中学に向けて土台をつくる' },
    },
  }, list, units);
  root.COURSES = root.COURSES || {};
  root.COURSES.e6 = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
