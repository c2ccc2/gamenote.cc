# Well Dweller：证据驱动发布（schemaVersion 2）

## 连续图文正文（2026-09-27 恢复）

`walkthroughs.json` 保留 P1 阅读入口及历史正文，原地址 `/walkthrough/chapter-01/` 不重复展示正文。P1 起点与末段下行放在 The Well；其余探索、园丁及明确标注的小屋后续段落放在夜之庭园。全部六张已许可截图保留在这两个区域页，区域正文写入 `areas.json` 的 `fields.guide.value`。每个正文块单独携带 publish、verificationStatus、sources 和 videoSources。模板逐块核验，未确认段落不影响其余正文。图片正文支持左右混排，复用已有许可图片，不重复生成图库。

原始 P1 稿保留在 `_research/an-jing-wei-guang/p1-draft.json`，不会被构建覆盖。恢复稿依据原稿及 `p1-evidence.md`，不新增未核验的打法、奖励或 P2–P7 路线。回归测试保护两个主阅读页的八个流程小节、六张截图及搜索收录，防止再次被旧地址提示页覆盖。

本规则替代 V1 的整页 research / draft / published 门槛。确认一条，发布一条；不确定的不写，已经确认的不藏。

## 独立的两个维度

verificationStatus：unverified / source-confirmed / video-confirmed / ingame-confirmed / official-confirmed。
contentStatus：empty / partial / guide-ready / complete，表示攻略完整度，不表示证据等级。
publish：是否允许正式公开；部分可靠事实就足够，完全不需要整篇攻略完成。

每个 fields 条目独立保存 value、confidence、verificationStatus、publish、sources、notes、updatedAt、videoSources。
明确视频、游戏内或官方证据允许 C 级单一直接观察事实发布；来源交叉确认使用 source-confirmed A/B。D 冲突资料不作为已确认事实公开。
旧 publishStatus 保留作迁移历史，不再决定前台显示。既有 V1 候选名称目录继续保留，未确认字段不自动晋级。

## 发布与模板

publish=true 且存在有意义的已确认字段，页面可以公开及进入搜索；名称、区域、获得节点等独立决定各自显示。不可靠、publish=false、null、空字符串和空数组不生成正文 section。
publish=false 的条目可保留轻量名称目录/兼容地址，但不展示研究正文、不索引。不要生成大面积待补充行。
guide-ready / complete 由编辑复核后设置，不能由官方名称存在自动推导。
完整 Banner 只在专题首页。目录表格中的名称直接链接详情，不再叠加重复链接列表。

## 内容位置

data.json 是清单。游戏、区域、Boss、能力、收集、关键物品、任务、成就、挑战分别维护在 game.json、areas.json、bosses.json、abilities.json、collectibles.json、keyItems.json、quests.json、achievements.json、challenges.json。

区域可逐字段补 overview、previousAreas、nextAreas、bosses、abilities、npcs、collectibles、importantLocations、routeNotes、relatedGuides。
Boss 可补 area、encounterOrder、location、attacks / attackPatterns、strategy、reward、afterBattle、relatedGuides。
能力可补 type、area、obtainedAt、requirements、function、unlocks、relatedAreas、relatedCollectibles。
收集可补 category、area、location、requirements、abilityRequired、relatedGuide。
任务可补 startNpc、steps、reward、prerequisite。
成就 description 为官方条件，详细路线不必同时完成。
关联值使用实体 ID；正文放 fields.guide.value，支持 paragraph、heading、notice、image。图片独立校验，不随整段正文自动放行。

## 按区域补充的录像图文

世界地图第一版由 world-map.json 和 scripts/lib/classic-world-map.cjs 原创生成中英文 SVG，包含 16 个区域；坐标只是编辑排布，不是游戏地图坐标。只将已确认 nextAreas 画为流程衔接，不伪装成实际门或通道。各区域视图按相同坐标裁切当前节点及已确认关联节点，未知连接留空。

regional-map-notes.json 为 9 个区域补充地图定位表和英文译文。沼泽、墓谷、码头有可核对的游戏内局部地图；井底、排水道、荒堡、深渊等可使用已批准的场景图定位，但不会把场景截图称为地图。页面优先展示局部地图与地标资料，结构示意默认折叠。其余区域在目录中明确列为后续区域，第一版不是完整房间级地图，也不是全收集地图。

