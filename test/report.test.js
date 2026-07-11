import { describe, expect, it } from 'vitest';
import { analyze } from '../src/analyze.js';
import { buildMarkdownReport } from '../src/report.js';
import { baseAnswers } from './fixtures.js';

describe('buildMarkdownReport', () => {
  it('業務メモがそのまま本文に含まれる', () => {
    const memo = '毎週のExcel集計を担当者ごとにまとめています。';
    const report = buildMarkdownReport(analyze(baseAnswers(), memo, new Date('2026-07-11T00:00:00.000Z')));
    expect(report).toContain(memo);
  });

  it('適性=低で試算が出ない', () => {
    const result = analyze(baseAnswers({
      q_time: 10,
      q_count: 1,
      q_input: ['紙・FAX', '電話・口頭'],
      q_format: '毎回バラバラ',
      q_rules: '勘と経験によるところが大きい',
      q_exception: 'しょっちゅう起きる',
      q_env: 'どちらでもない',
    }), '', new Date('2026-07-11T00:00:00.000Z'));
    const report = buildMarkdownReport(result);
    expect(result.suitability).toBe('低');
    expect(report).not.toContain('仮に作業の');
    expect(report).toContain('まずは業務の整理から始めることをおすすめします');
  });

  it('試算文言に「試算です」が含まれる', () => {
    const report = buildMarkdownReport(analyze(baseAnswers(), '', new Date('2026-07-11T00:00:00.000Z')));
    expect(report).toContain('試算です');
  });

  it('CTAリンクが含まれる', () => {
    const report = buildMarkdownReport(analyze(baseAnswers(), '', new Date('2026-07-11T00:00:00.000Z')));
    expect(report).toContain('https://crowdworks.jp/public/employees/6942778');
    expect(report).toContain('https://mamagotolab.com');
  });
});
