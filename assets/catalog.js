(() => {
  const query = document.querySelector('#catalog-query');
  if (!query) return;
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const sortButtons = [...document.querySelectorAll('[data-sort]')];
  const cards = [...document.querySelectorAll('.catalog-card')];
  const groups = [...document.querySelectorAll('.catalog-group')];
  const originalGrid = new Map(cards.map(card => [card, card.parentElement]));
  const count = document.querySelector('#catalog-count');
  const empty = document.querySelector('#catalog-empty');
  let filter = 'all';
  function sortView(mode) {
    for (const group of groups) {
      const grouped = group.querySelector('.catalog-grouped');
      const latest = group.querySelector('.catalog-latest');
      const groupCards = cards.filter(card => card.dataset.category === group.dataset.group);
      if (mode === 'newest') {
        groupCards.sort((a, b) => Number(b.dataset.year) - Number(a.dataset.year) || a.textContent.localeCompare(b.textContent, 'zh'));
        groupCards.forEach(card => latest.append(card));
        grouped.hidden = true;
        latest.hidden = false;
      } else {
        cards.filter(card => card.dataset.category === group.dataset.group).forEach(card => originalGrid.get(card).append(card));
        latest.hidden = true;
        grouped.hidden = false;
      }
    }
    update();
  }
  function update() {
    const term = query.value.trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const show = (filter === 'all' || card.dataset.category === filter) && (!term || card.dataset.search.includes(term));
      card.hidden = !show;
      if (show) visible++;
    }
    document.querySelectorAll('.catalog-shelf').forEach(shelf => { shelf.hidden = !shelf.querySelector('.catalog-card:not([hidden])'); });
    for (const group of groups) group.hidden = !group.querySelector('.catalog-card:not([hidden])');
    count.textContent = document.documentElement.lang === 'en' ? `Found ${visible} games` : `找到 ${visible} 款游戏`;
    empty.hidden = visible !== 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.filter;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    update();
  }));
  sortButtons.forEach(button => button.addEventListener('click', () => {
    sortButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    sortView(button.dataset.sort);
  }));
  query.addEventListener('input', update);
})();
