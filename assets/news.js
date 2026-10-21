(function () {
  const root = document.querySelector('[data-news]');
  if (!root) return;
  const buttons = [...document.querySelectorAll('[data-news-filter]')];
  const cards = [...root.querySelectorAll('[data-news-type]')];
  const empty = document.querySelector('[data-news-empty]');
  const count = document.querySelector('[data-news-count]');
  const en = document.documentElement.lang === 'en';
  function show(type) {
    const selected = ['all', 'note', 'news', 'review'].includes(type) ? type : 'all';
    let visible = 0;
    for (const card of cards) {
      card.hidden = selected !== 'all' && card.dataset.newsType !== selected;
      if (!card.hidden) visible++;
    }
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.newsFilter === selected));
    if (empty) {
      empty.hidden = visible > 0;
      empty.textContent = cards.length ? (en ? 'No posts in this category yet.' : '这个分类暂时没有内容。') : (en ? 'The first post is being prepared.' : '第一篇动态正在整理中。');
    }
    if (count) count.textContent = en ? `${visible} posts` : `共 ${visible} 条动态`;
    const url = new URL(location.href);
    if (selected === 'all') url.searchParams.delete('type'); else url.searchParams.set('type', selected);
    history.replaceState(null, '', url);
  }
  buttons.forEach(button => button.addEventListener('click', () => show(button.dataset.newsFilter)));
  show(new URLSearchParams(location.search).get('type') || 'all');
})();
