// addEventListener support for IE8
function bindEvent(elem, evt, func) {
	if (elem.addEventListener){
		elem.addEventListener(evt, func, false);
	} else if (element.attachEvent) {
		elem.attachEvent('on' + evt, func);
	}
}

// Send a message to the parent iframe
var sendMessage = function(msg) {
	// Make sure you are sending a string, and to stringify JSON
	window.parent.postMessage(msg, '*');
	// window.parent is intended for iframed content, the parent would communicate with iframe like this =>
	// document.getElementById('ifr').contentWindow.postMessage(msg, '*');
};

// Listen to message from parent
bindEvent(window, 'message', function (e) {
	if(e.data=='last'){
		isLast=true;
	} else if (e.data=='carcasa'){
		descastado=false;
	}
});

$(document).ready(function(){
	try {sendMessage('info')} catch (err) {};
});