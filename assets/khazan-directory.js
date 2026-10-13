/* Keep category and entry destinations visible in the Khazan directory. */
(() => {
  const nav = document.querySelector('.khazan-classic-shell .classic-nav');
  if (!nav) return;
  const update = () => {
    nav.querySelectorAll('a').forEach(link => {
      const target = new URL(link.href);
      link.removeAttribute('aria-current');
      if (target.pathname === location.pathname && target.hash === location.hash) {
        link.setAttribute('aria-current', target.hash ? 'location' : 'page');
      }
    });
  };
  window.addEventListener('hashchange', update);
  update();
})();
