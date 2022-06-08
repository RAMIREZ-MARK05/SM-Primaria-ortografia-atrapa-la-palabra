var okTextColor='#72BF44';

var ctx;
function docPreInit(){
	$('#fr1').children().addClass('full');
	baseWidth = 960;
	baseHeight = 600;
	$('#anicanvas').attr('width',baseWidth);
	$('#anicanvas').attr('height',baseHeight);
	var cnv = document.getElementById('anicanvas');
	ctx = cnv.getContext('2d');
	ctx.font='29px SourceSansProBold';
	$('<style>.okis{color:'+okTextColor+';text-shadow: 0px 0px 3px rgba(255, 255, 255, 1);}</style>').appendTo('body');
}

var am,VK, userTxt, ip, sr; // insertion point, selection range
function fr1init(){
	$('#levelSelector,#repeat,#wordSnd').hide();
	$('#welcome').show();
	$('#start1').off().css({opacity:0.5});
	
	// setup audio para el enunciado
	try {
		if(instruccAudio){
			$('body').append('<audio preload="auto" id="instruccAudio"><source src="data/audios/'+instruccAudio.split('mp3').join('ogg')+'" type="audio/ogg" /><source src="data/audios/'+instruccAudio+'" type="audio/mp3" /></audio>');
			
			$('#inst').html('<a href="javascript:playSound(\'instruccAudio\',true)" class="tinyAudioButton '+ASIGNATURA.toLowerCase()+'" style="position:relative;top:3px;">h</a>&nbsp;' + localization[0]);
		}
	} catch (err) {}

	if(!VK){
		am = new AudioPlayer();
		am.addEventListener('audioEnd',audioStopped);

		VK = new VirtualKeyboard(keyboard,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,undefined,true);
		VK.addEventListener('type',char);
		VK.addEventListener('raise',doShowKeyboard);
		VK.addEventListener('shrink',doHideKeyboard);
		if(this.kdTA)$("textarea").keydown(kdTA);	
	}

	$('#points,#showhide,#lvlLbl,#lvlLbl2,#display,.genericButton').removeClass(ASIGNATURA.toLowerCase()).addClass(ASIGNATURA.toLowerCase());
	$('.genericButton').removeClass(ETAPA_EDUCATIVA.toLowerCase()).addClass(ETAPA_EDUCATIVA.toLowerCase());

	custom = typeof bolsaDePalabras != 'undefined' && bolsaDePalabras.length;
	
	// prepare animations for later
	loadCanvas();
	playSound('desierto');
	playSound(false,false);
	$('#fr1').children().css('transform','translate3d(0,0,0)');
	$('#showhide,#kb').css('transform','translate3d(0,0,0)');
}
function fr1posInit(){
}

function animReady(){
	exportRoot.gotoAndStop(0);
	exportRoot.formica1.gotoAndStop(0);exportRoot.formica1.formica.gotoAndStop(0);
	exportRoot.formica2.gotoAndStop(0);exportRoot.formica2.formica.gotoAndStop(0);
	exportRoot.formica3.gotoAndStop(0);exportRoot.formica3.formica.gotoAndStop(0);
	exportRoot.formica4.gotoAndStop(0);exportRoot.formica4.formica.gotoAndStop(0);
	if(!exportRoot.formica1.xx){
		exportRoot.formica1.xx = exportRoot.formica1.x;
		exportRoot.formica2.xx = exportRoot.formica2.x;
		exportRoot.formica3.xx = exportRoot.formica3.x;
		exportRoot.formica4.xx = exportRoot.formica4.x;
	} else {
		exportRoot.formica1.x = exportRoot.formica1.xx;
		exportRoot.formica2.x = exportRoot.formica2.xx;
		exportRoot.formica3.x = exportRoot.formica3.xx;
		exportRoot.formica4.x = exportRoot.formica4.xx;
	}
	
	if(!atmintt)exportRoot.bg.tarde.alpha=exportRoot.bg.noche.alpha=0;
	exportRoot.bg.cache(0,0,960,600);
	
	//textLoc(true);
	var xxx = $('.logo').width() + parseInt($('.logo').css('right')) + 7;
	$('#display,#lvlLbl').html('').css({right:xxx});
	
	$('#start1').css({opacity:1}).off().on('click',function(){
		if(!isPlaying('desierto')){
			playSound('desierto');
			playSound(false,false);
		}
		$('#welcome').hide();
		$('.lvl').css({opacity:1});
		$('#start2').css({opacity:0.5}).off();
		if(custom){
			doStart();
		} else {
			$('#levelSelector').show();
			$('.lvl').off().on('click',chooseLvl);
		}
	});
}

var level;
function chooseLvl(){
	$('.lvl').css({opacity:0.5});
	$(this).css({opacity:1});
	level = parseInt($(this).attr('id').substring(1,2));
	$('#start2').css({opacity:1}).off().on('click',function(){
		$('#levelSelector').hide();
		doStart();
	});
}

var roundsPerLevel = 3;
var distance = 1;
var maxSpeed = 20;
var speed = 100; // milliseconds
var userAges = [5,6,7,8,9,10,11,12,13,14];
var speedIncrements = [0.1,0.15,0.15,0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5];
var speedIncrement = 0.5;

var queue,codes,charx;
var addTime = 4000; // milliseconds
var addTimeIncrements = [100,150,200,200,250,250,300,350,400,450,500];
var addTimeIncrement = 500;
var minAddTime = 600;
var speedCnt;
var speedCntModifiers = [45,40,35,30,28,25,23,22,20,20,18];
var speedCntModifier = 18;


var addTimer;
var addTimerDelay;
var updateTimer;
var pts;

var currentLevel;
var levelRounds;
var roundsEllapsed;
var letrasDied;
var died;

var si = "paduuu";
var no = "honk";

var limits;
var mcHeight;
var sourc;
var atmintt;
var custom;
function doStart(){
	if(!atmintt)atmintt=setInterval(atmosphear,10000);
	distance = 1;
	currentLevel = 0;
	roundsEllapsed = 0;
	died = false;
	pts=0;
	nformiName = formiName = '';
	
	if(custom){
		sourc = bolsaDePalabras.slice();
		// preload sounds if any and possible
		for(var i=0;i<bolsaDePalabras.length;i++){
			var s = bolsaDePalabras[i];
			if(typeof s.audio != 'undefined' && s.audio !=''){
				var a = s.audio.substring(0,s.audio.lastIndexOf('.'));
				s.audioID = "word"+i;
				$('<audio preload="auto" id="word'+i+'"><source src="'+a+'.mp3" type="audio/mp3" /><source src="'+a+'.ogg" type="audio/ogg" /></audio>').appendTo('body');
			}
		}
	} else {
		if(typeof v1pp == 'string'){
			$('#texto').data({left:$('#texto').css('left')})
			v1pp=v1pp.split(',');
			v1ps=v1ps.split(',');
			v2ps=v2ps.split(',');
			v2pp=v2pp.split(',');
			v3ps=v3ps.split(',');
			v3pp=v3pp.split(',');
			pmadj=pmadj.split(',');
			smadj=smadj.split(',');
			sfadj=sfadj.split(',');
			pfadj=pfadj.split(',');
			pmnames=pmnames.split(',');
			pfnames=pfnames.split(',');
			sfnames=sfnames.split(',');
			smnames=smnames.split(',');
			chilabas = chilabas.split(',');
			rare = rare.split(',');
			npf = npf.split(',');
			npm = npm.split(',');	
		}
		sourc = new Array();
		sourc = sourc.concat(sfnames,smnames,v1pp,v2ps,pmadj,v2pp,smadj,pmnames,sfadj,pfadj,v3ps,v1ps,v3pp,pfnames);

		if(userAge>14)userAge=14;
		if(userAge<3)userAge=3;
		if(userAge>9)sourc=sourc.concat(npf,npm);
		var tmpsourc = new Array();
	/*
	- usuarios < 8, no usan palabras de más de 8 caracteres
	- usuarios < 6, no usan palabras de más de 5 caracteres
	*/
		if (userAge<6){
			for(i=0;i<sourc.length;i++) if(sourc[i].length<6)tmpsourc.push(sourc[i]);
			sourc = tmpsourc.slice();
		} else if(userAge<8) {
			for(var i=0;i<sourc.length;i++) if(sourc[i].length<9)tmpsourc.push(sourc[i]);
			sourc = tmpsourc.slice();
		}
		tmpsourc = null;
	}
	$('#points').html(pts);
	$('#texto').html('').hide();
	$('#imagen').empty().hide();
	setTimeout(function(){
		fadeSound('desierto','out');
		playSound('bumblebee');
		document.getElementById('bumblebee').volume=0.05;
		fadeSound('bumblebee','in');
		playSound(false,false);
	}, 250);
	
	startLevel();
}
var atmoStage = 0;
function atmosphear(){
	atmoStage++;
	if(atmoStage==20){
		exportRoot.bg.tarde.alpha=0;
	}
	if(atmoStage<11){
		exportRoot.bg.tarde.alpha=atmoStage/10;
	} else if (atmoStage<21){
		exportRoot.bg.noche.alpha=(atmoStage-10)/10;
	} else if (atmoStage<31){
		exportRoot.bg.noche.alpha-=.1;
	} else {
		atmoStage = 0;
		exportRoot.bg.noche.alpha=exportRoot.bg.tarde.alpha=0;
	}
	exportRoot.bg.cache(0,0,960,600);
	//stage.update();
}

var txtle;
function startLevel(){
	if(custom)return startRound();
	currentLevel++;
	//$('#lvlLbl').html(localization[2].split('XXX').join(currentLevel));
	
	$('#lvlLbl').css({top:280,fontSize:12}).html(localization[2].split('XXX').join(currentLevel)).animate({fontSize:42,top:240},500,function(){
		$(this).animate({fontSize:48,top:260},150,function(){
			setTimeout(function(){
				$('#lvlLbl').animate({top:250},500,function(){
					$(this).animate({top:900},250);
				})
			}, 2000);	
		})
	});

	roundsEllapsed = 0;
	startRound();
}
function startRound(){
	roundsEllapsed++;
	if(!custom && roundsEllapsed>3){
		return startLevel();
	}
	if(custom){
		$('#display').html(localization[16].split('YYY').join(sourc.length));
	} else {
		$('#display').html(localization[4].split('XXX').join(roundsEllapsed).split('YYY').join('3'));
	}
	
	distance = (currentLevel*.1) + (userAge*.15) + ((level-1)*.5);
	distance *= 0.85;
	
	if(custom)distance = velocidad;

	addWord();
}

var txtShowed;
var bam;
var txtHidden;
function showText(){
	if(txtShowed)return;
	var inLft = 20;
	var inWdt = bam==4?283:(bam===1) ? 250 : (bam==2 ? 265 : 280);
	
	var ttxt = txtle;
	txtHidden = custom && (hasImg || hasSnd) && !wordObj.visible;
	if(txtHidden)ttxt='';
	$('#texto').data({left:inLft,cleft:inLft}).css({top:200,left:inLft,width:inWdt}).html(ttxt).fadeIn(function(){$(this).show()});
	if(hasImg){
		$('#imagen').empty().css({left:32}).append('<img src="'+wordObj.imagen+'" />').fadeIn();
		$('#texto').css({top:207});
	}
	txtShowed=true;
}
var formiName='';
var nformiName;
var hasImg, hasSnd;
var currentAudio;
var wordObj;
function setFormiFromWord(txtle){
	ctx.font='29px SourceSansProBold';
	var ww = ctx.measureText(txtle).width;
	if(isNaN(ww) || ww<10){
		bam = txtle.length<6?1:(txtle.length<11?2:3);
	} else {
		bam = ww<83?1:(ww<175?2:3);
	}
	
	nformiName = formiName;
	formiName=(bam===1) ? 'formica1' : (bam==2 ? 'formica2' : 'formica3');
	formi = exportRoot[formiName];
}
var wordIn;
function addWord(){
	hasImg = false;
	hasSnd = false;
	if(custom){
		//var current = ((currentLevel-1)*3)+(roundsEllapsed-1);
		//var s = sourc[current];
		wordObj = sourc.shift();
		txtle = wordObj.palabra;
		hasImg = typeof wordObj.imagen != 'undefined' && wordObj.imagen!='';
		hasSnd = typeof wordObj.audio != 'undefined' && wordObj.audio !='';
		if(hasSnd){
			currentAudio = wordObj.audioID;
			wordIn=false;
			$('#wordSnd').off().on('click',function(){
				document.getElementById('bumblebee').volume = 0.2;
				$(this).stopShine();
				am.playAudio(currentAudio);
				if(!wordIn)throwWord();
			}).show().doShine();
		} else {
			$('#wordSnd').hide();
		}
		if(!hasImg){ // just a word
			setFormiFromWord(txtle);
		} else {
			bam = 4;
			formiName = 'formica4';
			formi = exportRoot.formica4;
		}
	} else {
		if(currentLevel<9 || userAge<6) {
			txtle = rw();
		} else {
			if(currentLevel<14 || userAge<10){ // create from sílabas
				/*
				para nivel 9 => 4-(13-currentLevel) = 0
				para nivel 10 => 4-(13-currentLevel) = 1
				para nivel 11 => 4-(13-currentLevel) = 2
				para nivel 12 => 4-(13-currentLevel) = 3
				para nivel 13 => 4-(13-currentLevel) = 4
				*/
				var dif = 4-(13-currentLevel);
				if(userAge<6){
					dif = 2;
				} else {
					if(dif>4)dif=4;
					dif = dif<1?2:(dif<3?3:4);
					if(level==1){ // level 1, máx 2 syllabes
						dif--;
						if(dif<2)dif=2;
					}
					if(level==3)dif++; // level 3, increase syllabes by 1
					if (userAge<8 && dif>3)dif=3;
				}
				txtle = rwQ(dif);
			} else {
				txtle = rwR();
			}
		}
		setFormiFromWord(txtle);
	}
	
	userTxt='';
	if(hasSnd){
		
	} else {
		if(nformiName==formiName){
			wInt = setInterval(waitFormi,20);
		} else {
			throwWord();
		}
	}
}
function audioStopped(){
	document.getElementById('bumblebee').volume = 1;
	if(!wordIn){
		wordIn=true;
	}
}
function throwWord(){
	formi.gotoAndStop(0);
	formi.x=formi.xx;
	formi.formica.bamboo.txt.text = '';
	txtShowed=false;
	formi.formica.gotoAndPlay(1);
	doWalk = false;
	setTimeout(function(){
		showText();
		formi.gotoAndStop('walk');
		formi.ini = new Date().getTime();
		formi.f1.bamboo.txt.text='';
		doWalk = true;
	},1000);
	
	updateTimer = setInterval(update,40);
}
var wInt;
function waitFormi(){
	if(exportRoot[nformiName].currentFrame>47){
		clearInterval(wInt);
		throwWord();
	}
}
function rw(){
	return sourc[rand(0,sourc.length-1)];
}
function rwR(){
	return rare[rand(0,rare.length-1)];
}
function rwS(){
	return chilabas[rand(0,chilabas.length-1)];
}
function rwQ(l){
	tmp = '';
	for(var i=0;i<l;i++){
		tmp += rwS();
	}
	return tmp;
}

var formi;
var doWalk;
function update(){
	if(!doWalk)return;
	
	if((formi.x)>=750){
		clearInterval(updateTimer);
		$('#texto').hide();
		if(hasImg)$('#imagen').fadeOut();
		formi.gotoAndPlay('throw');
		if(isFirefox)formi.bamboose.txt.y=6.5;
		formi.bamboose.txt.text=txtle;
		if(custom){
			sourc.push(wordObj);
			$('#wordSnd').stopShine().off().hide();
			clearInterval(updateTimer);
			//pts-=(txtle.length);
			//$('#points').html(pts);
			//$('<p class="dist '+ASIGNATURA.toLowerCase()+'">–'+txtle.length+'</p>').css({left:450}).appendTo('#fr1').animate({opacity:0},500,function(){$(this).remove()});
			setTimeout(function(){
				startRound();
			}, 2000);
		} else {
			doEnd();
		}
	} else {
		var ellapsed = new Date().getTime()-formi.ini;
		var xxx = (ellapsed*distance)/40;
		formi.x = formi.xx + xxx;
		var txx = $('#texto').data('left')+xxx;
		$('#texto').css('left',txx);
		$('#imagen').css('left',txx+13);
	}
}

function doEnd(){
	died=true;
	sendMessage({status:'finished',ok:custom});
	setTimeout(function(){
		fadeSound('bumblebee','out');
		playSound('desierto');
		document.getElementById('desierto').volume=0.05;
		fadeSound('desierto','in');
		playSound(false,false);

		$('#lvlLbl2').css({top:280,fontSize:12}).html(localization[3]).show().animate({fontSize:42,top:200},500,function(){
			$(this).animate({fontSize:48,top:220},150);
		});
		$('#stars').show().children().remove();
		var ndd = custom ? 10 : (currentLevel>10?10:currentLevel)
		for(var i=0;i<ndd;i++){
			setTimeout(function(){$('<div class="star-five"></div>').appendTo('#stars');playSound('coin');},custom ? 250 * i : 500*i);
			if(i==(ndd-1))setTimeout(function(){
				$('#repeat').show().off().one('click',function(){
					goframe(0);
					$('#stars,#repeat,#lvlLbl2').hide();
				});
				if(isLast && !isStandalone) { // only the carcasa puede hacerlo
					$('#beginning').show().off().one('click',function(){
						sendMessage('repeat');
						$(this).hide();
					});
				}
			},custom ? 250 * i : 500*i);
		}
	},2500);
}

var kVisible = false;
function doShowKeyboard(){ // keyboard is gonna be shown
	$("textarea").off();
	$('.full').removeClass('full');
	kVisible = true;
}
function kdTA(e){
	if((e.charCode === 9 || e.keyCode === 9)) { // tab was pressed
		// get caret position/selection
		var start = this.selectionStart;
		var end = this.selectionEnd;

		var $this = $(this);
		var value = $this.val();

		// set textarea value to: text before caret + tab + text after caret
		$this.val(value.substring(0, start)
					+ "	"
					+ value.substring(end));

		// put caret at right position again (add one for the tab)
		this.selectionStart = this.selectionEnd = start + 1;

		// prevent the focus lose
		e.preventDefault();
	}
}
function doHideKeyboard(){ // keyboard is gonna be hidden
	$("textarea").keydown(kdTA);
	$('#fr1>*').addClass('full');
	kVisible = false;
}

var diac;
function hiliteKeyboard(t,onlySound){
	if(!kVisible)return;
	var ck;

	if(keyboard.keydownEquivalen.indexOf(t)!=-1){
		if(t=='ENTER') {
			if(!onlySound){
				$('#entr').attr('src',keyboard.ENTER.down_url);
				setTimeout(function(){$('#entr').attr('src',keyboard.ENTER.url);},keyboard.hiliteTime);
			}
			if(document.getElementsByClassName('sk13').length)playSound(document.getElementsByClassName('sk13')[0],true);
		} else {
			if(!onlySound){
				ck='.k'+t;
				if(t=='SHIFT') {
					var ck1 = $(ck)[0];
					var ck2 = $(ck)[1];
					$(ck1).css({backgroundPosition:'-' + $(ck1).data('x') + 'px -'+ $(ck1).data('y') +'px'});
					$(ck2).css({backgroundPosition:'-' + $(ck2).data('x') + 'px -'+ $(ck2).data('y') +'px'});
				} else {
					$(ck).css({backgroundPosition:'-' + $(ck).data('x') + 'px -'+ $(ck).data('y') +'px'});
					if(t=='SHIFT_LOCK'&&VK.shiftLockON){
					} else {
						setTimeout(function(t){$(t).css({backgroundPosition:"1500px 2500px"});},keyboard.hiliteTime,ck);
					}
				}
			}
			if(document.getElementsByClassName('sk'+t).length)playSound(document.getElementsByClassName('sk'+t)[0],true);
		}
	} else {
		if(!onlySound){
			if("áàäâãéèëêíìïîóòöôõúùüûÁÀÄÂÃÉÈËÊÍÌÏÎÓÒÖÔÕÚÙÜÛ".indexOf(t)!=-1) { // attemp to hilite base chars
				try {
					t = t.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
				} catch (err) {
					t = removeDiacritix(t);
				}
			}
			
			ck = '.k'+t.charCodeAt(0);
			$(ck).css({backgroundPosition:'-' + $(ck).data('x') + 'px -'+ $(ck).data('y') +'px'});
			setTimeout(function(t){$(t).css({backgroundPosition:"1500px 2500px"});},keyboard.hiliteTime,ck);
		}

		if(document.getElementsByClassName('sk'+t.charCodeAt(0)).length)playSound(document.getElementsByClassName('sk'+t.charCodeAt(0))[0],true);
	}
}
var ip,diac,diact;
function char(evt){
	if(died || !doWalk)return;
	var t = evt.data.symbol;
	if(gerrors&&!diac&&t!='DEL')return;
	if(t=='DEL'||t=='ENTER'||t=='TAB'||t=='SHIFT'||t=='SHIFT_LOCK'){
		return;
	} else {
		var prevWasDiac = diac;
		if('´`¨^~'.indexOf(t)!=-1) { // diacritical
			diac = true;
			diact = t;
		} else {
			diac = false;
		}
	}

	if(diac) {
		if(t=='a'){
			t = "áàäâã".charAt('´`¨^~'.indexOf(diact));
		} else if (t=='A'){
			t = "ÁÀÄÂÃ".charAt('´`¨^~'.indexOf(diact));
		} else if(t=='e'){
			try {
				t = "éèëê".charAt('´`¨^'.indexOf(diact));
			} catch (err) { return }
		} else if (t=='E'){
			try {
				t = "ÉÈËÊ".charAt('´`¨^'.indexOf(diact));
			} catch (err) { return }
		} else if(t=='i'){
			try {
				t = "íìïî".charAt('´`¨^'.indexOf(diact));
			} catch (err) { return }
		} else if (t=='I'){
			try {
				t = "ÍÌÏÎ".charAt('´`¨^'.indexOf(diact));
			} catch (err) { return }
		} else if(t=='o'){
			t = "óòöôõ".charAt('´`¨^~'.indexOf(diact));
		} else if (t=='O'){
			t = "ÓÒÖÔÕ".charAt('´`¨^'.indexOf(diact));
		} else if(t=='u'){
			try {
				t = "úùüû".charAt('´`¨^'.indexOf(diact));
			} catch (err) { return }
		} else if (t=='U'){
			try {
				t = "ÚÙÜÛ".charAt('´`¨^'.indexOf(diact));
			} catch (err) { return }
		}
	}
	userTxt+=t;
	
	if(evt.data.keyboardEvent){
		hiliteKeyboard(t);
	} else {
		hiliteKeyboard(t,true);
	}
	doCheck();
}
var gerrors;
function doCheck(){
	// evaluate last char
	var ndx = userTxt.length-1;
	var lastT = txtle.charAt(ndx);
	var lastU = userTxt.charAt(ndx);

	var ntxt = doFilter(lastU);
	var dtxt = doFilter(lastT);
	
	if(ntxt == dtxt) {
		if (txtle.length==userTxt.length){ // explode word
			formi.gotoAndPlay('flyaway');
			formi.bamboos.txt.text=txtle;
			formi.bamboos.txt.color='#72BF44';
			formi.bamboos.txt.shadow = new createjs.Shadow("#FFFFFF", 0, 0, 3);
			$('#texto').hide();
			playSound('flap');
			clearInterval(updateTimer);
			
			var targetX = 750;
			var pRun = formi.x - formi.xx; // eg 70
			var distanceBonus = Math.round(targetX/pRun); // this will be allways between 1 and 10
			if(distanceBonus>10)distanceBonus=10;

			pts+=(txtle.length+distanceBonus);
			$('#points').html(pts);
			
			var disp = (bam===1) ? 20 : (bam==2 ? 180 : 300);

			$('<p class="dist '+ASIGNATURA.toLowerCase()+'">'+txtle.length+'+'+distanceBonus+'</p>').css({left:formi.x}).appendTo('#fr1').animate({opacity:0},500,function(){$(this).remove()});
			
			
			var goAhead = true;
			if(custom){
				if(hasImg)$('#imagen').fadeOut();
				if(hasSnd)$('#wordSnd').fadeOut();
				$('#display').html(localization[16].split('YYY').join(sourc.length));
				goAhead = sourc.length>0;
			}
			if(goAhead) {
				setTimeout(function(){
					startRound();
				}, 2000);
			} else {
				doEnd()
			}
		} else { // flag as OK
			var resting = txtle.substring(ndx+1,txtle.length);
			if(txtHidden)resting = '';
			$('#texto').html('<span class="okis">'+userTxt+'</span>'+resting);
		}
	} else {
		var userEnteredAcute = "´`¨^~".indexOf(ntxt)!=-1;
		var nextCharIsAcuted = "áéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛãõÃÕ".indexOf(dtxt)!=-1;
		if(userEnteredAcute && nextCharIsAcuted){
		} else {
			playSound('mal');
		}
		userTxt=userTxt.substring(0,ndx);

		/*playSound('mal');
		userTxt=userTxt.substring(0,ndx);*/
	}
}



function doFilter(txt){
	var f = filters.slice();
	var fil;
	while (f.length) {
		fil = f.shift();
		switch(fil){
			case 1: // convierte espacios dobles en simples
				var yeah;
				while(!yeah) {
					var itxt = ""+txt;
					txt = txt.replace(/  /gi, " ");
					yeah=txt==itxt;
				}
				break;
			case 2: // elimina saltos de párrafo y tabuladores
				txt = txt.replace(/[\n\r]/gi, "");
				break;
			case 3: // case-insensitive ("a" equivale a "A")
				txt = txt.toLowerCase();
				break;
			case 4: // diacritical-insensitive ("a" equivale a "á", "à", "ä" y "â")
				try {
					txt = txt.normalize('NFD').replace(/[\u0300-\u036f]/g,"");
				} catch (err) {
					txt = removeDiacritix(txt);
				}
				break;
			case 5: // space + RETURN or .,;:!?”’)}]…
				txt = txt.replace(/ [\n\.,;:!?”’\)\}\]…]/gi,"");
				break;
			case 6: // punctuation-insensitive (se ignoran los siguientes caracteres: .,;:¡!¿?'“”‘’"(){}[]…-–—_)
				txt = txt.replace(/[\.,;:¡!¿?'“”‘’"\(\)\{\}\[\]…\-–—_]/gi,"");
				break;
		}
	}
	return txt;
}


function removeDiacritix(txt){
    var defaultDiacriticsRemovalMap = [
        {'base':'A', 'letters':'\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F'},
        {'base':'E', 'letters':'\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E'},
        {'base':'I', 'letters':'\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197'},
        {'base':'O', 'letters':'\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C'},
        {'base':'U', 'letters':'\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244'},
        {'base':'a', 'letters':'\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250'},
        {'base':'e', 'letters':'\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD'},
        {'base':'i', 'letters':'\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131'},
        {'base':'o', 'letters':'\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275'},
        {'base':'u','letters': '\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289'}/*,
        {'base':'AA','letters':'\uA732'},
        {'base':'AE','letters':'\u00C6\u01FC\u01E2'},
        {'base':'AO','letters':'\uA734'},
        {'base':'AU','letters':'\uA736'},
        {'base':'AV','letters':'\uA738\uA73A'},
        {'base':'AY','letters':'\uA73C'},
        {'base':'B', 'letters':'\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181'},
        {'base':'C', 'letters':'\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E'},
        {'base':'D', 'letters':'\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779\u00D0'},
        {'base':'DZ','letters':'\u01F1\u01C4'},
        {'base':'Dz','letters':'\u01F2\u01C5'},
        {'base':'F', 'letters':'\u0046\u24BB\uFF26\u1E1E\u0191\uA77B'},
        {'base':'G', 'letters':'\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E'},
        {'base':'H', 'letters':'\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D'},
        {'base':'J', 'letters':'\u004A\u24BF\uFF2A\u0134\u0248'},
        {'base':'K', 'letters':'\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2'},
        {'base':'L', 'letters':'\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780'},
        {'base':'LJ','letters':'\u01C7'},
        {'base':'Lj','letters':'\u01C8'},
        {'base':'M', 'letters':'\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C'},
        {'base':'N', 'letters':'\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4'},
        {'base':'NJ','letters':'\u01CA'},
        {'base':'Nj','letters':'\u01CB'},
        {'base':'OI','letters':'\u01A2'},
        {'base':'OO','letters':'\uA74E'},
        {'base':'OU','letters':'\u0222'},
        {'base':'OE','letters':'\u008C\u0152'},
        {'base':'oe','letters':'\u009C\u0153'},
        {'base':'P', 'letters':'\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754'},
        {'base':'Q', 'letters':'\u0051\u24C6\uFF31\uA756\uA758\u024A'},
        {'base':'R', 'letters':'\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782'},
        {'base':'S', 'letters':'\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784'},
        {'base':'T', 'letters':'\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786'},
        {'base':'TZ','letters':'\uA728'},
        {'base':'V', 'letters':'\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245'},
        {'base':'VY','letters':'\uA760'},
        {'base':'W', 'letters':'\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72'},
        {'base':'X', 'letters':'\u0058\u24CD\uFF38\u1E8A\u1E8C'},
        {'base':'Y', 'letters':'\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE'},
        {'base':'Z', 'letters':'\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762'},
        {'base':'aa','letters':'\uA733'},
        {'base':'ae','letters':'\u00E6\u01FD\u01E3'},
        {'base':'ao','letters':'\uA735'},
        {'base':'au','letters':'\uA737'},
        {'base':'av','letters':'\uA739\uA73B'},
        {'base':'ay','letters':'\uA73D'},
        {'base':'b', 'letters':'\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253'},
        {'base':'c', 'letters':'\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184'},
        {'base':'d', 'letters':'\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A'},
        {'base':'dz','letters':'\u01F3\u01C6'},
        {'base':'f', 'letters':'\u0066\u24D5\uFF46\u1E1F\u0192\uA77C'},
        {'base':'g', 'letters':'\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F'},
        {'base':'h', 'letters':'\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265'},
        {'base':'hv','letters':'\u0195'},
        {'base':'j', 'letters':'\u006A\u24D9\uFF4A\u0135\u01F0\u0249'},
        {'base':'k', 'letters':'\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3'},
        {'base':'l', 'letters':'\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747'},
        {'base':'lj','letters':'\u01C9'},
        {'base':'m', 'letters':'\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F'},
        {'base':'n', 'letters':'\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5'},
        {'base':'nj','letters':'\u01CC'},
        {'base':'oi','letters':'\u01A3'},
        {'base':'ou','letters':'\u0223'},
        {'base':'oo','letters':'\uA74F'},
        {'base':'p','letters':'\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755'},
        {'base':'q','letters':'\u0071\u24E0\uFF51\u024B\uA757\uA759'},
        {'base':'r','letters':'\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783'},
        {'base':'s','letters':'\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B'},
        {'base':'t','letters':'\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787'},
        {'base':'tz','letters':'\uA729'},
        {'base':'v','letters':'\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C'},
        {'base':'vy','letters':'\uA761'},
        {'base':'w','letters':'\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73'},
        {'base':'x','letters':'\u0078\u24E7\uFF58\u1E8B\u1E8D'},
        {'base':'y','letters':'\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF'},
        {'base':'z','letters':'\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763'}*/
    ];

    var diacriticsMap = {};
    for (var i=0;i<defaultDiacriticsRemovalMap.length;i++){
        var letters=defaultDiacriticsRemovalMap[i].letters;
        for (var j=0;j<letters.length;j++){
            diacriticsMap[letters[j]] = defaultDiacriticsRemovalMap[i].base;
        }
    }

    // "what?" version ...
    function removeDiacritics (str) {
        return str.replace(/[^\u0000-\u007E]/g, function(a){ 
           return diacriticsMap[a] || a; 
        });
    }    
    return removeDiacritics(txt);	
}





/*
KIT de funciones para manejar un canvas de animación
*/

var canvas, stage, exportRoot, baseinterval, framerate, cintl, cfps, currentFrame, totalFrames, loader;
var anim_container, dom_overlay_container, fnStartAnimation, AdobeAn, comp, images;

function loadCanvas(){
	currentFrame=0;
	currentSequence=0;
	if(!exportRoot) {
		canvas = document.getElementById("anicanvas");
		anim_container = document.getElementById("animation_container");
		dom_overlay_container = document.getElementById("dom_overlay_container");
		comp=AdobeAn.getComposition("PAQUITO_FOREVER_I_LOVE_YOU_ORNOT");
		var lib=comp.getLibrary();
		createjs.MotionGuidePlugin.install();
		images = comp.getImages()||{};
		if(lib.properties.manifest.length) {
			try {
				var loader = new createjs.LoadQueue(false);
			} catch (err) {
				throw new Error('PROBABLEMENTE FALTE esto: <script type="text/javascript" src="../../../../cv_js/preloadjs-0.4.1.min.js"></script>');
				//throw new Error(err);
			}
			loader.addEventListener("fileload", handleFileLoad);
			loader.addEventListener("complete", handleComplete);
			loader.loadManifest(lib.properties.manifest);
		} else {
			handleComplete()
		}
	} else {
		animReady();
	}
}

function handleFileLoad(evt) {
	if (evt && (evt.item.type == "image")) { images[evt.item.id] = evt.result; }	
}

function handleComplete() {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib=comp.getLibrary();
	var ss=comp.getSpriteSheet();
	if(ss && ss.length) {
		var queue = evt.target;
		var ssMetadata = lib.ssMetadata;
		for(i=0; i<ssMetadata.length; i++) {
			ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames} )
		}
	}
	exportRoot = new lib.ella();
	stage = new lib.Stage(canvas);

	//Code to support hidpi screens and responsive scaling.
	function makeResponsive(isResp, respDim, isScale, scaleType) {		
		var lastW, lastH, lastS=1;		
		window.addEventListener('resize', resizeCanvas);		
		resizeCanvas();		
		function resizeCanvas() {			
			var w = lib.properties.width, h = lib.properties.height;			
			var iw = window.innerWidth, ih=window.innerHeight;			
			var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;			
			if(isResp) {                
				if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {                    
					sRatio = lastS;                
				}				
				else if(!isScale) {					
					if(iw<w || ih<h)						
						sRatio = Math.min(xRatio, yRatio);				
				}				
				else if(scaleType==1) {					
					sRatio = Math.min(xRatio, yRatio);				
				}				
				else if(scaleType==2) {					
					sRatio = Math.max(xRatio, yRatio);				
				}			
			}			
			canvas.width = w*pRatio*sRatio;			
			canvas.height = h*pRatio*sRatio;
			canvas.style.width = dom_overlay_container.style.width = anim_container.style.width =  w*sRatio+'px';				
			canvas.style.height = anim_container.style.height = dom_overlay_container.style.height = h*sRatio+'px';
			stage.scaleX = pRatio*sRatio;			
			stage.scaleY = pRatio*sRatio;			
			lastW = iw; lastH = ih; lastS = sRatio;            
			stage.tickOnUpdate = false;            
			stage.update();            
			stage.tickOnUpdate = true;		
		}
	}
	makeResponsive(false,'both',false,1);	
	AdobeAn.compositionLoaded(lib.properties.id);

	stage.addChild(exportRoot);
	createjs.Ticker.setFPS(lib.properties.fps);
	createjs.Ticker.addEventListener("tick", stage);
	//createjs.Ticker.addEventListener("tick", textLoc);

		// setup framerate
	if(!framerate) {
		framerate = lib.properties.fps;
		baseinterval = createjs.Ticker.getInterval();
		cintl = baseinterval;
		cfps = framerate;
		createjs.Ticker.setInterval(cintl);// reset this
		createjs.Ticker.setFPS(cfps);//reset this
		totalFrames = exportRoot.timeline ? exportRoot.timeline.duration : 1;
	}

	animReady();
}


var lastfr;
function textLoc(skip){
	if(skip===true){
		var cfm = exportRoot.currentFrame;
		if(cfm!=lastfr) {
			//console.log('loop frame ' + cfm + " children " + exportRoot.getNumChildren())
			traverseNode(exportRoot);
			lastfr=cfm;
		}
	}
}

function traverseNode(node){
	for(var i=0;i<node.getNumChildren();i++){
		var n = node.getChildAt(i);
		try {
			if(n.name.substring(0,1)=='t')n.text = localization[n.name.substring(1,1000)*1];
		} catch (err) {
			try {
				traverseNode(n);
			} catch (err) {}
		}
	}
}


