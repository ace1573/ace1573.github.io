---
layout: post
category : kettle
tags : [java, kettle-advanced]
title : Kettle 转换执行流程分析
---
{% include JB/setup %}

## 1. Kettle转换执行流程

Kettle转换执行流程体现在Trans类的execute()方法，代码如下所示：

```java
public void execute( String[] arguments ) throws KettleException {
    prepareExecution( arguments );
    startThreads();
}
```

### 1.1 prepareExecution流程分析

prepareExecution方法完成的主要工作是:

 - 设置转换参数、变量
 - 处理步骤之间数据传递是分发还是复制
 - 初始化设置转换日志表、步骤日志表、性能记录表、添加一系列TransListener
 - 构造StepMetaDataCombi对象集合，该对象负责传递Step,StepMeta以及StepData对象给RunThread
 - 调用每个Step的init方法进行步骤初始化,确保所有Step的初始化都顺利进行,出错就提前结束所有步骤
 - 步骤监控的初始化


### 1.2 startThreads流程分析
startThreads方法完成的主要工作是:

 - TransListener和StepListener构造
 - 当listener准备好之后就根据转换类型启动线程跑转换里的步骤，通过构造RunThread对象来执行步骤
 - 当所有步骤完成会触发StepListener的stepFinished方法里面的fireTransFinishedListeners()，通知转换，步骤已经全部执行结束,转换可以结束了,设置相关参数并清理现场


核心StepListener构造片段代码如下所示:

```java
StepListener stepListener = new StepListener() {

.....

public void stepFinished( Trans trans, StepMeta stepMeta, StepInterface step ) {
  synchronized ( Trans.this ) {
    nrOfFinishedSteps++;

    if ( nrOfFinishedSteps >= steps.size() ) {
      // Set the finished flag
      //
      setFinished( true );

      // Grab the performance statistics one last time (if enabled)
      //
      addStepPerformanceSnapShot();

      try {
	fireTransFinishedListeners();
      } catch ( Exception e ) {
	step.setErrors( step.getErrors() + 1L );
	log.logError( getName()
	  + " : " + BaseMessages.getString( PKG, "Trans.Log.UnexpectedErrorAtTransformationEnd" ), e );
      }
    }

    // If a step fails with an error, we want to kill/stop the others
    // too...
    //
    if ( step.getErrors() > 0 ) {

      log.logMinimal( BaseMessages.getString( PKG, "Trans.Log.TransformationDetectedErrors" ) );
      log.logMinimal( BaseMessages.getString(
	PKG, "Trans.Log.TransformationIsKillingTheOtherSteps" ) );

      killAllNoWait();
    }
  }
}
};
// Make sure this is called first!
//
if ( sid.step instanceof BaseStep ) {
( (BaseStep) sid.step ).getStepListeners().add( 0, stepListener );
} else {
sid.step.addStepListener( stepListener );
}
```

fireTransFinishedListeners方法代码如下所示:

```java
/**
   * Make attempt to fire all registered listeners if possible.
   *
   * @throws KettleException
   *           if any errors occur during notification
   */
protected void fireTransFinishedListeners() throws KettleException {
    // PDI-5229 sync added
    synchronized ( transListeners ) {
      if ( transListeners.size() == 0 ) {
	return;
      }
      //prevent Exception from one listener to block others execution
      List<KettleException> badGuys = new ArrayList<KettleException>( transListeners.size() );
      for ( TransListener transListener : transListeners ) {
	try {
	  transListener.transFinished( this );
	} catch ( KettleException e ) {
	  badGuys.add( e );
	}
      }
      // Signal for the the waitUntilFinished blocker...
      transFinishedBlockingQueue.add( new Object() );
      if ( !badGuys.isEmpty() ) {
	//FIFO
	throw new KettleException( badGuys.get( 0 ) );
      }
    }
}
```

fireTransFinishedListeners方法负责通知所有的TransListener转换已经结束，通过调用

```java
transListener.transFinished(this)
```

来完成通知。这个方法还负责解除waitUntilFinished方法调用的阻塞状态。waitUntilFinished方法在execute方法执行后调用可以等待转换结束或者出错才返回。这是因为该方法利用了一个阻塞队列(BlockingQueue)transFinishedBlockingQueue的poll方法来进行阻塞，而只有当上面讲到的fireTransFinishedListeners方法触发了，才会执行

