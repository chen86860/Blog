# 使用 Cloud Run 部署 Docker 应用

## 介绍

Docker 是一种容器化技术，旨意提供一种轻量级、可移植、自包含的软件运行环境。Cloud Run 是 Google Cloud Platform (GCP) 提供的一种无服务器容器化服务，可以让你在容器中运行任何 HTTP 请求驱动的容器化应用。本文将介绍如何使用 GCP 的 Cloud Run 部署 Docker 应用。

## 部署方式选型

| 服务                                            | 优点                                                               | 缺点                                              |
| ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------- |
| [Cloud Run](https://cloud.google.com/run?hl=en) | 无服务器、自动扩展、按需付费，且每月拥有免费额度，轻量使用可以免费 | 限制 15 分钟超时、最大并发数 80、最大内存 2GB     |
| [Fly.io](https://fly.io/)                       | 专门的 Docker 容器提供商，部署方面简单                             | 需要绑定信用卡，且每月有$5 的月费，无免费体验额度 |
| [Railway](https://railway.app/)                 | 类似 Fly.io, 也是专门的 Docker 容器提供商，部署方面简单            | 需要绑定信用卡，且每月有$5 的月费，无免费体验额度 |
| [Render](https://render.com/)                   | Web App 部署提供商，提供了多种的语言架构，且可免费体验使用         | 限制较多                                          |

在权衡了各种因素后，我选择了 GCP 的 Cloud Run 作为部署 Docker 应用的服务。因为其无服务器、自动扩展、按需付费，且每月拥有免费额度，轻量使用可以免费。

## 部署步骤

### 1. 账号准备

- 创建 Google Cloud Platform (GCP) 账号
- 开启账单服务
- 开启 Cloud Run API

不再赘述

### 2. 创建 Docker 镜像仓库

打开 [Artifact Registry](https://console.cloud.google.com/artifacts)，点击【Create Repository】 来创建 Docker 镜像仓库。填写名称和位置，点击【Create】。

![创建示例](https://cdn.emmmm.dev/img/Snipaste_2024-04-10_10-15-54.png)

### 3. 构建 Docker 镜像

安装 [Docker](https://www.docker.com/) 以及 [gcloud cli](https://cloud.google.com/sdk/gcloud), 并登录 gcloud，不再赘述。

在 Dockerfile 所在目录下执行以下命令构建 Docker 镜像：

```bash
docker build -t gcr.io/your-project-id/your-repo-name/your-image-name:your-tag .
```

参数含义：

- gcr.io/your-project-id/your-repo-name： 这里是你的 Docker 仓库地址，可以在第二步创建好后的 Artifact Registry 中查看：

  - ![仓库地址](https://cdn.emmmm.dev/img/Snipaste_2024-04-10_10-23-33.png)

- your-image-name：你的镜像名称
- your-tag：你的镜像标签

> [!WARNING]
> 如果你在用 Apple M 系列芯片的 Mac 电脑，可能会遇到在 Cloud Run 部署失败的问题，此时需要在构建镜像时指定构建平台为 linux/amd64，如下所示：
>
> ```bash
> docker build --platform linux/amd64 -t gcr.io/your-project-id/your-repo-name/your-image-name:your-tag .
> ```
>
> 参考链接 [Cloud Run: "Failed to start and then listen on the port defined by the PORT environment variable." When I use 8080](https://stackoverflow.com/a/68766137/4661426)

### 4. 推送 Docker 镜像

在上一步构建好 Docker 镜像后，执行以下命令推送 Docker 镜像到 Artifact Registry：

```bash
docker push gcr.io/your-project-id/your-repo-name/your-image-name:your-tag
```

### 5. 部署 Docker 应用

在 [Could Run](https://console.cloud.google.com/run) 中点击【Create Service】，开始创建服务：

选择镜像点击【SELECT】，在弹出的对话框中选择 Docker 仓库名称，再选择刚刚推送的镜像。

其他的按照需求填写即可，点击【Create】即可完成部署。

## 参考

- [Cloud Run documentation](https://cloud.google.com/run/docs)
- [How to Deploy to Google Cloud Run](https://docs.deno.com/runtime/manual/advanced/deploying_deno/google_cloud_run)
