# Jack's Blog

> My Own Swordsman — <https://blog.emmmm.dev>

文章写在本仓库的 [Issues](https://github.com/chen86860/blog/issues) 里，站点用
[TanStack Start](https://tanstack.com/start) 渲染，跑在 Cloudflare Workers 上。

## 工作方式

```
开 issue 写文章
      ↓
Worker SSR 时调 GitHub REST API 拉 issues
  （full+json 媒体类型，一次拿到 body / body_text / body_html）
      ↓
GitHub 已经渲染好的 HTML 直接输出，边缘缓存 5 分钟
```

没有构建步骤参与内容：**发一条 issue，最迟 5 分钟后自动出现在站点上**，不需要
重新部署。GitHub 侧已完成 Markdown 渲染与 HTML 消毒，所以 Worker 里不打包任何
markdown 依赖。

## 开发

```bash
pnpm install
pnpm dev        # http://localhost:3000
```

本地不配 token 也能跑（GitHub 未认证接口允许每 IP 每小时 60 次）。要用 token
就写进 `.dev.vars`，格式见 `.dev.vars.example`。

```bash
pnpm build      # 产物在 dist/
pnpm preview    # 用 workerd 跑构建产物
pnpm typecheck
pnpm deploy     # build + wrangler deploy
```

## 部署

线上**必须**配 token：Workers 的出口 IP 是共享的，未认证的 60 次/小时会被别人
用光。

```bash
pnpm wrangler secret put GITHUB_TOKEN
```

用 fine-grained PAT，权限只要对本仓库的 **Issues: Read-only**。

推送到 `master` 会由 `.github/workflows/deploy.yml` 自动部署，需要在仓库
Secrets 里配 `CLOUDFLARE_API_TOKEN` 和 `CLOUDFLARE_ACCOUNT_ID`。

## 配置

站点信息都在 `wrangler.jsonc` 的 `vars` 里：

| 变量                              | 说明                                                  |
| --------------------------------- | ----------------------------------------------------- |
| `GITHUB_OWNER` / `GITHUB_REPO`    | 文章来源仓库                                          |
| `GITHUB_LABEL`                    | 只发布带该 label 的 issue；留空则发布你开的全部 issue |
| `SITE_URL`                        | 用于 canonical / RSS / sitemap 的绝对地址             |
| `SITE_TITLE` / `SITE_DESCRIPTION` | 站点标题与副标题                                      |

主题色改 `src/styles.css` 里的 `--color-accent` 与 `--color-accent-strong`
两行即可。

## 结构

```
src/
  lib/github.ts      GitHub API + 边缘缓存，Post 数据模型
  lib/posts.ts       createServerFn 包装，供路由 loader 调用
  routes/index.tsx   首页：卡片列表 + 标签筛选 + 搜索
  routes/posts.$number.tsx   文章详情
  routes/rss[.]xml.ts        全文 RSS
  routes/sitemap[.]xml.ts    sitemap
  styles.css         设计 token + GitHub 风格正文样式
```

`blog/` 目录是早年手工维护的 markdown 副本，已不参与站点渲染。
