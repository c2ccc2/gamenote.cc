# 主站双语

中文保持原路径；英文为 /en/ 下的相同路径。首页、Games、Notes、Updates、About、Search 和四篇手记支持双语。游戏攻略正文和旧隐私页面保持中文，英文入口明确标注 Chinese，不伪造翻译地址。

英文静态文案与手记正文在 en.json；动态列表译文在 assets/content.en.js，使用稳定游戏 ID、手记 slug 与更新标题关联。暂未翻译的手记和更新不显示在英文列表，避免混排。

修改中文页面或英文译文后运行 node scripts/build-locales.cjs，提交生成的 en/ 页面及双向 hreflang、canonical、Open Graph、sitemap 改动。无需部署 Node 服务。共享导航根据 html lang 选择语言，切换保留当前页面和查询参数。

中文游戏名的拼音 An Jing Wei Guang 暂作英文入口名称，不声称它是官方英文名。Classic 内容生成仍独立，未修改游戏专题结构。
