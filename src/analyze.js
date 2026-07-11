import { scoreAnswers, roundHours } from './score.js';
import { recommendMethod } from './recommend.js';

const AUTOMATABLE_MAP = {
  '転記・コピペ': 'データの転記・コピー＆ペースト（自動化に最も向く作業です）',
  '集計・計算': '集計・計算（ルールが決まっていれば確実に自動化できます）',
  'ファイルの結合・分割': '複数ファイルの結合・分割',
  '帳票・書類の作成': '帳票・書類の自動作成',
  'メール送信・通知': 'メールの自動送信・通知',
  'システムへの入力・登録': 'システムへの入力・登録（画面の自動操作。システムの仕様確認が必要です）',
  'チェック・照合': 'データのチェック・照合（見落とし防止に効果的です）',
  'ファイルの整理・保存': 'ファイルの自動整理・保存',
};

export function getAutomatableParts(answers) {
  return (answers.q_work ?? []).map((item) => AUTOMATABLE_MAP[item]).filter(Boolean);
}

export function getHumanParts(answers) {
  const parts = ['自動処理の結果の最終確認'];
  if (answers.q_rules !== 'すべて説明できる') {
    parts.push('例外的なケースの判断');
  }
  if (answers.q_exception !== 'ほとんど起きない') {
    parts.push('イレギュラー発生時の対応');
  }
  return parts;
}

export function getRequiredMaterials(answers) {
  const input = answers.q_input ?? [];
  const work = answers.q_work ?? [];
  const materials = ['現在の手順を箇条書きにしたメモ（あれば）'];
  if (input.includes('Excel・CSVファイル')) materials.push('サンプルのExcel・CSVファイル（個人情報はダミーに置き換えたもの）');
  if (input.includes('Googleスプレッドシート')) materials.push('対象スプレッドシートのコピー、または閲覧共有');
  if (input.includes('メール（添付ファイル含む）')) materials.push('実際に届くメールの文面サンプル');
  if (input.includes('Webシステムの画面')) materials.push('対象システムの名称と、画面のスクリーンショット');
  if (input.includes('PDF')) materials.push('サンプルのPDFファイル');
  if (work.includes('集計・計算')) materials.push('集計・計算ルールの説明（手書きメモで可）');
  if (work.includes('帳票・書類の作成')) materials.push('完成形の帳票・書類のサンプル');
  if (work.includes('メール送信・通知')) materials.push('送信するメールの文面テンプレート');
  return materials;
}

export function getCautions(answers) {
  const cautions = [];
  const input = answers.q_input ?? [];
  if (answers.q_format === 'だいたい同じ（たまに変わる）' || answers.q_format === '毎回バラバラ') {
    cautions.push('元データの形式が変わると自動処理が止まることがあります。形式を固定する運用調整を先に行うと安定します');
  }
  if (answers.q_exception === 'しょっちゅう起きる') {
    cautions.push('例外が多い業務の一括自動化はおすすめしません。定型部分から段階的に自動化する進め方が現実的です');
  }
  if (answers.q_authority === '変えられない') {
    cautions.push('業務手順の変更には関係者の合意が必要です。自動化の範囲が調整になる可能性があります');
  }
  if (answers.q_rules === '勘と経験によるところが大きい') {
    cautions.push('判断基準の言語化が最初の工程になります（ヒアリングで一緒に整理できます）');
  }
  if (input.includes('紙・FAX') || input.includes('電話・口頭')) {
    cautions.push('紙・口頭の情報はそのままでは自動化できません。情報の入口をデジタル化することが前提になります');
  }
  if (input.includes('PDF')) {
    cautions.push('PDFはレイアウトによって読み取り精度が変わるため、事前検証が必要です');
  }
  return cautions;
}

export function getTimeEstimate(answers, suitability, monthlyHours) {
  const current = `現在の作業時間：月あたり約${roundHours(monthlyHours).toFixed(1)}時間（1回${answers.q_time}分 × 月${answers.q_count}回のご入力値から算出）`;
  const peopleNote = answers.q_people !== '1人' ? '※担当者1人分の時間です。実際は人数分の効果が見込めます' : '';
  if (suitability === '低') {
    return {
      current,
      peopleNote,
      reduction: '',
      recommendation: 'まずは業務の整理から始めることをおすすめします',
    };
  }
  const ratio = suitability === '高' ? 0.8 : 0.5;
  const label = suitability === '高' ? '8割' : '5割';
  return {
    current,
    peopleNote,
    reduction: `仮に作業の${label}を自動化できた場合：月あたり約${roundHours(monthlyHours * ratio).toFixed(1)}時間の削減（あくまで試算です。実際の削減幅は業務の内容によって変わります）`,
    recommendation: '',
  };
}

export function analyze(answers, memo = '', date = new Date()) {
  const score = scoreAnswers(answers);
  const timeEstimate = getTimeEstimate(answers, score.suitability, score.monthlyHours);
  return {
    id: '',
    createdAt: date.toISOString(),
    date: date.toISOString().slice(0, 10),
    memo,
    answers,
    score: score.score,
    suitability: score.suitability,
    plusFactors: score.plusFactors,
    minusFactors: score.minusFactors,
    monthlyHours: score.monthlyHours,
    automatableParts: getAutomatableParts(answers),
    humanParts: getHumanParts(answers),
    recommendation: recommendMethod(answers),
    timeEstimate,
    requiredMaterials: getRequiredMaterials(answers),
    cautions: getCautions(answers),
  };
}
