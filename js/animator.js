/*! animator 0.1
* 
* Pescados Software */

// create some custom methods for animated objects
(function($){
	$.fn.Aplay = function(){
		if(this.length>1){
			for(var i=0;i<this.length;i++) if(!$(this[i]).Arunning()) $(this[i]).Aplaypause();
		} else {
			if(!$(this).Arunning())$(this).Aplaypause();
		}
		return $(this);
	}
    $.fn.Apause = function(){
		if(this.length>1){
			for(var i=0;i<this.length;i++) if($(this[i]).Arunning()) $(this[i]).Aplaypause();
		} else {
			if($(this).Arunning())$(this).Aplaypause();
		}
		return $(this);
	}
    $.fn.Agoto = function(n){
		//if(this.length>1){
			for(var i=0;i<this.length;i++) $(this[i]).Agotoframe(n);
		//} else {
			//$(this).Agotoframe(n);
		//}
		return $(this);
	}
	$.fn.Agotoframe = function(n){
		var aid = $(this).data('aid');
		if(isNaN(aid))return;
		for(var i=0;i<animator.anims.length;i++){
			if(animator.anims[i].aid==aid){
				animator.anims[i].currentFrame = n;
				$(animator.anims[i].obj).attr('src',animator.anims[i].srcs[n]);
				animator.launch(aid);
				break;
			}
		}
		return $(this);
	}
	$.fn.Aplaypause = function() {
		var aid = $(this).data('aid');
		if(isNaN(aid))return;
		for(var i=0;i<animator.anims.length;i++){
			if(animator.anims[i].aid==aid){
				animator.anims[i].paused = !animator.anims[i].paused;
				animator.launch(aid);
				break;
			}
		}
		return $(this);
    };
	$.fn.Arunning = function(){
		var aid = $(this).data('aid');
		if(isNaN(aid))return undefined;
		for(var i=0;i<animator.anims.length;i++){
			if(animator.anims[i].aid==aid){
				return (jQuery.inArray(aid,animator.queue)!=-1 && !animator.anims[i].paused);
				break;
			}
		}
	}
	$.fn.dodoShine = function(amount){
		if($(this).data('shiningd')=='down') {
			$(this).animate({opacity:amount||0.2},500,function(){$(this).data('shiningd','up');if(!$(this).data('shinings'))$(this).dodoShine(amount);});
		} else {
			$(this).animate({opacity:1},500,function(){$(this).data('shiningd','down');if(!$(this).data('shinings'))$(this).dodoShine(amount);});
		}
		return $(this);
	}
	$.fn.doShine = function(amount){
		var s = $(this).data('shining');
		if(!s) {
			$(this).data('shining',true);
			$(this).data('shiningd','down');
			$(this).data('shinings',false);
			$(this).css({opacity:1});
			$(this).dodoShine(amount)
		}
		return $(this);
	}
	$.fn.stopShine = function(){
		$(this).data('shining',false);
		$(this).data('shiningd','down');
		$(this).data('shinings',true);
		$(this).stop(false,false,true);
		$(this).css({opacity:1});
		return $(this);
	}
	// grow font-size up to +=20%
	$.fn.dodoFSUpDown = function(amount){
		if($(this).data('shiningd')=='down') {
			$(this).animate({fontSize:$(this).data('fontSizeOrig')-($(this).data('fontSizeOrig')*0.1)},500,function(){$(this).data('shiningd','up');if(!$(this).data('shinings'))$(this).dodoFSUpDown();});
		} else {
			$(this).animate({fontSize:$(this).data('fontSizeOrig')+($(this).data('fontSizeOrig')*0.1)},500,function(){$(this).data('shiningd','down');if(!$(this).data('shinings'))$(this).dodoFSUpDown();});
		}
		return $(this);
	}
	$.fn.doFSUpDown = function(){
		if(!$(this).data('fontSizeOrig'))$(this).data('fontSizeOrig',parseInt($(this).css('font-size'))||parseInt($('body').css('font-size')));
		var s = $(this).data('shining');
		if(!s) {
			$(this).data('shining',true);
			$(this).data('shiningd','down');
			$(this).data('shinings',false);
			$(this).dodoFSUpDown()
		}
		return $(this);
	}
	$.fn.stopFSUpDown = function(){
		$(this).data('shining',false);
		$(this).data('shiningd','down');
		$(this).data('shinings',true);
		$(this).stop(false,false,true);
		$(this).css({fontSize:$(this).data('fontSizeOrig')});
		return $(this);
	}
})(jQuery);


var animator = {};

animator.tick = 0;
animator.lock = false;
animator.clock = false;
animator.fps = 20;
animator.queue = new Array();
animator.anims = new Array();

