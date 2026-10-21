/* Keyword and category filters for chest locations. */
(() => {
  document.querySelectorAll('[data-astlibra-lookup]').forEach(form => {
    const scope = form.closest('[data-astlibra-lookup-scope]');
    const search = form.querySelector('[data-lookup-search]');
    const phase = form.querySelector('[data-lookup-phase]');
    const rows = [...scope.querySelectorAll('[data-lookup-row]')];
    const status = scope.querySelector('[data-lookup-status]');
    const apply = () => {
      const query = search.value.trim().toLocaleLowerCase();
      rows.forEach(row => {
        row.hidden = !row.dataset.lookupText.toLocaleLowerCase().includes(query) || (phase && phase.value !== 'all' && row.dataset.lookupPhase !== phase.value);
      });
      status.textContent = `显示 ${rows.filter(row => !row.hidden).length} / ${rows.length} 条记录。`;
    };
    form.addEventListener('submit', event => { event.preventDefault(); apply(); });
    form.addEventListener('reset', event => { event.preventDefault(); search.value = ''; if (phase) phase.value = 'all'; apply(); });
    search.addEventListener('input', apply);
    phase?.addEventListener('change', apply);
    apply();
  });
  const form = document.querySelector('[data-astlibra-filter]');
  if (form) {
    const search = form.querySelector('[data-astlibra-search]');
    const kind = form.querySelector('[data-astlibra-kind]');
    const rows = [...document.querySelectorAll('[data-astlibra-row]')];
    const status = document.querySelector('[data-astlibra-filter-status]');
    const filter = () => {
      const query = search.value.trim().toLocaleLowerCase();
      rows.forEach(row => {
        row.hidden = !(kind.value === 'all' || row.dataset.kind === kind.value) || !row.dataset.search.toLocaleLowerCase().includes(query);
      });
      status.textContent = `显示 ${rows.filter(row => !row.hidden).length} / ${rows.length} 条宝箱位置。`;
    };
    form.addEventListener('submit', event => { event.preventDefault(); filter(); });
    search.addEventListener('input', filter);
    kind.addEventListener('change', filter);
    form.addEventListener('reset', event => { event.preventDefault(); search.value = ''; kind.value = 'all'; filter(); });
    filter();
  }
})();
