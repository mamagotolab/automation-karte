import { describe, expect, it } from 'vitest';
import { getSuitability, scoreAnswers } from '../src/score.js';
import { baseAnswers } from './fixtures.js';

describe('scoreAnswers', () => {
  it('定型性ルールを加点・減点する', () => {
    expect(scoreAnswers(baseAnswers({ q_format: 'ほぼ同じ' })).score).toBe(85);
    expect(scoreAnswers(baseAnswers({ q_format: 'だいたい同じ（たまに変わる）' })).score).toBe(75);
    expect(scoreAnswers(baseAnswers({ q_format: '毎回バラバラ' })).score).toBe(50);
  });

  it('ルール化ルールを加点・減点する', () => {
    expect(scoreAnswers(baseAnswers({ q_rules: 'すべて説明できる' })).score).toBe(85);
    expect(scoreAnswers(baseAnswers({ q_rules: '大半は説明できるが例外もある' })).score).toBe(75);
    expect(scoreAnswers(baseAnswers({ q_rules: '勘と経験によるところが大きい' })).score).toBe(45);
  });

  it('例外ルールを加点・減点する', () => {
    expect(scoreAnswers(baseAnswers({ q_exception: 'ほとんど起きない' })).score).toBe(85);
    expect(scoreAnswers(baseAnswers({ q_exception: '月に数回程度' })).score).toBe(75);
    expect(scoreAnswers(baseAnswers({ q_exception: 'しょっちゅう起きる' })).score).toBe(55);
  });

  it('作業量ルールを月時間で判定する', () => {
    expect(scoreAnswers(baseAnswers({ q_time: 60, q_count: 10 })).plusFactors).toContain('＋ 月あたりの作業時間が大きく、自動化の効果が出やすい');
    expect(scoreAnswers(baseAnswers({ q_time: 60, q_count: 3 })).plusFactors).toContain('＋ 月あたりの作業時間がまとまっており、効果が見込める');
    expect(scoreAnswers(baseAnswers({ q_time: 60, q_count: 1 })).plusFactors).toContain('＋ 作業時間は小さいが、ミス防止の効果はある');
    expect(scoreAnswers(baseAnswers({ q_time: 20, q_count: 2 })).plusFactors).not.toContain('＋ 作業時間は小さいが、ミス防止の効果はある');
  });

  it('入力形態ルールを判定し、紙・FAXと電話・口頭は重複減点する', () => {
    const digital = scoreAnswers(baseAnswers({ q_input: ['Excel・CSVファイル', 'PDF'] }));
    expect(digital.plusFactors).toContain('＋ データがすべてデジタルで、そのまま処理できる');

    const analog = scoreAnswers(baseAnswers({ q_input: ['紙・FAX', '電話・口頭'] }));
    expect(analog.score).toBe(50);
    expect(analog.minusFactors).toContain('− 紙・FAXの情報は、まずデジタル化する工程が必要');
    expect(analog.minusFactors).toContain('− 口頭の情報は自動化の対象にできない（記録の仕組みが先）');
  });

  it('環境ルールを加点する', () => {
    expect(scoreAnswers(baseAnswers({ q_env: 'Google中心（Gmail・スプレッドシート）' })).score).toBe(85);
    expect(scoreAnswers(baseAnswers({ q_env: '両方使っている' })).score).toBe(85);
    expect(scoreAnswers(baseAnswers({ q_env: 'Microsoft中心（Excel・Outlook）' })).score).toBe(80);
    expect(scoreAnswers(baseAnswers({ q_env: 'どちらでもない' })).score).toBe(75);
  });

  it('人数ルールを加点する', () => {
    expect(scoreAnswers(baseAnswers({ q_people: '1人' })).score).toBe(85);
    expect(scoreAnswers(baseAnswers({ q_people: '2〜3人' })).score).toBe(90);
    expect(scoreAnswers(baseAnswers({ q_people: '4人以上' })).score).toBe(95);
  });

  it('合計点の境界値で判定が変わる', () => {
    expect(getSuitability(59)).toBe('中');
    expect(getSuitability(60)).toBe('高');
    expect(getSuitability(29)).toBe('低');
    expect(getSuitability(30)).toBe('中');
  });
});
