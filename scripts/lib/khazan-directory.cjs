module.exports = function directory({en, locale, base, current, library, entries, missions, guide, bossPages, esc}) {
  const link = (title, href, pending = false) => pending
    ? `<span class="khazan-nav-pending">${esc(title)} · ${en ? 'In progress' : '待整理'}</span>`
    : `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${esc(title)}</a>`;
  const groups = library.map(section => {
    const id = 'khazan-menu-' + section.id;
    const title = section[locale].title;
    const heading = section.status === 'available' ? link(title, base + section.href) : esc(title);
    const items = section.id === 'walkthrough'
      ? missions.map((mission, index) => link(`${String(index + 1).padStart(2, '0')} · ${mission[locale].title}`, base + 'walkthrough/' + mission.slug + '/', mission.status !== 'published')).join('')
      : section.id === 'side-quests' && guide
        ? guide.side.map(task => link(task[locale].title, base + 'side-quests/' + task.id + '/')).join('')
      : section.id === 'collectibles' && guide
        ? link(en?'Golden story records':'金色剧情文书',base+'collectibles/ozma-records/') + guide.types.map(type => link(type[locale], base + 'collectibles/' + type.id + '/')).join('')
      : section.id === 'bosses' && guide
        ? link(en?'Side-mission bosses':'支线首领索引',base+'bosses/side/') + link(en?'Rewards and farming':'奖励与刷取说明',base+'bosses/drops/') + bossPages.map(boss => link(boss.title[locale], base + 'bosses/' + boss.id + '/')).join('')
      : section.id === 'achievements'
        ? link(en?'Achievement roadmap':'全成就路线',base+'achievements/roadmap/') + [['boss',en?'Story bosses':'剧情BOSS'],['side',en?'Side stories':'支线剧情'],['combat',en?'Combat and progression':'战斗与养成'],['collect',en?'Collecting':'探索收集'],['ending',en?'Endings and challenges':'结局与通关挑战']].map(([id,title])=>link(title,base+'achievements/'+id+'/')).join('')
      : section.status === 'available'
        ? entries.filter(entry => entry.category === section.id).map(entry => link(entry[locale].title, (entry.detailHref || entry.href) ? base + (entry.detailHref || entry.href) : section.id === 'characters' ? base + 'characters/' + entry.id + '/' : base + section.href + '#' + entry.id)).join('')
        : `<span class="khazan-nav-pending">${en ? 'Content in progress' : '内容整理中'}</span>`;
    return `<section class="classic-nav-group"><div class="classic-nav-group-heading"><h2>${heading}</h2><button class="classic-group-toggle" type="button" aria-expanded="true" aria-controls="${id}" aria-label="${en ? 'Collapse ' : '收起'}${esc(title)}">−</button></div><div class="classic-nav-group-items" id="${id}">${items}</div></section>`;
  }).join('');
  const controls = library.map(section => 'khazan-menu-' + section.id).join(' ');
  return `<aside class="classic-sidebar" data-pagefind-ignore="all"><a class="classic-brand" href="/">GAME NOTE CLASSIC</a><details open><summary>${en ? 'Guide index' : '攻略目录'}</summary><nav class="classic-nav" aria-label="${en ? 'Guide index' : '攻略目录'}"><div class="classic-nav-home">${link(en ? 'Guide home' : '专题首页', base)}<button class="classic-collapse-all" type="button" aria-expanded="true" aria-controls="${controls}">${en ? 'Collapse all' : '全部收起'}</button></div>${groups}<section class="classic-nav-group"><h2>${link(en ? 'Guide updates' : '攻略动态', base + 'updates/')}</h2></section></nav></details></aside>`;
};
