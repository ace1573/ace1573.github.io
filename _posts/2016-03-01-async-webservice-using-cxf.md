---
layout: post
category : webservice
tags : [webservice,cxf]
title : CXF异步WebService发布和调用
---
{% include JB/setup %}

最近工作需要接触CXF异步webservice的发布和调用，在网上Google并捣鼓了好一阵子，总算成功了。毕竟这方面的资料比较少，自己总结一下写下这篇博文。本文将描述如何利用CXF来发布和调用异步的webservice，通过一个示例，带大家一步一步开发基于CXF的异步webservice及客户端调用程序。

**【参考】**

 - [asynchronous-web-service-using-cxf](http://www.javatips.net/blog/2014/03/asynchronous-web-service-using-cxf)
 - [cxf-asynchronous-client](http://www.javatips.net/blog/2014/03/cxf-asynchronous-client)
 - [apache cxf docs](http://cxf.apache.org/docs/overview.html)


## 1.异步webservice简介

异步webservice可以让客户端调用线程在调用webservice的时候不必阻塞等待服务端返回结果，在调用请求后快速返回，然后做其他想做的事情。

### 1.1 客户端异步调用方式

**(1) Callback**

客户端通过实现`javax.xml.ws.AsyncHandler`,从而让服务端在做完操作后回调AsyncHandler的handleResponse方法进行异步处理。

**(2) Polling**

客户端拿到`javax.xml.ws.Response`类型的返回结果，然后不断轮询Response的isDone方法来判断是否调用已经完成。

### 1.2 服务端异步调用的实现

CXF提供了两种方法来响应客户端的异步webservice请求，包括:

**(1) Continuations**

CXF提供了API供开发者来创建并使用**Continuation**,关于continuation的详细介绍请查看以下链接:

[http://sberyozkin.blogspot.com/2008/12/continuations-in-cxf.html](http://sberyozkin.blogspot.com/2008/12/continuations-in-cxf.html)

**(2) @UseAsyncMethod annotation**
 
通过`@UseAsyncMethod`注解同步方法，让同步方法在满足异步调用条件下调用其对应的异步方法


	@UseAsyncMethod
	public String sayHello(String username) {
		return "hello " + username;
	}

	public Future<String> sayHelloAsync(String username, 	AsyncHandler<String> asyncHandler) {
		// ...
		return null;
	}

	public Response<String> sayHelloAsync(String username) {
		// ...
		return null;
	}


如上所示,sayHello方法注解了@UseAsyncMethod,如果web容器支持异步调用，将会调用其对应的sayHelloAsync方法,如果不支持异步调用，那么将会调用同步的sayHello方法。

**【注意】**

CXF依赖于Web容器来发布webservice,必须确保Web容器支持异步机制才能使CXF发布的webservice成功处理来自客户端的异步请求。eg:通过Tomcat配置CXF发布webservice必须确保配置在web.xml的CXFServlet配置了**<async-supported>**为true

## 2. 示例

通过发布一个HelloService异步webservice以及开发HelloClient来向大家说明基于CXF如何开发和调用异步的webservice。示例代码可以在我的github拉取:[https://github.com/ZzzCrazyPig/CXFTutorial.git](https://github.com/ZzzCrazyPig/CXFTutorial.git)

### 2.1 环境说明

**【软件环境】**

 - JDK 6+
 - STS(Eclipse)
 - Tomcat7

**【依赖库】**

 - aopalliance-1.0.jar
 - asm-3.3.1.jar
 - commons-logging-1.1.1.jar
 - cxf-bundle-2.7.15.jar
 - httpasyncclient-4.0-beta3.jar
 - httpclient-4.2.5.jar
 - httpcore-4.2.4.jar
 - httpcore-nio-4.2.4.jar
 - neethi-3.0.3.jar
 - spring-aop-3.0.7.RELEASE.jar
 - spring-asm-3.0.7.RELEASE.jar
 - spring-beans-3.0.7.RELEASE.jar
 - spring-context-3.0.7.RELEASE.jar
 - spring-core-3.0.7.RELEASE.jar
 - spring-expression-3.0.7.RELEASE.jar
 - spring-web-3.0.7.RELEASE.jar
 - stax2-api-3.1.4.jar
 - woodstox-core-asl-4.4.1.jar
 - wsdl4j-1.6.3.jar
 - xmlschema-core-2.1.0.jar

### 2.2 开发webservice接口及实现类

#### 2.2.1 开发HelloService接口

{% highlight java %}
package com.hello;

import java.util.concurrent.Future;

import javax.jws.WebService;
import javax.xml.ws.AsyncHandler;
import javax.xml.ws.Response;
import javax.xml.ws.ResponseWrapper;

@WebService(name = "helloService")
public interface HelloService {
	
	@ResponseWrapper(localName = "sayHelloResponse", className = "java.lang.String")
	public String sayHello(String username);

	@ResponseWrapper(localName = "sayHelloResponse", className = "java.lang.String")
	public Future<String> sayHelloAsync(String username, AsyncHandler<String> asyncHandler);
	
	public Response<String> sayHelloAsync(String username);
	
}
{% endhighlight %}

#### 2.2.2 实现HelloServiceImpl

	package com.hello;
	
	import java.util.concurrent.Future;
	
	import javax.jws.WebService;
	import javax.xml.ws.AsyncHandler;
	import javax.xml.ws.Response;
	
	import org.apache.cxf.annotations.UseAsyncMethod;
	import org.apache.cxf.jaxws.ServerAsyncResponse;
	
	@WebService(endpointInterface="com.hello.HelloService")
	public class HelloServiceImpl implements HelloService {
	
		@Override
		@UseAsyncMethod
		public String sayHello(String username) {
			System.out.println("execute sayHello method");
			try {
	            Thread.sleep(5000);
	        } catch (InterruptedException e) {
	            e.printStackTrace();
	        }
			return "hello " + username;
		}
	
		@Override
		public Future<String> sayHelloAsync(String username,
				AsyncHandler<String> asyncHandler) {
			System.out.println("execute sayHelloAsync method");
			final ServerAsyncResponse<String> asyncResponse = new ServerAsyncResponse<String>();
	        new Thread() {
	            public void run() {
	                String result = sayHello(username);
	                asyncResponse.set(result);
	                System.out.println("Responding on background thread\n");
	                asyncHandler.handleResponse(asyncResponse);
	            }
	        }.start();
	
	        return asyncResponse;
		}
	
		@Override
		public Response<String> sayHelloAsync(String username) {
			// TODO Auto-generated method stub
			return null;
		}
	
	}

### 2.3 发布webservice

#### 2.3.1 配置cxf.xml

通过Spring配置CXF发布webservice的端口及地址

	<?xml version="1.0" encoding="UTF-8"?>
	<beans xmlns="http://www.springframework.org/schema/beans"
	    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:jaxws="http://cxf.apache.org/jaxws"
	    xsi:schemaLocation="
	http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd
	http://cxf.apache.org/jaxws http://cxf.apache.org/schemas/jaxws.xsd">
	
		<jaxws:endpoint id="helloService" implementor="com.hello.HelloServiceImpl" address="/helloService"></jaxws:endpoint>
	
	</beans>

**【注意】** cxf.xml文件放置在/WEB-INF/目录下，即与web.xml处于同个目录

#### 2.3.2 配置web.xml

在web.xml里面配置CXFServlet来发布webservice

	<?xml version="1.0" encoding="UTF-8"?>
	<web-app xmlns="http://java.sun.com/xml/ns/javaee" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
	version="3.0" xsi:schemaLocation="http://java.sun.com/xml/ns/javaee           
	http://java.sun.com/xml/ns/javaee/web-app_3_0.xsd">
	    <context-param>
	        <param-name>contextConfigLocation</param-name>
	        <param-value>WEB-INF/cxf.xml</param-value>
	    </context-param>
	
	    <listener>
	        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
	    </listener>
	
	    <servlet>
	        <servlet-name>CXFServlet</servlet-name>
	        <servlet-class>org.apache.cxf.transport.servlet.CXFServlet</servlet-class>
	        <load-on-startup>1</load-on-startup>
	        <async-supported>true</async-supported>
	    </servlet>
	
	    <servlet-mapping>
	        <servlet-name>CXFServlet</servlet-name>
	        <url-pattern>/services/*</url-pattern>
	    </servlet-mapping>
	</web-app>

#### 2.3.3 使用Tomcat加载应用

完成以上步骤后通过Tomcat7加载应用，访问[http://localhost:8080/CXFTutorial/services](http://localhost:8080/CXFTutorial/services)可以看到CXF发布的webservice

<img src="{{ site.url }}/assets/image/async-webservice-using-cxf/show_cxf_publish_services.png" width="80%" />

### 2.4 开发webservice客户端调用

	package com.hello.client;
	
	import java.util.concurrent.Future;
	
	
	import org.apache.cxf.interceptor.LoggingInInterceptor;
	import org.apache.cxf.interceptor.LoggingOutInterceptor;
	import org.apache.cxf.jaxws.JaxWsProxyFactoryBean;
	
	import com.hello.HelloService;
	
	
	public final class HelloClient2 {
	
	    public static void main(String args[]) throws Exception {
	
	        JaxWsProxyFactoryBean factory = new JaxWsProxyFactoryBean();
	
	        factory.setServiceClass(HelloService.class);
	        factory.setAddress("http://192.168.16.52:8080/CXFTutorial/services/helloService?wsdl");
	        factory.getInInterceptors().add(new LoggingInInterceptor());
	        factory.getOutInterceptors().add(new LoggingOutInterceptor());
	        HelloService client = (HelloService) factory.create();
	
	       
	        // callback method
	        TestAsyncHandler testAsyncHandler = new TestAsyncHandler();
	        System.out.println("Invoking changeStudentAsync using callback object...");
	        Future<?> response = client.sayHelloAsync(
	                "CrazyPig", testAsyncHandler);
	        while (!response.isDone()) {
	            Thread.sleep(100);
	        }
	        
	        String resp = testAsyncHandler.getResponse();
	        System.out.println("Server responded through callback with: " + resp);
	
	        System.exit(0);
	    }
	}


通过实现了AsyncHandler接口的TestAsyncHandler来处理webservice响应结果，handleResponse方法会在服务端处理完结果后被调用，即所谓的回调机制。

使用response.isDone()来判断并休眠是为了防止main函数过快退出。实际上可以替换成你想做的其他事情。

当然，如果你需要根据webservice返回结果来进行你的下一步逻辑，也可以直接调用response.get()，这个方法会阻塞到调用结果成功返回。(实际上这样跟调用同步方法没什么区别了)

	package com.hello.client;
	
	import javax.xml.ws.AsyncHandler;
	import javax.xml.ws.Response;
	
	public class TestAsyncHandler implements AsyncHandler<String> {
	
	    private String reply;
	
	    public void handleResponse(Response<String> response) {
	        try {
	            System.out.println("handleResponse called");
	            reply = response.get();
	        } catch (Exception ex) {
	            ex.printStackTrace();
	        }
	    }
	
	    public String getResponse() {
	        return reply;
	    }
	
	}

