/*
 * コーチ（講師）のキャラクター：絵（SVG）とセリフ
 * セリフは場面ごとに用意したもの（AIは使わない）。{name} などは画面側で差しこむ。
 * ほめるのは「がんばり・成長」。点数だけでほめたり、責めたりしない。
 */
(function (root) {
  'use strict';

  // ---------- 絵（表情：normal / happy / think） ----------
  const mouth = (mood, cx, cy, w) => (mood === 'happy'
    ? `<path d="M${cx - w} ${cy} Q${cx} ${cy + w * 1.4} ${cx + w} ${cy} Z" fill="#c2185b"/>`
    : mood === 'think' ? `<circle cx="${cx}" cy="${cy + 2}" r="${w * 0.35}" fill="#5d4037"/>`
      : `<path d="M${cx - w * 0.7} ${cy} Q${cx} ${cy + w * 0.8} ${cx + w * 0.7} ${cy}" stroke="#5d4037" stroke-width="2.5" fill="none" stroke-linecap="round"/>`);
  const eyes = (mood, l, r, y, s, ring) => {
    if (mood === 'happy') return [l, r].map((x) => `<path d="M${x - s} ${y + 2} Q${x} ${y - s} ${x + s} ${y + 2}" stroke="#263238" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('');
    const dy = mood === 'think' ? -s * 0.35 : 0;
    return [l, r].map((x) => `${ring ? `<circle cx="${x}" cy="${y}" r="${s + 3}" fill="#fff"/>` : ''}<circle cx="${x}" cy="${y + dy}" r="${s * 0.55}" fill="#263238"/><circle cx="${x + s * 0.2}" cy="${y + dy - s * 0.2}" r="${s * 0.18}" fill="#fff"/>`).join('');
  };
  const cheeks = (y, l, r) => `<ellipse cx="${l}" cy="${y}" rx="6" ry="3.5" fill="#ff8a80" opacity=".55"/><ellipse cx="${r}" cy="${y}" rx="6" ry="3.5" fill="#ff8a80" opacity=".55"/>`;

  const DRAW = {
    owl: (m) => `<path d="M24 30 L32 12 L42 26 Z M76 30 L68 12 L58 26 Z" fill="#6d4c41"/>
<ellipse cx="50" cy="58" rx="36" ry="38" fill="#8d6e63"/><ellipse cx="50" cy="56" rx="28" ry="26" fill="#d7ccc8"/>
${eyes(m, 38, 62, 50, 9, true)}<circle cx="38" cy="50" r="12" stroke="#5d4037" stroke-width="2.5" fill="none"/><circle cx="62" cy="50" r="12" stroke="#5d4037" stroke-width="2.5" fill="none"/>
<path d="M45 62 L55 62 L50 71 Z" fill="#ffa000"/>${m === 'happy' ? cheeks(66, 30, 70) : ''}<ellipse cx="50" cy="90" rx="18" ry="6" fill="#6d4c41"/>`,
    cat: (m) => `<path d="M20 34 L26 10 L44 26 Z M80 34 L74 10 L56 26 Z" fill="#ffa726"/><path d="M25 30 L28 16 L38 26 Z M75 30 L72 16 L62 26 Z" fill="#f8bbd0"/>
<circle cx="50" cy="56" r="36" fill="#ffb74d"/><ellipse cx="50" cy="68" rx="20" ry="15" fill="#fff3e0"/><path d="M50 22 L46 34 L54 34 Z" fill="#ef6c00" opacity=".6"/>
${eyes(m, 37, 63, 52, 8, false)}<path d="M46 62 L54 62 L50 66 Z" fill="#ec407a"/>${mouth(m, 50, 69, 6)}
<g stroke="#8d6e63" stroke-width="1.6" stroke-linecap="round"><line x1="14" y1="62" x2="32" y2="64"/><line x1="14" y1="70" x2="32" y2="68"/><line x1="86" y1="62" x2="68" y2="64"/><line x1="86" y1="70" x2="68" y2="68"/></g>${m === 'happy' ? cheeks(66, 28, 72) : ''}`,
    robot: (m) => `<line x1="50" y1="8" x2="50" y2="22" stroke="#78909c" stroke-width="4"/><circle cx="50" cy="8" r="6" fill="${m === 'happy' ? '#ffd54f' : '#ef5350'}"/>
<rect x="14" y="22" width="72" height="66" rx="16" fill="#90a4ae"/><rect x="22" y="32" width="56" height="44" rx="10" fill="#263238"/>
<rect x="6" y="44" width="8" height="20" rx="3" fill="#78909c"/><rect x="86" y="44" width="8" height="20" rx="3" fill="#78909c"/>
${m === 'happy' ? '<path d="M30 52 Q37 44 44 52 M56 52 Q63 44 70 52" stroke="#4dd0e1" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : m === 'think' ? '<rect x="30" y="44" width="14" height="6" rx="3" fill="#4dd0e1"/><rect x="56" y="44" width="14" height="6" rx="3" fill="#4dd0e1"/>'
      : '<rect x="31" y="44" width="12" height="12" rx="3" fill="#4dd0e1"/><rect x="57" y="44" width="12" height="12" rx="3" fill="#4dd0e1"/>'}
${m === 'happy' ? '<path d="M38 64 Q50 74 62 64" stroke="#4dd0e1" stroke-width="4" fill="none" stroke-linecap="round"/>' : m === 'think' ? '<circle cx="50" cy="66" r="3.5" fill="#4dd0e1"/>' : '<rect x="40" y="64" width="20" height="4" rx="2" fill="#4dd0e1"/>'}`,
    dog: (m) => `<ellipse cx="20" cy="50" rx="11" ry="22" fill="#6d4c41" transform="rotate(15 20 50)"/><ellipse cx="80" cy="50" rx="11" ry="22" fill="#6d4c41" transform="rotate(-15 80 50)"/>
<circle cx="50" cy="54" r="34" fill="#d7a86e"/><ellipse cx="50" cy="68" rx="19" ry="14" fill="#fbe9d0"/>
${eyes(m, 38, 62, 48, 8, false)}<ellipse cx="50" cy="61" rx="7" ry="5" fill="#3e2723"/>${mouth(m, 50, 69, 7)}${m === 'happy' ? '<path d="M46 75 Q50 86 54 75 Z" fill="#ef5350"/>' + cheeks(64, 28, 72) : ''}`,
  };
  const svg = (id, mood) => `<svg class="cface-svg" viewBox="0 0 100 100" aria-hidden="true">${(DRAW[id] || DRAW.owl)(mood || 'normal')}</svg>`;

  // ---------- セリフ ----------
  const LINES = {
    owl: {
      morning: ['おはよう、{name}さん。朝の頭はよく働くぞい。', 'おはよう、{name}さん。今日も一歩ずつ進もうかの。'],
      afternoon: ['こんにちは、{name}さん。今日もいっしょに学ぼうかの。', 'よく来たのう、{name}さん。さあ、始めようか。'],
      evening: ['こんばんは、{name}さん。少しだけでも、今日の分を進めておこうかの。', 'こんばんは、{name}さん。夜の勉強も、短く集中すれば効果ばつぐんじゃ。'],
      streak: ['{streak}日連続とは見事じゃ。続ける力こそ、いちばんの才能じゃよ。', '{streak}日も続いておるのう。わしもうれしいぞい。'],
      comeback: ['おお、{name}さん、待っておったぞ。また今日から始めればよいのじゃ。'],
      diag: ['まずは実力チェックじゃ。今の力を知ることが、上達の第一歩じゃよ。'],
      menu_todo: ['今日はまず「{task}」からじゃ。わしがついておるぞ。', '次は「{task}」じゃ。あわてず、じっくりいこう。'],
      menu_done: ['今日のメニューは全部終わったのう。よくがんばった！先に進みたければ、前倒しもできるぞ。'],
      exam: ['{exam}まであと{days}日じゃ。計画どおりに進めば、だいじょうぶじゃよ。'],
      resume: ['前回の続きが残っておるぞ。途中からすぐ始められるのじゃ。'],
      ok: ['正解じゃ！よく考えたのう。', '見事じゃ！その調子じゃよ。', 'うむ、しっかり身についておるのう。'],
      okHint: ['ヒントを使いこなして正解じゃ。それも立派な力じゃよ。', 'よく粘ったのう。正解じゃ！'],
      retry: ['おしいのう。もう一度、落ち着いて考えてみるのじゃ。', 'ヒントを見て、もう一回挑戦じゃ。'],
      giveup: ['ここで覚えれば、次は解けるぞい。解説をじっくり読むのじゃ。', 'まちがいは宝物じゃ。どこでつまずいたか確かめよう。'],
      sum_perfect: ['全問正解とは、あっぱれじゃ！'],
      sum_good: ['よくできたのう。あと少しで完ぺきじゃ。'],
      sum_try: ['挑戦したことが何より大事じゃ。解説を読んで、もう1セットやってみるかの？'],
      sum_up: ['★が上がったのう！確実に力がついておる証拠じゃ。'],
      lesson: ['まずはここのポイントを読んでおくのじゃ。'],
      diag_done: ['おつかれさま。これで、きみに合った順番で学べるぞい。'],
      ahead: ['前倒しとは感心じゃ！先へ進む力がついておるのう。'],
    },
    cat: {
      morning: ['おはよう、{name}さん。今日もいっしょにがんばろうね。'],
      afternoon: ['こんにちは、{name}さん。会えてうれしいな。', 'こんにちは、{name}さん。今日はどこからやってみる？'],
      evening: ['こんばんは、{name}さん。少しだけ、いっしょにやってみよう。'],
      streak: ['{streak}日も続いてるね。すごいよ、{name}さん！', '{streak}日連続！毎日えらいね。'],
      comeback: ['おかえり、{name}さん！また会えてうれしいな。今日から再スタートしよう。'],
      diag: ['まずは実力チェックをしてみよう。わからない問題は「わからない」でいいからね。'],
      menu_todo: ['今日は「{task}」からやってみよう。ゆっくりでだいじょうぶだよ。', '次は「{task}」だね。いっしょにやろう。'],
      menu_done: ['今日のメニュー、全部できたね！えらい！もっとやりたいときは前倒しもできるよ。'],
      exam: ['{exam}まであと{days}日。毎日少しずつ、いっしょに準備しようね。'],
      resume: ['前回の続きが残ってるよ。続きからやってみる？'],
      ok: ['正解！すごいね！', 'やったね！ばっちりだよ。', 'いいね、ちゃんとわかってる！'],
      okHint: ['ヒントを使って正解できたね。えらいよ！', 'あきらめなかったね。正解！'],
      retry: ['おしい！もう一回考えてみよう。', 'だいじょうぶ、ヒントを見てもう一度！'],
      giveup: ['まちがえても平気だよ。解説をいっしょに見てみよう。', 'ここで覚えれば、次はきっとできるよ。'],
      sum_perfect: ['全問正解！本当にすごいよ！'],
      sum_good: ['よくできたね！もう少しで全部正解だよ。'],
      sum_try: ['がんばったね。解説を見て、もう1回やってみよう。'],
      sum_up: ['★が上がったね！ちゃんと成長してるよ。'],
      lesson: ['ここがポイントだよ。いっしょに読んでみよう。'],
      diag_done: ['おつかれさま！これから、{name}さんにぴったりの順番で進めるね。'],
      ahead: ['前倒しでやったの？すごい！その調子だね。'],
    },
    robot: {
      morning: ['おはよう、{name}さん！今日の学習エネルギー、充電完了！'],
      afternoon: ['こんにちは、{name}さん！学習モード、スタンバイOK！'],
      evening: ['こんばんは、{name}さん！今日のデータを、もう少し集めよう！'],
      streak: ['{streak}日連続を記録！すばらしいデータだ！'],
      comeback: ['おかえりなさい、{name}さん！再起動完了。今日から記録を再開しよう！'],
      diag: ['まずは実力チェックで、きみのデータを分析しよう！'],
      menu_todo: ['本日のミッションは「{task}」！準備はいいかな？', '次のミッションは「{task}」！'],
      menu_done: ['ミッションコンプリート！今日のメニューは全部終了！前倒しモードもあるよ。'],
      exam: ['{exam}まで残り{days}日。計画どおりに進めば成功率アップ！'],
      resume: ['前回の続きのデータが保存されているよ。すぐ再開できる！'],
      ok: ['正解！データ更新！', 'ピコーン！正解を確認！', 'すばらしい！正答率アップ！'],
      okHint: ['ヒントを活用して正解！作戦成功！', '粘り強さを検知！正解！'],
      retry: ['おしい！もう一度考えてみよう。', 'エラー発見！ヒントで修正しよう。'],
      giveup: ['まちがいも大切なデータ！解説で原因を分析しよう。', 'ここで覚えれば、次に正解できる確率アップ！'],
      sum_perfect: ['全問正解！パーフェクトなデータだ！'],
      sum_good: ['高得点を記録！あと少しでパーフェクト！'],
      sum_try: ['挑戦データを記録したよ。解説を見て、もう1セットいこう！'],
      sum_up: ['★アップを確認！どんどん強くなっているぞ！'],
      lesson: ['ポイントのデータを表示するよ。チェックしてね！'],
      diag_done: ['分析完了！きみ専用の学習ルートを作ったよ！'],
      ahead: ['前倒し実行を確認！すごいスピードだ！'],
    },
    dog: {
      morning: ['おはよう、{name}さん！今日も元気に行こう！'],
      afternoon: ['こんにちは、{name}さん！さあ、いっしょにトレーニングだ！'],
      evening: ['こんばんは、{name}さん！ラストスパート、少しだけやろう！'],
      streak: ['{streak}日連続！その調子でどんどん行こう！'],
      comeback: ['{name}さん、待ってたよ！今日からまたいっしょに走ろう！'],
      diag: ['まずは実力チェックだ！今の力を思いっきり出してみよう！'],
      menu_todo: ['まずは「{task}」からだ！きみならできる！', '次は「{task}」だ！いっしょに行こう！'],
      menu_done: ['今日のメニュー、完走だ！やったね！もっと走れるなら前倒しも行けるぞ！'],
      exam: ['{exam}まであと{days}日！ここからが勝負だ！'],
      resume: ['前回の続きがあるぞ！途中からすぐ再開しよう！'],
      ok: ['正解！ナイス！', 'いいぞ！その調子！', 'やったね！完ぺきだ！'],
      okHint: ['ヒントを使って正解！粘り勝ちだ！', 'あきらめなかったね！正解！'],
      retry: ['おしい！もう一回いこう！', 'ドンマイ！ヒントを見て再チャレンジだ！'],
      giveup: ['まちがえても大丈夫！解説を読んで、次は決めよう！', 'ここで覚えれば、次は必ずできる！'],
      sum_perfect: ['全問正解！最高だ！'],
      sum_good: ['すごいぞ！あと一歩で完ぺきだ！'],
      sum_try: ['よくがんばった！もう1セットいってみよう！'],
      sum_up: ['★アップだ！確実に強くなってる！'],
      lesson: ['まずはポイントをチェックだ！'],
      diag_done: ['おつかれさま！これで、きみだけの作戦ができたぞ！'],
      ahead: ['前倒しだって？すごいぞ、その意気だ！'],
    },
  };

  const LIST = [
    { id: 'owl', name: 'ハカセ', kind: 'フクロウ', desc: '落ち着いた博士。じっくり考えるのを応援してくれる' },
    { id: 'cat', name: 'ミケ先生', kind: 'ネコ', desc: 'やさしく見守ってくれる。まちがえても安心' },
    { id: 'robot', name: 'アルファ', kind: 'ロボット', desc: '元気でデータ好き。成長を数字で教えてくれる' },
    { id: 'dog', name: 'コタロー', kind: 'イヌ', desc: '熱血コーチ。いっしょに走ってくれる' },
  ];
  // 場面のセリフを1つ選び、{name} などを差しこむ
  function line(id, cat, vars) {
    const L = (LINES[id] || LINES.owl)[cat] || LINES.owl[cat] || [''];
    let t = L[Math.floor(Math.random() * L.length)];
    Object.keys(vars || {}).forEach((k) => { t = t.split('{' + k + '}').join(vars[k]); });
    return t;
  }
  root.COACH = { LIST, svg, line, byId: (id) => LIST.find((c) => c.id === id) };
})(typeof window !== 'undefined' ? window : globalThis);