```java
// Signal for the the waitUntilFinished blocker...
transFinishedBlockingQueue.add( new Object() );
```java

来解除阻塞队列的阻塞状态。

### 1.3 RunThread.run()流程分析

一般情况下转换里的每个步骤隔离到单独的线程执行，步骤执行的逻辑代码表现在类RunThread(实现了Runnable接口)的run方法里面，核心逻辑很简单，调用step的processRow方法直到没有输入数据要处理表示该步骤已经结束，结束的时候会调用step.dispose清理现场资源，最后调用step.markStop（）标记步骤已经停止，在markStop方法里面会回调所有StepListener的stepFinished方法(实现在BaseStep类里面)，因此在Trans类的startThreads方法里面构造的核心StepListener方法将被调用。

RunThread的run方法代码如下所示：

```java
public void run() {
    try {
      step.setRunning( true );
      step.getLogChannel().snap( Metrics.METRIC_STEP_EXECUTION_START );

      if ( log.isDetailed() ) {
	log.logDetailed( BaseMessages.getString( "System.Log.StartingToRun" ) );
      }

      // Wait
      while ( step.processRow( meta, data ) ) {
	if ( step.isStopped() ) {
	  break;
	}
      }
    } catch ( Throwable t ) {
      try {
	// check for OOME
	if ( t instanceof OutOfMemoryError ) {
	  // Handle this different with as less overhead as possible to get an error message in the log.
	  // Otherwise it crashes likely with another OOME in Me$$ages.getString() and does not log
	  // nor call the setErrors() and stopAll() below.
	  log.logError( "UnexpectedError: ", t );
	} else {
	  t.printStackTrace();
	  log.logError( BaseMessages.getString( "System.Log.UnexpectedError" ), t );
	}

	String logChannelId = log.getLogChannelId();
	LoggingObjectInterface loggingObject = LoggingRegistry.getInstance().getLoggingObject( logChannelId );
	String parentLogChannelId = loggingObject.getParent().getLogChannelId();
	List<String> logChannelChildren = LoggingRegistry.getInstance().getLogChannelChildren( parentLogChannelId );
	int childIndex = Const.indexOfString( log.getLogChannelId(), logChannelChildren );
	System.out.println( "child index = "
	  + childIndex + ", logging object : " + loggingObject.toString() + " parent=" + parentLogChannelId );
	KettleLogStore.getAppender().getBuffer( "2bcc6b3f-c660-4a8b-8b17-89e8cbd5b29b", false );
	// baseStep.logError(Const.getStackTracker(t));
      } catch ( OutOfMemoryError e ) {
	e.printStackTrace();
      } finally {
	step.setErrors( 1 );
	step.stopAll();
      }
    } finally {
      step.dispose( meta, data );
      step.getLogChannel().snap( Metrics.METRIC_STEP_EXECUTION_STOP );
      try {
	long li = step.getLinesInput();
	long lo = step.getLinesOutput();
	long lr = step.getLinesRead();
	long lw = step.getLinesWritten();
	long lu = step.getLinesUpdated();
	long lj = step.getLinesRejected();
	long e = step.getErrors();
	if ( li > 0 || lo > 0 || lr > 0 || lw > 0 || lu > 0 || lj > 0 || e > 0 ) {
	  log.logBasic( BaseMessages.getString( PKG, "BaseStep.Log.SummaryInfo", String.valueOf( li ),
	    String.valueOf( lo ), String.valueOf( lr ), String.valueOf( lw ),
	    String.valueOf( lu ), String.valueOf( e + lj ) ) );
	} else {
	  log.logDetailed( BaseMessages.getString( PKG, "BaseStep.Log.SummaryInfo", String.valueOf( li ),
	    String.valueOf( lo ), String.valueOf( lr ), String.valueOf( lw ),
	    String.valueOf( lu ), String.valueOf( e + lj ) ) );
	}
      } catch ( Throwable t ) {
	//
	// it's likely an OOME, so we don't want to introduce overhead by using BaseMessages.getString(), see above
	//
	log.logError( "UnexpectedError: " + Const.getStackTracker( t ) );
      } finally {
	step.markStop();
      }
    }
}
```