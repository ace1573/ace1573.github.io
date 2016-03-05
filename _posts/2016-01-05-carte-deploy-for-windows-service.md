---
layout: post
category : kettle
tags : [java, kettle-basic]
title : 将Carte部署为Windows服务
---
{% include JB/setup %}

## 1. 为何需要部署成Windows Service
如果以cmd命令行来启动Carte，如果开发者不小心将此命令行窗口给关闭了，那么Carte服务也会随之关闭。因此将Carte部署成Windows Service能够有效地防止开发者错误地将Carte服务给杀掉。配置成Windows服务形式能够让Carte开机自动启动。

## 2. 目标
将Carte部署成Windows Service，让Carte能够随着操作系统的启动而自动启动。
![show_carte_windows_service]({{ site.url }}/assets/image/carte-deploy-for-windows-service/show_carte_windows_service.png)

参考:[Carte as a Windows Service](http://wiki.pentaho.com/display/EAI/Carte+as+a+Windows+Service)

## 3. 部署步骤

### 3.1 下载YAJSW
AJSW是一个开源的Java服务包装(Java Service Wrapper)工具。YAJSW允许您把任何应用程序安装为window的服务或者作为一个Linux posix的守护进程进行监控。
将下载的压缩包解压到合适的目录下，并重命名为default，eg:将压缩包解压到D:\Pentaho\CarteService\default

### 3.2 配置wrapper.conf
将提供的wrapper.conf.pentaho_installer_notes拷贝到`<CarteServiceFolder>/conf`目录下并重命名为wrapper.conf，并对以下配置项进行配置：

(1) wrapper.working.dir

指定kettle根目录 

	wrapper.working.dir=D:/kettle5.3

(2) wrapper.java.app.jar

指定kettle启动jar

	wrapper.java.app.jar = .\\launcher\\pentaho-application-launcher-5.3.0.0-213.jar

【注意】 kettle4.x和5.x对应的jar命名是不一样的，根据具体版本的文件命名来配置

![show_kettle_lancher]({{ site.url }}/assets/image/carte-deploy-for-windows-service/show_kettle_launcher.png)

(3) wrapper.java.command

指定java.exe所在的目录

	wrapper.java.command = D:/Program Files/Java/jdk1.7.0_55_X64/bin/java.exe

(4) wrapper.app.parameter.3

指定Carte服务绑定的ip

	wrapper.app.parameter.3 = 192.168.31.33

(5) wrapper.app.parameter.4

指定Carte服务绑定的端口号

	wrapper.app.parameter.4 = 8081

(6) wrapper.java.additional.1

指定Carte服务所占用的最大内存

	wrapper.java.additional.1 = -Xmx512m

### 3.3 运行测试
双击运行`<CarteServiceFolder>\bat\runConsole.bat`，如果出现以下输出，证明配置成功并能够成功运行Carte

![show_runConsole_success]({{ site.url }}/assets/image/carte-deploy-for-windows-service/show_runConsole_success.png)

### 3.4 安装成Windows Service
在完成3.3测试之后退出命令行，双击运行`<CarteServiceFolder>\bat\installService.bat`，此时就已经将Carte安装成Windows Service了。

### 3.5 运行或者停止Carte
(1) 可以通过查找"Windows服务"来启动或者停止Carte服务

(2) 通过`net start [carte_name]` 或 `net stop [carte_name]`来启动或者停止Carte服务

## 4. 单机部署多Carte服务
可以通过配置不同的服务名和监听端口，在同一台机器上部署多个Carte服务，复制多份解压后的`<CarteServiceFolder>`在同一个目录下。

修改不同目录下的wrapper.conf让以下配置唯一：

【defulat wrapper.conf】

	wrapper.ntservice.name=pentaho_carte_8081
	wrapper.ntservice.displayname=Pentaho DI Carte Port With 8081
	wrapper.app.parameter.4=8081
	wrapper.tray = false

【carte_8082 wrapper.conf】

	wrapper.ntservice.name=pentaho_carte_8082
	wrapper.ntservice.displayname=Pentaho DI Carte Port With 8082
	wrapper.app.parameter.4=8082
	wrapper.tray = false

完成以上配置后按照3.3和3.4的步骤即可以在同一台机器上部署并运行多个Carte服务

## 5. 更详细的Carte启动配置
使用xml文件配置Carte的文档请参考：

[Carte XML配置](http://wiki.pentaho.com/display/EAI/Carte+Configuration)

使用yajsw配置carte启动使用xml配置文件的方法如下：

修改wrapper.conf如下所示：

	wrapper.app.parameter.1 = -main
	wrapper.app.parameter.2 = org.pentaho.di.www.Carte
	wrapper.app.parameter.3 = ./pwd/carte-config-8081.xml
	#wrapper.app.parameter.3 = 192.168.31.33
	#wrapper.app.parameter.4 = 8081

把原来的wrapper.app.parameter.4注释掉，其中wrapper.app.parameter.3改为具体的配置文件，如图中所示 ./pwd/carte-config-8081.xml 的绝对路径为 ${wrapper.working.dir}/pwd/carte-config-8081.xml

【注意】 其中wrapper.working.dir是另外一个需要配置的参数，这个参数的说明参考3.2节