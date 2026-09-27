window.GAMENOTE_CONTENT = {
  games: [
    {
      id: 'islets', slug: 'islets', title: 'Islets', titleZh: 'Islets',
      cover: '/assets/islets-cover.avif', status: 'Complete', type: 'subdomain',
      guideUrl: 'https://islets.gamenote.cc/',
      description: '驾驶飞艇穿梭于破碎岛屿，寻找磁力核心并重新连接世界。',
      platforms: ['PC', 'Switch', 'PlayStation', 'Xbox'],
      genres: ['动作冒险', '类银河恶魔城'],
      sections: ['Walkthrough', 'Maps', 'Bosses', 'Abilities', 'Collectibles'],
      lastUpdated: '2026-09-26', featured: true, order: 1
    },
    {
      id: 'ender-lilies', slug: 'ender-lilies', title: 'ENDER LILIES', titleZh: '终焉之莉莉：骑士寂夜',
      cover: '/assets/ender-lilies-cover.png', status: 'Complete', type: 'subdomain',
      guideUrl: 'https://ender-lilies.gamenote.cc/',
      description: '在死亡之雨笼罩的边陲之国探索、净化污秽灵魂。',
      platforms: ['PC', 'Switch', 'PlayStation', 'Xbox'],
      genres: ['动作角色扮演', '类银河恶魔城'],
      sections: ['Walkthrough', 'Maps', 'Bosses', 'Spirits', 'Relics'],
      lastUpdated: '2026-09-26', featured: true, order: 2
    },
    {
      id: 'an-jing-wei-guang', slug: 'an-jing-wei-guang', title: 'Well Dweller', titleZh: '黯井微光',
      cover: '/games/an-jing-wei-guang/images/official/steam-header.jpg', status: 'in-progress', type: 'directory', theme: 'classic', guideUrl: '/games/an-jing-wei-guang/',
      description: '攻略资料整理中：区域、Boss、能力、收集、任务和成就目录已建立，详细内容持续核验。',
      platforms: ['PC'],
      genres: ['动作冒险', '类银河恶魔城'],
      sections: ['Walkthrough', 'Maps', 'Bosses', 'Abilities', 'Collectibles', 'Systems'],
      lastUpdated: '2026-09-27', featured: true, order: 3
    }
  ],
  notes: [
    {
      slug: 'why-organize-game-guides-again', title: '为什么还要重新整理一份游戏攻略',
      description: '能找到答案，和能顺利找到现在需要的答案，其实是两件不同的事情。',
      date: '2026-09-26', updatedAt: '2026-09-26', category: 'behind-the-guide', categoryLabel: 'Behind the Guide', game: null, featured: true
    },
    {
      slug: 'why-an-jing-wei-guang-looks-like-an-old-guide-site', title: '为什么《黯井微光》攻略看起来像二十年前的网站',
      description: '外观保留传统攻略站的阅读方式，底层仍然是一套现代网站。',
      date: '2026-09-26', updatedAt: '2026-09-26', category: 'behind-the-guide', categoryLabel: 'Behind the Guide / Site Note', game: 'an-jing-wei-guang', featured: true
    },
    {
      slug: 'mapping-a-metroidvania', listed: false, title: '我是怎么整理一张银河恶魔城地图的',
      description: '从玩家真正需要辨认的地标、能力门槛与回访节点出发，而不是把地图做成一张漂亮却难用的图片。',
      date: '2026-09-26', category: 'map-making', categoryLabel: 'MAP MAKING', game: 'islets', featured: true
    },
    {
      slug: 'after-islets', listed: false, title: '做完 Islets 攻略以后，我发现真正难整理的不是 Boss',
      description: '一份完整攻略最难写的部分，是把玩家在不同进度下的“我现在该去哪”变成清楚的路径。',
      date: '2026-09-24', category: 'behind-the-guide', categoryLabel: 'BEHIND THE GUIDE', game: 'islets', featured: true
    }
  ],
  updates: [
    { slug: 'well-dweller-v1-database', date: '2026-09-27', game: 'an-jing-wei-guang', title: '《黯井微光》第一版资料库建立', type: 'Site', relatedUrl: '/games/an-jing-wei-guang/', description: '已建立区域、Boss、能力、收集、任务和成就资料框架，详细攻略将继续通过视频与实机核验补充。' },
    { slug: 'well-dweller-guide-scaffolding', date: '2026-09-26', game: 'an-jing-wei-guang', title: '章节、Boss 与地图页面骨架建立', type: 'Site', relatedUrl: '/games/an-jing-wei-guang/walkthrough/', description: '建立五个章节、四个 Boss 与地图详情模板，正文待实测。' },
    { slug: 'classic-content-generation', date: '2026-09-26', game: 'an-jing-wei-guang', title: 'Classic 内容数据与静态生成机制建立', type: 'Site', relatedUrl: '/games/an-jing-wei-guang/updates/', description: '统一目录、分页与图文组件，保留经典专题阅读布局。' },
    { slug: 'classic-framework', date: '2026-09-26', game: 'an-jing-wei-guang', title: 'GAME NOTE CLASSIC 专题框架建立', type: 'Site', relatedUrl: '/games/an-jing-wei-guang/updates/', description: '建立专题目录与图文攻略栏目；游戏内容待实测补充。' },
    { slug: 'islets-boss-notes', date: '2026-09-26', game: 'islets', title: '补充 Boss 战斗说明与主站入口', type: 'Boss', relatedUrl: 'https://islets.gamenote.cc/boss-list.html', description: '补足首领攻略中的战斗节奏与相关入口。' },
    { slug: 'ender-lilies-pages-deployment', date: '2026-09-26', game: 'ender-lilies', title: '主站链接与 Pages 部署完成', type: 'Site', relatedUrl: 'https://ender-lilies.gamenote.cc/', description: '完成跨站入口与部署校验。' },
    { slug: 'gamenote-archive-structure', date: '2026-09-26', game: null, title: 'GAME NOTE 信息架构开始升级', type: 'Site', relatedUrl: '/updates/', description: '建立 Game Archive、Notes 与更新记录。' }
  ]
};
window.GAMENOTE_CONTENT.notes.forEach(note => { note.url = window.GAMENOTE_ROUTES.noteUrl(note.slug); });
window.GAMENOTE_CONTENT.updates.forEach(update => {
  update.url = window.GAMENOTE_ROUTES.updateUrl(update.slug);
});
