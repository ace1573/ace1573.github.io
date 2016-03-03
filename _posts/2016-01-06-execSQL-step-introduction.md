---
layout: post
category : kettle
tags : [java, kettle-basic]
title : Kettle[执行SQL脚本]组件简介
---
{% include JB/setup %}

# 执行SQL脚本组件简介

执行SQL脚本(ExecSQL)，是Kettle转换里面的一个组件，可以用来执行一些特定的SQL脚本。

![show_execSQL_config_windows]({{ site.url }}/assets/image/execSQL-step-introduction/show_execSQL_config_windows.png)

如果勾选了"执行每一行?"，对于前面步骤的每一行输入都将执行一次SQL脚本。勾选"变量替换"可以使用前一个步骤的字段来作为动态参数设置到SQL脚本中的"?"占位符。

# 使用注意事项

如果没有勾选"执行每一行?"选项，表示这个SQL脚本将在转换初始化的时候就执行，而不是在转换流程处理过程中才执行。验证方式可以采用以下转换:

![show_blocking_until_finish_with_execSQL]({{ site.url }}/assets/image/execSQL-step-introduction/show_blocking_util_finish_with_execSQL.png)

看似【执行SQL脚本】步骤会在【阻塞数据直到步骤完成】之后才开始执行，但是实际上在整个转换开始跑起来，【执行SQL脚本】步骤就已经开始执行并快速结束了。

**【扩展】** 这个转换例子同时证明了即使是使用了【阻塞数据直到步骤完成】，也不能完全保证后面的步骤会等待其设定的步骤完成才开始执行。只有当【阻塞数据直到步骤完成】后面的步骤要使用前面被阻塞步骤的数据，即后面的步骤在`processRow`方法里会调用到`getRow`方法从前面步骤取数据，才能保证后面的步骤会等待前面步骤完成才开始处理数据(原理是`getRow`方法阻塞在等待前面步骤输出数据)。

**【分析】**

通过阅读【执行SQL脚本】组件的源码主类`ExecSQL`发现，对于没有勾选"执行每一行?"选项的sql脚本的执行是在`init`方法里面完成的。

	public boolean init( StepMetaInterface smi, StepDataInterface sdi ) {
	    meta = (ExecSQLMeta) smi;
	    data = (ExecSQLData) sdi;
	
	    if ( super.init( smi, sdi ) ) {
	      if ( meta.getDatabaseMeta() == null ) {
	        logError( BaseMessages.getString( PKG, "ExecSQL.Init.ConnectionMissing", getStepname() ) );
	        return false;
	      }
	      data.db = new Database( this, meta.getDatabaseMeta() );
	      data.db.shareVariablesWith( this );
	
	      // Connect to the database
	      try {
	        if ( getTransMeta().isUsingUniqueConnections() ) {
	          synchronized ( getTrans() ) {
	            data.db.connect( getTrans().getTransactionId(), getPartitionID() );
	          }
	        } else {
	          data.db.connect( getPartitionID() );
	        }
	
	        if ( log.isDetailed() ) {
	          logDetailed( BaseMessages.getString( PKG, "ExecSQL.Log.ConnectedToDB" ) );
	        }
	
	        if ( meta.isReplaceVariables() ) {
	          data.sql = environmentSubstitute( meta.getSql() );
	        } else {
	          data.sql = meta.getSql();
	        }
	        // If the SQL needs to be executed once, this is a starting step
	        // somewhere.
	        if ( !meta.isExecutedEachInputRow() ) {
	          if ( meta.isSingleStatement() ) {
	            data.result = data.db.execStatement( data.sql );
	          } else {
	            data.result = data.db.execStatements( data.sql );
	          }
	          if ( !data.db.isAutoCommit() ) {
	            data.db.commit();
	          }
	        }
	        return true;
	      } catch ( KettleException e ) {
	        logError( BaseMessages.getString( PKG, "ExecSQL.Log.ErrorOccurred" ) + e.getMessage() );
	        setErrors( 1 );
	        stopAll();
	      }
	    }
	
	    return false;
	  }

只有当转换里面的所有步骤都完成了`init`方法的调用以后，步骤才真正的开始处理数据。因此，通常情况下，【执行SQL脚本】步骤都是在一个转换中最先被执行的。

**【注意】** 从以上现象也证实了Kettle的转换是不能控制流程的，因为所有转换里面的步骤都是一个单独的线程并且并发执行的。这一点要切记，否则很可能设计出错误的转换。