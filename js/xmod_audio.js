/*! AudioPlayer 1.0
* 
* Pescados Software */

/*
AudioPlayer

Methods: playAudio, stopAudio
Events: audioEnd

audioEnd => data {obj:jqueryObj} // 

Examples:
var dropComplex = new DropComplex([$(foo), $(bar)], {areas:[$(a),$(b)],placeholders:[[$(a1),$(a2)],[$(b1),$(b2)]]}, ["B","AA"], "AABBCD");
dropComplex.addEventListener("startMove",startMove);
dropComplex.addEventListener("endMove",endMove);
dropComplex.addEventListener("finished",finished);
function startMove(evt){
	window.alert(evt.type + ': ' + $(evt.data.obj) + ' start move!')
}
function endMove(evt){
	window.alert(evt.type + ': ' + $(evt.data.obj) + ' ended moving and it was ' + evt.data.ok)
}
function finished(){
	dropComplex.removeEventListener("*")
	
	// which is the same than
	// dropComplex.removeEventListener("startMove",startMove);
	// dropComplex.removeEventListener("endMove",endMove);
	// dropComplex.removeEventListener("finished",finished);

	window.alert('No more moves, all is OK!')
}

*/

function AudioPlayer(){
	this.queue = new Array();
	this.suspend=false;
	// start EventDispatcher (reqs main.js)
	EventDispatcher.call(this);
	/* we inherit
	this.addEventListener(event, callback, caller)
	this.removeEventListener(event, callback)
	this.dispatchEvent(event, data)
	*/
}


AudioPlayer.prototype = new EventDispatcher();
AudioPlayer.prototype.playAudio = function (id){
	var pU = $.proxy(this.timeUpdated,this);
	var pE = $.proxy(this.audioEnded,this);
	
	this.stopAudio(id);
	document.getElementById(id).play();
	document.getElementById(id).removeEventListener('timeupdate',pU);
	document.getElementById(id).removeEventListener('ended',pE);
	if(this.hasEventListener("progress")) document.getElementById(id).addEventListener('timeupdate', pU, false);
	document.getElementById(id).addEventListener('ended', pE, false);
};
AudioPlayer.prototype.audioEnded = function (e){
	var id = e.target.getAttribute('id');
	document.getElementById(id).removeEventListener('ended', this.audioEnded, false);
	document.getElementById(id).removeEventListener('timeupdate', this.timeUpdated, false);
	if(!this.suspend)this.dispatchEvent("audioEnd", {id:id})
};
AudioPlayer.prototype.timeUpdated = function (e){
	if(!this.suspend)this.dispatchEvent("progress", {id:e.target.getAttribute('id'),duration:e.target.duration,currentTime:e.target.currentTime})
};

AudioPlayer.prototype.pauseAudio = function (id){
	//document.getElementById(id).removeEventListener('timeupdate', this.timeUpdated, false);
	document.getElementById(id).pause();
};
AudioPlayer.prototype.resumeAudio = function (id){
	if(this.hasEventListener("progress")) {
		var pU = $.proxy(this.timeUpdated,this);
		var pE = $.proxy(this.audioEnded,this);
		document.getElementById(id).removeEventListener('timeupdate',pU);
		document.getElementById(id).removeEventListener('ended',pE);
		document.getElementById(id).addEventListener('timeupdate', pU, false);
		document.getElementById(id).addEventListener('ended', pE, false);
	}

	document.getElementById(id).play();
};
AudioPlayer.prototype.stopAudio = function (id){
	if(id=="*"){
		$.each($('audio'),function() {
			var i = $(this).attr('id');
			document.getElementById(i).removeEventListener('ended',this.audioEnded,false);
			document.getElementById(i).removeEventListener('timeupdate', this.timeUpdated, false);
			document.getElementById(i).pause();
			try {document.getElementById(i).currentTime = 0;} catch (e) { } // iPad fix
		});
	} else {
		document.getElementById(id).removeEventListener('ended',this.audioEnded,false);
		document.getElementById(id).removeEventListener('timeupdate', this.timeUpdated, false);
		document.getElementById(id).pause();
		try {
			document.getElementById(id).currentTime = 0;
		} catch (e) { } // iPad fix
	}
};
AudioPlayer.prototype.setVolume = function (id,v){
	document.getElementById(id).volume = v;
};
AudioPlayer.prototype.mute = function (id){
	document.getElementById(id).muted = true;
};
AudioPlayer.prototype.unmute = function (id){
	document.getElementById(id).muted = false;
};
AudioPlayer.prototype.getVolume = function (id){
	return document.getElementById(id).volume;
};
AudioPlayer.prototype.getDuration = function (id){
	return document.getElementById(id).duration;
};
AudioPlayer.prototype.getCurrentTime= function (id){
	return document.getElementById(id).currentTime;
};

