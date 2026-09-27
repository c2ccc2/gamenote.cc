# 导航与静态搜索

本站是根目录直接发布的 HTML/CSS/JS 静态站，没有 dist，没有 Markdown/MDX 框架。生产构建命令：

```
npm ci
npm run build
npm run lint
npm run typecheck
```

build 依次生成 Classic、英文页面、统一导航；npm 自动执行 postbuild，最后用 Pagefind 1.5.2 Extended 扫描最终公开 HTML。每次先清理专用 pagefind 生成目录，避免撤下的资料仍留在旧索引片段中。

## 部署

当前使用 GitHub Pages 分支目录部署。生成的 HTML 和整个 pagefind/ 必须一起提交、推送；不要把 pagefind/ 加入 gitignore，也不要只上传 HTML。_config.yml 明确包含 pagefind 并排除研究、源数据、脚本、node_modules。无需更改成后端部署或另外配置搜索服务。

CI 检查见 .github/workflows/static-check.yml，它构建并验证相同产物，但不替换当前分支部署，也不会自动提交文件。推送前需执行完整 build。上线后检查 /pagefind/pagefind.js、/pagefind/pagefind-entry.json 和 /search/?q=黯井微光；本地通过不代表尚未推送的线上文件已更新。

## 数据与导航

Updates 每条记录包含稳定 slug 和 relatedUrl；url 自动生成独立详情地址。scripts/build-updates.cjs 生成中英文详情，列表链接与详情中的相关栏目均新开。Notes 的 listed: false 表示从列表、相关文章和搜索撤下；保留旧详情地址并设置 noindex，避免已有链接失效。

assets/routes.js 是共用 URL / Breadcrumb / BreadcrumbList 实现。Notes 的 url 在统一 metadata 中由 slug 计算，列表、相关文章、Related Game 和分类入口通过 metadata 更新。scripts/build-navigation.cjs 将它们写入最终 HTML；首页没有 Breadcrumb。

索引只读取 HTML 中标记 data-pagefind-body 的正文。Header、Footer、Sidebar、相关链接不参与正文索引。research 实体不生成索引页面，draft-only 详情页没有正文索引标记；有独立已发布事实的条目可索引该公开事实，例如 Trinkets 的已核验数量。目录页仍可检索。404、旧地址兼容页和搜索页不索引。绝不将研究 JSON 作为搜索数据。

单个 zh-CN 索引包含已发布中英文页面，避免英文搜索页搜不到中文 Classic 专题；结果显示页面原有语言，不自动翻译。Pagefind 负责全文搜索，无 Fuse 或外部 API。元数据含 title、type、game、category。搜索页面读取 q 参数，回车/按钮提交，15 条分页加载；空词和无结果有明确提示。

可选浏览器验收脚本 scripts/test-search.cjs 使用 Playwright；通过 PLAYWRIGHT_MODULE 指定已有模块，CHROME_PATH 指定本机 Chrome。它测试中英文查询、Notes、URL 参数和 375/390/430 布局。typecheck 是本项目的 JSON schema/发布规则检查，不是 TypeScript 编译。
