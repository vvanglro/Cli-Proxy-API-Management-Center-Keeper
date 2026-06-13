# CLI Proxy API Management Center Keeper

这是 [CLI Proxy API Management Center](https://github.com/router-for-me/Cli-Proxy-API-Management-Center) 的 fork。

这个 fork 只做一件事：在管理面板左侧「配额管理」下面增加「监控统计」菜单，用来嵌入 [CPA Usage Keeper](https://github.com/vvanglro/CPA-Usage-Keeper) 的前端页面。

## 如何使用

在 CLI Proxy API 的配置里，把面板仓库改成这个 fork：

```yaml
panel-github-repository: https://github.com/vvanglro/Cli-Proxy-API-Management-Center-Keeper
```

然后按 CLI Proxy API 原有方式启动服务，打开：

```text
http://<host>:<api_port>/management.html
```

进入管理面板后，在左侧「配额管理」下面打开「监控统计」。

## 监控统计地址

首次进入「监控统计」时，需要手动填写 CPA Usage Keeper 的服务地址，例如：

```text
http://localhost:8080
```

地址会保存在浏览器本地。之后再次进入会直接打开这个地址。

CPA Usage Keeper 的 password 登录、session cookie 和后续 API 请求都在它自己的页面里完成。为了让浏览器正常携带 cookie，建议管理面板和 CPA Usage Keeper 使用相同主机名访问，例如都使用 `localhost`，不要混用 `localhost` 和 `127.0.0.1`。

## 分支约定

- `main`：只同步上游官方仓库，不放 Keeper 自定义改动。
- `codex/keeper-on-latest-main`：基于最新 `main`，只添加 Keeper 相关改动。

当前 Keeper 改动应尽量保持最小，方便后续继续同步上游。

## 发布

推送 `v*-keeper` tag 会触发 GitHub Actions 构建并发布单文件面板：

```text
management.html
```

最新 release：

```text
https://github.com/vvanglro/Cli-Proxy-API-Management-Center-Keeper/releases
```

## 本地开发

```bash
bun install --frozen-lockfile
bun run dev
bun run type-check
bun run build
```

构建产物默认是：

```text
dist/index.html
```

Release 流程会把它重命名为 `management.html`。

## License

MIT
