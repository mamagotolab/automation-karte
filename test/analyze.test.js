import { describe, expect, it } from 'vitest';
import { analyze, getCautions, getHumanParts, getRequiredMaterials, getTimeEstimate } from '../src/analyze.js';
import { baseAnswers } from './fixtures.js';

describe('analyze mappings', () => {
  it('必要資料マッピングを条件に応じて列挙する', () => {
    const materials = getRequiredMaterials(baseAnswers({
      q_input: ['Excel・CSVファイル', 'Googleスプレッドシート', 'メール（添付ファイル含む）', 'Webシステムの画面', 'PDF'],
      q_work: ['集計・計算', '帳票・書類の作成', 'メール送信・通知'],
    }));
    expect(materials).toEqual([
      '現在の手順を箇条書きにしたメモ（あれば）',
      'サンプルのExcel・CSVファイル（個人情報はダミーに置き換えたもの）',
      '対象スプレッドシートのコピー、または閲覧共有',
      '実際に届くメールの文面サンプル',
      '対象システムの名称と、画面のスクリーンショット',
      'サンプルのPDFファイル',
      '集計・計算ルールの説明（手書きメモで可）',
      '完成形の帳票・書類のサンプル',
      '送信するメールの文面テンプレート',
    ]);
  });

  it('注意点マッピングを条件に応じて列挙する', () => {
    const cautions = getCautions(baseAnswers({
      q_format: '毎回バラバラ',
      q_exception: 'しょっちゅう起きる',
      q_authority: '変えられない',
      q_rules: '勘と経験によるところが大きい',
      q_input: ['紙・FAX', '電話・口頭', 'PDF'],
    }));
    expect(cautions).toEqual([
      '元データの形式が変わると自動処理が止まることがあります。形式を固定する運用調整を先に行うと安定します',
      '例外が多い業務の一括自動化はおすすめしません。定型部分から段階的に自動化する進め方が現実的です',
      '業務手順の変更には関係者の合意が必要です。自動化の範囲が調整になる可能性があります',
      '判断基準の言語化が最初の工程になります（ヒアリングで一緒に整理できます）',
      '紙・口頭の情報はそのままでは自動化できません。情報の入口をデジタル化することが前提になります',
      'PDFはレイアウトによって読み取り精度が変わるため、事前検証が必要です',
    ]);
  });

  it('人が担当する部分の条件分岐を行う', () => {
    expect(getHumanParts(baseAnswers())).toEqual(['自動処理の結果の最終確認']);
    expect(getHumanParts(baseAnswers({
      q_rules: '大半は説明できるが例外もある',
      q_exception: '月に数回程度',
    }))).toEqual(['自動処理の結果の最終確認', '例外的なケースの判断', 'イレギュラー発生時の対応']);
  });

  it('時間計算を小数第1位に丸め、適性ごとの文言を返す', () => {
    const high = getTimeEstimate(baseAnswers({ q_time: 35, q_count: 3, q_people: '2〜3人' }), '高', 1.75);
    expect(high.current).toBe('現在の作業時間：月あたり約1.8時間（1回35分 × 月3回のご入力値から算出）');
    expect(high.peopleNote).toBe('※担当者1人分の時間です。実際は人数分の効果が見込めます');
    expect(high.reduction).toBe('仮に作業の8割を自動化できた場合：月あたり約1.4時間の削減（あくまで試算です。実際の削減幅は業務の内容によって変わります）');

    const middle = getTimeEstimate(baseAnswers({ q_time: 35, q_count: 3 }), '中', 1.75);
    expect(middle.reduction).toBe('仮に作業の5割を自動化できた場合：月あたり約0.9時間の削減（あくまで試算です。実際の削減幅は業務の内容によって変わります）');

    const low = getTimeEstimate(baseAnswers({ q_time: 35, q_count: 3 }), '低', 1.75);
    expect(low.reduction).toBe('');
    expect(low.recommendation).toBe('まずは業務の整理から始めることをおすすめします');
  });

  it('統合結果に自動化できる部分を含める', () => {
    const result = analyze(baseAnswers({ q_work: ['転記・コピペ', 'チェック・照合'] }), 'メモ', new Date('2026-07-11T00:00:00.000Z'));
    expect(result.automatableParts).toEqual([
      'データの転記・コピー＆ペースト（自動化に最も向く作業です）',
      'データのチェック・照合（見落とし防止に効果的です）',
    ]);
    expect(result.date).toBe('2026-07-11');
  });
});
