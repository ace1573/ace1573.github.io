---
layout: post
category : nodejs
tags : [nodejs,weather]
title : 明天下雨的话，发短信告诉我
published : true
---
{% include JB/setup %}



### 前言
- 作为一只很懒的程序猿，我不想每天去看天气预报。而且我只想知道明天有没有下雨、升温、降温。其他的我不关心。所以就想，自己写一个吧。
- 本文介绍了一个天气预报服务的实现。具体的功能是，服务器定时获取明天天气，如果发现明天下雨或者升温、降温，则发短信提前告诉我。
- 使用nodejs实现（顺便学习一下nodejs）。

---


### 准备

1. 搭建[nodejs](http://nodejs.cn)环境。
3. 选取天气预报提供商，我这里使用的是百度的API。
3. 选取短信服务提供商，我这里使用阿里巴巴的[大鱼短信平台](http://www.alidayu.com/)。


### 思路

1. 服务器每隔一小时获取一次天气。
2. 分析天气数据，是否有【下雨、升温、降温】的情况。
3. 如果有，给特定手机发送短信（每手机每天最多一次。另外0时-9时属于免打扰阶段，不发短信）。

---

### 具体实现

#### 1.自动更新天气方法。

```javascript
/**
 * 自动更新天气
 */
function autoUpdateWeather(){

    //一小时请求一次天气
    setInterval(function(){

        //0到9点不提醒
        var hour = new Date().getHours();
        if(hour >=0 && hour <9) return;

        updateWeather();
    },3600*1000);
}
```

#### 2.updateWeather方法：

```javascript
/**
 * 更新天气
 */
function updateWeather(){
    console.log("start update weather");
    //请求天气
    request.get(url+"?ak="+ak+"&output="+output+"&location="+encodeURI(location), function (error, response, body) {

        console.log("error:" + error +",response.statusCode:"+ JSON.stringify(response));
        
        //成功返回
        if (!error && response.statusCode == 200) {
            console.log("weather:" + body) // 
            
            //天气数据
            var data = JSON.parse(body);

            if(data.status != "success") return;

            weather = data.results[0];

            var today = weather.weather_data[0];
            var tomorrow = weather.weather_data[1];
            //分析天气
            var result = analyseWeather(today,tomorrow);

            console.log("analyse result:"+result);
            
            //发送天气提醒
            if(result) sendMessage(result + "。 具体天气：" + tomorrow.weather +"，" + tomorrow.wind + "，" + tomorrow.temperature);
        }
    });
}
```

  - 这里的网络请求使用了[request](https://github.com/request/request)模块。
  - 注意get请求参数有中文需要encodeURI();

  
#### 3.analyseWeather方法：

```javascript
/**
 * 分析天气
 * @param tomorrow
 */
function analyseWeather(today,tomorrow){
    var text = "明天";
    
    //下雨
    if(tomorrow.weather.indexOf("雨") != -1){
        text += "下雨 ";
    }

    //今天最大和最小温度
    var d0 = getMaxAndMinDegree(today);
    //明天最大和最小温度
    var d1 = getMaxAndMinDegree(tomorrow);

    //降温
    var sub = d0.min - d1.min;
    if ((sub) > 2) {
        text += "降温(" + sub + "℃)";
    }

    //升温
    sub = d1.max - d0.max;
    if ((sub) > 2) {
        text += "升温(" + sub + "℃)";
    }

    console.log("tomorrow weather:" + tomorrow.weather +", today degree" + JSON.stringify(d0)+", tomorrow degree" + JSON.stringify(d1))

    if(text == "明天") return null;

    return text;
}
```

#### 4.把autoUpdateWeather方法暴露出去：

```javascript

module.exports = {

    startWork:function(){
        //自动更新天气
        autoUpdateWeather();
    }
};

```

#### 5.在程序入口处调用该方法启动天气服务：

```javascript

var weather = require('./weather/weather');
weather.startWork();

```


---

### 部署服务器

1. push代码到git。
2. 连接阿里云，pull代码。执行`npm install`，`npm start`。


---


### 待完善功能

- 目前发送短信的手机号码是写死的，这样好像不是很优雅。准备把他放到数据库中，然后写一个页面可以增删改查（顺便学习一下MongoDB）。


---

### 最后说两句

- 200行代码就完成了，nodejs开发效率真是高。
- 来听歌：[It Never Rains in Southern California](http://music.163.com/#/song?id=16315132)










