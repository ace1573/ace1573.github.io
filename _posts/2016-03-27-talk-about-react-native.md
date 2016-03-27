---
layout: post
category : mind
tags : [mind,react-native]
title : 瞎扯：APP开发之React Native
published : true
---
{% include JB/setup %}



### 前言
- 本文介绍了新生框架[React Native](https://github.com/facebook/react-native)，以及我对它的理解。
- 我不会IOS开发，也不会React Native，我只是喜欢瞎BB。


---

### React Native是什么。

- [React](http://facebook.github.io/react/)是facebook推出的用于`构建UI`的`js库`。

- [React Native](http://facebook.github.io/react-native/)是一个用React去`构建原生APP`的框架。

- 简单的说，React Native就是可以`用js去写原生app`的框架。是的你没有听错，用js写原生android和ios应用，原生哦，不是webapp。

---


### React Native的优势。

#### 1.开发效率高。

- javascript作为一门脚本语言，在开发效率上肯定是完胜android的java和ios的oc的（听说swift也很快）。
- React作为一个可以和google的[angular](https://angular.io/)刚正面的框架，肯定有它的过人之处。其中之一就是：开发效率高。

#### 2.开发成本低。

- 一方面，效率高本来就意味着成本低。
- 另一方面，使用React Native开发APP降低了对开发者写原生应用的能力的要求。原来写原生APP的时候，可能要求开发者要熟悉ios、android，现在也许只要了解就可以了。
React Native 官方的说法是：` learn once, write anywhere. `。也就是说，学会React Native，就可以写任何APP了。虽然这个有点夸张，但是意思是在那里。
- 再一方面，减少了所需开发者的人数。也许不再需要android和ios两个团队，一个app团队就够了呢。


#### 3.原生APP哦。

- React Native最终还是会在原生的环境中运行。也就是说，它没有webapp各种蛋疼的问题。性能也与原生app相差无几。

#### 4.热更新

- APP更新一直是个蛋疼的问题。React Native有webapp类似的热更新功能，不需要重新安装app即可完成更新。此功能在ios上还未得到apple官方的认同。


---

### React的Virtual DOM。

- 在数据绑定的问题上，angular使用的是`双向数据绑定技术`，听起来确实很屌。但它有一个问题，就是效率有点低。而React则是使用`单向数据绑定`，任何数据状态的改变都会触发整个界面的更新。
当然，它不是重新渲染整个页面然后替换掉。它引入了一个中间件叫Virtual DOM，当有数据的状态发生变化时就重新渲染这个Virtual DOM，然后跟真实的界面作比较，更新有改变部分的界面。听说这样做效率会比angular高一些。
- 另外，这个Virtual DOM相当于一个统一的接口，它可以对接HTML的DOM节点，也可以对接android或者ios的各种View。开发者只需要关注Virtual DOM而不需要关心真实界面的实现了怎样的。这就是传说中的` learn once, write anywhere. `
- 但是，这并不是说android跟ios一套代码就搞定了，android跟ios在很多界面风格以及操作上面还是有很大区别的。作为一个有尊严的android程序猿，我是拒绝拿着一套ios的UI去写android界面的（虽然尊严在现实面前还是要低头）。
所以React Native还是分别给android和ios提供了很多特有的组件，如[DrawerLayoutAndroid](http://facebook.github.io/react-native/docs/drawerlayoutandroid.html#content) 、[TabBarIOS](http://facebook.github.io/react-native/docs/tabbarios.html#content)。
人家说的很明白，是` learn once, write anywhere. `，不是` write once, run anywhere. `

---

### React Native的缺点。

- 目前React Native的生态还不完整，组件还不全，第三方库比较少。但是我相信，这只是时间问题。
- 尚未得到android和ios的官方支持。这个也不能算缺点吧，只能说如果有官方支持，就如虎添翼。
- React Native的技术栈对于android和ios工程师来说差距太大，原生app工程师如果没有前端经验，转型的学习成本很大。但是另一方面，对于前端工程师来说，学习成本很小呀，前端狗真的要一统江湖了么。。。


---
