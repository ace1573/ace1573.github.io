---
layout: post
category : kettle
tags : [java, kettle-advanced]
title : Kettle Environment.init方法流程分析
---
{% include JB/setup %}

## 1. KettleEnvironment.init()详解

在Kettle的客户端工具，如Spoon、Pan、Kitchen、Carte等的源码中，都会有如下调用：

	KettleEnvironment.init()

这篇文章主要从源码的层面分析这个方法具体干了些什么。

> kettle源码使用5.3版本。

### 1.1 KettleEnvironment.init()初始化流程分析

(1) 首先判断KettleClientEnvironment是否初始化，没初始化的话就调用

	KettleClientEnvironment.init()

进行初始化。该方法完成的动作主要是：
 
 - 创建.kettle文件夹及kettle.properties(不存在的话)
 - 读取kettle.properties的配置
 - 初始化KettleLogStore
 - 加载部分plugin，并在PluginRegistry中注册这些plugin

其中加载plugin的代码如下所示：

    // Load value meta data plugins
    // 
	PluginRegistry.addPluginType( LoggingPluginType.getInstance() );
    PluginRegistry.addPluginType( ValueMetaPluginType.getInstance() );
    PluginRegistry.addPluginType( DatabasePluginType.getInstance() );
    PluginRegistry.addPluginType( ExtensionPointPluginType.getInstance() );
    PluginRegistry.addPluginType( TwoWayPasswordEncoderPluginType.getInstance() );
    PluginRegistry.init( true );

(2) 判断是否需要初始化JDNI，如果需要就调用

	JndiUtil.initJNDI();

来初始化JNDI。

(3) 继续加载剩余的plugin，并在PluginRegistry中注册这些plugin,加载的plugin如下所示：


	// Register the native types and the plugins for the various plugin types...
    //
	PluginRegistry.addPluginType( RowDistributionPluginType.getInstance() );
    PluginRegistry.addPluginType( StepPluginType.getInstance() );
    PluginRegistry.addPluginType( PartitionerPluginType.getInstance() );
    PluginRegistry.addPluginType( JobEntryPluginType.getInstance() );
    PluginRegistry.addPluginType( LogTablePluginType.getInstance() );
    PluginRegistry.addPluginType( RepositoryPluginType.getInstance() );
    PluginRegistry.addPluginType( LifecyclePluginType.getInstance() );
    PluginRegistry.addPluginType( KettleLifecyclePluginType.getInstance() );
    PluginRegistry.addPluginType( ImportRulePluginType.getInstance() );
    PluginRegistry.addPluginType( CartePluginType.getInstance() );
    PluginRegistry.addPluginType( CompressionPluginType.getInstance() );
    PluginRegistry.addPluginType( AuthenticationProviderPluginType.getInstance() );
    PluginRegistry.addPluginType( AuthenticationConsumerPluginType.getInstance() );
    PluginRegistry.init();

(4) 初始化kettle变量，通过调用

	KettleVariablesList.init()

来初始化kettle-variables.xml里面的kettle变量。

(5) 初始化调用注册的KettleLifecyclePluginType插件类型的监听器，并将这些监听器注册到JVM关闭钩子上，这体现在方法**initLifecycleListeners()**里。

(6) 完成流程(1)至(5) 之后 KettleEnvironment就算初始化成功了。

### 1.2 PluginRegistry.init()流程分析
这个方法会间接调用该类的**init( boolean keepCache )**方法。主要作用是为了完成所有插件类的动态加载(加载到classpath)。

核心代码片段如下：
	
	for ( final PluginTypeInterface pluginType : pluginTypes ) {
      log.snap( Metrics.METRIC_PLUGIN_REGISTRY_PLUGIN_TYPE_REGISTRATION_START, pluginType.getName() );
      registry.registerType( pluginType );
      log.snap( Metrics.METRIC_PLUGIN_REGISTRY_PLUGIN_TYPE_REGISTRATION_STOP, pluginType.getName() );
	}

对于每一种插件类型PluginTypeInterface都需要调用：

	registry.registerType( pluginType )

在**registerType()**方法会调用

	pluginType.searchPlugins()

来寻找该类型插件的所有插件。

**Tip:**


> 在**PluginRegistry.init()**方法还会加载**KETTLE\_PLUGIN\_CLASSES**配置项中的插件，多个插件以逗号隔开。通常都是在开发debug模式才用这个配置项来加载需要测试的插件。

**searchPlugins()**方法默认会搜索3种类型的插件：
 
(1) 内置插件(registerNatives)

	registerNatives();

(2) 注解插件(registerPluginJars)

	registerPluginJars();

(3) xml配置的外置插件(registerXmlPlugins)

	registerXmlPlugins();


**eg:**

(1) **StepPluginType**的**registerNatives**方法会遍历加载kettle内置的`kettle-steps.xml`中所有的step组件，然后通过调用：

	registry.registerPlugin( pluginType, pluginInterface )

将组件注册到PluginRegistry。

(2) **registerPluginJars**方法会从以下文件夹加载jar包:

 - plugins/
 - ${user.dir}/${kettle.dir}/plugins/

如果jar包中含有该插件类型的注解来修饰一个插件类，那么该插件类将被注册到PluginRegistry。

(3) **registerXmlPlugins**方法会从特定文件夹下去加载plugin.xml文件:

 - plugins/steps/
 - ${user.dir}/${kettle.dir}/plugins/steps/

并从该文件中获取对应的插件并注册到PluginRegistry。


**Tip:**


> PluginRegistry维护一个HashMap来存放注册的组件(pluginMap)，其中key是每一种插件类型，value保存该插件类型的所有插件类集合(List)。

### 1.3 总结

(1) 在KettleEnvironment.init()方法里面主要实现了Kettle各种插件类型插件的动态加载以及注册到PluginRegistry。这个方法将所有插件动态加载到项目的classpath中，包括插件依赖的jar包。

(2) 如果开发kettle客户端程序，那么首要调用的方法肯定是**KettleEnvironment.init()**。