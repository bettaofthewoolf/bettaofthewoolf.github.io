function onShowDiv()
{
	//document.getElementById("showDiv").hidden = false;
}

function onVideoEnded()
{
	if(presentationPlayer)
		presentationPlayer.destroy();
	
	if(speackerPlayer)
		speackerPlayer.destroy();
	
	window.onbeforeunload = null;
	
	if(isRedirrect())
		window.location = redirrectUrl();
}

function onStart()
{
	mouseKeeper(document.getElementById("presentationPlayer"));
	mouseKeeper(document.getElementById("speackerPlayer"));
	
	onDocumentResize();
}

window.onresize = onDocumentResize;

function mouseKeeper(element)
{
	element.addEventListener('mouseup', blockmouse);
	element.addEventListener('mousedown', blockmouse);
	element.addEventListener('mousemove', blockmouse);

	element.onclick = blockmouse;
	element.oncontextmenu = blockmouse;
	element.ondblclick = blockmouse;
	element.onmousedown = blockmouse;
	element.onmouseenter = blockmouse;
	element.onmouseleave = blockmouse;
	element.onmousemove = blockmouse;
	element.onmouseover = blockmouse;
	element.onmouseout = blockmouse;
	element.onmouseup = blockmouse;
	element.onkeydown = blockmouse;
	element.onkeypress = blockmouse;
	element.onkeyup = blockmouse;
	element.onscroll = blockmouse;
}

function blockmouse(e)
{
	if(e)
	{		
		e.preventDefault();
		e.stopImmediatePropagation();
	}	
	
	return
}

function onDocumentResize()
{
	if(document.getElementById("presentationPlayer") != null)
		resizeElement(document.getElementById("presentationPlayer"), presentationPlayer, 68, 88, -10, 0);
	//resizeElement(document.getElementById("speackerPlayer"), 68, 90);
}

function resizeElement(documentElement, player, wSizeRait, hSizeRait, wPadding, hPadding) 
{
	var w = window;
	var d = document;
	var e = d.documentElement;
	var g = d.getElementsByTagName('body')[0];
	
	var screenWidth = w.innerWidth || e.clientWidth || g.clientWidth;
	var screenHeight = w.innerHeight|| e.clientHeight|| g.clientHeight;
	
	screenWidth *= wSizeRait / 100;
	screenHeight *= hSizeRait / 100;
	
	screenWidth += wPadding;
	screenHeight += hPadding;
	
	var documentElementWidth = getVideoWidth();
	var documentElementHeight = getVideoHeight();
	
	var ratio = 0;
	
	var isWidthScaling = screenWidth < screenHeight;
	
	if(isWidthScaling)
		ratio = screenWidth / documentElementWidth;
	else
		ratio = screenHeight / documentElementHeight;
		
	documentElementWidth *= ratio;
	documentElementHeight *= ratio;
	
	if(!isWidthScaling)
	{
		if(documentElementWidth > screenWidth)
		{
			ratio = screenWidth / documentElementWidth;
			documentElementWidth *= ratio;
			documentElementHeight *= ratio
		}
	}
	
	
	documentElement.style.height = toPx(documentElementHeight);
	documentElement.style.width = toPx(documentElementWidth);
	
	documentElement.width = documentElementWidth;
	documentElement.height = documentElementHeight;
	
	if(player != null)
		player.setSize(documentElementWidth, documentElementHeight);
}

function toPx(value)
{
	return value + "px";
}

var md = new MobileDetect(window.navigator.userAgent);

var isMobile = false;
if(md.mobile())
	isMobile = true;
	
if(isMobile)
{
	document.getElementById("presentationPlayer").style = "pointer-events: none; opacity: 0.4;"
	document.getElementById("speackerPlayer").style = "pointer-events: none; opacity: 0.4;"
	document.getElementById("palyButton").onclick = onPlayClick;
}

function onPlayClick()
{
	initialize();
	
	document.getElementById("presentationPlayer").style = "pointer-events: none;"
	document.getElementById("speackerPlayer").style = "pointer-events: none;"
	document.getElementById("palyButton").hidden = true;
}

