const FACTORS = {
  plus: 'plus',
  minus: 'minus',
};

export function calculateMonthlyHours(answers) {
  const minutes = Number(answers.q_time);
  const count = Number(answers.q_count);
  if (!Number.isFinite(minutes) || !Number.isFinite(count)) {
    return 0;
  }
  return (minutes * count) / 60;
}

export function roundHours(value) {
  return Math.round(value * 10) / 10;
}

function addFactor(items, type, text) {
  items.push({ type, text });
}

export function getSuitability(score) {
  if (score >= 60) return '高';
  if (score >= 30) return '中';
  return '低';
}

export function scoreAnswers(answers) {
  let score = 0;
  const factors = [];

  if (answers.q_format === 'ほぼ同じ') {
    score += 20;
    addFactor(factors, FACTORS.plus, '＋ データの形式が一定で、プログラムで扱いやすい');
  } else if (answers.q_format === 'だいたい同じ（たまに変わる）') {
    score += 10;
    addFactor(factors, FACTORS.plus, '＋ データの形式がおおむね一定');
  } else if (answers.q_format === '毎回バラバラ') {
    score -= 15;
    addFactor(factors, FACTORS.minus, '− データの形式が毎回変わるため、事前の形式統一が必要');
  }

  if (answers.q_rules === 'すべて説明できる') {
    score += 20;
    addFactor(factors, FACTORS.plus, '＋ 判断ルールを言語化できており、そのままプログラムにできる');
  } else if (answers.q_rules === '大半は説明できるが例外もある') {
    score += 10;
    addFactor(factors, FACTORS.plus, '＋ 判断ルールの大半を言語化できる');
  } else if (answers.q_rules === '勘と経験によるところが大きい') {
    score -= 20;
    addFactor(factors, FACTORS.minus, '− 判断基準の言語化から始める必要がある');
  }

  if (answers.q_exception === 'ほとんど起きない') {
    score += 15;
    addFactor(factors, FACTORS.plus, '＋ 例外が少なく、安定した自動処理が期待できる');
  } else if (answers.q_exception === '月に数回程度') {
    score += 5;
    addFactor(factors, FACTORS.plus, '＋ 例外は少なめ（例外時は人が対応する設計にする）');
  } else if (answers.q_exception === 'しょっちゅう起きる') {
    score -= 15;
    addFactor(factors, FACTORS.minus, '− 例外が多く、一括自動化には向かない');
  }

  const monthlyHours = calculateMonthlyHours(answers);
  if (monthlyHours >= 10) {
    score += 15;
    addFactor(factors, FACTORS.plus, '＋ 月あたりの作業時間が大きく、自動化の効果が出やすい');
  } else if (monthlyHours >= 3) {
    score += 10;
    addFactor(factors, FACTORS.plus, '＋ 月あたりの作業時間がまとまっており、効果が見込める');
  } else if (monthlyHours >= 1) {
    score += 5;
    addFactor(factors, FACTORS.plus, '＋ 作業時間は小さいが、ミス防止の効果はある');
  }

  const inputs = answers.q_input ?? [];
  const hasPaper = inputs.includes('紙・FAX');
  const hasVerbal = inputs.includes('電話・口頭');
  if (!hasPaper && !hasVerbal && inputs.length > 0) {
    score += 10;
    addFactor(factors, FACTORS.plus, '＋ データがすべてデジタルで、そのまま処理できる');
  }
  if (hasPaper) {
    score -= 10;
    addFactor(factors, FACTORS.minus, '− 紙・FAXの情報は、まずデジタル化する工程が必要');
  }
  if (hasVerbal) {
    score -= 15;
    addFactor(factors, FACTORS.minus, '− 口頭の情報は自動化の対象にできない（記録の仕組みが先）');
  }

  if (answers.q_env === 'Google中心（Gmail・スプレッドシート）' || answers.q_env === '両方使っている') {
    score += 10;
    addFactor(factors, FACTORS.plus, '＋ Googleの無料プログラム（GAS）がそのまま使える環境');
  } else if (answers.q_env === 'Microsoft中心（Excel・Outlook）') {
    score += 5;
    addFactor(factors, FACTORS.plus, '＋ Excelマクロ等の自動化手段がある環境');
  }

  if (answers.q_people === '2〜3人') {
    score += 5;
    addFactor(factors, FACTORS.plus, '＋ 複数人の作業なので、効果が人数分になる');
  } else if (answers.q_people === '4人以上') {
    score += 10;
    addFactor(factors, FACTORS.plus, '＋ 多人数の作業なので、効果が大きい');
  }

  return {
    score,
    suitability: getSuitability(score),
    plusFactors: factors.filter((factor) => factor.type === FACTORS.plus).map((factor) => factor.text),
    minusFactors: factors.filter((factor) => factor.type === FACTORS.minus).map((factor) => factor.text),
    monthlyHours,
  };
}
