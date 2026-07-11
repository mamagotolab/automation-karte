const PREFIX = 'karte:record:';

function canUseLocalStorage() {
  try {
    const key = 'karte:storage-test';
    localStorage.setItem(key, '1');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function saveRecord(result) {
  if (!canUseLocalStorage()) {
    return { ok: false, message: 'localStorage が使えないため、履歴保存はスキップしました。' };
  }
  const id = result.id || createId();
  const record = { ...result, id };
  localStorage.setItem(`${PREFIX}${id}`, JSON.stringify(record));
  return { ok: true, record };
}

export function listRecords() {
  if (!canUseLocalStorage()) return [];
  const records = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(PREFIX)) continue;
    try {
      const record = JSON.parse(localStorage.getItem(key));
      records.push(record);
    } catch {
      // 壊れた履歴は一覧から除外します。
    }
  }
  return records.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function deleteRecord(id) {
  if (!canUseLocalStorage()) return;
  localStorage.removeItem(`${PREFIX}${id}`);
}
