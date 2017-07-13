# *__name__*

> *__desc__*

## 安装，开发及调试

``` bash
# 安装依赖
npm install

# 更新
npm update

# 启动开发服务器，默认打开localhost:8082/home
npm run dev

# 检查您的代码是否规范
npm run lint

# 生产环境构建
npm run build

# 生产环境构建并展示bundle信息
npm run build --report
```

## 文件结构

绝大部分结构和[appshell模版](https://github.com/lavas-project/lavas-template-vue-appshell)一致，只是`pages/`下存放各个页面文件夹而不是路由组件。
每个页面文件夹中包含该单页所需的各个文件。
``` bash
lavas-template-vue-mpa
    |---src
        |---pages 页面存放目录
            |---detail 详情页模块
                |--- Detail.skeleton.vue 构建时渲染的skeleton组件
                |--- Detail.vue 路由组件
                |--- entry-skeleton.js skeleton入口
                |--- entry.js entry入口
                |--- index.html 页面模版，供htmlWebpackPlugin使用
                |--- router.js 单页面使用的路由
            |---home 主页模块
            |---search 搜索页模块
        |---...省略其他目录
```

## 基本实现方式

与 appshell 单页模版不同的是，使用 [multipage 插件](https://github.com/mutualofomaha/multipage-webpack-plugin)生成多个页面，同时在构建时渲染各个页面对应的 skeleton 组件，将渲染结果插入最终页面 html 中。

## 各个单页间跳转

在单页应用中我们使用 vue-router 进行前端路由跳转，而多页应用可以看成多个单页应用，每个单页都可以有各自独立的路由，那么如何做到在各个单页之间进行跳转呢？

例如想从A页面跳转到B页面，发现目标路由规则并不在A页面的规则集中，此时肯定不能展示404页面，需要识别出这是一个有效的路由规则，通过`window.location.href`而非 vue-router 进行跳转。

这就要求我们在构建时收集所有页面使用的路由规则（由router-loader完成），形成一个项目中有效的路由规则全集。各个页面遇到不匹配的路由时，都需要去这个全集中查看，匹配了其中的某条规则才进行跳转，否则依然展示404页面。

具体实现如下：
```js
// src/router.js

// 各个页面的路由对象都通过这种方式创建
const router = new Router({
    mode: 'history',
    base: '/',
    routes: [
        ...routes,
        {
            path: '*',
            component: NotFound,
            beforeEnter(to, from, next) {
                if (validateRoute(to.fullPath)) { // 跳转到有效路由
                    window.location.href = to.fullPath;
                    return;
                }
                next(); // 继续展示404页面
            }
        }
    ]
});
```

### 服务端配置

和使用 HTML5 History 模式的单页应用一样，需要在服务端配置路由规则。以nginx为例：
```
// nginx.conf

server {
    # 省略其他配置

    location /home {
        try_files $uri $uri/ /home.html;
    }

    location /detail {
        try_files $uri $uri/ /detail.html;
    }

    location /search {
        try_files $uri $uri/ /search.html;
    }
}
```

其实在开发服务器 express 中，我们也做了一些简单的配置：
```js
// build/dev-server.js

var rewrites = Object.keys(utils.getEntries('./src/pages', 'entry.js'))
    .map(function (entry) {
        return {
            from: new RegExp(`/${entry}`),
            to: `/${entry}/index.html`
        };
});
app.use(require('connect-history-api-fallback')({
    htmlAcceptHeaders: ['text/html'],
    rewrites
}));
```

