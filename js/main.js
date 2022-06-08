/*! main 2.0
* 
* Pescados Software */

var LOGOSIZES = {SM:{w:88,h:132},ARRELS:{w:211,h:132},IKASMINA:{w:286,h:132},CRUILLA:{w:219,h:132},DAYTON:{w:376,h:132},XERME:{w:221,h:132}};

addons();
var isTouchDevice = (true == ("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch));
var isIpad = (navigator.userAgent.match(/iPad/i) != null);
var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || safari.pushNotification);
var isFirefox = typeof InstallTrigger !== 'undefined';
// Internet Explorer 6-11
var isIE = /*@cc_on!@*/false || !!document.documentMode;
// Edge 20+
var isEdge = !isIE && !!window.StyleMedia;
// Chrome 1+
var isChrome = !!window.chrome && !!window.chrome.webstore;
var SafariLessThan6 = (navigator.userAgent.match(/Safari/i) != null) ? (parseFloat(navigator.appVersion.substring((navigator.appVersion.indexOf('Version'))+8))) < 6 : false;
var isLocal = window.location.protocol.indexOf('file')==0;
var isWebkit = (navigator.userAgent.match(/webkit/i) != null);
var isWin = navigator.platform.indexOf('Win') > -1;
var isLast = window.location.href.indexOf('#last')!=-1;
var isStandalone = (window.top == window.self);
var isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
var isAndroid = /(android)/i.test(navigator.userAgent);


var debug = false;
var sequences = new Array();
var sequencesOK = new Array();
var currentSequence = 0;
var baseWidth = 960;
var baseHeight = 600;
var tRatio,DISLATEX,DISLATEY;

var mediaContainer = '.medio';

var resizeSuscriptors,preTransformActions;

window.addEventListener('touchstart', touchDetect, false);
function touchDetect(){
	window.removeEventListener('touchstart', touchDetect, false);
	window.removeEventListener('mousemove', mmvDetect, false);
	isTouchDevice = true;
}
window.addEventListener('mousemove', mmvDetect, false);
function mmvDetect(){
	window.removeEventListener('mousemove', mmvDetect, false);
	isTouchDevice = false;

	try {
		mouseDetected();
	} catch (err) {}
}
/*
PERSONALIZACIÓN AUTOMÁTICA DEL INTERACTIVO Y COLORES POR ASIGNATURA
*/
function interactive(){
	try {
		if($('.fr').length>1) return; // more than 1 fr!
		if(ENUNCIADO.length){
			$('#fr'+(currentSequence+1)+' #enun2').empty().append('<p id="entxt" class="enen2">'+ENUNCIADO+'</p>');
			try {
				if(ENUNCIAUDIO.length){
					var spk = $('<span id="speaker" class="tinyButton">h</span>').off().on('click',function(){
						playSound('enunci_audio');
					});


					$('#fr'+(currentSequence+1)+' #enun2').prepend(spk);
					var a = ENUNCIAUDIO.substring(0,ENUNCIAUDIO.lastIndexOf('.'));
				 	if(!$('#enunci_audio').length) $('<audio preload="auto" id="enunci_audio"><source src="data/audios/'+a+'.mp3" type="audio/mp3" /><source src="data/audios/'+a+'.ogg" type="audio/ogg" /></audio>').appendTo('body');

				}
			} catch (err){}
		}
	} catch (err) {
		$('#fr'+(currentSequence+1)+' #enun2').empty().css({minHeight:0,height:0}).css('pointer-events','none'); // no enunciado! (but leave border)
	}
}

function asignature(obj){
	try {
		if(obj){
			// setup colors
			$(' .medio,'+obj+' #enun,'+obj+' #enun2').addClass(ASIGNATURA.toLowerCase() + " bg");
			$(obj+' .tinyButton,'+obj+' .specialButton,'+obj+' .genericButton,'+obj+' .uiButton,'+obj+' .tinyAudioButton').addClass(ASIGNATURA.toLowerCase());

			// setup font-faces & sizes
			var ee = ETAPA_EDUCATIVA.toLowerCase();
			$('.medio,'+obj+' #entxt,'+obj+' #enun2,'+obj+' .tinyButton,'+obj+' .genericButton,'+obj+' .uiButton,.logo,'+obj+' .specialButton').addClass(ee);
		} else {
			// setup colors
			$('.medio,#fr'+(currentSequence+1)+' #enun,#fr'+(currentSequence+1)+' #enun2').addClass(ASIGNATURA.toLowerCase() + " bg");
			$('#fr'+(currentSequence+1)+' .tinyButton,#fr'+(currentSequence+1)+' .specialButton,#fr'+(currentSequence+1)+' .genericButton,#fr'+(currentSequence+1)+' .uiButton,#fr'+(currentSequence+1)+' .tinyAudioButton').addClass(ASIGNATURA.toLowerCase());

			// setup font-faces & sizes
			var ee = ETAPA_EDUCATIVA.toLowerCase();
			$('.medio,#fr'+(currentSequence+1)+' #entxt,#fr'+(currentSequence+1)+' #enun2,#fr'+(currentSequence+1)+' .tinyButton,#fr'+(currentSequence+1)+' .genericButton,#fr'+(currentSequence+1)+' .uiButton,.logo,#fr'+(currentSequence+1)+' .specialButton').addClass(ee);

			// setup logo
			if(typeof LOGOTIPO == 'undefined' || LOGOTIPO == ''){
				$('.logo').empty();
			} else {
				var lh=parseInt($('.logo img').css('height'));
				if(!lh || isNaN(lh))lh=$('.logo').height();
				if(LOGOTIPO=='FRANCES')return alert('No existe el logo de francés, abortando...');
				var ls = LOGOSIZES[LOGOTIPO];
				var ratio = ls.h/lh;
				var lw = ls.w/ratio;
				var preComp = $('.logo').html().indexOf('cv_imgs')!=-1;
				var lPath = preComp ? 'data/res/' : 'data/res/';
				var logo = $('<img src="'+lPath+LOGOTIPO.toLowerCase()+'.png" style="width:'+lw+';" />').css({width:lw});
				$('.logo').empty().append(logo);
			}
		}
	} catch (err){}
}

function doAdjust(e){
	var cvw = window.innerWidth || $(window).width();
	var cvh = window.innerHeight || $(window).height();
	
	var wRatio = cvw/baseWidth;
	var hRatio = cvh/baseHeight;

	var hR = (wRatio*baseHeight)/cvh;

	if(preTransformActions)preTransformActions();
	tRatio = (hR>1) ? hRatio : wRatio;
	
	
	if(tRatio>2.1428571429)tRatio=2.1428571429;
	$(mediaContainer).transform({scale: [tRatio,tRatio],origin: ['0px', '0px']});
	$(mediaContainer).css({marginLeft:-(baseWidth/2)*tRatio,marginTop:-(baseHeight/2)*tRatio});
	/*$(mediaContainer).css({transform:'scale('+tRatio+','+tRatio+')',marginLeft:-(baseWidth/2)*tRatio,marginTop:-(baseHeight/2)*tRatio});*/
	
	
	
	var ofm = $(mediaContainer).offset();
	DISLATEX = ofm.left;
	DISLATEY = ofm.top;
	
	for(var i=0;i<resizeSuscriptors.length;i++)resizeSuscriptors[i]();
}
function resizeSubscribe(f){
	resizeSuscriptors.push(f);
	return resizeSuscriptors.length - 1;
}
function resizeUnsubscribe(id){
	resizeSuscriptors.splice(id,1);
}

$(document).ready(function(){
	try{
		docPreInit();
	} catch (e) {}//docPreInit();
	
	// customize enunciado and other details (or not)
	interactive();
	try {
		if(typeof ASIGNATURA == 'string' && ASIGNATURA.length != 0){
			throw new Error(-1);
		}
	} catch (err){
		if(err.message<0)asignature();
	}
	
	resizeSuscriptors = new Array();
	$(window).off().on("scroll",function(e){$(window).scrollTop(0);e.preventDefault();e.stopImmediatePropagation();return false;});
	doAdjust();
	$(window).resize(doAdjust);
	
	//$('#debug').append('spinner h ' + $('#spinner').height() + '<br/>');
	preloader.init();
	
	localizar(); // localize twice just in case
	
	//if(cvw!=baseWidth) $('.medio').transform({scale: [cvw/baseWidth,cvw/baseWidth],origin: ['0px', '0px']});
	registerSequences();
	registerButtons();
	
	registerImages();
	registerAnims();
	registerAudios();

	preloader.preload(ready2); // cargar todas las imágenes recolectadas
	
	if(debug){
		$(window).bind('keypress', function(e) {
			var cd = (e.keyCode ? e.keyCode : e.which);
			if(cd > 48 && cd < 57) goframe(cd-48);
		});
	}
});

var logoWidth;
function ready2(){ // inicializar el animéitor y darle caña al temita
	// globally remove any print button in iOS/Android
	if(isiOS || isAndroid)$('#print').hide();
	var n = $('.logo').width();
	if(!isNaN(n)&&n>0)logoWidth=(n+20);
	if(isIpad || SafariLessThan6) { // embed svgs to images (iPad fix)
		$.each($('embed'),function() {
			var ww = $(this).attr('width');
			ww = (ww && ww!="") ? 'width="'+ww+'"' : '';
			var hh = $(this).attr('height');
			hh = (hh && hh!="") ? 'height="'+hh+'"' : '';
			//$('#debug').append('replace => ' + $(this).attr('src') + '<br/>');
			
			$(this).replaceWith('<img src="'+$(this).attr('src')+'" style="'+$(this).attr('style')+'" class="'+$(this).attr('class')+'" id="'+$(this).attr('id')+'" '+ww+' '+hh+' />');
		});	
	}
	
	try{
		docPosInit();
	} catch (e) {}
	$('.enen,.enen2').css({paddingRight:logoWidth?logoWidth:$('.logo').width()+20});
	
	$('#spinner').fadeOut(400);
	for(i=0;i<sequences.length;i++) $(sequences[i]).css({zIndex:999-i,display:'none'});
	currentSequence = -1;
	next();
	animator.initClock();
}

function imgFromURL(rl,w,h,sty,clss,id){ // url, width, height, style, class
	if(rl.indexOf('.svg')!=-1){
		if(isIpad || SafariLessThan6){
			return '<img src="'+rl+'"'+(w?' width="'+w+'"':'')+(h?' height="'+h+'"':'')+(clss?' class="'+clss+'"':'')+(sty?' style="'+sty+'"':'')+(id?' id="'+id+'"':'')+' />';
		} else {
			return '<embed src="'+rl+'" type="image/svg+xml" '+(w?' width="'+w+'"':'')+(h?' height="'+h+'"':'')+(clss?' class="'+clss+'"':'')+(sty?' style="'+sty+'"':'')+(id?' id="'+id+'"':'')+' />';
		}
	} else {
		return '<img src="'+rl+'"'+(w?' width="'+w+'"':'')+(h?' height="'+h+'"':'')+(clss?' class="'+clss+'"':'')+(sty?' style="'+sty+'"':'')+(id?' id="'+id+'"':'')+' />';
	}
}

function localizar(){
	$("*[data-locale]").each(function(i,e){
		if($(e).is("input")) {
			if($(e).data('val') && $(e).data('uval')){ // don't localize tfs already processed by the Write engine
			} else {
				$(e).val(localization[$(e).data('locale')]);
			}
		} else {
			$(e).html(localization[$(e).data('locale')])
		}
	});
	if(isSafari){
		$('.inlineFraction').css({verticalAlign:"-45%"});
	}
}


function registerImages(){
	/*$.each($('img'),function() { preloader.addObj($(this).attr('src')); });*/
	$.each($(':not(script,head,style)'),function() { filterImages($(this)); });
}

function filterImages(e){
	var url = "";

	if ($(e).css("background-image") != "none") {
		url = $(e).css("background-image");
	} else if (typeof($(e).attr("src")) != "undefined" && ($(e).prop("nodeName").toLowerCase() == "img" ||$(e).attr("src").indexOf('svg')!=-1 )) {
		url = $(e).attr("src");
	}

	if (url && url.indexOf("gradient") == -1 && url.indexOf("data:")==-1) {
		url = url.replace(/url\(\"/g, "");
		url = url.replace(/url\(/g, "");
		url = url.replace(/\"\)/g, "");
		url = url.replace(/\)/g, "");

		var urls = url.split(", ");

		for (var i = 0; i < urls.length; i++) {
			if (urls[i].length > 0) {
				var extra = "";
				// if ($.browser.msie && $.browser.version < 9) extra = "?" + Math.floor(Math.random() * 3000); // we don't support IE<9 anymore
				preloader.addObj(urls[i] + extra,e);
				//console.log('add ' + urls[i] + extra);
			}
		}
	}
}

var fixd, start2, isToc;

function registerSequences(){
	fixd = $('.toolbar').hasClass('fixed');
	start2 = $('.toolbar').hasClass('start2');
	currentSequence = 0;
	sequences = new Array();
	sequencesOK = new Array();
	pagesOK = new Array();
	for(i=1;i<1000;i++){
		if($("#fr"+i).length){
			if($("#fr"+i).css('display')=='none')console.log('#fr'+i+' displaynone err')
			sequences.push("#fr"+i);
			sequencesOK.push(false);
			pagesOK.push(false);
		} else {
			break;
		}
	}
	try {
		toc.length;
		isToc = true;
		return initToc();
	} catch (err) {}
	isToc = false;

	if(sequences.length==1&&typeof xmod_anim_finished!='boolean'){
		$('.toolbar').css({display:'none'});
	} else {
		if($('.toolbar').hasClass('fixed')){
			$('#ar').addClass('tInac');
		}
		if(start2){
			$('.toolbar').css({display:'none'});
		}
		$('#al').addClass('tInac');
		$('#ar').off().on('click',next);
		$('#al').off().on('click',prev);
	}
}

var eps;
var currentEp;
var currentPage;
var pagesOK;
function initToc(){
	if(sequences.length==1&&typeof xmod_anim_finished!='boolean'){
		$('.toolbar').css({display:'none'});
		return;
	}
	$('#al,#ar').off();
	$('.sheet .scrollable').children().remove();
	currentPage = 0;
	currentEp = 0;
	eps = new Array();
	pagesOK[0]=true;
	/*pagesOK = new Array(sequences.length);*/
	for(i=0;i<toc.length;i++){
		var itm = $('<div class="title'+(i===0?' titleSelected':'')+'">'+toc[i]+'</div>');
		eps.push(currentPage);
		$(itm).data({page:currentPage++,ep:eps.length-1});
		itm = $('<div class="tContainer"></div>').append(itm);
		$('.sheet .scrollable').append(itm);
		try {
			if(subtoc&&subtoc[i]){
				var subt = subtoc[i];
				if(typeof subt=='number'){
					subtoc[i] = new Array();
					currentPage--;
					for(j=0;j<subt;j++) subtoc[i][j]=currentPage++;
					// currentPage+=subt;
					// nothing to display!
				} else {
					// loop thru subpage list and display
					/*
					<div class="tContainer level2">
						<div class="title">Fase 2.1. Agricultura para los payos</div>
					</div>
					*/
				}
			}
		} catch (err) {}
	}
	
	currentPage = 0;
	currentEp = 0;
	
	$('.barTitle').html(toc[currentEp]);
	$('.toolbar, .sheet').on('click',tocNav);
	$('#psi').css({display:'none',opacity:0});
	if($('.toolbar').hasClass('start2')&&typeof xmod_anim_finished!='boolean'){
		$('.toolbar').css({display:'none'});
	}
}
function pageFinished(){
	pagesOK[currentPage]=true;
	sequencesOK[currentPage]=true;
	sequencesOK[currentPage+1]=true;

	if(jQuery.inArray(false,pagesOK)==-1){
		if(mediaFinished) mediaFinished();
	} else {
		var trg = '#sar';
		if(jQuery.inArray(currentPage+1,eps)!=-1) {
			trg = '#ar';
		} else {
			for(i=1;i<6;i++){
				if($('#s'+i).data('page')==(currentPage+1)){
					trg = '#s'+i;
					break;
				}
			}
		}
		$(trg).removeClass('tInac').doShine();
	}
}
function tocNav(evt){
	if($(evt.target).hasClass('tInac')||$(evt.target).hasClass('anonSelected')||$(evt.target).hasClass('titleSelected'))return;
	
	$('.tcont,.barAnonE').children().stopShine();
	
	var id = $(evt.target).attr('id');
	var pg = $(evt.target).data('page');
	var ep = $(evt.target).data('ep');
	if(id=='al'){
		currentEp--;
		currentPage = eps[currentEp];
		goframe(currentPage);
	} else if (id=='ar'){
		currentEp++;
		currentPage = eps[currentEp];
		goframe(currentPage);
	} else if (id=='tc'){
		$('.title').removeClass('titleSelected');
		$($('.title')[currentEp]).addClass('titleSelected');
		$('#psi').css({display:'block'}).animate({opacity:1},200);
		$('body').on('click',bodyClicked);
		evt.stopPropagation();
	} else {
		currentPage=pg;
		if(!isNaN(ep))currentEp=ep;
		if(!isNaN(pg))goframe(pg);
	}
}
function tocAdjust(){
	var i;
	for(i=0;i<eps.length;i++){
		if(eps[i]>currentPage){
			break;
		} else {
			currentEp = i;
		}
	}
	$('.barTitle').html(toc[currentEp]);
		
	if(sequences.length==1||(currentPage==0&&start2)){
		if(typeof xmod_anim_finished!='boolean')$('.toolbar').css({display:'none'});
		return;
	} else {
		$('.toolbar').css({display:'block'});
	}
	
	// hide toc if needed
	if($('#psi').css('display')=='block')$('#psi').animate({opacity:0},200,function(){$(this).css({display:'none'})});
	
	// clean inactive items
	$('#al,#ar,.barAnon').removeClass('tInac anonSelected');

	// first frame
	if(currentEp==0||(currentSequence==1&&start2)){
		$('#al').addClass('tInac');
	}
	
	// last frame
	if(currentEp==(eps.length-1)){
		$('#ar').addClass('tInac');
	}
	
	try {
		if(subtoc && subtoc[currentEp]){
			var subt = subtoc[currentEp];
			if(typeof subt[0] == 'number'){
				if(subt.length<6)$('#sal,#sar').css('display','none');
				$('.barAnon').removeClass('tInac anonSelected');
				for(i=0;i<5;i++){//subt.length;i++){
					if(subt[i]||subt[i]===0){
						$('#s'+(i+1)).data('page',subt[i]);
						if(currentPage==subt[i]) {
							$('#s'+(i+1)).addClass('anonSelected');
						} else {
							if (fixd&&!sequencesOK[subt[i]]) {
								$('#s'+(i+1)).addClass('tInac');
							}
						}
						$('#s'+(i+1)).css('display','inline-block');
					} else {
						$('#s'+(i+1)).css('display','none');
					}
				}
				/*
		<ul class="barAnonE">
			<li class="barAnon anarr" id="sal">b</li>
			<li class="barAnon" id="s1">1</li>
			<li class="barAnon" id="s2">2</li>
			<li class="barAnon anonSelected" id="s3">3</li>
			<li class="barAnon tInac" id="s4">4</li>
			<li class="barAnon" id="s5">5</li>
			<li class="barAnon anarr" style="margin-right:0px;" id="sar">c</li>
		</ul>
				*/
			} else {
				// nothing
			}
			$('.barAnonE').css('display','block');
		} else {
			$('.barAnonE').css('display','none');
		}
	} catch (err) {}
}
function bodyClicked(evt){
	if($(evt.target).hasClass('tInac'))return;
	//var id = $(evt.target).attr('id');
	//if(id&&(id=='medio'||id=='psi')){
		$('#psi').animate({opacity:0},200,function(){$(this).css({display:'none'})});
		$('body').off('click',bodyClicked);
	//}
}

function registerAudios(){
	$.each($('audio'),function() {
		preloader.addObj($(this).attr('id'));
	});
}

function registerAnims(){
	$.each($('.anim'),function() {
		var aid = animator.registerAnim($(this));
		if(aid!=-1) { // ver si hay un botón asociado que ejecuta esta animación y ponerle un click
			if($(this).data('start')) {
				$('#'+$(this).data('start')).data('anim',aid);
				$('#'+$(this).data('start')).click(launchAnimation);
			}
			//console.log('start ' + $(this).data('start'))
		}
	});
}
function launchAnimation(){
	animator.launch($(this).data('anim'));
}

function preProcessSequence(){
	playSound(false,true);
	if(this[sequences[currentSequence].substring(1,100)+"init"]){
		var ds = $(sequences[currentSequence]).css('display');
		if(ds == 'none') {
			var op = $(sequences[currentSequence]).css('opacity');
			$(sequences[currentSequence]).css({opacity:0,display:'block'});
		}
		
		this[sequences[currentSequence].substring(1,100)+"init"](sequences[currentSequence]);
		$('.enen').css({paddingRight:logoWidth?logoWidth:$('.logo').width()+20});
		if(ds == 'none') $(sequences[currentSequence]).css({opacity:op,display:'none'});
	} else {
		$('.enen').css({paddingRight:logoWidth?logoWidth:$('.logo').width()+20});
	}
}

function postProcessSequence(){
	if(window[sequences[currentSequence].substring(1,100)+"posInit"]){
		window[sequences[currentSequence].substring(1,100)+"posInit"](sequences[currentSequence]);
	}
	$('.enen').css({paddingRight:logoWidth?logoWidth:$('.logo').width()+20});
}


function toolbarAdjust(){
	try{toc;return tocAdjust()}catch(err){}
	if(sequences.length==1 || (start2 && currentSequence==0)){
		if(typeof xmod_anim_finished!='boolean')$('.toolbar').css({display:'none'});
		return;
	} else {
		$('.toolbar').css({display:'block'});
	}
	// clean flags
	$('#al,#ar').removeClass('tInac');

	// first frame
	if(currentSequence==0||(currentSequence==1&&start2)){
		$('#al').addClass('tInac');
	}
	// last frame or fixed navigation
	if(sequences.length==(currentSequence+1) ||
		($('.toolbar').hasClass('fixed')&&!sequencesOK[currentSequence])) {// fixed nav and current seq is not OK
		$('#ar').addClass('tInac');
	}

	$('.counter').html((currentSequence+(start2?0:1)) + ' / ' + (sequences.length-(start2?1:0)));
}
function next(){
	if($(this).hasClass('tInac'))return;
	$(this).stopShine();
	sequencesOK[currentSequence]=true;
	currentSequence++;
	
	if(sequences.length>currentSequence){
		var oldseq = sequences[currentSequence-1];
		(function(){if(oldseq)if(window[oldseq.substring(1,100)+"Left"])window[oldseq.substring(1,100)+"Left"](oldseq)})();
		$(sequences[currentSequence-1]).fadeOut(300);
		preProcessSequence();
		$(sequences[currentSequence]).fadeIn(300,postProcessSequence);
	} else {
		//$(this).addClass('tInac');
		currentSequence--;
	}
	toolbarAdjust();
}
function prev(){
	if($(this).hasClass('tInac'))return;
	$(this).stopShine();
	if(currentSequence==0)return;
	currentSequence--;
	var oldseq = sequences[currentSequence+1];
	(function(){if(oldseq)if(window[oldseq.substring(1,100)+"Left"])window[oldseq.substring(1,100)+"Left"](oldseq)})();
	$(sequences[currentSequence+1]).fadeOut(300);
	preProcessSequence();
	$(sequences[currentSequence]).fadeIn(300,postProcessSequence);
	toolbarAdjust();
}

function goframe(seq){ // zero-based
	if(!sequences[seq])return;
	if(currentSequence == seq){
		preProcessSequence();
		postProcessSequence();
	} else {
		var oldseq = sequences[currentSequence];
		(function(){if(oldseq)if(window[oldseq.substring(1,100)+"Left"])window[oldseq.substring(1,100)+"Left"](oldseq)})()
		$(sequences[currentSequence]).fadeOut(300);
		currentSequence = currentPage = seq;
		preProcessSequence();
		$(sequences[currentSequence]).fadeIn(300,postProcessSequence);
	}
	toolbarAdjust();
}

function registerButtons(){
	/*
	de momento usamos <a>es, luego ya veremos
	si hay que registrar otro tipo de botones
	*/
	if($('.toolbar .play').length){
		$('.toolbar .play').data('status','play').off().removeClass('tInac').one('click',doPlay);
		$('.toolbar .back').removeClass('tInac');
	}
	
	$.each($('.ligthbox'),function() {
		//var closebox = $('<div class="genericButton" style="position:absolute; top:10px;right:10px; width:30px; height:30px; border: 2px solid orange;min-width:0px; line-height:28px; font-size:28px;">X</div>');
		//$(closebox).on('click',function(){$(this).parent().css('display','none')});
		//$(this).append(closebox);
		$(this).css('display','none');
		var nn = $(this).attr('id').substring(3,5);
		
		if($('#bbx'+nn+' #chpre').length) {
			$('#bbx'+nn+' #chpre').css({cursor:'pointer'}).on('click',function(){$(this).parent().parent().css('display','none')});
		} else {
			var closebox = $('<div class="genericButton" style="position:absolute; top:10px;right:10px; width:30px; height:30px; border: 2px solid orange;min-width:0px; line-height:28px; font-size:28px;">X</div>');
			$(closebox).on('click',function(){$(this).parent().css('display','none')});
			$(this).append(closebox);
		}
		$('#lbx'+nn).css({cursor:'pointer'}).on('click',function(){$('#bbx'+$(this).attr('id').substring(3,5)).css({
			display:'inline-block',zIndex:10000});
		});
	});
}
function doPlay(){
	$(this).data('status','pause').html('p');
	$(this).addClass('pause').removeClass('play').off().one('click',doPause);
	try {
		if($(sObj).data('paused')){
			try {
				resumeAnim();
			} catch (e) {
				alert('Con un botón de play debe definirse una función resumeAnim propia!')
			}
		} else {
			try {
				startAnim();
			} catch (e) {
				alert('Con un botón de play debe definirse una función startAnim propia!')
			}
		}
		$(sObj).removeData('paused');
	} catch(e){}
}
function doPause(t){
	var trg = this;
	if(t)trg = $(this).hasClass('pause') ? this : t;
	$(trg).data('status','play').html('c');
	$(trg).addClass('play').removeClass('pause').off().one('click',doPlay);
	try{
		$(sObj).data('paused',true);
		try {
			pauseAnim();
		} catch (e) {
			alert('Con un botón de play debe definirse una función pauseAnim propia!')
		}
	} catch (e) {}
}

function butOver(){
	$(this).addClass('buttonOver');
	$(this).mouseout(butOut);
	$(this).mousedown(butDown);
	$(this).mouseup(butUp);
}

function butDown(){
	$(this).addClass('buttonDown');
}

function butUp(){
	$(this).removeClass('buttonDown');
}

function butOut(){
	$(this).removeClass('buttonOver');
	$(this).removeClass('buttonDown');
	$(this).off('mouseout');
	$(this).off('mouseup');
}

/*************** media functions *******************/
var csidd;
function playSound(sndID,stopPrevious){
	if(stopPrevious && csidd){
		try {
			document.getElementById(csidd).pause();
		} catch (e) { } // billy el rápido clicked
		try {
			document.getElementById(csidd).currentTime = 0;
		} catch (e) { } // iPad fix
	}
	csidd = sndID;
	var aud = (typeof sndID=='string'?document.getElementById(sndID):sndID);
	if(sndID) {
		aud.pause();
		try {
			aud.currentTime = 0;
		} catch (e) { } // iPad fix
		aud.play();
	}
}
function stopSound(sndID){
	try {
		(typeof sndID=='string'?document.getElementById(sndID):sndID).pause();
	} catch (e) { } // billy el rápido clicked
	try {
		(typeof sndID=='string'?document.getElementById(sndID):sndID).currentTime = 0;
	} catch (e) { } // iPad fix
}
function isPlaying(sndID) {
    var s = (typeof sndID=='string'?document.getElementById(sndID):sndID);
    return !s.paused && !s.ended && 0 < s.currentTime;
}
var sndQueue = new Array();
var sndQueueInterval;
function fadeSound(sndID,dir){
	if(isIpad){
		if(dir=='out'){
			stopSound(sndID);
		} else {
			playSound(sndID);
		}
	}
	sndQueue.push({id:sndID,dir:dir,volume:document.getElementById(sndID).volume||1});
	if(sndQueue.length===1)sndQueueInterval=setInterval(fadeSnds,33);
}
function fadeSnds(){
	var nQ = new Array();
	for(var i=0;i<sndQueue.length;i++){
		var s = sndQueue[i];
		if(s.dir=='out'){
			s.volume-=0.05;
			if(0>=s.volume){
				document.getElementById(s.id).volume = 0;
			} else {
				document.getElementById(s.id).volume = s.volume;
				nQ.push(s);
			}
		} else {
			s.volume+=0.05;
			if(s.volume>=1){
				document.getElementById(s.id).volume = 1;
			} else {
				document.getElementById(s.id).volume = s.volume;
				nQ.push(s);
			}
		}
	}
	if(nQ.length){
		sndQueue = nQ;
	} else {
		sndQueue = new Array();
		clearInterval(sndQueueInterval);
	}
}

function grayscale(img){
	if(img.splice)img=img[0];//jquery obj to plain img	
	var cvs=$('<canvas></canvas>')[0];//document.createElement("canvas");
	var ctx=cvs.getContext("2d");
	
	var w=img.width;
	var h=img.height;

	cvs.width= w;
	cvs.height=h;

	ctx.drawImage(img,0,0);

	// img must reside in the same domain
	// doesn't work in chrome at all, ABORT!
	var imgData=ctx.getImageData(0,0, w, h);

	//return cvs
	var tm = new Date().getTime()
	for (var j=0; j<h; j++) {
	    for (var i=0; i<w; i++) {
			var q=(i*4)*w+(j*4);
			var r=imgData.data[q];
			var g=imgData.data[q+1];
			var b=imgData.data[q+2];
			
			imgData.data[q]=imgData.data[q+1]=imgData.data[q+2]=(r+g+b)/3;
		}
	}
	
	ctx.putImageData(imgData, 0, 0, 0, 0, w, h);
	
	var imgid = $(img).attr('id');
	if(imgid)$(cvs).attr('id',imgid);
	$(cvs).css({width:$(img).css('width'),height:$(img).css('height'),position:$(img).css('position'),top:$(img).css('top'),left:$(img).css('left'),display:$(img).css('display'),border:$(img).css('border')})
	  /*if (bPlaceImage)
	{
	  var myDiv=document.createElement("div");
	     myDiv.appendChild(cvs);
	  img.parentNode.appendChild(cvs);
	}*/
	return $(cvs)//.toDataURL();
}

Array.prototype.shuffle = function() {
	var s = [];
	while (this.length) s.push(this.splice(Math.random() * this.length, 1)[0]);
	while (s.length) this.push(s.pop());
	return this;
}

Array.prototype.shuffleArrays = function(){
	try {
		var narr = [];
		var l = this.length;
		for(var i=0;i<this[0].length;i++) {
			var ps = [];
			for(var j=0;j<l;j++) ps.push(this[j][i])
			narr.push(ps);
		}
		var parr = narr.slice().shuffle();
		
		for(var i=0;i<this[0].length;i++) for(var j=0;j<l;j++) this[j][i]=parr[i][j];
	} catch (err) {}
}

String.prototype.stripHTML=function(){
	return this.replace(/<.*[^>]>/g,'');
}


function rand(n1,n2){
	return Math.floor(Math.random() * (n2 - n1 + 1)) + n1;
}
function rounDec(x, n) {
    return Math.round(x * Math.pow(10, n)) / Math.pow(10, n)
}
function quickNumFormat(n){
	n = String(n);
	n = n.split('.');
	nint = n[0].split('').reverse().join('');
	var nn = "";
	for(var i=0;i<nint.length;i++){
		nn+=nint.charAt(i);
		if(((i+1)%3)==0){
			if(i<nint.length-1)nn+='.';
		}
	}
	nn=nn.split('').reverse().join('');
	if(n.length>1) {
		return [nn,n[1]].join(',');
	} else {
		return nn;	
	}
}


function addons(){
	try{console}catch(e){
		window.console = {log:function(txt){}}
	}
}



/*************** ligthweight event EventDispatcher *******************/
function EventDispatcher(){this._events=[];}
EventDispatcher.prototype.addEventListener = function(event, callback){
	this._events[event] = this._events[event] || [];
	if (this._events[event]) this._events[event].unshift({callback:callback});
}
EventDispatcher.prototype.hasEventListener = function(event){
	if (this._events[event]) {
		return true;
	} else {
		return false;
	}
}
EventDispatcher.prototype.removeEventListener = function(event,callback){
	if(event=="*"){
		this._events=[];
		return true;
	}
	if (this._events[event]) {
		var listeners = this._events[event];
		for (var i = listeners.length-1; i>=0;--i){
			if (listeners[i].callback === callback){
				listeners.splice(i,1);
				return true;
			}
		}
	}
	return false;
}
EventDispatcher.prototype.dispatchEvent = function(event, data){
	data = data || {};
	if(this._events[event]){
		var listeners = this._events[event];
		var len = listeners.length;
		while(len--) listeners[len].callback({type:event,data:data});
	}
}