(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.ssMetadata = [];


// symbols:



(lib.balloon = function() {
	this.initialize(img.balloon);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,387,480);// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.uuu = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();
		this.cache(-47,-145,287,307);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_2
	this.txt = new cjs.Text("", "bold 29px 'Source Sans Pro'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 36;
	this.txt.lineWidth = 343;
	this.txt.parent = this;
	this.txt.setTransform(98.3,58.6);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D1D4D9").s().p("AgugHIgHgSIgFgMIAMABQAJAAALgCQAWAQAWAOQAWAMATAJQgqAXguADg");
	this.shape.setTransform(91.9,155.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#767E8C").s().p("AgIATIgCAAQgdAAgKgDQgFgBgEgEIAAgCIAAAAIAAgGIAAgIIAAgCIAAgCIAAgBIAAgBQABAEANADQAMADAPAAIAKAAQASAAASgDIAIgCIACgBIAEAAIAAgCIAFgDIgBAMIgBAJIAFACIgFABIgGACQgNADgNABIgBAAIgHABIgOAAgAA6AQIABgBIAAABgAg6gNIABgBIADgDIABgBQgEADgBAEIAAgCg");
	this.shape_1.setTransform(84.6,149.7);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#959EAD").s().p("Ah2A8QgjgIgNgLQgFgFgCgFQABgFACgFIACgCQAqgNAigQQAXgMAOgKIADgDIADgCIAAgBIABACQADAEAGABQAKADAcAAIABAAIAPAAIAHgBIABAAQAOgBANgDIAGgCIAEgBIAHAEIABAAIAAABIAAAAQAdAPA1ASIAPAFIABABIADACIAEAEIABADIAAACIgBABIgBADIgJAIQgMAIgSAHIgXAIQgZAGgaAFIgPACIgoADIgGABIg6AAIg6gLgAAdgPIAHARIARAvQAvgDAqgXQgTgJgWgNQgXgNgWgQQgLACgJAAIgMgBIAFAMgAgIgxQgPAAgLgDQgOgDAAgEQAAgEAFgDIAAAAIACgBIACgBIAEAAIAFAAIARgBIABAIIARABIAAgJIAiAAIADAAIADAAIAAgBQADAAAEACIAGADIAAAFIgGADIAAACIgDAAIgDABIgIACQgSADgTAAIgJAAg");
	this.shape_2.setTransform(83.6,154.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#AFADAD").s().p("AgaAFQACgEAEgCQAKgLAOAAQANAAAKAJIgIAIQgGgGgJAAQgMAAgIALIgCADIgIgIg");
	this.shape_3.setTransform(82.1,124.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#8C8C8C").s().p("AABDDIAAgIIgCiuQgMgCgIgJQgKgJAAgOQAAgGABgFIgJgCQgDgcgCg2IgChHIAAgDIBXgEIABALIAAACIABA4QACA1ADAnIgLABIABALQAAAIgEAHQgCAGgEACQgHAHgIACIAGCwIABAIgAgJgjIgDAFIgBAEIgBAEQAAAIAFAFQAFAFAGAAQAHAAAFgFQAFgFAAgIQAAgFgCgEIgDgEQgFgGgHABQgGgBgFAGgAgVguQgEADgCAEIAIAIIACgDQAJgMAMAAQAIAAAGAHIAIgJQgKgJgNAAQgOAAgKALg");
	this.shape_4.setTransform(82.2,128.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#686A6D").s().p("AgFBgQgFgFAAgIIABgEIABgEIADgFQAFgGAGABQAHgBAFAGIADAEQACAEAAAFQAAAIgFAFQgFAFgHAAQgGAAgFgFgAgshYQAAgFABgBIAlgDIAvgDIADAIIABAEIhXAEQAAAAgBAAQAAgBAAAAQAAgBAAAAQgBgBAAgBg");
	this.shape_5.setTransform(81.7,118.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_1
	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#DBE2D2").s().p("A12gVQgTw/gKhZQgDgOAAgxQAAgxADAAIVHADQU9ACCTgHIAFR6QAFQ1AECoIAFDEQirAE0BAPQztAOhjADQABkYgSwdg");
	this.shape_6.setTransform(96.7,-13.3);

	this.timeline.addTween(cjs.Tween.get(this.shape_6).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-75.3,-144.5,347.2,306.1);


(lib.Tween8 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-102.9,-7.6,205.8,15.3);


(lib.Tween6 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.instance = new lib.balloon();
	this.instance.parent = this;
	this.instance.setTransform(-79.5,-98.6,0.411,0.411);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-79.5,-98.6,159.1,197.3);


(lib.Tween4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("A16hUQgKhogNhtIgHg0IAHAAQBcgDSXgUQS1gVFwgSQACCjALGsIAFDEQiqAE0CAPIhPABIAAgBIgCg4IAAgCIgBgLIgBgEIgDgIIgwADIglADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQABAAAAAAIAAADIACBAQxLAMhdADQACj5gZj3g");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-143.3,-41.2,286.7,82.5);


(lib.Tween1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD2gPQETgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi/AUQjIAUjFAAQlgAAlUhBg");

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-102.8,-7.6,205.8,15.3);


(lib.ttt = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();
		this.cache(23,35,114,127);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_2
	this.txt = new cjs.Text("", "bold 29px 'Source Sans Pro'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 36;
	this.txt.lineWidth = 96;
	this.txt.parent = this;
	this.txt.setTransform(82.1,58.6);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D1D4D9").s().p("AgugHIgHgSIgFgMIAMABQAJAAALgCQAWAQAWAOQAWAMATAJQgqAXguADg");
	this.shape.setTransform(91.9,155.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#767E8C").s().p("AgIATIgCAAQgdAAgKgDQgFgBgEgEIAAgCIAAAAIAAgGIAAgIIAAgCIAAgCIAAgBIAAgBQABAEANADQAMADAPAAIAKAAQASAAASgDIAIgCIACgBIAEAAIAAgCIAFgDIgBAMIgBAJIAFACIgFABIgGACQgNADgNABIgBAAIgHABIgOAAgAA6AQIABgBIAAABgAg6gNIABgBIADgDIABgBQgEADgBAEIAAgCg");
	this.shape_1.setTransform(84.6,149.7);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#959EAD").s().p("Ah2A8QgjgIgNgLQgFgFgCgFQABgFACgFIACgCQAqgNAigQQAXgMAOgKIADgDIADgCIAAgBIABACQADAEAGABQAKADAcAAIABAAIAPAAIAHgBIABAAQAOgBANgDIAGgCIAEgBIAHAEIABAAIAAABIAAAAQAdAPA1ASIAPAFIABABIADACIAEAEIABADIAAACIgBABIgBADIgJAIQgMAIgSAHIgXAIQgZAGgaAFIgPACIgoADIgGABIg6AAIg6gLgAAdgPIAHARIARAvQAvgDAqgXQgTgJgWgNQgXgNgWgQQgLACgJAAIgMgBIAFAMgAgIgxQgPAAgLgDQgOgDAAgEQAAgEAFgDIAAAAIACgBIACgBIAEAAIAFAAIARgBIABAIIARABIAAgJIAiAAIADAAIADAAIAAgBQADAAAEACIAGADIAAAFIgGADIAAACIgDAAIgDABIgIACQgSADgTAAIgJAAg");
	this.shape_2.setTransform(83.6,154.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#AFADAD").s().p("AgaAFQACgEAEgCQAKgLAOAAQANAAAKAJIgIAIQgGgGgJAAQgMAAgIALIgCADIgIgIg");
	this.shape_3.setTransform(82.1,124.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#8C8C8C").s().p("AABDDIAAgIIgCiuQgMgCgIgJQgKgJAAgOQAAgGABgFIgJgCQgDgcgCg2IgChHIAAgDIBXgEIABALIAAACIABA4QACA1ADAnIgLABIABALQAAAIgEAHQgCAGgEACQgHAHgIACIAGCwIABAIgAgJgjIgDAFIgBAEIgBAEQAAAIAFAFQAFAFAGAAQAHAAAFgFQAFgFAAgIQAAgFgCgEIgDgEQgFgGgHABQgGgBgFAGgAgVguQgEADgCAEIAIAIIACgDQAJgMAMAAQAIAAAGAHIAIgJQgKgJgNAAQgOAAgKALg");
	this.shape_4.setTransform(82.2,128.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#686A6D").s().p("AgFBgQgFgFAAgIIABgEIABgEIADgFQAFgGAGABQAHgBAFAGIADAEQACAEAAAFQAAAIgFAFQgFAFgHAAQgGAAgFgFgAgshYQAAgFABgBIAlgDIAvgDIADAIIABAEIhXAEQAAAAgBAAQAAgBAAAAQAAgBAAAAQgBgBAAgBg");
	this.shape_5.setTransform(81.7,118.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_1
	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#DBE2D2").s().p("AoTgVQgHhcgWi4QgGgegBgWIAHAAIHmgbIJwgjQABCZAMG2IAFDEQjFAFmGAOInvARQABjZgSjYg");
	this.shape_6.setTransform(79.9,76.7);

	this.timeline.addTween(cjs.Tween.get(this.shape_6).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(23.1,35.5,113.7,126.1);


(lib.Symbol38 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#4F4F2D").s().p("AjBCeQgFAAgHgCQgCgDAAgDQAAgJAGgKQAHgNALAAQAJAAAOAFQAOAGAEAEQgHAMgPAHQgNAGgNAAIgDAAgACVghQgKgKAAgOIABgJQACgHAGgGIABgCQALgKAOAAQAOAAAKAKQAKAKAAAOQAAAOgKAKQgKALgOAAQgOAAgLgLgAhHhPQgWgPAAgbQAAgVAHgLIACgCIABgBIALgBQAXAAAQAQIACACQAOAQAAAVQAAAVgNAPQgZgCgQgLg");
	this.shape.setTransform(830.6,258.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#998E7A").s().p("AoAJVIgtgKIgBgVIgBgRIABgYQAAgQACgHQAFgPAQgJQAFgCAhgIIARgDIASgFIAXgEIAagGIAwgKIABgBQBMgQAKgGQAWgQAAg7QAAgZgLgxIgDgQIgBgBIgIgoIgBgFIgCgKIgCgNIAAgBIgCgQIAAgDQADg0BVgTQAjgIA5gFQAugFA9gCQA4gBBCAAQArAAAqAJIAGABIAEABQAYAHAYAJIABAAIAEACQBEAZAdgBIADA2QAVACAYAAIB6AEIAIAAQgQhOgoiLIgJgfIgyirIgOgsIgPgzIgkh2IgniBQAAgPAIgGIABAFIAFgFIADgBQAcBIAaBLIADAIIARAwQAaBMAZBOQAWBHATBCIAVBLQAjCAAWBuIgCgCIghACIgNABQhHADgXABQg7AAgngGIgKgBIAFgMIgZgRQgmgbgmgMIgKgEQhogfh9AAQg+AAhYAXQgNAYgHAdQgFAYAAAcIAAABIACAAQgHACgNAKQgUASAAAdQAAATAPAPQARARAZgBIAIAgQAAAhg+AbIg9AXIg5AWIgRAGIgaALIAAABIABAEIgBAAIAAgCIgBgBIAAAAQgNgSgQgBQgNAAgFAHQgEAFAAAJQAAAFACAEQACAFAEAEIgHADIgcAQIgFADQgOAJgLAJIgGAHIgBABIgBAAIgNgBIADAWIABAOIgSgDgAoFEQIgBAAIgIgeIgNgzIgDgMIgMg0IgLg0QgIgxgGg0QgGhCgBhHIgBglQAAhIAGg3IAIgNIAAAMIABAgQABA7AIBNIADAjQAMBqAUCIIAKA/IAJA6IAHAjIgPgBgAnDDoIgBAAIgDgFIgMgWIgFgKIAGAAIAPAAQAaAAAmgDIBPgHIgBAPIgBANIAAAEIgXAGQgiAKgZABIgMABQgdAAgSgDg");
	this.shape_1.setTransform(838.9,219.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#685E3E").s().p("AjoJmIgRAAIABgGIgBgOQgBgKgEgJQgHgRgLAAQgIAAAAAJIAEAcIAAAFIAAANIg/gCIgDgFIgJgNIgSgcIgLAjIgCAIIAAABIgcgCIhLgIIgVgDIAAgBIgCggIAAgCIABgGIgSgBIAAAAIgDAAIgHAAIgHgBIABgBIAGgGQALgJAOgJIAFgEIAcgPIAHgEQgEgDgCgFQgCgFAAgFQAAgIAEgFQAFgHANAAQAQAAANATIAAgBIABABIAAACIABAAIgBgDIAAgBIAagLIARgGIA5gWIA9gXQA+gcAAghIgIgfQgZAAgRgQQgPgPAAgUQAAgcAUgSQANgKAHgDIgCABIAAgCQAAgcAFgYQAHgdANgXQBYgYA/AAQB8AABoAgIAKADQAmANAmAaIAZARIgFANIAKABQAnAFA7AAQAXAABHgDIANgBIAhgCIACACQgWhvgjiAIgVhKQgThDgWhGQgZhPgahMIgRgwIgDgIQgahKgchJIgDABIgFAGIgBgGQADgCAEgBIACABIAAABIAEAAQATAAAgA3IARAfQAMAYAOAfQAcA/AiBaIAGAQQAtB1AnB8QAXBHAWBLIAjB+IAQA8IgXgCIhDgEQgbgCgRAAQgmAAhAAEIhJADQADAzACA4IABAnIAAACIgKADIg1APIgDABQhgAchEAeQgwAVgiAWIgBgHIgFgZIgDgTIAAAAQgZAJgMAHIAAABQAAAGAGANIAGANIALATIgUAOIgHAHIgSAKIgQAHIgLAEIAAgBIgGADIgIACIAAAAIgJACIgGACIgTAEIgCgOQgEgUgBgLIgBgIIABgIIgRAGIgWAKIADALIADAMQAFAPAEAJQgXACgZAAIgbAAgAlWH7QgFAKAAAJQAAADABADQAHACAGAAIACAAQANAAANgGQAPgHAHgMQgDgEgOgFQgOgGgJAAQgMAAgHANgAAJEnIgCABQgFAGgCAIIAAAIQAAAOAJAKQAKALAOAAQAOAAAKgLQAKgKAAgOQAAgNgKgKQgKgLgOAAQgOAAgKALgAjgDbIAAABIgCACQgIALAAAVQAAAbAWAPQAQALAZACQAOgPAAgVQAAgUgOgRIgDgCQgQgQgXAAIgLABgADxD0IAAgDIgCAAIACADgAnYEIIg0gBIgEAAIgQgBIgQgBIgHgjIgJg6IgKg+QgUiJgMhpIgDgjQgIhOgBg6IgBghIAAgLIABAAIABgCQAHgIAKgDQAGgCAIgBQAEABAJAEIgBAOQAABWAHBhQAHBYAMBgIAVCMIABAKIABADIABALIAGAAIAFALIAMAVIADAFIABAAQASADAdABIAMgBQAZgCAigJIAXgGIAAgFIABgMIABgQIAYgCIACAOIACAKIABAEIAIApIABABIADAQIgaACIgUABQgoADgrABIgSAAg");
	this.shape_2.setTransform(844.7,220.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#2A2E1C").s().p("Aj4UbIgPAAIgbgBQgPgKgZgEIgNgCIAJhCIABgJIAFghICXAZQB4ATBdAMIgBAZIgXAGQgaAJgZALIgVALIgjADIgQAAQg9AEg8AAIgQAAgAhaOZIingKIgjgCIAVi0IAeACIBeAHIC8AMIAAChIAAAFIAAAPIiDgKgAhxGvIAklAIAXjRIAdkIQASijAMiQIAAgFQASi9AKibIAGhmQgRhugmhEIgFgIICCAAIABAbIgEBDIg1AAIAIDCIAOFOIgDAyIgICEQgHCHgFB3QgHCjgCCEIBAgDIABAbIAJDNIhLAEIAAAPIABADIgBAHIABAAIgBCTQhQgJhLgMgAGMmpIABgTQAJjRAMlnQARgCATABQAxADAnAkQABAegEA8QgMDMgFDLIgDBzIgJF6IgDBpIABCGIAAADIgBAAQg2AIg5ACgAkzlkIgRgEQhIgQhNgXIAAgDIgOgBIgDAAIAArKIAHhfIg6AAQAHgMAJAAQAJABAXAKIACgcQAAgDADgDQABgBAFANQAFAPgBAKIAAADIAPAHIApASIgLCkIgKCWIgIByIgSEDIgBALIACgKQAtAKB6AVIgFBrg");
	this.shape_3.setTransform(850.3,85.9);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#4B5232").s().p("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");
	this.shape_4.setTransform(839.3,108.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#333822").s().p("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");
	this.shape_5.setTransform(847.2,110.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#8C3700").s().p("EgvZAIKQgRhnAAgYIACgRIAAgEIAPgMQArgkAbgUQAEgYAHgiIAKgqIgdgCIhagDIg/gDQh6gHhfgVQgkgIghgLIAAARIAAAMQAABrgOBSQgVAEgNAAQgfAAgWgJIgGgCIgIgFIgBgJQAAhWAihgQAXhDAnhIQAhg7AmgzIAGgJIj4gKQiogFhWgFIABALQgBA6gFBGQgFA7gIBDIgHAzIgXCrQgJgCgMgHIgKgFQgBgmAAggQAAhKAEhGQADgoAEgmIAFgrIhxgDIhigDQiXgGhJgOQhYgSgogpQABAkAJA6IAGAlIAABGQgZgHgRgGQgPgHgJgKIgFAHIgQAAIAAgCQAAAAAAAAQAAgBAAAAQgBAAABgBQAAAAAAgBIAAgBIAAgCQgFgOgCglIgBgvIAAgaQAAjFA0inQARg3ArhmIAMgdMA+cAAAQjkBAjlBTQiBAwiAA1QrwE4rJICIgHgZQgbhdgDgoIgOACQhjARgLABIAAACQAAAagVCeIgtgBQhRAAhVAFIgNABIgHgqgEBDUAH2IgsgHQgxgxgzguIACiuQA8gGA/gJIAUgDQBWgOBcgVIAAgEIAQAAIA6gOIAAGTQikgohZgQgEA7FABcIADhyQAGjLAMjMQADg8gBgeQgnglgxgDQgTAAgRACIAAgGIC4AAIAAEzIAAEYIAAB/IhTg7gEBBHABoIABgcQAEk1AIkfIABgrIEqAAIAJJ1IAAALIgCgKQg+AJi8AVIgJABIg7AGIgBAAgEA0GgC0IADgxIACA0IgFgDgEAt5gFuIgFgCIhyguIAKiVICgAAIgLDWIgogRgEAlDgIzIBHAAIABAVIhIgVg");
	this.shape_6.setTransform(524.1,40.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#973C00").s().p("EgmHALLIhVgtIg1gdIgigSQgvgageggIgKgNIgIgMQgEgIgFgGIgJgJQgTgSgjgQQgagMgjgKQgwgPg3gKQhbgPhrAAIgnADQhogRiMgIQgJgXgJgeQLIoCLwk4QCAg2CBgvQDlhUDkg/INWAAQkMBEj7BsQlqCckyDoQh+Bfh1BrQhRBLhNBSQjrD4iuEeIghgOgEA0OAE8IABhRQAyAuAxAwQgxgHgzgGgEAuQgBIIBSA7QgBCqgECRIgGAAQgnABgqACIAKl5gEAm9AAoQAEh2AIiGIAIiFIAFADIAUHMQgWgogXgmgAffm/IgbgRIAIhzIByAtIAFACIApARIgJClQg/gzhFgugAZFqRQhngohugfICeAAIBHAUIACA6IgSgHg");
	this.shape_7.setTransform(606.2,56.9);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#AB4400").s().p("EgmsALEQCukeDrj5QBNhRBRhLQB1hrB+hgQEyjnFqidQD7hsEMhEISHAAQhlAuhjAyQg8gEg+AAQmfAAlICvQknCejQEhQhDBcg3BnQhLCLg2CfQhwgJhzgDIhsgBQiiAAgbACQhsAGg9AdIgBABIgFACQgaAZg1ASIgLAEQhnBzhkA7IgPAJQgYANgZAMIgsAGIgEABIgvAFQhSAAhogrgEgh+AGEIAGAKIgFgKIAAAAIgDgCIACACgAeXFWQgfg1gggxIAAl4IACABIAOABIAAADQBOAXBIAQIARAEIAAAAIgBAXIgYH1IgyAKgEAl3AASQAXAmAWAoIADBNIAGCKIg/AEQACiFAHikgAYFi3Qh0hxh9hSQhEgshIgmQgogWgpgTQAAiCACh3IDxAAQBuAgBnAoIASAHQACA/AAAsQAADJgDC/IgLgLgAdujiIgCAJIAAgKIASkDIAbARQBFAuA/A0IgJCwQh6gVgsgKgALrpnQArgdAtgYIACBMQgtgNgtgKg");
	this.shape_8.setTransform(613.2,59.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#C74F00").s().p("AztJkIhKgLIgHgBIgwgGQg5gHg6gGIg0gEIgGAAQA2ifBLiLQA3hnBDhdQDQkgEnieQFIivGgAAQA9AAA8AEQBjgyBlguICYAAIACBSQgtAYgqAdQAtAKAtANIAHCtQh1g1iDgVQhXgOhcAAQiJAAh8AeQjuA6i8CsQhXBPg8BZQhrCfgYC/QgGA1AAA4QAAAxAFAvQhnARhHASQg7gLg3gIgAWwFnQAfAyAfA1IAuBoIgtAJIg5ALIgFABIgBABgARaD0IjCgMQgahPgshJQhChvhqhgIgGgFIgNgMIgEjaIAAgTQApATAoAVQBIAmBEAtQB9BSB0BwIALAMIgFDmIgCBCIgHAAg");
	this.shape_9.setTransform(655.6,47.1);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#DE5800").s().p("Au1GMQAAg4AHg1QAXi/BrieQA8haBYhPQC7isDvg6QB7geCIAAQBdAABXAOQCEAVB1A1IAIClQh7g7iTAAQhJAAhDAPQipAkiECCQiyCvgFD3IAAAOQAAA6AKA2QifAMioAVQhqANhVAOQgFgvAAgxgAOyCAIingMQgOgogUgmQgWgqgegoIgEioIgBgkIAOAMIAGAFQBpBhBDBvQArBIAbBPIgEAAg");
	this.shape_10.setTransform(652.7,57.5);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#FF6600").s().p("ApWFtQgJg2AAg7IAAgOQAFj1CyixQCEiBCqglQBDgOBIAAQCTAAB7A7IABAZIAQEyIAFBoIABAhIAEBOIAAABQiMAMiNAdQg5ALiKAQIgSACIgPACIgmAFIjEAWQhZAMhPAMIAAAAIgBAAgAINAqIgBg2IgChjQAeAoAWArQAUAkAOApIhTgHg");
	this.shape_11.setTransform(669.8,64.3);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#8A4B21").s().p("EgVfAh9QjYgPjkgSQtFhFyGiHIxIiEMAAAgrjQEwhMD9gvQE1g4EmgXIAhgCQCwgNCrAAQOiAdAlAAQFCAADGgfQAugHCkgmIBEAFQHaAgEcARQXhBcVAAkIGYAKIDeAEQgQBfgRBhIAFADIgBABQgDAHAAAFQAAANBKAwQBiA/CIAxIAfALIABAUIAtAKIASAEIgCgOIAiAKIgEALIgBACIAMAFICLA1QCcAzBoAAQB6AACfg5IACAAIgEAEIgFAGQgMARgJAaQgKAigBAhQABAYE3CdQCGBEB1A0QAaACAZAAQBZAAA3gQQAsgNAJgSQgwgRgHgHQh7gwhngyQgmgTglgQQiLg9iEggQg5gOgMgHQgVgLABgYQgBgFACgHQAFgRAOgaQAQgcAFgGIAeAOIAuAUQClBFCPAcQBCANBkAiIAzARIBgAiICZA4QCBAtBxAbIAACmIksAAQgrAMg6AIQhrAPibAFQhTAClMAAQloAArzhdQmOgyiUgPQkdgdi0AAQk1AAlFA5QkkAzkIBZQiEAshrAwQhdAqhLAsQgzAeglAcIgFAEQhLA7gQAzQD/AzIoAvQLZA/C2AWQEZAiDJAsQCZAiBrApQB1AsBIA2QAtAiAcAmQAuA/AABIQAAACkBAvQlDA6jyA/Qs2DXAAEXQAABGBjAaQA3APCkALQCaAKA/AVQBjAiAABRQABCjnABSQmKBIqpAAQqmAAtbg7gEBKLgHoIihggQBBgSBfgeQBRgXBUgSIAACZIikgggEAwngQUIBmAAIAAABIgYACIhQAIIACgLgEA4ogUMIAWgGIABgZIBqAMQBdAKA3ABIALAAIACARQAkgDAdgFIAJAfQjHgNilgTgEA+ogXsIAAi0QBNgMBQgOIgRE9IgEBgQgdAQgXASQgoh8gsh1gAFm0kQkwhVh9gZQiUgeidgEQhcgClWAIQl3AJlpABIhOAAQlSAArYgkQnVgYkBgIQiOgFhOAAQhBAAg/ACIhbADQiIgViLgZQkLgyiAgNQihgSjggFIAAoBIBRgDQFtgHFggwIBwgQIBjANQBFAIBLAFQDJAOD2gHQCegED9gMIBkgEQBNgCBKAGQEzAVDpCKQBOAvBbBMQAkAdAWAQQAMAMAPAKQB0BUFDAAIAAAAQF9AADfgjQCagYB9g1QCZhCAugMQCAghDWgCIAVAAQCwAAGPAzIEMAgQFBAlDnARIAJABQBPAFBiAMQBvAOCHAVIGNBFIBEAMQBoASBfAPQBnAQBdANQgOB7gQB9IgpgHIihgcQjogohjgQQjNgii5gLIgggCQhkgGiHgCQiRgEi6AAQm6AAi8AeQhZAQgxAIQhVANhyAGQADADBlA4QBqA/AkAjIAAAdgEAxHgVMIgWgDIAAguIAVADIB6AUIATADIgFAhIgBAJIiGgTgEBLggVrQhbgGhQAAQhBAAg5ADQgPjUgGjCQBjgWBlgaQBggZBhgbIAAICIhPgFgEA5EgZeIABgPIAAgFIBhgKIABAlIhjgHg");
	this.shape_12.setTransform(489.1,342.1);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#2E1503").s().p("A0wpzIGIAAIAMABQDmALCwASQgrBlgQA3Qg0CnAADFIAAAbIABAvQACAkAFAOIAAACIAAABQgBABAAAAQAAABAAAAQAAABAAAAQABAAAAABIAAABIAQAAIAEgHQAJAKAQAHQARAHAYAGIAAhGIgGgjQgJg8gBgkQApAqBYASQBJAPCXAFIBiADIBvADIgEAqQgEAmgDAoQgEBGAABKQAAAgACAmIAJAGQAMAGAJADIAXisIAHgzQAIhDAFg5QAFhIAAg5IAAgMQBVAFCpAGID4AJIgHAJQglA0ghA7QgnBHgYBDQghBgAABWIAAAJIAJAFIAGACQAWAJAeAAQAOAAAVgDQAOhTAAhrIAAgMIgBgQQAhAKAlAIQBfAVB6AHIA+ADIBaAEIAeABIgKAqQgHAigEAZQgcATgqAkIgPANIAAADIgCARQAAAYARBoIAGApQh7AIiDARQhrgVjLgOQiWgKi1gFIh6gDIgngBQhrgBh0AAQkHAAhwALQhOAIgtARIgSAIQgZAJgmASIg4AYIgpAQQh2AqifAFgATbHxIhzgCQAWieAAgaIAAgCQALgBBjgRIANgCQAEAoAbBdIAHAZQAJAfAJAXIhWgEg");
	this.shape_13.setTransform(130.9,46.8);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#482106").s().p("EA39APBIg6gWIAFgMIgigKIgDgWIANABIABAAIAHAAIAbAIIAAABIACAhIAAABIAWACIBLAIIAbACIAAgBIACgIIALgjIASAcIAJAOIADAFIA/ACIAAgOIAAgEIgEgcQABgJAHAAQALAAAHAQQAEAKACAKIAAANIAAAHIAQAAIAcAAQAYAAAXgCQgEgJgEgPIgEgMIgDgMIAXgKIAQgFIAAAHIAAAIQABALAEAVIACANIATgDIAGgCIAJgCIAAgBIAIgCIAHgCIAAABIAKgEIAQgHIASgKIAHgHIAUgPIgKgTIgGgMQgHgNAAgGIAAgBQAMgIAagIIAAAAIAEATIAEAZIABAGQAigVAwgVQBEgfBggcIADgBIA1gPIg4AYQiCAzg1AnQglAbgzAVQguASgrAGQg7AWgagCQgcgBhAAFQhJAEgkAAQglAAgvgRgEBEYALRIAkgBQAEAGADAHQAAAHgqAUIgBgngAc1oxIgdgHQhDgOllhbQhngbhegVQhhgWhYgRQBGgSBngRQBVgOBqgNQCpgVCegMIABAAQBPgMBZgLIDDgXIAmgEIAPgCIASgCQCLgQA6gMQCNgcCLgMIADBMIAYAAIAJACIAjAFIADAAIBaAJIA1ADICQAIQCWAKB1AEIAJAAIARABIgBAQIgEBNIgEAAIiTAEQh1ADhaAGIhHAEIgmADIgVACQhiAJgvANIgSAHIgEAFQigBRgpAYQgWAFgWAEIgmAHIh5AUIhkAQIhyAQQhGgKhKgOgEhFBgL+QCegFB3gqIAogQIA4gYQAmgSAZgJIASgIQAtgRBOgIQBwgLEIAAQB0AABqABIAoABIB7ACQC0AGCWAKQDLAOBrAVIhZANQiFAUl7BNIh+AZIhfASQiFAYhyASIhvAQQlgAwltAIIhRACg");
	this.shape_14.setTransform(439.9,186.3);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#602C09").s().p("EA7PASEQh0g0iHhEQk3idAAgYQAAghALgiQAIgaAMgRIAFgGIAEgFIgCABQifA5h5AAQhoAAidgzIiLg1IgMgFIABgCIA5AWQAwARAkAAQAlAABJgEQBAgFAcACQAZABA7gWQArgFAvgTQAzgUAlgcQA0gmCCg0IA5gXIAKgDIAAgCQApgTAAgIQgCgHgFgGIgjABQgCg4gDgzIBJgDQBAgEAmAAQARAAAbACIBDAEIAXACIgQg9QAYAKAXAMQAMAGALAHIApAFIASACQBQAJBQADIASABIAfABQAYgNAngCIgHhVQgQixgLilQA6gDBAAAQBQAABbAGIBPAFIAAMEQhUAShQAXQhgAdhBATICiAgICjAgIAADmQhxgciBgsIiZg4IhfgiIg0gRQhkgihCgNQiOgcimhFIgugVIgdgNQgGAGgQAcQgOAZgFARQgBAIAAAFQAAAYAUALQAMAHA5AOQCFAgCKA9QAlAQAnATQBmAyB8AwQAGAGAxASQgKASgrANQg4AQhZAAQgYAAgbgCgEAmVAJ1QiIgxhhg/QhLgwAAgNQAAgFADgHIABgBQBAAjA0A1IAPAKIAAAFIAAADIABABIAOAFIABgEIAMAGIAJAGQBBAXBDATIAPAGIACAAQAHgIALgFIgBAZIABAQIgfgKgEApVAFdQArgBApgDIAUgBIAagDQALAyAAAZQAAA6gWAQQgKAHhMAQIgBAAIgwAKIAQiugEA0MAFGIACAAIAAADIgCgDgEA39AEBIh6gEQgYAAgVgBIgDg2QgdAAhEgZIgEgCIgBAAIAAgEIgwgLIgEgBIgGgCIiJggQiTgig+gVQgygRgdgTQAZAEAPAKIAbABIAPAAQBFAABEgEIAQAAIAjgDIAVgLQAZgMAbgIQClATDHANQAoCMAQBOIgIAAgEA41AAYQAXgTAdgOIgHCzQgWhKgXhIgA9OnhQlDAAh0hUQgOgKgNgMQgWgQgjgdQhchMhOgvQjpiKkzgVQhKgGhNACIhkAEQj9AMidAEQj2AHjKgOQhLgFhFgIIhjgNQBygSCFgZIBegSIB/gZQF7hMCEgVIBagNQCDgRB7gIIAOgBQBVgEBRAAIAsAAIBzACIBWAEQCMAHBoASIAogDQBqAABbAPQA3AJAxAPQAiALAaALQAjAQAUASIAIAJQAGAHADAHIAIANIALAMQAdAhAvAZIAiATIA1AcIBVAuIAhAOQBoArBSAAIAvgFIAFAAIArgGQAZgMAYgOIAQgJQBjg7BnhzIALgEQA1gSAbgZIAEgCIABAAQA9geBtgGQAbgCCiAAIBsACQByACBxAJIAGAAIAzAFQA6AFA6AHIAvAHIAIABIBKAKQA1AJA7ALQBYAQBhAWQBfAWBnAaQFkBcBEAOIAcAGQBLAPBGAJIBygQIBkgQIB5gUIAmgHQAWgEAVgFIg9AjIifBgIhSAzIgnAXIiTBZQjngRlBglIkLggQmPgzivAAIgWAAQjXACiAAhQgtAMiaBCQh9A1iaAYQjfAjl9AAg");
	this.shape_15.setTransform(534.6,212.1);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#70340B").s().p("EhMuApLIAAuVIRICFQSGCHNFBEQDkATDYAPQNbA7KmAAQKpAAGKhIQG/hSAAijQAAhShjghQg/gViagLQikgKg3gPQhjgbAAhGQAAkWM2jXQDyg/FDg7QEBgvAAgBQAAhJgug+QgcgmgtgiQhIg3h1gsQhrgoiZgiQjJgtkZgiQi2gWrZg+Qoogwj/gzQAQgzBLg7IAFgEQAlgcAzgeQBLgsBdgpQBrgwCEgsQEIhZEkg0QFFg4E1AAQC0AAEdAdQCUAPGOAxQLzBeFoAAQFMAABTgDQCbgFBrgPQA6gIArgLIEsAAMAAAArcgEhMugbCQDgAGChARQCAAOELAxQCLAaCIAUIBbgDQA/gBBBAAQBOAACOAEQEBAJHVAXQLYAkFSAAIBOAAQFpgBF3gJQFWgIBcACQCdAECUAeQB9AaEwBVIBXAAIAAgdQgkgkhqg+Qhlg4gDgEQBygFBVgOQAxgHBZgRQC8gdG6AAQC6AACRADQCHADBkAFIAgACQC5AMDNAhQBjAQDoApIChAcIApAGQgYC5gfC9IjegEImYgKQ1Agk3hhcQkcgRnaggIhEgEQikAlguAHQjGAglCAAQglAAuigdQirAAiwAMIghACQkmAXk1A5Qj9AukwBNgEAwngRqQAFgvAFgYIAAj0IAWADICGATIgKBCIANACQAeATAxARQA/AVCTAjICJAgQgrgJgqAAQhDAAg3ABQg+ACguAFQg6AFgiAIQhWATgCA0IAAADIACAQIhmgBgEA6EgTNIAvALIABAFQgYgJgYgHgEA5FgdpIAxADIArADIAFCRIhhAKIAAihgEAw/gbVIgOgBIAAq5IABAAIAFgBIA6gLIAsgJIAygLIgJDXIgGDbIgBAlIgBBUIAWACIA3AEIgUC0Ii4gLgEAnZgb8QhfgPhogSIhEgMImNhEQiHgWhvgOQhigMhPgFIgJgBICThYIAngYIBRgyICghgIA9gkQApgXCghSIAEgFIASgGQAwgNBigJIAVgCIAlgDIBIgFQBZgFB2gEICSgDIAEAAQgGBtgIBqIgDA6QgMCOgNCGIgKBlQhdgMhngRgEAlwgjDQgFgCgFABIADAAIAHABIAAAAgEA+ogdVICdAHIADAAIAAADIgDA7QhQAOhNANgEBGggicIABkyIAAgHIAAhnQAzAGAxAHIAsAIQBaAPCkApIAAIyQhhAbhgAYQhlAahjAXQgGipAAiagEBA2gh9IgEAAIhUgCIg2AAIAAjMQA4gCA3gHIABAAIAAgDIgBiGIADhqQApgCAogBIAGAAQgFC3gJCOIgEA+IgDAqIgBAWIAAADIgBAIIgkgBgEA5GgiTIAAiSIAAAAIAAgHIAAgDIAAgPIBKgEIAHC3IhRgIg");
	this.shape_16.setTransform(489.1,350.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_2
	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#8A4B21").s().p("EhNlA0UMAAAhidIGIAAIALABQDnALCwARIAMgdMBgRAAAIgBhwIAAhTID9AAIgEDDIHWAAIgLjDIEhAAQAHgMAJABQAJAAAYAKIABgbQABgDACgDQABgBAFANQAFAOgBALIAAADIAPAGIApATIgLCkICgAAIAHh1IAAh2IAFgLQAdg6AjgdQAhgdAmAAQAnAAAfAfIADggQAAgEACgCQADgDADAAQAEAAACAEQADABAAAFIgDAnIgBAJQAKALAJAPICDAAIABAbIgEBCIE/AAIgBAQIgFCkIgBAPIC4AAIgCkcQAEgoADgpIABgdIFCAAIgLGKIErAAIgBiOQASgGAdgLIATgHIAAgDIgBgjQAAgDAEgDQACgCADAAQAEAAADACQACADAAADIABAgQAcgKALABQAcAAALBsQAJBUAAC/IAWFnQABAjgBAiIgBA7QgpANg9AOIgIADMAAABXOgEAk5gX7QgFgBgFABIACAAIAIAAIAAAAgAvd8WIAHAKIgFgKIgBAAIgDgCIACACg");
	this.shape_17.setTransform(494.7,279.4);

	this.timeline.addTween(cjs.Tween.get(this.shape_17).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol38, new cjs.Rectangle(-2,-55.3,993.3,669.5), null);


(lib.Symbol7 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("AoTgVQgHhcgWi4QgGgegBgWIAHAAIHmgbIJwgjQABCZAMG2IAFDEQivAFlHALIgCg1IAAgCIgBgLIgBgEIgDgIIgwADIgkADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQAAAAABAAIAAADIACA+InsARQABjZgSjYg");
	this.shape.setTransform(56.8,41.2);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol7, new cjs.Rectangle(0,0,113.7,82.5), null);


(lib.Symbol4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("A12gVQgTw/gKhZQgDgOAAgxQAAgxADAAIVHADQU8ACCUgHIAFR6QAFQ1AECoIAFDEQirAE0BAPIhQABIAAgBIgBg4IAAgCIgBgLIgBgEIgEgIIgwADIgkADQgCABABAFQAAABAAABQAAABABAAQAAABAAAAQAAAAAAAAIAAADIADBAQxMAMhcADQABkYgSwdg");
	this.shape.setTransform(143.1,131.2);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol4, new cjs.Rectangle(0,0,286.2,262.5), null);


(lib.Symbol3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("Av9gVQgHhcgWi4QgGgegBgWIAHAAQc1gyD1gMQABCZAMG2IAFDEQieAEuXAPIgEAAIgCg4IAAgCIgBgLIgBgEIgDgIIgwADIglADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQABAAAAAAIAAADIACA/QsXANhlADQABjZgSjYg");
	this.shape.setTransform(105.8,41.2);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol3, new cjs.Rectangle(0,0,211.7,82.5), null);


(lib.Symbol2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();
		this.cache(0,0,258,78);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D1D4D9").s().p("AgugHIgHgSIgFgMIAMABQAJAAALgCQAWAQAWAOQAWAMATAJQgqAXguADg");
	this.shape.setTransform(104.3,47.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#959EAD").s().p("Ah2A8QgjgIgNgLQgFgFgCgFQABgFACgFIACgCQAqgNAigQQAXgMAOgKIADgDIADgCIAAgBIABACQADAEAGABQAKADAcAAIABAAIAPAAIAHgBIABAAQAOgBANgDIAGgCIAEgBIAHAEIABAAIAAABIAAAAQAdAPA1ASIAPAFIABABIADACIAEAEIABADIAAACIgBABIgBADIgJAIQgMAIgSAHIgXAIQgZAGgaAFIgPACIgoADIgGABIg6AAIg6gLgAAdgPIAHARIARAvQAvgDAqgXQgTgJgWgNQgXgNgWgQQgLACgJAAIgMgBIAFAMgAgIgxQgPAAgLgDQgOgDAAgEQAAgEAFgDIAAAAIACgBIACgBIAEAAIAFAAIARgBIABAIIARABIAAgJIAiAAIADAAIADAAIAAgBQADAAAEACIAGADIAAAFIgGADIAAACIgDAAIgDABIgIACQgSADgTAAIgJAAg");
	this.shape_1.setTransform(96,46.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#767E8C").s().p("AgJATIgBAAQgdAAgJgDQgHgBgCgEIgBgCIAAAAIABgGIAAgIIAAgCIAAgCIAAgBIAAgBQAAAEANADQAMADAOAAIALAAQASAAASgDIAIgCIADgBIADAAIAAgCIAGgDIgCAMIgBAJIAFACIgFABIgFACQgNADgOABIgBAAIgHABIgPAAgAA7AQIAAgBIAAABgAg6gNIABgBIACgDIACgBQgEADAAAEIgBgCg");
	this.shape_2.setTransform(96.9,41.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#AFADAD").s().p("AgaAFQACgEAEgDQAKgKAOAAQANAAAKAJIgIAHQgGgFgJAAQgMAAgIALIgCADIgIgIg");
	this.shape_3.setTransform(94.4,16.2);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#686A6D").s().p("AgFBfQgFgEAAgIIABgEIABgEIADgFQAFgFAGAAQAHAAAFAFIADAEQACAEAAAFQAAAIgFAEQgFAGgHAAQgGAAgFgGgAgshYQAAgFABgCIAlgCIAvgDIADAIIABAEIhXAEQAAAAgBAAQAAAAAAgBQAAAAAAgBQgBgBAAgBg");
	this.shape_4.setTransform(94.1,10.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#8C8C8C").s().p("AACDCIgBgIIgCitQgMgCgIgIQgKgKAAgPQgBgFACgFIgJgBQgDgdgBg1IgBgIIgDhAIAAgDIBXgEIABALIAAACIACA4IAAABQACA0ADAnIgLABIABAKQAAAJgEAIQgCAEgEAEQgGAGgJADIAHCuIAAAJgAgJgjIgDAFIgBAEIgBAEQAAAIAFAEQAFAGAGAAQAHAAAFgGQAFgEAAgIQAAgFgCgEIgDgEQgFgFgHAAQgGAAgFAFgAgVgvQgDAEgDAEIAIAIIADgDQAHgMANAAQAIAAAHAGIAHgJQgKgIgNAAQgOAAgKAKg");
	this.shape_5.setTransform(94.5,20.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#F5F5F5").s().p("AhSBkQgjgrgDhCIAAgOIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQAMALAIANIAKAQQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtgAAzg6QgJAJAAAOQAAAwgEAyQAAANAIAKQAJAKANAAQANABAKgIQAKgJABgNQADg0AAgyQAAgOgJgJQgKgJgNAAQgNAAgJAJg");
	this.shape_6.setTransform(206.8,17.4);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#383A35").s().p("AheBSQgNAAgJgKQgIgKAAgNQAEgxAAgxQAAgOAJgJQAJgJANAAQANAAAKAJQAJAJAAAOQAAAygDA0QgBANgKAJQgJAHgLAAIgDAAgABVAgQgIgHAAgKIAAhIQAAgKAIgGQAGgHAKAAQAKAAAHAHQAHAGAAAKIAABDIAAAFQAAAKgHAHIgBABQgGAGgKAAQgKAAgGgHg");
	this.shape_7.setTransform(223.1,18.8);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#EEEEEE").s().p("AACB9QgrgIgWgsIgBgKIgCgXQgHgfgLgYIABgWIACgNQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5IgBACIAAhDQAAgKgGgHQgHgHgKAAQgKAAgHAHQgHAHAAAKIAABHQAAAKAHAIQAHAGAKAAQAJAAAHgFIgFALQgGALgGAHQgPARgYAAIgNgBg");
	this.shape_8.setTransform(227.8,14.2);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#A32B2B").s().p("AgYAyQgdACgWgkQgJgNgIgGIAegGIAFgBIgCgFIALAPQALARANABIAKgFIAAAAIAIgFQAUgKALgIIABgEIAJgZQADgGAGgDQAGgCAGACQAGACADAGQACAGgCAHIgJAXIAcAOQAGADACAGQACAGgDAGQgEAGgGACQgGACgGgEIgggRIgdARIAAgBIgIAFIAAAAQgSAJgFAAIgBAAg");
	this.shape_9.setTransform(248.4,42.3);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#4F7222").s().p("AhUCJQg0gtgNg+QgFgXAAgYQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAXAVARAgIAMAaQAKAZAHAfIADAWIAAAKIAAABQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMIAAAOQADBBAjAsQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiIgKgRQgIgNgMgLQgsgpg+AAQgKAAgJADg");
	this.shape_10.setTransform(205.8,18.7);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#E0DE39").s().p("AGoCbIgYAAIgCAAIgPgBIgCAAIgKAAIgMgBIgTgBIAGgqIAEgkIAAgCQAPhhAVg7IARABIAEAAIADAAIAKAAIALAAIACAAIAQAAIAYAAQgPBFgHBPQgDAbgBAdIgBAiIgWAAgAGZA9IACAAIgCAAgAneCJIgBgVIgCgjQAAhYARgyIAOgfIAOgBIAPgBIAEgBIAMAAIAQgCIANgCIgFASQgKAtAAA7QAAAXADAsIABADIAAABIAAALIAEAlIgHABIgCAAIgYACIgcACIggABIgCgPgAs6B2IABgDIgEgBQgWgKgUgMIALgiQAph1Ayg1IACABIACAAIAjAHIAkAGQg0AygpBhQgJAUgHAWIgKAfIgNgEgAA4BlIgjgDIgPAAIgCgBIgPAAIgFAAIgHg4IgHgkQgQhRgZg/IApgCIAFAAIASAAIAWAAIACAAIAWACQAHAdAFAqQAIAzADAzIAAAKIADA8IgJgDgAhjBmIADAAIgDABgALkASIgMgUQgkhAgKgrIgCgOIAEgBIALgDIAcgLQABgCAFgDIAPgGIAAABIALgGQAaBAAeA2QAUAjAWAdIATAZIgDABIgJAGIgSALIgBABIAAAAIgBABIgKAGIgLAGIgDABIgTAKQgfghgagtgAqtg9IABAAIgCABg");
	this.shape_11.setTransform(96.8,61.8);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#77A63B").s().p("ADKEvQABgdACgbQAHhQAQhGIAwgEQA1gGAzgNIAPgEIAfgJIAJgDIACAOQAKArAkA/IALAWQAbAtAfAhQgWAKgRAFIgBAAIgEABIgMADQhAAShGAKIgYADQglAEglACIg/ADIABgigAr7FPIgOAAIgKAAIgDAAQhcgBhXgOIgBAAIgGgBIgOgCIgogIIgVgEIgEAAIgEgBIALgfQAHgWAJgUQAohiA1gyIAQACIADABIABAAQAtAFAzADQAbACAcAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgPAeQgQAzAABZIACAjIABAVIABAPIgVABIgIAAIgDAAIgGAAIgDAAgAujB5IACgBIgBAAgAAZFGIgDAAIgHgBIgFgBIgEAAIgEgBQgWgEgbgGIgzgLQg0gMgdgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgqgHgeQA8ACA3AJIgBAAQAoAGBJARIA/AOIAJABIAIABIAGABIAiAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgjgFgAp4EjIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAEgSIBTgOIABAAQBZgQAmgFIANgCIABAAIAVgCIAJgBIAagDIAYgBQAZA/ARBSIAGAjIAHA5IgBAAIgJAAQgiABgkAEIgCAAIAAAAIgJABIgBABIgEAAIgFABQghAFg/ALIgBAAQhVAPg0AGIgBAAIgfAEIgDglgAxmELIgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGACgCIACgDIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIABgBIAGgDIABgBIADgBIABgBQAOgGATAAQAXAAANAHIAQAKQAGADAdAJIALAEIAGADIAXAGIADABIAAAAQgyA1gpB1IgLAjIgJgHgAJgDSQgWgfgVgiQgeg2gZhAIAzgfQAqgdAOgTIAOgXQAQg1AXguQAMgYANgVQAOA/AzAsQA5AyA5AAQA7AAAkgxQAfgsAAhBIAAgBQAXAsAsAIQAhAGATgVQAGgIAGgLIAMATQArBJAaBTIABAFIgEABIgeAGQikAfiAAIQg5AphBA4IhLBCIgOAMIgOAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAJiCHIAGgCIgBgBIgFADgAPIlQIANAFIgBAVIgMgag");
	this.shape_12.setTransform(121.3,43.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,257.7,77.3);


(lib.sss = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();
		this.cache(-47,35,287,127);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_2
	this.txt = new cjs.Text("", "bold 29px 'Source Sans Pro'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 36;
	this.txt.lineWidth = 343;
	this.txt.parent = this;
	this.txt.setTransform(98.3,58.6);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D1D4D9").s().p("AgugHIgHgSIgFgMIAMABQAJAAALgCQAWAQAWAOQAWAMATAJQgqAXguADg");
	this.shape.setTransform(91.9,155.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#767E8C").s().p("AgIATIgCAAQgdAAgKgDQgFgBgEgEIAAgCIAAAAIAAgGIAAgIIAAgCIAAgCIAAgBIAAgBQABAEANADQAMADAPAAIAKAAQASAAASgDIAIgCIACgBIAEAAIAAgCIAFgDIgBAMIgBAJIAFACIgFABIgGACQgNADgNABIgBAAIgHABIgOAAgAA6AQIABgBIAAABgAg6gNIABgBIADgDIABgBQgEADgBAEIAAgCg");
	this.shape_1.setTransform(84.6,149.7);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#959EAD").s().p("Ah2A8QgjgIgNgLQgFgFgCgFQABgFACgFIACgCQAqgNAigQQAXgMAOgKIADgDIADgCIAAgBIABACQADAEAGABQAKADAcAAIABAAIAPAAIAHgBIABAAQAOgBANgDIAGgCIAEgBIAHAEIABAAIAAABIAAAAQAdAPA1ASIAPAFIABABIADACIAEAEIABADIAAACIgBABIgBADIgJAIQgMAIgSAHIgXAIQgZAGgaAFIgPACIgoADIgGABIg6AAIg6gLgAAdgPIAHARIARAvQAvgDAqgXQgTgJgWgNQgXgNgWgQQgLACgJAAIgMgBIAFAMgAgIgxQgPAAgLgDQgOgDAAgEQAAgEAFgDIAAAAIACgBIACgBIAEAAIAFAAIARgBIABAIIARABIAAgJIAiAAIADAAIADAAIAAgBQADAAAEACIAGADIAAAFIgGADIAAACIgDAAIgDABIgIACQgSADgTAAIgJAAg");
	this.shape_2.setTransform(83.6,154.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#AFADAD").s().p("AgaAFQACgEAEgCQAKgLAOAAQANAAAKAJIgIAIQgGgGgJAAQgMAAgIALIgCADIgIgIg");
	this.shape_3.setTransform(82.1,124.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#8C8C8C").s().p("AABDDIAAgIIgCiuQgMgCgIgJQgKgJAAgOQAAgGABgFIgJgCQgDgcgCg2IgChHIAAgDIBXgEIABALIAAACIABA4QACA1ADAnIgLABIABALQAAAIgEAHQgCAGgEACQgHAHgIACIAGCwIABAIgAgJgjIgDAFIgBAEIgBAEQAAAIAFAFQAFAFAGAAQAHAAAFgFQAFgFAAgIQAAgFgCgEIgDgEQgFgGgHABQgGgBgFAGgAgVguQgEADgCAEIAIAIIACgDQAJgMAMAAQAIAAAGAHIAIgJQgKgJgNAAQgOAAgKALg");
	this.shape_4.setTransform(82.2,128.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#686A6D").s().p("AgFBgQgFgFAAgIIABgEIABgEIADgFQAFgGAGABQAHgBAFAGIADAEQACAEAAAFQAAAIgFAFQgFAFgHAAQgGAAgFgFgAgshYQAAgFABgBIAlgDIAvgDIADAIIABAEIhXAEQAAAAgBAAQAAgBAAAAQAAgBAAAAQgBgBAAgBg");
	this.shape_5.setTransform(81.7,118.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_1
	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#DBE2D2").s().p("A16hUQgKhogNhtIgHg0IAHAAQBcgDSXgUQS1gVFwgSQACCjALGsIAFDEQiqAE0CAPQzsAOhkADQACj5gZj3g");
	this.shape_6.setTransform(96.4,76.7);

	this.timeline.addTween(cjs.Tween.get(this.shape_6).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-75.3,35.5,347.2,126.1);


(lib.serpicopy3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape.setTransform(214,18.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_1.setTransform(206.8,17.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_2.setTransform(205.8,18.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383A35").s().p("AgPA1QgIgHAAgKIAAhIQAAgJAIgHQAGgHAJAAQAKAAAHAHQAHAHAAAJIAABIQAAAKgHAHQgHAHgKAAQgJAAgGgHg");
	this.shape_3.setTransform(233.2,16.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_4.setTransform(227.8,14.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#77A63B").s().p("AkdCvIgOgDQABgWALgoQARhDAcg5QBWirCQAAQCQAABjCiQAsBJAaBXIgFAAQjtAxijAAQhzAAhCgLg");
	this.shape_5.setTransform(212.6,27.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_6.setTransform(247.3,42.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#4F7222").s().p("AgbAZQgGgCgEgFIgEgHQgFgFgBgGQABgGAFgFQAEgEAGAAQAHAAAFAEQAEAFAGAIQADAGgBAGQgCAGgGAEQgEACgEAAIgEgBgAAVANQgFgFAAgHIAAgKQAAgHAFgEQAEgFAHAAQAGAAAFAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgGAAQgHAAgEgEg");
	this.shape_7.setTransform(220.1,23.8,1,1,0,0,0,-14,-13.6);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E0DE39").s().p("AGoCbIgYAAIgCAAIgPAAIgCAAIgKgBIgMAAIgTgCIAGgqIAEgkIAAgBQAPhiAVg8IARABIAEAAIADAAIAKABIALAAIACAAIAQAAIAYgBQgPBGgHBQQgDAagBAdIgBAiIgWAAgAGZA9IACAAIgCAAgAneCKIgBgVIgCgkQAAhXARg0IAOgdIAOgBIAPgCIAEgBIAMgBIAQgCIANgBIgFASQgKAtAAA8QAAAWADAsIABACIAAACIAAAMIAEAlIgHAAIgCAAIgYACIgcABIggACIgCgOgAs6B3IABgEIgEgCQgWgJgUgMIALgiQAph0Ayg2IACAAIACABIAjAHIAkAGQg0AygpBhQgJAUgHAWIgKAfIgNgDgAA4BmIgjgDIgPgBIgCgBIgPAAIgFAAIgHg5IgHgjQgQhRgZg/IApgBIAFAAIASgBIAWABIACAAIAWABQAHAdAFAqQAIAzADAyIAAALIADA7IgJgBgAhjBmIADAAIgDABgALkASIgMgVQgkg/gKgrIgCgNIAEgCIALgEIAcgLQABgBAFgCIAPgHIAAABIALgGQAaBAAeA2QAUAjAWAdIATAZIgDABIgJAGIgSAMIgBAAIAAABIgBAAIgKAFIgLAGIgDACIgTAKQgfghgagtgAqtg8IABAAIgCABg");
	this.shape_8.setTransform(96.8,61.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_9.setTransform(106.1,51.8);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgBBSQgNAAgJgKQgJgKABgNQACgxgBgxQgBgNAKgKQAJgJAMgBQANAAAKAKQAJAJAAANQABAygCA0QAAANgKAJQgJAJgMAAIgBgBg");
	this.shape_10.setTransform(206.6,14);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#4F7222").s().p("AhSCKQhHg7gChdQgBhEAgg1IACgDIAOgUIAJgGQAdgUAogBQA7gBAzAtQAyAsAWBaQADAKAAAMIABALQABBAgfAtQgiAxg7ACIgDAAQg2AAg6gwgAgZicQgKAAgJAEQggALgVAxIgKAdIgEARIAAABIAAAMQABBLAoAvQAmAsAxgBQAkgBAagRQAQgLAMgRQAJgNAGgQQAKgagBgfQgBgrgRghQgMgXgTgSQgsgng8AAIgDAAg");
	this.shape_11.setTransform(198.4,14);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#F5F5F5").s().p("AhPBlQgogvgChLIABgMIAAgBIAEgRIAJgdQAVgwAggMQAJgDAKAAQA+gCAtAoQATASAMAXQASAhABAsQABAfgLAaQgGAPgJANQgMARgQALQgZARgkABIgDABQgwAAgkgsg");
	this.shape_12.setTransform(199.3,12.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgHgHAAgKIgChIQAAgKAHgHQAHgHAKAAQAIAAAIAHQAHAGAAAKIABBIQABAKgHAHQgHAHgKAAIgBAAQgIAAgHgGg");
	this.shape_13.setTransform(225.8,11.4);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AAEB9Qg7gKgVhPQgMgrAGgpQACgOAEgMQAIgVALgMIAFgEQATgSAWAFQA1AOAaA1QAaA1gOA5QgJAmgOARQgQASgZAAIgMgBg");
	this.shape_14.setTransform(220.2,9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkcCzIgPgCQACgWAJgoQAPhEAcg5QBRiuCRgCQCQgEBmChQAuBIAbBWIgEABQjsA1ijAEIglAAQhZAAg3gIg");
	this.shape_15.setTransform(205.6,22.9);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgQAxQgdgBgUglQgOgXgMgGQgGgCgDgGQgDgGADgGQACgGAGgDQAGgDAGACQAWAHAVAmQAKARANADIAKgFIAAAAIAHgEIAAAAQAWgIAMgIIABgEIALgYQADgGAGgCQAGgDAGADQAGADACAGQADAGgDAGIgKAXIAaAPQAGAEACAHQABAGgEAGQgDAFgGACQgHABgFgEIgfgTIgfAPIAAgBIgHAEIgBABQgSAIgFAAIgBgBg");
	this.shape_16.setTransform(233,34.6,1,1,0,0,0,-7.1,-2.8);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgGgCgDgFIgFgHQgGgFAAgHQAAgFAFgFQAEgFAHAAQAHAAAEAFQAFAEAGAIQADAGgBAHQgCAGgGADQgEADgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQgBgHAFgFQAFgEAGgBQAHAAAFAFQAEAEABAHIAAAKQAAAHgEAFQgFAEgHAAIgBAAQgGAAgEgEg");
	this.shape_17.setTransform(192.3,37.9,1,1,0,0,0,-34.7,5.7);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AEfCkIgJgEIAkh8IAIgbIAVhMIARAIQAbAMAeADIgIAsIgQBlIgNBZQgwgIgtgSgAnaC+IgBgWQAAhFAFg4QAEgoAIghIAEgRQAlgBAkgJQgDAxAAA3IAAAOQAABCAGA5QgqAGgqAAIgMAAgAL3BSIgHgFQgegXgegmQgug5gWg8IAAgBIAEgDIAKgHIAGgFIAkgeIABACIAPAZIAFAKQAVAfAdAhQAfAmAfAbIAAABIAHAGIADADIgSAPIgjAdIgLAKgAsfAvIgTgaIgDgGQA2hhAug2QAOANAJAEQATANAUALIgSAXIgMASQgiAzgdA5IgOAbQgRgQgQgSgAhJhKIgShjQAxgOAtgCIAJBKQALBYAHBLIgGAAQgiAAgnAMQgKg9gOhJg");
	this.shape_18.setTransform(95.7,59.9);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFgEPQgfAAgfgEIAOhZIAPhmIAIgsIAZABQBhgBBVg5IAAABQAWA7AuA6QAeAlAeAXIAHAGIAAABIgBAAIgPALIgYARQiABTiTAAIgCAAgArdDlIgHgDQgZgLgxgaIgVgOIgUgRIANgbQAdg6AigzIANgSIASgWQBBAeBPAMQAaAFAaAAIAHAAIABAAIgEARQgHAigEAoQgGA4AABFIABAWQhWgDhTgjgAnaCKIAAgOQAAg4ADgxIAfgIIAAAAQAogMBBgfIABAAQBUgpAjgMQARgGARgFIASBiQAOBJAKA+IgLAEIgKAEQgfAMg8AdIgBABQhQAlgyAQIgBAAQgqANgrAHQgFg4gBhCgABaC2IAAAAQgxgegbgMQgUgJgXgEQgOgCgQAAQgHhMgLhXIgJhKIAVgBQBPAABJAfIAAAAQAmAPBFArQAjAWAZALIgWBNIgIAbIgjB8QgngRg8gmgALbBnIgIgGIAAgBQgfgcgfgmQgdgggUgfIgGgKIgPgZIgBgDIAAgBIAPgOIAEgEIAcgcQA1g1AigmIAEgEIACgBQBKg4A4AAQASAAAOAHQAdADASASQAXAYAAAuQAAAagJAdQg8BNhUBMIgWAUQgaAZgcAZIgCgDgAuYBQIgBgCQgmhVgCg9IAAgLQAAgHACgJQACgIAIgPIAEgHIAFgHQAOgQARAAQAWAAANARIAPAZQAGAJAaAYIALAKIAGAEQgvA2g2BhIgJgMg");
	this.shape_19.setTransform(104.6,52.2);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#383A35").s().p("AgDBSQgNgBgJgJQgIgLAAgNQAEgwAAgyQABgNAJgJQAJgJANAAQANAAAJAKQAJAJAAANQgBAygDA0QgBANgKAIQgJAIgKAAIgDAAg");
	this.shape_20.setTransform(199.8,15.2);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#4F7222").s().p("AAcC7Qg4gBg5gyQhGg+ABhcQAAhEAig0IACgEQAHgKAIgJIAJgGQAdgTAoAAQA7ABAyAvQAwAsAVBcIACAVIAAALQAABBghAsQgjAwg6AAIgBAAgAgoiZQggAKgWAxIgLAdIgEAQIgBABIAAAMQgBBLAnAxQAkAsAyABQAkAAAZgRQARgKAMgRQAKgNAGgPQALgaAAgfQABgrgRgiQgMgXgSgSQgrgqg+AAQgKAAgKADg");
	this.shape_21.setTransform(191.7,15);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#F5F5F5").s().p("AhSBkQgngxABhLIAAgMIABgBIAEgQIALgdQAWgxAggKQAKgDAKAAQA+ABArAqQASASAMAWQARAigBArQAAAggLAZQgGAQgKANQgMAQgRALQgZAQgkAAQgygBgkgsg");
	this.shape_22.setTransform(192.7,13.8);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#383A35").s().p("AgQA1QgHgHAAgKIABhIQAAgKAHgGQAGgHAJAAQAKAAAHAHQAHAHAAAKIgBBHQAAAKgGAHQgIAHgJAAQgJAAgHgHg");
	this.shape_23.setTransform(219.1,13.2);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#EEEEEE").s().p("AAAB9Qg7gMgShPQgLgsAHgpQADgNAEgMQAIgVAMgLIAGgFQATgRAVAGQA1APAZA2QAYA2gQA4QgKAmgPAQQgPARgXAAIgPgBg");
	this.shape_24.setTransform(213.7,10.7);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#77A63B").s().p("AhoC6QhzgBhCgMIgPgDQADgWAKgoQAShEAdg4QBWiqCQABQCQABBiCjQAsBJAZBXIgFABQjoAuihAAIgHAAg");
	this.shape_25.setTransform(198.2,23.9);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#A32B2B").s().p("ABHA3IgcgYIggAKIgIADIgBABQgVAFgEgCQgdgEgPgoIABAAQgKgZgLgHQgGgDgCgHQgCgGADgFQADgGAGgCQAHgCAGAEQAUAIAQApIgBAAQAIATANAEIAKgDIAAAAIAIgDQAXgGAMgFIACgFIAPgWQADgFAGgBQAHgCAGAEQAFADABAGQABAHgDAGIgNAUIAYAUQAGAEAAAHQAAAGgEAFQgEAGgGAAQgHAAgFgEg");
	this.shape_26.setTransform(226.1,37.8,1,1,0,0,0,-6.6,-2.3);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#4F7222").s().p("AgbAZQgHgCgDgGIgFgHQgFgFAAgFQAAgHAFgEQAFgFAGAAQAHAAAFAFQAEAEAGAJQADAFgCAHQgCAGgGAEQgDACgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQAAgHAFgFQAEgEAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgHAAQgGAAgEgFg");
	this.shape_27.setTransform(185.1,35.7,1,1,0,0,0,-34.7,1.7);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#E0DE39").s().p("AF1DHIgUgCQgsgIgogSIgDgBIADABQAIg0AKgxIADgLIAJgkIgEgCIAEABQANgzAOglIAIAEQAZAMAcADIAMACQgJAfgFAiQgKBGgBBtgAmqDFIgCgKQgEgvgCgjIAAgWQAAg1AIgxIAGgfQAegCAggIIAMgDIAAAYQAAA9AJAyQAFAfAJAkIAMApIgtAKQgdAFgdABIgFABIgHAAgAKXAlIgTgdQghgzgWgnIgLgXIACgCIABAAIAMgLQAPgMAPgPIAKgJIACgDIABgBIAOAYQAVAlAdAjQASAWAVAVQAOAPAZAQIgDADIg1A2IgGAIIgDACIgGAFIgBABIAAABQgZgXgSgagAruAwQgGgIgMgTIgJgPIAGgHIANgYQAqhDAwgpIANAJQASANATALIgRAYIgMATQgeAzgbA5IgBACIgBACIgFAMIgHARQgRgRgPgTgAgzgWIAAgBQgSh0gJgtQAogLAmgCIAUgBIAWABIAAAsIgBBxIgCBQIAAAKIgOgBIgFAAQgcAAggAKIgLhRg");
	this.shape_28.setTransform(95,59.5);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#77A63B").s().p("AEkELIgOgCQABhuALhFQAEgjAJggIAMAAQBZAABOg6IAMAXQAWAmAhAzIATAeQASAaAYAWIgOAMQiCBoiXAAIgXAAgAoSEGIgMAAQhQgChNglIgBAAIgHgCQgWgMgugbIgUgPQgJgHgIgJIgCgBIAIgRIAEgMIACgCIABgDQAag5AegzIAMgSIARgZQA9AiBKAKQAYAGAZAAIAGAAIABAAIAHAAIgFAeQgIAzAAA1IAAAWQABAiAEAvIACAKIgIAAgAmjDNQgJgkgFgfQgJgyAAg+IABgZIAPgDQAngOA7gfIABgBQBPgrAhgMIAfgMIAKgDQAJAtASBzIAAAAIALBTIgJADIgKAEIgCABIgIADQgcAMg4AeIgBABQhKAngwAQIAAAAIgjAMIgMgpgACrDrIgJgDIgDgBQgUgLgZgPIgtgeQgtgggZgMIgJgFQgPgFgQgEIgPgCIAAgJIADhRIABhxIAAgrQA9ADA6AcQAjAPBBAtQAhAXAWANIAIADQgOAlgNA0IgDgBIADABIgJAlIgCALQgLAwgHA1gAKDAuQgUgVgSgWQgegjgVgkIgNgYIAEgGIACgBQA2g0A2hCIAkgVIALgFQAqgXAzAAQA0AAAcAZQAcAZAAAxIgBAWQglAkgtAuIhxBzIgQARIgJAJQgYgRgPgPgAtqBFIAAAAIgBAAQgcg7AAhFIABgLIAAgFQAAgMABgKIACgDIABgCQAmhNAogBQAjAAAJAZQADAIAAAXIACAAIgFAbIgCAOIAAABIAPAPQgwApgqBCIgOAXIgFAJIgCgDg");
	this.shape_29.setTransform(104.5,52.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).to({state:[{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20}]},3).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).wait(3));

	// Layer_4
	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_30.setTransform(101.3,74.3);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("rgba(0,0,0,0.498)").s().p("Au7ALQgQgDANgRQA4hIBrATQDkApDngPQEBgRD9gTQGVgUF6BeQAOAEgMANQkLAQkNAHQiygGizAUQi7AUi5AAQlKAAk/hBg");
	this.shape_31.setTransform(101.3,74.3);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("rgba(0,0,0,0.498)").s().p("AuMALQgPgDANgRQA1hIBlATQDZApDbgPQD1gRDxgTQGBgUFnBeQANAEgLANQj+AQj/AHQiqgGiqAUQiyAUiwAAQk6AAkvhBg");
	this.shape_32.setTransform(101.3,74.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_30}]}).to({state:[{t:this.shape_31}]},3).to({state:[{t:this.shape_32}]},3).to({state:[{t:this.shape_31}]},3).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.6,0,259.3,81.9);


(lib.rrr = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();
		this.cache(-16,36,212,127);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_2
	this.txt = new cjs.Text("", "bold 29px 'Source Sans Pro'", "#333333");
	this.txt.name = "txt";
	this.txt.textAlign = "center";
	this.txt.lineHeight = 36;
	this.txt.lineWidth = 192;
	this.txt.parent = this;
	this.txt.setTransform(91.6,58.6);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D1D4D9").s().p("AgugHIgHgSIgFgMIAMABQAJAAALgCQAWAQAWAOQAWAMATAJQgqAXguADg");
	this.shape.setTransform(91.9,155.5);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#767E8C").s().p("AgIATIgCAAQgdAAgKgDQgFgBgEgEIAAgCIAAAAIAAgGIAAgIIAAgCIAAgCIAAgBIAAgBQABAEANADQAMADAPAAIAKAAQASAAASgDIAIgCIACgBIAEAAIAAgCIAFgDIgBAMIgBAJIAFACIgFABIgGACQgNADgNABIgBAAIgHABIgOAAgAA6AQIABgBIAAABgAg6gNIABgBIADgDIABgBQgEADgBAEIAAgCg");
	this.shape_1.setTransform(84.6,149.7);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#959EAD").s().p("Ah2A8QgjgIgNgLQgFgFgCgFQABgFACgFIACgCQAqgNAigQQAXgMAOgKIADgDIADgCIAAgBIABACQADAEAGABQAKADAcAAIABAAIAPAAIAHgBIABAAQAOgBANgDIAGgCIAEgBIAHAEIABAAIAAABIAAAAQAdAPA1ASIAPAFIABABIADACIAEAEIABADIAAACIgBABIgBADIgJAIQgMAIgSAHIgXAIQgZAGgaAFIgPACIgoADIgGABIg6AAIg6gLgAAdgPIAHARIARAvQAvgDAqgXQgTgJgWgNQgXgNgWgQQgLACgJAAIgMgBIAFAMgAgIgxQgPAAgLgDQgOgDAAgEQAAgEAFgDIAAAAIACgBIACgBIAEAAIAFAAIARgBIABAIIARABIAAgJIAiAAIADAAIADAAIAAgBQADAAAEACIAGADIAAAFIgGADIAAACIgDAAIgDABIgIACQgSADgTAAIgJAAg");
	this.shape_2.setTransform(83.6,154.5);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#AFADAD").s().p("AgaAFQACgEAEgCQAKgLAOAAQANAAAKAJIgIAIQgGgGgJAAQgMAAgIALIgCADIgIgIg");
	this.shape_3.setTransform(82.1,124.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#8C8C8C").s().p("AABDDIAAgIIgCiuQgMgCgIgJQgKgJAAgOQAAgGABgFIgJgCQgDgcgCg2IgChHIAAgDIBXgEIABALIAAACIABA4QACA1ADAnIgLABIABALQAAAIgEAHQgCAGgEACQgHAHgIACIAGCwIABAIgAgJgjIgDAFIgBAEIgBAEQAAAIAFAFQAFAFAGAAQAHAAAFgFQAFgFAAgIQAAgFgCgEIgDgEQgFgGgHABQgGgBgFAGgAgVguQgEADgCAEIAIAIIACgDQAJgMAMAAQAIAAAGAHIAIgJQgKgJgNAAQgOAAgKALg");
	this.shape_4.setTransform(82.2,128.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#686A6D").s().p("AgFBgQgFgFAAgIIABgEIABgEIADgFQAFgGAGABQAHgBAFAGIADAEQACAEAAAFQAAAIgFAFQgFAFgHAAQgGAAgFgFgAgshYQAAgFABgBIAlgDIAvgDIADAIIABAEIhXAEQAAAAgBAAQAAgBAAAAQAAgBAAAAQgBgBAAgBg");
	this.shape_5.setTransform(81.7,118.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.txt}]}).wait(2));

	// Layer_1
	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#DBE2D2").s().p("Av9gVQgHhcgWi4QgGgegBgWIAHAAQc1gyD1gMQABCZAMG2IAFDEQieAEuXAPQtuAOhrADQABjZgSjYg");
	this.shape_6.setTransform(88.9,76.7);

	this.timeline.addTween(cjs.Tween.get(this.shape_6).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-16.9,35.5,211.7,126.1);


(lib.ppp = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_1 = function() {
		this.stop();
		this.cache(0,0,258,78);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(1).call(this.frame_1).wait(1));

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#383A35").s().p("AgDBSQgNAAgIgKQgJgKABgNQADgxAAgxQAAgOAJgJQAJgJANAAQANAAAJAJQAJAJAAAOQAAAygDA0QgBANgKAJQgJAHgKAAIgDAAg");
	this.shape.setTransform(214,18.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F5F5F5").s().p("AhSBkQgngwABhLIAAgLIABgCIADgQIALgdQAWgxAggLQAJgDAKAAQA+AAAsAqQASASAMAWQASAiAAAsQgBAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_1.setTransform(206.8,17.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDIAPgTIAIgGQAegTAnAAQA7AAAzAuQAxAsAVBbQACALAAALIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQggALgWAwIgKAdIgEARIgBABIAAAMQAABLAnAwQAkAsAyAAQAkAAAZgQQARgLAMgRQAJgNAHgPQALgaAAgfQAAgrgSgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_2.setTransform(205.8,18.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383A35").s().p("AgQA1QgHgHAAgKIAAhIQAAgJAHgHQAHgHAJAAQAKAAAHAHQAHAHAAAJIAABIQAAAKgHAHQgHAHgKAAQgJAAgHgHg");
	this.shape_3.setTransform(233.2,16.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#EEEEEE").s().p("AABB9Qg7gLgThPQgLgsAGgpQADgNAEgNQAIgUAMgMIAFgEQAUgSAVAGQA1APAZA2QAZA1gPA5QgLAlgOARQgPARgYAAIgOgBg");
	this.shape_4.setTransform(227.8,14.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#77A63B").s().p("AkcCvIgQgDQACgWALgoQARhDAdg5QBUirCQAAQCRAABiCiQAuBJAZBXIgEAAQjuAxiiAAQh0AAhBgLg");
	this.shape_5.setTransform(212.5,27.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A32B2B").s().p("AgNAyQgdACgWgkIAAAAQgPgWgNgFQgGgCgDgGQgDgGACgGQABgGAGgDQAGgEAGACQAWAFAYAlQALARANABIAKgFIAAAAIAHgFIAAAAQAVgKALgIIABgEIAKgZQACgGAGgDQAGgCAGACQAGACADAGQACAGgCAHIgIAXIAbAOQAGADACAGQACAGgDAGQgDAGgGACQgHACgGgEIgggRIgdARIAAgBIgIAFIAAAAQgSAJgFAAIgBAAg");
	this.shape_6.setTransform(247.3,42.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#4F7222").s().p("AgbAZQgGgCgEgFIgFgHQgFgFAAgGQAAgGAFgFQAFgEAGAAQAHAAAFAEQAEAFAGAIQADAGgCAGQgCAGgFAEQgEACgEAAIgEgBgAAVANQgFgFAAgHIAAgKQAAgHAFgEQAEgFAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAFQgEAEgHAAQgHAAgEgEg");
	this.shape_7.setTransform(234.1,37.4);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E0DE39").s().p("AGoCbIgYAAIgCAAIgQAAIgBAAIgKgBIgMAAIgSgCIAEgqIAGgkIAAgBQAPhiAVg8IAQABIADAAIAFAAIAKABIALAAIABAAIARAAIAYgBQgRBGgGBQQgDAaAAAdIgBAiIgXAAgAGZA9IACAAIgCAAgAndCKIgCgVIgBgkQAAhXAQg0IAPgdIANgBIAPgCIAFgBIAMgBIAPgCIANgBIgEASQgLAtAAA8QABAWADAsIAAACIAAACIABAMIADAlIgGAAIgDAAIgXACIgcABIghACIgBgOgAs6B3IABgEIgDgCQgYgJgTgMIAKgiQAph0Azg2IACAAIADABIAiAHIAkAGQg0AygpBhIgQAqIgLAfIgMgDgAA3BmIgjgDIgNgBIgDgBIgOAAIgGAAIgIg5IgGgjQgPhRgag/IAqgBIAEAAIASgBIAWABIACAAIAWABQAHAdAGAqQAHAzAEAyIAAALQABAdAAAeIgJgBgAhiBmIACAAIgCABgALkASIgMgVQgjg/gKgrIgCgNIADgCIAKgEIAdgLQAAgBAGgCIAQgHIAAABIALgGQAZBAAeA2QAUAjAWAdIATAZIgCABIgKAGIgRAMIgBAAIgBABIgCAAIgJAFIgLAGIgDACIgTAKQgeghgbgtgAqtg8IABAAIgBABg");
	this.shape_8.setTransform(96.7,61.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAjA/IANAWQAaAtAeAhQgVAKgQAFIgBAAIgFABIgLADQhBAShFAKIgZADQglAEgmACIg+ADIABgigApiD9IgPAAIgLAAIgCAAQhbgBhYgOIgIgBIgNgCIgpgIIgTgEIgFAAIgEgBIAKgfIARgqQAohiA0gyIARACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAFAAIAAAAIAZgBIAagBIAIgBIgOAeQgQAzgBBZIABAjIACAVIABAPIgVABIgIAAIgDAAIgGAAIgCAAgAsLAnIABgBIgBAAgACyD0IgEAAIgHgBIgEgBIgGAAIgDgBIgygKIgygLQg1gMgbgFIgCAAQAAgegCgdIAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIgBAAQApAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIgBgLIAAgCIAAgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIABAAQBYgQAmgFIAOgCIAWgCIAJgBIAZgDIAZgBQAZA+APBSIAHAjIAIA5IgCAAIgJAAQgiABgjAEIAAAAIgDAAIAAAAIgJABIgCABIgDAAIgGABQgfAFhAALIgBAAQhUAPg2AGIAAAAIgeAEIgEglgAvPC5IAAgBIgCgBIgSgOQhBg4AAhFQABgUACgLIABgFQADgGACgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAEgDIACgBIAEgBIAAgBQAOgGATAAQAXAAANAHIAQAKQAHADAcAJIAKAEIAIADIAXAGIACABIABAAQgzA0gpB1IgKAjIgLgHgAL3CAQgVgfgUgiQgeg2gag/IAzggQArgdANgTQATgcAQgjIADgFQAcgRAjgMQBCgXA+AAQAkAAAbAIIAACtIgHAFIgCAAIgDACQg9AshHA8IhLBCIgNAMIgPAMIgJAGIgCACIAAAAIgIAFIgEADIgNAJIgTgZgAL5A1IAHgCIgCgBIgFADg");
	this.shape_9.setTransform(106.1,51.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,257.7,77.3);


(lib.estrella = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("AgSAnIg1gdIAugVIAMhAIAcAxIAsgQIgOAqIAbAuIg7gSIgYAwg");
	this.shape.setTransform(7.2,7.6);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.estrella, new cjs.Rectangle(0,0,14.4,15.2), null);


(lib.Symbol39 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#7C85A7").s().p("AoAJVIgtgKIgBgVIgBgRIABgYQAAgQACgHQAFgPAQgJQAFgCAhgIIARgDIASgFIAXgEIAagGIAwgKIABgBQBMgQAKgGQAWgQAAg7QAAgZgLgxIgDgQIgBgBIgIgoIgBgFIgCgKIgCgNIAAgBIgCgQIAAgDQADg0BVgTQAjgIA5gFQAugFA9gCQA4gBBCAAQArAAAqAJIAGABIAEABQAYAHAYAJIABAAIAEACQBEAZAdgBIADA2QAVACAYAAIB6AEIAIAAQgQhOgoiLIgJgfIgyirIgOgsIgPgzIgkh2IgniBQAAgPAIgGIABAFIAFgFIADgBQAcBIAaBLIADAIIARAwQAaBMAZBOQAWBHATBCIAVBLQAjCAAWBuIgCgCIghACIgNABQhHADgXABQg7AAgngGIgKgBIAFgMIgZgRQgmgbgmgMIgKgEQhogfh9AAQg+AAhYAXQgNAYgHAdQgFAYAAAcIAAABIACAAQgHACgNAKQgUASAAAdQAAATAPAPQARARAZgBIAIAgQAAAhg+AbIg9AXIg5AWIgRAGIgaALIAAABIABAEIgBAAIAAgCIgBgBIAAAAQgNgSgQgBQgNAAgFAHQgEAFAAAJQAAAFACAEQACAFAEAEIgHADIgcAQQgRAKgNALIgGAHIgBABIgBAAIgNgBIADAWIABAOIgSgDgAoFEQIgBAAIgIgeIgNgzIgDgMIgMg0IgLg0QgIgxgGg0QgGhCgBhHIgBglQAAhIAGg3IAIgNIAAAMIABAgQABA7AIBNIADAjQAMBqAUCIIAKA/IAJA6IAHAjIgPgBgAnDDoIgBAAIgDgFIgMgWIgFgKIAGAAIAPAAQAaAAAmgDIBPgHIgBAPIgBANIAAAEIgXAGQgiAKgZABIgMABQgdAAgSgDg");
	this.shape.setTransform(838.9,219.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#323543").s().p("AlbUbIgPAAIgbgBQgPgKgZgEIgNgCIAJhCIABgJIAFghICXAZQB4ATBdAMIAAAZIgXAGQgbAJgZALIgVALIgjADIgQAAQg9AEg9AAIgPAAgAi9OZIingKIgjgCIAUi0IAfACIBeAHIC9AMIAAChIAAAFIgBAPIiDgKgAjUGvIAjlAIAYjRQAlk/AXkBQAYj+AKjAQgRhugnhEIgGgIICDAAIABAbIgEBDIg0AAIAWIQIgLC2QgRFAgEDlIA/gDIABAbIAIDNIhJAEIAAAPIABADIgBAHIABAAIgBCTQhRgJhLgMgAEpmpQAJjTANl4QARgCATABQAxADAnAkQABAegEA8QgMDMgFDLIgMHtIgDBpIABCGIAAADIgBAAQg2AIg5ACg");
	this.shape_1.setTransform(860.2,85.9);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#3C4051").s().p("ABzG+IgRgEQhIgRhNgWIAAgDIgOgBIgCgBIAArJIAHhfIg7AAQAHgMAJABQAJAAAYAKIACgcQAAgDACgCQACgCAEAOQAFAOgBALIAAADIAQAGIAoATQgJCRgmIdIAAAKIACgJQAsAJB5AWIgFBrg");
	this.shape_2.setTransform(808,5.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#4D5368").s().p("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");
	this.shape_3.setTransform(847.2,113.3);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#343954").s().p("EgVfAh9QjYgPjkgSQtFhFyGiHIxIiEMAAAgrjQEwhMD9gvQE1g4EmgXIAhgCQCwgNCrAAQOiAdAlAAQFCAADGgfQAugHCkgmIBEAFQHaAgEcARQXhBcVAAkIGYAKIDeAEQgQBfgRBhIAFADIgBABQgDAHAAAFQAAANBKAwQBiA/CIAxIAfALIABAUIAtAKIASAEIgCgOIAiAKIgEALIgBACIAMAFICLA1QCcAzBoAAQB6AACfg5IACAAIgEAEIgFAGQgMARgJAaQgKAigBAhQABAYE3CdQCGBEB1A0QAaACAZAAQBZAAA3gQQAsgNAJgSQgwgRgHgHQh7gwhngyQgmgTglgQQiLg9iEggQg5gOgMgHQgVgLABgYQgBgFACgHQAFgRAOgaQAQgcAFgGIAeAOIAuAUQClBFCPAcQBCANBkAiIAzARIBgAiICZA4QCBAtBxAbIAACmIksAAQgrAMg6AIQhrAPibAFQhTAClMAAQloAArzhdQmOgyiUgPQkdgdi0AAQk1AAlFA5QkkAzkIBZQiEAshrAwQhdAqhLAsQgzAeglAcIgFAEQhLA7gQAzQD/AzIoAvQLZA/C2AWQEZAiDJAsQCZAiBrApQB1AsBIA2QAtAiAcAmQAuA/AABIQAAACkBAvQlDA6jyA/Qs2DXAAEXQAABGBjAaQA3APCkALQCaAKA/AVQBjAiAABRQABCjnABSQmKBIqpAAQqmAAtbg7gEBKLgHoIihggQBBgSBfgeQBRgXBUgSIAACZIikgggEAwngQUIBmAAIAAABIgYACIhQAIIACgLgEA4ogUMIAWgGIABgZIBqAMQBdAKA3ABIALAAIACARQAkgDAdgFIAJAfQjHgNilgTgEA+ogXsIAAi0QBNgMBQgOIgRE9IgEBgQgdAQgXASQgoh8gsh1gAFm0kQkwhVh9gZQiUgeidgEQhcgClWAIQl3AJlpABIhOAAQlSAArYgkQnVgYkBgIQiOgFhOAAQhBAAg/ACIhbADQiIgViLgZQkLgyiAgNQihgSjggFIAAoBIBRgDQFtgHFggwIBwgQIBjANQBFAIBLAFQDJAOD2gHQCegED9gMIBkgEQBNgCBKAGQEzAVDpCKQBOAvBbBMQAkAdAWAQQAMAMAPAKQB0BUFDAAIAAAAQF9AADfgjQCagYB9g1QCZhCAugMQCAghDWgCIAVAAQCwAAGPAzIEMAgQFBAlDnARIAJABQBPAFBiAMQBvAOCHAVIGNBFIBEAMQBoASBfAPQBnAQBdANQgOB7gQB9IgpgHIihgcQjogohjgQQjNgii5gLIgggCQhkgGiHgCQiRgEi6AAQm6AAi8AeQhZAQgxAIQhVANhyAGQADADBlA4QBqA/AkAjIAAAdgEAxHgVMIgWgDIAAguIAVADIB6AUIATADIgFAhIgBAJIiGgTgEBLggVrQhbgGhQAAQhBAAg5ADQgPjUgGjCQBjgWBlgaQBggZBhgbIAAICIhPgFgEA5EgZeIABgPIAAgFIBhgKIABAlIhjgHg");
	this.shape_4.setTransform(489.1,342.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#2A2E44").s().p("EhMuApLIAAuVIRICFQSGCHNFBEQDkATDYAPQNbA7KmAAQKpAAGKhIQG/hSAAijQAAhShjghQg/gViagLQikgKg3gPQhjgbAAhGQAAkWM2jXQDyg/FDg7QEBgvAAgBQAAhJgug+QgcgmgtgiQhIg3h1gsQhrgoiZgiQjJgtkZgiQi2gWrZg+Qoogwj/gzQAQgzBLg7IAFgEQAlgcAzgeQBLgsBdgpQBrgwCEgsQEIhZEkg0QFFg4E1AAQC0AAEdAdQCUAPGOAxQLzBeFoAAQFMAABTgDQCbgFBrgPQA6gIArgLIEsAAMAAAArcgEhMugbCQDgAGChARQCAAOELAxQCLAaCIAUIBbgDQA/gBBBAAQBOAACOAEQEBAJHVAXQLYAkFSAAIBOAAQFpgBF3gJQFWgIBcACQCdAECUAeQB9AaEwBVIBXAAIAAgdQgkgkhqg+Qhlg4gDgEQBygFBVgOQAxgHBZgRQC8gdG6AAQC6AACRADQCHADBkAFIAgACQC5AMDNAhQBjAQDoApIChAcIApAGQgYC5gfC9IjegEImYgKQ1Agk3hhcQkcgRnaggIhEgEQikAlguAHQjGAglCAAQglAAuigdQirAAiwAMIghACQkmAXk1A5Qj9AukwBNgEAwngRqQAFgvAFgYIAAj0IAWADICGATIgKBCIANACQAeATAxARQA/AVCTAjICJAgQgrgJgqAAQhDAAg3ABQg+ACguAFQg6AFgiAIQhWATgCA0IAAADIACAQIhmgBgEA6EgTNIAvALIABAFQgYgJgYgHgEA5FgdpIAxADIArADIAFCRIhhAKIAAihgEAw/gbVIgOgBIAAq5IABAAIAFgBIA6gLIAsgJIAygLIgJDXIgGDbIgBAlIgBBUIAWACIA3AEIgUC0Ii4gLgEAnZgb8QhfgPhogSIhEgMImNhEQiHgWhvgOQhigMhPgFIgJgBICThYIAngYIBRgyICghgIA9gkQApgXCghSIAEgFIASgGQAwgNBigJIAVgCIAlgDIBIgFQBZgFB2gEICSgDIAEAAQgGBtgIBqIgDA6QgMCOgNCGIgKBlQhdgMhngRgEAlwgjDQgFgCgFABIADAAIAHABIAAAAgEA+ogdVICdAHIADAAIAAADIgDA7QhQAOhNANgEBGggicIABkyIAAgHIAAhnQAzAGAxAHIAsAIQBaAPCkApIAAIyQhhAbhgAYQhlAahjAXQgGipAAiagEBA2gh9IgEAAIhUgCIg2AAIAAjMQA4gCA3gHIABAAIAAgDIgBiGIADhqQApgCAogBIAGAAQgFC3gJCOIgEA+IgDAqIgBAWIAAADIgBAIIgkgBgEA5GgiTIAAiSIAAAAIAAgHIAAgDIAAgPIBKgEIAHC3IhRgIg");
	this.shape_5.setTransform(489.1,350.6);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#24273A").s().p("AlzFSQlDAAh0hUQgPgKgMgMQgWgQgkgdQhbhMhOgvQjpiJkzgVQhKgGhNACIhkAEQj9AMieAEQj2AHjJgOQhLgFhFgIIhjgNQBygSCFgZIBegSIB+gZQF7hMCFgVIBagNQCDgRB7gIIAOgBQBVgEBQAAIAtAAIBzACIBWAEQCMAHBoASIAngDQBrAABbAPQA3AJAxAPQAiALAaALQAjAQATASIAJAJQAFAHAEAHIAIANIAKAMQAeAhAvAZIAiATIA1AcIBVAuIAhAOQBoAqBSAAIAugFIAFAAIArgGQAZgMAYgOIAPgIQBkg7BnhzIALgEQA1gSAbgZIAEgCIABAAQA9geBtgGQAagCCjAAIBrACQBzACBwAJIAHAAIAzAFQA6AFA5AHIAwAHIAIABIBKAKQA2AJA7ALQBYAQBhAWQBfAWBnAaQFkBcBEAOIAcAFQBLAPBGAJIBygQIBkgPIB5gUIAmgHQAWgEAVgFIg9AjIigBfIhRAzIgnAXIiTBZQjngRlBglIkMggQmPgziwAAIgVAAQjXACiAAhQguAMiZBCQh9A1iaAYQjfAjl8AAg");
	this.shape_6.setTransform(384.7,130.1);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#181A27").s().p("EBCWASqQh1gziGhEQk3idgBgZQABggAKgiQAJgbAMgQIAFgGIAEgFIgCABQifA5h6AAQhoAAicg0IiLg0IgMgFIABgCIAEgMIgigKIgDgWIAOABIABAAIAGAAIAcAIIAAABIACAhIAAABIAVACIBLAJIAbABIABgBIACgIIALgjIASAcIAJAOIACAFIA/ACIAAgOIAAgEIgDgcQAAgJAIAAQAKAAAIAQQAEAKABAKIAAANIAAAHIAQAAIAcAAQAYAAAYgCQgFgJgEgPIgEgMIgCgMIAWgKIAQgFIAAAHIAAAIQABALAFAVIACANIASgDIAHgCIAJgCIAAgBIAIgCIAGgCIAAABIAKgEIAQgHIASgKIAIgHIATgPIgKgTIgGgMQgHgNABgGIAAgBQAMgIAagIIAAAAIADATIAFAZIABAGQAhgVAwgVQBFgfBfgcIAEgBIA/gSQgChOgEhFIBJgEQBAgDAlAAQASAAAbABIBDAFIAWACIgPg9QAYAKAXALQAMAGAKAIIAqAFIASACQBQAIBQAEIASABIAfAAQAXgNAogBIgHhVQgQixgLilQA5gDBBAAQBQAABbAFIBPAGIAAMEQhUAShRAXQhfAdhBATIChAfICkAhIAADlQhxgbiBgtIiZg3IhggiIgzgSQhkghhCgOQiPgcilhEIgugVIgegNQgFAFgQAcQgOAagFARQgCAHABAGQgBAYAVAKQAMAIA5AOQCEAgCLA8QAlARAmASQBnAzB7AwQAHAGAwASQgJARgsAOQg3AQhZAAQgZAAgagDgEAtcAKbQiIgxhig+QhKgwAAgNQAAgGADgHIABgBQBAAkAzA1IAQAKIAAAFIAAACIABABIANAGIACgFIAMAHIAJAGQBBAWBDAUIAPAFIABAAQAIgHAKgFIAAAYIABARIgfgLgEAyWAKSQgGAAgHgCQgCgDAAgEQAAgJAGgJQAHgOAMAAQAIAAAPAGQAOAGADADQgHANgPAGQgNAHgNAAIgCAAgEAwcAGEQArgBApgDIAUgCIAagCQAKAxAAAZQABA7gWAQQgLAGhLAQIgBABIgwAKIAQiugEA3sAHSQgKgKABgOIAAgJQACgHAGgGIABgCQALgLAOAAQAOAAAKALQAKAKAAAOQAAAOgKAKQgKALgOAAQgOAAgLgLgEA0PAGjQgWgPAAgaQAAgVAIgMIABgBIABgBIALgBQAXgBAQARIADACQANAQAAAVQAAAUgNAQQgZgDgQgLgEA7TAFsIACAAIAAAEIgCgEgEA/EAEoIh6gEQgYAAgVgCIgDg2QgdABhEgZIgFgCIAAAAIgBgEIgvgMIgEgBIgGgBIiJggQiTgig/gWQgxgQgegUQAZAEAQAKIAbABIAPAAQBEABBFgEIAQAAIAjgEIAVgKQAZgMAbgIQClATDHANQAoCMAQBOIgIAAgEA/8AA/QAXgTAdgPIgHC0QgWhKgXhIgAVIsMIgcgHQhEgOlkhbQhngbhfgVQhhgWhYgQQBHgTBngRQBUgOBrgNQCogVCegMIABAAQBPgMBZgLIDEgXIAmgEIAPgCIASgCQCKgQA6gMQCNgcCMgMIADBMIAYAAIAJACIAiAFIAEAAIBaAJIA1ADICQAIQCWAKB1AEIAIAAIARABIgBAQIgEBNIgEAAIiSAEQh2ADhZAGIhIAEIglADIgVACQhiAJgwANIgSAHIgEAFQigBRgpAYQgVAFgWAEIgmAHIh5AUIhkAQIhyAQQhGgKhLgOgEhMugPZQCfgFB2gqIApgQIA4gYQAmgSAZgJIASgIQAtgRBNgIQBxgLEHAAQB0AABrABIAnABIB7ACQC1AGCWAKQDLAOBrAVIhaANQiFAUl7BNIh+AZIheASQiFAYhyASIhwAQQlgAwltAIIhRACg");
	this.shape_7.setTransform(489.1,208.2);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#12141D").s().p("AyGpzIGIAAIAMABQDmALCwASQgrBlgQA3Qg0CnAADFIAAAbIABAvQACAkAFAOIAAACIAAABQgBABAAAAQAAABAAAAQAAABAAAAQABAAAAABIAAABIAQAAIAEgHQAJAKAQAHQARAHAYAGIAAhGIgGgjQgJg8gBgkQApAqBYASQBJAPCXAFIBhADIBwADIgEAqQgEAmgDAoQgFBGAABKQAAAgACAmIAKAGQAMAGAJADIAXisIAHgzQAIhDAFg5QAFhIAAg5IAAgMQBVAFCpAGID4AJIgHAJQglA0ghA7QgnBHgYBDQghBgAABWIAAAJIAJAFIAGACQAWAJAeAAQAOAAAVgDQAOhTAAhrIAAgMIgBgQQAhAKAlAIQBfAVB6AHIA+ADIBaAEIAeABIgKAqQgHAigEAZQgcATgqAkIgPANIAAADQAMBeAXBbIgOABQh7AIiDARQhrgVjLgOQiWgKi1gFIh7gDIgngBQhqgBh0AAQkHAAhwALQhOAIgtARIgSAIQgZAJgmASIg4AYIgpAQQh2AqifAFg");
	this.shape_8.setTransform(113.9,46.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#222635").s().p("AAPBmIhygCQAVidAAgZIAAgDQAMgBBhgRIAOgCQADAoAbBdIAIAZQAJAeAIAXIhVgEg");
	this.shape_9.setTransform(253.7,86.3);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#626983").s().p("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");
	this.shape_10.setTransform(839.3,108.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_6
	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#2A2E44").s().p("EhNlA0UMAAAhidIGIAAIALABQDnALCwARQgrBmgRA3Qg0CnAADFIAAAbIABAvQACAlAFAOIAAACIAAABQAAABAAAAQgBABABAAQAAAAAAABQAAAAAAAAIAAACIAQAAIAFgHQAJAKAPAHQARAGAZAHIAAhGIgGglQgJg7gBgkQAoApBYASQBJAPCXAGIBiADIBxADIgFArQgEAmgDAoQgEBGAABKQAAAgABAmIAKAFQAMAHAJACIAXisIAHgyQAIhDAFg7QAFhHABg6IgBgLQBWAFCoAFID4AKIgGAJQgmAzghA8QgnBIgXBDQgiBgAABWIABAJIAIAFIAGACQAWAJAfAAQANAAAVgEQAOhSAAhrIAAgMIAAgRQAhALAkAIQBfAVB6AHIA/ADIBaADIAdACIgKAqQgHAigEAYQgbAUgrAkIgPAMIAAAEQAMBeAXBbQBVgFBRAAIAtABQAVieAAgaIAAgCQALgBBjgRIAOgCQADAoAbBdIAHAZQAKAeAIAXQCMAIBoASIAogDQBrgBBbAQQA2AJAxAPQAiAKAaAMQAkAQATASIAIAJQAGAHAEAHIAIAMIAKANQAdAgAvAaIAiASIA1AdIBVAtIAhAPQBpArBSAAIAugFIAFgBIArgGQAagMAYgNIAPgJQBjg7BnhzIAMgEQA1gSAagZIAFgCIABgBQA9gdBsgGQAbgCCiAAIBsABQBzADBvAJIAGAAIA0AFQA6AFA5AHIAvAGIAIABIBKALQA3AIA7AMQBGgTBngRQBVgOBqgNQCpgVCegMIABAAQBPgMBZgLIDDgXIAmgEIAPgCIASgCQCLgQA6gMQCNgcCLgMIAAgBIgDhOIgCghIgEhoIgRkzQgXnDABi3IAAhTID9AAQgGDTAAD8IAGD+IAFELIACA4ID5ASIDGAMIAHAAIABhCQAJkqAAlFQAAh4gQkFIEhAAQAHgMAJABQAJAAAYAKIABgbQABgDACgDQABgBAFANQAFAOgBALIAAADIAPAGIApATQgJCRgmIeIgBAKIADgJQAsAKB6AVIAjqgIAAh2IAFgLQAdg6AjgdQAhgdAmAAQAnAAAfAfIADggQAAgEACgCQADgDADAAQAEAAACAEQADABAAAFIgDAnIgBAJQAKALAJAPICDAAIABAbIgEBCIE/AAIgBAQIgFCkIgBAVQARgCATAAQAxADAoAlQAAAegDA8QgMDMgGDLIgMHuQApgDAogBIAGAAQAFjFAAj2IAAkZQAAmygCidQAEgoADgpIABgdIFCAAIgMG1QgIEfgEE2IgBAcIABAAIA7gGIAJgBQC8gVA+gJIACAKIAAgLQgJphAAijQASgGAdgLIATgHIAAgDIgBgjQAAgDAEgDQACgCADAAQAEAAADACQACADAAADIABAgQAcgKALABQAcAAALBsQAJBUAAC/IAWFnQABAjgBAiIgBA7QgpANg9AOIhCARIgQAAIAAAEQhcAVhWAOIgUADQg/AJg8AGIgCEAQAyAFAyAIIAsAHQBZAQCkAoMAAABQ7gEAk5gX7QgFgBgFABIACAAIAIAAIAAAAgEAv5gbGIABgBIAGAAIA5gLIAtgKIAygKIAXn2IACgXIAAAAIgRgEQhJgQhNgXIAAgDIgOgBIgDgBgEA4lgmFQgSFAgEDmIBAgEIgGiKIgapOg");
	this.shape_11.setTransform(494.7,279.4);

	this.timeline.addTween(cjs.Tween.get(this.shape_11).wait(1));

	// Layer_5
	this.instance = new lib.estrella();
	this.instance.parent = this;
	this.instance.setTransform(853.1,20.6,1,1,0,0,180,7.2,7.6);

	this.instance_1 = new lib.estrella();
	this.instance_1.parent = this;
	this.instance_1.setTransform(613.9,26.5,1,1,0,0,180,7.2,7.6);

	this.instance_2 = new lib.estrella();
	this.instance_2.parent = this;
	this.instance_2.setTransform(204.7,27.2,1.546,1.546,0,0,180,7.2,7.6);

	this.instance_3 = new lib.estrella();
	this.instance_3.parent = this;
	this.instance_3.setTransform(182.7,-19.5,1,1,0,0,180,7.2,7.6);

	this.instance_4 = new lib.estrella();
	this.instance_4.parent = this;
	this.instance_4.setTransform(922.2,2.6,1,1,0,0,180,7.2,7.6);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#A6ACBD").s().p("AgOAPQgGgGAAgJQAAgIAGgGQAGgHAIAAQAJAAAHAHQAFAGABAIQgBAJgFAGQgHAGgJAAQgIAAgGgGg");
	this.shape_12.setTransform(577.2,99.6);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#E5E5E5").s().p("A+gJrQgIgHABgJQgBgJAIgIQAGgGAKAAQAKAAAGAGQAIAIgBAJQABAJgIAHQgGAIgKAAQgKAAgGgIgEgipAFKQgEgFAAgGQAAgHAEgFQAFgEAHAAQAGAAAFAEQAEAFAAAHQAAAGgEAFQgFAEgGAAQgHAAgFgEgA8UEyQgFgGAAgHQAAgHAFgGQAGgGAIABQAHgBAFAGQAGAGAAAHQAAAHgGAGQgFAFgHABQgIgBgGgFgAfVEPQgFgIAAgLQAAgLAFgIQAFgHAGAAQAHAAAEAHQAFAIAAALQAAALgFAIQgEAIgHAAQgGAAgFgIgEBCPAEHQgIgHABgJQgBgLAIgGQAGgIALABQAJgBAHAIQAIAGgBALQABAJgIAHQgHAIgJgBQgLABgGgIgA0KEDQgEgEAAgGQAAgGAEgEQAFgFAFAAQAHAAAEAFQAEAEAAAGQAAAGgEAEQgEAFgHgBQgFABgFgFgA22DpQgIgIAAgKQAAgLAIgHQAHgIALAAQAKAAAIAIQAHAHAAALQAAAKgHAIQgIAHgKABQgLgBgHgHgEglDACfQgGgHgBgKQABgKAGgHQAHgHAKAAQAKAAAHAHQAIAHAAAKQAAAKgIAHQgHAHgKAAQgKAAgHgHgA3iB1QgGgHAAgKQAAgKAGgHQAHgHAKAAQALAAAGAHQAIAHAAAKQAAAKgIAHQgGAHgLAAQgKAAgHgHgEA96ABtQgJgIABgLQgBgLAJgIQAHgHALAAQALAAAIAHQAHAIABALQgBALgHAIQgIAIgLAAQgLAAgHgIgArEA4QgEgEgBgIQABgGAEgFQAFgGAHAAQAHAAAGAGQAEAFAAAGQAAAIgEAEQgGAGgHgBQgHABgFgGgEAkVgBwQgHgIgBgKQABgLAHgJQAIgHALAAQALAAAIAHQAHAJAAALQAAAKgHAIQgIAIgLAAQgLAAgIgIgEgmEgCEQgIgGAAgKQAAgKAIgGQAGgIAKAAQAJAAAIAIQAGAGAAAKQAAAKgGAGQgIAIgJgBQgKABgGgIgA0ei+QgDgDAAgGQAAgFADgEQAEgDAFAAQAGAAAEADQAEAEAAAFQAAAGgEADQgEAEgGAAQgFAAgEgEgEA8igEbQgGgGAAgJQAAgIAGgGQAGgGAJAAQAIAAAGAGQAGAGAAAIQAAAJgGAGQgGAGgIAAQgJAAgGgGgEA+vgEkQgIgIAAgKQAAgLAIgHQAHgIALAAQAKAAAIAIQAHAHAAALQAAAKgHAIQgIAHgKAAQgLAAgHgHgAlrkiQgFgFAAgHQAAgHAFgFQAFgFAHAAQAHAAAFAFQAFAFAAAHQAAAHgFAFQgFAFgHAAQgHAAgFgFgEgxegFcQgHgHAAgIQAAgJAHgHQAGgGAJgBQAJABAGAGQAHAHAAAJQAAAIgHAHQgGAGgJAAQgJAAgGgGgAT2lsQgJgJAAgMQAAgMAJgIQAIgJAMAAQAMAAAIAJQAJAIAAAMQAAAMgJAJQgIAJgMAAQgMAAgIgJgA8alxQgGgHAAgJQAAgJAGgGQAHgHAIAAQAJAAAHAHQAGAGABAJQgBAJgGAHQgHAGgJAAQgIAAgHgGgAQ0l7QgGgFABgHQgBgIAGgGQAGgFAHAAQAHAAAGAFQAFAGABAIQgBAHgFAFQgGAGgHAAQgHAAgGgGgAgvmDQgIgJgBgMQABgNAIgJQAJgJANAAQANAAAIAJQAJAJgBANQABAMgJAJQgIAJgNAAQgNAAgJgJgEg+ngGdQgIgIAAgMQAAgLAIgIQAIgIAMAAQALAAAIAIQAIAIAAALQAAAMgIAIQgIAIgLAAQgMAAgIgIgEAjigGzQgGgGAAgKQAAgJAGgIQAHgGAJAAQAKAAAHAGQAGAIABAJQgBAKgGAGQgHAHgKAAQgJAAgHgHgAConKQgFgFAAgHQAAgHAFgGQAGgEAHAAQAGAAAGAEQAFAGAAAHQAAAHgFAFQgGAFgGABQgHgBgGgFgEAgzgHWQgHgIgBgKQABgKAHgIQAHgHALAAQAKAAAIAHQAGAIABAKQgBAKgGAIQgIAHgKAAQgLAAgHgHgA+fnlQgIgGAAgLQAAgLAIgHQAGgHALAAQALAAAHAHQAHAHAAALQAAALgHAGQgHAIgLAAQgLAAgGgIgA8Cn5QgGgHAAgKQAAgJAGgHQAHgHAJABQAKgBAHAHQAHAHAAAJQAAAKgHAHQgHAGgKABQgJgBgHgGgAF6oBQgIgGABgKQgBgJAIgHQAGgGAJAAQAKAAAHAGQAGAHAAAJQAAAKgGAGQgHAIgKAAQgJAAgGgIgEgrIgH/QgFgEAAgHQAAgGAFgFQAFgFAGAAQAGAAAFAFQAFAFAAAGQAAAHgFAEQgFAGgGAAQgGAAgFgGgEgu3gIKQgJgIAAgMQAAgNAJgJQAJgJAMAAQAMAAAJAJQAJAJAAANQAAAMgJAIQgJAKgMgBQgMABgJgKgA2JoOQgHgHAAgJQAAgKAHgHQAHgGAJgBQAJABAIAGQAGAHAAAKQAAAJgGAHQgIAGgJAAQgJAAgHgGgEAkMgIWQgFgGgBgJQABgIAFgGQAGgFAJAAQAIAAAGAFQAFAGABAIQgBAJgFAGQgGAFgIAAQgJAAgGgFgAapocQgEgFAAgFQAAgGAEgFQAFgEAGgBQAGABAFAEQAEAFAAAGQAAAFgEAFQgFAFgGAAQgGAAgFgFgEhCvgItQgIgIAAgKQAAgLAIgHQAHgIALAAQAKAAAIAIQAHAHABALQgBAKgHAIQgIAHgKAAQgLAAgHgHgAQKpBQgJgIAAgMQAAgMAJgJQAHgHANAAQAMAAAIAHQAIAJAAAMQAAAMgIAIQgIAJgMAAQgNAAgHgJg");
	this.shape_13.setTransform(551.9,52.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_13},{t:this.shape_12},{t:this.instance_4},{t:this.instance_3},{t:this.instance_2},{t:this.instance_1},{t:this.instance}]}).wait(1));

	// Layer_4
	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.lf(["#1C8791","#243B5D"],[0,1],0,-315.1,0,315.1).s().p("EhMuAxPMAAAhidIGIAAIALABQDnALCwASIANgeMCMmAAAMAAABidgEAlwgbAQgFgBgFABIADAAIAHAAIAAAAgAul/bIAHALIgGgLIAAAAIgDgCIACACg");
	this.shape_14.setTransform(489.1,299.1);

	this.timeline.addTween(cjs.Tween.get(this.shape_14).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol39, new cjs.Rectangle(-2,-55.3,993.3,669.5), null);


(lib.Symbol31copy4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_4 = function() {
		playSound('boing');
	}
	this.frame_16 = function() {
		this.stop();showText();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(4).call(this.frame_4).wait(12).call(this.frame_16).wait(1));

	// Layer_5
	this.bamboo = new lib.uuu();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(51.2,-360.4);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({y:-29.3},4).to({y:-27.4},2).to({y:-31.2},2).to({y:-27.4},4).to({y:-29.3},3).wait(2));

	// Layer_4
	this.instance = new lib.ppp();
	this.instance.parent = this;
	this.instance.setTransform(170.8,-214.1,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({y:117},4).to({scaleY:0.89,y:122},2).to({scaleY:1.05,y:115},2).to({scaleY:0.89,y:122},4).to({scaleY:1,y:117},3).wait(2));

	// Layer_3
	this.instance_1 = new lib.Tween1("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(143.3,-178.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({y:152.6},4).to({scaleY:0.89,y:153.5},2).to({scaleY:1.05,y:152.3},2).to({scaleY:0.89,y:153.5},4).to({scaleY:1,y:152.6},3).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-24.2,-504.9,347.2,334);


(lib.Symbol31copy3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_4 = function() {
		playSound('boing');
	}
	this.frame_16 = function() {
		this.stop();showText();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(4).call(this.frame_4).wait(12).call(this.frame_16).wait(1));

	// Layer_5
	this.bamboo = new lib.ttt();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(54.8,-360.6);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({x:54.4,y:-29.8},4).to({scaleY:0.97,y:-24.9},2).to({scaleY:1.03,y:-35.8},2).to({scaleY:0.97,y:-24.9},4).to({scaleY:1,y:-29.8},3).wait(2));

	// Layer_4
	this.instance = new lib.ppp();
	this.instance.parent = this;
	this.instance.setTransform(170.8,-214.1,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({y:117},4).to({scaleY:0.89,y:122},2).to({scaleY:1.05,y:115},2).to({scaleY:0.89,y:122},4).to({scaleY:1,y:117},3).wait(2));

	// Layer_3
	this.instance_1 = new lib.Tween1("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(143.3,-178.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({y:152.6},4).to({scaleY:0.89,y:153.5},2).to({scaleY:1.05,y:152.3},2).to({scaleY:0.89,y:153.5},4).to({scaleY:1,y:152.6},3).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(40.4,-325.1,259.3,154.2);


(lib.Symbol31copy2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_4 = function() {
		playSound('boing');
	}
	this.frame_16 = function() {
		this.stop();showText();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(4).call(this.frame_4).wait(12).call(this.frame_16).wait(1));

	// Layer_5
	this.bamboo = new lib.rrr();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(54.8,-360.6);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({x:54.4,y:-29.8},4).to({scaleY:0.97,y:-24.9},2).to({scaleY:1.03,y:-35.8},2).to({scaleY:0.97,y:-24.9},4).to({scaleY:1,y:-29.8},3).wait(2));

	// Layer_4
	this.instance = new lib.ppp();
	this.instance.parent = this;
	this.instance.setTransform(170.8,-214.1,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({y:117},4).to({scaleY:0.89,y:122},2).to({scaleY:1.05,y:115},2).to({scaleY:0.89,y:122},4).to({scaleY:1,y:117},3).wait(2));

	// Layer_3
	this.instance_1 = new lib.Tween1("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(143.3,-178.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({y:152.6},4).to({scaleY:0.89,y:153.5},2).to({scaleY:1.05,y:152.3},2).to({scaleY:0.89,y:153.5},4).to({scaleY:1,y:152.6},3).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(37.9,-325.1,261.8,154.2);


(lib.Symbol31copy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_4 = function() {
		playSound('boing');
	}
	this.frame_16 = function() {
		this.stop();showText();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(4).call(this.frame_4).wait(12).call(this.frame_16).wait(1));

	// Layer_5
	this.bamboo = new lib.sss();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(51.2,-360.4);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({y:-29.3},4).to({y:-27.4},2).to({y:-31.2},2).to({y:-27.4},4).to({y:-29.3},3).wait(2));

	// Layer_4
	this.instance = new lib.ppp();
	this.instance.parent = this;
	this.instance.setTransform(170.8,-214.1,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({y:117},4).to({scaleY:0.89,y:122},2).to({scaleY:1.05,y:115},2).to({scaleY:0.89,y:122},4).to({scaleY:1,y:117},3).wait(2));

	// Layer_3
	this.instance_1 = new lib.Tween1("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(143.3,-178.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({y:152.6},4).to({scaleY:0.89,y:153.5},2).to({scaleY:1.05,y:152.3},2).to({scaleY:0.89,y:153.5},4).to({scaleY:1,y:152.6},3).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-24.2,-324.9,347.2,154);


(lib.Symbol1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 4
	this.noche = new lib.Symbol39();
	this.noche.name = "noche";
	this.noche.parent = this;
	this.noche.setTransform(488.2,302.7,1,1,0,0,0,488.2,302.7);

	this.timeline.addTween(cjs.Tween.get(this.noche).wait(1));

	// Layer 3
	this.tarde = new lib.Symbol38();
	this.tarde.name = "tarde";
	this.tarde.parent = this;
	this.tarde.setTransform(486.6,302.7,1,1,0,0,0,486.6,302.7);

	this.timeline.addTween(cjs.Tween.get(this.tarde).wait(1));

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#837A52").s().p("AjBCeQgFAAgHgCQgCgDAAgDQAAgJAGgKQAHgNALAAQAJAAAOAFQAOAGAEAEQgHAMgPAHQgNAGgNAAIgDAAgACVghQgKgKAAgOIABgJQACgHAGgGIABgCQALgKAOAAQAOAAAKAKQAKAKAAAOQAAAOgKAKQgKALgOAAQgOAAgLgLgAhHhPQgWgPAAgbQAAgVAHgLIACgCIABgBIALgBQAXAAAQAQIACACQAOAQAAAVQAAAVgNAPQgZgCgQgLg");
	this.shape.setTransform(830.6,258.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E5E0C9").s().p("AoAJVIgtgKIgCgmQAAgjADgMQAFgPAQgJQAHgEBCgOIAXgEIBKgQIABgBQBMgQAKgGQAWgQAAg7QAAgZgLgxIgDgQIgBgBIgIgoIgBgFIgEgXIgCgRIAAgDQADg0BVgTQAjgIA5gFQAugFA9gCQA4gBBCAAQAwAAAvALQAYAHAZAJIAEACQBEAZAdgBIADA2QAVACAYAAIB6AEIAIAAQgaiAhZkjIholWQAAgPAIgGIABAFIAFgFIADgBQBCCtA7C4QBQD+AnDEIgCgCIghACIgNABQhHADgXABQg7AAgngGIgKgBIAFgMIgZgRQgmgbgmgMQhrgkiEABQg+AAhYAXQgZArAAA+IAAABIACAAQgHACgNAKQgUASAAAdQAAATAPAPQARARAZgBIAIAgQAAAhg+AbIg9AXIg5AWIgRAGIgaALIAAABIABAEIgBAAIAAgCIgBgBIAAAAQgNgSgQgBQgWAAAAAVQAAAKAIAIIgjATQgRAKgNALIgHAIIgBAAIgNgBIAEAkIgSgDgAoFEQIgBAAIgVhRIgPhAQghiPAAi4QAAhIAGg3IAIgNIAAAMQAACUAtEpQANBWANBGIgPgBgAnDDoIgBAAIgUglIAVAAQAyAABdgKIgCAcIAAAEIgXAGQgqAMgdAAQgdAAgSgDg");
	this.shape_1.setTransform(838.9,219.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#9C9367").s().p("AjoJmIgRAAIABgGIgBgOQgBgKgEgJQgHgRgLAAQgIAAAAAJIAEAcIAAAFIAAANIg/gCIgDgFIgJgNIgSgcIgLAjIgCAIIAAABIgcgCIhLgIIgVgDIAAgBIgCggIABgIIgSgBIAAAAIgDAAIgHAAIgHgBIAHgHQANgLARgLIAjgTQgIgHAAgLQAAgUAWAAQAQAAANATIAAgBIABABIAAACIABAAIgBgDIAAgBIAagLIARgGIA5gWIA9gXQA+gcAAghIgIgfQgZAAgRgQQgPgPAAgUQAAgcAUgSQANgKAHgDIgCABIAAgCQAAg+AZgqQBYgYA/AAQCDAABrAjQAmANAmAaIAZARIgFANIAKABQAnAFA7AAQAXAABHgDIANgBIAhgCIACACQgnjFhQj9Qg7i5hCitIgDABIgFAGIgBgGQADgCAEgBIACABIAAABIAEAAQAsgBBwEnQBqEXBQE2IgXgCIhDgEQgbgCgRAAQgmAAhAAEIhJADQAEBFACBPIg/ASIgDABQhgAchEAeQgwAVgiAWIgBgHIgFgZIgDgTIAAAAQgZAJgMAHIAAABQAAAGAGANIAGANIALATIgUAOIgHAHIgSAKIgQAHIgLAEIAAgBIgGADIgIACIAAAAIgJACIgGACIgTAEIgCgOQgEgUgBgLIgBgIIABgIIgRAGIgWAKIADALIADAMQAFAPAEAJQgXACgZAAIgbAAgAlWH7QgFAKAAAJQAAADABADQAHACAGAAIACAAQANAAANgGQAPgHAHgMQgDgEgOgFQgOgGgJAAQgMAAgHANgAAJEnIgCABQgFAGgCAIIAAAIQAAAOAJAKQAKALAOAAQAOAAAKgLQAKgKAAgOQAAgNgKgKQgKgLgOAAQgOAAgKALgAjgDbIAAABIgCACQgIALAAAVQAAAbAWAPQAQALAZACQAOgPAAgVQAAgUgOgRIgDgCQgQgQgXAAIgLABgADxD0IAAgDIgCAAIACADgAoMEHIgkgCQgNhFgNhWQgtkpAAiVIAAgLIABAAQAMgPAUgBQAEABAJAEIgBAOQAAClAaDKIAXCZIABALIAGAAIAUAlIABAAQASADAdABQAdAAAqgMIAXgGIAAgFIACgcIAYgCIAEAYIABAEIAIApIABABIADAQIgaACIgUABQgxAEg0AAIg0gBg");
	this.shape_2.setTransform(844.7,220.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#6B793E").s().p("AAAABIABgBIAAABg");
	this.shape_3.setTransform(790.1,275.6);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#9FAD70").s().p("AhZYCQAMm8AKnWIAHlsIAAgBIAFliIADixIABg6QAEmHAAlLQABjRgFkZIAQAAQAEEZAADRQAAFRgEGPIAAAsIgDCyIgGFiIgCCcIgEDQQgKHYgOG/IgPgFgAACX4QAWk1ANnTIAAgVIgNgCQgUgFgHgEQgCgDgBgDQgCgDACgCQABgDADgBQADgCADACIAMAFIAVAFIAChNIAAgBQAGjbADj7QAFndAAt5QAAi4ADifIAQAAQgDCfAAC4QAAN5gFHdQgED4gEDXICMAQQggg3gXgYIDbAOQEKAQCDAMQgJlxgeqXQggrQgPmPIBlAAIAIErQAMG6gBDqQAACtAOF3QAQF9AABZQAABAgMCIIgEAzQAAADgCACIgGACQjXgJkjgcIhVgIIiWgRIgDBHQA+AMCCARIBAAJIBSAKQErAjDVAiIACiEIAAgeQABi0gLkzQgMkzAAmfQAApWAFmYIAQAAQgFGYgBJWQAAGfANEyQAKEoABDAIAAAQIAAAQIgECMIgBADIgEADIgEABQjWghkxglIhlgMIgngFQiFgShAgMIgBApQgOHLgTEuQgHgEgKgFgAkBXKIgBgBIAAgDIAAgEIgQgKQg2g4hCgkQBUnWAsm9QANiGAMiPIADg5QALiOAHiWQAPATAWAPIAEhHIAAgNIACgvIglgBIjygIQiegGhggFIhagFQgBAAAAgBQgBAAAAAAQgBAAAAAAQgBgBgBAAQgDAagLAUIgFAIQgGAJgGAGIgJgCIgYAAIgDhOIgEhOIgBghIgFhoIgQkzQgXnCAAi3IAAhTIBFAAIgBBAQAAGRAgFSIAGBKQARDPAGCXIBTAEQBgAHCfAFQCKAGBsACIAgABIADhKIgJABQh7AMjJgdIAAAAQjKglgOABIgDgBQgBAAAAgBQgBAAAAAAQgBgBAAAAQAAAAAAgBIgBgEIADgiQAHhgABg4QAAgqgFiAIgFibQgLkHAAihIABi/IAQAAIAAC/QAACiAKEFIAFCMQAFCNgBAtQAAA4gHBgIgCAbIDRAkQDOAdB6gPIACAAIABAAIAAgKIADgyIgtgnIAHAAIAChDQAJkqAAlEQAAh4gQkFIBlAAQgIDzgjNjIAAANIgCAxIAAACIgBAGIAAACIgDBWIAAACQgCAbgBAbIAAAGIgEBWQgzTLgYF6IAAAEIgCAEIgNgFg");
	this.shape_4.setTransform(788.5,118.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#7C8755").s().p("AhNYLIAAgBQAVgPgSgPQATkuAOnLIABgqQA/ANCFASIAnAEIBlANQExAlDWAhIAEgCIAEgCIABgEIAEiLIAAgRIAAgQQgBi/gKkoQgNkyAAmfQABpWAFmYICKAAIgBAPIgEClQgOGGgJDZIAAaZQgmAKg4AEIgCgRIgLAAQg3gBhdgKQh+gNjCgeIipgcIh7gUIgUgDIAAEhQgQBWgcFaIgDAmIg/gRgAioXyQAOm/AKnYIAEjQIACicIAGliIADizIAAgsQAEmPAAlQQAAjRgEkZIBcAAQgDCfAAC3QAAN6gFHcQgDD8gGDaIAAACIgCBNIgVgGIgMgEQgDgCgEACQgDAAgBAEQgCACACADQABADACACQAIAFAUAFIANACIAAAVQgNHTgWE1QgHgFgKgEIghAHQgQAGgKALgAk7XCIgJgGIgMgGIAAgEQAYl6AzzLIAEhWIAAgHQABgbACgbIAAgBIADhXIAAgCIABgFIAAgCIACgxIAAgNQAjtjAIjzIA8AAQAFEZgBDRQAAFLgEGHIgBA5IgDCyIgFFiIAAABIgHFsQgKHVgMG8QhDgThBgXgAEpLpIhSgKIhAgJQiCgRg9gMIADhHICVARIBVAIQEjAbDXAKIAGgCQACgCAAgEIAEgyQAMiIAAhAQAAhagQl9QgOl2AAitQABjrgMm6IgIkqIB0AAQgFGYAAJWQAAGfAMEzQALEzgBCzIAAAfIgCCDQjVghkrgjgAglJhQAEjXAEj5QAFncAAt6QAAi3ADifIA9AAIgHBfIAAfdIAOABQAXAYAgA3IiLgQgAk6i+IABgQIgRgBIgIAAQh1gEiWgJIiQgJIg1gDIhagIIgEgBIgigEQAGgHAGgIIAFgJQALgTADgaQABAAABAAQAAABABAAQAAAAABAAQAAAAABAAIBaAGQBgAFCeAGIDyAIIAlABIgCAvIAAANIgEBHQgWgPgPgTgAkukwQhsgDiKgFQifgGhggGIhTgEQgGiXgRjQIgGhKQgglRAAmSIABg/IByAAIgBC+QAACiALEGIAFCcQAFB/AAArQgBA4gHBfIgDAjIABAEQAAAAAAABQAAAAABABQAAAAABAAQAAABABAAIADAAQAOAADKAlIAAAAQDJAdB7gMIAJgBIgDBKIgggBgApVmZIjRgkIACgaQAHhgAAg4QABgtgFiNIgFiMQgKkFAAijIAAi+IA3AAQgGDSAAD8IAFD+IAGEMIABA3ID6ASIDFAMIAtAoIgDAyIAAAKIgBAAIgCAAQgpAFgxAAQhlAAiJgUg");
	this.shape_5.setTransform(797.9,121);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#778352").s().p("AFGXpQgEjVgJl6IgBgkQgLnHgEk9IAAgQQgCikAAh+QAAhSAChaIA5gEQAwgFAugFIAygHQBegOBWgUIBagYQAEAAACgDQAAgBAAAAQABgBAAAAQAAgBAAAAQAAgBAAgBQADhbAAhwQAAjMgKjtIgIjBIAAgDQAcgJAKAAQAdAAAKBsQAJBVAAC/IAXFnQABAjgBAhIgBA8QgqANg8AOIhCARIgQAAIAAADQhcAWhWAOIgUACQg/AKg8AFIgDFmIAAAHIgBEyQAAHXA2JZIAHBUQgnACgYANIgfAAgACUXbIAFjuIgOq4IADhPIAAgBIAAgFIAChLIAFiYIABgeIATpoIADh8QAUqYAFlLICGAAQgBBDgaHJQgPENgGDeIgBARIgCBqIAAACQgCBfAABVQAACFACCuIAAASQAEE0AKGzIABAuIAAABQAKF5ADDUQhQgEhQgJgABxLyQhCgxgggaIAAgDIgDAAQh4gFjggMIh2gHIjugPIhegHIhWgGIATgJQAogUARgeQAMgVAAgaIHTAnIALABIAIABIGgAkIADCoIgMgJgAkWIfIgEAAIgKgBInjgpIgCgxIgCg+IgChFIgGjSQAAiaAMi4QAOjRAaivQAKhMACh4QgBh/ACgsIAAgBIAAhfIgBinIgBhPIgBgNIAAgHQgBhFgCgKQgBgEgEgCQAAAAgBgBQAAAAgBAAQAAgBgBAAQAAAAgBAAIgCgZQAigcAmgBQAmABAgAeIAAAIIgiGjIgjG0Qg6LDgIEVIACAGQADADADAAQDBAWDzAZIA3AFIBFAHIARACQC8ATBSAHIgBBIIAAANImQgjgAh6HEIgUgCIhZgJIgQgCQkGgajNgYQAIkVA5q5IAfl1QAclXAJiEQAMAPAMATQAnBFARBuQgLC/gXD+QgXEBglE/Ig7IRQDBAfDkAKICQAAIBTACIAFAAIAjABIAAgIIACABQAhAaAgAjIAYAdIgBASQhNgGipgRgAErngIABgOQAGjeAQkPQAanKABhDIAoAAIgMG0QgIEfgEE3IgBAcIABAAIAAACQAbAUAnAiIhLAIIg7AEIAChig");
	this.shape_6.setTransform(904.4,96);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#869359").s().p("AFsXoQgDjUgJl5IAAgBIgBgtQgLm0gEkzIAAgTQgCiuAAiEQAAhWAChfIAAgCIAChqIABgRQAGjdAQkOQAanJABhDIARAAQgBBDgaHKQgPEPgHDfIAAANIgCBjIA6gFIBLgIQgmghgcgVIAAgCIA7gGIAJgBQC8gVA+gKIACALIAAgMQgJpgAAijQASgGAdgLIATgHIAAgDIgBgjQAAgDAEgDQACgCADAAQAEAAADACQACADAAADIABAgIAAADIAIDAQAKDuAADLQAABwgDBcQAAAAAAABQAAABAAAAQAAABAAAAQgBAAAAABQgCADgEAAIhaAYQhVAVhfANIgyAHQguAGgwAEIg4AEQgCBbAABSQAAB+ACCjIAAAQQADE9ALHIIABAjQAJF6AEDVIgSgBgAC6XaIgpgGQgLgHgMgGQgpgVgsgNQAEiiALjkIATl4QAgAbBDAxIAMAJIgEipImggkIgHAAIgMgBInTgnQAAAagLAVQgRAdgpAUIgTAJIgVgCIAAhUIABglIAHjbQALkQAVm8IApsiIAAh2IAGgKQAdg7AjgdIACAZQAAABABAAQAAAAABAAQAAAAABAAQAAABAAAAQAEACABAEQACAKABBGIABAGIAAANIABBPIABCnIAABfIAAABQgBAtAAB+QgCB4gKBMQgZCvgODRQgNC4AACbIAHDRIABBFIADA+IABAyIHjAoIALABIADAAIGQAjIAAgNIAChIQhSgGi9gUIgRgBIhEgIIg3gFQj0gZjBgWQgDAAgDgDIgCgGQAJkVA5rDIAkm0IAhmjIAAgIIADgfQAAgFACgBQADgDADAAQAEAAACAEQADABAAAFIgDAnIgBAJQgJCDgcFYIgeF0Qg6K5gIEVQDOAYEFAaIAQACIBaAJIATACQCqASBNAGIAAgTIgYgcQgggkgggZIgCgCIAAgDIABgVIACgrIAFg+QASknAAnYIAAkaQAAmygCicQAEgoADgpIABgdICDAAQgFFLgUKZIgEB7IgTJpIgBAdIgECYIgDBLIAAAFIAAABIgDBPIAPK4IgGDuIgSgBg");
	this.shape_7.setTransform(898.8,95.9);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#697447").s().p("AjMUbIgPAAIgbgBQgUgNgigDIALhLQBMoWAYmjIACgvIAMjiIAAgGQAJijAHicQgzgIg1gMIgRgEQhIgQhOgXIAAgDIgOgBIg3gSQgzgQgjgOIACg1IADg9IAmk/QAJiqAMhLQAPhgAYABQAJABAYAKIACgcQAAgDACgDQACgBAEANQAFAPgBAKIAAADIAQAHIAoASQgJCRgmIeIAAALIACgKQA0AMCgAbIAIACIAxAIIABAAIABgZQAMkVAIkBIAJkuIEVAAIABAbQgKCLgWGDIgOD7QgSFAgDDlIFdgSIgMh3QgTi3gJiCQgblsAYjZIAQgKQAmgWAyADQAxADAoAkQAAAegDA8QgMDMgGDLIgOJWIABCGIAAADIgBAAQhwAPh4gFIjpAMIAAAPIAAADIAAAHIAAAAIgCJjQgCDLgECQQgnAJgkARIgTALIgkADIgPAAQg9AEg9AAIgPAAg");
	this.shape_8.setTransform(840.6,63.4,1,1,0,0,0,-5.3,-22.5);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#937D47").s().p("AldBwIg5gWIAEgMIg9gSIgYgIQAcgRBSgRQAvgKChgbQA/gUBUgUQEEg+DzgHQAFAGACAHQAAAMhsArQiCA0g0AlQgmAcgzAUQguATgrAFQg6AWgZgBQgdgCg/AFQhJAEglAAQgkAAgwgRg");
	this.shape_9.setTransform(832.9,271.2);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#C9A858").s().p("AHrJvQh1gziHhEQk2idAAgZQAAggALgiQAJgbAMgQIAFgGIAEgFIgDABQifA5h5AAQhoAAicg0IiMg0IgLgFIAAgCIA6AWQAvARAlAAQAkAABJgEQBAgFAcABQAaACA7gWQArgGAugSQAzgVAlgbQA1gnCBgyQBsgrAAgMQgDgHgEgGQjzAHkEA9QhVAUg+AUQihAcgwAKQhSARgcARIgpgPQiJgxhhg9QhKgwgBgNQAAgGADgHQC2hxIFhKIAagEQC1gaDBgQIBYgHIgBAAQgXgRgDgTIjCguQiTgig+gWQg7gUgfgXQAjgZAwgJQAYgFAjgDICGASQDiAdEpARQAKgKALgJQCPh3GrAAQBQAABbAFIBPAGIAAMEQhTAShRAXQhfAdhBATIChAfICjAhIAADlQhxgbiBgtIiZg3IhfgiIgzgSQhlghhCgOQiOgcimhEIgtgVIgegNQgGAFgQAcQgOAagEARQgCAHAAAGQAAAYAUAKQANAIA4AOQCFAgCKA8QAmARAmASQBnAzB7AwQAHAGAwASQgKARgrAOQg4AQhYAAQgZAAgagDg");
	this.shape_10.setTransform(864.7,265.3);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#D0C681").s().p("AgBAzQgQhnAAgXIABgRQAMBdAWBbIgNABIgGgqg");
	this.shape_11.setTransform(220.8,87.5);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#ECC872").s().p("EhMuApLIAAuUIRICEQSGCHNFBEQDkATDYAPQNbA7KmAAQKpAAGKhIQG/hSAAijQAAhShjghQg/gViagLQikgKg3gPQhjgbAAhGQAAkWM2jXQDyg/FDg7QEBgvAAgBQAAhJgug+QgcgmgtgiQhIg3h1gsQhrgoiZgiQjJgtkZgiQi2gWrZg+Qoogwj/gzQAQgzBLg7IAFgDQAlgdAzgeQBLgsBdgpQBrgwCEgsQEIhZEkg0QFFg4E1AAQC0AAEdAdQCUAPGOAxQLzBeFoAAQFMAABTgDQCbgFBrgPQA6gIArgLIEsAAMAAAArcgEhMugbCQDgAGChARQCAAOELAxQCLAaCIAUIBbgDQA/gBBBAAQBOAACOAEQEBAJHVAXQLYAkFSAAIBOAAQFpgBF3gJQFWgIBcACQCdAECUAeQB9AaEwBVIBXAAIAAgdQgkgkhqg+Qhlg4gDgEQBygFBVgOQAxgHBZgRQC8gdG6AAQC6AACRADQCHADBkAGIAgABQC5AMDNAhQBjAQDoApIChAcQCyAdDGAdIB5ASIEMAlQgjADgYAEQgwAKgjAYQAfAYA7AUQA/AVCTAjIDCAtQADAUAXAQIABAAIhZAIQjAAQi1AaIgaADQm1gCnHgKImYgKQ1Agk3hhcQkcgRnaggIhEgEQikAlguAHQjGAglCAAQglAAuigdQirAAiwAMIghADQkmAWk1A5Qj9AukwBNgEAnZgb8QhfgPhogSIhEgMImNhEQiHgWhvgNQhigMhPgGIgJAAICThZIAngYIBRgyICghgIA9gjQApgYCghSIAEgEIASgHQAwgNBigJIAVgCIAlgDIBIgFQBZgFB2gEICSgDQB7gDCPgUIA6gJIAbgFIAGgBIAFgBIA6gLIAsgJIBLgQIC2gpIAwgLIAagGIBMgQIAKgCQBWgTBEgMIA1gJIA2gIQAugHAsgFIARgCQBhgKBcgCIAqAAQBrAABpAIIArAFQA5AGA4AIIAsAIQBaAPCkApIAAIyQhhAbhgAYQtKDXqMAAQj1AAnKhJgEAlwgjDQgFgCgFABIADAAIAHABIAAAAg");
	this.shape_12.setTransform(489.1,350.6);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#F7D47F").s().p("EgVfAh9QjYgPjkgSQtFhFyGiHIxIiEMAAAgrjQEwhMD9gvQE1g4EmgXIAhgCQCwgNCrAAQOiAdAlAAQFCAADGgfQAugHCkgmIBEAFQHaAgEcARQXhBcVAAkIGYAKQHHAJG1ADQoGBLi1BxQgDAHAAAFQAAANBKAwQBiA/CIAxIAqAPIAYAHIA9ATIgEALIgBACIAMAFICLA1QCcAzBoAAQB6AACfg5IACAAIgEAEIgFAGQgMARgJAaQgKAigBAhQABAYE3CdQCGBEB1A0QAaACAZAAQBZAAA3gQQAsgNAJgSQgwgRgHgHQh7gwhngyQgmgTglgQQiLg9iEggQg5gOgMgHQgVgLABgYQgBgFACgHQAFgRAOgaQAQgcAFgGIAeAOIAuAUQClBFCPAcQBCANBkAiIAzARIBgAiICZA4QCBAtBxAbIAACmIksAAQgrAMg6AIQhrAPibAFQhTAClMAAQloAArzhdQmOgyiUgPQkdgdi0AAQk1AAlFA5QkkAzkIBZQiEAshrAwQhdAqhLAsQgzAeglAcIgFAEQhLA7gQAzQD/AzIoAvQLZA/C2AWQEZAiDJAsQCZAiBrApQB1AsBIA2QAtAiAcAmQAuA/AABIQAAACkBAvQlDA6jyA/Qs2DXAAEXQAABGBjAaQA3APCkALQCaAKA/AVQBjAiAABRQABCjnABSQmKBIqpAAQqmAAtbg7gEBKLgHoIihggQBBgSBfgeQBRgXBUgSIAACZIikgggEA3agUVIiHgSIkMglIh5gRQjGgdiygeIihgcQjogohjgQQjNgii5gLIgggCQhkgGiHgCQiRgEi6AAQm6AAi8AeQhZAQgxAIQhVANhyAGQADADBlA4QBqA/AkAjIAAAdIhXAAQkwhVh9gZQiUgeidgEQhcgClWAIQl3AJlpABIhOAAQlSAArYgkQnVgYkBgIQiOgFhOAAQhBAAg/ACIhbADQiIgViLgZQkLgyiAgNQihgSjggFIAAoBIBRgDQFtgHFggwIBwgQIBjANQBFAIBLAFQDJAOD2gHQCegED9gMIBkgEQBNgCBKAGQEzAVDpCKQBOAvBbBMQAkAdAWAQQAMAMAPAKQB0BUFDAAIAAAAQF9AADfgjQCagYB9g1QCZhCAugMQCAghDWgCIAVAAQCwAAGPAzIEMAgQFBAlDnARIAJABQBPAFBiAMQBvAOCHAVIGNBFIBEAMQBoASBfAPQHKBJD1AAQKMAANKjXQBggZBhgbIAAICIhPgFQhbgGhQAAQmrAAiQB3QgLAKgJAKQkqgSjigdg");
	this.shape_13.setTransform(489.1,342.1);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#E5DD77").s().p("AAUAaIgvgGIAmguQAHAaAKAbIgIgBg");
	this.shape_14.setTransform(519.3,104.5);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#D9B767").s().p("AlzFSQlDAAh0hUQgPgKgMgMQgWgQgkgdQhbhMhOgvQjpiJkzgVQhKgGhNACIhkAEQj9AMieAEQj2AHjJgOQhLgFhFgIIhjgNQBygSCFgZIBegSIB+gZQF7hMCFgVIBagNQCDgRB7gIIAOgBQBVgEBQAAIAtAAIBzACIBWAEQCMAHBoASIAngDQBrAABbAPQA3AJAxAPQAiALAaALQAjAQATASIAJAJQAFAHAEAHIAIANIAKAMQAeAhAvAZIAiATIA1AcIBVAuIAhAOQBoAqBSAAIAugFIAFAAIArgGQAZgMAYgOIAPgIQBkg7BnhzIALgEQA1gSAbgZIAEgCIABAAQA9geBtgGQAagCCjAAIBrACQBzACBwAJIAHAAIAzAFQA6AFA5AHIAwAHIAIABIBKAKQA2AJA7ALQBYAQBhAWQBfAWBnAaQFkBcBEAOIAcAFQBLAPBGAJIBygQIBkgPIB5gUIAmgHQAWgEAVgFIg9AjIigBfIhRAzIgnAXIiTBZQjngRlBglIkMggQmPgziwAAIgVAAQjXACiAAhQguAMiZBCQh9A1iaAYQjfAjl8AAg");
	this.shape_15.setTransform(384.7,130.1);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#ECE47D").s().p("AvKGMQAAg4AHg1QAXi/BrieQA8haBYhPQC7isDvg6QB7geCIAAQBdAABXAOQEcAuDZDDIAFAFQBqBhBDBvQBuC4ACDhQgggNgXgQQgSgMgvgPQgegKgegGQgBiXhCh9QgshShIhIIgRgRQiyikj2AAQhJAAhDAPQipAkiECCQiyCvgFD3IAAAOQAAA6AJA2QieAMioAVQhrANhUAOQgFgvAAgxg");
	this.shape_16.setTransform(654.8,57.5);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#FFFABD").s().p("ApmFtQgKg2ABg7IAAgOQAEj1CyixQCEiBCrglQBCgOBIAAQD2AACyCkIARAQQBJBIAsBUQBBB8ABCXQgcgGgbgDQhSgHh4AGIgQABIgDABQilAKimAiQg5ALiLAQIgSACIgPACIgmAFIjDAWQhZAMhPAMIgBAAIAAAAg");
	this.shape_17.setTransform(671.5,64.3);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#C9A95E").s().p("EAjXADIIgcgGQhEgOlkhcQhngbhfgVQhhgWhYgQQBHgSBngRQBVgOBqgNQCogVCfgLIABAAQBOgNBagLIDDgXIAmgEIAPgCIASgCQCKgQA6gLQCngiClgLIADAAIAPgBQB4gHBTAIQAbACAcAGQAeAGAeAKQAvAPASAMQAXAQAgANQAuASBAANQBUAQDTAtIAGACIAyAJIg6AJQiPAVh7ACIiSAEQh2AChZAGIhHAEIgmADIgVACQhiAJgvAOIgTAGIgEAFQigBRgpAYQgVAFgWAEIgmAHIh5AUIhkAQIhyAQQhGgKhLgOgEg+fgAEQCfgFB2gqIApgQIA4gYQAmgSAZgJIASgIQAtgRBOgIQBwgLEHAAQB0AABrABIAnABIB7ADQC1AFCWAKQDLAOBrAVIhaANQiEAVl7BLIh/AZIheASQiFAYhyASIhvARQlhAvltAIIhRACg");
	this.shape_18.setTransform(398,110.1);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#9A8249").s().p("A0wpzIGIAAIAMABQDmALCwASQgrBlgQA3Qg0CnAADFIAAAbIABAvQACAkAFAOIAAACIAAABQgBABAAAAQAAABAAAAQAAABAAAAQABAAAAABIAAABIAQAAIAEgHQAJAKAQAHQARAHAYAGIAAhGIgGgjQgJg8gBgkQApAqBYASQBJAPCXAFIBiADIBvADIgEAqQgEAmgDAoQgEBGAABKQAAAgACAmIAJAGQAMAGAJADIAXisIAHgzQAIhDAFg5QAFhIAAg5IAAgMQBVAFCpAGID4AJIgHAJQglA0ghA7QgnBHgYBDQghBgAABWIAAAJIAJAFIAGACQAWAJAeAAQAOAAAVgDQAOhTAAhrIAAgMIgBgQQAhAKAlAIQBfAVB6AHIA+ADIBaAEIAeABIgKAqQgHAigEAZQgcATgqAkIgPANIAAADIgCARQAAAYARBoIAGApQh7AIiDARQhrgVjLgOQiWgKi1gFIh6gDIgngBQhrgBh0AAQkHAAhwALQhOAIgtARIgSAIQgZAJgmASIg4AYIgpAQQh2AqifAFgATbHxIhzgCQAWieAAgaIAAgCQALgBBjgRIANgCQAEAoAbBdIAHAZQAJAfAJAXIhWgEg");
	this.shape_19.setTransform(130.9,46.8);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#B4B355").s().p("EgvoAF7IAAgEIAPgNQArgjAbgUQAEgZAHgiIAKgqIgdgBIhagEIg/gDQh6gGhfgVQgkgJghgKIAAARIAAALQAABsgOBSQgVADgNAAQgfAAgWgJIgGgCIgIgFIgBgJQAAhWAihgQAXhDAnhIQAhg6Amg0IAGgJIj4gJQiogGhWgFIABAMQgBA5gFBHQgFA6gIBDIgHAzIgXCsQgJgDgMgGIgKgGQgBgmAAggQAAhJAEhHQADgnAEgnIAFgrIhxgDIhigDQiXgFhJgPQhYgRgogpQABAkAJA6IAGAkIAABGQgZgGgRgHQgPgHgJgJIgFAGIgQAAIAAgBQAAAAAAgBQAAAAAAgBQgBAAABgBQAAAAAAgBIAAgBIAAgCQgFgOgCglIgBgvIAAgaQAAjFA0inQARg3ArhlIAMgeMA+cAAAQjkBAjlBUQiBAviAA1QrwE5rJICIgHgaQgbhdgDgoIgOACQhjARgLABIAAACQAAAagVCeIgtAAQhRAAhVAFQgXhbgMhegEBDUAH2IgsgHQiHiGiXh4QnElrpNj0IgFgCQhRghhUggQjDhIjJg6MAiOAAAIAARiQikgphZgQg");
	this.shape_20.setTransform(524.1,40.4);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#BDB65C").s().p("EgmHALLIhVgtIg1gdIgigSQgvgageggIgKgNIgIgMQgEgIgFgGIgJgJQgTgSgjgQQgagMgjgKQgwgPg3gKQhbgPhrAAIgnADQhogRiMgIQgJgXgJgeQLIoCLwk4QCAg2CBgvQDlhUDkg/INWAAQkMBEj7BsQlqCckyDoQh+Bfh1BrQhRBLhNBSQjrD4iuEeIghgOgEAoUADIQhGiThgh+QiijYjtieQi3h6jjhYQhngohugfICeAAQDJA5DCBJQBUAfBRAhIAFACQJND0HFFrQCWB5CHCFQg4gIg5gGIgrgFQhpgIhrAAIgrAAQhbAChhAKIgRACQgsAFgvAGIg1AJIg1AJg");
	this.shape_21.setTransform(606.2,56.9);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#CBC468").s().p("EgnVALEQCvkeDqj5QBNhRBRhLQB1hrB+hgQEzjnFpidQD7hsENhEISHAAQhmAuhjAyQg8gEg9AAQmfAAlJCvQknCejQEhQhCBcg3BnQhLCLg2CfQhxgJhygDIhsgBQiiAAgbACQhsAGg+AdIgBABIgEACQgbAZg1ASIgLAEQhnBzhjA7IgPAJQgZANgZAMIgrAGIgFABIgvAFQhSAAhogrgEginAGEIAHAKIgFgKIgBAAIgDgCIACACgAduFWQi5k8jZjRQhzhxh9hSQhEgshIgmQjHhqjXgxQCIhbCfgsIEYAAQBuAgBnAoQDjBXC3B6QDtCeCjDYQBfB+BGCTIAxCRQhDANhXASIgKACIhLARIgbAGIgwAKIi2ApIhLAQg");
	this.shape_22.setTransform(617.3,59.1);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#E2DA72").s().p("AztJkIhKgLQgJgbgIgcIgmAwQg5gHg6gGIg0gEIgGAAQA2ifBLiLQA3hnBDhdQDQkgEnieQFIivGgAAQA9AAA8AEQBjgyBlguIFpAAQieAsiIBbQDWAxDHBpQBIAmBEAtQB9BSB0BwQDZDSC4E8IAuBoIgtAJIg5ALIgFABIgGABIgcAFIgygKIgGgBQjTgthTgRQhBgMgtgTQgDjhhui4QhChvhqhgIgGgFQjYjDkcguQhXgOhcAAQiJAAh8AeQjuA6i8CsQhXBPg8BZQhrCfgYC/QgGA1AAA4QAAAxAFAvQhnARhHASQg7gLg3gIg");
	this.shape_23.setTransform(655.6,47.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20},{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10},{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Layer_5
	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#F7D47F").s().p("EhNlA0UMAAAhidIGIAAIALABQDnALCwARIAMgdMBgRAAAIgBhwIAAhTID9AAIgEDDIHWAAIgLjDIEhAAQAHgMAJABQAJAAAYAKIABgbQABgDACgDQABgBAFANQAFAOgBALIAAADIAPAGIApATIgLCkICgAAIAHh1IAAh2IAFgLQAdg6AjgdQAhgdAmAAQAnAAAfAfIADggQAAgEACgCQADgDADAAQAEAAACAEQADABAAAFIgDAnIgBAJQAKALAJAPICDAAIABAbIgEBCIE/AAIgBAQIgFCkIgBAPIC4AAIgCkcQAEgoADgpIABgdIFCAAIgLGKIErAAIgBiOQASgGAdgLIATgHIAAgDIgBgjQAAgDAEgDQACgCADAAQAEAAADACQACADAAADIABAgQAcgKALABQAcAAALBsQAJBUAAC/IAWFnQABAjgBAiIgBA7QgpANg9AOIgIADMAAABXOgEAk5gX7QgFgBgFABIACAAIAIAAIAAAAgAvd8WIAHAKIgFgKIgBAAIgDgCIACACg");
	this.shape_24.setTransform(494.7,279.4);

	this.timeline.addTween(cjs.Tween.get(this.shape_24).wait(1));

}).prototype = getMCSymbolPrototype(lib.Symbol1, new cjs.Rectangle(-2,-55.3,993.3,669.5), null);


(lib.serpicopy4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2
	this.bamboo = new lib.uuu();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(12.4,-108.2);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({y:-112.2},3).to({y:-112.6},3).to({y:-112.2},3).to({y:-111.3},2).wait(1));

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape.setTransform(214,18.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_1.setTransform(205.8,18.6);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_2.setTransform(206.8,17.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383A35").s().p("AgPA1QgIgHAAgKIAAhIQAAgJAIgHQAGgHAJAAQAKAAAHAHQAHAHAAAJIAABIQAAAKgHAHQgHAHgKAAQgJAAgGgHg");
	this.shape_3.setTransform(233.2,16.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_4.setTransform(227.8,14.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#77A63B").s().p("AkdCvIgOgDQABgWALgoQARhDAcg5QBWirCQAAQCQAABjCiQAsBJAaBXIgFAAQjtAxijAAQhzAAhCgLg");
	this.shape_5.setTransform(212.6,27.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_6.setTransform(247.3,42.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#4F7222").s().p("AgbAZQgGgCgEgFIgEgHQgFgFgBgGQABgGAFgFQAEgEAGAAQAHAAAFAEQAEAFAGAIQADAGgBAGQgCAGgGAEQgEACgEAAIgEgBgAAVANQgFgFAAgHIAAgKQAAgHAFgEQAEgFAHAAQAGAAAFAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgGAAQgHAAgEgEg");
	this.shape_7.setTransform(220.1,23.8,1,1,0,0,0,-14,-13.6);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E0DE39").s().p("AGoCbIgYAAIgCAAIgPAAIgCAAIgKgBIgMAAIgTgCIAGgqIAEgkIAAgBQAPhiAVg8IARABIAEAAIADAAIAKABIALAAIACAAIAQAAIAYgBQgPBGgHBQQgDAagBAdIgBAiIgWAAgAGZA9IACAAIgCAAgAneCKIgBgVIgCgkQAAhXARg0IAOgdIAOgBIAPgCIAEgBIAMgBIAQgCIANgBIgFASQgKAtAAA8QAAAWADAsIABACIAAACIAAAMIAEAlIgHAAIgCAAIgYACIgcABIggACIgCgOgAs6B3IABgEIgEgCQgWgJgUgMIALgiQAph0Ayg2IACAAIACABIAjAHIAkAGQg0AygpBhQgJAUgHAWIgKAfIgNgDgAA4BmIgjgDIgPgBIgCgBIgPAAIgFAAIgHg5IgHgjQgQhRgZg/IApgBIAFAAIASgBIAWABIACAAIAWABQAHAdAFAqQAIAzADAyIAAALIADA7IgJgBgAhjBmIADAAIgDABgALkASIgMgVQgkg/gKgrIgCgNIAEgCIALgEIAcgLQABgBAFgCIAPgHIAAABIALgGQAaBAAeA2QAUAjAWAdIATAZIgDABIgJAGIgSAMIgBAAIAAABIgBAAIgKAFIgLAGIgDACIgTAKQgfghgagtgAqtg8IABAAIgCABg");
	this.shape_8.setTransform(96.8,61.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_9.setTransform(106.1,51.8);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgBBSQgNAAgJgKQgJgKABgNQACgxgBgxQgBgNAKgKQAJgJAMgBQANAAAKAKQAJAJAAANQABAygCA0QAAANgKAJQgJAJgMAAIgBgBg");
	this.shape_10.setTransform(206.6,14);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#4F7222").s().p("AhSCKQhHg7gChdQgBhEAgg1IACgDIAOgUIAJgGQAdgUAogBQA7gBAzAtQAyAsAWBaQADAKAAAMIABALQABBAgfAtQgiAxg7ACIgDAAQg2AAg6gwgAgZicQgKAAgJAEQggALgVAxIgKAdIgEARIAAABIAAAMQABBLAoAvQAmAsAxgBQAkgBAagRQAQgLAMgRQAJgNAGgQQAKgagBgfQgBgrgRghQgMgXgTgSQgsgng8AAIgDAAg");
	this.shape_11.setTransform(198.4,14);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#F5F5F5").s().p("AhPBlQgogvgChLIABgMIAAgBIAEgRIAJgdQAVgwAggMQAJgDAKAAQA+gCAtAoQATASAMAXQASAhABAsQABAfgLAaQgGAPgJANQgMARgQALQgZARgkABIgDABQgwAAgkgsg");
	this.shape_12.setTransform(199.3,12.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgHgHAAgKIgChIQAAgKAHgHQAHgHAKAAQAIAAAIAHQAHAGAAAKIABBIQABAKgHAHQgHAHgKAAIgBAAQgIAAgHgGg");
	this.shape_13.setTransform(225.8,11.4);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AAEB9Qg7gKgVhPQgMgrAGgpQACgOAEgMQAIgVALgMIAFgEQATgSAWAFQA1AOAaA1QAaA1gOA5QgJAmgOARQgQASgZAAIgMgBg");
	this.shape_14.setTransform(220.2,9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkcCzIgPgCQACgWAJgoQAPhEAcg5QBRiuCRgCQCQgEBmChQAuBIAbBWIgEABQjsA1ijAEIglAAQhZAAg3gIg");
	this.shape_15.setTransform(205.6,22.9);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgQAxQgdgBgUglQgOgXgMgGQgGgCgDgGQgDgGADgGQACgGAGgDQAGgDAGACQAWAHAVAmQAKARANADIAKgFIAAAAIAHgEIAAAAQAWgIAMgIIABgEIALgYQADgGAGgCQAGgDAGADQAGADACAGQADAGgDAGIgKAXIAaAPQAGAEACAHQABAGgEAGQgDAFgGACQgHABgFgEIgfgTIgfAPIAAgBIgHAEIgBABQgSAIgFAAIgBgBg");
	this.shape_16.setTransform(233,34.6,1,1,0,0,0,-7.1,-2.8);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgGgCgDgFIgFgHQgGgFAAgHQAAgFAFgFQAEgFAHAAQAHAAAEAFQAFAEAGAIQADAGgBAHQgCAGgGADQgEADgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQgBgHAFgFQAFgEAGgBQAHAAAFAFQAEAEABAHIAAAKQAAAHgEAFQgFAEgHAAIgBAAQgGAAgEgEg");
	this.shape_17.setTransform(192.3,37.9,1,1,0,0,0,-34.7,5.7);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AEfCkIgJgEIAkh8IAIgbIAVhMIARAIQAbAMAeADIgIAsIgQBlIgNBZQgwgIgtgSgAnaC+IgBgWQAAhFAFg4QAEgoAIghIAEgRQAlgBAkgJQgDAxAAA3IAAAOQAABCAGA5QgqAGgqAAIgMAAgAL3BSIgHgFQgegXgegmQgug5gWg8IAAgBIAEgDIAKgHIAGgFIAkgeIABACIAPAZIAFAKQAVAfAdAhQAfAmAfAbIAAABIAHAGIADADIgSAPIgjAdIgLAKgAsfAvIgTgaIgDgGQA2hhAug2QAOANAJAEQATANAUALIgSAXIgMASQgiAzgdA5IgOAbQgRgQgQgSgAhJhKIgShjQAxgOAtgCIAJBKQALBYAHBLIgGAAQgiAAgnAMQgKg9gOhJg");
	this.shape_18.setTransform(95.7,59.9);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFgEPQgfAAgfgEIAOhZIAPhmIAIgsIAZABQBhgBBVg5IAAABQAWA7AuA6QAeAlAeAXIAHAGIAAABIgBAAIgPALIgYARQiABTiTAAIgCAAgArdDlIgHgDQgZgLgxgaIgVgOIgUgRIANgbQAdg6AigzIANgSIASgWQBBAeBPAMQAaAFAaAAIAHAAIABAAIgEARQgHAigEAoQgGA4AABFIABAWQhWgDhTgjgAnaCKIAAgOQAAg4ADgxIAfgIIAAAAQAogMBBgfIABAAQBUgpAjgMQARgGARgFIASBiQAOBJAKA+IgLAEIgKAEQgfAMg8AdIgBABQhQAlgyAQIgBAAQgqANgrAHQgFg4gBhCgABaC2IAAAAQgxgegbgMQgUgJgXgEQgOgCgQAAQgHhMgLhXIgJhKIAVgBQBPAABJAfIAAAAQAmAPBFArQAjAWAZALIgWBNIgIAbIgjB8QgngRg8gmgALbBnIgIgGIAAgBQgfgcgfgmQgdgggUgfIgGgKIgPgZIgBgDIAAgBIAPgOIAEgEIAcgcQA1g1AigmIAEgEIACgBQBKg4A4AAQASAAAOAHQAdADASASQAXAYAAAuQAAAagJAdQg8BNhUBMIgWAUQgaAZgcAZIgCgDgAuYBQIgBgCQgmhVgCg9IAAgLQAAgHACgJQACgIAIgPIAEgHIAFgHQAOgQARAAQAWAAANARIAPAZQAGAJAaAYIALAKIAGAEQgvA2g2BhIgJgMg");
	this.shape_19.setTransform(104.6,52.2);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#383A35").s().p("AgDBSQgNgBgJgJQgIgLAAgNQAEgwAAgyQABgNAJgJQAJgJANAAQANAAAJAKQAJAJAAANQgBAygDA0QgBANgKAIQgJAIgKAAIgDAAg");
	this.shape_20.setTransform(199.8,15.2);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#4F7222").s().p("AAcC7Qg4gBg5gyQhGg+ABhcQAAhEAig0IACgEQAHgKAIgJIAJgGQAdgTAoAAQA7ABAyAvQAwAsAVBcIACAVIAAALQAABBghAsQgjAwg6AAIgBAAgAgoiZQggAKgWAxIgLAdIgEAQIgBABIAAAMQgBBLAnAxQAkAsAyABQAkAAAZgRQARgKAMgRQAKgNAGgPQALgaAAgfQABgrgRgiQgMgXgSgSQgrgqg+AAQgKAAgKADg");
	this.shape_21.setTransform(191.7,15);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#F5F5F5").s().p("AhSBkQgngxABhLIAAgMIABgBIAEgQIALgdQAWgxAggKQAKgDAKAAQA+ABArAqQASASAMAWQARAigBArQAAAggLAZQgGAQgKANQgMAQgRALQgZAQgkAAQgygBgkgsg");
	this.shape_22.setTransform(192.7,13.8);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#383A35").s().p("AgQA1QgHgHAAgKIABhIQAAgKAHgGQAGgHAJAAQAKAAAHAHQAHAHAAAKIgBBHQAAAKgGAHQgIAHgJAAQgJAAgHgHg");
	this.shape_23.setTransform(219.1,13.2);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#EEEEEE").s().p("AAAB9Qg7gMgShPQgLgsAHgpQADgNAEgMQAIgVAMgLIAGgFQATgRAVAGQA1APAZA2QAYA2gQA4QgKAmgPAQQgPARgXAAIgPgBg");
	this.shape_24.setTransform(213.7,10.7);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#77A63B").s().p("AhoC6QhzgBhCgMIgPgDQADgWAKgoQAShEAdg4QBWiqCQABQCQABBiCjQAsBJAZBXIgFABQjoAuihAAIgHAAg");
	this.shape_25.setTransform(198.2,23.9);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#A32B2B").s().p("ABHA3IgcgYIggAKIgIADIgBABQgVAFgEgCQgdgEgPgoIABAAQgKgZgLgHQgGgDgCgHQgCgGADgFQADgGAGgCQAHgCAGAEQAUAIAQApIgBAAQAIATANAEIAKgDIAAAAIAIgDQAXgGAMgFIACgFIAPgWQADgFAGgBQAHgCAGAEQAFADABAGQABAHgDAGIgNAUIAYAUQAGAEAAAHQAAAGgEAFQgEAGgGAAQgHAAgFgEg");
	this.shape_26.setTransform(226.1,37.8,1,1,0,0,0,-6.6,-2.3);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#4F7222").s().p("AgbAZQgHgCgDgGIgFgHQgFgFAAgFQAAgHAFgEQAFgFAGAAQAHAAAFAFQAEAEAGAJQADAFgCAHQgCAGgGAEQgDACgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQAAgHAFgFQAEgEAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgHAAQgGAAgEgFg");
	this.shape_27.setTransform(185.1,35.7,1,1,0,0,0,-34.7,1.7);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#E0DE39").s().p("AF1DHIgUgCQgsgIgogSIgDgBIADABQAIg0AKgxIADgLIAJgkIgEgCIAEABQANgzAOglIAIAEQAZAMAcADIAMACQgJAfgFAiQgKBGgBBtgAmqDFIgCgKQgEgvgCgjIAAgWQAAg1AIgxIAGgfQAegCAggIIAMgDIAAAYQAAA9AJAyQAFAfAJAkIAMApIgtAKQgdAFgdABIgFABIgHAAgAKXAlIgTgdQghgzgWgnIgLgXIACgCIABAAIAMgLQAPgMAPgPIAKgJIACgDIABgBIAOAYQAVAlAdAjQASAWAVAVQAOAPAZAQIgDADIg1A2IgGAIIgDACIgGAFIgBABIAAABQgZgXgSgagAruAwQgGgIgMgTIgJgPIAGgHIANgYQAqhDAwgpIANAJQASANATALIgRAYIgMATQgeAzgbA5IgBACIgBACIgFAMIgHARQgRgRgPgTgAgzgWIAAgBQgSh0gJgtQAogLAmgCIAUgBIAWABIAAAsIgBBxIgCBQIAAAKIgOgBIgFAAQgcAAggAKIgLhRg");
	this.shape_28.setTransform(95,59.5);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#77A63B").s().p("AEkELIgOgCQABhuALhFQAEgjAJggIAMAAQBZAABOg6IAMAXQAWAmAhAzIATAeQASAaAYAWIgOAMQiCBoiXAAIgXAAgAoSEGIgMAAQhQgChNglIgBAAIgHgCQgWgMgugbIgUgPQgJgHgIgJIgCgBIAIgRIAEgMIACgCIABgDQAag5AegzIAMgSIARgZQA9AiBKAKQAYAGAZAAIAGAAIABAAIAHAAIgFAeQgIAzAAA1IAAAWQABAiAEAvIACAKIgIAAgAmjDNQgJgkgFgfQgJgyAAg+IABgZIAPgDQAngOA7gfIABgBQBPgrAhgMIAfgMIAKgDQAJAtASBzIAAAAIALBTIgJADIgKAEIgCABIgIADQgcAMg4AeIgBABQhKAngwAQIAAAAIgjAMIgMgpgACrDrIgJgDIgDgBQgUgLgZgPIgtgeQgtgggZgMIgJgFQgPgFgQgEIgPgCIAAgJIADhRIABhxIAAgrQA9ADA6AcQAjAPBBAtQAhAXAWANIAIADQgOAlgNA0IgDgBIADABIgJAlIgCALQgLAwgHA1gAKDAuQgUgVgSgWQgegjgVgkIgNgYIAEgGIACgBQA2g0A2hCIAkgVIALgFQAqgXAzAAQA0AAAcAZQAcAZAAAxIgBAWQglAkgtAuIhxBzIgQARIgJAJQgYgRgPgPgAtqBFIAAAAIgBAAQgcg7AAhFIABgLIAAgFQAAgMABgKIACgDIABgCQAmhNAogBQAjAAAJAZQADAIAAAXIACAAIgFAbIgCAOIAAABIAPAPQgwApgqBCIgOAXIgFAJIgCgDg");
	this.shape_29.setTransform(104.5,52.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).to({state:[{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20}]},3).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).wait(3));

	// Layer_4
	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_30.setTransform(101.3,74.3);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("rgba(0,0,0,0.498)").s().p("Au7ALQgQgDANgRQA4hIBrATQDkApDngPQEBgRD9gTQGVgUF6BeQAOAEgMANQkLAQkNAHQiygGizAUQi7AUi5AAQlKAAk/hBg");
	this.shape_31.setTransform(101.3,74.3);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("rgba(0,0,0,0.498)").s().p("AuMALQgPgDANgRQA1hIBlATQDZApDbgPQD1gRDxgTQGBgUFnBeQANAEgLANQj+AQj/AHQiqgGiqAUQiyAUiwAAQk6AAkvhBg");
	this.shape_32.setTransform(101.3,74.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_30}]}).to({state:[{t:this.shape_31}]},3).to({state:[{t:this.shape_32}]},3).to({state:[{t:this.shape_31}]},3).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-63,-252.7,347.2,334.6);


(lib.serpicopy2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2
	this.bamboo = new lib.ttt();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(12.4,-108.2);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({y:-112.2},3).to({y:-112.6},3).to({y:-112.2},3).to({y:-109.5},2).wait(1));

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape.setTransform(214,18.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_1.setTransform(205.8,18.6);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_2.setTransform(206.8,17.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383A35").s().p("AgPA1QgIgHAAgKIAAhIQAAgJAIgHQAGgHAJAAQAKAAAHAHQAHAHAAAJIAABIQAAAKgHAHQgHAHgKAAQgJAAgGgHg");
	this.shape_3.setTransform(233.2,16.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_4.setTransform(227.8,14.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#77A63B").s().p("AkdCvIgOgDQABgWALgoQARhDAcg5QBWirCQAAQCQAABjCiQAsBJAaBXIgFAAQjtAxijAAQhzAAhCgLg");
	this.shape_5.setTransform(212.6,27.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_6.setTransform(247.3,42.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#4F7222").s().p("AgbAZQgGgCgEgFIgEgHQgFgFgBgGQABgGAFgFQAEgEAGAAQAHAAAFAEQAEAFAGAIQADAGgBAGQgCAGgGAEQgEACgEAAIgEgBgAAVANQgFgFAAgHIAAgKQAAgHAFgEQAEgFAHAAQAGAAAFAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgGAAQgHAAgEgEg");
	this.shape_7.setTransform(220.1,23.8,1,1,0,0,0,-14,-13.6);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E0DE39").s().p("AGoCbIgYAAIgCAAIgPAAIgCAAIgKgBIgMAAIgTgCIAGgqIAEgkIAAgBQAPhiAVg8IARABIAEAAIADAAIAKABIALAAIACAAIAQAAIAYgBQgPBGgHBQQgDAagBAdIgBAiIgWAAgAGZA9IACAAIgCAAgAneCKIgBgVIgCgkQAAhXARg0IAOgdIAOgBIAPgCIAEgBIAMgBIAQgCIANgBIgFASQgKAtAAA8QAAAWADAsIABACIAAACIAAAMIAEAlIgHAAIgCAAIgYACIgcABIggACIgCgOgAs6B3IABgEIgEgCQgWgJgUgMIALgiQAph0Ayg2IACAAIACABIAjAHIAkAGQg0AygpBhQgJAUgHAWIgKAfIgNgDgAA4BmIgjgDIgPgBIgCgBIgPAAIgFAAIgHg5IgHgjQgQhRgZg/IApgBIAFAAIASgBIAWABIACAAIAWABQAHAdAFAqQAIAzADAyIAAALIADA7IgJgBgAhjBmIADAAIgDABgALkASIgMgVQgkg/gKgrIgCgNIAEgCIALgEIAcgLQABgBAFgCIAPgHIAAABIALgGQAaBAAeA2QAUAjAWAdIATAZIgDABIgJAGIgSAMIgBAAIAAABIgBAAIgKAFIgLAGIgDACIgTAKQgfghgagtgAqtg8IABAAIgCABg");
	this.shape_8.setTransform(96.8,61.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_9.setTransform(106.1,51.8);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgBBSQgNAAgJgKQgJgKABgNQACgxgBgxQgBgNAKgKQAJgJAMgBQANAAAKAKQAJAJAAANQABAygCA0QAAANgKAJQgJAJgMAAIgBgBg");
	this.shape_10.setTransform(206.6,14);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#4F7222").s().p("AhSCKQhHg7gChdQgBhEAgg1IACgDIAOgUIAJgGQAdgUAogBQA7gBAzAtQAyAsAWBaQADAKAAAMIABALQABBAgfAtQgiAxg7ACIgDAAQg2AAg6gwgAgZicQgKAAgJAEQggALgVAxIgKAdIgEARIAAABIAAAMQABBLAoAvQAmAsAxgBQAkgBAagRQAQgLAMgRQAJgNAGgQQAKgagBgfQgBgrgRghQgMgXgTgSQgsgng8AAIgDAAg");
	this.shape_11.setTransform(198.4,14);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#F5F5F5").s().p("AhPBlQgogvgChLIABgMIAAgBIAEgRIAJgdQAVgwAggMQAJgDAKAAQA+gCAtAoQATASAMAXQASAhABAsQABAfgLAaQgGAPgJANQgMARgQALQgZARgkABIgDABQgwAAgkgsg");
	this.shape_12.setTransform(199.3,12.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgHgHAAgKIgChIQAAgKAHgHQAHgHAKAAQAIAAAIAHQAHAGAAAKIABBIQABAKgHAHQgHAHgKAAIgBAAQgIAAgHgGg");
	this.shape_13.setTransform(225.8,11.4);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AAEB9Qg7gKgVhPQgMgrAGgpQACgOAEgMQAIgVALgMIAFgEQATgSAWAFQA1AOAaA1QAaA1gOA5QgJAmgOARQgQASgZAAIgMgBg");
	this.shape_14.setTransform(220.2,9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkcCzIgPgCQACgWAJgoQAPhEAcg5QBRiuCRgCQCQgEBmChQAuBIAbBWIgEABQjsA1ijAEIglAAQhZAAg3gIg");
	this.shape_15.setTransform(205.6,22.9);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgQAxQgdgBgUglQgOgXgMgGQgGgCgDgGQgDgGADgGQACgGAGgDQAGgDAGACQAWAHAVAmQAKARANADIAKgFIAAAAIAHgEIAAAAQAWgIAMgIIABgEIALgYQADgGAGgCQAGgDAGADQAGADACAGQADAGgDAGIgKAXIAaAPQAGAEACAHQABAGgEAGQgDAFgGACQgHABgFgEIgfgTIgfAPIAAgBIgHAEIgBABQgSAIgFAAIgBgBg");
	this.shape_16.setTransform(233,34.6,1,1,0,0,0,-7.1,-2.8);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgGgCgDgFIgFgHQgGgFAAgHQAAgFAFgFQAEgFAHAAQAHAAAEAFQAFAEAGAIQADAGgBAHQgCAGgGADQgEADgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQgBgHAFgFQAFgEAGgBQAHAAAFAFQAEAEABAHIAAAKQAAAHgEAFQgFAEgHAAIgBAAQgGAAgEgEg");
	this.shape_17.setTransform(192.3,37.9,1,1,0,0,0,-34.7,5.7);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AEfCkIgJgEIAkh8IAIgbIAVhMIARAIQAbAMAeADIgIAsIgQBlIgNBZQgwgIgtgSgAnaC+IgBgWQAAhFAFg4QAEgoAIghIAEgRQAlgBAkgJQgDAxAAA3IAAAOQAABCAGA5QgqAGgqAAIgMAAgAL3BSIgHgFQgegXgegmQgug5gWg8IAAgBIAEgDIAKgHIAGgFIAkgeIABACIAPAZIAFAKQAVAfAdAhQAfAmAfAbIAAABIAHAGIADADIgSAPIgjAdIgLAKgAsfAvIgTgaIgDgGQA2hhAug2QAOANAJAEQATANAUALIgSAXIgMASQgiAzgdA5IgOAbQgRgQgQgSgAhJhKIgShjQAxgOAtgCIAJBKQALBYAHBLIgGAAQgiAAgnAMQgKg9gOhJg");
	this.shape_18.setTransform(95.7,59.9);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFgEPQgfAAgfgEIAOhZIAPhmIAIgsIAZABQBhgBBVg5IAAABQAWA7AuA6QAeAlAeAXIAHAGIAAABIgBAAIgPALIgYARQiABTiTAAIgCAAgArdDlIgHgDQgZgLgxgaIgVgOIgUgRIANgbQAdg6AigzIANgSIASgWQBBAeBPAMQAaAFAaAAIAHAAIABAAIgEARQgHAigEAoQgGA4AABFIABAWQhWgDhTgjgAnaCKIAAgOQAAg4ADgxIAfgIIAAAAQAogMBBgfIABAAQBUgpAjgMQARgGARgFIASBiQAOBJAKA+IgLAEIgKAEQgfAMg8AdIgBABQhQAlgyAQIgBAAQgqANgrAHQgFg4gBhCgABaC2IAAAAQgxgegbgMQgUgJgXgEQgOgCgQAAQgHhMgLhXIgJhKIAVgBQBPAABJAfIAAAAQAmAPBFArQAjAWAZALIgWBNIgIAbIgjB8QgngRg8gmgALbBnIgIgGIAAgBQgfgcgfgmQgdgggUgfIgGgKIgPgZIgBgDIAAgBIAPgOIAEgEIAcgcQA1g1AigmIAEgEIACgBQBKg4A4AAQASAAAOAHQAdADASASQAXAYAAAuQAAAagJAdQg8BNhUBMIgWAUQgaAZgcAZIgCgDgAuYBQIgBgCQgmhVgCg9IAAgLQAAgHACgJQACgIAIgPIAEgHIAFgHQAOgQARAAQAWAAANARIAPAZQAGAJAaAYIALAKIAGAEQgvA2g2BhIgJgMg");
	this.shape_19.setTransform(104.6,52.2);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#383A35").s().p("AgDBSQgNgBgJgJQgIgLAAgNQAEgwAAgyQABgNAJgJQAJgJANAAQANAAAJAKQAJAJAAANQgBAygDA0QgBANgKAIQgJAIgKAAIgDAAg");
	this.shape_20.setTransform(199.8,15.2);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#4F7222").s().p("AAcC7Qg4gBg5gyQhGg+ABhcQAAhEAig0IACgEQAHgKAIgJIAJgGQAdgTAoAAQA7ABAyAvQAwAsAVBcIACAVIAAALQAABBghAsQgjAwg6AAIgBAAgAgoiZQggAKgWAxIgLAdIgEAQIgBABIAAAMQgBBLAnAxQAkAsAyABQAkAAAZgRQARgKAMgRQAKgNAGgPQALgaAAgfQABgrgRgiQgMgXgSgSQgrgqg+AAQgKAAgKADg");
	this.shape_21.setTransform(191.7,15);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#F5F5F5").s().p("AhSBkQgngxABhLIAAgMIABgBIAEgQIALgdQAWgxAggKQAKgDAKAAQA+ABArAqQASASAMAWQARAigBArQAAAggLAZQgGAQgKANQgMAQgRALQgZAQgkAAQgygBgkgsg");
	this.shape_22.setTransform(192.7,13.8);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#383A35").s().p("AgQA1QgHgHAAgKIABhIQAAgKAHgGQAGgHAJAAQAKAAAHAHQAHAHAAAKIgBBHQAAAKgGAHQgIAHgJAAQgJAAgHgHg");
	this.shape_23.setTransform(219.1,13.2);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#EEEEEE").s().p("AAAB9Qg7gMgShPQgLgsAHgpQADgNAEgMQAIgVAMgLIAGgFQATgRAVAGQA1APAZA2QAYA2gQA4QgKAmgPAQQgPARgXAAIgPgBg");
	this.shape_24.setTransform(213.7,10.7);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#77A63B").s().p("AhoC6QhzgBhCgMIgPgDQADgWAKgoQAShEAdg4QBWiqCQABQCQABBiCjQAsBJAZBXIgFABQjoAuihAAIgHAAg");
	this.shape_25.setTransform(198.2,23.9);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#A32B2B").s().p("ABHA3IgcgYIggAKIgIADIgBABQgVAFgEgCQgdgEgPgoIABAAQgKgZgLgHQgGgDgCgHQgCgGADgFQADgGAGgCQAHgCAGAEQAUAIAQApIgBAAQAIATANAEIAKgDIAAAAIAIgDQAXgGAMgFIACgFIAPgWQADgFAGgBQAHgCAGAEQAFADABAGQABAHgDAGIgNAUIAYAUQAGAEAAAHQAAAGgEAFQgEAGgGAAQgHAAgFgEg");
	this.shape_26.setTransform(226.1,37.8,1,1,0,0,0,-6.6,-2.3);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#4F7222").s().p("AgbAZQgHgCgDgGIgFgHQgFgFAAgFQAAgHAFgEQAFgFAGAAQAHAAAFAFQAEAEAGAJQADAFgCAHQgCAGgGAEQgDACgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQAAgHAFgFQAEgEAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgHAAQgGAAgEgFg");
	this.shape_27.setTransform(185.1,35.7,1,1,0,0,0,-34.7,1.7);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#E0DE39").s().p("AF1DHIgUgCQgsgIgogSIgDgBIADABQAIg0AKgxIADgLIAJgkIgEgCIAEABQANgzAOglIAIAEQAZAMAcADIAMACQgJAfgFAiQgKBGgBBtgAmqDFIgCgKQgEgvgCgjIAAgWQAAg1AIgxIAGgfQAegCAggIIAMgDIAAAYQAAA9AJAyQAFAfAJAkIAMApIgtAKQgdAFgdABIgFABIgHAAgAKXAlIgTgdQghgzgWgnIgLgXIACgCIABAAIAMgLQAPgMAPgPIAKgJIACgDIABgBIAOAYQAVAlAdAjQASAWAVAVQAOAPAZAQIgDADIg1A2IgGAIIgDACIgGAFIgBABIAAABQgZgXgSgagAruAwQgGgIgMgTIgJgPIAGgHIANgYQAqhDAwgpIANAJQASANATALIgRAYIgMATQgeAzgbA5IgBACIgBACIgFAMIgHARQgRgRgPgTgAgzgWIAAgBQgSh0gJgtQAogLAmgCIAUgBIAWABIAAAsIgBBxIgCBQIAAAKIgOgBIgFAAQgcAAggAKIgLhRg");
	this.shape_28.setTransform(95,59.5);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#77A63B").s().p("AEkELIgOgCQABhuALhFQAEgjAJggIAMAAQBZAABOg6IAMAXQAWAmAhAzIATAeQASAaAYAWIgOAMQiCBoiXAAIgXAAgAoSEGIgMAAQhQgChNglIgBAAIgHgCQgWgMgugbIgUgPQgJgHgIgJIgCgBIAIgRIAEgMIACgCIABgDQAag5AegzIAMgSIARgZQA9AiBKAKQAYAGAZAAIAGAAIABAAIAHAAIgFAeQgIAzAAA1IAAAWQABAiAEAvIACAKIgIAAgAmjDNQgJgkgFgfQgJgyAAg+IABgZIAPgDQAngOA7gfIABgBQBPgrAhgMIAfgMIAKgDQAJAtASBzIAAAAIALBTIgJADIgKAEIgCABIgIADQgcAMg4AeIgBABQhKAngwAQIAAAAIgjAMIgMgpgACrDrIgJgDIgDgBQgUgLgZgPIgtgeQgtgggZgMIgJgFQgPgFgQgEIgPgCIAAgJIADhRIABhxIAAgrQA9ADA6AcQAjAPBBAtQAhAXAWANIAIADQgOAlgNA0IgDgBIADABIgJAlIgCALQgLAwgHA1gAKDAuQgUgVgSgWQgegjgVgkIgNgYIAEgGIACgBQA2g0A2hCIAkgVIALgFQAqgXAzAAQA0AAAcAZQAcAZAAAxIgBAWQglAkgtAuIhxBzIgQARIgJAJQgYgRgPgPgAtqBFIAAAAIgBAAQgcg7AAhFIABgLIAAgFQAAgMABgKIACgDIABgCQAmhNAogBQAjAAAJAZQADAIAAAXIACAAIgFAbIgCAOIAAABIAPAPQgwApgqBCIgOAXIgFAJIgCgDg");
	this.shape_29.setTransform(104.5,52.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).to({state:[{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20}]},3).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).wait(3));

	// Layer_4
	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_30.setTransform(101.3,74.3);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("rgba(0,0,0,0.498)").s().p("Au7ALQgQgDANgRQA4hIBrATQDkApDngPQEBgRD9gTQGVgUF6BeQAOAEgMANQkLAQkNAHQiygGizAUQi7AUi5AAQlKAAk/hBg");
	this.shape_31.setTransform(101.3,74.3);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("rgba(0,0,0,0.498)").s().p("AuMALQgPgDANgRQA1hIBlATQDZApDbgPQD1gRDxgTQGBgUFnBeQANAEgLANQj+AQj/AHQiqgGiqAUQiyAUiwAAQk6AAkvhBg");
	this.shape_32.setTransform(101.3,74.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_30}]}).to({state:[{t:this.shape_31}]},3).to({state:[{t:this.shape_32}]},3).to({state:[{t:this.shape_31}]},3).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1.6,-72.7,259.3,154.6);


(lib.serpicopy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2
	this.bamboo = new lib.sss();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(12.4,-108.2);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({y:-112.2},3).to({y:-112.6},3).to({y:-112.2},3).to({y:-111.3},2).wait(1));

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape.setTransform(214,18.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_1.setTransform(205.8,18.6);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_2.setTransform(206.8,17.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383A35").s().p("AgPA1QgIgHAAgKIAAhIQAAgJAIgHQAGgHAJAAQAKAAAHAHQAHAHAAAJIAABIQAAAKgHAHQgHAHgKAAQgJAAgGgHg");
	this.shape_3.setTransform(233.2,16.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_4.setTransform(227.8,14.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#77A63B").s().p("AkdCvIgOgDQABgWALgoQARhDAcg5QBWirCQAAQCQAABjCiQAsBJAaBXIgFAAQjtAxijAAQhzAAhCgLg");
	this.shape_5.setTransform(212.6,27.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_6.setTransform(247.3,42.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#4F7222").s().p("AgbAZQgGgCgEgFIgEgHQgFgFgBgGQABgGAFgFQAEgEAGAAQAHAAAFAEQAEAFAGAIQADAGgBAGQgCAGgGAEQgEACgEAAIgEgBgAAVANQgFgFAAgHIAAgKQAAgHAFgEQAEgFAHAAQAGAAAFAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgGAAQgHAAgEgEg");
	this.shape_7.setTransform(220.1,23.8,1,1,0,0,0,-14,-13.6);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E0DE39").s().p("AGoCbIgYAAIgCAAIgPAAIgCAAIgKgBIgMAAIgTgCIAGgqIAEgkIAAgBQAPhiAVg8IARABIAEAAIADAAIAKABIALAAIACAAIAQAAIAYgBQgPBGgHBQQgDAagBAdIgBAiIgWAAgAGZA9IACAAIgCAAgAneCKIgBgVIgCgkQAAhXARg0IAOgdIAOgBIAPgCIAEgBIAMgBIAQgCIANgBIgFASQgKAtAAA8QAAAWADAsIABACIAAACIAAAMIAEAlIgHAAIgCAAIgYACIgcABIggACIgCgOgAs6B3IABgEIgEgCQgWgJgUgMIALgiQAph0Ayg2IACAAIACABIAjAHIAkAGQg0AygpBhQgJAUgHAWIgKAfIgNgDgAA4BmIgjgDIgPgBIgCgBIgPAAIgFAAIgHg5IgHgjQgQhRgZg/IApgBIAFAAIASgBIAWABIACAAIAWABQAHAdAFAqQAIAzADAyIAAALIADA7IgJgBgAhjBmIADAAIgDABgALkASIgMgVQgkg/gKgrIgCgNIAEgCIALgEIAcgLQABgBAFgCIAPgHIAAABIALgGQAaBAAeA2QAUAjAWAdIATAZIgDABIgJAGIgSAMIgBAAIAAABIgBAAIgKAFIgLAGIgDACIgTAKQgfghgagtgAqtg8IABAAIgCABg");
	this.shape_8.setTransform(96.8,61.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_9.setTransform(106.1,51.8);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgBBSQgNAAgJgKQgJgKABgNQACgxgBgxQgBgNAKgKQAJgJAMgBQANAAAKAKQAJAJAAANQABAygCA0QAAANgKAJQgJAJgMAAIgBgBg");
	this.shape_10.setTransform(206.6,14);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#4F7222").s().p("AhSCKQhHg7gChdQgBhEAgg1IACgDIAOgUIAJgGQAdgUAogBQA7gBAzAtQAyAsAWBaQADAKAAAMIABALQABBAgfAtQgiAxg7ACIgDAAQg2AAg6gwgAgZicQgKAAgJAEQggALgVAxIgKAdIgEARIAAABIAAAMQABBLAoAvQAmAsAxgBQAkgBAagRQAQgLAMgRQAJgNAGgQQAKgagBgfQgBgrgRghQgMgXgTgSQgsgng8AAIgDAAg");
	this.shape_11.setTransform(198.4,14);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#F5F5F5").s().p("AhPBlQgogvgChLIABgMIAAgBIAEgRIAJgdQAVgwAggMQAJgDAKAAQA+gCAtAoQATASAMAXQASAhABAsQABAfgLAaQgGAPgJANQgMARgQALQgZARgkABIgDABQgwAAgkgsg");
	this.shape_12.setTransform(199.3,12.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgHgHAAgKIgChIQAAgKAHgHQAHgHAKAAQAIAAAIAHQAHAGAAAKIABBIQABAKgHAHQgHAHgKAAIgBAAQgIAAgHgGg");
	this.shape_13.setTransform(225.8,11.4);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AAEB9Qg7gKgVhPQgMgrAGgpQACgOAEgMQAIgVALgMIAFgEQATgSAWAFQA1AOAaA1QAaA1gOA5QgJAmgOARQgQASgZAAIgMgBg");
	this.shape_14.setTransform(220.2,9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkcCzIgPgCQACgWAJgoQAPhEAcg5QBRiuCRgCQCQgEBmChQAuBIAbBWIgEABQjsA1ijAEIglAAQhZAAg3gIg");
	this.shape_15.setTransform(205.6,22.9);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgQAxQgdgBgUglQgOgXgMgGQgGgCgDgGQgDgGADgGQACgGAGgDQAGgDAGACQAWAHAVAmQAKARANADIAKgFIAAAAIAHgEIAAAAQAWgIAMgIIABgEIALgYQADgGAGgCQAGgDAGADQAGADACAGQADAGgDAGIgKAXIAaAPQAGAEACAHQABAGgEAGQgDAFgGACQgHABgFgEIgfgTIgfAPIAAgBIgHAEIgBABQgSAIgFAAIgBgBg");
	this.shape_16.setTransform(233,34.6,1,1,0,0,0,-7.1,-2.8);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgGgCgDgFIgFgHQgGgFAAgHQAAgFAFgFQAEgFAHAAQAHAAAEAFQAFAEAGAIQADAGgBAHQgCAGgGADQgEADgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQgBgHAFgFQAFgEAGgBQAHAAAFAFQAEAEABAHIAAAKQAAAHgEAFQgFAEgHAAIgBAAQgGAAgEgEg");
	this.shape_17.setTransform(192.3,37.9,1,1,0,0,0,-34.7,5.7);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AEfCkIgJgEIAkh8IAIgbIAVhMIARAIQAbAMAeADIgIAsIgQBlIgNBZQgwgIgtgSgAnaC+IgBgWQAAhFAFg4QAEgoAIghIAEgRQAlgBAkgJQgDAxAAA3IAAAOQAABCAGA5QgqAGgqAAIgMAAgAL3BSIgHgFQgegXgegmQgug5gWg8IAAgBIAEgDIAKgHIAGgFIAkgeIABACIAPAZIAFAKQAVAfAdAhQAfAmAfAbIAAABIAHAGIADADIgSAPIgjAdIgLAKgAsfAvIgTgaIgDgGQA2hhAug2QAOANAJAEQATANAUALIgSAXIgMASQgiAzgdA5IgOAbQgRgQgQgSgAhJhKIgShjQAxgOAtgCIAJBKQALBYAHBLIgGAAQgiAAgnAMQgKg9gOhJg");
	this.shape_18.setTransform(95.7,59.9);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFgEPQgfAAgfgEIAOhZIAPhmIAIgsIAZABQBhgBBVg5IAAABQAWA7AuA6QAeAlAeAXIAHAGIAAABIgBAAIgPALIgYARQiABTiTAAIgCAAgArdDlIgHgDQgZgLgxgaIgVgOIgUgRIANgbQAdg6AigzIANgSIASgWQBBAeBPAMQAaAFAaAAIAHAAIABAAIgEARQgHAigEAoQgGA4AABFIABAWQhWgDhTgjgAnaCKIAAgOQAAg4ADgxIAfgIIAAAAQAogMBBgfIABAAQBUgpAjgMQARgGARgFIASBiQAOBJAKA+IgLAEIgKAEQgfAMg8AdIgBABQhQAlgyAQIgBAAQgqANgrAHQgFg4gBhCgABaC2IAAAAQgxgegbgMQgUgJgXgEQgOgCgQAAQgHhMgLhXIgJhKIAVgBQBPAABJAfIAAAAQAmAPBFArQAjAWAZALIgWBNIgIAbIgjB8QgngRg8gmgALbBnIgIgGIAAgBQgfgcgfgmQgdgggUgfIgGgKIgPgZIgBgDIAAgBIAPgOIAEgEIAcgcQA1g1AigmIAEgEIACgBQBKg4A4AAQASAAAOAHQAdADASASQAXAYAAAuQAAAagJAdQg8BNhUBMIgWAUQgaAZgcAZIgCgDgAuYBQIgBgCQgmhVgCg9IAAgLQAAgHACgJQACgIAIgPIAEgHIAFgHQAOgQARAAQAWAAANARIAPAZQAGAJAaAYIALAKIAGAEQgvA2g2BhIgJgMg");
	this.shape_19.setTransform(104.6,52.2);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#383A35").s().p("AgDBSQgNgBgJgJQgIgLAAgNQAEgwAAgyQABgNAJgJQAJgJANAAQANAAAJAKQAJAJAAANQgBAygDA0QgBANgKAIQgJAIgKAAIgDAAg");
	this.shape_20.setTransform(199.8,15.2);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#4F7222").s().p("AAcC7Qg4gBg5gyQhGg+ABhcQAAhEAig0IACgEQAHgKAIgJIAJgGQAdgTAoAAQA7ABAyAvQAwAsAVBcIACAVIAAALQAABBghAsQgjAwg6AAIgBAAgAgoiZQggAKgWAxIgLAdIgEAQIgBABIAAAMQgBBLAnAxQAkAsAyABQAkAAAZgRQARgKAMgRQAKgNAGgPQALgaAAgfQABgrgRgiQgMgXgSgSQgrgqg+AAQgKAAgKADg");
	this.shape_21.setTransform(191.7,15);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#F5F5F5").s().p("AhSBkQgngxABhLIAAgMIABgBIAEgQIALgdQAWgxAggKQAKgDAKAAQA+ABArAqQASASAMAWQARAigBArQAAAggLAZQgGAQgKANQgMAQgRALQgZAQgkAAQgygBgkgsg");
	this.shape_22.setTransform(192.7,13.8);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#383A35").s().p("AgQA1QgHgHAAgKIABhIQAAgKAHgGQAGgHAJAAQAKAAAHAHQAHAHAAAKIgBBHQAAAKgGAHQgIAHgJAAQgJAAgHgHg");
	this.shape_23.setTransform(219.1,13.2);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#EEEEEE").s().p("AAAB9Qg7gMgShPQgLgsAHgpQADgNAEgMQAIgVAMgLIAGgFQATgRAVAGQA1APAZA2QAYA2gQA4QgKAmgPAQQgPARgXAAIgPgBg");
	this.shape_24.setTransform(213.7,10.7);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#77A63B").s().p("AhoC6QhzgBhCgMIgPgDQADgWAKgoQAShEAdg4QBWiqCQABQCQABBiCjQAsBJAZBXIgFABQjoAuihAAIgHAAg");
	this.shape_25.setTransform(198.2,23.9);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#A32B2B").s().p("ABHA3IgcgYIggAKIgIADIgBABQgVAFgEgCQgdgEgPgoIABAAQgKgZgLgHQgGgDgCgHQgCgGADgFQADgGAGgCQAHgCAGAEQAUAIAQApIgBAAQAIATANAEIAKgDIAAAAIAIgDQAXgGAMgFIACgFIAPgWQADgFAGgBQAHgCAGAEQAFADABAGQABAHgDAGIgNAUIAYAUQAGAEAAAHQAAAGgEAFQgEAGgGAAQgHAAgFgEg");
	this.shape_26.setTransform(226.1,37.8,1,1,0,0,0,-6.6,-2.3);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#4F7222").s().p("AgbAZQgHgCgDgGIgFgHQgFgFAAgFQAAgHAFgEQAFgFAGAAQAHAAAFAFQAEAEAGAJQADAFgCAHQgCAGgGAEQgDACgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQAAgHAFgFQAEgEAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgHAAQgGAAgEgFg");
	this.shape_27.setTransform(185.1,35.7,1,1,0,0,0,-34.7,1.7);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#E0DE39").s().p("AF1DHIgUgCQgsgIgogSIgDgBIADABQAIg0AKgxIADgLIAJgkIgEgCIAEABQANgzAOglIAIAEQAZAMAcADIAMACQgJAfgFAiQgKBGgBBtgAmqDFIgCgKQgEgvgCgjIAAgWQAAg1AIgxIAGgfQAegCAggIIAMgDIAAAYQAAA9AJAyQAFAfAJAkIAMApIgtAKQgdAFgdABIgFABIgHAAgAKXAlIgTgdQghgzgWgnIgLgXIACgCIABAAIAMgLQAPgMAPgPIAKgJIACgDIABgBIAOAYQAVAlAdAjQASAWAVAVQAOAPAZAQIgDADIg1A2IgGAIIgDACIgGAFIgBABIAAABQgZgXgSgagAruAwQgGgIgMgTIgJgPIAGgHIANgYQAqhDAwgpIANAJQASANATALIgRAYIgMATQgeAzgbA5IgBACIgBACIgFAMIgHARQgRgRgPgTgAgzgWIAAgBQgSh0gJgtQAogLAmgCIAUgBIAWABIAAAsIgBBxIgCBQIAAAKIgOgBIgFAAQgcAAggAKIgLhRg");
	this.shape_28.setTransform(95,59.5);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#77A63B").s().p("AEkELIgOgCQABhuALhFQAEgjAJggIAMAAQBZAABOg6IAMAXQAWAmAhAzIATAeQASAaAYAWIgOAMQiCBoiXAAIgXAAgAoSEGIgMAAQhQgChNglIgBAAIgHgCQgWgMgugbIgUgPQgJgHgIgJIgCgBIAIgRIAEgMIACgCIABgDQAag5AegzIAMgSIARgZQA9AiBKAKQAYAGAZAAIAGAAIABAAIAHAAIgFAeQgIAzAAA1IAAAWQABAiAEAvIACAKIgIAAgAmjDNQgJgkgFgfQgJgyAAg+IABgZIAPgDQAngOA7gfIABgBQBPgrAhgMIAfgMIAKgDQAJAtASBzIAAAAIALBTIgJADIgKAEIgCABIgIADQgcAMg4AeIgBABQhKAngwAQIAAAAIgjAMIgMgpgACrDrIgJgDIgDgBQgUgLgZgPIgtgeQgtgggZgMIgJgFQgPgFgQgEIgPgCIAAgJIADhRIABhxIAAgrQA9ADA6AcQAjAPBBAtQAhAXAWANIAIADQgOAlgNA0IgDgBIADABIgJAlIgCALQgLAwgHA1gAKDAuQgUgVgSgWQgegjgVgkIgNgYIAEgGIACgBQA2g0A2hCIAkgVIALgFQAqgXAzAAQA0AAAcAZQAcAZAAAxIgBAWQglAkgtAuIhxBzIgQARIgJAJQgYgRgPgPgAtqBFIAAAAIgBAAQgcg7AAhFIABgLIAAgFQAAgMABgKIACgDIABgCQAmhNAogBQAjAAAJAZQADAIAAAXIACAAIgFAbIgCAOIAAABIAPAPQgwApgqBCIgOAXIgFAJIgCgDg");
	this.shape_29.setTransform(104.5,52.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).to({state:[{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20}]},3).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).wait(3));

	// Layer_4
	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_30.setTransform(101.3,74.3);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("rgba(0,0,0,0.498)").s().p("Au7ALQgQgDANgRQA4hIBrATQDkApDngPQEBgRD9gTQGVgUF6BeQAOAEgMANQkLAQkNAHQiygGizAUQi7AUi5AAQlKAAk/hBg");
	this.shape_31.setTransform(101.3,74.3);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("rgba(0,0,0,0.498)").s().p("AuMALQgPgDANgRQA1hIBlATQDZApDbgPQD1gRDxgTQGBgUFnBeQANAEgLANQj+AQj/AHQiqgGiqAUQiyAUiwAAQk6AAkvhBg");
	this.shape_32.setTransform(101.3,74.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_30}]}).to({state:[{t:this.shape_31}]},3).to({state:[{t:this.shape_32}]},3).to({state:[{t:this.shape_31}]},3).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-63,-72.7,347.2,154.6);


(lib.serpi = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_2
	this.bamboo = new lib.rrr();
	this.bamboo.name = "bamboo";
	this.bamboo.parent = this;
	this.bamboo.setTransform(12.4,-108.2);

	this.timeline.addTween(cjs.Tween.get(this.bamboo).to({y:-112.2},3).to({y:-112.6},3).to({y:-112.2},3).to({y:-109.5},2).wait(1));

	// Layer_3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape.setTransform(214,18.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_1.setTransform(206.8,17.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_2.setTransform(205.8,18.6);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#383A35").s().p("AgPA1QgIgHAAgKIAAhIQAAgJAIgHQAGgHAJAAQAKAAAHAHQAHAHAAAJIAABIQAAAKgHAHQgHAHgKAAQgJAAgGgHg");
	this.shape_3.setTransform(233.2,16.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_4.setTransform(227.8,14.1);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#77A63B").s().p("AkdCvIgOgDQABgWALgoQARhDAcg5QBWirCQAAQCQAABjCiQAsBJAaBXIgFAAQjtAxijAAQhzAAhCgLg");
	this.shape_5.setTransform(212.6,27.5);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_6.setTransform(247.3,42.3);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#4F7222").s().p("AgbAZQgGgCgEgFIgEgHQgFgFgBgGQABgGAFgFQAEgEAGAAQAHAAAFAEQAEAFAGAIQADAGgBAGQgCAGgGAEQgEACgEAAIgEgBgAAVANQgFgFAAgHIAAgKQAAgHAFgEQAEgFAHAAQAGAAAFAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgGAAQgHAAgEgEg");
	this.shape_7.setTransform(220.1,23.8,1,1,0,0,0,-14,-13.6);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#E0DE39").s().p("AGoCbIgYAAIgCAAIgPAAIgCAAIgKgBIgMAAIgTgCIAGgqIAEgkIAAgBQAPhiAVg8IARABIAEAAIADAAIAKABIALAAIACAAIAQAAIAYgBQgPBGgHBQQgDAagBAdIgBAiIgWAAgAGZA9IACAAIgCAAgAneCKIgBgVIgCgkQAAhXARg0IAOgdIAOgBIAPgCIAEgBIAMgBIAQgCIANgBIgFASQgKAtAAA8QAAAWADAsIABACIAAACIAAAMIAEAlIgHAAIgCAAIgYACIgcABIggACIgCgOgAs6B3IABgEIgEgCQgWgJgUgMIALgiQAph0Ayg2IACAAIACABIAjAHIAkAGQg0AygpBhQgJAUgHAWIgKAfIgNgDgAA4BmIgjgDIgPgBIgCgBIgPAAIgFAAIgHg5IgHgjQgQhRgZg/IApgBIAFAAIASgBIAWABIACAAIAWABQAHAdAFAqQAIAzADAyIAAALIADA7IgJgBgAhjBmIADAAIgDABgALkASIgMgVQgkg/gKgrIgCgNIAEgCIALgEIAcgLQABgBAFgCIAPgHIAAABIALgGQAaBAAeA2QAUAjAWAdIATAZIgDABIgJAGIgSAMIgBAAIAAABIgBAAIgKAFIgLAGIgDACIgTAKQgfghgagtgAqtg8IABAAIgCABg");
	this.shape_8.setTransform(96.8,61.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_9.setTransform(106.1,51.8);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgBBSQgNAAgJgKQgJgKABgNQACgxgBgxQgBgNAKgKQAJgJAMgBQANAAAKAKQAJAJAAANQABAygCA0QAAANgKAJQgJAJgMAAIgBgBg");
	this.shape_10.setTransform(206.6,14);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#4F7222").s().p("AhSCKQhHg7gChdQgBhEAgg1IACgDIAOgUIAJgGQAdgUAogBQA7gBAzAtQAyAsAWBaQADAKAAAMIABALQABBAgfAtQgiAxg7ACIgDAAQg2AAg6gwgAgZicQgKAAgJAEQggALgVAxIgKAdIgEARIAAABIAAAMQABBLAoAvQAmAsAxgBQAkgBAagRQAQgLAMgRQAJgNAGgQQAKgagBgfQgBgrgRghQgMgXgTgSQgsgng8AAIgDAAg");
	this.shape_11.setTransform(198.4,14);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#F5F5F5").s().p("AhPBlQgogvgChLIABgMIAAgBIAEgRIAJgdQAVgwAggMQAJgDAKAAQA+gCAtAoQATASAMAXQASAhABAsQABAfgLAaQgGAPgJANQgMARgQALQgZARgkABIgDABQgwAAgkgsg");
	this.shape_12.setTransform(199.3,12.7);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgHgHAAgKIgChIQAAgKAHgHQAHgHAKAAQAIAAAIAHQAHAGAAAKIABBIQABAKgHAHQgHAHgKAAIgBAAQgIAAgHgGg");
	this.shape_13.setTransform(225.8,11.4);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AAEB9Qg7gKgVhPQgMgrAGgpQACgOAEgMQAIgVALgMIAFgEQATgSAWAFQA1AOAaA1QAaA1gOA5QgJAmgOARQgQASgZAAIgMgBg");
	this.shape_14.setTransform(220.2,9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkcCzIgPgCQACgWAJgoQAPhEAcg5QBRiuCRgCQCQgEBmChQAuBIAbBWIgEABQjsA1ijAEIglAAQhZAAg3gIg");
	this.shape_15.setTransform(205.6,22.9);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgQAxQgdgBgUglQgOgXgMgGQgGgCgDgGQgDgGADgGQACgGAGgDQAGgDAGACQAWAHAVAmQAKARANADIAKgFIAAAAIAHgEIAAAAQAWgIAMgIIABgEIALgYQADgGAGgCQAGgDAGADQAGADACAGQADAGgDAGIgKAXIAaAPQAGAEACAHQABAGgEAGQgDAFgGACQgHABgFgEIgfgTIgfAPIAAgBIgHAEIgBABQgSAIgFAAIgBgBg");
	this.shape_16.setTransform(233,34.6,1,1,0,0,0,-7.1,-2.8);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgGgCgDgFIgFgHQgGgFAAgHQAAgFAFgFQAEgFAHAAQAHAAAEAFQAFAEAGAIQADAGgBAHQgCAGgGADQgEADgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQgBgHAFgFQAFgEAGgBQAHAAAFAFQAEAEABAHIAAAKQAAAHgEAFQgFAEgHAAIgBAAQgGAAgEgEg");
	this.shape_17.setTransform(192.3,37.9,1,1,0,0,0,-34.7,5.7);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AEfCkIgJgEIAkh8IAIgbIAVhMIARAIQAbAMAeADIgIAsIgQBlIgNBZQgwgIgtgSgAnaC+IgBgWQAAhFAFg4QAEgoAIghIAEgRQAlgBAkgJQgDAxAAA3IAAAOQAABCAGA5QgqAGgqAAIgMAAgAL3BSIgHgFQgegXgegmQgug5gWg8IAAgBIAEgDIAKgHIAGgFIAkgeIABACIAPAZIAFAKQAVAfAdAhQAfAmAfAbIAAABIAHAGIADADIgSAPIgjAdIgLAKgAsfAvIgTgaIgDgGQA2hhAug2QAOANAJAEQATANAUALIgSAXIgMASQgiAzgdA5IgOAbQgRgQgQgSgAhJhKIgShjQAxgOAtgCIAJBKQALBYAHBLIgGAAQgiAAgnAMQgKg9gOhJg");
	this.shape_18.setTransform(95.7,59.9);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFgEPQgfAAgfgEIAOhZIAPhmIAIgsIAZABQBhgBBVg5IAAABQAWA7AuA6QAeAlAeAXIAHAGIAAABIgBAAIgPALIgYARQiABTiTAAIgCAAgArdDlIgHgDQgZgLgxgaIgVgOIgUgRIANgbQAdg6AigzIANgSIASgWQBBAeBPAMQAaAFAaAAIAHAAIABAAIgEARQgHAigEAoQgGA4AABFIABAWQhWgDhTgjgAnaCKIAAgOQAAg4ADgxIAfgIIAAAAQAogMBBgfIABAAQBUgpAjgMQARgGARgFIASBiQAOBJAKA+IgLAEIgKAEQgfAMg8AdIgBABQhQAlgyAQIgBAAQgqANgrAHQgFg4gBhCgABaC2IAAAAQgxgegbgMQgUgJgXgEQgOgCgQAAQgHhMgLhXIgJhKIAVgBQBPAABJAfIAAAAQAmAPBFArQAjAWAZALIgWBNIgIAbIgjB8QgngRg8gmgALbBnIgIgGIAAgBQgfgcgfgmQgdgggUgfIgGgKIgPgZIgBgDIAAgBIAPgOIAEgEIAcgcQA1g1AigmIAEgEIACgBQBKg4A4AAQASAAAOAHQAdADASASQAXAYAAAuQAAAagJAdQg8BNhUBMIgWAUQgaAZgcAZIgCgDgAuYBQIgBgCQgmhVgCg9IAAgLQAAgHACgJQACgIAIgPIAEgHIAFgHQAOgQARAAQAWAAANARIAPAZQAGAJAaAYIALAKIAGAEQgvA2g2BhIgJgMg");
	this.shape_19.setTransform(104.6,52.2);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#383A35").s().p("AgDBSQgNgBgJgJQgIgLAAgNQAEgwAAgyQABgNAJgJQAJgJANAAQANAAAJAKQAJAJAAANQgBAygDA0QgBANgKAIQgJAIgKAAIgDAAg");
	this.shape_20.setTransform(199.8,15.2);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#4F7222").s().p("AAcC7Qg4gBg5gyQhGg+ABhcQAAhEAig0IACgEQAHgKAIgJIAJgGQAdgTAoAAQA7ABAyAvQAwAsAVBcIACAVIAAALQAABBghAsQgjAwg6AAIgBAAgAgoiZQggAKgWAxIgLAdIgEAQIgBABIAAAMQgBBLAnAxQAkAsAyABQAkAAAZgRQARgKAMgRQAKgNAGgPQALgaAAgfQABgrgRgiQgMgXgSgSQgrgqg+AAQgKAAgKADg");
	this.shape_21.setTransform(191.7,15);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#F5F5F5").s().p("AhSBkQgngxABhLIAAgMIABgBIAEgQIALgdQAWgxAggKQAKgDAKAAQA+ABArAqQASASAMAWQARAigBArQAAAggLAZQgGAQgKANQgMAQgRALQgZAQgkAAQgygBgkgsg");
	this.shape_22.setTransform(192.7,13.8);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#383A35").s().p("AgQA1QgHgHAAgKIABhIQAAgKAHgGQAGgHAJAAQAKAAAHAHQAHAHAAAKIgBBHQAAAKgGAHQgIAHgJAAQgJAAgHgHg");
	this.shape_23.setTransform(219.1,13.2);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#EEEEEE").s().p("AAAB9Qg7gMgShPQgLgsAHgpQADgNAEgMQAIgVAMgLIAGgFQATgRAVAGQA1APAZA2QAYA2gQA4QgKAmgPAQQgPARgXAAIgPgBg");
	this.shape_24.setTransform(213.7,10.7);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#77A63B").s().p("AhoC6QhzgBhCgMIgPgDQADgWAKgoQAShEAdg4QBWiqCQABQCQABBiCjQAsBJAZBXIgFABQjoAuihAAIgHAAg");
	this.shape_25.setTransform(198.2,23.9);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#A32B2B").s().p("ABHA3IgcgYIggAKIgIADIgBABQgVAFgEgCQgdgEgPgoIABAAQgKgZgLgHQgGgDgCgHQgCgGADgFQADgGAGgCQAHgCAGAEQAUAIAQApIgBAAQAIATANAEIAKgDIAAAAIAIgDQAXgGAMgFIACgFIAPgWQADgFAGgBQAHgCAGAEQAFADABAGQABAHgDAGIgNAUIAYAUQAGAEAAAHQAAAGgEAFQgEAGgGAAQgHAAgFgEg");
	this.shape_26.setTransform(226.1,37.8,1,1,0,0,0,-6.6,-2.3);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#4F7222").s().p("AgbAZQgHgCgDgGIgFgHQgFgFAAgFQAAgHAFgEQAFgFAGAAQAHAAAFAFQAEAEAGAJQADAFgCAHQgCAGgGAEQgDACgEAAIgEgBgAAVAMQgFgFAAgGIAAgKQAAgHAFgFQAEgEAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAFQgFAEgHAAQgGAAgEgFg");
	this.shape_27.setTransform(185.1,35.7,1,1,0,0,0,-34.7,1.7);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#E0DE39").s().p("AF1DHIgUgCQgsgIgogSIgDgBIADABQAIg0AKgxIADgLIAJgkIgEgCIAEABQANgzAOglIAIAEQAZAMAcADIAMACQgJAfgFAiQgKBGgBBtgAmqDFIgCgKQgEgvgCgjIAAgWQAAg1AIgxIAGgfQAegCAggIIAMgDIAAAYQAAA9AJAyQAFAfAJAkIAMApIgtAKQgdAFgdABIgFABIgHAAgAKXAlIgTgdQghgzgWgnIgLgXIACgCIABAAIAMgLQAPgMAPgPIAKgJIACgDIABgBIAOAYQAVAlAdAjQASAWAVAVQAOAPAZAQIgDADIg1A2IgGAIIgDACIgGAFIgBABIAAABQgZgXgSgagAruAwQgGgIgMgTIgJgPIAGgHIANgYQAqhDAwgpIANAJQASANATALIgRAYIgMATQgeAzgbA5IgBACIgBACIgFAMIgHARQgRgRgPgTgAgzgWIAAgBQgSh0gJgtQAogLAmgCIAUgBIAWABIAAAsIgBBxIgCBQIAAAKIgOgBIgFAAQgcAAggAKIgLhRg");
	this.shape_28.setTransform(95,59.5);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#77A63B").s().p("AEkELIgOgCQABhuALhFQAEgjAJggIAMAAQBZAABOg6IAMAXQAWAmAhAzIATAeQASAaAYAWIgOAMQiCBoiXAAIgXAAgAoSEGIgMAAQhQgChNglIgBAAIgHgCQgWgMgugbIgUgPQgJgHgIgJIgCgBIAIgRIAEgMIACgCIABgDQAag5AegzIAMgSIARgZQA9AiBKAKQAYAGAZAAIAGAAIABAAIAHAAIgFAeQgIAzAAA1IAAAWQABAiAEAvIACAKIgIAAgAmjDNQgJgkgFgfQgJgyAAg+IABgZIAPgDQAngOA7gfIABgBQBPgrAhgMIAfgMIAKgDQAJAtASBzIAAAAIALBTIgJADIgKAEIgCABIgIADQgcAMg4AeIgBABQhKAngwAQIAAAAIgjAMIgMgpgACrDrIgJgDIgDgBQgUgLgZgPIgtgeQgtgggZgMIgJgFQgPgFgQgEIgPgCIAAgJIADhRIABhxIAAgrQA9ADA6AcQAjAPBBAtQAhAXAWANIAIADQgOAlgNA0IgDgBIADABIgJAlIgCALQgLAwgHA1gAKDAuQgUgVgSgWQgegjgVgkIgNgYIAEgGIACgBQA2g0A2hCIAkgVIALgFQAqgXAzAAQA0AAAcAZQAcAZAAAxIgBAWQglAkgtAuIhxBzIgQARIgJAJQgYgRgPgPgAtqBFIAAAAIgBAAQgcg7AAhFIABgLIAAgFQAAgMABgKIACgDIABgCQAmhNAogBQAjAAAJAZQADAIAAAXIACAAIgFAbIgCAOIAAABIAPAPQgwApgqBCIgOAXIgFAJIgCgDg");
	this.shape_29.setTransform(104.5,52.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_9},{t:this.shape_8},{t:this.shape_7},{t:this.shape_6},{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).to({state:[{t:this.shape_29},{t:this.shape_28},{t:this.shape_27},{t:this.shape_26},{t:this.shape_25},{t:this.shape_24},{t:this.shape_23},{t:this.shape_22},{t:this.shape_21},{t:this.shape_20}]},3).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},3).wait(3));

	// Layer_4
	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_30.setTransform(101.3,74.3);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("rgba(0,0,0,0.498)").s().p("Au7ALQgQgDANgRQA4hIBrATQDkApDngPQEBgRD9gTQGVgUF6BeQAOAEgMANQkLAQkNAHQiygGizAUQi7AUi5AAQlKAAk/hBg");
	this.shape_31.setTransform(101.3,74.3);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("rgba(0,0,0,0.498)").s().p("AuMALQgPgDANgRQA1hIBlATQDZApDbgPQD1gRDxgTQGBgUFnBeQANAEgLANQj+AQj/AHQiqgGiqAUQiyAUiwAAQk6AAkvhBg");
	this.shape_32.setTransform(101.3,74.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_30}]}).to({state:[{t:this.shape_31}]},3).to({state:[{t:this.shape_32}]},3).to({state:[{t:this.shape_31}]},3).wait(3));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-4.5,-72.7,262.3,154.6);


(lib.Symbol11copy4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{idle:0,walk:1,flyaway:2,"throw":56});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}
	this.frame_48 = function() {
		this.stop();
	}
	this.frame_90 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(47).call(this.frame_48).wait(42).call(this.frame_90).wait(1));

	// Layer 1
	this.formica = new lib.Symbol31copy3();
	this.formica.name = "formica";
	this.formica.parent = this;
	this.formica.setTransform(-183.8,-21.6,1,1,0,0,0,103.2,69);

	this.f1 = new lib.serpicopy2();
	this.f1.name = "f1";
	this.f1.parent = this;
	this.f1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.formica}]}).to({state:[{t:this.f1}]},1).to({state:[]},1).wait(89));

	// Layer_15
	this.instance = new lib.Tween6("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(-151.4,-108.3);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.bamboose = new lib.ttt();
	this.bamboose.name = "bamboose";
	this.bamboose.parent = this;
	this.bamboose.setTransform(-232.6,-120.4);
	this.bamboose._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(16).to({_off:false},0).to({alpha:1},3).to({startPosition:0},2).to({_off:true},1).wait(69));
	this.timeline.addTween(cjs.Tween.get(this.bamboose).wait(56).to({_off:false},0).to({x:-134.4},8).to({x:-69.3},5).to({x:0.8},5).to({x:78.3},5).to({x:168.8},5).to({x:295.4},5).to({_off:true},1).wait(1));

	// Layer 16
	this.instance_1 = new lib.Symbol7();
	this.instance_1.parent = this;
	this.instance_1.setTransform(-152.7,-43.7,1,1,0,0,0,56.8,41.2);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("AoTgVQgHhcgWi4QgGgegBgWIAHAAIHmgbIJwgjQABCZAMG2IAFDEQivAFlHALIgCg1IAAgCIgBgLIgBgEIgDgIIgwADIgkADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQABAAAAAAIAAADIACA+InsARQABjZgSjYg");
	this.shape.setTransform(-152.7,-43.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E4D0D1").s().p("An0GrQgJgRgGgRQgCiggYisIgRhoIggi1QgIgegEgYIAAgBIAGgBQBAhGF+g6QHShsCyA4QA0CKA5FpQABAngDA0QgCBfgIBvIg1AWQh5BYiRAKIgzACIgIABIg+ADQgIgXgKgQIgBgCIgEgIIgCgDIgFgGIgzADIgnACQgCABgBAEIAAADIAAACQgJANgIAhIgwACIgBAAQgRgIgRgFIgBAAIgHgDIgDgBIgGgCIgpABIgfACIgEABIgBABIgCABQgTAFgQAMIkUAJQgPgbgGgag");
	this.shape_1.setTransform(-152.2,-50.7);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#EDBECF").s().p("AnqIFQgRgKgLgKQgBiigli8QgKgxgNg8Igui6IgPg3IgBgCIAFgDQBiiKE0haQGui7DrB1QBmCLBpFiQAAAkgGA7QgIBegSB7IgqApQhvCuhhANQgmABgPACIgIACQgWACgtABQgPgOgTgLIgCgBIgHgGIgDgCQgEgDgDgBIg3ACIgoACQgDABgBACIgCACIgCACQgRAJgTAWIg1ACIAAgBIgYgbIgBgBIgFgFIgCgCIgFgEIgrACIghACQAAAAgBAAQAAABAAAAQgBAAAAABQAAAAgBABIgBACIgBABQgMAKgKAXIknAIQgegSgMgRg");
	this.shape_2.setTransform(-151.3,-58.1);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F6ABCE").s().p("AnfJgIgrgHQAAikgwjLQgNg1gRg8QgchkgehcIgUg4IgCgDIAFgFQCCjODrh7QGLkKEjCzQCYCMCYFaQABAigLBDQgMBbgcCIIggA9QhlECgwAQQgtACgLACQgDAAgGADQgSACg0ACQgWgHgdgFIgCAAIgLgDIgEgBIgJgCIg5ACIgrABIgGACIgDABIgCAAQgbAFgdAMIg8ABIgMgqIAAgBIgDgJIgCgDQgCgEgCgCIgtADIgjACQgCABAAAEIABADIgBACQgGANgEAjQjmAEhTADQgtgIgSgIg");
	this.shape_3.setTransform(-150.5,-65.6);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FF99CC").s().p("AptDGQgwiTgxhwQLkzfK5ShQABBShcFXQhbFXAAAUQg0ABgGADIgJAEQgoAHmLAEIAAAAIgCg4IAAgCIgBgLIgBgEIgDgIIgvADIglACQgBACAAAFQABABAAABQAAAAAAABQAAAAABABQAAAAAAAAIAAADIACA/QldAEhCAFQgjADgWAEQABjShhklg");
	this.shape_4.setTransform(-149.6,-72.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#EB77A3").s().p("AnAKrIgLgDQgfgFg3hEQg4hDgIgrQhUhFgRikQgRijAPidIAAgBQCqmXDgiXQDtihDrBFQDDAyC0DLQBMBVBFB6QAZBsASCYQATCZh1DUQh1DUg8AXQhlAmicAdIhRAPIAAgBQgIgRgIgMIgBgBIgEgFIgCgCQgCgEgCAAIguAIIgiAHQgBABgBAEIAAADIgBACQgHANgGAcIAAAEIgJgEIAAAAIgHgDIgDgBIgGgDIgtACIgjABIgFACIgBABIgCABQgJABgJAIQjDgUhngZg");
	this.shape_5.setTransform(-150.2,-77.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D8557A").s().p("AlyKgIgFgCIgGgDQgmgUgvg3Qgzg5gYgxQgOgPgNgSQg7hTgdhvQgviigGiXIAAgBQBumoDbiWIAPgKQDYiODZASQAVABAVADQC6AZClCSQAXAUAWAXQBNBTA+CDQAiBtAYCVQAEAaADAbQgBBUgmB9QgQA0geA8QhHCOhMBfQgKALgJAIQhQBCh6AxIgYAKQgjAPgoAOIAAgBQgMgEgMgCIgBgBIgFgBIgBAAIgGgBIgrAOIgiALQgCABgCADIgCACIgCACQgMALgNAQIAAAAIgBAAIgFgHIAAAAIgCgEIAAAAIgBgBIgCgCIgCgEIgCgCIgFgDIgiABIgJABIgaABIgFABIgCABIAAAAIgBACIgBABIgBACIgBACQgCACgDAIIgGAHQipgshlgzg");
	this.shape_6.setTransform(-150.5,-82.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#C43250").s().p("AkmKTQh2hchRh9QiqkJgnjkQA3nGDfiSQDfiTDigJQDigKC8COQC7CNBNGvQABBNgeCIQgeCJiWDpQhHBuh0BSQhmBHigBCIgCgXIAAgBIgBgKIgBgDIgDgHIgqADIghACQgBABABAEQAAABAAABQAAAAABABQAAAAAAAAQAAABAAAAIAAACQABADABAZQiahEhqhSg");
	this.shape_7.setTransform(-151.2,-88);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#C43250").s().p("AlIMKQiEhshaiVQi9k4gskNQA9oZD5itQD5itD8gLQD8gLDRCmQDRCnBWH+QABBbghChQgiCiinESQhPCDiCBgQhxBVizBNIgCgbIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABAAAFQABABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABADABAfQishRh2hhg");
	this.shape_8.setTransform(-151.1,-102.6);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#C43250").s().p("AAwPYIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABABAFQAAABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABAGg/giQhGgnhLgzQjfiWhQiFQi9k4gskNQgEosEnjYQEmjYD9AIQD+AHDZDiQDaDiAoHLQABBagtCiQgtCiiIDEQiIDEh5BdQh6BdhFAiQgzAagKAAQAAAAgBAAQAAgBAAAAQgBAAAAAAQAAAAAAgBg");
	this.shape_9.setTransform(-151.2,-108.2);

	this.f1_1 = new lib.serpicopy3();
	this.f1_1.name = "f1_1";
	this.f1_1.parent = this;
	this.f1_1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);
	this.f1_1._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1}]},2).to({state:[{t:this.instance_1}]},6).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).to({state:[]},1).to({state:[{t:this.f1_1}]},37).to({state:[{t:this.f1_1}]},8).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({_off:false},0).to({alpha:1},6).to({_off:true},1).wait(82));
	this.timeline.addTween(cjs.Tween.get(this.f1_1).wait(56).to({_off:false},0).to({x:-17.8},8).to({x:47.2},5).to({x:117.2},5).to({x:194.7},5).to({x:285.2},5).to({x:412.2},5).to({_off:true},1).wait(1));

	// Layer 17
	this.bamboos = new lib.ttt();
	this.bamboos.name = "bamboos";
	this.bamboos.parent = this;
	this.bamboos.setTransform(-232.6,-120.4);

	this.instance_2 = new lib.Tween6("synched",0);
	this.instance_2.parent = this;
	this.instance_2.setTransform(-151.4,-108.3);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.bamboos}]},2).to({state:[]},6).to({state:[{t:this.instance_2}]},13).to({state:[{t:this.instance_2}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(21).to({_off:false},0).to({y:-438.3},27).to({_off:true},1).wait(42));

	// Layer_11
	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape_10.setTransform(-31,6.6);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_11.setTransform(-38.2,5.2);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_12.setTransform(-39.2,6.4);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgIgIAAgKIAAhHQAAgLAIgGQAGgHAJAAQAKAAAHAHQAHAGAAALIAABHQAAAKgHAIQgHAGgKAAQgJAAgGgGg");
	this.shape_13.setTransform(-11.8,4.5);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_14.setTransform(-17.2,1.9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkdCvIgOgDQACgWAKgoQARhDAcg5QBWirCPAAQCRAABjCiQAsBJAZBXIgEAAQjsAxikAAQhzAAhCgLg");
	this.shape_15.setTransform(-32.4,15.3);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_16.setTransform(2.3,30.1);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgHgCgDgGIgEgHQgGgFAAgGQAAgHAGgDQADgGAIAAQAGAAAFAGQAEADAGAJQADAGgCAHQgBAGgGADQgEACgEAAIgEAAgAAVAMQgFgEAAgHIAAgKQAAgHAFgEQAEgFAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAEQgEAFgHAAQgHAAgEgFg");
	this.shape_17.setTransform(-24.9,11.6,1,1,0,0,0,-14,-13.6);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AGnCbIgXAAIgCAAIgPgBIgCAAIgKAAIgMgBIgTgBIAGgqIAEgkIAAgCQAPhhAVg7IARABIADAAIAFAAIAJAAIALAAIACAAIAQAAIAZAAQgRBFgGBPQgCAbgCAdIgBAiIgXAAgAGaA+IABAAIgBgBgAneCJIgBgUIgBgkQAAhYAQgyIAOgfIAOgBIAPgBIAFAAIALgBIAQgCIANgCIgEASQgLAtABA7QAAAXACAsIABADIAAABIAAALIAEAlIgGABIgDAAIgYACIgbACIghABIgCgPgAs6B2IABgDIgEgBQgXgKgTgMIALgjQAohzAzg2IACABIACAAIAjAHIAkAGQg0AygoBhQgKAUgHAWIgKAfIgNgEgAA3BlIgigDIgPAAIgCAAIgPgBIgFAAIgHg4IgHgkQgQhRgZg/IAqgCIAEAAIASAAIAWAAIACAAIAWABQAHAeAFAqQAHAzAEAzIAAAKIACA8IgJgDgAhjBmIADAAIgDAAgALkASIgMgUQgkhAgKgqIgCgPIAEgBIAKgDIAdgLQAAgCAGgDIAPgGIAAABIALgGQAaBAAeA2QAUAiAWAeIATAZIgCABIgKAGIgSAMIAAAAIgBAAIgBABIgKAGIgLAFIgDACIgTAKQgeghgbgtgAqtg9IABAAIgCABg");
	this.shape_18.setTransform(-148.2,49.6);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_19.setTransform(-138.9,39.6);

	this.instance_3 = new lib.Symbol2();
	this.instance_3.parent = this;
	this.instance_3.setTransform(-245,-12.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},2).to({state:[{t:this.instance_3}]},6).to({state:[{t:this.instance_3}]},13).to({state:[{t:this.instance_3}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(8).to({_off:false},0).wait(13).to({y:-342.2},27).to({_off:true},1).wait(42));

	// Layer_2
	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_20.setTransform(-143.7,62.1);

	this.instance_4 = new lib.Tween8("synched",0);
	this.instance_4.parent = this;
	this.instance_4.setTransform(-143.7,62.1);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_20}]},2).to({state:[{t:this.instance_4}]},19).to({state:[{t:this.instance_4}]},26).to({state:[]},1).wait(43));
	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(21).to({_off:false},0).to({scaleX:0.08,scaleY:0.08,skewX:180},26).to({_off:true},1).wait(43));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-246.6,-415.7,259.3,154.2);


(lib.Symbol11copy3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"idle":0,"walk":1,"flyaway":2,"throw":56});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}
	this.frame_48 = function() {
		this.stop();
	}
	this.frame_90 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(47).call(this.frame_48).wait(42).call(this.frame_90).wait(1));

	// Layer 1
	this.formica = new lib.Symbol31copy2();
	this.formica.name = "formica";
	this.formica.parent = this;
	this.formica.setTransform(-183.8,-21.6,1,1,0,0,0,103.2,69);

	this.f1 = new lib.serpi();
	this.f1.name = "f1";
	this.f1.parent = this;
	this.f1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.formica}]}).to({state:[{t:this.f1}]},1).to({state:[]},1).wait(89));

	// Layer_15
	this.instance = new lib.Tween6("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(-151.4,-108.3);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.bamboose = new lib.rrr();
	this.bamboose.name = "bamboose";
	this.bamboose.parent = this;
	this.bamboose.setTransform(-232.6,-120.4);
	this.bamboose._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(16).to({_off:false},0).to({alpha:1},3).to({startPosition:0},2).to({_off:true},1).wait(69));
	this.timeline.addTween(cjs.Tween.get(this.bamboose).wait(56).to({_off:false},0).to({x:-134.4},8).to({x:-69.3},5).to({x:0.8},5).to({x:78.3},5).to({x:168.8},5).to({x:295.4},5).to({_off:true},1).wait(1));

	// Layer 16
	this.instance_1 = new lib.Symbol3();
	this.instance_1.parent = this;
	this.instance_1.setTransform(-143.7,-43.7,1,1,0,0,0,105.8,41.2);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("Av9gVQgHhcgWi4QgGgegBgWIAHAAQc1gyD1gMQABCZAMG2IAFDEQieAEuXAPIgEAAIgCg4IAAgCIgBgLIgBgEIgDgIIgwADIglADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQABAAAAAAIAAADIACA/QsXANhlADQABjZgSjYg");
	this.shape.setTransform(-143.7,-43.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E4D0D1").s().p("AulCIQgEh6gYjRIgMhpQC8k3CxEoQVngPC7BLQACCeAKF4QgUBKgSBLQiYAEsWANIgDgBIgCg3IAAgCIgBgLIgBgEIgDgIIgwADIglACQgBACAAAFQABABAAABQAAAAAAABQAAAAABABQAAAAAAAAIAAADIADA/QqrAKhsAEQgRiigciig");
	this.shape_1.setTransform(-145.1,-48.6);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#EDBECF").s().p("AtOFGQgDiYgZjsIgRidQF0pvFfJQQOaAUB/CiQACCiAJE7QgpAygoA0QiSAFqUAKIgDAAIgCg4IAAgCIAAgLIgBgEIgDgIIgwADIglACQgBACAAAFQABABAAAAQAAABAAABQAAAAABAAQAAABAAAAIAAADIADA/Qo+AIh0AFQghhsgmhqg");
	this.shape_2.setTransform(-146.3,-56.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F6ABCE").s().p("Ar4IDQgBi2gakIQgLh1gLhaQIsunILN4QHOA3BED4IAKGkQhAAbg8AdQiMAFoTAIIgBgBIgCg4IAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQABAAAAAAIAAADIACBAQnQAGh7AEQg0g0gvgzg");
	this.shape_3.setTransform(-147.5,-64.8);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FF99CC").s().p("Aq8DGQgNiTgOhwQLkzfK5ShQABBaAIFPIAJFrQhWAChRAGQiFAGmSAFIAAAAIgCg4IAAgCIgBgLIgBgEIgDgIIgvADIglACQgBACAAAFQAAABABABQAAAAAAABQAAAAAAABQABAAAAAAIAAADIACA/QljAEiCAFIh/AHQABjTgbkkg");
	this.shape_4.setTransform(-148.7,-72.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#EB77A3").s().p("AnAKrIgLgDQgfgFg3hEQg4hDgIgrQhUhFgRikQgRijAPidIAAgBQCqmXDgiXQDtihDrBFQDDAyC0DLQBMBVBFB6QAZBsASCYQATCZh1DUQh1DUg8AXQhlAmicAdIhRAPIAAgBQgIgRgIgMIgBgBIgEgFIgCgCQgCgEgCAAIguAIIgiAHQgBABgBAEIAAADIgBACQgHANgGAcIAAAEIgJgEIAAAAIgHgDIgDgBIgGgDIgtACIgjABIgFACIgBABIgCABQgJABgJAIQjDgUhngZg");
	this.shape_5.setTransform(-150.2,-77.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D8557A").s().p("AlyKgIgFgCIgGgDQgmgUgvg3Qgzg5gYgxQgOgPgNgSQg7hTgdhvQgviigGiXIAAgBQBumoDbiWIAPgKQDYiODZASQAVABAVADQC6AZClCSQAXAUAWAXQBNBTA+CDQAiBtAYCVQAEAaADAbQgBBUgmB9QgQA0geA8QhHCOhMBfQgKALgJAIQhQBCh6AxIgYAKQgjAPgoAOIAAgBQgMgEgMgCIgBgBIgFgBIgBAAIgGgBIgrAOIgiALQgCABgCADIgCACIgCACQgMALgNAQIAAAAIgBAAIgFgHIAAAAIgCgEIAAAAIgBgBIgCgCIgCgEIgCgCIgFgDIgiABIgJABIgaABIgFABIgCABIAAAAIgBACIgBABIgBACIgBACQgCACgDAIIgGAHQipgshlgzg");
	this.shape_6.setTransform(-150.5,-82.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#C43250").s().p("AkmKTQh2hchRh9QiqkJgnjkQA3nGDfiSQDfiTDigJQDigKC8COQC7CNBNGvQABBNgeCIQgeCJiWDpQhHBuh0BSQhmBHigBCIgCgXIAAgBIgBgKIgBgDIgDgHIgqADIghACQgBABABAEQAAABAAABQAAAAABABQAAAAAAAAQAAABAAAAIAAACQABADABAZQiahEhqhSg");
	this.shape_7.setTransform(-151.2,-88);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#C43250").s().p("AlIMKQiEhshaiVQi9k4gskNQA9oZD5itQD5itD8gLQD8gLDRCmQDRCnBWH+QABBbghChQgiCiinESQhPCDiCBgQhxBVizBNIgCgbIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABAAAFQABABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABADABAfQishRh2hhg");
	this.shape_8.setTransform(-151.1,-102.6);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#C43250").s().p("AAwPYIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABABAFQAAABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABAGg/giQhGgnhLgzQjfiWhQiFQi9k4gskNQgEosEnjYQEmjYD9AIQD+AHDZDiQDaDiAoHLQABBagtCiQgtCiiIDEQiIDEh5BdQh6BdhFAiQgzAagKAAQAAAAgBAAQAAgBAAAAQgBAAAAAAQAAAAAAgBg");
	this.shape_9.setTransform(-151.2,-108.2);

	this.f1_1 = new lib.serpicopy3();
	this.f1_1.name = "f1_1";
	this.f1_1.parent = this;
	this.f1_1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);
	this.f1_1._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1}]},2).to({state:[{t:this.instance_1}]},6).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).to({state:[]},1).to({state:[{t:this.f1_1}]},37).to({state:[{t:this.f1_1}]},8).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({_off:false},0).to({alpha:1},6).to({_off:true},1).wait(82));
	this.timeline.addTween(cjs.Tween.get(this.f1_1).wait(56).to({_off:false},0).to({x:-17.8},8).to({x:47.2},5).to({x:117.2},5).to({x:194.7},5).to({x:285.2},5).to({x:412.2},5).to({_off:true},1).wait(1));

	// Layer 17
	this.bamboos = new lib.rrr();
	this.bamboos.name = "bamboos";
	this.bamboos.parent = this;
	this.bamboos.setTransform(-232.6,-120.4);

	this.instance_2 = new lib.Tween6("synched",0);
	this.instance_2.parent = this;
	this.instance_2.setTransform(-151.4,-108.3);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.bamboos}]},2).to({state:[]},6).to({state:[{t:this.instance_2}]},13).to({state:[{t:this.instance_2}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(21).to({_off:false},0).to({y:-438.3},27).to({_off:true},1).wait(42));

	// Layer_11
	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape_10.setTransform(-31,6.6);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_11.setTransform(-38.2,5.2);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_12.setTransform(-39.2,6.4);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgIgIAAgKIAAhHQAAgLAIgGQAGgHAJAAQAKAAAHAHQAHAGAAALIAABHQAAAKgHAIQgHAGgKAAQgJAAgGgGg");
	this.shape_13.setTransform(-11.8,4.5);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_14.setTransform(-17.2,1.9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkdCvIgOgDQACgWAKgoQARhDAcg5QBWirCPAAQCRAABjCiQAsBJAZBXIgEAAQjsAxikAAQhzAAhCgLg");
	this.shape_15.setTransform(-32.4,15.3);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_16.setTransform(2.3,30.1);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgHgCgDgGIgEgHQgGgFAAgGQAAgHAGgDQADgGAIAAQAGAAAFAGQAEADAGAJQADAGgCAHQgBAGgGADQgEACgEAAIgEAAgAAVAMQgFgEAAgHIAAgKQAAgHAFgEQAEgFAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAEQgEAFgHAAQgHAAgEgFg");
	this.shape_17.setTransform(-24.9,11.6,1,1,0,0,0,-14,-13.6);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AGnCbIgXAAIgCAAIgPgBIgCAAIgKAAIgMgBIgTgBIAGgqIAEgkIAAgCQAPhhAVg7IARABIADAAIAFAAIAJAAIALAAIACAAIAQAAIAZAAQgRBFgGBPQgCAbgCAdIgBAiIgXAAgAGaA+IABAAIgBgBgAneCJIgBgUIgBgkQAAhYAQgyIAOgfIAOgBIAPgBIAFAAIALgBIAQgCIANgCIgEASQgLAtABA7QAAAXACAsIABADIAAABIAAALIAEAlIgGABIgDAAIgYACIgbACIghABIgCgPgAs6B2IABgDIgEgBQgXgKgTgMIALgjQAohzAzg2IACABIACAAIAjAHIAkAGQg0AygoBhQgKAUgHAWIgKAfIgNgEgAA3BlIgigDIgPAAIgCAAIgPgBIgFAAIgHg4IgHgkQgQhRgZg/IAqgCIAEAAIASAAIAWAAIACAAIAWABQAHAeAFAqQAHAzAEAzIAAAKIACA8IgJgDgAhjBmIADAAIgDAAgALkASIgMgUQgkhAgKgqIgCgPIAEgBIAKgDIAdgLQAAgCAGgDIAPgGIAAABIALgGQAaBAAeA2QAUAiAWAeIATAZIgCABIgKAGIgSAMIAAAAIgBAAIgBABIgKAGIgLAFIgDACIgTAKQgeghgbgtgAqtg9IABAAIgCABg");
	this.shape_18.setTransform(-148.2,49.6);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_19.setTransform(-138.9,39.6);

	this.instance_3 = new lib.Symbol2();
	this.instance_3.parent = this;
	this.instance_3.setTransform(-245,-12.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},2).to({state:[{t:this.instance_3}]},6).to({state:[{t:this.instance_3}]},13).to({state:[{t:this.instance_3}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(8).to({_off:false},0).wait(13).to({y:-342.2},27).to({_off:true},1).wait(42));

	// Layer_2
	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_20.setTransform(-143.7,62.1);

	this.instance_4 = new lib.Tween8("synched",0);
	this.instance_4.parent = this;
	this.instance_4.setTransform(-143.7,62.1);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_20}]},2).to({state:[{t:this.instance_4}]},19).to({state:[{t:this.instance_4}]},26).to({state:[]},1).wait(43));
	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(21).to({_off:false},0).to({scaleX:0.08,scaleY:0.08,skewX:180},26).to({_off:true},1).wait(43));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-249.1,-415.7,261.8,154.2);


(lib.Symbol11copy2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"idle":0,"walk":1,"flyaway":2,"throw":56});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}
	this.frame_48 = function() {
		this.stop();
	}
	this.frame_90 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(47).call(this.frame_48).wait(42).call(this.frame_90).wait(1));

	// Layer 1
	this.formica = new lib.Symbol31copy();
	this.formica.name = "formica";
	this.formica.parent = this;
	this.formica.setTransform(-183.8,-21.6,1,1,0,0,0,103.2,69);

	this.f1 = new lib.serpicopy();
	this.f1.name = "f1";
	this.f1.parent = this;
	this.f1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.formica}]}).to({state:[{t:this.f1}]},1).to({state:[]},1).wait(89));

	// Layer_15
	this.instance = new lib.Tween6("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(-151.4,-108.3);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.bamboose = new lib.sss();
	this.bamboose.name = "bamboose";
	this.bamboose.parent = this;
	this.bamboose.setTransform(-232.6,-120.4);
	this.bamboose._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(16).to({_off:false},0).to({alpha:1},3).to({startPosition:0},2).to({_off:true},1).wait(69));
	this.timeline.addTween(cjs.Tween.get(this.bamboose).wait(56).to({_off:false},0).to({x:-134.4},8).to({x:-69.3},5).to({x:0.8},5).to({x:78.3},5).to({x:168.8},5).to({x:295.4},5).to({_off:true},1).wait(1));

	// Layer 16
	this.instance_1 = new lib.Tween4("synched",0);
	this.instance_1.parent = this;
	this.instance_1.setTransform(-136.2,-43.6);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("A19hZQgNiTgOhxIU0gbQVSgbCZgIQABBZAIFPIAJFrQiqAE0CAPIhPABIAAgBIgCg4IAAgCIgBgLIgBgEIgDgIIgwADIglADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQABAAAAAAIAAADIACBAQxLAMhdADQABjTgbkig");
	this.shape.setTransform(-136.2,-43.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E4D0D1").s().p("AzJgjQgNiTgPhxQKilBKsEdQP+ACB1BOQACBuAIErQgTCCgQCQQiiAFwlAMIg8ABIAAgPIgCgqIAAgEIgBgKIgBgFQgIgEgHgBIgtADIgcADIAAAGIABAEIABASQhYAOggAkQtKAKhUADQACjTgbkig");
	this.shape_1.setTransform(-139.7,-49.1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#EDBECF").s().p("AwaAqQgNiSgPhxQK5p2KwJKQKpAfBSCkIAJGJQgpBXgnBjQiXAFtKAJIgoABIgBgdIAAgdIgBgGIgBgIIgCgGQgMgCgNAAIgrADQgLABgHADIAAAFIAAAEIACAhQixALhBAZQpIAIhMADQACjTgbkjg");
	this.shape_2.setTransform(-142.7,-56.9);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F6ABCE").s().p("AtrB4QgNiSgPhxQLPuqK0N1QFVA8AtD5IAJF7Qg/Atg8A0QiOAGpvAHIgTAAIgBgqIAAgQIgBgIIgBgGIgDgHIglAAIgnADQgGABgEAEIABAFIAAADIACAwQkJAIhiAPQlHAFhDAEQACjTgbkkg");
	this.shape_3.setTransform(-145.7,-64.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FF99CC").s().p("Aq8DGQgNiTgOhwQLkzfK5ShQABBaAIFPIAJFrQhWAChRAGQiFAGmSAFIAAAAIgCg4IAAgCIgBgLIgBgEIgDgIIgvADIglACQgBACAAAFQAAABABABQAAAAAAABQAAAAAAABQABAAAAAAIAAADIACA/QljAEiCAFIh/AHQABjTgbkkg");
	this.shape_4.setTransform(-148.7,-72.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#EB77A3").s().p("AnAKrIgLgDQgfgFg3hEQg4hDgIgrQhUhFgRikQgRijAPidIAAgBQCqmXDgiXQDtihDrBFQDDAyC0DLQBMBVBFB6QAZBsASCYQATCZh1DUQh1DUg8AXQhlAmicAdIhRAPIAAgBQgIgRgIgMIgBgBIgEgFIgCgCQgCgEgCAAIguAIIgiAHQgBABgBAEIAAADIgBACQgHANgGAcIAAAEIgJgEIAAAAIgHgDIgDgBIgGgDIgtACIgjABIgFACIgBABIgCABQgJABgJAIQjDgUhngZg");
	this.shape_5.setTransform(-150.2,-77.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D8557A").s().p("AlyKgIgFgCIgGgDQgmgUgvg3Qgzg5gYgxQgOgPgNgSQg7hTgdhvQgviigGiXIAAgBQBumoDbiWIAPgKQDYiODZASQAVABAVADQC6AZClCSQAXAUAWAXQBNBTA+CDQAiBtAYCVQAEAaADAbQgBBUgmB9QgQA0geA8QhHCOhMBfQgKALgJAIQhQBCh6AxIgYAKQgjAPgoAOIAAgBQgMgEgMgCIgBgBIgFgBIgBAAIgGgBIgrAOIgiALQgCABgCADIgCACIgCACQgMALgNAQIAAAAIgBAAIgFgHIAAAAIgCgEIAAAAIgBgBIgCgCIgCgEIgCgCIgFgDIgiABIgJABIgaABIgFABIgCABIAAAAIgBACIgBABIgBACIgBACQgCACgDAIIgGAHQipgshlgzg");
	this.shape_6.setTransform(-150.5,-82.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#C43250").s().p("AkmKTQh2hchRh9QiqkJgnjkQA3nGDfiSQDfiTDigJQDigKC8COQC7CNBNGvQABBNgeCIQgeCJiWDpQhHBuh0BSQhmBHigBCIgCgXIAAgBIgBgKIgBgDIgDgHIgqADIghACQgBABABAEQAAABAAABQAAAAABABQAAAAAAAAQAAABAAAAIAAACQABADABAZQiahEhqhSg");
	this.shape_7.setTransform(-151.2,-88);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#C43250").s().p("AlIMKQiEhshaiVQi9k4gskNQA9oZD5itQD5itD8gLQD8gLDRCmQDRCnBWH+QABBbghChQgiCiinESQhPCDiCBgQhxBVizBNIgCgbIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABAAAFQABABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABADABAfQishRh2hhg");
	this.shape_8.setTransform(-151.1,-102.6);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#C43250").s().p("AAwPYIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABABAFQAAABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABAGg/giQhGgnhLgzQjfiWhQiFQi9k4gskNQgEosEnjYQEmjYD9AIQD+AHDZDiQDaDiAoHLQABBagtCiQgtCiiIDEQiIDEh5BdQh6BdhFAiQgzAagKAAQAAAAgBAAQAAgBAAAAQgBAAAAAAQAAAAAAgBg");
	this.shape_9.setTransform(-151.2,-108.2);

	this.f1_1 = new lib.serpicopy3();
	this.f1_1.name = "f1_1";
	this.f1_1.parent = this;
	this.f1_1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);
	this.f1_1._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1}]},2).to({state:[{t:this.instance_1}]},6).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).to({state:[]},1).to({state:[{t:this.f1_1}]},37).to({state:[{t:this.f1_1}]},8).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({_off:false},0).to({alpha:1},6).to({_off:true},1).wait(82));
	this.timeline.addTween(cjs.Tween.get(this.f1_1).wait(56).to({_off:false},0).to({x:-17.8},8).to({x:47.2},5).to({x:117.2},5).to({x:194.7},5).to({x:285.2},5).to({x:412.2},5).to({_off:true},1).wait(1));

	// Layer 17
	this.bamboos = new lib.sss();
	this.bamboos.name = "bamboos";
	this.bamboos.parent = this;
	this.bamboos.setTransform(-232.6,-120.4);

	this.instance_2 = new lib.Tween6("synched",0);
	this.instance_2.parent = this;
	this.instance_2.setTransform(-151.4,-108.3);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.bamboos}]},2).to({state:[]},6).to({state:[{t:this.instance_2}]},13).to({state:[{t:this.instance_2}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(21).to({_off:false},0).to({y:-438.3},27).to({_off:true},1).wait(42));

	// Layer_11
	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape_10.setTransform(-31,6.6);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_11.setTransform(-38.2,5.2);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_12.setTransform(-39.2,6.4);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgIgIAAgKIAAhHQAAgLAIgGQAGgHAJAAQAKAAAHAHQAHAGAAALIAABHQAAAKgHAIQgHAGgKAAQgJAAgGgGg");
	this.shape_13.setTransform(-11.8,4.5);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_14.setTransform(-17.2,1.9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkdCvIgOgDQACgWAKgoQARhDAcg5QBWirCPAAQCRAABjCiQAsBJAZBXIgEAAQjsAxikAAQhzAAhCgLg");
	this.shape_15.setTransform(-32.4,15.3);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_16.setTransform(2.3,30.1);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgHgCgDgGIgEgHQgGgFAAgGQAAgHAGgDQADgGAIAAQAGAAAFAGQAEADAGAJQADAGgCAHQgBAGgGADQgEACgEAAIgEAAgAAVAMQgFgEAAgHIAAgKQAAgHAFgEQAEgFAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAEQgEAFgHAAQgHAAgEgFg");
	this.shape_17.setTransform(-24.9,11.6,1,1,0,0,0,-14,-13.6);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AGnCbIgXAAIgCAAIgPgBIgCAAIgKAAIgMgBIgTgBIAGgqIAEgkIAAgCQAPhhAVg7IARABIADAAIAFAAIAJAAIALAAIACAAIAQAAIAZAAQgRBFgGBPQgCAbgCAdIgBAiIgXAAgAGaA+IABAAIgBgBgAneCJIgBgUIgBgkQAAhYAQgyIAOgfIAOgBIAPgBIAFAAIALgBIAQgCIANgCIgEASQgLAtABA7QAAAXACAsIABADIAAABIAAALIAEAlIgGABIgDAAIgYACIgbACIghABIgCgPgAs6B2IABgDIgEgBQgXgKgTgMIALgjQAohzAzg2IACABIACAAIAjAHIAkAGQg0AygoBhQgKAUgHAWIgKAfIgNgEgAA3BlIgigDIgPAAIgCAAIgPgBIgFAAIgHg4IgHgkQgQhRgZg/IAqgCIAEAAIASAAIAWAAIACAAIAWABQAHAeAFAqQAHAzAEAzIAAAKIACA8IgJgDgAhjBmIADAAIgDAAgALkASIgMgUQgkhAgKgqIgCgPIAEgBIAKgDIAdgLQAAgCAGgDIAPgGIAAABIALgGQAaBAAeA2QAUAiAWAeIATAZIgCABIgKAGIgSAMIAAAAIgBAAIgBABIgKAGIgLAFIgDACIgTAKQgeghgbgtgAqtg9IABAAIgCABg");
	this.shape_18.setTransform(-148.2,49.6);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_19.setTransform(-138.9,39.6);

	this.instance_3 = new lib.Symbol2();
	this.instance_3.parent = this;
	this.instance_3.setTransform(-245,-12.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},2).to({state:[{t:this.instance_3}]},6).to({state:[{t:this.instance_3}]},13).to({state:[{t:this.instance_3}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(8).to({_off:false},0).wait(13).to({y:-342.2},27).to({_off:true},1).wait(42));

	// Layer_18
	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_20.setTransform(-143.7,62.1);

	this.instance_4 = new lib.Tween8("synched",0);
	this.instance_4.parent = this;
	this.instance_4.setTransform(-143.7,62.1);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_20}]},2).to({state:[{t:this.instance_4}]},19).to({state:[{t:this.instance_4}]},26).to({state:[]},1).wait(43));
	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(21).to({_off:false},0).to({scaleX:0.08,scaleY:0.08,skewX:180},26).to({_off:true},1).wait(43));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-311.2,-415.5,347.2,154);


(lib.Symbol11copy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"idle":0,"walk":1,"flyaway":2,"throw":56});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
	}
	this.frame_48 = function() {
		this.stop();
	}
	this.frame_90 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(47).call(this.frame_48).wait(42).call(this.frame_90).wait(1));

	// Layer 1
	this.formica = new lib.Symbol31copy4();
	this.formica.name = "formica";
	this.formica.parent = this;
	this.formica.setTransform(-183.8,-21.6,1,1,0,0,0,103.2,69);

	this.f1 = new lib.serpicopy4();
	this.f1.name = "f1";
	this.f1.parent = this;
	this.f1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.formica}]}).to({state:[{t:this.f1}]},1).to({state:[]},1).wait(89));

	// Layer_15
	this.instance = new lib.Tween6("synched",0);
	this.instance.parent = this;
	this.instance.setTransform(-151.4,-108.3);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.bamboose = new lib.uuu();
	this.bamboose.name = "bamboose";
	this.bamboose.parent = this;
	this.bamboose.setTransform(-232.6,-120.4);
	this.bamboose._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(16).to({_off:false},0).to({alpha:1},3).to({startPosition:0},2).to({_off:true},1).wait(69));
	this.timeline.addTween(cjs.Tween.get(this.bamboose).wait(56).to({_off:false},0).to({x:-134.4},8).to({x:-69.3},5).to({x:0.8},5).to({x:78.3},5).to({x:168.8},5).to({x:295.4},5).to({_off:true},1).wait(1));

	// Layer 16
	this.instance_1 = new lib.Symbol4();
	this.instance_1.parent = this;
	this.instance_1.setTransform(-136,-133.7,1,1,0,0,0,143.1,131.2);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DBE2D2").s().p("A12gVQgTw/gKhZQgDgOAAgxQAAgxADAAIVHADQU9ACCTgHIAFR6QAFQ1AECoIAFDEQirAE0BAPIhQABIAAgBIgBg4IAAgCIgBgLIgBgEIgEgIIgwADIgkADQgCABABAFQAAABAAABQAAABABAAQAAABAAAAQAAAAAAAAIAAADIADBAQxMAMhcADQABkYgSwdg");
	this.shape.setTransform(-136,-133.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E4D0D1").s().p("AybIPQgThtAAiaIgKiWQgQlWgJkBQgKligIhCQgCgPAAgnIAAgBQABgnADgDQIqhIIkgmQQ9hEC8AoIBeO4IAVEGQADIcAFDqIABAtIAFCpQhMAglxAkIlJAGImZAFIhEABIAAAAIgHgqIAAgCIgCgIIgCgDIgDgGIgpACIggACQgBABAAAEIABADIAAACQgEAOgCAiIlJAEIAAAAIhegNIgEAAIgTgDIgHgBIgQgCIhcABIhEACIgLABIgHABIgFABQg3AFgsAMIj1AFQg8iaginbg");
	this.shape_1.setTransform(-139.2,-118.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#EDBECF").s().p("AvHJJQgkhIADiLQgKg4gIhDQgXkIgNjyQgKkXgKhPQgCgOgBgfIAAAAQADgeAEgFQGtiSGohNQM8iLDmBYQBbFhBbGVIArDbQACGGAFEMIACAoIADCOQgxA8j1BDQiAACiTAFIlWAFIg6ABQgHgQgGgMIgBgBIgDgFIgCgCIgDgEIgjABIgbABIgBAEIAAACIgBABQgGAJgGAXIkYAEIAAAAQghgQgegMIgDgBIgNgFIgEgCQgGgDgGgBIhOACIg5ACQgFAAgDADQgBAAAAABQgBAAAAAAQAAAAgBABQAAAAgBAAIgDABQglAKgdAXIjRAEQh6hmg4k7g");
	this.shape_2.setTransform(-142.5,-103.3);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#F6ABCE").s().p("Ar0KDQg0giAFh8QgNgqgMg2Qgfi7gQjiQgLjNgLhaIgEglQAFgUAFgHQEvjdEshzQI9jSEOCHQCIDmCGFOIBACyQACDuAHEuIABAjIADByQgYBah4BhQhrADhzAFIkSAGIgvABQgKgIgKgGIAAgBIgEgDIgCgBIgEgCIgcABIgWABIgCABIgBABIgBABQgKAFgJAMIjnADIgBAAQgRgYgPgSIgCgBIgGgJIgDgDQgEgEgEgCIg+ADIgwACQgCABgCAEIgBADIgCACQgSANgNAjIiuADQi3gxhQicg");
	this.shape_3.setTransform(-145.8,-88.3);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FF99CC").s().p("AphJQQhAhjgbkjQgNiTgOhwQLkzfK5ShQABBZAIFPIAJFrQhWADhRAGQiFAGmSAFIAAgBIgCg4IAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABAAAFQAAABABABQAAABAAAAQAAABAAAAQABAAAAAAIAAADIACBAQljAEiCAFIgEAAQhCAAAIhqg");
	this.shape_4.setTransform(-148.7,-72.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#EB77A3").s().p("AnAKrIgLgDQgfgFg3hEQg4hDgIgrQhUhFgRikQgRijAPidIAAgBQCqmXDgiXQDtihDrBFQDDAyC0DLQBMBVBFB6QAZBsASCYQATCZh1DUQh1DUg8AXQhlAmicAdIhRAPIAAgBQgIgRgIgMIgBgBIgEgFIgCgCQgCgEgCAAIguAIIgiAHQgBABgBAEIAAADIgBACQgHANgGAcIAAAEIgJgEIAAAAIgHgDIgDgBIgGgDIgtACIgjABIgFACIgBABIgCABQgJABgJAIQjDgUhngZg");
	this.shape_5.setTransform(-150.2,-77.7);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#D8557A").s().p("AlyKgIgFgCIgGgDQgmgUgvg3Qgzg5gYgxQgOgPgNgSQg7hTgdhvQgviigGiXIAAgBQBumoDbiWIAPgKQDYiODZASQAVABAVADQC6AZClCSQAXAUAWAXQBNBTA+CDQAiBtAYCVQAEAaADAbQgBBUgmB9QgQA0geA8QhHCOhMBfQgKALgJAIQhQBCh6AxIgYAKQgjAPgoAOIAAgBQgMgEgMgCIgBgBIgFgBIgBAAIgGgBIgrAOIgiALQgCABgCADIgCACIgCACQgMALgNAQIAAAAIgBAAIgFgHIAAAAIgCgEIAAAAIgBgBIgCgCIgCgEIgCgCIgFgDIgiABIgJABIgaABIgFABIgCABIAAAAIgBACIgBABIgBACIgBACQgCACgDAIIgGAHQipgshlgzg");
	this.shape_6.setTransform(-150.5,-82.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#C43250").s().p("AkmKTQh2hchRh9QiqkJgnjkQA3nGDfiSQDfiTDigJQDigKC8COQC7CNBNGvQABBNgeCIQgeCJiWDpQhHBuh0BSQhmBHigBCIgCgXIAAgBIgBgKIgBgDIgDgHIgqADIghACQgBABABAEQAAABAAABQAAAAABABQAAAAAAAAQAAABAAAAIAAACQABADABAZQiahEhqhSg");
	this.shape_7.setTransform(-151.2,-88);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#C43250").s().p("AlIMKQiEhshaiVQi9k4gskNQA9oZD5itQD5itD8gLQD8gLDRCmQDRCnBWH+QABBbghChQgiCiinESQhPCDiCBgQhxBVizBNIgCgbIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABAAAFQABABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABADABAfQishRh2hhg");
	this.shape_8.setTransform(-151.1,-102.6);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#C43250").s().p("AAwPYIAAgCIgBgLIgBgEIgDgIIgvADIglADQgBABABAFQAAABAAABQAAABAAAAQAAABABAAQAAAAAAAAIAAADQABAGg/giQhGgnhLgzQjfiWhQiFQi9k4gskNQgEosEnjYQEmjYD9AIQD+AHDZDiQDaDiAoHLQABBagtCiQgtCiiIDEQiIDEh5BdQh6BdhFAiQgzAagKAAQAAAAgBAAQAAgBAAAAQgBAAAAAAQAAAAAAgBg");
	this.shape_9.setTransform(-151.2,-108.2);

	this.f1_1 = new lib.serpicopy3();
	this.f1_1.name = "f1_1";
	this.f1_1.parent = this;
	this.f1_1.setTransform(-116.2,26.4,1,1,0,0,0,128.8,38.6);
	this.f1_1._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1}]},2).to({state:[{t:this.instance_1}]},6).to({state:[{t:this.shape}]},1).to({state:[{t:this.shape_1}]},1).to({state:[{t:this.shape_2}]},1).to({state:[{t:this.shape_3}]},1).to({state:[{t:this.shape_4}]},1).to({state:[{t:this.shape_5}]},1).to({state:[{t:this.shape_6}]},1).to({state:[{t:this.shape_7}]},1).to({state:[{t:this.shape_8}]},1).to({state:[{t:this.shape_9}]},1).to({state:[]},1).to({state:[{t:this.f1_1}]},37).to({state:[{t:this.f1_1}]},8).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[{t:this.f1_1}]},5).to({state:[]},1).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({_off:false},0).to({alpha:1},6).to({_off:true},1).wait(82));
	this.timeline.addTween(cjs.Tween.get(this.f1_1).wait(56).to({_off:false},0).to({x:-17.8},8).to({x:47.2},5).to({x:117.2},5).to({x:194.7},5).to({x:285.2},5).to({x:412.2},5).to({_off:true},1).wait(1));

	// Layer 17
	this.bamboos = new lib.uuu();
	this.bamboos.name = "bamboos";
	this.bamboos.parent = this;
	this.bamboos.setTransform(-232.6,-120.4);

	this.instance_2 = new lib.Tween6("synched",0);
	this.instance_2.parent = this;
	this.instance_2.setTransform(-151.4,-108.3);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.bamboos}]},2).to({state:[]},6).to({state:[{t:this.instance_2}]},13).to({state:[{t:this.instance_2}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(21).to({_off:false},0).to({y:-438.3},27).to({_off:true},1).wait(42));

	// Layer_11
	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#383A35").s().p("AgCBSQgNAAgJgKQgJgKABgNQADgxAAgxQAAgOAKgJQAJgJAMAAQANAAAJAJQAKAJAAAOQAAAygEA0QAAANgKAJQgJAHgLAAIgCAAg");
	this.shape_10.setTransform(-31,6.6);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F5F5F5").s().p("AhSBkQgmgwAAhLIAAgLIAAgCIAFgQIAKgdQAVgxAhgLQAJgDAKAAQA+AAAsAqQATASALAWQARAiAAAsQAAAegKAbQgHAOgJANQgNARgQALQgaARgjAAQgyAAglgtg");
	this.shape_11.setTransform(-38.2,5.2);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#4F7222").s().p("AhUCJQhGg9AAhdQAAhEAhg1IACgDQAHgKAIgJIAIgGQAegTAnAAQA7AAAzAuQAxAsAUBbIADAWIAAALQAABAggAsQgjAxg7AAQg4AAg5gxgAgpiZQghALgVAwIgKAdIgFARIAAABIAAAMQAABLAmAwQAlAsAyAAQAjAAAagQQAQgLANgRQAJgNAHgPQAKgaAAgfQAAgrgRgiQgLgXgTgSQgsgpg+AAQgKAAgJADg");
	this.shape_12.setTransform(-39.2,6.4);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#383A35").s().p("AgPA2QgIgIAAgKIAAhHQAAgLAIgGQAGgHAJAAQAKAAAHAHQAHAGAAALIAABHQAAAKgHAIQgHAGgKAAQgJAAgGgGg");
	this.shape_13.setTransform(-11.8,4.5);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#EEEEEE").s().p("AACB9Qg8gLgThPQgLgsAHgpQACgNAFgNQAHgUAMgMIAGgEQATgSAVAGQA1APAZA2QAZA1gPA5QgKAlgPARQgPARgYAAIgNgBg");
	this.shape_14.setTransform(-17.2,1.9);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#77A63B").s().p("AkdCvIgOgDQACgWAKgoQARhDAcg5QBWirCPAAQCRAABjCiQAsBJAZBXIgEAAQjsAxikAAQhzAAhCgLg");
	this.shape_15.setTransform(-32.4,15.3);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#A32B2B").s().p("AgMAyQgdACgXgkQgPgWgMgFQgHgCgDgGQgDgGACgGQACgGAFgDQAGgEAHACQAVAFAYAlQAMARANABIAJgFIABAAIAGgFQAVgKAMgIIABgEIAJgZQACgGAGgDQAGgCAHACQAFACADAGQADAGgCAHIgJAXIAcAOQAGADACAGQABAGgDAGQgDAGgGACQgGACgGgEIghgRIgdARIAAgBIgHAFIgBAAQgSAJgFAAIAAAAg");
	this.shape_16.setTransform(2.3,30.1);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#4F7222").s().p("AgbAaQgHgCgDgGIgEgHQgGgFAAgGQAAgHAGgDQADgGAIAAQAGAAAFAGQAEADAGAJQADAGgCAHQgBAGgGADQgEACgEAAIgEAAgAAVAMQgFgEAAgHIAAgKQAAgHAFgEQAEgFAHAAQAHAAAEAFQAFAEAAAHIAAAKQAAAHgFAEQgEAFgHAAQgHAAgEgFg");
	this.shape_17.setTransform(-24.9,11.6,1,1,0,0,0,-14,-13.6);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#E0DE39").s().p("AGnCbIgXAAIgCAAIgPgBIgCAAIgKAAIgMgBIgTgBIAGgqIAEgkIAAgCQAPhhAVg7IARABIADAAIAFAAIAJAAIALAAIACAAIAQAAIAZAAQgRBFgGBPQgCAbgCAdIgBAiIgXAAgAGaA+IABAAIgBgBgAneCJIgBgUIgBgkQAAhYAQgyIAOgfIAOgBIAPgBIAFAAIALgBIAQgCIANgCIgEASQgLAtABA7QAAAXACAsIABADIAAABIAAALIAEAlIgGABIgDAAIgYACIgbACIghABIgCgPgAs6B2IABgDIgEgBQgXgKgTgMIALgjQAohzAzg2IACABIACAAIAjAHIAkAGQg0AygoBhQgKAUgHAWIgKAfIgNgEgAA3BlIgigDIgPAAIgCAAIgPgBIgFAAIgHg4IgHgkQgQhRgZg/IAqgCIAEAAIASAAIAWAAIACAAIAWABQAHAeAFAqQAHAzAEAzIAAAKIACA8IgJgDgAhjBmIADAAIgDAAgALkASIgMgUQgkhAgKgqIgCgPIAEgBIAKgDIAdgLQAAgCAGgDIAPgGIAAABIALgGQAaBAAeA2QAUAiAWAeIATAZIgCABIgKAGIgSAMIAAAAIgBAAIgBABIgKAGIgLAFIgDACIgTAKQgeghgbgtgAqtg9IABAAIgCABg");
	this.shape_18.setTransform(-148.2,49.6);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#77A63B").s().p("AFiDdQABgdADgbQAGhQAQhGIAwgEQA2gGAygMIAPgEIAfgJIAJgDIACAOQAKAqAkA/IAMAWQAaAtAfAhQgWAKgQAFIgBAAIgFABIgLADQhBAShGAKIgYADQglAEglACIg/ADIABgigApiD9IgPAAIgKAAIgDAAQhbgBhYgOIAAAAIgHgBIgOgCIgogIIgUgEIgEAAIgFgBIALgfQAHgWAJgUQAphiA0gyIAQACIADABIACAAQAtAFAyADQAcACAbAAIAHAAIACAAIAEAAIABAAIAZgBIAagBIAIgBIgOAeQgRAzAABZIACAjIABAVIACAPIgWABIgIAAIgDAAIgGAAIgCAAgAsLAnIACgBIgBAAgACyD0IgEAAIgHgBIgFgBIgEAAIgEgBQgWgEgcgGIgzgLQg0gMgcgFIgBAAIgCg7IAAgLQgEgzgHgzQgGgpgGgeQA6ACA3AJIAAAAQAoAGBJARIA/ANIAJABIAIABIAHABIAhAEQgVA8gPBiIAAACIgFAkIgFAqQgjgDgigFgAngDRIAAgLIAAgCIgBgCQgDgsAAgXQAAg9AKgsIAFgSIBTgNIAAAAQBZgQAmgFIAOgCIAAAAIAVgCIAKgBIAZgDIAZgBQAZA+AQBSIAGAjIAIA5IgBAAIgKAAQghABgkAEIgDAAIAAAAIgJABIgBABIgEAAIgFABQggAFhAALIgBAAQhVAPg0AGIgBAAIgeAEIgEglgAvOC5IgBgBIgCgBQgJgGgIgIQhCg4AAhFQAAgUADgLIABgFQACgGADgCIABgCIACgEIgCgBIACgOIACgFQACgGACgCIAEgHIAAgBIACgBIAFgDIABgBIADgBIABgBQAOgGAUAAQAWAAAOAHIAPAKQAHADAcAJIALAEIAGADIAYAGIACABIABAAQgzA0gpB1IgKAjIgKgHgAL4CAQgWgfgUgiQgfg2gZg/IAzggQArgdANgTQATgcARgjIACgFQAdgRAigMQBCgXA+AAQAkAAAbAIIAACtIgIAFIgBAAIgCACQg+AshHA8IhLBCIgNAMIgPAMIgIAGIgDACIAAAAIgIAFIgEADIgMAJIgTgZgAL6A1IAGgCIgBgBIgFADg");
	this.shape_19.setTransform(-138.9,39.6);

	this.instance_3 = new lib.Symbol2();
	this.instance_3.parent = this;
	this.instance_3.setTransform(-245,-12.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_19},{t:this.shape_18},{t:this.shape_17},{t:this.shape_16},{t:this.shape_15},{t:this.shape_14},{t:this.shape_13},{t:this.shape_12},{t:this.shape_11},{t:this.shape_10}]},2).to({state:[{t:this.instance_3}]},6).to({state:[{t:this.instance_3}]},13).to({state:[{t:this.instance_3}]},27).to({state:[]},1).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(8).to({_off:false},0).wait(13).to({y:-342.2},27).to({_off:true},1).wait(42));

	// Layer_18
	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("rgba(0,0,0,0.498)").s().p("Av7ALQgQgDAOgRQA7hIByATQDzApD3gPQESgREOgTQGwgUGSBeQAQAEgNANQkeAQkeAHQi+gGi+AUQjIAUjGAAQlgAAlUhBg");
	this.shape_20.setTransform(-143.7,62.1);

	this.instance_4 = new lib.Tween8("synched",0);
	this.instance_4.parent = this;
	this.instance_4.setTransform(-143.7,62.1);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.shape_20}]},2).to({state:[{t:this.instance_4}]},19).to({state:[{t:this.instance_4}]},26).to({state:[]},1).wait(43));
	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(21).to({_off:false},0).to({scaleX:0.08,scaleY:0.08,skewX:180},26).to({_off:true},1).wait(43));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-311.2,-595.5,347.2,334);


