export function baseAnswers(overrides = {}) {
  return {
    q_freq: '週に1回',
    q_time: 60,
    q_count: 4,
    q_people: '1人',
    q_input: ['Excel・CSVファイル'],
    q_format: 'ほぼ同じ',
    q_work: ['転記・コピペ'],
    q_rules: 'すべて説明できる',
    q_exception: 'ほとんど起きない',
    q_env: 'Google中心（Gmail・スプレッドシート）',
    q_output: ['Excel・CSVファイル'],
    q_authority: '自分で決められる',
    ...overrides,
  };
}
