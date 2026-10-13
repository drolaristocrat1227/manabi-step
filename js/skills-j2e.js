/*
 * 中学2年・英語（さかのぼり用に中1の内容をふくむ）
 * 問題はあらかじめ作った問題バンクから出題する（選択式・並べかえ）。
 * 文法的に複数の答えが成り立つ問題には、日本語の意味をそえて答えが1つに決まるようにしている。
 */
(function (root) {
  'use strict';
  const K = root.SKILL_KIT;
  const { fromBank, buildCourse } = K;

  // 選択式：問題文・正解・まちがいの選択肢・解説・ヒント
  const C = (q, a, w, e, h) => ({ q, a, w, e, h });
  // 日本語の意味をそえた選択式
  const CJ = (q, ja, a, w, e, h) => ({ q: `${q}<div class="ja">（${ja}）</div>`, a, w, e, h });
  // 並べかえ
  const O = (ja, s, e, h) => ({ q: `日本文に合うように、語を並べかえましょう。<div class="conds">${ja}</div>`, s, e, h });

  const list = [];
  const add = (s) => list.push(s);

  // ===== 中1の復習 =====
  add({
    id: 'e1_be_do', unit: 'u1e_rev', name: 'be動詞と一般動詞', prereq: [],
    lesson: `<p class="pt"><b>be動詞</b>（am / is / are）は「〜です」「〜にいる」。主語で使い分ける：I → am、he・she・it・1人や1つのもの → is、you・複数 → are。</p>
<p class="pt"><b>一般動詞</b>（play, like など）の疑問文・否定文は <b>do / does</b> を使う。</p>
<div class="ex">例）Are you a student?　Do you play tennis?　She does not like milk.</div>`,
    gen: fromBank([
      C('I （　　） a student.', 'am', ['is', 'are', 'be'], '主語が I のときの be動詞は am。'),
      C('（　　） you like music?', 'Do', ['Are', 'Is', 'Does'], 'like は一般動詞。主語が you なので Do を使う。'),
      C('（　　） she a teacher?', 'Is', ['Does', 'Do', 'Are'], 'a teacher（先生）とイコールの関係なので be動詞。主語が she なので Is。'),
      C('They （　　） busy now.', 'are', ['is', 'am', 'do'], '主語が they（複数）なので are。'),
      C('（　　） Ken play soccer?', 'Does', ['Do', 'Is', 'Are'], 'play は一般動詞。主語が Ken（3人称単数）なので Does。'),
      C('I （　　） not have a dog.', 'do', ['am', 'does', 'is'], 'have は一般動詞。主語が I なので do not（don\'t）。'),
      C('Tom and I （　　） good friends.', 'are', ['is', 'am', 'do'], 'Tom and I は2人＝複数なので are。'),
      C('（　　） your father cook dinner?', 'Does', ['Is', 'Do', 'Are'], 'cook は一般動詞。your father は3人称単数なので Does。'),
      C('This book （　　） very interesting.', 'is', ['are', 'does', 'am'], 'this book は1つのものなので is。'),
      C('Where （　　） you live?', 'do', ['are', 'does', 'is'], 'live は一般動詞。主語が you なので do。'),
      O('あなたは毎朝、朝食を食べますか。', 'Do you eat breakfast every morning?', '一般動詞 eat の疑問文なので Do で始める。'),
      O('私の姉は看護師ではありません。', 'My sister is not a nurse.', 'be動詞の否定文は be動詞のあとに not。'),
    ], ['be動詞（〜です）の文か、一般動詞（する・好きなど）の文かを見分けよう。', '主語が I / you / 複数 / 3人称単数（he, she, 1人・1つ）のどれかを確かめよう。']),
  });

  add({
    id: 'e1_3s', unit: 'u1e_rev', name: '3人称単数・現在', prereq: ['e1_be_do'],
    lesson: `<p class="pt">主語が <b>3人称単数</b>（he, she, it, Ken など）で現在の文のとき、一般動詞に <b>s / es</b> をつける。</p>
<p class="pt">have → <b>has</b>、go → goes、watch → watches、study → studies</p>
<p class="pt">疑問文・否定文では does を使い、動詞は<b>原形</b>にもどす。</p>`,
    gen: fromBank([
      C('He （　　） to school by bus.', 'goes', ['go', 'going', 'is go'], 'go の3単現は goes。'),
      C('My mother （　　） a nice car.', 'has', ['have', 'haves', 'is have'], 'have の3単現は has。'),
      C('Emi （　　） English very well.', 'speaks', ['speak', 'speaking', 'is speak'], '主語が Emi（3人称単数）なので speaks。'),
      C('She （　　） her homework after dinner.', 'does', ['do', 'dos', 'doing'], 'do（する）の3単現は does。'),
      C('Ken doesn\'t （　　） coffee.', 'drink', ['drinks', 'drinking', 'drank'], 'doesn\'t のあとの動詞は原形。'),
      C('Does your brother （　　） the guitar?', 'play', ['plays', 'playing', 'played'], 'Does の疑問文では動詞は原形。'),
      C('My father （　　） TV every night.', 'watches', ['watch', 'watchs', 'watching'], 'watch は es をつけて watches。'),
      C('Mr. Sato （　　） math at our school.', 'teaches', ['teach', 'teachs', 'teaching'], 'teach は es をつけて teaches。'),
      C('Yumi （　　） English every day.', 'studies', ['study', 'studys', 'studing'], 'study は y を i にかえて es → studies。'),
      O('彼女は毎日英語を勉強します。', 'She studies English every day.', 'study の3単現は studies。'),
      O('私の兄はにんじんが好きではありません。', 'My brother doesn\'t like carrots.', '3人称単数の否定文は doesn\'t ＋ 動詞の原形。'),
      O('ユキは大阪に住んでいますか。', 'Does Yuki live in Osaka?', '3人称単数の疑問文は Does ＋ 主語 ＋ 動詞の原形。'),
    ], ['主語は3人称単数（he, she, it, 1人の名前など）かな？', 'does / doesn\'t があるときは、動詞は原形（s がつかない形）だよ。']),
  });

  add({
    id: 'e1_past', unit: 'u1e_rev', name: '過去形（一般動詞・be動詞）', prereq: ['e1_be_do'],
    lesson: `<p class="pt">一般動詞の過去形は <b>ed</b> をつける（play → played）。不規則に変わる動詞もある（go → went、see → saw）。</p>
<p class="pt">be動詞の過去形は <b>was</b>（I, 3人称単数）と <b>were</b>（you, 複数）。</p>
<p class="pt">疑問文・否定文は <b>did</b> を使い、動詞は<b>原形</b>。</p>`,
    gen: fromBank([
      C('I （　　） soccer yesterday.', 'played', ['play', 'plays', 'playing'], 'yesterday（昨日）なので過去形 played。'),
      C('We （　　） to Kyoto last summer.', 'went', ['go', 'goes', 'going'], 'go の過去形は went（不規則動詞）。'),
      C('She （　　） in the library then.', 'was', ['were', 'is', 'are'], 'then（そのとき）なので過去。主語 she なので was。'),
      C('They （　　） very tired last night.', 'were', ['was', 'are', 'is'], 'last night なので過去。主語が複数なので were。'),
      C('Did you （　　） the movie?', 'see', ['saw', 'seen', 'sees'], 'Did の疑問文では動詞は原形。'),
      C('I didn\'t （　　） breakfast this morning.', 'eat', ['ate', 'eats', 'eating'], 'didn\'t のあとは原形。'),
      C('Ken （　　） a letter to his friend last week.', 'wrote', ['writes', 'write', 'written'], 'write の過去形は wrote。'),
      C('（　　） you busy yesterday?', 'Were', ['Was', 'Did', 'Are'], 'busy（いそがしい）は形容詞なので be動詞。主語 you の過去は Were。'),
      C('My father （　　） me a bike two years ago.', 'bought', ['buy', 'buys', 'buyed'], 'buy の過去形は bought。'),
      O('私はこの前の日曜日に祖母を訪ねました。', 'I visited my grandmother last Sunday.', 'visit の過去形は visited。'),
      O('あなたは昨夜、数学を勉強しましたか。', 'Did you study math last night?', '過去の疑問文は Did ＋ 主語 ＋ 動詞の原形。'),
      O('私たちは昨日、家にいました。', 'We were at home yesterday.', '「いた」は be動詞の過去形。主語が we なので were。'),
    ], ['yesterday, last 〜, 〜 ago, then などの「過去を表すことば」をさがそう。', 'did / didn\'t のあとは動詞の原形。was / were は be動詞の過去形だよ。']),
  });

  add({
    id: 'e1_prog', unit: 'u1e_rev', name: '現在進行形・can', prereq: ['e1_be_do'],
    lesson: `<p class="pt"><b>現在進行形</b>「〜しているところだ」= <b>be動詞 ＋ 動詞の ing 形</b>。</p>
<p class="pt"><b>can</b>「〜できる」のあとの動詞は<b>原形</b>。疑問文は Can で始める。</p>
<div class="ex">例）I am reading a book.　She can swim fast.</div>`,
    gen: fromBank([
      C('Look! The boy is （　　） in the river.', 'swimming', ['swim', 'swims', 'swiming'], 'swim の ing 形は m を重ねて swimming。'),
      C('I am （　　） a book now.', 'reading', ['read', 'reads', 'readed'], 'be動詞 ＋ ing 形で「〜しているところ」。'),
      C('What are you （　　） now?', 'doing', ['do', 'does', 'did'], '進行形の疑問文。do の ing 形は doing。'),
      C('She can （　　） the piano well.', 'play', ['plays', 'playing', 'played'], 'can のあとの動詞は原形。'),
      C('（　　） you swim fast? — Yes, I can.', 'Can', ['Are', 'Does', 'Is'], '答えが Yes, I can. なので Can でたずねる。'),
      C('They （　　） playing basketball now.', 'are', ['is', 'am', 'do'], '主語が they なので are ＋ ing 形。'),
      C('My sister is （　　） lunch in the kitchen.', 'making', ['make', 'makes', 'makeing'], 'make は e をとって ing → making。'),
      C('Tom can\'t （　　） Japanese.', 'read', ['reads', 'reading', 'to read'], 'can\'t のあとも原形。'),
      O('私の兄は公園で走っています。', 'My brother is running in the park.', 'run の ing 形は n を重ねて running。'),
      O('私を手伝ってくれますか。', 'Can you help me?', '「〜してくれますか」は Can you 〜?'),
      O('私は今、テレビを見ていません。', 'I am not watching TV now.', '進行形の否定文は be動詞のあとに not。'),
    ], ['「〜しているところ」なら be動詞 ＋ ing 形。', 'can のあとは、いつも動詞の原形だよ。']),
  });

  // ===== 中2 =====
  add({
    id: 'e2_pastprog', unit: 'u2e_past', name: '過去進行形', prereq: ['e1_prog', 'e1_past'],
    lesson: `<p class="pt"><b>過去進行形</b>「（そのとき）〜していた」= <b>was / were ＋ 動詞の ing 形</b>。</p>
<p class="pt">疑問文は was / were を主語の前に出す。否定文は was / were のあとに not。</p>
<div class="ex">例）I was watching TV at eight last night.　What were you doing then?</div>`,
    gen: fromBank([
      C('I （　　） watching TV at eight last night.', 'was', ['am', 'were', 'did'], 'last night なので過去進行形。主語 I なので was。'),
      C('They （　　） playing soccer then.', 'were', ['was', 'are', 'did'], '主語が they なので were ＋ ing 形。'),
      C('What （　　） you doing at that time?', 'were', ['did', 'was', 'are'], 'at that time（そのとき）なので過去進行形。主語 you なので were。'),
      C('She was （　　） a bath when I called her.', 'taking', ['take', 'took', 'takes'], 'was のあとは ing 形。take a bath = おふろに入る。'),
      C('（　　） Ken studying in his room? — Yes, he was.', 'Was', ['Were', 'Did', 'Is'], '答えが he was なので Was でたずねる。'),
      C('We were not （　　） at that time.', 'sleeping', ['sleep', 'slept', 'sleeps'], '過去進行形の否定文。were not ＋ ing 形。'),
      C('It （　　） raining when I got up.', 'was', ['were', 'is', 'did'], 'when I got up（起きたとき）なので過去。主語 it なので was。'),
      C('My parents （　　） cooking dinner at six.', 'were', ['was', 'are', 'is'], '主語が my parents（両親＝複数）なので were。'),
      O('私はそのとき本を読んでいました。', 'I was reading a book then.', 'was ＋ ing 形で「〜していた」。'),
      O('あなたは9時に何をしていましたか。', 'What were you doing at nine?', '疑問詞 What ＋ were ＋ 主語 ＋ ing 形。'),
      O('彼女はピアノをひいていませんでした。', 'She was not playing the piano.', '否定文は was のあとに not。'),
    ], ['「〜していた」なら was / were ＋ ing 形。', '主語が I・3人称単数なら was、you・複数なら were。']),
  });

  add({
    id: 'e2_will', unit: 'u2e_future', name: '未来の表現（will / be going to）', prereq: ['e1_be_do'],
    lesson: `<p class="pt"><b>will ＋ 動詞の原形</b>「〜するだろう」「〜します」。否定は will not（won\'t）。</p>
<p class="pt"><b>be going to ＋ 動詞の原形</b>「〜するつもりだ」「〜する予定だ」。</p>
<div class="ex">例）It will be sunny tomorrow.　I am going to visit Kyoto.</div>`,
    gen: fromBank([
      C('I （　　） visit my uncle tomorrow.', 'will', ['am', 'was', 'did'], '動詞の原形 visit の前に置けるのは will。'),
      C('It will （　　） sunny tomorrow.', 'be', ['is', 'are', 'been'], 'will のあとは原形。is の原形は be。'),
      C('She is going （　　） buy a new bag.', 'to', ['for', 'will', 'at'], 'be going to ＋ 動詞の原形。'),
      C('We are going to （　　） tennis next Sunday.', 'play', ['plays', 'playing', 'played'], 'be going to のあとは原形。'),
      C('（　　） you going to watch the game?', 'Are', ['Will', 'Do', 'Is'], 'be going to の疑問文は be動詞を前に出す。主語 you なので Are。'),
      C('Will he come to the party? — No, he （　　）.', 'won\'t', ['doesn\'t', 'isn\'t', 'didn\'t'], 'Will 〜? には will / won\'t で答える。'),
      C('I\'m （　　） to study English this evening.', 'going', ['go', 'will', 'went'], 'I\'m going to 〜 で「〜するつもり」。'),
      C('They （　　） not going to go out tonight.', 'are', ['will', 'do', 'is'], 'be going to の否定文。主語 they なので are not。'),
      C('What will you （　　） this weekend?', 'do', ['doing', 'does', 'did'], 'will のあとは原形 do。'),
      O('あとであなたに電話します。', 'I will call you later.', 'will ＋ 動詞の原形。'),
      O('あなたは京都を訪れる予定ですか。', 'Are you going to visit Kyoto?', 'be going to の疑問文は Are で始める。'),
      O('明日は寒くなるでしょう。', 'It will be cold tomorrow.', '天気・寒暖の主語は it。will be で「〜になるだろう」。'),
    ], ['will のあとも、be going to のあとも、動詞は原形だよ。', 'be going to の疑問文・否定文は be動詞（am / is / are）を使う。']),
  });

  add({
    id: 'e2_conj', unit: 'u2e_conj', name: '接続詞（when / if / because / that）', prereq: ['e1_be_do'],
    lesson: `<p class="pt"><b>when</b>「〜するとき」　<b>if</b>「もし〜なら」　<b>because</b>「〜なので」　<b>so</b>「だから」</p>
<p class="pt"><b>that</b>「〜ということ」：I think that 〜（〜だと思う）。この that は省略できる。</p>
<p class="pt">when・if の文では、未来のことでも<b>現在形</b>を使う（If it is sunny tomorrow, …）。</p>`,
    gen: fromBank([
      CJ('I was watching TV （　　） my mother came home.', '母が帰宅したとき、私はテレビを見ていました。', 'when', ['because', 'if', 'that'], '「〜したとき」は when。'),
      CJ('（　　） it is sunny tomorrow, let\'s go to the beach.', 'もし明日晴れたら、海へ行こう。', 'If', ['Because', 'That', 'But'], '「もし〜なら」は if。未来のことでも if の中は現在形（is）。'),
      CJ('I stayed home （　　） I was sick.', '具合が悪かったので、私は家にいました。', 'because', ['if', 'when', 'that'], '「〜なので（理由）」は because。'),
      CJ('I think （　　） he is kind.', '私は彼は親切だと思います。', 'that', ['when', 'if', 'because'], 'I think that 〜 で「〜だと思う」。'),
      CJ('I hope （　　） you will come again.', 'あなたがまた来てくれるといいなと思います。', 'that', ['because', 'when', 'but'], 'I hope that 〜 で「〜だといいと思う」。'),
      CJ('He was tired, （　　） he went to bed early.', '彼はつかれていた。だから早く寝た。', 'so', ['because', 'if', 'that'], '「だから」は so。理由 → 結果 の順。'),
      CJ('I like summer （　　） I can swim in the sea.', '海で泳げるので、私は夏が好きです。', 'because', ['or', 'that', 'if'], '理由を表す because。'),
      CJ('Please call me （　　） you get to the station.', '駅に着いたら、私に電話してください。', 'when', ['that', 'but', 'or'], '「〜したら（〜したとき）」は when。'),
      CJ('（　　） I was a child, I lived in Hokkaido.', '子どものころ、私は北海道に住んでいました。', 'When', ['If', 'That', 'So'], '「〜のころ（〜のとき）」は when。'),
      O('あなたが電話をくれたとき、私は眠っていました。', 'I was sleeping when you called me.', 'when 〜 は文の後ろに置くこともできる。'),
      O('私はこの本はおもしろいと思います。', 'I think that this book is interesting.', 'I think that 〜 の形。'),
      O('もしひまなら、手伝ってください。', 'If you are free, please help me.', 'If 〜 を前に置くときは、区切りにコンマをつける。'),
    ], ['日本語の「〜とき」「もし〜なら」「〜なので」「〜と思う」のどれにあたるかを考えよう。', 'when＝とき、if＝もし、because＝〜なので、that＝〜ということ。']),
  });

  add({
    id: 'e2_inf', unit: 'u2e_inf', name: '不定詞（to ＋ 動詞の原形）', prereq: ['e1_3s'],
    lesson: `<p class="pt"><b>to ＋ 動詞の原形</b> を不定詞という。3つの使い方がある。</p>
<p class="pt">① 名詞的「〜すること」：I want <b>to be</b> a doctor.<br>② 副詞的「〜するために」「〜して（感情の理由）」：I went to the park <b>to play</b> tennis.<br>③ 形容詞的「〜するための」「〜すべき」：I have a lot of homework <b>to do</b>.</p>`,
    gen: fromBank([
      C('I want （　　） a doctor.', 'to be', ['be', 'being', 'to is'], 'want to 〜「〜したい」。to のあとは原形 be。'),
      C('She went to the park （　　） tennis.', 'to play', ['play', 'playing', 'played'], '「テニスをするために」＝ to play（副詞的用法）。'),
      C('I have a lot of homework （　　）.', 'to do', ['doing', 'do', 'did'], '「するべき宿題」＝ homework to do（形容詞的用法）。'),
      C('He likes （　　） pictures.', 'to take', ['take', 'took', 'takes'], 'like to 〜「〜することが好き」（名詞的用法）。'),
      C('I was happy （　　） the news.', 'to hear', ['hear', 'heard', 'hears'], '「〜して（うれしい）」と感情の理由を表す（副詞的用法）。'),
      C('Do you have anything （　　）?', 'to drink', ['drink', 'drinking', 'drank'], '「何か飲むもの」＝ anything to drink。'),
      C('My dream is （　　） around the world.', 'to travel', ['travel', 'traveled', 'travels'], '「世界を旅行すること」（名詞的用法）。'),
      C('Why did you go to the library? — （　　） some books.', 'To borrow', ['Borrow', 'Borrowed', 'Borrowing'], 'Why 〜? に「〜するためです」と答えるときは To 〜。'),
      C('I went to Tokyo <u>to see</u> my friend.　下線部の意味は？', '会うために', ['会うこと', '会うべき', '会ったので'], '「友だちに会うために東京へ行った」（副詞的用法）。'),
      O('私は先生になりたい。', 'I want to be a teacher.', 'want to be 〜「〜になりたい」。'),
      O('あなたに言うことがあります。', 'I have something to tell you.', 'something to 〜「〜するための何か」。'),
      O('彼女は朝食を作るために早く起きました。', 'She got up early to make breakfast.', '目的を表す to 〜 は文の後ろに置く。'),
    ], ['to のあとの動詞は、いつも原形だよ。', '「〜すること」「〜するために」「〜するための」のどれかを考えよう。']),
  });

  add({
    id: 'e2_gerund', unit: 'u2e_inf', name: '動名詞と不定詞の使い分け', prereq: ['e2_inf'], diag: false,
    lesson: `<p class="pt"><b>動名詞</b>（動詞の ing 形）は「〜すること」。主語や目的語、前置詞のあとに置ける。</p>
<p class="pt"><b>ing 形だけ</b>をとる動詞：enjoy, finish, stop など。<b>to 〜 だけ</b>をとる動詞：want, hope, decide など。<b>どちらもOK</b>：like, start, begin など。</p>
<p class="pt">前置詞（for, at, about など）のあとは <b>ing 形</b>。</p>`,
    gen: fromBank([
      C('I enjoyed （　　） with my friends.', 'talking', ['to talk', 'talk', 'talked'], 'enjoy のあとは ing 形だけ。'),
      C('He finished （　　） his homework.', 'doing', ['to do', 'do', 'does'], 'finish のあとは ing 形だけ。'),
      C('Thank you for （　　） me.', 'helping', ['help', 'to help', 'helped'], '前置詞 for のあとは ing 形。'),
      C('She wants （　　） abroad.', 'to study', ['studying', 'study', 'studied'], 'want のあとは to 〜 だけ。'),
      C('（　　） books is fun.', 'Reading', ['Read', 'Reads', 'Reader'], '「本を読むこと」が主語。動名詞 Reading。'),
      C('I hope （　　） you again.', 'to see', ['seeing', 'see', 'saw'], 'hope のあとは to 〜。'),
      C('My hobby is （　　） stamps.', 'collecting', ['collect', 'collects', 'collected'], '「切手を集めること」。動名詞 collecting。'),
      C('He is good at （　　） pictures.', 'drawing', ['draw', 'to draw', 'drew'], 'be good at 〜ing「〜するのが得意」。前置詞 at のあとは ing 形。'),
      C('How about （　　） to the zoo?', 'going', ['go', 'to go', 'went'], 'How about 〜ing?「〜するのはどうですか」。'),
      O('私はギターをひくのが好きです。', 'I like playing the guitar.', 'like は ing 形も to 〜 もとれる。'),
      O('招待してくれてありがとう。', 'Thank you for inviting me.', 'for のあとは ing 形。'),
    ], ['enjoy・finish のあとは ing 形、want・hope のあとは to 〜 だよ。', '前置詞（for, at, about）のあとは ing 形。']),
  });

  add({
    id: 'e2_there', unit: 'u2e_there', name: 'There is / There are', prereq: ['e1_be_do'],
    lesson: `<p class="pt"><b>There is ＋ 単数</b>、<b>There are ＋ 複数</b>「〜がある・いる」。</p>
<p class="pt">過去は There was / There were。疑問文は Is there 〜? / Are there 〜?</p>
<div class="ex">例）There are three parks in my town.　Is there a bank near here?</div>`,
    gen: fromBank([
      C('There （　　） a cat under the table.', 'is', ['are', 'am', 'be'], 'a cat（1ぴき）なので is。'),
      C('There （　　） many students in the gym.', 'are', ['is', 'am', 'be'], 'many students（複数）なので are。'),
      C('（　　） there a park near your house?', 'Is', ['Are', 'Do', 'Does'], 'a park（単数）なので Is there 〜?'),
      C('There （　　） two cups on the desk yesterday.', 'were', ['was', 'are', 'is'], 'yesterday なので過去。two cups（複数）なので were。'),
      C('How many books （　　） there in your bag?', 'are', ['is', 'do', 'does'], 'How many ＋ 複数名詞 ＋ are there 〜?'),
      C('There （　　） not any water in the bottle.', 'is', ['are', 'am', 'were'], 'water は数えられない名詞なので単数あつかい。'),
      C('Is there a hospital around here? — Yes, there （　　）.', 'is', ['are', 'does', 'it'], 'Is there 〜? には there is / there isn\'t で答える。'),
      O('私の町には公園が3つあります。', 'There are three parks in my town.', '複数なので There are。'),
      O('駅の近くに銀行はありますか。', 'Is there a bank near the station?', '疑問文は Is there 〜?'),
      O('ここに大きな木がありました。', 'There was a big tree here.', '過去・単数なので There was。'),
    ], ['「ある・いる」ものが1つ（単数）か、2つ以上（複数）かを見よう。', '過去の文なら was / were になるよ。']),
  });

  add({
    id: 'e2_svoo', unit: 'u2e_there', name: '文型（give A B / call A B など）', prereq: ['e1_3s'], diag: false,
    lesson: `<p class="pt"><b>give / show / tell / send / buy ＋ 人 ＋ もの</b>「人に もの を〜する」。人の部分は me, him, her などの形。</p>
<p class="pt">書きかえ：give A B = give B <b>to</b> A、buy / make A B = buy / make B <b>for</b> A。</p>
<p class="pt"><b>call A B</b>「A を B と呼ぶ」、<b>make A B</b>「A を B（の状態）にする」。</p>`,
    gen: fromBank([
      C('My father gave （　　） a watch.', 'me', ['I', 'my', 'mine'], 'give ＋ 人 ＋ もの。人の部分は me（目的格）。'),
      C('Please show me （　　） pictures.', 'your', ['you', 'yours', 'you\'re'], '「あなたの写真」なので your pictures。'),
      C('We call （　　） Taku.', 'him', ['he', 'his', 'he\'s'], 'call A B「A を B と呼ぶ」。A は him。'),
      C('The news made （　　） happy.', 'us', ['we', 'our', 'ours'], 'make A B「A を B にする」。A は us。'),
      C('I\'ll tell （　　） a story.', 'you', ['your', 'yours', 'you\'re'], 'tell ＋ 人 ＋ もの。'),
      C('She sent （　　） a letter.', 'him', ['he', 'his', 'he\'s'], 'send ＋ 人 ＋ もの。'),
      C('What do you call this flower （　　） English?', 'in', ['on', 'at', 'by'], 'in English「英語で」。'),
      C('He gave me a book. ＝ He gave a book （　　） me.', 'to', ['for', 'at', 'of'], 'give B to A。'),
      C('My mother made me a cake. ＝ My mother made a cake （　　） me.', 'for', ['to', 'at', 'with'], 'make B for A。'),
      O('駅への道を教えてください。', 'Please tell me the way to the station.', 'tell ＋ 人 ＋ もの（the way）。'),
      O('私たちは犬をポチと呼びます。', 'We call our dog Pochi.', 'call A B の順。'),
      O('この歌は私を幸せにします。', 'This song makes me happy.', 'make A B の順。'),
    ], ['「人に もの を」の順番。人の部分は me / him / her / us / them の形。', 'give は to、buy・make は for で書きかえるよ。']),
  });

  add({
    id: 'e2_modal', unit: 'u2e_modal', name: '助動詞（must / have to / should / may）', prereq: ['e1_prog'],
    lesson: `<p class="pt"><b>must</b>「〜しなければならない」、<b>must not</b>「〜してはいけない」</p>
<p class="pt"><b>have to</b>「〜しなければならない」（主語が3人称単数なら has to）、<b>don\'t have to</b>「〜する必要はない」</p>
<p class="pt"><b>should</b>「〜したほうがいい」、<b>may</b>「〜してもよい」「〜かもしれない」。助動詞のあとは<b>原形</b>。</p>`,
    gen: fromBank([
      CJ('You （　　） finish your homework today.', 'あなたは今日、宿題を終えなければなりません。', 'must', ['can', 'may', 'will'], '「〜しなければならない」は must。'),
      CJ('I （　　） to get up early tomorrow.', '私は明日、早く起きなければなりません。', 'have', ['must', 'has', 'should'], 'have to 〜。主語が I なので have。'),
      CJ('She （　　） to wash the dishes.', '彼女は皿を洗わなければなりません。', 'has', ['have', 'must', 'is'], '主語が she（3人称単数）なので has to。'),
      CJ('You （　　） not run in the hallway.', 'ろうかを走ってはいけません。', 'must', ['have', 'are', 'do'], '「〜してはいけない」は must not。'),
      CJ('You （　　） have to come early.', '早く来る必要はありません。', 'don\'t', ['mustn\'t', 'aren\'t', 'can\'t'], '「〜する必要はない」は don\'t have to。'),
      CJ('（　　） I use this pen? — Sure.', 'このペンを使ってもいいですか。', 'May', ['Must', 'Will', 'Am'], '「〜してもいいですか」は May I 〜?'),
      CJ('You （　　） see a doctor.', '医者にみてもらったほうがいいですよ。', 'should', ['must', 'may', 'will'], '「〜したほうがいい」は should。'),
      CJ('Must I go now? — No, you （　　）.', '今行かなければなりませんか。— いいえ、その必要はありません。', 'don\'t have to', ['mustn\'t', 'can\'t', 'aren\'t'], 'Must 〜? に「その必要はない」と答えるときは don\'t have to。mustn\'t だと「してはいけない」になる。'),
      CJ('It （　　） rain tonight.', '今夜は雨が降るかもしれません。', 'may', ['must', 'should', 'has to'], '「〜かもしれない」は may。'),
      O('ここで電話を使ってはいけません。', 'You must not use your phone here.', 'must not ＋ 動詞の原形。'),
      O('私は部屋をそうじしなければなりません。', 'I have to clean my room.', 'have to ＋ 動詞の原形。'),
      O('私を待つ必要はありません。', 'You don\'t have to wait for me.', 'don\'t have to で「〜する必要はない」。'),
    ], ['日本語が「〜しなければならない」「〜してはいけない」「〜する必要はない」「〜したほうがいい」のどれかを見よう。', 'must not（禁止）と don\'t have to（不要）のちがいに注意。']),
  });

  add({
    id: 'e2_comp', unit: 'u2e_comp', name: '比較級・最上級', prereq: ['e1_be_do'],
    lesson: `<p class="pt"><b>比較級</b>「〜より…」= 〜er ＋ than　<b>最上級</b>「いちばん…」= the 〜est</p>
<p class="pt">長い語は <b>more</b> 〜 / <b>most</b> 〜（more interesting / most famous）。</p>
<p class="pt">最上級の「〜の中で」：複数の仲間なら <b>of</b>（of the three）、場所・集団なら <b>in</b>（in my class）。</p>
<div class="ex">big → bigger → biggest　hot → hotter → hottest　pretty → prettier → prettiest</div>`,
    gen: fromBank([
      C('Tom is （　　） than Ken.', 'taller', ['tall', 'tallest', 'more tall'], 'than があるので比較級 taller。'),
      C('This is the （　　） mountain in Japan.', 'highest', ['higher', 'high', 'most high'], 'the 〜 in Japan「日本でいちばん」なので最上級。'),
      C('My bag is （　　） than yours.', 'bigger', ['biger', 'big', 'biggest'], 'big は g を重ねて bigger。'),
      C('This question is （　　） difficult than that one.', 'more', ['most', 'very', 'many'], 'difficult は長い語なので more difficult。'),
      C('She is the most famous singer （　　） the five.', 'of', ['in', 'than', 'at'], 'the five（5人）のように数や仲間を表すときは of。'),
      C('He runs the fastest （　　） his class.', 'in', ['of', 'than', 'at'], 'his class（クラス）のように集団・場所は in。'),
      C('Which is （　　）, this or that?', 'larger', ['large', 'largest', 'more large'], '2つを比べるので比較級。large は r をつけて larger。'),
      C('Mt. Fuji is the （　　） beautiful mountain in Japan.', 'most', ['more', 'much', 'best'], 'beautiful は長い語なので the most beautiful。'),
      C('Today is （　　） than yesterday.', 'hotter', ['hoter', 'hot', 'hottest'], 'hot は t を重ねて hotter。'),
      C('This flower is the （　　） of all.', 'prettiest', ['prettier', 'pretty', 'most pretty'], 'pretty は y を i にかえて est → prettiest。'),
      O('これは日本でいちばん長い川です。', 'This is the longest river in Japan.', 'the ＋ 最上級 ＋ in 〜。'),
      O('英語は数学よりおもしろい。', 'English is more interesting than math.', '長い語は more 〜 than。'),
    ], ['than があれば比較級（〜er / more）、the 〜 of / in があれば最上級（〜est / most）。', '長い語（interesting, beautiful など）は more / most を使うよ。']),
  });

  add({
    id: 'e2_comp_as', unit: 'u2e_comp', name: 'as 〜 as・better / best など', prereq: ['e2_comp'], diag: false,
    lesson: `<p class="pt"><b>as 〜 as …</b>「…と同じくらい〜」、<b>not as 〜 as …</b>「…ほど〜ではない」。〜 には<b>もとの形</b>が入る。</p>
<p class="pt">good / well → <b>better</b> → <b>best</b>。「B より A が好き」= like A better than B、「A がいちばん好き」= like A the best。</p>`,
    gen: fromBank([
      C('I am as tall （　　） my father.', 'as', ['than', 'so', 'that'], 'as 〜 as …「…と同じくらい〜」。'),
      C('This book is not as （　　） as that one.', 'interesting', ['more interesting', 'most interesting', 'interest'], 'as と as の間はもとの形。'),
      C('I like dogs （　　） than cats.', 'better', ['more good', 'best', 'well'], 'like A better than B「B より A が好き」。'),
      CJ('Soccer is the （　　） sport in my class.', 'サッカーは私のクラスでいちばん人気のあるスポーツです。', 'most popular', ['more popular', 'popularest', 'popular'], 'popular は長い語なので the most popular。'),
      C('I like spring the （　　） of all seasons.', 'best', ['better', 'good', 'most good'], 'like 〜 the best「〜がいちばん好き」。'),
      C('He can swim as （　　） as Ken.', 'fast', ['faster', 'fastest', 'more fast'], 'as と as の間はもとの形。'),
      C('Which do you like （　　）, tea or coffee?', 'better', ['good', 'best', 'well'], '2つのうちどちらが好きかは better。'),
      CJ('This is as （　　） as that.', 'これはあれと同じくらいの大きさです。', 'big', ['bigger', 'biggest', 'more big'], 'as 〜 as の間はもとの形。'),
      C('Your idea is （　　） than mine.', 'better', ['gooder', 'more good', 'best'], 'good の比較級は better。'),
      O('私はあなたほど忙しくありません。', 'I am not as busy as you.', 'not as 〜 as …「…ほど〜でない」。'),
      O('あなたはどの季節がいちばん好きですか。', 'Which season do you like the best?', 'Which 〜 do you like the best?'),
      O('彼女はお母さんと同じくらい上手に歌います。', 'She sings as well as her mother.', 'well（上手に）を as 〜 as ではさむ。'),
    ], ['as と as の間には、er や est がつかない「もとの形」が入るよ。', 'good・well の比較級は better、最上級は best。']),
  });

  add({
    id: 'e2_passive', unit: 'u2e_pass', name: '受け身（be動詞 ＋ 過去分詞）', prereq: ['e1_past'],
    lesson: `<p class="pt"><b>受け身</b>「〜される」= <b>be動詞 ＋ 過去分詞</b>。「〜によって」は <b>by 〜</b>。</p>
<p class="pt">過去の受け身は was / were ＋ 過去分詞。疑問文は be動詞を前に出す。</p>
<div class="ex">例）English is spoken in many countries.　This book was written by Soseki.</div>`,
    gen: fromBank([
      C('English is （　　） in many countries.', 'spoken', ['speak', 'spoke', 'speaking'], '「話されている」は is ＋ 過去分詞 spoken。'),
      C('This room is cleaned （　　） Ken every day.', 'by', ['with', 'of', 'at'], '「〜によって」は by。'),
      C('The book was （　　） by Soseki.', 'written', ['wrote', 'write', 'writing'], 'write の過去分詞は written。'),
      C('These cars （　　） made in Japan.', 'are', ['is', 'was', 'be'], 'these cars（複数）なので are ＋ 過去分詞。'),
      C('Was this picture （　　） by your brother?', 'taken', ['took', 'take', 'taking'], 'take の過去分詞は taken。'),
      C('This temple was （　　） 500 years ago.', 'built', ['build', 'builded', 'building'], 'build の過去分詞は built。'),
      C('The window （　　） broken by the boy yesterday.', 'was', ['is', 'were', 'did'], 'yesterday なので過去。the window（単数）なので was。'),
      C('Is this song （　　） by young people?', 'loved', ['love', 'loves', 'loving'], '「愛されている」は is ＋ loved。'),
      C('The letter was not （　　） by him.', 'read', ['readed', 'reading', 'reads'], 'read の過去分詞は read（つづりは同じ）。'),
      O('このかばんはイタリアで作られました。', 'This bag was made in Italy.', 'was ＋ 過去分詞 made。'),
      O('日本語は多くの人に勉強されています。', 'Japanese is studied by many people.', 'is ＋ 過去分詞 ＋ by 〜。'),
      O('この手紙はエミによって書かれましたか。', 'Was this letter written by Emi?', '受け身の疑問文は be動詞を前に出す。'),
    ], ['「〜される」なら be動詞 ＋ 過去分詞。', '過去分詞は不規則に変わる動詞が多いよ（write → written、take → taken）。']),
  });

  add({
    id: 'e2_irregular', unit: 'u2e_pass', name: '不規則動詞の変化', prereq: ['e1_past'],
    lesson: `<p class="pt">ed をつけず、形が変わる動詞を<b>不規則動詞</b>という。原形 - 過去形 - 過去分詞 で覚えよう。</p>
<div class="ex">go - went - gone　see - saw - seen　take - took - taken　write - wrote - written　make - made - made　buy - bought - bought</div>`,
    gen: fromBank([
      C('go の過去形は？', 'went', ['goed', 'gone', 'goes'], 'go - went - gone'),
      C('see の過去形は？', 'saw', ['seed', 'seen', 'sees'], 'see - saw - seen'),
      C('take の過去分詞は？', 'taken', ['took', 'taked', 'take'], 'take - took - taken'),
      C('write の過去分詞は？', 'written', ['wrote', 'writed', 'write'], 'write - wrote - written'),
      C('buy の過去形は？', 'bought', ['buyed', 'brought', 'buys'], 'buy - bought - bought（brought は bring の過去形）'),
      C('make の過去分詞は？', 'made', ['maked', 'make', 'making'], 'make - made - made'),
      C('speak の過去分詞は？', 'spoken', ['spoke', 'speaked', 'speak'], 'speak - spoke - spoken'),
      C('come の過去形は？', 'came', ['comed', 'come', 'comes'], 'come - came - come'),
      C('eat の過去分詞は？', 'eaten', ['ate', 'eated', 'eat'], 'eat - ate - eaten'),
      C('know の過去分詞は？', 'known', ['knew', 'knowed', 'know'], 'know - knew - known'),
      C('give の過去形は？', 'gave', ['gived', 'given', 'gives'], 'give - gave - given'),
      C('begin の過去形は？', 'began', ['begun', 'beginned', 'begins'], 'begin - began - begun'),
      C('teach の過去形は？', 'taught', ['teached', 'thought', 'teaches'], 'teach - taught - taught（thought は think の過去形）'),
      C('find の過去形は？', 'found', ['finded', 'fined', 'finds'], 'find - found - found'),
      C('read の過去形は？', 'read', ['readed', 'red', 'reads'], 'read - read - read（つづりは同じで、過去形は「レッド」と発音）'),
    ], ['原形 - 過去形 - 過去分詞 の3つをセットで思い出そう。', '過去形と過去分詞の形がちがう動詞（see, take, write など）に注意。']),
  });

  add({
    id: 'e2_order', unit: 'u2e_order', name: '並べかえ（総合）', prereq: ['e2_inf', 'e2_comp'], diag: false,
    lesson: `<p class="pt">並べかえは、まず<b>主語と動詞</b>を決めてから、残りの語を意味のまとまりで並べる。</p>
<p class="pt">「だれが」→「どうする」→「何を」→「どこで」→「いつ」の順が基本。</p>`,
    gen: fromBank([
      O('何か飲むものがほしいです。', 'I want something to drink.', 'something to drink「何か飲むもの」。'),
      O('彼は3人の中でいちばん背が高い。', 'He is the tallest of the three.', 'the ＋ 最上級 ＋ of the three。'),
      O('私が起きたとき、雨が降っていました。', 'It was raining when I got up.', '過去進行形 ＋ when 〜。'),
      O('あなたは早く寝たほうがいい。', 'You should go to bed early.', 'should ＋ 動詞の原形。'),
      O('この写真は父によってとられました。', 'This picture was taken by my father.', '受け身 was taken ＋ by 〜。'),
      O('箱の中にりんごがいくつかあります。', 'There are some apples in the box.', '複数なので There are。'),
      O('私は来週おばを訪ねるつもりです。', 'I am going to visit my aunt next week.', 'be going to ＋ 動詞の原形。'),
      O('パーティーに来てくれてありがとう。', 'Thank you for coming to the party.', 'for のあとは ing 形。'),
      O('母は私にすてきなかばんをくれました。', 'My mother gave me a nice bag.', 'give ＋ 人 ＋ もの。'),
      O('私は彼女が試合に勝つと思います。', 'I think that she will win the game.', 'I think that ＋ 主語 ＋ 動詞。'),
    ], ['まず「主語」と「動詞」を見つけて、文の最初に置こう。', '意味のまとまり（to 〜、the 〜est of …、by 〜 など）をつくってから並べよう。']),
  });

  const units = [
    { id: 'u1e_rev', grade: 1, name: '中1の文法' },
    { id: 'u2e_past', grade: 2, name: '過去進行形' },
    { id: 'u2e_future', grade: 2, name: '未来の表現' },
    { id: 'u2e_conj', grade: 2, name: '接続詞' },
    { id: 'u2e_inf', grade: 2, name: '不定詞・動名詞' },
    { id: 'u2e_there', grade: 2, name: 'There is・文型' },
    { id: 'u2e_modal', grade: 2, name: '助動詞' },
    { id: 'u2e_comp', grade: 2, name: '比較' },
    { id: 'u2e_pass', grade: 2, name: '受け身・不規則動詞' },
    { id: 'u2e_order', grade: 2, name: '並べかえ（総合）' },
  ];

  const api = buildCourse({
    id: 'j2e', title: '中学2年・英語', subj: '英語', subjKey: 'eng', group: 'j2', icon: '🔤', main: 2,
    gradeName: { 1: '中1', 2: '中2' }, gradeTitle: { 2: '中学2年', 1: '中学1年（復習）' },
    titles: ['はじめの一歩', '見習い', 'チャレンジャー', 'がんばり屋', '努力家', '文法名人', '英語ファイター', '英語マスター', '英語博士', '英語の達人'],
    goals: K.J2_GOALS,
  }, list, units);
  root.COURSES = root.COURSES || {};
  root.COURSES.j2e = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
