
var entries = null;
$(document).ready(function(){
	// ....

	addFancyBoxToContentImg();
	adjustImg2();

	$('#search-form').submit(function() {
		var query = $('#query').val();
		$('#query').blur().attr('disabled', true);
		$('#main-content').hide();
		// $('#loader').show();
		if (entries == null) {
		  $.ajax({url: '/atom.xml?r=' + (Math.random() * 99999999999), dataType: 'xml', success: function(data) {
			entries = data.getElementsByTagName('entry');
			findEntries(query);
		  }});
		} else {
		  findEntries(query);
		}
		$('#query').blur().attr('disabled', false);
		return false;
  });


});

var findEntries = function(q) {
	var matches = [];
    var rq = new RegExp(q, 'im');
    // var rl = /\/([^\/]+)\$/;
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var title = $(entry).find('title').text();
      var link = $(entry).find('link').attr('href');
      // var title_en = rl.exec(link)[1].replace('-', ' ');
      var content = $(entry).find('content').text();          
      if (rq.test(title) || rq.test(content)) {
		var parts = $(entry).find('updated').text().split(/[-T:+]/g);
		/*var monthNames = [ "January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December" ];*/
        var updated = parts[0] + '-' + parts[1] + '-' + parts[2];
        matches.push({'title': title, 'link': link, 'date': updated, 'content': content});
      }
    }
    var html = '';
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i]; 

      html += '<div id="article" class="well">';
	  html += '<div id="article-header">';
	  html += '<h3><a href="' + match.link + '">' + match.title + '</a></h3>';
	  html += '</div>';
	  html += '<div id="content">';
	  html += '<p class="text-indent">';
	  html += match.content;
	  html += '</p>';
	  html += '</div>';
	  html += '<div id="article-footer">';
	  html += '<p class="text-right">发布日期:' + match.date + '</p>';
	  html += '</div>';
	  html += '</div>';


    }
    $('#main-content').html(html);
    $('#main-content').show();		
};

var addFancyBoxToContentImg = function() {
	$('.post-full .content img').each(function() {
		var imgSrc = $(this).attr('src');
		$(this).wrap('<a class="fancybox" href="' + imgSrc + '"></a>');
	});
	$('.fancybox').fancybox({
		helpers: {
			overlay: {
				locked: false
			}
		}
	});
};

var adjustImg2 = function() {
	$('.post-full .content img').each(function() {
		$(this).css({
			'max-width': '100%',
			'display': 'block'
		});
	});
};

var adjustImg = function() {
	var contentWidth = $('.post-full .content').width();
	// console.info('contentWidth = ' + contentWidth);
	$('.post-full .content img').each(function() {
		var imgWidth = $(this).width();
		// console.info($(this).attr('src') + ', img width = ' + imgWidth);
		if(imgWidth > contentWidth || imgWidth == 0) {
			$(this).css({
				'width': '100%',
				'height': '100%'
			});
		}
	});
};

var showEmail = function() {
	// alert('showEmail is called');
	var myModalBody = $('#myModalBody');
	var content = '<p>我的邮箱 : 18825111236@163.com</p>';
	myModalBody.html(content);
	$('#myModal').modal({
		show: true
	});
};

var showWeixin2DCode = function() {
	// alert('showWeixin2DCode is called');
	var myModalBody = $('#myModalBody');
	var content = '<img src="/img/weixin_erweima.jpg" width="50%" height="50%" />';
	myModalBody.html(content);
	$('#myModal').modal({
		show: true
	});
};

var showQQ2DCode = function() {
	// alert('showQQ2DCode is called');
	var myModalBody = $('#myModalBody');
	var content = '<img src="/img/qq_erweima.jpg" width="50%" height="50%" />';
	myModalBody.html(content);
	$('#myModal').modal({
		show: true
	});
};