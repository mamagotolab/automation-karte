import { describe, expect, it } from 'vitest';
import { recommendMethod } from '../src/recommend.js';
import { baseAnswers } from './fixtures.js';

describe('recommendMethod', () => {
  it('分岐#1: デジタルの選択肢がない場合は入口のデジタル化を主候補にする', () => {
    expect(recommendMethod(baseAnswers({
      q_input: ['紙・FAX', '電話・口頭'],
      q_output: ['紙に印刷'],
    }))).toEqual({
      primary: '自動化の前に、情報の入口をデジタル化する業務整理（例：Googleフォームでの受付に変える）',
      secondary: [],
    });
  });

  it('分岐#2: Google中心または両方はGASを主候補にする', () => {
    expect(recommendMethod(baseAnswers({ q_env: 'Google中心（Gmail・スプレッドシート）' }))).toEqual({
      primary: 'GAS（Googleの無料プログラム。スプレッドシート・Gmailと相性が良い）',
      secondary: ['Python'],
    });
    expect(recommendMethod(baseAnswers({ q_env: '両方使っている' })).primary).toBe('GAS（Googleの無料プログラム。スプレッドシート・Gmailと相性が良い）');
  });

  it('分岐#3: Microsoft中心はVBAを主候補にする', () => {
    expect(recommendMethod(baseAnswers({ q_env: 'Microsoft中心（Excel・Outlook）' }))).toEqual({
      primary: 'VBA（Excelに標準搭載のマクロ機能）',
      secondary: ['Python'],
    });
  });

  it('分岐#4: どちらでもない場合はPythonを主候補にする', () => {
    expect(recommendMethod(baseAnswers({ q_env: 'どちらでもない' }))).toEqual({
      primary: 'Python（汎用の自動化。実行環境の準備が必要）',
      secondary: [],
    });
  });

  it('追加ルール: q_workのシステム入力でブラウザ自動操作を副候補に追記する', () => {
    expect(recommendMethod(baseAnswers({
      q_work: ['システムへの入力・登録'],
    })).secondary).toEqual(['Python', 'Python（ブラウザ自動操作）']);
  });

  it('追加ルール: q_inputのWebシステム画面でブラウザ自動操作を副候補に追記する', () => {
    expect(recommendMethod(baseAnswers({
      q_input: ['Webシステムの画面'],
      q_env: 'どちらでもない',
    })).secondary).toEqual(['Python（ブラウザ自動操作）']);
  });
});
