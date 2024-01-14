## 一分钟完成 Jenkins 自动构建的秘密

Jenkins 的快速发布能减少交付等待时间，提高开发阶段的效率。本文从三点入手，来介绍下如何在一分钟完成 Jenkins 自动构建。

### 1. 开发阶段

开发阶段主要通过构建工具**复用缓存**来提高打包速度，可以开启缓存的常用插件有：

- babel-loader

- terser-webpack-plugin

- html-webpack-plugin

配置`babel-loader` 及`terser-webpack-plugin`的缓存可参照[加快 Jenkins 构建速度建议一二](https://webpack.js.org/configuration/cache/), 此处不再赘述。其他插件的缓存配置参考官方文档即可。这一步能大大加快打包速度，强烈建议开启。

此外，如果项目中使用了 [ESLint](https://eslint.org/) 以及配置了 pre-commit 钩子，还可以开启 ESLint 的缓存，用以减少不必要的文件检查——只对改变的文件进行检查，减少 pre-commit 阶段的时间。配置方法如下:

```bash
eslint --fix --cache --cache-location node_modules/.cache
```

- `--cache` 是开启 ESLint 缓存的关键配置
- `--cache-location` 指定缓存的位置，默认缓存位置为项目根目录，可以根据需求进行配置。这里更改位置为`node_modules/.cache`, 这个位置也同样是很多插件的默认缓存位置

### 2. 提交阶段

在以往的工作流程中，我们是先在本地提交代码，然后到 Jenkins 选择发布分支，再进行构建。然而在大多数时候，我们都是想发布有代码变动的分支。得以于 Jenkins 的 WebHooks，我们可将这一过程进行自动化：推送代码到 GitLab，GitLab 自动触发 Jenkins 的构建，以此来减少不必要的操作步骤。具体操作流程如下：

#### 开启 Jenkins 构建触发器

在 Jenkins 项目配置中 ，找到 **Build Triggers** 这一节，勾选 "Build when a change is pushed to GitLab..."，

![Jenkins 项目配置](https://i.loli.net/2020/06/18/kwUl1dLX2pzIFqE.jpg)

在上图的绿色框内，可选择触发的分支。可以根据项目需求可以选择所有或者部分分支触发。这里笔者根据正则来配置，配置值为：`(master|dev|release|hotfix.*)`，即匹配 `master`、`dev`、`release` 以及以`hotfix` 开头的分支。

在 Pipeline Script 中，修改选择分支的脚本，新增一个变更分支判断逻辑，如下：

```groovy
stage '选择分支'
node {
 // 新增一个 if 判断逻辑： 当环境变量 env['gitlabBranch'] 不为空时，则设置 repositoryBranch 的值为 env['gitlabBranch']
 if (env['gitlabBranch'] != null) {
  repositoryBranch = env['gitlabBranch']
 } else {
  withCredentials([
   [$class: 'StringBinding', credentialsId: 'gitlab_api_token', variable: 'GITLAB_API_TOKEN']
  ]) {
   def url = "http://gitlab.example.com/api/v4/projects/${repositoryNamespace}%2F${repositoryName}/repository/branches?private_token=${env.GITLAB_API_TOKEN}"
   def response = httpRequest([url: url, contentType: 'APPLICATION_JSON'])
   def branchObjs = parseJson(response.content)
   for (def branchObj: branchObjs) {
    branchChoices = branchChoices + branchObj.name + '\n'
   }
  }

  timeout(time: 60, unit: 'SECONDS') {
   repositoryBranch = input(message: '选择分支', parameters: [
    [$class: 'ChoiceParameterDefinition', description: '分支列表', name: 'branch', choices: branchChoices]
   ])
  }
 }
}
```

最后，复制项目的 GitLab CI Service URL 地址，稍后在 GitLab 中进行配置。

#### 配置 GitLab WebHooks

在项目的 GitLab 仓库上找到配置 Integrations，在 URL 里填入 Jenkins 提供的 GitLab CI Service URL 地址，再点击"Add webhook":

![配置GitLab WebHooks](https://i.loli.net/2020/06/18/4KrAw17o6XUW9S8.jpg)

添加完毕之后，可以在下面已添加的 Webhooks 中，测试配置是否成功，能否触发 Jenkins 自动构建。

这样，就完成了提交阶段的自动构建，省去选择分支的时间。

### 3. 构建阶段

在使用 Jenkins 构建过程中，笔者发现几个可以优化的点：

1. Node 镜像版本(8.x)太老旧：无法获得新版本特性以及新工具库的支持。如 [Yarn](https://yarnpkg.com) 只在 Node 10.x 镜像中才支持；
2. 脚本配置不合理：删除了上次构建使用的 `node_modules` 以及重要的依赖锁文件，如`yarn.lcok` 、`package-lock.json`，导致每次都要重现安装，大大拖慢构建时间；
3. 构建镜像冗余：应用运行时，只需要运行环境的资源，对于构建过程中所使用的，没必要进行镜像的构建；

为此，我对脚本做以下优化：

1. 使用 10.x 以上的镜像进行打包，并使用 [Yarn](https://yarnpkg.com) 包管理工具安装依赖；
2. 保留构建现场，不删除 `node_modules` 及依赖锁文件；
3. 构建运行镜像只保留运行依赖

优化后的脚本例子：

```groovy
stage '编译'
node("fed-server") {
  // 使用 node:10.16.0 进行构建
  def nodejs = docker.image('node:10.16.0')
  nodejs.inside("-v ${pwd()}:/home -v /root/.npm:/root/.npm -w /home") {
    // 只保留安装包的脚本，保留构建现场。（如使用 npm，则使用相应命令即可）
    sh 'yarn'
    sh 'yarn run build:dev'
   }

  // 只选择构建产物，package.json, 锁文件。忽略 node_modules（如有位于根目录的资源，请一并加入。例如：assets-cache）
  stash includes: 'build/,package.json,yarn.lock', name: 'build'
}

stage '运行'
node("fed-server") {
  def deployDir = "/opt/projects/${repositoryNamespace}/${repositoryName}/${repositoryBranch}"
  dir(deployDir) {
    unstash 'build'

    def containerName = "${repositoryBranchWithoutSlash}.${repositoryPubName}.varena.com"
    def removeContainerBash =
    '''
    docker ps -a |
    grep "containerName" |
    awk '{print $1}' |
    xargs -I % sh -c "docker stop % && docker rm %"
    '''
    .replaceAll('containerName', containerName)
    sh removeContainerBash

    // 启动脚本上，安装运行依赖（npm 则用npm install --production）
    sh "docker run --dns=8.8.8.8 --dns=8.8.4.4 --net='nginx' --name ${containerName} -e TZ=Asia/Shanghai -v ${pwd()}:/home/app -w /home/app -d node:10.16.0 bash -c 'yarn --prod && yarn run start:dev'"
  }
}
```

至此，将大大缩短构建过程，使构建时间平均在一分钟以内！

![最终效果](https://i.loli.net/2020/06/18/6dYSbUOATws9mXN.jpg)

完整配置可参考：[PROJECT 项目 Jenkins 配置](http://jenkins.example.com/job/PROJECT/configure)

### 总结

通过对开发阶段、提交阶段以及构建阶段的优化处理，我们得到这样一个工作流程：本地开发完成后，ESLint 快速进行文件检查 -> 提交到 GitLab -> 触发 GitLab Push commit -> 调用 Jenkins 构建触发 -> 快速完成构建。

以上，是笔者一分钟完成 Jenkins 自动构建的秘密。抛砖引玉，如有更好的方案，欢迎一起探讨 🤣

#### EOF
