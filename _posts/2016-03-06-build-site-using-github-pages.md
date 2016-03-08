---
layout: post
category : jekyll
tags : [jekyll, blog]
title : 使用GitHub Pages搭建技术博客
published : true
---
{% include JB/setup %}

## 1. 搭建技术博客

相信很多码农在某一天会有这么一个小冲动——“我要搭建属于自己的技术博客”，然后就会开始Google着——“如何搭建自己的技术博客？”。很惭愧，我也是其中的一员。但是很幸运，发现其实以前用过的GitHub已经为我们提供了搭建个人技术博客的平台——GitHub Pages！使用GitHub Pages来搭建博客有以下好处：

 - 提供一定免费空间给你搭建个人博客
 - 托管在GitHub上面安全可靠，节省更多考虑实现技术细节的时间
 - 基于模板脚本Jekyll来搭建，快速且简单，开源社区提供了很多Jekyll主题供你自行定制个人博客，如Jekyll Bootstrap
 - 使用Markdown语法来编写博客文章，可以让你专注于写作，而不必去在意太多格式或样式

基于以上好处，我们可以使用GitHub Pages来搭建自己的技术博客。

> 如果你还没有听说过Git、GitHub以及Markdown，建议你先了解一下这些东西。因为这篇文章所讲的搭建博客的必须前提是掌握这些工具的基本使用。

### 1.1 Jekyll简介

Jekyll是一种简单的、适用于博客的、静态网站生成引擎。它使用一个模板目录作为网站布局的基础框架，支持Markdown的解析，提供了模板、变量、插件等功能，最终生成一个完整的静态Web站点。说白了就是，只要安装Jekyll的规范和结构，不用写html，就可以生成网站。Github Pages允许我们使用Jekyll来搭建个人站点。

### 1.2 Jekyll目录结构

Jekyll通过规范目录结构来帮助我们生成一个完整的静态站点。目录结构如下所示：
    
	.
    |-- _config.yml
    |-- _includes
    |-- _layouts
    |   |-- default.html
    |   |-- post.html
    |-- _posts
    |   |-- 2011-10-25-open-source-is-good.markdown
    |   |-- 2011-04-26-hello-world.markdown
    |-- _site
    |-- index.html
    |-- assets
        |-- css
            |-- style.css
        |-- javascripts

- **\_config.yml**
	
用来保存站点的全局配置，包括站点名称(title)、作者信息(author)、主题模板相关配置(如我们后面将要用到的Jekyll Bootstrap主题模板)、访问路径配置(permalink)、markdown选择、高亮设置等等。

- **\_includes**

通常我们将一些通用子模板文件，如html模板、Liquid模板放置到这个目录下面，然后通过如下脚本命令来引入这些模板：

```bash
{% raw %}{ % include /subfolder/filename % }{% endraw %}
```

> 其中subfolder是相对于\_includes目录而言的子目录。

- **\_layouts**

这个文件目录用来存放整个站点的通用布局模板html文件，在这些模板文件里面可以使用Liquid脚本语言来include前面所说的_includes文件目录里面的某些子模板脚本或者html子模板文件。

- **\_posts**

\_posts文件目录用来存放我们发布的文章，文件命名规范为`@YEAR-MONTH-DATE-title.MARKUP@`，如**"2016-03-01-hello-jekyll.md"**。文件格式可以是html或者Markdown，推荐使用Markdown来写文章。

- **\_site**

这个文件夹是Jekyll引擎自动生成的，用来存放解析生成的站点文件。当我们安装了Jekyll并启动Jekyll成功以后，将会看到这个目录下生成了很多html文件。

- **assets**

assets目录不是Jekyll要求必须有的目录，通常把一些css样式、js脚本、图片资源放置在这个文件夹下面。

## 2. 搭建流程

### 2.1 本地开发环境搭建

> 这里假设你已经拥有了一个GitHub账号并且在本地已经安装了Git工具。

Jekyll开发环境依赖于Ruby，因此我们必须先保证本地安装了Ruby环境，这里以Windows为例来介绍Jekyll本地开发环境的安装。

