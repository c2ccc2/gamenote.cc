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
      lastUpdated: '2026-10-13', featured: true, order: 3
    },
    {
      id: 'the-first-berserker-khazan', slug: 'the-first-berserker-khazan', title: 'The First Berserker: Khazan', titleZh: '第一狂战士：卡赞',
      cover: '/assets/catalog/the-first-berserker-khazan.jpg', status: 'Complete', completionLabel: { zh: '主体已完成', en: 'Core guide complete' }, type: 'directory',
      guideUrl: '/games/the-first-berserker-khazan/',
      description: '主体内容已完成：主支线流程、首领、装备与收集资料可查，支持收集进度保存；操作补图与数值实机核验持续完善。',
      platforms: ['PC', 'PlayStation 5', 'Xbox Series X|S'],
      genres: ['动作角色扮演', '类魂动作'],
      sections: ['Walkthrough', 'Bosses', 'Equipment', 'Collectibles', 'Systems'],
      lastUpdated: '2026-10-22', featured: true, order: 4
    },
    {
      id: 'astlibra-revision', slug: 'astlibra-revision', title: 'ASTLIBRA Revision', titleZh: '神之天平',
      cover: '/assets/catalog/astlibra-revision.jpg', status: 'in-progress', type: 'directory', theme: 'classic',
      guideUrl: '/games/astlibra-revision/',
      description: '按区域阅读主线与新章图文流程，查询地图宝箱、装备道具、嘉隆技能与系统资料。',
      platforms: ['PC', 'Nintendo Switch'], genres: ['动作角色扮演', '横版动作'],
      sections: ['Walkthrough', 'Maps', 'Equipment', 'KARON', 'Collectibles', 'Systems'],
      lastUpdated: '2026-10-20', featured: true, order: 5
    }
  ],
  notes: [
    {"slug": "adding-astlibra-revision-guide", "title": "把《神之天平》的漫长旅程，整理成随手可查的攻略", "description": "新增《神之天平》攻略专题：让主线推进、回访收集与系统查询，各自有清楚的入口。", "date": "2026-10-21", "updatedAt": "2026-10-21", "category": "behind-the-guide", "categoryLabel": "Behind the Guide / Site Note", "game": "astlibra-revision", "featured": true},
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
    {"slug": "well-dweller-content-refresh-2026-10-13", "date": "2026-10-13", "game": "an-jing-wei-guang", "type": "Site", "title": "《黯井微光》攻略资料补充与能力线索更新", "relatedUrl": "/games/an-jing-wei-guang/", "description": "补充后半程区域、首领、收集、任务与计时挑战的参考资料，并更新能力获取线索和通关后探索目录。", "details": [{"title": "区域与首领资料", "text": "补充 7 个后半程区域和 12 场首领遭遇的参考摘要、推进线索与来源。尚未实机核验的内容继续标明状态。", "url": "/games/an-jing-wei-guang/walkthrough/"}, {"title": "收集、任务与计时挑战", "text": "补充 9 类收集入口、3 个关键物品、6 条任务和 10 个计时挑战的参考资料，相关摘要同步到关键物品页面。", "url": "/games/an-jing-wei-guang/collectibles/"}, {"title": "能力与通关后探索", "text": "更新悬停、鱼雷、金门钥匙的获取线索，并整理通关后探索入口；具体房间、机关与全收集路线仍待进一步核验。", "url": "/games/an-jing-wei-guang/abilities/"}], "en": {"title": "Well Dweller: reference content and ability clues updated", "description": "Added references for later areas, bosses, collectibles, quests and time trials, with ability acquisition clues and a post-game exploration directory.", "details": [{"title": "Areas and bosses", "text": "Added reference summaries, route clues and sources for seven later areas and twelve boss encounters. Content without hands-on verification remains clearly labelled.", "url": "/games/an-jing-wei-guang/walkthrough/"}, {"title": "Collectibles, quests and time trials", "text": "Added references for nine collectible categories, three key items, six quests and ten time trials, with relevant summaries reflected on key-item pages.", "url": "/games/an-jing-wei-guang/collectibles/"}, {"title": "Abilities and post-game exploration", "text": "Updated clues for Hover, Torpedo and the Golden Gate Key, and organized post-game exploration links. Exact rooms, puzzles and full collectible routes still need further verification.", "url": "/games/an-jing-wei-guang/abilities/"}]}},
    {"slug": "gamenote-catalog-news-2026-10-13", "date": "2026-10-13", "game": null, "type": "Site", "title": "图鉴扩充、新作观察文章与浏览优化", "relatedUrl": "/catalog/", "description": "图鉴扩充至 41 款游戏，新增十款新作观察文章与本地视频配图，并优化平台显示和未发售作品排序。", "details": [{"title": "图鉴收录", "text": "补充视频清单中的九款新作，以及《尘埃异变》《恶魔城：灵魂魔典》《Aggelos》《神之天平》。Aggelos 两代建立系列关联，神之天平归入探索动作类型。", "url": "/catalog/"}, {"title": "新作观察文章", "text": "整理十款游戏的类型、玩法与 Steam 发售状态，加入十张本地视频截图和图鉴链接；统一保留文章来源，移除逐图的视频作者与时间说明。", "url": "/news/metroidvania-2026-video-watchlist/"}, {"title": "名称、平台与排列", "text": "核对官方中文名与发售状态；列表卡片新增平台信息。未发售作品放在各自类型末尾，有预计日期的按日期排序，无日期的按英文名排序；徽章样式仍在调整。", "url": "/catalog/"}, {"title": "攻略资料库", "text": "黯井微光补充参考资料；卡赞攻略形成 1.0 内容记录，并为前八章接入 24 张本地参考截图。当前为本地整理，尚未部署。", "url": "/games/the-first-berserker-khazan/updates/"}], "en": {"title": "Catalog additions, a new-game watchlist and browsing improvements", "description": "Expanded the catalog to 41 games, added a ten-game watchlist with local video images, and improved platform information and upcoming-game sorting.", "details": [{"title": "Catalog additions", "text": "Added nine games from the video list plus GRIME, Castlevania: Grimoire of Souls, Aggelos and ASTLIBRA Revision. Both Aggelos titles are linked as a series; ASTLIBRA is filed under Exploration Action.", "url": "/catalog/"}, {"title": "New-game watchlist", "text": "The ten-game article includes genres, gameplay and Steam release status, ten local video screenshots and catalog links. Sources are credited centrally; per-image creator and timestamp captions were removed.", "url": "/news/metroidvania-2026-video-watchlist/"}, {"title": "Names, platforms and sorting", "text": "Verified official Chinese names and release status, added platforms to cards, and placed upcoming titles last within each category: dated games first, then undated games alphabetically by English name. Badge styling is still being refined.", "url": "/catalog/"}, {"title": "Guide libraries", "text": "Well Dweller received additional references. Khazan has a guide version 1.0 record and 24 local reference images across its first eight chapters. These are local changes, not a deployment.", "url": "/games/the-first-berserker-khazan/updates/"}]}},
    {"slug": "khazan-guide-v1-2026-10-13", "date": "2026-10-13", "game": "the-first-berserker-khazan", "type": "Site", "version": "1.0", "title": "《卡赞》攻略 1.0：流程与资料库整理", "relatedUrl": "/games/the-first-berserker-khazan/", "description": "攻略 1.0 记录：16 章主线摘要、首领与资料栏目已整理，前八章加入 24 张本地参考截图，中英文同步。", "details": [{"title": "主线与资料栏目", "text": "整理 16 章主线流程摘要与首领要点，建立支线、装备、技能与系统、人物和收集资料栏目。本记录为本站攻略版本，不是游戏补丁版本。", "url": "/games/the-first-berserker-khazan/walkthrough/"}, {"title": "收集与阅读版式", "text": "鬼石提示逐项分行；统一使用“罐子精灵”名称并独立成节。目录支持展开、收起与页内跳转，详情沿用 Classic 图文版式。", "url": "/games/the-first-berserker-khazan/collectibles/"}, {"title": "本地配图", "text": "核对本地图片与原文分页对应关系，前八章各加入 3 张截图，共 24 张，保留水印与来源链接。后八章截图尚待补充，图片公开上线前仍需落实授权。", "url": "/games/the-first-berserker-khazan/walkthrough/banished-hero/"}, {"title": "版本范围", "text": "中英文页面同步，内容为参考资料整理与原创摘要，尚非完整实机全收集攻略；后续继续补充位置细节与图文步骤。"}], "en": {"title": "Khazan guide 1.0: walkthrough and library organization", "description": "Guide version 1.0 records sixteen main-mission summaries and reference sections, with 24 local screenshots across the first eight chapters in both languages.", "details": [{"title": "Walkthrough and reference library", "text": "Organized sixteen main-mission summaries and boss notes, plus side quests, equipment, skills and systems, characters and collectibles. This is the site guide version, not a game patch version.", "url": "/games/the-first-berserker-khazan/walkthrough/"}, {"title": "Collectibles and reading layout", "text": "Soulstone notes are listed individually. Jarling notes use a consistent name and their own section. Navigation supports expand, collapse and page anchors; detail pages retain the Classic illustrated layout.", "url": "/games/the-first-berserker-khazan/collectibles/"}, {"title": "Local reference images", "text": "Verified local images against source pages and added three images to each of the first eight chapters, 24 in total, retaining marks and source links. Later chapter images remain pending; permission still needs to be finalized before public deployment.", "url": "/games/the-first-berserker-khazan/walkthrough/banished-hero/"}, {"title": "Version scope", "text": "Chinese and English pages are synchronized. The content consists of reference-based, newly written summaries, not a fully hands-on verified collectible walkthrough. Location details and illustrated steps will continue to be expanded."}]}},
    { slug: 'well-dweller-guide-reading-update', date: '2026-09-27', game: 'an-jing-wei-guang', title: '《黯井微光》攻略结构与阅读体验更新', type: 'Site', relatedUrl: '/games/an-jing-wei-guang/', description: '区域图文流程、中英文页面与栏目导航完成一轮整理，系统说明独立补充，阅读体验同步优化。', details: [
      { title: '区域流程与地图分工', text: '将探索步骤、拾取和战斗记录统一到对应区域的流程攻略，地图页保留地图参考及流程入口；既有正文和截图保留。', url: '/games/an-jing-wei-guang/walkthrough/' },
      { title: '中英文与目录导航', text: '专题页面可切换到同一章节的中文或英文版本；栏目名称进入总目录，右侧按钮独立展开或收起子项，桌面端也可收起整个目录。', url: '/games/an-jing-wei-guang/' },
      { title: '图文阅读体验', text: '正文移除录像时间与编辑过程说明，截图支持弹窗查看，并保留新开图片的方式和作者署名。', url: '/games/an-jing-wei-guang/walkthrough/night-garden/' },
      { title: '能力分类与系统说明', text: '能力目录分为移动 / 核心能力、推进 / 功能解锁。系统说明独立介绍存档、油瓶、饰物升级、地图标记和商店，不再重复能力列表。', url: '/games/an-jing-wei-guang/systems/' }
    ] },
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