animator.initClock = function() { // ver cómo está la cosa y animar lo que faga halta
	// limpiar la queue y rellenarla con lo que aiga según los autoPlay
	if(animator.clock){
		clearInterval(animator.clock);
		animator.clock = false;
	}
	if(!animator.queue || animator.queue.length<1){ // add to queue any autoPlay
	//console.log('animator.initClock => queue doesn\'t exist!')
		animator.queue = new Array();
	for(i=0;i<animator.anims.length;i++) {
		animator.anims[i].currentFrame = 0;
		if(animator.anims[i].autoPlay)if(jQuery.inArray(animator.anims[i].aid,animator.queue)==-1)animator.queue.push(i);
	}
	//console.log('animator.initClock => new queue is ' + animator.queue)
	} else {
		//console.log('animator.initClock => queue already exists! => ' + animator.queue)
	}
	if(animator.queue.length>0) {
		//console.log('animator.initClock => do init clock!')
		animator.tick = new Date().getTime();
		animator.clock = setInterval(animator.lap,50);//1000/animator.fps);
	}
}
animator.lapcnt = 0
animator.lap = function(){
	animator.lapcnt++
	if(animator.lock) return;
	var nt = new Date().getTime();
	var ellapsed = nt-animator.tick;
	//console.log('ellapsed ' + ellapsed)
	animator.tick=nt;
	var newQueue = new Array();
	var allPaused = true;
	for(i=0;i<animator.queue.length;i++) {
		var a = animator.anims[animator.queue[i]];
		var aObj = a.obj;
		a.idle+=ellapsed;
		var apsd = a.paused;
		if(!apsd)allPaused=false;
		if(!apsd && a.idle>=a.fps) {
			a.idle=0;
			a.currentFrame++;
			var aDoGo = true;
			if(a.currentFrame==a.totalFrames) {
				if(a.loop) {
					a.currentFrame=0;
					newQueue.push(animator.queue[i]);
				} else { // else don't include this one for the next lap
					a.paused = true;
					aDoGo = false;
				}
			} else {
				newQueue.push(animator.queue[i]);
			}
			if(aDoGo) {
				$(aObj).attr('src',a.srcs[a.currentFrame]);
			}
		} else { // skip animation, push obj for next round
			//console.log('@lap'+animator.lapcnt+', skip '+animator.queue[i]+', paused = ' + a.paused)
			newQueue.push(animator.queue[i]);
		}
	}
	if(newQueue.length==0 || allPaused){
		//console.log('newqueue = 0 or all anims are paused, stop clock')
		clearInterval(animator.clock);
		animator.clock = null;
	} else {
		animator.queue = newQueue;
		//console.log('newQueue')
		//console.log(newQueue)
	}
}

animator.launch = function(aid){
	if(jQuery.inArray(aid,animator.queue)==-1) {
		//console.log('animator.launch => add to queue ' + aid)
		animator.lock = true; // lock, just in case
		animator.queue.push(aid);
		animator.lock = false;
	}
		if(!animator.clock){
			//console.log('animator.launch => animator.initClock()')
			animator.initClock();
		}
}

animator.registerAnim = function (obj){ // img jquery obj
	if(!animator.inQueue(obj)){
		$(obj).data('aid',animator.anims.length); // assign visible id
		var animObj = { obj:$(obj),
						aid:animator.anims.length,
						src:$(obj).attr('src'),
						autoPlay: $(obj).data('autoplay'),
						loop: $(obj).data('loop'),
						totalFrames:$(obj).data('frames') * 1,
						fps:$(obj).data('fps')?1000/($(obj).data('fps') * 1):null,
						idle:0,
						currentFrame:0,
						paused:($(obj).data('autoplay')===false)||false,
						srcs:new Array()
					  }

		// send frames to preload queue
		// ie "img/aqua0001.png"
		
		if(isNaN(animObj.totalFrames)) { // user provides list of images
			animObj.srcs = $(obj).data('frames').split(',');
			animObj.totalFrames = animObj.srcs.length;
			for(var i=0;i<animObj.totalFrames;i++)preloader.addObj(animObj.srcs[i]);
		} else {
			var ext = animObj.src.substring(animObj.src.lastIndexOf('.'),animObj.src.length);
			var dLen = String(animObj.totalFrames).length;
			var zeros = '000000000'.substring(0,dLen);
			var baseName = animObj.src.substring(0,animObj.src.lastIndexOf('.')-dLen);
			var first = animObj.src.substring(animObj.src.lastIndexOf('.')-1,animObj.src.lastIndexOf('.'));
			
			for(var i=(first);i<(animObj.totalFrames+1);i++){
				animObj.srcs.push(baseName+i+ext);
				preloader.addObj(baseName+i+ext);
			}
		}
		
		animator.anims.push(animObj);
		
		return animator.anims.length-1; // return aid
	} else {
		return -1;
	}
}

animator.inQueue = function(obj) {
	for(i=0;i<animator.anims.length;i++){
		if($(animator.anims[i].obj).is($(obj))) return true;
	}
	return false;
}
