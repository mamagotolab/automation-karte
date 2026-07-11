function isOnlyAnalog(input, output) {
  const digitalInputs = ['Excel・CSVファイル', 'Googleスプレッドシート', 'メール（添付ファイル含む）', 'Webシステムの画面', 'PDF'];
  const digitalOutputs = ['Excel・CSVファイル', 'Googleスプレッドシート', 'メールで送る', 'Webシステムに登録'];
  return !input.some((item) => digitalInputs.includes(item)) && !output.some((item) => digitalOutputs.includes(item));
}

export function recommendMethod(answers) {
  const input = answers.q_input ?? [];
  const output = answers.q_output ?? [];
  const work = answers.q_work ?? [];

  if (isOnlyAnalog(input, output)) {
    return {
      primary: '自動化の前に、情報の入口をデジタル化する業務整理（例：Googleフォームでの受付に変える）',
      secondary: [],
    };
  }

  const secondary = [];
  let primary = '';

  if (answers.q_env === 'Google中心（Gmail・スプレッドシート）' || answers.q_env === '両方使っている') {
    primary = 'GAS（Googleの無料プログラム。スプレッドシート・Gmailと相性が良い）';
    secondary.push('Python');
  } else if (answers.q_env === 'Microsoft中心（Excel・Outlook）') {
    primary = 'VBA（Excelに標準搭載のマクロ機能）';
    secondary.push('Python');
  } else if (answers.q_env === 'どちらでもない') {
    primary = 'Python（汎用の自動化。実行環境の準備が必要）';
  }

  if (work.includes('システムへの入力・登録') || input.includes('Webシステムの画面')) {
    secondary.push('Python（ブラウザ自動操作）');
  }

  return {
    primary,
    secondary,
  };
}