P2–P7 的历史字段 fields.mapGuide.value 保留原始资料和证据，现与 fields.guide.value 一起在 /walkthrough/[slug]/ 渲染。地图页只展示地图参考画面与流程入口，不再重复探索步骤、拾取和战斗正文。不要删除已有字段、段落或截图。
mapGuide 与 guide 使用相同的逐段证据规则，类型为 heading、paragraph、notice、image；每段保留作者来源、原始录像文件名和精确截图时间。
本轮人工核对清单为 _research/an-jing-wei-guang/p2-map-notes.json 至 p7-map-notes.json。更新应先核对原始画面，再追加到区域记录；不要按视频分集创建页面。
公开截图位于 games/an-jing-wei-guang/images/p2/ 至 p7/。这些文件夹是素材组织，不是 P2/P3 页面。

## 视频事实与图片

videoSources 包含 platform、url、videoId、localFile、timestampStart / timestampEnd（HH:MM:SS）、notes、verifiedItems；可放在实体和具体字段中。没有原视频 URL 时保持 null，作者主页不冒充原视频页面。
images 包含 src、type、source、platform、videoId、timestamp、caption、verificationStatus、confidence、publish、publicationApproved、rightsBasis、宽高。
已确认且有合法转载依据的非官方图片可以正式展示。此次用户确认所提供视频与内容允许免授权转载，已记录在 rightsBasis；公开截图保留作者水印、署名和时间点。未核对图仍留内部。
_research 只保留原始笔记、时间轴、未核对截图、疑点和冲突，不是已确认事实的唯一存放处。

## 构建

build-analytics.cjs 在页面生成和导航处理之后给全部公开 HTML 注入主站共用 GTM-W5W5PT67（包含 Classic 中英文及 404）。每页只有一个 bootstrap 和 noscript fallback，移除 site.js 的旧加载器；重复构建不会叠加标签。verify-analytics.cjs 校验覆盖与单次初始化。仓库只确认 GTM 接入，GA 标签配置、发布和实际接收仍需在 GTM / GA 后台验证。

npm run build（静态页面、英文、导航、Pagefind），npm run lint（语法与全站链接），npm run typecheck（资料/schema/发布回归，不是 TypeScript 编译）。
规则在 scripts/lib/classic-data.cjs；模板在 scripts/build-classic.cjs；搜索与页面共用 canPublish 判断。
主站 metadata、更新、Notes 关联仍在 assets/content.js，英文覆盖在 assets/content.en.js。不要修改主站布局。
GitHub Pages 排除 _research、content、scripts；公开 Git 仓库不等于私人存储。

## 中英文与图片查看

系统说明读取 systems-reference.json，独立介绍帐篷、油瓶、饰物升级、地图和商店，不再复用能力目录。各段保留参考链接与英文译文；游戏简介、Steam 入口和基础资料仍保留。更新历史在 assets/content.js / content.en.js，新增 details 分节可关联对应栏目，并在详情中以新窗口打开。

reader-copy.json 提供面向读者的中英图文措辞，替代正文中的录像时间叙述；模板使用 classic-reader-copy.cjs 处理。截图图注仅显示画面说明与作者署名，不显示录像文件名或时间点。原资料、时间戳和证据字段保留在数据层，未删除路线事实或截图。

能力补充资料在 ability-reference.json：移动 / 核心能力 7 项，推进 / 功能解锁 5 项。后者复用 keyItems 的金门钥匙和女王硬币，不重复创建实体。字段分别标记作用来源与获取来源；读取时作为独立 referenceEffect / referenceAcquisition 字段参与原有验证与发布，不覆盖原字段或录像。每项提供英文译文，目录和详情使用相同数据。未明确的获取地点不列为已确认事实。

本轮来源差异：Gamer Guides 流程链接无法读取；金门钥匙小屋的区域存在“秋日森林 / 码头”差异，暂不写死。女王硬币仅补作用，精确获取地点待复核。Hover 与鱼雷的精确位置也未写死。网页核对属于 source-confirmed（B），不标为官方或实机核验。

中文专题与英文 /en/games/an-jing-wei-guang/ 成对生成，每页切换到同一路径的另一语言。翻译由 scripts/build-classic-locales.cjs 读取 ui-en.json、details-en.json、p1-en.json、video-en.json；新增正文需同步补英文，遗漏清单输出到 _research/an-jing-wei-guang/english-pending.json。labels-zh.json 是中文导航的编辑标签，不代表已核验官方译名；成就继续使用官方中英文名称与条件。Pagefind 分别索引中文和英文。

全站正文截图使用 assets/image-viewer.js / .css 的原生 dialog；支持关闭按钮、Esc、焦点恢复。禁用脚本或按住 Ctrl / Cmd 点击仍可新开图片。主站封面等导航链接保留原用途。
