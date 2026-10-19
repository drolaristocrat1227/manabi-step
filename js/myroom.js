/*
 * マイルーム：自分のアバター（きせかえ）と部屋の模様替え
 * 絵はすべて SVG で描く。基本の見た目は無料、特別なものは勉強でためたポイントと交換する（ガチャはなし）。
 */
(function (root) {
  'use strict';

  // ---------- 交換できるもの ----------
  // cat：種類、id：識別名、name：表示名、price：ポイント（0 は最初から使える）、c：色など
  const ITEMS = [
    // はだの色
    { cat: 'skin', id: 's1', name: 'うすめ', price: 0, c: '#ffe0c7' },
    { cat: 'skin', id: 's2', name: 'ふつう', price: 0, c: '#f5c9a5' },
    { cat: 'skin', id: 's3', name: 'こんがり', price: 0, c: '#d9a27a' },
    { cat: 'skin', id: 's4', name: 'こいめ', price: 0, c: '#a86f4c' },
    // 髪の色
    { cat: 'hairColor', id: 'black', name: '黒', price: 0, c: '#2b2b2b' },
    { cat: 'hairColor', id: 'brown', name: '茶', price: 0, c: '#6b4226' },
    { cat: 'hairColor', id: 'chestnut', name: 'くり色', price: 0, c: '#8d5524' },
    { cat: 'hairColor', id: 'navy', name: '紺', price: 0, c: '#233a6b' },
    { cat: 'hairColor', id: 'pink', name: 'ピンク', price: 100, c: '#e88bb5' },
    { cat: 'hairColor', id: 'silver', name: 'シルバー', price: 100, c: '#c9ced6' },
    // 髪型
    { cat: 'hair', id: 'short', name: 'ショート', price: 0 },
    { cat: 'hair', id: 'bob', name: 'ボブ', price: 0 },
    { cat: 'hair', id: 'long', name: 'ロング', price: 80 },
    { cat: 'hair', id: 'spiky', name: 'ツンツン', price: 80 },
    { cat: 'hair', id: 'ponytail', name: 'ポニーテール', price: 120 },
    { cat: 'hair', id: 'curly', name: 'くるくる', price: 120 },
    // 服
    { cat: 'outfit', id: 'blue', name: '青いシャツ', price: 0, c: '#4f6bed' },
    { cat: 'outfit', id: 'green', name: '緑のシャツ', price: 0, c: '#3fa36b' },
    { cat: 'outfit', id: 'red', name: '赤いシャツ', price: 60, c: '#e05a4f' },
    { cat: 'outfit', id: 'yellow', name: '黄色いシャツ', price: 60, c: '#f2b632' },
    { cat: 'outfit', id: 'stripe', name: 'しまもよう', price: 150, c: '#ffffff' },
    { cat: 'outfit', id: 'hoodie', name: 'パーカー', price: 200, c: '#8e7cc3' },
    { cat: 'outfit', id: 'blazer', name: 'ブレザー', price: 250, c: '#26355d' },
    // 小物
    { cat: 'acc', id: 'none', name: 'なし', price: 0 },
    { cat: 'acc', id: 'glasses', name: 'メガネ', price: 100 },
    { cat: 'acc', id: 'ribbon', name: 'リボン', price: 150 },
    { cat: 'acc', id: 'cap', name: 'ぼうし', price: 150 },
    { cat: 'acc', id: 'headphones', name: 'ヘッドホン', price: 200 },
    { cat: 'acc', id: 'crown', name: '王かん', price: 600 },
    // かべ紙
    { cat: 'wall', id: 'white', name: 'しろ', price: 0, c: '#f4f1ea' },
    { cat: 'wall', id: 'sky', name: 'そら色', price: 80, c: '#d6ecfa' },
    { cat: 'wall', id: 'mint', name: 'ミント', price: 80, c: '#d8f1e4' },
    { cat: 'wall', id: 'cream', name: 'クリーム', price: 80, c: '#fbefd3' },
    { cat: 'wall', id: 'night', name: '星空', price: 300, c: '#26315a' },
    // 床
    { cat: 'floor', id: 'wood', name: 'フローリング', price: 0, c: '#c8925b' },
    { cat: 'floor', id: 'carpet', name: '青いカーペット', price: 120, c: '#7f9fd6' },
    { cat: 'floor', id: 'tatami', name: 'たたみ', price: 200, c: '#d9cf8a' },
    // 家具（いくつでも置ける）
    { cat: 'item', id: 'desk', name: 'つくえ', price: 0 },
    { cat: 'item', id: 'plant', name: '観葉植物', price: 100 },
    { cat: 'item', id: 'poster', name: 'ポスター', price: 100 },
    { cat: 'item', id: 'lamp', name: 'スタンドライト', price: 120 },
    { cat: 'item', id: 'bookshelf', name: '本だな', price: 150 },
    { cat: 'item', id: 'rug', name: 'ラグ', price: 150 },
    { cat: 'item', id: 'globe', name: '地球儀', price: 200 },
    { cat: 'item', id: 'telescope', name: '望遠鏡', price: 350 },
    { cat: 'item', id: 'aquarium', name: '水そう', price: 400 },
  ];
  const CATS = [
    ['skin', 'はだの色', 'avatar'], ['hair', '髪型', 'avatar'], ['hairColor', '髪の色', 'avatar'], ['outfit', '服', 'avatar'], ['acc', '小物', 'avatar'],
    ['wall', 'かべ紙', 'room'], ['floor', '床', 'room'], ['item', '家具', 'room'],
  ];
  const get = (cat, id) => ITEMS.find((x) => x.cat === cat && x.id === id) || ITEMS.find((x) => x.cat === cat);
  const DEFAULT = { avatar: { skin: 's2', hair: 'short', hairColor: 'black', outfit: 'blue', acc: 'none' }, room: { wall: 'white', floor: 'wood', items: ['desk'] } };

  // ---------- アバター（viewBox 0 0 120 150） ----------
  function hairBack(style, c) {
    if (style === 'long') return `<path d="M28 60 Q26 28 60 26 Q94 28 92 60 L94 104 Q78 110 72 98 L48 98 Q42 110 26 104 Z" fill="${c}"/>`;
    if (style === 'ponytail') return `<ellipse cx="92" cy="72" rx="11" ry="20" fill="${c}" transform="rotate(-18 92 72)"/>`;
    if (style === 'bob') return `<path d="M27 62 Q26 28 60 26 Q94 28 93 62 L93 80 Q86 84 82 78 L38 78 Q34 84 27 80 Z" fill="${c}"/>`;
    return '';
  }
  function hairFront(style, c) {
    switch (style) {
      case 'spiky': return `<path d="M30 58 L28 36 L40 42 L42 24 L54 36 L60 20 L67 36 L79 24 L80 42 L92 36 L90 58 Q82 44 60 44 Q38 44 30 58 Z" fill="${c}"/>`;
      case 'curly': return `<g fill="${c}">${[[34, 46], [42, 34], [54, 28], [66, 28], [78, 34], [86, 46], [30, 58], [90, 58]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10"/>`).join('')}</g>`;
      case 'long': case 'bob': return `<path d="M30 60 Q30 28 60 28 Q90 28 90 60 Q80 42 64 44 Q58 50 46 46 Q36 48 30 60 Z" fill="${c}"/>`;
      case 'ponytail': return `<path d="M30 58 Q30 28 60 28 Q90 28 90 58 Q84 42 60 42 Q38 42 30 58 Z" fill="${c}"/>`;
      default: return `<path d="M30 58 Q30 28 60 28 Q90 28 90 58 Q84 44 60 42 Q40 42 30 58 Z" fill="${c}"/>`;
    }
  }
  function outfit(id) {
    const o = get('outfit', id), body = 'M28 150 L28 120 Q28 100 50 96 L70 96 Q92 100 92 120 L92 150 Z';
    if (id === 'stripe') return `<path d="${body}" fill="#fff"/><g stroke="#4f6bed" stroke-width="5">${[106, 118, 130, 142].map((y) => `<line x1="28" y1="${y}" x2="92" y2="${y}"/>`).join('')}</g><path d="${body}" fill="none" stroke="#cfd6e6" stroke-width="1.5"/>`;
    if (id === 'hoodie') return `<path d="M40 100 Q60 86 80 100 L76 108 Q60 98 44 108 Z" fill="#6f5ea8"/><path d="${body}" fill="${o.c}"/><path d="M46 128 L74 128 L72 142 L48 142 Z" fill="#6f5ea8"/><line x1="54" y1="100" x2="54" y2="114" stroke="#fff" stroke-width="2"/><line x1="66" y1="100" x2="66" y2="114" stroke="#fff" stroke-width="2"/>`;
    if (id === 'blazer') return `<path d="${body}" fill="${o.c}"/><path d="M50 96 L60 120 L70 96 Z" fill="#fff"/><path d="M57 102 L63 102 L62 126 L60 130 L58 126 Z" fill="#c0392b"/><circle cx="60" cy="136" r="2" fill="#d4af37"/>`;
    return `<path d="${body}" fill="${o.c}"/><path d="M50 96 Q60 106 70 96" fill="none" stroke="rgba(0,0,0,.15)" stroke-width="3"/>`;
  }
  function acc(id) {
    switch (id) {
      case 'glasses': return '<g fill="none" stroke="#263238" stroke-width="2.5"><circle cx="49" cy="62" r="8"/><circle cx="71" cy="62" r="8"/><line x1="57" y1="62" x2="63" y2="62"/></g>';
      case 'ribbon': return '<g fill="#e74c3c"><path d="M78 30 L92 22 L92 40 Z"/><path d="M78 30 L66 20 L66 38 Z"/><circle cx="78" cy="30" r="4" fill="#c0392b"/></g>';
      case 'cap': return '<path d="M28 46 Q30 18 60 18 Q90 18 92 46 Z" fill="#e05a4f"/><path d="M60 46 L104 46 Q104 52 96 52 L60 50 Z" fill="#b8473e"/><circle cx="60" cy="19" r="3" fill="#b8473e"/>';
      case 'headphones': return '<path d="M26 62 Q26 20 60 20 Q94 20 94 62" fill="none" stroke="#37474f" stroke-width="6"/><rect x="20" y="56" width="12" height="20" rx="5" fill="#4f6bed"/><rect x="88" y="56" width="12" height="20" rx="5" fill="#4f6bed"/>';
      case 'crown': return '<path d="M38 34 L42 14 L52 26 L60 10 L68 26 L78 14 L82 34 Z" fill="#f5c518" stroke="#c99a00" stroke-width="1.5"/><circle cx="60" cy="24" r="3" fill="#e74c3c"/>';
      default: return '';
    }
  }
  function avatarSVG(av, cls) {
    av = Object.assign({}, DEFAULT.avatar, av || {});
    const skin = get('skin', av.skin).c, hc = get('hairColor', av.hairColor).c;
    return `<svg class="${cls || 'avatar-svg'}" viewBox="0 0 120 150" aria-hidden="true">
${hairBack(av.hair, hc)}${outfit(av.outfit)}<rect x="52" y="84" width="16" height="14" fill="${skin}"/>
<circle cx="60" cy="60" r="30" fill="${skin}"/><ellipse cx="30" cy="64" rx="4" ry="6" fill="${skin}"/><ellipse cx="90" cy="64" rx="4" ry="6" fill="${skin}"/>
${hairFront(av.hair, hc)}
<circle cx="49" cy="63" r="3.6" fill="#263238"/><circle cx="71" cy="63" r="3.6" fill="#263238"/><circle cx="50.2" cy="61.8" r="1.2" fill="#fff"/><circle cx="72.2" cy="61.8" r="1.2" fill="#fff"/>
<path d="M52 74 Q60 81 68 74" fill="none" stroke="#8a4b38" stroke-width="2.6" stroke-linecap="round"/><ellipse cx="42" cy="72" rx="5" ry="3" fill="#ff8a80" opacity=".45"/><ellipse cx="78" cy="72" rx="5" ry="3" fill="#ff8a80" opacity=".45"/>
${acc(av.acc)}</svg>`;
  }

  // ---------- 部屋（viewBox 0 0 360 240） ----------
  const FURN = {
    rug: '<ellipse cx="180" cy="212" rx="96" ry="20" fill="#e8a0a0"/><ellipse cx="180" cy="212" rx="76" ry="14" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 5"/>',
    plant: '<path d="M26 150 L50 150 L46 176 L30 176 Z" fill="#b5651d"/><g fill="#3e9b5a"><ellipse cx="38" cy="130" rx="9" ry="20"/><ellipse cx="26" cy="138" rx="8" ry="15" transform="rotate(-30 26 138)"/><ellipse cx="50" cy="138" rx="8" ry="15" transform="rotate(30 50 138)"/></g>',
    aquarium: '<rect x="60" y="150" width="50" height="26" fill="#8d6e63"/><rect x="58" y="116" width="54" height="36" rx="3" fill="#a7dcf5" stroke="#5e8ca6" stroke-width="2"/><path d="M70 134 q6 -6 12 0 q-6 6 -12 0 Z M84 134 l5 -4 l0 8 Z" fill="#f39c12"/><path d="M92 126 q5 -4 10 0 q-5 4 -10 0 Z M102 126 l4 -3 l0 6 Z" fill="#e74c3c"/><circle cx="66" cy="142" r="2" fill="#fff" opacity=".7"/><circle cx="70" cy="136" r="1.5" fill="#fff" opacity=".7"/>',
    bookshelf: '<rect x="116" y="70" width="56" height="106" fill="#8d6e63"/><rect x="120" y="74" width="48" height="98" fill="#6d4c41"/>' + [80, 112, 144].map((y, r) => [0, 1, 2, 3, 4].map((k) => `<rect x="${122 + k * 9}" y="${y + (k % 2) * 4}" width="7" height="${26 - (k % 2) * 4}" fill="${['#e74c3c', '#3498db', '#f1c40f', '#2ecc71', '#9b59b6'][(k + r) % 5]}"/>`).join('')).join('') + '<rect x="120" y="106" width="48" height="4" fill="#8d6e63"/><rect x="120" y="138" width="48" height="4" fill="#8d6e63"/>',
    globe: '<rect x="138" y="62" width="12" height="8" fill="#795548"/><circle cx="144" cy="46" r="15" fill="#5dade2"/><path d="M134 40 q6 -6 12 -2 q4 6 -2 10 q-8 2 -10 -8 Z M148 50 q6 -2 8 4 q-4 4 -8 -4 Z" fill="#58b368"/><path d="M128 46 a16 16 0 0 0 32 0" fill="none" stroke="#a1887f" stroke-width="2.5"/>',
    poster: '<rect x="205" y="24" width="52" height="58" fill="#fff" stroke="#c9b28a" stroke-width="3"/><path d="M212 72 L222 58 L232 64 L248 40" fill="none" stroke="#4f6bed" stroke-width="3"/><circle cx="248" cy="40" r="3" fill="#e74c3c"/><text x="231" y="34" font-size="8" text-anchor="middle" fill="#555">がんばり</text>',
    desk: '<rect x="196" y="124" width="104" height="8" rx="2" fill="#a0724a"/><rect x="200" y="132" width="6" height="44" fill="#8a603c"/><rect x="290" y="132" width="6" height="44" fill="#8a603c"/><rect x="250" y="132" width="40" height="22" fill="#b98455"/><circle cx="270" cy="143" r="2" fill="#6d4c41"/><rect x="222" y="114" width="24" height="10" fill="#4f6bed"/><rect x="226" y="108" width="20" height="6" fill="#f1c40f"/>',
    lamp: '<rect x="276" y="120" width="16" height="4" fill="#555"/><line x1="284" y1="120" x2="278" y2="98" stroke="#555" stroke-width="3"/><path d="M266 96 L290 90 L286 104 Z" fill="#f39c12"/><path d="M270 104 L300 124" stroke="#ffe082" stroke-width="10" opacity=".35"/>',
    telescope: '<line x1="324" y1="176" x2="330" y2="130" stroke="#555" stroke-width="3"/><line x1="342" y1="176" x2="332" y2="130" stroke="#555" stroke-width="3"/><line x1="312" y1="176" x2="330" y2="130" stroke="#555" stroke-width="3"/><rect x="306" y="108" width="50" height="12" rx="5" fill="#34495e" transform="rotate(-28 331 114)"/>',
  };
  const ORDER = ['poster', 'bookshelf', 'globe', 'aquarium', 'plant', 'telescope', 'desk', 'lamp', 'rug'];
  function roomSVG(room, avatar, trophy) {
    room = Object.assign({}, DEFAULT.room, room || {});
    const wall = get('wall', room.wall), floor = get('floor', room.floor), night = room.wall === 'night';
    let floorDeco = '';
    if (room.floor === 'wood') floorDeco = [184, 200, 218].map((y) => `<line x1="0" y1="${y}" x2="360" y2="${y}" stroke="rgba(0,0,0,.12)" stroke-width="2"/>`).join('');
    if (room.floor === 'tatami') floorDeco = '<g stroke="#a99d55" stroke-width="2.5" fill="none"><rect x="0" y="176" width="120" height="64"/><rect x="120" y="176" width="120" height="64"/><rect x="240" y="176" width="120" height="64"/></g>';
    const stars = night ? '<g fill="#fff">' + [[150, 20], [180, 50], [270, 18], [320, 60], [110, 100], [340, 110], [190, 96], [300, 140]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('') + '</g>' : '';
    const items = ORDER.filter((id) => (room.items || []).includes(id) && id !== 'rug').map((id) => FURN[id]).join('');
    const tro = trophy ? '<g><rect x="206" y="114" width="14" height="4" fill="#8d6e63"/><path d="M204 96 L222 96 L219 108 Q213 114 207 108 Z" fill="#f5c518" stroke="#c99a00"/><rect x="211" y="108" width="4" height="6" fill="#c99a00"/></g>' : '';
    return `<svg class="room-svg" viewBox="0 0 360 240" aria-label="マイルーム">
<rect width="360" height="176" fill="${wall.c}"/>${stars}<rect y="170" width="360" height="8" fill="rgba(0,0,0,.1)"/>
<rect y="176" width="360" height="64" fill="${floor.c}"/>${floorDeco}
<rect x="20" y="24" width="80" height="62" rx="3" fill="${night ? '#0e1630' : '#bfe3fb'}" stroke="#fff" stroke-width="5"/><line x1="60" y1="24" x2="60" y2="86" stroke="#fff" stroke-width="4"/>${night ? '<circle cx="82" cy="40" r="8" fill="#fff4c2"/>' : '<circle cx="40" cy="44" r="8" fill="#ffe082"/>'}
${(room.items || []).includes('rug') ? FURN.rug : ''}${items}${tro}
<g transform="translate(143 145) scale(.62)">${avatar ? avatar.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '') : ''}</g></svg>`;
  }

  // 一覧の見本（小さな丸い色や絵）
  function swatch(it, av) {
    if (it.c && (it.cat === 'skin' || it.cat === 'hairColor' || it.cat === 'wall' || it.cat === 'floor')) return `<span class="sw" style="background:${it.c}"></span>`;
    if (it.cat === 'item') return `<svg class="sw-svg" viewBox="${{ desk: '190 100 116 80', plant: '16 106 44 74', poster: '200 20 62 66', lamp: '262 86 42 42', bookshelf: '112 66 64 114', rug: '80 188 200 48', globe: '126 28 36 44', telescope: '300 96 60 84', aquarium: '54 112 62 66' }[it.id]}">${FURN[it.id]}</svg>`;
    const a = Object.assign({}, DEFAULT.avatar, av || {}, { [it.cat]: it.id });
    return avatarSVG(a, 'sw-svg');
  }

  root.MYROOM = { ITEMS, CATS, DEFAULT, get, avatarSVG, roomSVG, swatch };
})(typeof window !== 'undefined' ? window : globalThis);
