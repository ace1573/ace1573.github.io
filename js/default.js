$(document).ready(function(){
	// ....
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