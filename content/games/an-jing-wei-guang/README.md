# Well Dweller Classic V1 内容维护

data.json 是清单；实体分为 game.json、areas.json、bosses.json、abilities.json、collectibles.json、keyItems.json、quests.json、achievements.json、challenges.json。不要直接编辑生成 HTML。

## 发布规则

每条实体包含 id、slug、nameEn、nameZh、description、confidence、verificationStatus、publishStatus、sources、notes、updatedAt、videoSources、images、fields。
confidence：A 官方或游戏内，B 多可靠来源，C 单来源，D 冲突。
verificationStatus：unverified / source-confirmed / video-confirmed / ingame-confirmed。
publishStatus：research 不进入公开目录；draft 生成简短整理中页面；published 必须具备 A/B 已核验证据。
fields 每个字段包含 value 和独立的上述证据、来源、发布状态。公开名称不等于位置、奖励、数量、打法均可公开。
sources 包含 name、url、type、accessedAt；没有原视频链接时保持 null，不伪造网址。规则校验在 scripts/lib/classic-data.cjs。

## V2 视频核验

按区域更新 areas，打法更新 bosses，能力、收集、任务进入各自 JSON。地图关联 areas。流程正文放 fields.guide.value，支持 paragraph、heading、notice、image；正文也需独立发布证据。
videoSources 包含 platform、url、videoId、timestampStart、timestampEnd（HH:MM:SS）、notes、verifiedItems。记录实际观看核验的片段，不从标题推断内容。
P1 旧草稿和截图保存在 _research/an-jing-wei-guang/，目前不公开。
images 记录 type、src、caption、source、timestamp、verified、publishStatus。非官方图片另需 publicationApproved: true 才生成。核验内容不等于取得第三方截图发布许可。

## 构建与关联

运行 node scripts/build-classic.cjs、node scripts/build-locales.cjs、node scripts/verify-classic.cjs。
主站统一 metadata、更新、手记在 assets/content.js，英文覆盖在 assets/content.en.js；关联 ID 为 an-jing-wei-guang。首页与 Games 自动读取，布局不变。
GitHub Pages 的 _config.yml 排除 _research、content、scripts。robots 仅是索引提示，不是访问控制。公开 Git 仓库仍可能暴露这些文件，不应存秘密。不要添加绕过 Jekyll 排除规则的 .nojekyll。
