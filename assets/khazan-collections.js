(() => {
  const form = document.querySelector('[data-collection-filter]');
  const results = document.querySelector('[data-collection-results]');
  if (!form || !results) return;
  const search = form.querySelector('[data-collection-search]');
  const kind = form.querySelector('[data-collection-kind]');
  const progress = form.querySelector('[data-collection-progress]');
  const status = document.querySelector('[data-collection-status]');
  const saveStatus = document.querySelector('[data-collection-save-status]');
  const groups = [...results.querySelectorAll('[data-collection-group]')];
  const checks = [...results.querySelectorAll('[data-collection-check]')];
  const key = 'gamenote.khazan.collections.v1';
  const knownIds = new Set(form.dataset.collectionIds.split(' '));
  const exportButton = document.querySelector('[data-collection-export]');
  const importInput = document.querySelector('[data-collection-import]');
  const backupStatus = document.querySelector('[data-collection-backup-status]');
  const en = results.dataset.locale === 'en';
  let completed = {}, saved = true;
  function read() {
    try {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      return data && typeof data === 'object' && !Array.isArray(data) ? Object.fromEntries(Object.entries(data).filter(([id, value]) => knownIds.has(id) && typeof value === 'boolean')) : {};
    } catch { saved = false; return {}; }
  }
  completed = read();
  const params = new URLSearchParams(location.search);
  search.value = params.get('q') || '';
  if (['main', 'side'].includes(params.get('kind'))) kind.value = params.get('kind');
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const group of groups) {
      let visible = 0;
      for (const row of group.querySelectorAll('[data-collection-item]')) {
        const check = row.querySelector('[data-collection-check]');
        const done = completed[check.dataset.collectionCheck] === true;
        check.checked = done;
        row.classList.toggle('is-collected', done);
        const matchProgress = progress.value === 'all' || (progress.value === 'completed' ? done : !done);
        const text = (group.dataset.taskName + ' ' + row.dataset.search).toLocaleLowerCase();
        row.hidden = !(kind.value === 'all' || row.dataset.kind === kind.value) || !text.includes(query) || !matchProgress;
        if (!row.hidden) { visible++; count++; }
      }
      group.hidden = visible === 0;
    }
    const done = checks.filter(c => c.checked).length;
    status.textContent = en ? `${done} / ${checks.length} collected · ${checks.length - done} remaining · ${count} shown` : `已收集 ${done} / ${checks.length} · 剩余 ${checks.length - done} · 当前显示 ${count} 个位置`;
    saveStatus.textContent = saved ? (en ? 'Progress is saved in this browser and shared between languages. Export a backup before clearing browser data or changing devices.' : '进度保存在当前浏览器，中英文共用。清除浏览器数据或更换设备前，请导出备份。') : (en ? 'Browser storage is unavailable. Changes in this page are temporary.' : '浏览器存储不可用，本页勾选暂时有效，刷新后可能丢失。');
  }
  function persist() {
    try { localStorage.setItem(key, JSON.stringify(completed)); saved = true; }
    catch { saved = false; }
  }
  exportButton.addEventListener('click', () => {
    const state = { ...completed, ...read() };
    const data = { game: 'the-first-berserker-khazan', version: 1, completed: Object.keys(state).filter(id => knownIds.has(id) && state[id] === true) };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'khazan-collection-progress.json';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    backupStatus.textContent = en ? 'Backup download requested. Keep the JSON file to restore on another browser.' : '已发起备份下载，保留 JSON 文件即可在其他浏览器导入。';
  });
  importInput.addEventListener('change', async () => {
    const file = importInput.files?.[0];
    if (!file) return;
    try {
      if (file.size > 131072) throw Error('size');
      const data = JSON.parse(await file.text());
      if (!data || data.game !== 'the-first-berserker-khazan' || data.version !== 1 || !Array.isArray(data.completed) || data.completed.length > knownIds.size || data.completed.some(id => typeof id !== 'string' || !knownIds.has(id))) throw Error('format');
      completed = { ...completed, ...read() };
      let added = 0;
      for (const id of new Set(data.completed)) { if (completed[id] !== true) added++; completed[id] = true; }
      persist(); filter();
      backupStatus.textContent = en ? `Added ${added} completed items.${saved ? '' : ' Browser storage is unavailable; export a backup before leaving.'}` : `新增 ${added} 个已收集项。${saved ? '' : '浏览器存储不可用，离开前请导出备份。'}`;
    } catch {
      backupStatus.textContent = en ? 'Invalid backup. Choose a Khazan progress JSON exported by this site (up to 128 KB). Existing progress was preserved.' : '备份无效，请选择本站导出的卡赞进度 JSON（不超过 128 KB）。现有进度未修改。';
    } finally { importInput.value = ''; }
  });
  for (const check of checks) check.addEventListener('change', () => {
    // Merge the latest stored state so another category or language tab is preserved.
    const latest = read();
    completed = { ...completed, ...latest, [check.dataset.collectionCheck]: check.checked };
    persist();
    filter();
  });
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) { completed = read(); filter(); }
  });
  form.addEventListener('submit', event => event.preventDefault());
  search.addEventListener('input', filter);
  kind.addEventListener('change', filter);
  progress.addEventListener('change', filter);
  form.addEventListener('reset', () => requestAnimationFrame(filter));
  filter();
})();
