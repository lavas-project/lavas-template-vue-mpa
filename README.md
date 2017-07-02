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

与 appshell 单页模版不同的是，使用 multipage 插件生成多个页面，同时在构建时渲染各个页面对应的 skeleton 组件，将渲染结果插入最终页面 html 中。

## 各个单页间路由跳转

从上面的文件结构中可以看出，各个页面拥有自己独立的路由，所以 home 页面的路由对象中不应该包含例如`/detail/:id`的规则。为了保证各页面间能够正常跳转，需要添加一条覆盖所有情况的路由规则'*'。在单页应用中，通常用来展示404页面，而我们在这里完成跳转。

```js
// src/router.js

// 各个页面的路由对象都通过这种方式创建
const router = new Router({
    mode: 'history',
    base: '/',
    routes: [
        ...routes, // 各个页面自身的路由规则
        {
            path: '*',
            beforeEnter(to) {
                window.location.href = to.fullPath;
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

## 待解决问题

### multipage插件

* [ ] 需要支持传入更多htmlWebpackPlugin参数
* [ ] 需要支持替换目标路径中的`[name]`占位符

[对应PR](https://github.com/mutualofomaha/multipage-webpack-plugin/pull/34)

### webpack-cdn插件

在生产环境构建时，使用了[webpack-cdn插件](https://github.com/van-nguyen/webpack-cdn-plugin)，由于发布时代码没有编译到ES2015，里面又使用了例如解构的ES6语法，在 node < 6 时运行`npm run build`会出错。

[对应PR](https://github.com/van-nguyen/webpack-cdn-plugin/pull/5)已通过，问题解决。

### vue-skeleton插件

* [ ] 开发环境下插入各个页面的 skeleton 路由规则，方便开发调试。

### 404页面问题

由于在单页中没有找到匹配的路由都进行了跳转，意味着无法展示404页面。
