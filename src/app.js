import './app.css';
import { QUESTIONS, FREQUENCY_DEFAULT_COUNTS } from './questions.js';
import { analyze } from './analyze.js';
import { buildMarkdownReport, formatDateForFilename } from './report.js';
import { deleteRecord, listRecords, saveRecord } from './store.js';

const app = document.querySelector('#app');

const state = {
  step: 0,
  memo: '',
  answers: {},
  result: null,
  storageNotice: '',
  copyNotice: '',
  errors: [],
};

function el(tag, options = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(options).forEach(([key, value]) => {
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'htmlFor') node.htmlFor = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (value !== false && value !== null && value !== undefined) node.setAttribute(key, value === true ? '' : String(value));
  });
  children.forEach((child) => node.append(child));
  return node;
}

function setStep(step) {
  state.step = step;
  state.errors = [];
  state.copyNotice = '';
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function render() {
  app.replaceChildren();
  app.append(renderShell());
}

function renderShell() {
  return el('main', { className: `app step-${state.step}` }, [
    state.step === 0 ? renderTop() : null,
    state.step === 1 ? renderMemo() : null,
    state.step === 2 ? renderQuestions() : null,
    state.step === 3 && state.result ? renderResult(state.result) : null,
  ].filter(Boolean));
}

function renderHero() {
  return el('section', { className: 'hero' }, [
    el('p', { className: 'eyebrow', text: '無料診断アプリ' }),
    el('h1', { text: '業務自動化カルテ' }),
    el('p', { className: 'tagline', text: 'その作業、自動化できますか？' }),
    el('p', { className: 'lead', text: '普段の作業について質問に答えると、自動化の適性・推奨する実現方法・開発者に渡せる要件整理書が無料で手に入る診断アプリ。' }),
    el('div', { className: 'badges' }, [
      el('span', { text: '無料' }),
      el('span', { text: '登録不要' }),
      el('span', { text: '入力内容はブラウザの外に送信されません' }),
    ]),
  ]);
}

function renderTop() {
  return el('div', {}, [
    renderHero(),
    el('section', { className: 'panel start-panel' }, [
      el('button', { className: 'primary large', type: 'button', onClick: () => setStep(1), text: '診断をはじめる' }),
      renderRecords(),
    ]),
  ]);
}

function renderRecords() {
  const records = listRecords();
  const section = el('section', { className: 'history' }, [el('h2', { text: '過去の診断' })]);
  if (!records.length) {
    section.append(el('p', { className: 'muted', text: '保存された診断はまだありません。' }));
    return section;
  }
  const list = el('div', { className: 'record-list' });
  records.forEach((record) => {
    const memo = record.memo ? record.memo.slice(0, 30) : '（業務メモ未入力）';
    const item = el('article', { className: 'record-item' }, [
      el('div', {}, [
        el('strong', { text: `${formatDateTime(record.createdAt)} の診断` }),
        el('p', { text: memo }),
      ]),
      el('div', { className: 'record-actions' }, [
        el('button', { type: 'button', onClick: () => openRecord(record), text: '開く' }),
        el('button', { type: 'button', className: 'danger', onClick: () => { deleteRecord(record.id); render(); }, text: '削除' }),
      ]),
    ]);
    list.append(item);
  });
  section.append(list);
  return section;
}

function openRecord(record) {
  state.memo = record.memo ?? '';
  state.answers = { ...record.answers };
  state.result = record;
  setStep(3);
}

function renderMemo() {
  const textarea = el('textarea', {
    id: 'memo',
    maxlength: '2000',
    rows: '9',
    placeholder: '毎週、担当者から送られてくるExcelを1つにまとめて、商品別の件数を集計しています',
  });
  textarea.value = state.memo;
  textarea.addEventListener('input', () => {
    state.memo = textarea.value.slice(0, 2000);
  });

  return el('section', { className: 'panel narrow' }, [
    renderStepHeader('Step 1', '業務メモ'),
    el('label', { htmlFor: 'memo', className: 'field-label', text: 'どんな作業か、普段お使いの言葉でご記入ください' }),
    textarea,
    el('p', { className: 'muted', text: '任意入力です。最大2000字まで入力できます。' }),
    renderNav([
      el('button', { type: 'button', onClick: () => setStep(0), text: '戻る' }),
      el('button', { type: 'button', className: 'primary', onClick: () => setStep(2), text: '質問へ進む' }),
    ]),
  ]);
}

function renderQuestions() {
  const container = el('section', { className: 'panel questions' }, [
    renderStepHeader('Step 2', '質問'),
    el('p', { className: 'progress', text: `12問中 ${countAnswered()}問 回答済み` }),
  ]);

  if (state.errors.length) {
    const box = el('div', { className: 'error-box', role: 'alert' }, [
      el('strong', { text: '未回答の質問があります。' }),
      el('ul', {}, state.errors.map((message) => el('li', { text: message }))),
    ]);
    container.append(box);
  }

  let currentSection = '';
  QUESTIONS.forEach((question) => {
    if (question.section !== currentSection) {
      currentSection = question.section;
      container.append(el('h2', { className: 'section-title', text: currentSection }));
    }
    container.append(renderQuestion(question));
  });

  container.append(renderNav([
    el('button', { type: 'button', onClick: () => setStep(1), text: '戻る' }),
    el('button', { type: 'button', className: 'primary', onClick: diagnose, text: '診断する' }),
  ]));
  return container;
}

function renderQuestion(question) {
  const wrapper = el('fieldset', { className: 'question', id: `field-${question.id}` }, [
    el('legend', { text: question.text }),
  ]);
  if (question.type === 'single') {
    const options = el('div', { className: 'options' });
    question.options.forEach((option) => {
      const id = `${question.id}-${option}`;
      const input = el('input', { type: 'radio', id, name: question.id, value: option });
      input.checked = state.answers[question.id] === option;
      input.addEventListener('change', () => {
        state.answers[question.id] = option;
        if (question.id === 'q_freq' && !state.answers.q_count) {
          state.answers.q_count = FREQUENCY_DEFAULT_COUNTS[option];
          render();
        } else {
          updateProgress();
        }
      });
      options.append(el('label', { htmlFor: id }, [input, el('span', { text: option })]));
    });
    wrapper.append(options);
  }
  if (question.type === 'multi') {
    const options = el('div', { className: 'options' });
    question.options.forEach((option) => {
      const id = `${question.id}-${option}`;
      const input = el('input', { type: 'checkbox', id, name: question.id, value: option });
      input.checked = (state.answers[question.id] ?? []).includes(option);
      input.addEventListener('change', () => {
        const current = new Set(state.answers[question.id] ?? []);
        if (input.checked) current.add(option);
        else current.delete(option);
        state.answers[question.id] = Array.from(current);
        updateProgress();
      });
      options.append(el('label', { htmlFor: id }, [input, el('span', { text: option })]));
    });
    wrapper.append(options);
  }
  if (question.type === 'number') {
    const input = el('input', { type: 'number', id: question.id, min: question.min, max: question.max, inputmode: 'numeric' });
    input.value = state.answers[question.id] ?? '';
    input.addEventListener('input', () => {
      state.answers[question.id] = input.value;
      updateProgress();
    });
    wrapper.append(input);
  }
  return wrapper;
}

function updateProgress() {
  const node = document.querySelector('.progress');
  if (node) node.textContent = `12問中 ${countAnswered()}問 回答済み`;
}

function countAnswered() {
  return QUESTIONS.filter((question) => isAnswered(question)).length;
}

function isAnswered(question) {
  const value = state.answers[question.id];
  if (question.type === 'multi') return Array.isArray(value) && value.length > 0;
  if (question.type === 'number') {
    const number = Number(value);
    return Number.isInteger(number) && number >= question.min && number <= question.max;
  }
  return typeof value === 'string' && value.length > 0;
}

function validateAnswers() {
  return QUESTIONS.filter((question) => !isAnswered(question));
}

function diagnose() {
  const missing = validateAnswers();
  if (missing.length) {
    state.errors = missing.map((question) => `${question.text} が未回答です。`);
    render();
    document.querySelector(`#field-${missing[0].id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const normalized = { ...state.answers };
  normalized.q_time = Number(normalized.q_time);
  normalized.q_count = Number(normalized.q_count);
  const result = analyze(normalized, state.memo, new Date());
  const saved = saveRecord(result);
  state.storageNotice = saved.ok ? '' : saved.message;
  state.result = saved.ok ? saved.record : result;
  setStep(3);
}

function renderResult(result) {
  const report = buildMarkdownReport(result);
  const section = el('section', { className: 'result-wrap' }, [
    renderStepHeader('Step 3', '結果'),
    state.storageNotice ? el('p', { className: 'notice', text: state.storageNotice }) : null,
    el('article', { className: 'karte-card' }, [
      renderSuitability(result),
      renderParts(result),
      renderRecommendation(result),
      renderTime(result),
      renderListSection('開発に必要な資料', result.requiredMaterials),
      renderListSection('注意点', result.cautions),
      renderCta(),
    ]),
    renderActions(result, report),
    state.copyNotice ? el('p', { className: 'notice', text: state.copyNotice }) : null,
  ].filter(Boolean));
  return section;
}

function renderSuitability(result) {
  return el('section', { className: 'result-section' }, [
    el('h2', { text: `自動化適性：${result.suitability}` }),
    el('div', { className: 'factor-grid' }, [
      renderListSection('プラスに働く点', result.plusFactors),
      renderListSection('注意が必要な点', result.minusFactors),
    ]),
  ]);
}

function renderParts(result) {
  return el('section', { className: 'result-section split' }, [
    renderListSection('自動化できる可能性が高い部分', result.automatableParts),
    renderListSection('人が担当する部分', result.humanParts),
  ]);
}

function renderRecommendation(result) {
  const items = [`主候補: ${result.recommendation.primary}`];
  items.push(`副候補: ${result.recommendation.secondary.length ? result.recommendation.secondary.join('、') : 'なし'}`);
  return renderListSection('推奨する実現方法', items);
}

function renderTime(result) {
  const items = [result.timeEstimate.current];
  if (result.timeEstimate.peopleNote) items.push(result.timeEstimate.peopleNote);
  if (result.timeEstimate.reduction) items.push(result.timeEstimate.reduction);
  if (result.timeEstimate.recommendation) items.push(result.timeEstimate.recommendation);
  return renderListSection('時間の試算', items);
}

function renderListSection(title, items) {
  const safeItems = items.length ? items : ['（該当なし）'];
  return el('section', { className: 'result-section' }, [
    el('h3', { text: title }),
    el('ul', {}, safeItems.map((item) => el('li', { text: item }))),
  ]);
}

function renderCta() {
  return el('section', { className: 'result-section cta' }, [
    el('h3', { text: 'この診断結果を、そのまま見積もり依頼に使えます。' }),
    el('p', { text: '下のボタンでコピー、またはダウンロードして、依頼メッセージに貼り付けてください。ヒアリングが短くなり、正確なお見積もりが早く出せます。相談だけ、見積もりだけでも構いません。' }),
    el('p', { className: 'cta-main' }, [externalLink('ご相談はこちら（クラウドワークス）', 'https://crowdworks.jp/public/employees/6942778')]),
    el('p', { className: 'cta-sub' }, [
      externalLink('ココナラ', 'https://coconala.com/users/5986442'),
      document.createTextNode(' ／ '),
      externalLink('ママゴトラボについて', 'https://mamagotolab.com'),
    ]),
  ]);
}

function externalLink(text, href) {
  return el('a', { href, target: '_blank', rel: 'noopener', text });
}

function renderActions(result, report) {
  return el('div', { className: 'actions no-print' }, [
    el('button', { type: 'button', className: 'primary', onClick: () => downloadReport(result, report), text: '要件整理書をダウンロード（.md）' }),
    el('button', { type: 'button', onClick: () => copyReport(report), text: '内容をコピー' }),
    el('button', { type: 'button', onClick: () => window.print(), text: '印刷（PDF保存）' }),
    el('button', { type: 'button', onClick: () => { state.answers = { ...result.answers }; state.memo = result.memo ?? ''; setStep(2); }, text: '回答を修正して再診断' }),
    el('button', { type: 'button', onClick: resetDiagnosis, text: '新しく診断する' }),
  ]);
}

function downloadReport(result, report) {
  const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = el('a', { href: url, download: `jidoka-karte_${formatDateForFilename(result.date)}.md` });
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function copyReport(report) {
  try {
    await navigator.clipboard.writeText(report);
    state.copyNotice = '内容をコピーしました。';
  } catch {
    const textarea = el('textarea', { className: 'copy-fallback', readonly: true });
    textarea.value = report;
    document.body.append(textarea);
    textarea.select();
    state.copyNotice = '自動コピーできませんでした。選択された内容を手動でコピーしてください。';
  }
  render();
}

function resetDiagnosis() {
  state.memo = '';
  state.answers = {};
  state.result = null;
  state.storageNotice = '';
  setStep(0);
}

function renderStepHeader(step, title) {
  return el('header', { className: 'step-header' }, [
    el('p', { className: 'eyebrow', text: step }),
    el('h1', { text: title }),
    el('p', { className: 'privacy', text: '入力内容はブラウザの外に一切送信されません。' }),
  ]);
}

function renderNav(buttons) {
  return el('div', { className: 'nav-actions' }, buttons);
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('ja-JP', { dateStyle: 'medium', timeStyle: 'short' });
}

render();
