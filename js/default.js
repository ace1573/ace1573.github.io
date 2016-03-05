$(document).ready(function(){
	// ....
	
	var contentWidth = $('.post-full .content').width();
	console.info('contentWidth = ' + contentWidth);
	$('.post-full .content img').each(function() {
		var imgWidth = $(this).width();
		console.info($(this).attr('src') + ', img width = ' + imgWidth);
		if(imgWidth > contentWidth || imgWidth == 0) {
			$(this).css({
				'width': '100%',
				'height': '100%'
			});
		}
	});
	
});

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