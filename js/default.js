$(document).ready(function(){
	var mainPanelHeight = $('#main-panel').height();
	var introPanelHeight = $('#intro-panel').height();
	console.log("mainPanelHeight : " + mainPanelHeight + ", introPanelHeight : " + introPanelHeight);
	if(mainPanelHeight < introPanelHeight) {
		// adjust main-panel height to intro-panel height
		$('#main-panel').css("height", introPanelHeight);
	} else if(mainPanelHeight > introPanelHeight) {
		// adjust intro-panel height to main-panel height
		$('#intro-panel').css("height", mainPanelHeight);
	}
});