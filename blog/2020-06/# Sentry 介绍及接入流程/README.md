# Sentry 介绍及接入流程

## 前言

当今网络世界错综复杂，如何保持应用的质量及稳定性，单凭借开发人员的素质很难避免一些 BUG，而 BUG 产生变量太多：浏览器的版本、用户所处的网络环境、操作时间等等都可能产生不一样的 BUG，前期测试很难覆盖到 100% 的 Case；此外，对于经用户反馈的 BUG，会因为专业术语不通、表达不清晰等沟通问题，也难以复现 BUG。所以我们亟需一个能远程收集客户端错误的方案，快速定位问题并解决，这就是本文要介绍的 Sentry。

## Sentry 是什么?

> Self-hosted and cloud-based **error monitoring** that helps software teams discover, triage, and prioritize errors in real-time.

### 1. Sentry 优点

- #### 多平台支持

  支持多种平台（Web、Mobile、Native）多种语言（JavaScript、PHP、Go、Java、Cocoa 等，完整支持列表见[Platforms](https://docs.sentry.io/platforms/)，以及供 Self-host 等功能。

- #### 开源

  Sentry started as an open source project and is still [eventually open source](https://sentry.io/_/open-source/). There are no barriers to adoption, usage, or contribution, other than your own technical ability to [adopt](https://github.com/getsentry/onpremise), use, or [contribute to it](https://github.com/getsentry/sentry).

- #### 实时收集、完整复现

  Sentry gives every developer the context they need to own their code from end to end, eliminating the lengthy feedback loops and guess work that make bug fixing such a drag.

  为不同语言提供完整的复现上下文，方便定位 BUG；方便协同工作，可指定处理人员

- #### 隐私和安全

  We’re committed to securing any of your app data that’s touched by our service. That’s why we adhere to regulatory standards including [Privacy Shield](https://sentry.io/security/#privacy-shield), [GDPR](https://blog.sentry.io/2018/03/14/gdpr-sentry-and-you), and [PCI DSS](https://sentry.io/security/#pci-dss).

  遵守欧盟的隐私协议，例如 [Privacy Shield](https://www.privacyshield.gov/participant?id=a2zt0000000TNDzAAO) 和 [General Data Protection Regulation (GDPR)](https://blog.sentry.io/2018/03/14/gdpr-sentry-and-you). 同时也提供漏洞发现、基础设施安全、网络安全等措施。具体细节可参考：[Sentry Security](https://sentry.io/security)

- #### 持续集成

  Insight into what’s happening with your code across the development and release cycles makes setting priorities easy and actionable. Each error is just another chance to improve.

  提供持续集成方案，方便项目交付。

### 2. 组织结构

![Sentry 组织结构](https://i.loli.net/2020/06/30/Ys51AztjUSBhZ7k.png)

## 接入流程

本文以前端项目使用的 React 框架为例，介绍下接入流程，其他平台根据提示接入即可。

### 1. 新建项目

首先在 Sentry 平台上新建一个项目，选择框架 React，填入项目名称，再选择归属 Team，点击 “Create Project” 创建。

![](https://i.loli.net/2020/06/30/PjzaefI97tvug3V.png)

### 2. 安装 SDK

新建完项目后，就会生成一个 **DSN**，它是和 Sentry 服务通信的唯一标志，稍后我们在项目中进行配置，首先需要在项目中安装 SDK：

```bash
# Using yarn
$ yarn add @sentry/browser

# Using npm
$ npm install @sentry/browser
```

### 3. 配置

为了通过 SDK 和 Sentry 服务通信，这里可以单独创建一个高阶组件包裹应用，示例代码如下：

```jsx
// SentryErrorBoundary
import React, { Component } from "react";
import * as Sentry from "@sentry/browser";

Sentry.init({
  dsn: "YOUR_DSN_KEY_HERE",
});

class SentryErrorBoundary extends Component<any, any> {
  componentDidCatch(error, errorInfo): void {
    Sentry.withScope((scope) => {
      scope.setExtras(errorInfo);
      Sentry.captureException(error);
    });
  }

  render() {
    return this.props.children;
  }
}

export default SentryErrorBoundary;
```

在项目顶层进行引入

```jsx
// index.jsx
import React from "react";
import App from "src/App";
import ErrorBoundary from "components/ErrorBoundary";

ReactDOM.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
  document.getElementById("root")
);
```

至此完成了项目的初始化，SDK 会自动捕获应用运行时的错误进行上报。我们可以在管理后台实时监控到错误信息，方便定位问题以快速解决。

![管理后台的实时错误信息](https://i.loli.net/2020/07/09/b4uiocGhYNRJOHv.jpg)

### 4. 高级用法 (可选)

除了最基本的配置，还有一些高级用法：

#### 1. 手动上报错误信息

除了自动上报，还可以通过`Sentry.captureMessage` 手动进行上报:

```jsx
import React from "react";
import * as Sentry from "@sentry/browser";

const Index = () => (
  <div className="Index">
    <button type="button" onClick={() => Sentry.captureMessage("Something went wrong")}>
      Capture
    </button>
  </div>
);
```

#### 2. 更详尽的配置项

调用 `Sentry.init`时，还可以传入一些有用的参数：

- `release: string`

  `release` 标志了应用版本的唯一性，可以在 Sentry 平台上进行过滤指定的 `release`, 能监控唯一版本的目的，建议配置为应用的版本号。

- `enabled:boolean`

  是否开启 Sentry 通信。如在本地开发时可关闭。

- `environment: string`

  应用环境。同一个应用同一个版本可能有多个运行环境，指定值也有助于区分应用环境。

- `ignoreErrors: Array<string | RegExp>`

  忽略的错误类型。对于一些特定的错误可以进行忽略而进行上报。

- `integrations: Array<string>`

  Sentry 的集成插件，可以定制需要的插件功能。例如使用 `CaptureConsole` 来捕获控制台输出的错误信息。具体可参照 [Integrations](https://docs.sentry.io/platforms/javascript/?platform=browsernpm#pluggable-integrations)

#### 3. 额外信息上报

当前 Sentry 除了上报错误信息之外，还包括一些基本的浏览器信息和系统信息，除此之外，还可以额外自定义一些信息进行上报。提供这一能力的称为 Scope。其可以包含 user、tags、level、fingerprint、extra data 等丰富信息，分别通过 `scope.setUser`、`scope.setTags` 、`scope.setLevel`、`scope.setFingerprint`、`scope.setExra`调用。

我们可以将用户的相关信息进行上报，将上报的错误与用户关联起来，当用户遇到线上故障的时候，我们就能够在 Sentry 后台利用用户的 ID 来搜索得到用户遇到了哪些错误。具体调用例子：

```js
// 设置用户信息：
scope.setUser({ “email”: “xx@xx.cn”})
// 给事件定义标签：
scope.setTags({ ‘api’, ‘api/ list / get’})
// 设置事件的严重性：
scope.setLevel(‘error’)
// 设置事件的分组规则：
scope.setFingerprint(['{{ default }}', url])
// 设置附加数据：
scope.setExtra(‘data’, { request: { a: 1, b: 2 })
```

创建 scope 有两种方式：

- 全局 scope
- 局部 scope

全局 scope 通过`Sentry.configureScope` 创建：

```js
Sentry.configureScope(function (scope) {
  scope.setTag("my-tag", "my value");
  scope.setUser({
    id: 42,
    email: "john.doe@example.com",
  });
});
```

创建后，应用的所有的错误都被关联到当前 scope 信息。

局部 scope 通过 `Sentry.withScope` 创建：

```js
Sentry.withScope(function (scope) {
  scope.setTag("my-tag", "my value");
  scope.setLevel("warning");
  // will be tagged with my-tag="my value"
  Sentry.captureException(new Error("my error"));
});

// will not be tagged with my-tag
Sentry.captureException(new Error("my other error"));
```

#### 4. 上传 Source Maps 文件

source maps 提供了 bundle 与源文件的映射关系，利用它能快速定位到源码的具体错误位置。一般来讲，为了应用安全性，source maps 不应该暴露给用户，只有开发人员才能接触。幸运的是 Sentry 强于其他错误监控平台的特点之一就是支持 source maps，我们可以将它上传到 Sentry，Sentry 会联系客户端上报的错误信息以及 source maps，使开发人员能在管理后台方便快速定位到源码的问题。

上传 source maps 到 Sentry 的有两种方式：

- 利用 [sentry-webpack-plugin](https://github.com/getsentry/sentry-webpack-plugin) 插件

  在 webpack 配置中，加入 `sentry-webpack-plugin` 插件，会在构建过程中把 source maps 上传到 Sentry，示例：

  ```js
  const SentryCliPlugin = require("@sentry/webpack-plugin");

  const config = {
    plugins: [
      new SentryCliPlugin({
        include: ".",
        ignoreFile: ".sentrycliignore",
        ignore: ["node_modules", "webpack.config.js"],
        configFile: "sentry.properties",
      }),
    ],
  };
  ```

- 利用 `sentry-cli`

  webpack 插件的一个问题是上传和构建都是同步的，拖慢整体构建时间。所以可以用`sentry-cli` 在 CI 工具过程中去并行上传。安装流程参照：[Installation](https://docs.sentry.io/cli/installation/)，使用示例：

  ```bash
  # 创建 release
  $ sentry-cli releases new <release_name>

  # 上传 source maps
  $ sentry-cli releases files <release_name> upload-sourcemaps /path/to/files

  # 释放 release
  $ sentry-cli releases finalize <release_name>
  ```

至此，我们可以把 bundle 上传到 CDN 上，source maps 上传到 Sentry，通过 release 连接错误和 source maps。

### 5.后台配置

默认 Sentry 后台配置已足够使用，这里介绍下一些实用的配置：

- 设置允许访问域名 （General Settings -> CLIENT SECURITY -> Allowed Domains）

  默认情况下，只要拿到 DSN，任何项目都可以进行接入。但恶意的接入调用会导致 Sentry 接收太多的冗余错误，导致正常的应用错误被淹没，失去了错误捕获的意义。建议这里填入自己的业务域名。

- 设置警报规则 (Alerts -> Rules)

  为了第一时间接收到错误信息，可以设置警报规则。这里可以根据 BUG 第一次出现、BUG 状态变更、单位时间内一个 BUG 被触发了多少次等等进行设置：

  ![](https://i.loli.net/2020/06/30/IG6m39Vy1zjtFAq.png)

- 过滤错误 （Inbound Filters）

  有些错误并不是应用本身产生的（如浏览器插件产生的），或者是可以忽略的错误（如低版本浏览器产生的、本地开发的错误）。可以在这里进行配置，建议勾选。

## 使用 Sentry 后台

以上，便完成了客户端的准备工作，整个过程用流程图可表示为：

![Sentry 流程图](https://i.loli.net/2020/07/09/JTlVzFy9QHd2man.jpg)

即前端在打包完成后，将运行使所需的资源文件（JS/CSS/Images/Font 等）上传到 CDN 上供用户消费，在错误产生时，将错误信息上报到 Sentry 平台，Sentry 进行数据处理清洗，将错误信息实时展示在后台上，供开发人员定位问题。此外，还可以选择将 source maps 也上传到 Sentry 平台，这样能得到更为详细的错误细节，如源码的位置，关联的资源等等。

Sentry 拿到错误信息后，我们可以在后台看到这样的错误详细：

![](https://i.loli.net/2020/06/30/ndDPcwWlMxR27SH.png)

由错误结果中可以看出，Sentry 给我们记录了包括但不限于这些错误：

1. 客户 IP 地址
2. 浏览器和操作系统
3. 访问的地址
4. 错误的信息和调用堆栈

通过这些信息，我们能很方便的知道错误发生的上下文条件，方便快速定位及解决问题。

## 结语

前端监控系统接入以后，才真正发现许多不易发现或不小心产生的异常，例如经常碰到的`Undefined is not a/an Function/Object`、`Network Error` 等等，也意识到了应用的运行的真实环境是这么复杂。有针对性地解决这些问题，对于整个前端业务的稳定、用户体验的提升、项目经验的积累都大有裨益。

## 参考

1. [Sentry Documentation](https://docs.sentry.io/)
2. [Security & Compliance](https://sentry.io/security/)
