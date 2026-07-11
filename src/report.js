import { roundHours } from './score.js';

function list(items) {
  if (!items.length) return '- （該当なし）';
  return items.map((item) => `- ${item}`).join('\n');
}

export function formatDateForFilename(dateText) {
  return dateText.replaceAll('-', '');
}

export function buildMarkdownReport(result) {
  const answers = result.answers;
  const memo = result.memo ? result.memo : '（未記入）';
  const secondary = result.recommendation.secondary.length ? result.recommendation.secondary.join('、') : 'なし';
  const timeLines = [result.timeEstimate.current];
  if (result.timeEstimate.peopleNote) timeLines.push(result.timeEstimate.peopleNote);
  if (result.timeEstimate.reduction) timeLines.push(result.timeEstimate.reduction);
  if (result.timeEstimate.recommendation) timeLines.push(result.timeEstimate.recommendation);

  return `# 業務自動化カルテ 診断結果

- 診断日: ${result.date}
- 発行: 業務自動化カルテ（ママゴトラボ） https://mamagotolab.com/automation-karte/

## 1. 業務の概要（ご入力内容）
${memo}

## 2. 現状の整理
- 頻度: ${answers.q_freq} ／ 1回あたり: ${answers.q_time}分 ／ 月あたり: ${answers.q_count}回（約${roundHours(result.monthlyHours).toFixed(1)}時間）
- 担当人数: ${answers.q_people}
- もとになるデータ: ${(answers.q_input ?? []).join('、')} ／ 形式の安定度: ${answers.q_format}
- 作業内容: ${(answers.q_work ?? []).join('、')}
- 出力先: ${(answers.q_output ?? []).join('、')}
- 環境: ${answers.q_env} ／ 判断ルール: ${answers.q_rules} ／ 例外の頻度: ${answers.q_exception} ／ 手順変更の権限: ${answers.q_authority}

## 3. 自動化適性: ${result.suitability}
### プラスに働く点
${list(result.plusFactors)}

### 注意が必要な点
${list(result.minusFactors)}

## 4. 自動化できる部分・人が担当する部分
### 自動化できる可能性が高い部分
${list(result.automatableParts)}

### 人が担当する部分
${list(result.humanParts)}

## 5. 推奨する実現方法
- 主候補: ${result.recommendation.primary}
- 副候補: ${secondary}

## 6. 時間の試算
${timeLines.map((line) => `- ${line}`).join('\n')}

## 7. 開発に必要な資料
${list(result.requiredMaterials)}

## 8. 注意点
${list(result.cautions)}

---
このカルテは、業務自動化の無料診断アプリ「業務自動化カルテ」（ママゴトラボ）が
ご入力内容をもとにルールベースで作成したものです。
このまま開発者への相談・見積もり依頼にお使いいただけます。

同じ仕組みを自社向けに（ご相談窓口）:
- クラウドワークス: https://crowdworks.jp/public/employees/6942778
- ママゴトラボ: https://mamagotolab.com
`;
}