window.onbeforeunload = function (event) 
{
	var message = 'Вы уверены, что хотите покинуть страницу трансляции? После этого Вы не сможете зайти в неё повторно!';
	
	if (typeof event == 'undefined') 
	{
		event = window.event;
	}
	
	if (event) 
	{
		event.returnValue = message;
	}
	
	return message;
}

var startTime;

function initVideo(_startTime)
{
	var tag = document.createElement('script');
	tag.src = "https://www.youtube.com/player_api";
	var firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
	
	startTime = _startTime;
}

var presentationPlayer;
var speackerPlayer;
var startAppCallback;

function onYouTubePlayerAPIReady() 
{
	speackerPlayer = new YT.Player
	(
		'speackerPlayer', 
		{
			width: '640',
			height: '380',
			
			
			playerVars: {
				color: 'white',
				controls: '0',
				autohide:'1',
				disablekb:'1',
				showinfo:'0',
				autoplay: '1',
			}
		}
	);
	
	presentationPlayer = new YT.Player
	(
		'presentationPlayer', 
		{
			width: getVideoWidth(),
			height: getVideoHeight(),
			
			
			playerVars: {
				color: 'white',
				controls: '0',
				autohide:'1',
				disablekb:'1',
				showinfo:'0',
			},
			
			events: {
				onStateChange: onPlayerStateChange,
				onReady: initialize
			}
		}
	);
}

function onPlayerStateChange(event)
{
	//console.log("##################");
	//console.log(event.data);
	
	if(event.data == YT.PlayerState.BUFFERING)
	{
		presentationPlayer.pauseVideo();
		speackerPlayer.pauseVideo();
		//var duration = presentationPlayer.getDuration() - presentationPlayer.getCurrentTime();
		//setTimeout(onVideoEnded, duration * 1000 - 1000);
	}
	else if(event.data == YT.PlayerState.PLAYING)
	{
		setTimeout(onShowDiv, showDivDelay());
	}
	else if(event.data == YT.PlayerState.ENDED)
	{
		onVideoEnded();
	}
}

function addStartCallback(value)
{
	startAppCallback = value;
}

function initialize()
{
	var preloaderElements = getElementsByClassName(document, "preloaderView");
	
	for(var i = 0; i < preloaderElements.length; i++)
		preloaderElements[i].hidden = false;
		
	startAppCallback();
	
	setTimeout(onVideoReady, videoLoadingDelay());
	
	presentationPlayer.loadVideoById({
								'videoId': 'XdqF-KPn9So',
								'startSeconds': startTime,
								//'endSeconds': 60,
								'suggestedQuality': 'default'});
								
	presentationPlayer.setVolume(getStartVolume());
	
	speackerPlayer.loadVideoById({
							'videoId': 'ZDgXHUTPpUQ',
							'startSeconds': startTime,
							//'endSeconds': 60,
							'suggestedQuality': 'default'});
							
	speackerPlayer.setVolume(getStartVolume());
	
	presentationPlayer.hidden = true;
	speackerPlayer.hidden = true;
}

function onHidePreloader()
{
	var preloaderElements = getElementsByClassName(document, "preloaderView");
	
	for(var i = 0; i < preloaderElements.length; i++)
		preloaderElements[i].hidden = true;
		
	presentationPlayer.hidden = false;
	speackerPlayer.hidden = false;
	
	onStart();
}

function onVideoReady()
{		
	presentationPlayer.playVideo();
	speackerPlayer.playVideo();
		
	setTimeout(onHidePreloader, videoWatermarkHideDelay());
}

function getElementsByClassName(node,classname) {
  if (node.getElementsByClassName) { // use native implementation if available
    return node.getElementsByClassName(classname);
  } else {
    return (function getElementsByClass(searchClass,node) {
        if ( node == null )
          node = document;
        var classElements = [],
            els = node.getElementsByTagName("*"),
            elsLen = els.length,
            pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)"), i, j;

        for (i = 0, j = 0; i < elsLen; i++) {
          if ( pattern.test(els[i].className) ) {
              classElements[j] = els[i];
              j++;
          }
        }
        return classElements;
    })(classname, node);
  }
}