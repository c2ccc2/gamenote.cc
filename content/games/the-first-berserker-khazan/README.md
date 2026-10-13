# 卡赞流程攻略内容维护

`missions.json` 是主线目录与章节正文的数据源。运行 `node scripts/build-khazan.cjs` 会生成中文和英文攻略首页、任务目录，以及所有 `status: "published"` 的章节页。

`library.json` 定义攻略资料库栏目与显示状态；`entries.json` 存放起始资料卡。资料卡需要中英文标题、简介和来源链接。已有条目的栏目会生成中英文目录页；没有核验内容的栏目显示为“待整理”，不会生成空白详情页。
`entry-details.json` 存放每张资料卡在栏目页展示的中英文事实要点。新增 `entries.json` 条目时须同步添加两种语言的要点，构建器会检查。

- 新章节先设为 `planned`，核验并写完中英文 `summary`、`lead`、`sections` 后改为 `published`。
- 正文段落可使用 `steps`、`bullets`、`paragraphs`；每节提供 `heading` 和非空的 `items`。
- 已发布章节还需提供 `atGlance`，每项包含 `label`、`value`。页面自动生成速览卡和段落跳转。
- 图片使用 `image` 节，提供 `heading`、`src`、`alt`，可选 `caption`。文件放在 `/games/the-first-berserker-khazan/images/`，构建器会检查图片存在及替代文字。中英文可分别指定对应的本地图片。
- 现有首章是原创路线速览，收集位置和未完成章节需要实机核验。引用资料时记录来源；未经许可，不复制第三方攻略正文或截图。

全站构建命令为 `npm run build`，单独验证攻略可运行 `node scripts/build-khazan.cjs` 和 `npm run lint`。

内容分层、核验清单和首章范围见 [CONTENT-DESIGN.md](CONTENT-DESIGN.md)。
