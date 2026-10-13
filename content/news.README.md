# 动态内容

在 `news.json` 中按下面的格式加入条目，运行 `npm run build` 后生成中英文列表和详情页。

```json
{
  "slug": "example-slug",
  "type": "note",
  "date": "2026-10-13",
  "game": "bloodstained-ritual-of-the-night",
  "zh": {
    "title": "标题",
    "summary": "列表摘要",
    "body": ["正文第一段", "正文第二段"]
  },
  "en": {
    "title": "Title",
    "summary": "List summary",
    "body": ["First paragraph", "Second paragraph"]
  }
}
```

- `type` 为 `note`（随记）或 `news`（资讯）。
- `game` 为可选的图鉴 slug，必须存在于 `content/catalog/games.json`。
- 资讯必须另外提供 `source: { "label": "来源名称", "url": "https://..." }`，指向原始报道或官方公告。
- 两种语言的正文都必须提供；未准备好双语内容时先不要发布。
- `slug` 发布后应保持不变，以免旧链接失效。

游戏清单文章可添加 `recommendations`：每项包含已有图鉴的 `slug`、名称、官方 `source`、原视频节点 `seconds/time`、本地截图 `image` 与截取时间 `imageSeconds/imageTime`。`zh/en` 分别提供 `type`、`play`、`appeal`、`status`；页面生成目录、配图与图鉴链接。截图出处与提取记录保留在研究目录。
