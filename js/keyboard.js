function VirtualKeyboard(keyboardDefinition,bottomBarHeight,graybarHeight,showhideHeight,shiftON,acuteON,graveON,umlautON,circON,tildeON,shiftLockON,alwaysListen){
	if(typeof keyboardDefinition != 'object' || ! (keyboardDefinition && keyboardDefinition.ENTER.map)) {
		alert('ABORT: bad keyboard definition');
		return;
	}
	this.exists = false;
	this.keyboard = keyboardDefinition;
	this.bottomBarHeight = (typeof bottomBarHeight != 'undefined' ? bottomBarHeight : 0);
	this.graybarHeight = (typeof graybarHeight != 'undefined' ? graybarHeight : 30);
	this.showhideHeight = (typeof showhideHeight != 'undefined' ? showhideHeight : 64);
	this.shiftON = false;
	this.acuteON = false;
	this.graveON = false;
	this.umlautON = false;
	this.circON = false;
	this.tildeON = false;
	this.shiftLockON = false;
	this.doubleEventLock=false;
	this.keyListeners = new Array(); // listen only to these keycodes...
	this.ES = (parseInt(this.keyboard.map[0].char) == 186); // else BR
	this.listen = (typeof alwaysListen != 'undefined' ? alwaysListen : false);
	
	// rest of the functions
		/*
	CapsLock.js
	An object allowing the status of the caps lock key to be determined
	Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
	the terms of the CC0 1.0 Universal legal code:
	http://creativecommons.org/publicdomain/zero/1.0/legalcode
	MODIFIED BY Pescados Software (added support for legal acutes in spanish, portuguese, catalan)
	*/
	
	// create the CapsLock object
	this.CapsLock = (function(){
	  // initialise the status of the caps lock key
	  var capsLock = false;
	  // initialise the list of listeners
	  var listeners = [];
	  // store whether we are running on a Mac
	  var isMac = /Mac/.test(navigator.platform);
	  // Returns whether caps lock currently appears to be on.
	  function isOn(){
		return capsLock;
	  }
	  /* Adds a listener. When a change is detected in the status of the caps lock
	   * key the listener will be called, with a parameter of true if caps lock is
	   * now on and false if caps lock is now off. The parameter is:
	   *
	   * listener - the listener
	   */
	  function addListener(listener){
		// add the listener to the list
		listeners.push(listener);
	  }
	
	  /* Handles a key press event. The parameter is:
	   *
	   * e - the event
	   */
	   var valid
	  function handleKeyPress(e){
		// ensure the event object is defined
		if (!e) e = window.event;
		// store the prior status of the caps lock key
		var priorCapsLock = capsLock;
		// determine the character code
		var charCode = (e.charCode ? e.charCode : e.keyCode);
		//console.log('@capslock=> ' + charCode)
		// store whether the caps lock key is down
		if ((charCode >= 97 && charCode <= 122)||[225,233,237,243,250,252,224,232,242,239,241,231,226,227,234,244,245].indexOf(charCode)!=-1){ // check if lowercase (add "áéíóúüàèòïñçâãêôõ")
		  capsLock = e.shiftKey;
		}else if (((charCode >= 65 && charCode <= 90) || [193,201,205,211,218,220,192,200,210,207,209,199,194,195,202,212,213].indexOf(charCode)!=-1) && !(e.shiftKey && isMac)){ // check if uppercase (add "ÁÉÍÓÚÜÀÈÒÏÑÇÂÃÊÔÕ")
		  capsLock = !e.shiftKey;
		}
		// call the listeners if the caps lock key status has changed
		if (capsLock != priorCapsLock){
		  for (var index = 0; index < listeners.length; index ++){
			listeners[index](capsLock);
		  }
		}
	
	  }
	
	  // listen for key press events
	  if (window.addEventListener){
		window.addEventListener('keypress', handleKeyPress, false);
	  }else{
		document.documentElement.attachEvent('onkeypress', handleKeyPress);
	  }
	
	  // return the public API
	  return {
		isOn        : isOn,
		addListener : addListener
	  };
	})();
	
	this.showKB=function(){
		this.exists=true;
		this.dispatchEvent('raise',{});
		$('#kb').animate({bottom:this.bottomBarHeight});
		$('#showhide').data('hidden',false).animate({bottom:this.bottomBarHeight+this.showhideHeight+this.keyboard.height-this.graybarHeight-10});
		$('#textfield').attr('disabled','disabled');
		$('#textfieldFake').show();
		// listen only to keydown (physical keyboard)
		// and clicks to the virtual keyboard
		if(!this.listen)$(document).on('keypress keydown',this.kdF); // keydown!!! detects acutes, shift...
		$('#kb').on('touchstart mousedown',this.KBTouchF);
	}
	this.hideKB=function(){
		this.exists=false;
		this.dispatchEvent('shrink',{});
		$('#kb').animate({bottom:-this.keyboard.height-this.bottomBarHeight-this.graybarHeight});
		$('#showhide').data('hidden',true).animate({bottom:0});
		if(!$('#textfield').data('finished'))$('#textfield').removeAttr('disabled');
		$('#textfieldFake').hide();
		
		$('.key').css({backgroundPosition:'1500px 2500px'});
		$('#entr').attr('src',this.keyboard.ENTER.url);
		if(!this.listen)$(document).off('keypress keydown',this.kdF);
		$('#kb').off('touchstart mousedown',this.KBTouchF);
		$(document).off('touchend touchleave touchcancel mouseup mouseleave',this.endKBTouchF);
	}
	this.showHideKB=function(evt){
		if($(evt.target).data('hidden')){
			this.showKB();
		} else {
			this.hideKB();
		}
	}
	this.KBTouch=function(evt){ // virtual keyboard was touched
		evt.preventDefault();
		evt.stopImmediatePropagation();
		if(!$(evt.target).hasClass('key')) return;
		
		var ck = evt.target;
		if($(ck).hasClass('ENTER')){
			$('#entr').attr('src',this.keyboard.ENTER.down_url);
		} else {
			$(ck).css({backgroundPosition:'-' + $(ck).data('x') + 'px -'+ $(ck).data('y') +'px'});
		}
		
		$(document).one('touchend touchleave touchcancel mouseup mouseleave',this.endKBTouchF);
		this.smbl = $(evt.target).data('symbol');
		this.tevt = evt;
		this.touchTim = setTimeout(function(t){
			t.touchInt = setInterval(function(t){
				t.processSymbol(t.smbl,false,t.tevt);
			},100,t);
		},350,this);
	}
	this.endKBTouch=function(evt){
		evt.preventDefault();
		evt.stopImmediatePropagation();
		
		$(document).off('touchend touchleave touchcancel mouseup mouseleave',this.endKBTouchF);
		$('#kb').off().on('touchstart mousedown',this.KBTouchF);
		
		clearTimeout(this.touchTim);
		clearInterval(this.touchInt);
		this.processSymbol($(evt.target).data('symbol'),false,evt);
	}
	
	this.processSymbol=function(smb,evtt,evt){ // evtt = keyboard event, evt = touch or mousedown event
		var shiftActive = evtt ? evtt.shiftKey : false;
		
		// para algunos caracteres,algunos navegadores (IE, FF en Windows)
		// a veces envían un único keydown, o bien un keydown y 2 keypress
		// ¡NO PERMITIR!
		this.doubleEventLock=true;
		setTimeout(function(t){t.doubleEventLock=false},30,this);
		
		/*if((this.shiftLockON && "abcdefghijklmnñopqrstuvwxyzáéíóúüàèòïñçâãêôõ".indexOf(smb)!=-1) || (this.shiftLockON && (shiftActive||this.shiftON))){
			this.shiftLockON=false;
		} else {
			if(!this.shiftLockON && !(shiftActive||this.shiftON) && "ABCDEFGHIJKLMNÑOPQRSTUVWXYZÁÉÍÓÚÜÀÈÒÏÑÇÂÃÊÔÕ".indexOf(smb)!=-1)this.shiftLockON=true;
		}*/
		if(smb=='SHIFT'){
			if(this.shiftON){
				this.shiftON = false;
				$('.key').css({backgroundPosition:'1500px 2500px'});
			} else {
				this.shiftON = true;
			}
			this.dispatchEvent('type',{symbol:'SHIFT',keyboardEvent:evtt?true:false});
		} else if (smb=='SHIFT_LOCK') {
			if(this.shiftLockON) {
				this.shiftLockON = false;
				$('.key').css({backgroundPosition:'1500px 2500px'});
			} else {
				this.shiftLockON = true;
			}
			this.shiftON=false;
			this.dispatchEvent('type',{symbol:'SHIFT_LOCK',keyboardEvent:evtt?true:false});
		} else if (smb=='´') { // handle both ES and BR
			$('.key').css({backgroundPosition:'1500px 2500px'});
			if(this.shiftON||shiftActive) {
				this.dispatchEvent('type',{symbol:this.ES?'¨':'`',keyboardEvent:evtt?true:false});
				this.umlautON = this.ES;
				this.graveON = !this.ES;
			} else {
				this.dispatchEvent('type',{symbol:'´',keyboardEvent:evtt?true:false});
				this.acuteON = true;
			}
			this.shiftON=false;
		} else if (smb=='`') { // only ES
			$('.key').css({backgroundPosition:'1500px 2500px'});
			if(this.shiftON||shiftActive) {
				this.dispatchEvent('type',{symbol:'^',keyboardEvent:evtt?true:false});
				this.circON = true;
			} else {
				this.dispatchEvent('type',{symbol:'`',keyboardEvent:evtt?true:false});
				this.graveON = true;
			}
			this.shiftON=false;
		} else if (smb=='˜'||smb=='~') { // only BR
			$('.key').css({backgroundPosition:'1500px 2500px'});
			if(this.shiftON||shiftActive) {
				this.dispatchEvent('type',{symbol:'^',keyboardEvent:evtt?true:false});
				this.circON = true;
			} else {
				this.dispatchEvent('type',{symbol:'~',keyboardEvent:evtt?true:false});
				this.tildeON = true;
			}
			this.shiftON=false;
		} else if (smb=='6' && !this.ES && (this.shiftON||shiftActive)) { // only BR
			$('.key').css({backgroundPosition:'1500px 2500px'});
			this.dispatchEvent('type',{symbol:'¨',keyboardEvent:evtt?true:false});
			this.umlautON = true;
			this.shiftON=false;
		} else {
			$('.key').css({backgroundPosition:'1500px 2500px'});
			if(this.shiftLockON)$('.kSHIFT_LOCK').css({backgroundPosition:'-' + $('.kSHIFT_LOCK').data('x') + 'px -'+ $('.kSHIFT_LOCK').data('y') +'px'});
			var s;
			if(smb=='ENTER') {
				s='ENTER';
				$('#entr').attr('src',this.keyboard.ENTER.url);
			} else if (smb=='DEL') {
				s='DEL';
			} else if (smb=='TAB') {
				s='TAB';
			} else {
				if((this.shiftON || shiftActive) && smb == "'" && this.ES) { //DEBUG: ver cómo y si se puede hacer esta macarrada de otra manera
					s="?";
				} else {
					s = typeof evt != 'undefined' ? String.fromCharCode($(evt.target).data(this.shiftON || this.shiftLockON || shiftActive ? 'shift' : 'char')) : (this.shiftON || this.shiftLockON || shiftActive ? smb.toUpperCase() : smb);
					if(this.acuteON && "aeiouAEIOU".indexOf(s)!=-1)s=String("áéíóúÁÉÍÓÚ").charAt("aeiouAEIOU".indexOf(s));
					if(this.graveON && "aeiouAEIOU".indexOf(s)!=-1)s=String("àèìòùÀÈÌÒÙ").charAt("aeiouAEIOU".indexOf(s));
					if(this.umlautON && "aeiouAEIOU".indexOf(s)!=-1)s=String("äëïöüÄËÏÖÜ").charAt("aeiouAEIOU".indexOf(s));
					if(this.circON && "aeiouAEIOU".indexOf(s)!=-1)s=String("âêîôûÂÊÎÔÛ").charAt("aeiouAEIOU".indexOf(s));
					if(this.tildeON && "aoAO".indexOf(s)!=-1)s=String("ãõÃÕ").charAt("aoAO".indexOf(s));
				}
			}
			this.dispatchEvent('type',{symbol:s,keyboardEvent:evtt?true:false});
			//char(s);
			this.shiftON = this.acuteON = this.umlautON = this.graveON = this.circON = this.tildeON = false;
		}
		//$('#entr').attr('src',this.keyboard.ENTER.url);
		//if(this.shiftLockON)$('.kSHIFT_LOCK').css({backgroundPosition:'-' + $('.kSHIFT_LOCK').data('x') + 'px -'+ $('.kSHIFT_LOCK').data('y') +'px'});
	}
	
	//DEBUG: los acentos no funcionan en Firefox tecleando, en esta función (???)
	this.kd=function(evt){ // handle real (or soft) keyboard input
		if(this.doubleEventLock){
			this.doubleEventLock=false;
			return;
		}
		
		this.shiftLockON=this.CapsLock.isOn();
		if(this.exists){ // virtual keyboard on screen
		
		} else { // avisar
			if(letras&&numbers&&symbols) { // it's a game, show visuals!
				if(this.CapsLock.isOn()){
					if(!$('#cplck').length){
						$('<img id="cplck" src="data/imgs/capslock.png" style="width:104px; height:47px; position:absolute; top:350px; right:10px; z-index:10002;"/>').appendTo('.medio');
					}
					$('#cplck').show();
				} else {
					$('#cplck').hide();
				}
			}
		}
		// primero viene el keydown y luego el keypress... keydown detects acutes, shift... keypress me da las letras correctas, PERO no existe cuando se teclean mayúsculas, acentos o tabuladores...
		var k = (evt.which || evt.keyCode);
		var t = evt.type;
		this.was222 = false;
		
		//console.log([t,k].join(',')) // FF => 0 = acute 192 = grave
		if(t=='keydown'){
			if(this.keyboard.keydownDetection.indexOf(k)!=-1) {
				evt.preventDefault();
				this.processSymbol(this.keyboard.keydownEquivalen[this.keyboard.keydownDetection.indexOf(k)],evt);
			} else if(!this.ES && this.keyboard.BRSpecials.indexOf(k)!=-1){
				evt.preventDefault();
				var modifiers = this.keyboard.BREquivalents[this.keyboard.BRSpecials.indexOf(k)];
				this.processSymbol(modifiers&&evt.shiftKey?modifiers:this.keyboard.BREquivalents[this.keyboard.BRSpecials.indexOf(k)],evt);
			} else if ((isChrome || isSafari) && this.keyboard.CHSAIrregulars.indexOf(k)!=-1) {
				// 222 is the keydown for ´ ' and ", so do process on keypress
				if(k==222){
					this.was222=true;
					setTimeout(function(t,k){ // if keypress doesn't happen later, do type the acute!
						if(t.was222)t.processSymbol(t.keyboard.CHSAEquivalent[t.keyboard.CHSAIrregulars.indexOf(k)],evt);
					},25,this,k);
				} else {
					evt.preventDefault();
					this.processSymbol(this.keyboard.CHSAEquivalent[this.keyboard.CHSAIrregulars.indexOf(k)],evt);
				}
			} else if (isFirefox && this.keyboard.FFIrregulars.indexOf(k)!=-1) {
				if(k===0){
					// el 0 en FF puede ser ´ pero también ºª, mismo truco que con 222
					// no siempre va un keypress=0 después de un keydown=0 (Windows), así que dejamos esto aquí
					this.was222=true;
					setTimeout(function(t,k){ // if keypress doesn't happen later, do type the acute!
						if(t.was222){
							t.processSymbol(t.keyboard.FFEquivalent[t.keyboard.FFIrregulars.indexOf(k)],evt);
						}
					},25,this,k);
				} else {
					evt.preventDefault();
					if(isWin){
						this.processSymbol(this.keyboard.FFWinEquivalent[this.keyboard.FFIrregulars.indexOf(k)],evt);
					} else {
						this.processSymbol(this.keyboard.FFEquivalent[this.keyboard.FFIrregulars.indexOf(k)],evt);
					}
				}
			} else if (isIE && this.keyboard.IEIrregulars.indexOf(k)!=-1) {
				if(k==222){
					this.was222=true;
					setTimeout(function(t,k){ // if keypress doesn't happen later, do type the acute!
						if(t.was222)t.processSymbol(t.keyboard.CHSAEquivalent[t.keyboard.CHSAIrregulars.indexOf(k)],evt);
					},25,this,k);
				} else {
					evt.preventDefault();
					var modifiers = this.keyboard.IESModifiers[this.keyboard.IEIrregulars.indexOf(k)];
					this.processSymbol(modifiers&&evt.shiftKey?modifiers:this.keyboard.IEEquivalent[this.keyboard.IEIrregulars.indexOf(k)],evt);
				}
			}
			return;
		}

		this.was222 = false;
		if(k==13){
			k='ENTER';
		} else {
			if(isFirefox && k===0)k=180;// en FF la tilde es 0 en el keypress
			k = String.fromCharCode(k);
		}

		this.processSymbol(k,evt);
		evt.preventDefault();
	}
	


	
	this.showKBF=$.proxy(this.showKB,this);
	this.hideKBF=$.proxy(this.hideKB,this);
	this.showHideKBF=$.proxy(this.showHideKB,this);
	this.KBTouchF=$.proxy(this.KBTouch,this);
	this.endKBTouchF=$.proxy(this.endKBTouch,this);
	this.kdF=$.proxy(this.kd,this);
	this.CapsLockF=$.proxy(this.CapsLock,this);

	
		// initialize graphic elements
	if(!$('#kb').length){
		$('<div id="showhide">x</div>').data('hidden',true).css({zIndex:9989}).insertAfter($('#fr1')).on('mousedown',$.proxy(this.showHideKB,this));
		$('<div id="kb"></div>').css({position:'absolute',zIndex:9990,bottom:-this.keyboard.height-this.bottomBarHeight-this.graybarHeight,left:0,width:this.keyboard.width,height:this.keyboard.height,backgroundImage:'url('+this.keyboard.url+')',backgroundSize:this.keyboard.width + 'px ' + this.keyboard.height + 'px'}).insertAfter($('#fr1'));
	}
	
	// preload keyboard_down
	var ni = new Image();
	ni.src=this.keyboard.ENTER.down_url;
	// add ENTER key
	var enter = $('<img src="'+this.keyboard.ENTER.url+'" usemap="#ENTERMAP" id="entr">'); // was id="k13"
	$(enter).css({position:'absolute',top:0,left:0,width:this.keyboard.width,height:this.keyboard.height,width:this.keyboard.width,height:this.keyboard.height}).appendTo('#kb');
	$('<map name="ENTERMAP"><area class="key ENTER" shape="poly" coords="'+this.keyboard.ENTER.map.join(',')+'" data-id="k13" data-sound="'+this.keyboard.ENTER.sound+'" data-char="13" data-shift="13" data-symbol="ENTER"></map>').appendTo('#kb');
	if(this.keyboard.ENTER.sound && this.keyboard.ENTER.sound!=''){
		$('<audio preload="auto" class="sk13"><source src="data/audios/'+this.keyboard.ENTER.sound.split('mp3').join('ogg')+'" type="audio/ogg" /><source src="data/audios/'+this.keyboard.ENTER.sound+'" type="audio/mp3" /></audio>').appendTo('body');
	}
	
	for(var i=0;i<this.keyboard.map.length;i++){
		var k = this.keyboard.map[i];
		var xtraClass = k.symbol.length>1?' k'+k.symbol:'';
		var key = $('<div class="key'+(isNaN(k.char)?(''):' square')+' k'+k.shift+' k'+k.char+xtraClass+'"></div>');
		$(key).css({position:'absolute',
					width:k.w,
					height:k.h,
					left:k.l,
					top:k.t,
					backgroundRepeat:'no-repeat',
					backgroundImage:'url('+this.keyboard.down_url+')',
					backgroundSize:this.keyboard.width + 'px ' + this.keyboard.height + 'px',
					backgroundPosition:'-' + k.l + 'px -5000px'}/*'+k.t+'px'}*/
		).data({id:i,
				char:k.char,
				shift:k.shift,
				symbol:k.symbol,
				symbols:k.symbols,
				sound:k.sound,
				x:k.l,
				y:k.t}
		).appendTo('#kb');
		if(k.sound && k.sound!=''){
			$('<audio preload="auto" class="sk'+k.shift+' sk'+k.char+xtraClass+'"><source src="data/audios/'+k.sound.split('mp3').join('ogg')+'" type="audio/ogg" /><source src="data/audios/'+k.sound+'" type="audio/mp3" /></audio>').appendTo('body');
		}
		this.keyListeners.push(k.shift);
		this.keyListeners.push(k.char);
	}
	
	// start event EventDispatcher (reqs main.js)
	EventDispatcher.call(this);
	/* we inherit
	this.addEventListener(event, callback, caller)
	this.removeEventListener(event, callback)
	this.dispatchEvent(event, data)
	*/
	$(document).on('keypress keydown',null,'f1',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f2',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f3',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f4',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f5',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f6',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f7',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f8',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f9',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f10',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f11',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'f12',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'left',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'right',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'up',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	$(document).on('keypress keydown',null,'down',function(evt){evt.preventDefault();evt.stopImmediatePropagation();return false;});
	if(this.listen)$(document).on('keypress keydown',this.kdF); // listen physical keyboard by default
}

VirtualKeyboard.prototype = new EventDispatcher();