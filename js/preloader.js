/*! preloader 1.0
* 
* Pescados Software */

var preloader = {};

preloader.imgList = new Array();
preloader.eimList = new Array();
preloader.sndList = new Array();
preloader.toLoad = 0;
preloader.loaded = 0;
preloader.lInt = false;
preloader.callback = null;
preloader.sTime = 0;
preloader.timeout = 10000; // max timeout for 404 (not found) resources

preloader.init = function(){
	$('.ldbck,.ldbck2').css({top:(baseHeight/2)-13, left:(baseWidth/2)-100});
	$('.ldtop,.ldtop2').css({lineHeight:'25px',top:(baseHeight/2)-13, left:(baseWidth/2)-100, width:0}).html('0%');
	//$('.ldpnt').css({top:(baseHeight/2)-60, left:(baseWidth/2)-100-($('.ldpnt').width()/2)});
	//$('.ldpnt').html('0%');
	preloader.imgList = new Array();
	preloader.sndList = new Array();
	preloader.eimList = new Array();
	preloader.loaded = 0;
}

preloader.addObj = function(obj,element) {
	if(obj.indexOf('.')==-1){ // audio (id)
		if(jQuery.inArray(obj,preloader.sndList)==-1){
			preloader.sndList.push(obj);
		}
	} else { // image
		if(jQuery.inArray(obj,preloader.imgList)==-1){
			if(element){
				if($(element).prop('complete')==true) {
					return;
				} else {
					preloader.imgList.push(obj);
					if(element.attr('id')) {
						preloader.eimList.push(element.attr('id'));
					} else {
						$(element).attr('id','mbd'+preloader.eimList.length)
						preloader.eimList.push('mbd'+preloader.eimList.length);
					}
				}
			} else {
				preloader.imgList.push(obj);
			}
		}
	}
}

preloader.preload = function(c) { // support images and audio
	preloader.toLoad = preloader.imgList.length+preloader.sndList.length;
	preloader.loaded = 0;
	preloader.callback = c;
	preloader.sndCopy = preloader.sndList.slice();
	preloader.eimCopy = preloader.eimList.slice();
	preloader.sTime = new Date().getTime();
	preloader.lInt = setInterval(preloader.checkAudio,30);

	$(preloader.imgList).each(function() {
		$("<img />").bind("load", function(){/*$('#debug').append('img loaded '+$(this).attr('src')+' <br/>');*/preloader.resourceLoaded();}).attr("src", this);
	});
}

preloader.resourceLoaded = function(a,b,c){
	if(!preloader.lInt)return;
	preloader.loaded++;
	var prcnt = (preloader.loaded*100)/preloader.toLoad;
	//$('.ldpnt').html(Math.round(prcnt)+'%');
	//$('.ldpnt').css({left:(baseWidth/2)-100-($('.ldpnt').width()/2) + (prcnt*2)});
	$('.ldtop,.ldtop2').css({width:prcnt*2}).html(Math.round(prcnt)+'%');
	if(preloader.loaded==preloader.toLoad) {
		clearInterval(preloader.lInt);
		preloader.lInt = null;
		preloader.callback();
	}
}

preloader.checkAudio = function(){
	var i;
	var nl = new Array();
	var eil = new Array();
	var nst, rst;
	for(i=0;i<preloader.sndCopy.length;i++) {
		nst = document.getElementById(preloader.sndCopy[i]).networkState;
		rst = document.getElementById(preloader.sndCopy[i]).readyState;nst=1;rst=4;
		
		//$('#debug').append(preloader.sndCopy[i] + ' networkState ' + nst + ' readyState '+rst+' <br/>');
		if(([1,4,3].indexOf(nst)!=-1 && [2,4,0,1,3].indexOf(rst)!=-1)||rst===4){ // 0 is OK for iOS, nst=4 is ok in FF 3.5 local
			//$('#debug').append('audio loaded '+document.getElementById(preloader.sndCopy[i]).getAttribute('id')+' <br/>');
			preloader.resourceLoaded();
		} else {
			if(nst===3 && rst==0){
				if((new Date().getTime() - preloader.sTime)>preloader.timeout) {
					clearInterval(preloader.lInt);
					console.log(preloader.sndCopy[i],nst,rst)
					window.alert('No se pudo cargar algún recurso después de '+(preloader.timeout/1000)+' segundos, inténtelo más tarde');
					break;
				} else {
					nl.push(preloader.sndCopy[i]);
				}
			} else if (nst===3){ // skip this audio file (bugs in older browsers)
				//$('#debug').append('audio loaded '+document.getElementById(preloader.sndCopy[i]).getAttribute('id')+' <br/>');
				preloader.resourceLoaded();
			} else {
				nl.push(preloader.sndCopy[i]);
			}
		}
	}

	var isLocal = window.location.protocol.indexOf('file')==0;
	//var isWebkit = $.browser.webkit;
	
	if(isLocal&&isWebkit){
		// getSVGDocument may throw un-handleable errors
		// being local, we'll assume the SVG files will
		// load very fast and anyway we can't control
		// them loading in a reliable fashion
	} else {
		for(i=0;i<preloader.eimCopy.length;i++) {
			try {
				nst = document.getElementById(preloader.eimCopy[i]).getSVGDocument ? document.getElementById(preloader.eimCopy[i]).getSVGDocument() : document.getElementById(preloader.eimCopy[i]).complete;
			} catch (err) {
				nst = false;
			}
			if(nst){ // 0 is OK for iOS
				//$('#debug').append('svg loaded '+document.getElementById(preloader.eimCopy[i]).src+' <br/>');
				preloader.resourceLoaded();
			} else {
				if((new Date().getTime() - preloader.sTime)>preloader.timeout) {
					//$('#debug').append('svg NOT LOADED '+document.getElementById(preloader.eimCopy[i]).src+' <br/>');
					clearInterval(preloader.lInt);
					preloader.resourceLoaded(); // mark as loaded anyway!!!
					//window.alert('No se pudo cargar un recurso, inténtelo más tarde');
					//break;
				} else {
					eil.push(preloader.eimCopy[i]);
				}
			}
		}
	}
	//$('#debug').append('svgs NOT LOADED '+eil+' <br/>');
	preloader.sndCopy = nl;
	preloader.eimCopy = eil;
}