(1) 从[RubyInstaller官网下载页面](http://rubyinstaller.org/downloads/)安装最新的RubyInstaller并配置环境变量，在Path环境变量里面添加%RubyInstaller\_install\_path%\bin(其中%RubyInstaller\_install\_path%表示你安装的RubyInstaller路径)。打开命令行工具，输入以下命令升级gem：

```bash
gem update --system
```

(2) 在下载RubyInstaller的页面上下载对应版本的DevKit，解压到指定目录，打开命令行工具进入DevKit的安装目录，输入以下命令来安装Ruby：

```bash
ruby dk.rb init
ruby dk.rb install
```

> DevKit是windows平台下编译和使用本地C/C++扩展包的工具。它就是用来模拟Linux平台下的make,gcc,sh来进行编译。

(3) 接下来就可以安装Jekyll了，执行以下gem命令来安装Jekyll：

```bash
gem install jekyll
```

使用以下命令来检测安装是否成功

```bash
jekyll --version
```

(4) 安装解析Markdown标记的包：

```bash
gem install rdiscount
```

(5) 创建GitHub个人站点项目

GitHub做了一个约定，创建名为[username].github.io的项目来存放你的个人站点目录及内容，并且约定必须使用master分支。其中username表示你的GitHub用户名。

基于这个约定，我们首先在GitHub上面创建这个项目，并将这个项目clone到本地某个目录：

```bash
git clone https://github.com/[username]/[username].github.io.git
```

(6) 基于Jekyll Bootstrap主题模板来初始化我们的个人博客

这里我们采用Jekyll Bootstrap主题模板来初始化构建我们的博客，然后我们可以在其上继续完善并定制自己的博客页面内容。

从Jekyll Bootstrap GitHub地址将Jeyll Bootstrap拉取到本地：

```bash
git clone https://github.com/plusjade/jekyll-bootstrap.git
```

然后将jekyll-boostrap目录里面的所有内容(除了.git文件夹)以外，拷贝到步骤(5)的username.github.io目录里面。

(7) 修改_config.yml

```xml
title : [你的博客名称]
author :
  name : [你的名字]
  email : [你的邮箱]
  github : [你的GitHub用户名]
  twitter : NONE
  feedburner : NONE

#其中username为你的GitHub用户名
production_url : http://username.github.io 
```

(8) 打开命令行工具，进入username.github.io目录，执行以下命令运行jekyll本地测试博客：

```bash
jekyll serve
```

成功运行后，打开浏览器访问：

```bash
localhost:4000
```

随即我们可以看到一个Bootstrap样式的博客在本地就已经跑起来了。至此我们初始化本地开发环境的工作已经结束。接下来将简单介绍如何发布文章。

### 2.2 发布第一篇文章

在_post目录下面新建一个md文件，命名为2016-03-07-hello-jekyll.md，然后写下如下内容：

```bash
---
layout: post
category : jekyll
tags : [ jekyll, blog ]
title : 使用GitHub Pages搭建技术博客
published : true
---

{% raw %}{ % include /JB/setup % }{% endraw %}

## 第一篇文章

Hello Jekyll!
```

被`---`包围的部分是Jekyll规定用来配置变量的。`layout`表示当前布局所在父布局；`category`用来指定文章属于哪个分类，还可以用`tags`来为文章打上标签，标签可以有多个；`title`表示文章的标题。`published`为true表示将会被Jekyll引擎渲染成html并发布到站点，为false表示不渲染，默认为true。

> 实践中发现文章的文件命名[title]部分不能使用中文，因为文章[title]会作为站点url的一部分被使用，但是可以通过上面所说的变量title来指定文章的中文标题，以将每一篇文章的标题在页面上显示为中文。

### 2.3 上推到GitHub

最后我们使用git命令，提交我们所有修改，然后将项目上推到GitHub上：

```bash
git add .
git commit -m "init my github site"
git push origin master
```

成功后打开浏览器访问username.github.io即可以访问我们搭建的GitHub博客了。至此我们已经知道如何通过GitHub Pages来搭建以及发布自己的技术文章了。当然，这篇文章没有深入涉及Jekyll，你可以在Jekyll官网上面获取到更多它的介绍以及使用。还有，这里我们只是使用了Jekyll Bootstrap主题模板来装饰我们的博客，假如你对前端技术比较熟悉，完全可以自己再去定制自己的博客主题样式和布局，使你的博客看上去更美观。

### (可选) 2.4 绑定域名

GitHub Pages允许你将搭建的个人站点绑定到你的域名。这里以万网为例讲解如何将一个[username].github.io的个人博客绑定到你在万网上面购买的域名上(对的，没错，要用钱购买的域名)。

> 现在万网已经归到阿里云管理里面，可以使用阿里云账号去购买一个属于你自己的域名。

(1) 在你的项目根目录下新建名为**CNAME**的文件(注意不要有任何文件后缀)，然后打开CNAME文件，输入你购买的域名(不用输入www或者http://)，然后将项目提交到GitHub上面。

(2) 登陆阿里云，进入【域名管理】->【域名设置】，添加一个“解析”，记录类型为`CNAME`，主机记录为`@`，记录值为`[username].github.io`，确定后保存并等待10分钟。然后访问你的域名，将会看到你的GitHub Pages个人站点成功访问到了。

## 3. 参考

- [Jekyll中文官网](http://jekyll.bootcss.com/)
- [通过GitHub Pages建立个人站点](http://www.cnblogs.com/purediy/archive/2013/03/07/2948892.html)
- [Jekyll语法简单笔记](http://ju.outofmemory.cn/entry/98471)