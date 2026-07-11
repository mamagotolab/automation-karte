export const FREQUENCY_DEFAULT_COUNTS = {
  '毎日': 20,
  '週に数回': 12,
  '週に1回': 4,
  '月に数回': 3,
  '月に1回': 1,
  '不定期': 2,
};

export const QUESTIONS = [
  {
    id: 'q_freq',
    section: '作業量',
    text: 'その作業はどのくらいの頻度でありますか？',
    type: 'single',
    options: ['毎日', '週に数回', '週に1回', '月に数回', '月に1回', '不定期'],
  },
  {
    id: 'q_time',
    section: '作業量',
    text: '1回あたり、どのくらい時間がかかりますか？（分）',
    type: 'number',
    min: 1,
    max: 9999,
  },
  {
    id: 'q_count',
    section: '作業量',
    text: '月に何回くらい行いますか？',
    type: 'number',
    min: 1,
    max: 999,
  },
  {
    id: 'q_people',
    section: '作業量',
    text: 'この作業を行う人は何人いますか？',
    type: 'single',
    options: ['1人', '2〜3人', '4人以上'],
  },
  {
    id: 'q_input',
    section: '入力データ',
    text: '作業のもとになるデータは？（複数選択可）',
    type: 'multi',
    options: ['Excel・CSVファイル', 'Googleスプレッドシート', 'メール（添付ファイル含む）', 'Webシステムの画面', 'PDF', '紙・FAX', '電話・口頭'],
  },
  {
    id: 'q_format',
    section: '入力データ',
    text: 'もとになるデータの形式は毎回同じですか？',
    type: 'single',
    options: ['ほぼ同じ', 'だいたい同じ（たまに変わる）', '毎回バラバラ'],
  },
  {
    id: 'q_work',
    section: '作業内容',
    text: 'どんな作業をしていますか？（複数選択可）',
    type: 'multi',
    options: ['転記・コピペ', '集計・計算', 'ファイルの結合・分割', '帳票・書類の作成', 'メール送信・通知', 'システムへの入力・登録', 'チェック・照合', 'ファイルの整理・保存'],
  },
  {
    id: 'q_rules',
    section: '作業内容',
    text: '作業の判断ルールを文章で説明できますか？',
    type: 'single',
    options: ['すべて説明できる', '大半は説明できるが例外もある', '勘と経験によるところが大きい'],
  },
  {
    id: 'q_exception',
    section: '作業内容',
    text: 'イレギュラー（例外対応）はどのくらい起きますか？',
    type: 'single',
    options: ['ほとんど起きない', '月に数回程度', 'しょっちゅう起きる'],
  },
  {
    id: 'q_env',
    section: '環境と出力',
    text: '普段お使いの環境は？',
    type: 'single',
    options: ['Google中心（Gmail・スプレッドシート）', 'Microsoft中心（Excel・Outlook）', '両方使っている', 'どちらでもない'],
  },
  {
    id: 'q_output',
    section: '環境と出力',
    text: '作業の結果はどこに出しますか？（複数選択可）',
    type: 'multi',
    options: ['Excel・CSVファイル', 'Googleスプレッドシート', 'メールで送る', 'Webシステムに登録', '紙に印刷'],
  },
  {
    id: 'q_authority',
    section: '環境と出力',
    text: '作業のやり方を変える権限はありますか？',
    type: 'single',
    options: ['自分で決められる', '相談すれば変えられる', '変えられない'],
  },
];

export function getQuestion(id) {
  return QUESTIONS.find((question) => question.id === id);
}
