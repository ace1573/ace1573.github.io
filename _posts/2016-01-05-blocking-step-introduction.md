---
layout: post
category : kettle
tags : [java, kettle-basic]
title : Kettle[阻塞数据]组件简介
---
{% include JB/setup %}

## 阻塞数据组件简介
阻塞数据，BlockingStep，可以用来阻塞前一个步骤的输入，直到前一个步骤的输入完全结束(即没有数据了)。对于前一个步骤的输入，可以选择"只输出最后一行"或者"输出全部行"到下一个步骤。这取决于在【阻塞数据】配置界面是否勾选了"Pass all rows"。

## 阻塞数据组件内部原理
(1) 如果没有勾选"Pass all rows"，即表示只输出最后一行数据，那么在`processRow`函数里面就会一直将当前行保存到`lastRow`（存储最后一行的变量）变量里面，等到`processRow`遇到`r == null`表示已经没有输入，即把`lastRow`经过`putRow`输出到步骤输出中。

(2) 如果勾选了"Pass all rows"，即表示要将前一个步骤的所有输入都输出到下一个步骤，那么`processRow`函数里对于每一行记录r都通过`addBuffer`保存到一个临时的内存缓冲区里面，当这个缓冲区满了(取决于在界面配置的【缓存大小(在内存里的行)】选项)，需要临时保存到磁盘的某个临时目录(取决于在界面配置的【临时文件目录】以及【临时文件前缀】),直到所有的输入处理结束，再将保存的所有数据(包括磁盘上的临时数据)通过`getBuffer`取出并一行一行地输出到下一个步骤。

BlockingStep `processRow` 函数代码如下:

	public boolean processRow( StepMetaInterface smi, StepDataInterface sdi ) throws KettleException {

	    boolean err = true;
	    Object[] r = getRow(); // Get row from input rowset & set row busy!
	
	    // initialize
	    if ( first && r != null ) {
	      first = false;
	      data.outputRowMeta = getInputRowMeta().clone();
	    }
	
	    if ( !meta.isPassAllRows() ) {
	      if ( r == null ) {
	        // no more input to be expected...
	        if ( lastRow != null ) {
	          putRow( data.outputRowMeta, lastRow );
	        }
	        setOutputDone();
	        return false;
	      }
	
	      lastRow = r;
	      return true;
	    } else {
	      // The mode in which we pass all rows to the output.
	      err = addBuffer( getInputRowMeta(), r );
	      if ( !err ) {
	        setOutputDone(); // signal receiver we're finished.
	        return false;
	      }

	      if ( r == null ) {
	        // no more input to be expected...
	        // Now we can start the output!
	        r = getBuffer();
	        while ( r != null && !isStopped() ) {
	          if ( log.isRowLevel() ) {
	            logRowlevel( "Read row: " + getInputRowMeta().getString( r ) );
	          }
	
	          putRow( data.outputRowMeta, r ); // copy row to possible alternate rowset(s).
	
	          r = getBuffer();
	        }
	
	        setOutputDone(); // signal receiver we're finished.
	        return false;
	      }

      		return true;
    	}
    }

## 使用注意
 - 对于大量输入如果采用"Pass all rows"会造成大量磁盘读写io，严重影响性能，所以大量输入谨慎使用该组件。
 - 对于大量输入如果采用"Pass all rows"并且采用"压缩临时文件"，优势在于节省磁盘空间，但是压缩存储及解压缩读取通常会消耗更多的时间，即该组件的性能会受到压缩及解压缩的影响。
