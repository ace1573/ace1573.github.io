---
layout: post
category : kettle
tags : [java, kettle-basic]
title : Kettle Carte简介
---
{% include JB/setup %}

## 1. Carte简介

Carte是Kettle内置的一个小型web服务端程序，使用Jetty作为web容器，提供http服务让客户端机器调用(Servlet方式实现)，它可以被用来远程执行转换、作业以及组成Kettle集群。

## 2. Carte部署配置

### 2.1 启动方法

Windows操作系统使用Carte.bat来启动Carte服务，Linux操作系统则使用carte.sh来启动Carte服务。启动文件均位于Kettle安装包目录下。

### 2.2 启动配置

当运行Carte.bat或者carte.sh，默认不带参数会输出其正确的使用示例，如下所示:

```bash
....
Usage: Carte [Interface address] [Port]

Example: Carte 127.0.0.1 8080
Example: Carte 192.168.1.221 8081

Example: Carte /foo/bar/carte-config.xml
Example: Carte http://www.example.com/carte-config.xml
```

Carte的启动配置有两种方式，以Windows操作系统为例，分别是:

```bash
Carte.bat [ip] [port]

or

Carte.bat [xml_cfg_file]
```

第一种方式使用两个配置参数 ip 和 port 来启动Carte，这种方式适用于测试环境。第二种方式通过指定配置文件 `xml_cfg_file` 来启动Carte，所有的配置项都存放在配置文件中，这种方式适用于生产环境。

**【注意】** 

(1) 若要使用Carte部署集群必须采用第二种方式。

(2) 切记绑定的ip如果使用localhost,内网中其他机器也无法访问你的Carte服务，所以建议绑定Carte的ip不要设置为localhost。

(3) 配置文件路径可以采用绝对路径或者相对路径，相对路径eg:

```bash
Carte.bat ./pwd/carte-config-8081.xml
```

例子中配置文件使用是相对于Kettle的安装目录的子目录pwd里面的carte-config-8081.xml。

### 2.3 Carte xml文件配置详解

Carte的xml配置文件内容示例:

```xml
<slave_config>
  <slaveserver>
    <name>Slave01</name>
    <hostname>localhost</hostname>
    <port>9081</port>
	<master>N</master>
  </slaveserver>

  <masters>
    <slaveserver>
      <name>master1</name>
      <hostname>localhost</hostname>
      <port>9080</port>
      <!--<webAppName>pentaho-di</webAppName>-->
      <username>admin</username>
      <password>password</password>
      <master>Y</master>
    </slaveserver>
  </masters>

  <report_to_masters>Y</report_to_masters>

  <max_log_lines>10000</max_log_lines>
  <max_log_timeout_minutes>1440</max_log_timeout_minutes>
  <object_timeout_minutes>1440</object_timeout_minutes>
</slave_config>
```

可见所有的配置项都包含在 `<slave_config>` 节点里。 下面简要介绍各个xml配置节点的使用:

#### 2.3.1 slaveserver节点

`<slaveserver>` 节点配置本台Carte Server的相关配置，包括命名`<name>`、绑定的IP地址`<hostname>`、绑定的端口`<port>`以及是否该Carte Server要充当某个集群的master(`<master>` Y=true and N=false)。

#### 2.3.2 masters节点

`masters` 节点不是必选的，当配置Carte加入集群的时候才需要配置。集群的概念将在后面章节说明。每一个 `master` 节点对应一个Carte master server。 `<name>` 指定master名称；`<hostname>` 指定master的IP地址；`<port>` 指定master的端口；`<username>` 和 `<password>` 分别是master的登陆用户和密码；被指派为master的Carte必须指定 `<master>` 为Y。

#### 2.3.3 report\_to\_masters节点

如果要配置成动态集群，必须指定 `<report_to_masters>` 为 Y，才能让master感知到slave的接入。关于动态集群的概念请参考后面章节内容。

#### 2.3.4 max\_log\_lines节点

指定Carte中每个已经运行的转换或者作业的日志在内存中能够保存的最大行数。

#### 2.3.5 max\_log\_timeout\_minutes节点

指定Carte中每个已经运行的转换或作业生成的日志在内存中保留的时间，单位为分钟。超过指定时间的日志记录将被清除掉，防止Carte占用过多的内存空间。

**【注意】** 建议生产环境适当地配置该值。对于使用频繁的Carte服务适当降低该值，防止Carte服务运行一段时间后占用的内存越来越多，避免出现OOM。

#### 2.3.6 object\_timeout\_minutes节点

指定Carte中每个存在的转换或者作业对象在内存中保留的时间，单位为分钟。超过指定时间的这些对象将被清除，从而被Java GC回收，防止Carte占用过多的内存空间。

**【注意】** 建议生产环境适当地配置该值，以便Java GC能够回收多余的对象占用空间，减少系统内存使用。防止OOM。

#### 2.3.7 (*) repository节点

示例:

```xml
<repository>
  <name>Repository Name (id)</name>
  <username>username</username>
  <password>password</password>
</repository>
```

这个配置在Kettle5+版本才支持，配置该选项以便Carte能够连接到资源库，执行资源库里面的转换或者作业。请求的Servlet为 `runJob` 和 `runTrans`，使用示例如下:

(1) runJob

	http://hostname:port/kettle/runJob/?job=/path/to/jobname&level=DebugLevel&ParameterName=ParameterValue*

(2) runTrans

	http://hostname:port/kettle/runTrans/?trans=/path/to/transname&level=DebugLevel&ParameterName=ParameterValue*


## 3. Carte集群

Kettle使用Carte来部署集群，Kettle集群概念有两个，普通集群和动态集群，集群的使用需要在Spoon界面中配置。集群中有两个角色，master和slave,不管是普通集群还是动态集群，master只能有一个。

### 3.1 普通集群

普通集群在使用前就要确定哪几台Carte服务来组成一个集群，并且通过指定其中一台Carte服务为master。

### 3.2 动态集群

而动态集群，只要指定一台Carte作为master,其他Carte slave server不需要指定，而是通过在Carte启动时的配置文件参数 `<report_to_masters>` 来指定这台Carte要接入哪些集群。因为其规模可以动态扩展或者缩小，所以称为动态集群。动态集群更加迎合当前云计算动态利用计算资源的概念。

**【注意】** 如果一个作业的某个转换步骤指定在一个动态集群里面运行，那么当运行过程中集群再增加一台Carte服务，运行中的转换步骤也不用使用其计算资源，而如果当运行过程中集群某台正在参与转换步骤计算的Carte服务被意外停止，将会造成这个作业运行失败。