// stage content:
(lib.ella = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
		this.bg.cache(0,0,960,600);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 6
	this.formica2 = new lib.Symbol11copy3();
	this.formica2.name = "formica2";
	this.formica2.parent = this;
	this.formica2.setTransform(296.3,-50.2,1,1,0,0,0,1.3,-300.4);

	this.timeline.addTween(cjs.Tween.get(this.formica2).wait(1));

	// Layer 2
	this.formica3 = new lib.Symbol11copy2();
	this.formica3.name = "formica3";
	this.formica3.parent = this;
	this.formica3.setTransform(296.3,-50.2,1,1,0,0,0,1.3,-300.4);

	this.timeline.addTween(cjs.Tween.get(this.formica3).wait(1));

	// Layer 3
	this.formica1 = new lib.Symbol11copy4();
	this.formica1.name = "formica1";
	this.formica1.parent = this;
	this.formica1.setTransform(296.3,-50.2,1,1,0,0,0,1.3,-300.4);

	this.timeline.addTween(cjs.Tween.get(this.formica1).wait(1));

	// Layer_7
	this.formica4 = new lib.Symbol11copy();
	this.formica4.name = "formica4";
	this.formica4.parent = this;
	this.formica4.setTransform(296.3,-50.2,1,1,0,0,0,1.3,-300.4);

	this.timeline.addTween(cjs.Tween.get(this.formica4).wait(1));

	// Layer 5
	this.bg = new lib.Symbol1();
	this.bg.name = "bg";
	this.bg.parent = this;

	this.timeline.addTween(cjs.Tween.get(this.bg).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(463.8,-45.3,1007.5,959.5);
// library properties:
lib.properties = {
	id: 'PAQUITO_FOREVER_I_LOVE_YOU_ORNOT',
	width: 960,
	height: 600,
	fps: 25,
	color: "#FFFFFF",
	opacity: 1.00,
	manifest: [
		{src:"data/imgs/balloon.png", id:"balloon"}
	],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['PAQUITO_FOREVER_I_LOVE_YOU_ORNOT'] = {
	getStage: function() { return exportRoot.getStage(); },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}



})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;