AudioPlayer.prototype.setCurrenTime= function (id,tm){
	document.getElementById(id).currentTime=tm;
};

AudioPlayer.prototype.paused = function (id){
	return document.getElementById(id).paused;
};

AudioPlayer.prototype.inArray = function(str,arr){
	for(var i=0;i<arr.length;i++)if(arr[i]==str)return i;
	return -1;
}

AudioPlayer.prototype.destroy = function(){
	this.removeEventListener('*');
	$.each($('audio'),function() {
		var i = $(this).attr('id');
		document.getElementById(i).removeEventListener('ended',this.audioEnded,false);
		document.getElementById(i).removeEventListener('timeupdate', this.timeUpdated, false);
	});
}
/*
var _selfAP;
function AudioPlayer(){
	this.queue = new Array();
	this.suspend = false;
	// start EventDispatcher (reqs main.js)
	EventDispatcher.call(this);
	// we inherit
	//this.addEventListener(event, callback, caller)
	//this.removeEventListener(event, callback)
	//this.dispatchEvent(event, data)
	
	// ref AP for external event handlers
	_selfAP = this;
}


AudioPlayer.prototype = new EventDispatcher();
AudioPlayer.prototype.playAudio = function (id){
	this.stopAudio(id);
	document.getElementById(id).play();
	if(_selfAP.hasEventListener("progress")) document.getElementById(id).addEventListener('timeupdate', this.timeUpdated, false);
	document.getElementById(id).addEventListener('ended', this.audioEnded, false);
};
AudioPlayer.prototype.audioEnded = function (e){
	var id = e.target.getAttribute('id');
	document.getElementById(id).removeEventListener('ended', _selfAP.audioEnded, false);
	document.getElementById(id).removeEventListener('timeupdate', _selfAP.timeUpdated, false);
	if(!this.suspend)_selfAP.dispatchEvent("audioEnd", {id:id})
};
AudioPlayer.prototype.timeUpdated = function (e){
	if(!this.suspend)_selfAP.dispatchEvent("progress", {id:e.target.getAttribute('id'),duration:e.target.duration,currentTime:e.target.currentTime})
};
AudioPlayer.prototype.pauseAudio = function (id){
	document.getElementById(id).pause();
};
AudioPlayer.prototype.resumeAudio = function (id){
	document.getElementById(id).play();
};
AudioPlayer.prototype.stopAudio = function (id){
	//document.getElementById(id).removeEventListener('ended',this.audioEnded,false);
	//document.getElementById(id).removeEventListener('timeupdate', this.timeUpdated, false);
	document.getElementById(id).pause();
	try {
		document.getElementById(id).currentTime = 0;
	} catch (e) { } // iPad fix
};

AudioPlayer.prototype.setVolume = function (id,v){
	document.getElementById(id).volume = v;
};
AudioPlayer.prototype.mute = function (id){
	document.getElementById(id).muted = true;
};
AudioPlayer.prototype.unmute = function (id){
	document.getElementById(id).muted = false;
};
AudioPlayer.prototype.getVolume = function (id){
	return document.getElementById(id).volume;
};
AudioPlayer.prototype.getDuration = function (id){
	return document.getElementById(id).duration;
};
AudioPlayer.prototype.getCurrentTime= function (id){
	return document.getElementById(id).currentTime;
};

AudioPlayer.prototype.setCurrenTime= function (id,tm){
	document.getElementById(id).currentTime=tm;
};

AudioPlayer.prototype.paused = function (id){
	return document.getElementById(id).paused;
};

AudioPlayer.prototype.inArray = function(str,arr){
	for(var i=0;i<arr.length;i++)if(arr[i]==str)return i;
	return -1;
}

AudioPlayer.prototype.destroy = function(){
	this.removeEventListener('*');
}
*/
/*
volume => 1
src => 
duration => 25.49551010131836
mediaGroup => 
webkitPreservesPitch => true
defaultPlaybackRate => 1
networkState => 1
currentTime => 2.8678226470947266
controls => false
error => null
initialTime => 0
readyState => 4
preload => auto
webkitClosedCaptionsVisible => false
ended => false
currentSrc => file:///Volumes/artemis1/curro/SMHTML/media/1ESOCAT_CA_UD03_e01_p01/snd/conv.m4a
defaultMuted => false
seeking => false
controller => null
played => [object TimeRanges]
autoplay => false
seekable => [object TimeRanges]
loop => false
textTracks => [object TextTrackList]
buffered => [object TimeRanges]
paused => false
playbackRate => 1
muted => false
startTime => 0
*/