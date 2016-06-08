(function (console, $global) { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var events_Observer = function() {
	this.describes = new haxe_ds_StringMap();
};
events_Observer.__name__ = true;
events_Observer.prototype = {
	addEventListener: function(type,callback) {
		var callbackList = this.describes.get(type);
		if(callbackList == null) {
			callbackList = [];
			{
				this.describes.set(type,callbackList);
				callbackList;
			}
		}
		callbackList.push(callback);
	}
	,dispatchEvent: function(event) {
		var callbackList = this.describes.get(event.type);
		if(callbackList != null) {
			var _g = 0;
			while(_g < callbackList.length) {
				var callback = callbackList[_g];
				++_g;
				callback(event);
			}
		}
	}
	,__class__: events_Observer
};
var DateCorrectionTool = function() {
	events_Observer.call(this);
};
DateCorrectionTool.__name__ = true;
DateCorrectionTool.__super__ = events_Observer;
DateCorrectionTool.prototype = $extend(events_Observer.prototype,{
	correct: function() {
		this.correctBy(this.getPath());
	}
	,getPath: function() {
		var currentLocation = window.location.href;
		if(currentLocation.indexOf("bettaofthewoolf") != -1 || currentLocation.indexOf("localhost") != -1) return "http://murigin.ru/auto/utc_time.php"; else return "utc_time.php";
	}
	,correctBy: function(path) {
		var dataLoader = new external_DataLoader();
		dataLoader.addEventListener("onLoad",$bind(this,this.onDataLoad));
		dataLoader.load(path);
	}
	,onDataLoad: function(e) {
		var dataParts;
		if(e.data.indexOf("\r\n") != -1) dataParts = e.data.split("\r\n"); else dataParts = e.data.split("\n");
		var correction = parseFloat(dataParts[0]) * 1000;
		StableDate.correct(correction);
		Settings.getInstance().TODAY_MONTH = Std.parseInt(dataParts[2]);
		Settings.getInstance().TODAY_DAY = Std.parseInt(dataParts[3]);
		Settings.getInstance().TODAY = parseFloat(dataParts[1]) * 1000;
		haxe_Log.trace(dataParts[0],{ fileName : "DateCorrectionTool.hx", lineNumber : 55, className : "DateCorrectionTool", methodName : "onDataLoad"});
		haxe_Log.trace(Settings.getInstance().TODAY_MONTH,{ fileName : "DateCorrectionTool.hx", lineNumber : 56, className : "DateCorrectionTool", methodName : "onDataLoad"});
		haxe_Log.trace(Settings.getInstance().TODAY_DAY,{ fileName : "DateCorrectionTool.hx", lineNumber : 57, className : "DateCorrectionTool", methodName : "onDataLoad"});
		haxe_Log.trace(Settings.getInstance().TODAY,{ fileName : "DateCorrectionTool.hx", lineNumber : 58, className : "DateCorrectionTool", methodName : "onDataLoad"});
		this.dispatchEvent(new events_Event("complete"));
	}
	,__class__: DateCorrectionTool
});
var EntryPoint = function() { };
EntryPoint.__name__ = true;
EntryPoint.main = function() {
	haxe_Log.trace(EntryPoint.main,{ fileName : "EntryPoint.hx", lineNumber : 9, className : "EntryPoint", methodName : "main", customParams : [EntryPoint.main]});
	EntryPoint.onStart();
};
EntryPoint.onStart = function() {
	var dateCorrectionTool = new DateCorrectionTool();
	dateCorrectionTool.addEventListener("complete",EntryPoint.onCorrectionComplete);
	dateCorrectionTool.correct();
};
EntryPoint.onCorrectionComplete = function(e) {
	new Main();
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.dateStr = function(date) {
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var h = date.getHours();
	var mi = date.getMinutes();
	var s = date.getSeconds();
	return date.getFullYear() + "-" + (m < 10?"0" + m:"" + m) + "-" + (d < 10?"0" + d:"" + d) + " " + (h < 10?"0" + h:"" + h) + ":" + (mi < 10?"0" + mi:"" + mi) + ":" + (s < 10?"0" + s:"" + s);
};
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) return undefined;
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(pos != null && pos != 0 && len != null && len < 0) return "";
	if(len == null) len = s.length;
	if(pos < 0) {
		pos = s.length + pos;
		if(pos < 0) pos = 0;
	} else if(len < 0) len = s.length + len - pos;
	return s.substr(pos,len);
};
var Main = function() {
	var passKeyChecker = new passkey_PassKeyChecker();
	passKeyChecker.addEventListener("checkIsOk",$bind(this,this.onKeyValidationPass));
	passKeyChecker.addEventListener("keyCorrupted",$bind(this,this.onKeyCorrupted));
	passKeyChecker.addEventListener("eventEnd",$bind(this,this.onKeyIsOutDate));
	passKeyChecker.addEventListener("waiingForKey",$bind(this,this.onWaitingForKey));
	passKeyChecker.check();
	addStartCallback($bind(this,this.startApp));
};
Main.__name__ = true;
Main.prototype = {
	onWaitingForKey: function(e) {
		this.initView();
		this.showWaitingState();
	}
	,onKeyCorrupted: function(e) {
		throw new js__$Boot_HaxeError("pass key is corrupted");
	}
	,onKeyIsOutDate: function(e) {
		this.initView();
		this.showEndState();
	}
	,onKeyValidationPass: function(e) {
		this.initView();
		this.initVideo();
	}
	,initView: function() {
		this.mainViewModel = new view_data_MainViewModel();
		this.mainView = new view_MainView(this.mainViewModel);
		var namesListLoader = new external_DataLoader();
		namesListLoader.addEventListener("onLoad",$bind(this,this.onNamesListLoaded));
		namesListLoader.load("usersList.txt");
	}
	,initVideo: function(e) {
		var currentTime = StableDate.currentTime;
		var videoStartTime = (currentTime - Settings.getInstance().START_TIME) / 1000;
		if(videoStartTime < 0) videoStartTime = 0;
		initVideo(videoStartTime);
	}
	,showEndState: function() {
		window.document.getElementById("eventEnd").hidden = false;
		this.mainView.hideAll();
		onVideoEnded();
	}
	,showWaitingState: function() {
		this.mainView.waitingState();
		this.mainView.waitingScreen.addEventListener("waitingEnd",$bind(this,this.initVideo));
	}
	,startApp: function() {
		this.mainView.appState();
	}
	,onNamesListLoaded: function(e) {
		var data = e.data;
		var namesList;
		if(data.indexOf("\r\n") != -1) namesList = data.split("\r\n"); else namesList = data.split("\n");
		namesList.sort($bind(this,this.sortOnTime));
		this.mainViewModel.userNamesList = namesList;
		this.mainViewModel.addUser("Вы",true);
		this.mainView.start();
		new chatManagment_ChatController(this.mainViewModel);
	}
	,sortOnTime: function(x,y) {
		if(Math.random() > 0.5) return 1; else return -1;
	}
	,__class__: Main
};
Math.__name__ = true;
var Settings = function() {
	this.START_TIME = 0;
};
Settings.__name__ = true;
Settings.getInstance = function() {
	if(Settings._instance == null) Settings._instance = new Settings();
	return Settings._instance;
};
Settings.prototype = {
	__class__: Settings
};
var haxe_Timer = function(time_ms) {
	var me = this;
	this.id = setInterval(function() {
		me.run();
	},time_ms);
};
haxe_Timer.__name__ = true;
haxe_Timer.prototype = {
	stop: function() {
		if(this.id == null) return;
		clearInterval(this.id);
		this.id = null;
	}
	,run: function() {
	}
	,__class__: haxe_Timer
};
var StableDate = function() {
	if(!StableDate.isInit) StableDate.updateTimer.run = StableDate.advanceTime;
};
StableDate.__name__ = true;
StableDate.correctBy = function(path) {
	var dataLoader = new external_DataLoader();
	dataLoader.addEventListener("onLoad",StableDate.onDataLoad);
	dataLoader.load(path);
};
StableDate.onDataLoad = function(e) {
	var correction = parseFloat(e.data);
	StableDate.correct(correction);
};
StableDate.advanceTime = function() {
	if(StableDate.lastTime == -1) {
		StableDate.lastTime = new Date().getTime();
		StableDate.currentTime += 500;
	} else {
		var newTime = new Date().getTime();
		var delta = newTime - StableDate.lastTime;
		if(delta > 2000) {
			haxe_Log.trace("time error too much",{ fileName : "StableDate.hx", lineNumber : 42, className : "StableDate", methodName : "advanceTime", customParams : [delta]});
			delta = 500;
		} else if(delta < 0) {
			haxe_Log.trace("time error too low",{ fileName : "StableDate.hx", lineNumber : 47, className : "StableDate", methodName : "advanceTime", customParams : [delta]});
			delta = 500;
		}
		StableDate.currentTime += delta;
		StableDate.lastTime = newTime;
	}
	var d = new Date();
	d.setTime(StableDate.currentTime);
	StableDate.internalDate = d;
};
StableDate.correct = function(time) {
	if(!StableDate.isInit) StableDate.updateTimer.run = StableDate.advanceTime;
	StableDate.currentTime = time;
	var d = new Date();
	d.setTime(StableDate.currentTime);
	StableDate.internalDate = d;
};
StableDate.prototype = {
	getDate: function() {
		return StableDate.internalDate.getDate();
	}
	,getDay: function() {
		return StableDate.internalDate.getDay();
	}
	,getFullYear: function() {
		return StableDate.internalDate.getFullYear();
	}
	,getHours: function() {
		return StableDate.internalDate.getHours();
	}
	,getMinutes: function() {
		return StableDate.internalDate.getMinutes();
	}
	,getMonth: function() {
		return StableDate.internalDate.getMonth();
	}
	,getSeconds: function() {
		return StableDate.internalDate.getSeconds();
	}
	,getTime: function() {
		return StableDate.internalDate.getTime();
	}
	,toString: function() {
		return HxOverrides.dateStr(StableDate.internalDate);
	}
	,__class__: StableDate
};
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) v = parseInt(x);
	if(isNaN(v)) return null;
	return v;
};
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.fastCodeAt = function(s,index) {
	return s.charCodeAt(index);
};
var chatManagment_ChatController = function(viewModel) {
	this.chatEvents = [];
	this.viewModel = viewModel;
	this.initialize();
};
chatManagment_ChatController.__name__ = true;
chatManagment_ChatController.prototype = {
	initialize: function() {
		var dataLoader = new external_DataLoader();
		dataLoader.addEventListener("onLoad",$bind(this,this.onDataLoaded));
		dataLoader.load("chat.txt");
		var timer = new haxe_Timer(250);
		timer.run = $bind(this,this.onUpdate);
	}
	,onUpdate: function() {
		if(this.chatEvents.length > 0) {
			var currentMessage = this.chatEvents[0];
			if(currentMessage.time < StableDate.currentTime) {
				this.viewModel.addMessage(currentMessage.name,currentMessage.message);
				this.chatEvents.shift();
			}
		}
	}
	,onDataLoaded: function(e) {
		var chatData = e.data;
		var chatMessages;
		if(chatData.indexOf("\r\n") != -1) chatMessages = chatData.split("\r\n"); else chatMessages = chatData.split("\n");
		var toShow = [];
		chatMessages.reverse();
		var messagesPadding = getMessagesPadding() * 1000;
		var count = 10;
		var _g = 0;
		while(_g < chatMessages.length) {
			var chatMessage = chatMessages[_g];
			++_g;
			var chatMessageParts = chatMessage.split("|");
			var time = chatMessageParts[0];
			var sign = 1;
			if(time.charAt(0) == "-") {
				time = HxOverrides.substr(time,1,time.length);
				sign = -1;
			}
			var timeParts = time.split(":");
			var dateParts = [];
			var hours = Std.parseInt(timeParts[0]);
			var minutes = Std.parseInt(timeParts[1]);
			var seconds = 0;
			if(timeParts.length == 3) seconds = Std.parseInt(timeParts[3]);
			var name = chatMessageParts[1];
			var message = chatMessageParts[2];
			var messageTime = Settings.getInstance().START_TIME + ((hours * 60 + minutes) * 60 + seconds) * 1000 * sign + messagesPadding;
			if(messageTime < StableDate.currentTime && count > 0) {
				count--;
				toShow.unshift(new chatManagment_ChatEventMessage(messageTime,name,message));
			} else if(messageTime > StableDate.currentTime) this.chatEvents.unshift(new chatManagment_ChatEventMessage(messageTime,name,message));
		}
		var _g1 = 0;
		while(_g1 < toShow.length) {
			var chatMessage1 = toShow[_g1];
			++_g1;
			this.viewModel.addMessage(chatMessage1.name,chatMessage1.message,true);
		}
		this.viewModel.dispatchEvent(new view_events_ChatEvent("messageAdd"));
	}
	,formatToTime: function(value) {
		var valueAsString;
		if(value == null) valueAsString = "null"; else valueAsString = "" + value;
		if(valueAsString.length == 1) valueAsString = "0" + valueAsString;
		return valueAsString;
	}
	,sortOnTime: function(x,y) {
		if(x.time > y.time) return 1; else if(x.time < y.time) return -1; else return 0;
	}
	,__class__: chatManagment_ChatController
};
var chatManagment_ChatEventMessage = function(time,name,message) {
	this.message = message;
	this.name = name;
	this.time = time;
};
chatManagment_ChatEventMessage.__name__ = true;
chatManagment_ChatEventMessage.prototype = {
	toString: function() {
		return "[ChatEventMessage time=" + this.time + " name=" + this.name + " message=" + this.message + "]";
	}
	,__class__: chatManagment_ChatEventMessage
};
var events_Event = function(type) {
	this.type = type;
};
events_Event.__name__ = true;
events_Event.prototype = {
	__class__: events_Event
};
var events_DataEvent = function(type,data) {
	events_Event.call(this,type);
	this.data = data;
};
events_DataEvent.__name__ = true;
events_DataEvent.__super__ = events_Event;
events_DataEvent.prototype = $extend(events_Event.prototype,{
	__class__: events_DataEvent
});
var external_DataLoader = function() {
	events_Observer.call(this);
	this.httpRequest = js_Browser.createXMLHttpRequest();
	this.httpRequest.onload = $bind(this,this.onLoadComplete);
};
external_DataLoader.__name__ = true;
external_DataLoader.__super__ = events_Observer;
external_DataLoader.prototype = $extend(events_Observer.prototype,{
	load: function(path) {
		this.httpRequest.open("GET",path,true);
		this.httpRequest.send();
	}
	,onLoadComplete: function() {
		var data = this.httpRequest.responseText;
		this.dispatchEvent(new events_DataEvent("onLoad",data));
	}
	,__class__: external_DataLoader
});
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe__$Int64__$_$_$Int64 = function(high,low) {
	this.high = high;
	this.low = low;
};
haxe__$Int64__$_$_$Int64.__name__ = true;
haxe__$Int64__$_$_$Int64.prototype = {
	__class__: haxe__$Int64__$_$_$Int64
};
var haxe_Log = function() { };
haxe_Log.__name__ = true;
haxe_Log.trace = function(v,infos) {
	js_Boot.__trace(v,infos);
};
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.__name__ = true;
haxe_io_Bytes.alloc = function(length) {
	return new haxe_io_Bytes(new ArrayBuffer(length));
};
haxe_io_Bytes.ofString = function(s) {
	var a = [];
	var i = 0;
	while(i < s.length) {
		var c = StringTools.fastCodeAt(s,i++);
		if(55296 <= c && c <= 56319) c = c - 55232 << 10 | StringTools.fastCodeAt(s,i++) & 1023;
		if(c <= 127) a.push(c); else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.prototype = {
	get: function(pos) {
		return this.b[pos];
	}
	,set: function(pos,v) {
		this.b[pos] = v & 255;
	}
	,getUInt16: function(pos) {
		if(this.data == null) this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		return this.data.getUint16(pos,true);
	}
	,setUInt16: function(pos,v) {
		if(this.data == null) this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		this.data.setUint16(pos,v,true);
	}
	,getInt32: function(pos) {
		if(this.data == null) this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		return this.data.getInt32(pos,true);
	}
	,setInt32: function(pos,v) {
		if(this.data == null) this.data = new DataView(this.b.buffer,this.b.byteOffset,this.b.byteLength);
		this.data.setInt32(pos,v,true);
	}
	,getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) break;
				s += fcc(c);
			} else if(c < 224) s += fcc((c & 63) << 6 | b[i++] & 127); else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
	,__class__: haxe_io_Bytes
};
var haxe_crypto_Base64 = function() { };
haxe_crypto_Base64.__name__ = true;
haxe_crypto_Base64.encode = function(bytes,complement) {
	if(complement == null) complement = true;
	var str = new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).encodeBytes(bytes).toString();
	if(complement) {
		var _g = bytes.length % 3;
		switch(_g) {
		case 1:
			str += "==";
			break;
		case 2:
			str += "=";
			break;
		default:
		}
	}
	return str;
};
haxe_crypto_Base64.decode = function(str,complement) {
	if(complement == null) complement = true;
	if(complement) while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	return new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).decodeBytes(haxe_io_Bytes.ofString(str));
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) nbits++;
	if(nbits > 8 || len != 1 << nbits) throw new js__$Boot_HaxeError("BaseCode : base length must be a power of two.");
	this.base = base;
	this.nbits = nbits;
};
haxe_crypto_BaseCode.__name__ = true;
haxe_crypto_BaseCode.prototype = {
	encodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		var size = b.length * 8 / nbits | 0;
		var out = haxe_io_Bytes.alloc(size + (b.length * 8 % nbits == 0?0:1));
		var buf = 0;
		var curbits = 0;
		var mask = (1 << nbits) - 1;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < nbits) {
				curbits += 8;
				buf <<= 8;
				buf |= b.get(pin++);
			}
			curbits -= nbits;
			out.set(pout++,base.b[buf >> curbits & mask]);
		}
		if(curbits > 0) out.set(pout++,base.b[buf << nbits - curbits & mask]);
		return out;
	}
	,initTable: function() {
		var tbl = [];
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) this.initTable();
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = haxe_io_Bytes.alloc(size);
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.get(pin++)];
				if(i == -1) throw new js__$Boot_HaxeError("BaseCode : invalid encoded char");
				buf |= i;
			}
			curbits -= 8;
			out.set(pout++,buf >> curbits & 255);
		}
		return out;
	}
	,__class__: haxe_crypto_BaseCode
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	set: function(key,value) {
		if(__map_reserved[key] != null) this.setReserved(key,value); else this.h[key] = value;
	}
	,get: function(key) {
		if(__map_reserved[key] != null) return this.getReserved(key);
		return this.h[key];
	}
	,setReserved: function(key,value) {
		if(this.rh == null) this.rh = { };
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) return null; else return this.rh["$" + key];
	}
	,__class__: haxe_ds_StringMap
};
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var haxe_io_FPHelper = function() { };
haxe_io_FPHelper.__name__ = true;
haxe_io_FPHelper.i32ToFloat = function(i) {
	var sign = 1 - (i >>> 31 << 1);
	var exp = i >>> 23 & 255;
	var sig = i & 8388607;
	if(sig == 0 && exp == 0) return 0.0;
	return sign * (1 + Math.pow(2,-23) * sig) * Math.pow(2,exp - 127);
};
haxe_io_FPHelper.floatToI32 = function(f) {
	if(f == 0) return 0;
	var af;
	if(f < 0) af = -f; else af = f;
	var exp = Math.floor(Math.log(af) / 0.6931471805599453);
	if(exp < -127) exp = -127; else if(exp > 128) exp = 128;
	var sig = Math.round((af / Math.pow(2,exp) - 1) * 8388608) & 8388607;
	return (f < 0?-2147483648:0) | exp + 127 << 23 | sig;
};
haxe_io_FPHelper.i64ToDouble = function(low,high) {
	var sign = 1 - (high >>> 31 << 1);
	var exp = (high >> 20 & 2047) - 1023;
	var sig = (high & 1048575) * 4294967296. + (low >>> 31) * 2147483648. + (low & 2147483647);
	if(sig == 0 && exp == -1023) return 0.0;
	return sign * (1.0 + Math.pow(2,-52) * sig) * Math.pow(2,exp);
};
haxe_io_FPHelper.doubleToI64 = function(v) {
	var i64 = haxe_io_FPHelper.i64tmp;
	if(v == 0) {
		i64.low = 0;
		i64.high = 0;
	} else {
		var av;
		if(v < 0) av = -v; else av = v;
		var exp = Math.floor(Math.log(av) / 0.6931471805599453);
		var sig;
		var v1 = (av / Math.pow(2,exp) - 1) * 4503599627370496.;
		sig = Math.round(v1);
		var sig_l = sig | 0;
		var sig_h = sig / 4294967296.0 | 0;
		i64.low = sig_l;
		i64.high = (v < 0?-2147483648:0) | exp + 1023 << 20 | sig_h;
	}
	return i64;
};
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) Error.captureStackTrace(this,js__$Boot_HaxeError);
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
	__class__: js__$Boot_HaxeError
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__unhtml = function(s) {
	return s.split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;");
};
js_Boot.__trace = function(v,i) {
	var msg;
	if(i != null) msg = i.fileName + ":" + i.lineNumber + ": "; else msg = "";
	msg += js_Boot.__string_rec(v,"");
	if(i != null && i.customParams != null) {
		var _g = 0;
		var _g1 = i.customParams;
		while(_g < _g1.length) {
			var v1 = _g1[_g];
			++_g;
			msg += "," + js_Boot.__string_rec(v1,"");
		}
	}
	var d;
	if(typeof(document) != "undefined" && (d = document.getElementById("haxe:trace")) != null) d.innerHTML += js_Boot.__unhtml(msg) + "<br/>"; else if(typeof console != "undefined" && console.log != null) console.log(msg);
};
js_Boot.getClass = function(o) {
	if((o instanceof Array) && o.__enum__ == null) return Array; else {
		var cl = o.__class__;
		if(cl != null) return cl;
		var name = js_Boot.__nativeClassName(o);
		if(name != null) return js_Boot.__resolveNativeClass(name);
		return null;
	}
};
js_Boot.__string_rec = function(o,s) {
	if(o == null) return "null";
	if(s.length >= 5) return "<...>";
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) t = "object";
	switch(t) {
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) return o[0];
				var str2 = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i1 = _g1++;
					if(i1 != 2) str2 += "," + js_Boot.__string_rec(o[i1],s); else str2 += js_Boot.__string_rec(o[i1],s);
				}
				return str2 + ")";
			}
			var l = o.length;
			var i;
			var str1 = "[";
			s += "\t";
			var _g2 = 0;
			while(_g2 < l) {
				var i2 = _g2++;
				str1 += (i2 > 0?",":"") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			if (e instanceof js__$Boot_HaxeError) e = e.val;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") return s2;
		}
		var k = null;
		var str = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str.length != 2) str += ", \n";
		str += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str += "\n" + s + "}";
		return str;
	case "function":
		return "<function>";
	case "string":
		return o;
	default:
		return String(o);
	}
};
js_Boot.__interfLoop = function(cc,cl) {
	if(cc == null) return false;
	if(cc == cl) return true;
	var intf = cc.__interfaces__;
	if(intf != null) {
		var _g1 = 0;
		var _g = intf.length;
		while(_g1 < _g) {
			var i = _g1++;
			var i1 = intf[i];
			if(i1 == cl || js_Boot.__interfLoop(i1,cl)) return true;
		}
	}
	return js_Boot.__interfLoop(cc.__super__,cl);
};
js_Boot.__instanceof = function(o,cl) {
	if(cl == null) return false;
	switch(cl) {
	case Int:
		return (o|0) === o;
	case Float:
		return typeof(o) == "number";
	case Bool:
		return typeof(o) == "boolean";
	case String:
		return typeof(o) == "string";
	case Array:
		return (o instanceof Array) && o.__enum__ == null;
	case Dynamic:
		return true;
	default:
		if(o != null) {
			if(typeof(cl) == "function") {
				if(o instanceof cl) return true;
				if(js_Boot.__interfLoop(js_Boot.getClass(o),cl)) return true;
			} else if(typeof(cl) == "object" && js_Boot.__isNativeObj(cl)) {
				if(o instanceof cl) return true;
			}
		} else return false;
		if(cl == Class && o.__name__ != null) return true;
		if(cl == Enum && o.__ename__ != null) return true;
		return o.__enum__ == cl;
	}
};
js_Boot.__cast = function(o,t) {
	if(js_Boot.__instanceof(o,t)) return o; else throw new js__$Boot_HaxeError("Cannot cast " + Std.string(o) + " to " + Std.string(t));
};
js_Boot.__nativeClassName = function(o) {
	var name = js_Boot.__toStr.call(o).slice(8,-1);
	if(name == "Object" || name == "Function" || name == "Math" || name == "JSON") return null;
	return name;
};
js_Boot.__isNativeObj = function(o) {
	return js_Boot.__nativeClassName(o) != null;
};
js_Boot.__resolveNativeClass = function(name) {
	return $global[name];
};
var js_Browser = function() { };
js_Browser.__name__ = true;
js_Browser.createXMLHttpRequest = function() {
	if(typeof XMLHttpRequest != "undefined") return new XMLHttpRequest();
	if(typeof ActiveXObject != "undefined") return new ActiveXObject("Microsoft.XMLHTTP");
	throw new js__$Boot_HaxeError("Unable to create XMLHttpRequest object.");
};
var js_html_compat_ArrayBuffer = function(a) {
	if((a instanceof Array) && a.__enum__ == null) {
		this.a = a;
		this.byteLength = a.length;
	} else {
		var len = a;
		this.a = [];
		var _g = 0;
		while(_g < len) {
			var i = _g++;
			this.a[i] = 0;
		}
		this.byteLength = len;
	}
};
js_html_compat_ArrayBuffer.__name__ = true;
js_html_compat_ArrayBuffer.sliceImpl = function(begin,end) {
	var u = new Uint8Array(this,begin,end == null?null:end - begin);
	var result = new ArrayBuffer(u.byteLength);
	var resultArray = new Uint8Array(result);
	resultArray.set(u);
	return result;
};
js_html_compat_ArrayBuffer.prototype = {
	slice: function(begin,end) {
		return new js_html_compat_ArrayBuffer(this.a.slice(begin,end));
	}
	,__class__: js_html_compat_ArrayBuffer
};
var js_html_compat_DataView = function(buffer,byteOffset,byteLength) {
	this.buf = buffer;
	if(byteOffset == null) this.offset = 0; else this.offset = byteOffset;
	if(byteLength == null) this.length = buffer.byteLength - this.offset; else this.length = byteLength;
	if(this.offset < 0 || this.length < 0 || this.offset + this.length > buffer.byteLength) throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
};
js_html_compat_DataView.__name__ = true;
js_html_compat_DataView.prototype = {
	getInt8: function(byteOffset) {
		var v = this.buf.a[this.offset + byteOffset];
		if(v >= 128) return v - 256; else return v;
	}
	,getUint8: function(byteOffset) {
		return this.buf.a[this.offset + byteOffset];
	}
	,getInt16: function(byteOffset,littleEndian) {
		var v = this.getUint16(byteOffset,littleEndian);
		if(v >= 32768) return v - 65536; else return v;
	}
	,getUint16: function(byteOffset,littleEndian) {
		if(littleEndian) return this.buf.a[this.offset + byteOffset] | this.buf.a[this.offset + byteOffset + 1] << 8; else return this.buf.a[this.offset + byteOffset] << 8 | this.buf.a[this.offset + byteOffset + 1];
	}
	,getInt32: function(byteOffset,littleEndian) {
		var p = this.offset + byteOffset;
		var a = this.buf.a[p++];
		var b = this.buf.a[p++];
		var c = this.buf.a[p++];
		var d = this.buf.a[p++];
		if(littleEndian) return a | b << 8 | c << 16 | d << 24; else return d | c << 8 | b << 16 | a << 24;
	}
	,getUint32: function(byteOffset,littleEndian) {
		var v = this.getInt32(byteOffset,littleEndian);
		if(v < 0) return v + 4294967296.; else return v;
	}
	,getFloat32: function(byteOffset,littleEndian) {
		return haxe_io_FPHelper.i32ToFloat(this.getInt32(byteOffset,littleEndian));
	}
	,getFloat64: function(byteOffset,littleEndian) {
		var a = this.getInt32(byteOffset,littleEndian);
		var b = this.getInt32(byteOffset + 4,littleEndian);
		return haxe_io_FPHelper.i64ToDouble(littleEndian?a:b,littleEndian?b:a);
	}
	,setInt8: function(byteOffset,value) {
		if(value < 0) this.buf.a[byteOffset + this.offset] = value + 128 & 255; else this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setUint8: function(byteOffset,value) {
		this.buf.a[byteOffset + this.offset] = value & 255;
	}
	,setInt16: function(byteOffset,value,littleEndian) {
		this.setUint16(byteOffset,value < 0?value + 65536:value,littleEndian);
	}
	,setUint16: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
		} else {
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p] = value & 255;
		}
	}
	,setInt32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,value,littleEndian);
	}
	,setUint32: function(byteOffset,value,littleEndian) {
		var p = byteOffset + this.offset;
		if(littleEndian) {
			this.buf.a[p++] = value & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >>> 24;
		} else {
			this.buf.a[p++] = value >>> 24;
			this.buf.a[p++] = value >> 16 & 255;
			this.buf.a[p++] = value >> 8 & 255;
			this.buf.a[p++] = value & 255;
		}
	}
	,setFloat32: function(byteOffset,value,littleEndian) {
		this.setUint32(byteOffset,haxe_io_FPHelper.floatToI32(value),littleEndian);
	}
	,setFloat64: function(byteOffset,value,littleEndian) {
		var i64 = haxe_io_FPHelper.doubleToI64(value);
		if(littleEndian) {
			this.setUint32(byteOffset,i64.low);
			this.setUint32(byteOffset,i64.high);
		} else {
			this.setUint32(byteOffset,i64.high);
			this.setUint32(byteOffset,i64.low);
		}
	}
	,__class__: js_html_compat_DataView
};
var js_html_compat_Uint8Array = function() { };
js_html_compat_Uint8Array.__name__ = true;
js_html_compat_Uint8Array._new = function(arg1,offset,length) {
	var arr;
	if(typeof(arg1) == "number") {
		arr = [];
		var _g = 0;
		while(_g < arg1) {
			var i = _g++;
			arr[i] = 0;
		}
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else if(js_Boot.__instanceof(arg1,js_html_compat_ArrayBuffer)) {
		var buffer = arg1;
		if(offset == null) offset = 0;
		if(length == null) length = buffer.byteLength - offset;
		if(offset == 0) arr = buffer.a; else arr = buffer.a.slice(offset,offset + length);
		arr.byteLength = arr.length;
		arr.byteOffset = offset;
		arr.buffer = buffer;
	} else if((arg1 instanceof Array) && arg1.__enum__ == null) {
		arr = arg1.slice();
		arr.byteLength = arr.length;
		arr.byteOffset = 0;
		arr.buffer = new js_html_compat_ArrayBuffer(arr);
	} else throw new js__$Boot_HaxeError("TODO " + Std.string(arg1));
	arr.subarray = js_html_compat_Uint8Array._subarray;
	arr.set = js_html_compat_Uint8Array._set;
	return arr;
};
js_html_compat_Uint8Array._set = function(arg,offset) {
	var t = this;
	if(js_Boot.__instanceof(arg.buffer,js_html_compat_ArrayBuffer)) {
		var a = arg;
		if(arg.byteLength + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g1 = 0;
		var _g = arg.byteLength;
		while(_g1 < _g) {
			var i = _g1++;
			t[i + offset] = a[i];
		}
	} else if((arg instanceof Array) && arg.__enum__ == null) {
		var a1 = arg;
		if(a1.length + offset > t.byteLength) throw new js__$Boot_HaxeError("set() outside of range");
		var _g11 = 0;
		var _g2 = a1.length;
		while(_g11 < _g2) {
			var i1 = _g11++;
			t[i1 + offset] = a1[i1];
		}
	} else throw new js__$Boot_HaxeError("TODO");
};
js_html_compat_Uint8Array._subarray = function(start,end) {
	var t = this;
	var a = js_html_compat_Uint8Array._new(t.slice(start,end));
	a.byteOffset = start;
	return a;
};
var passkey_PassKey = function(startTime,videoLength,isEveryday,startMonth,startDay,isTest) {
	if(isTest == null) isTest = false;
	if(startDay == null) startDay = 0;
	if(startMonth == null) startMonth = 0;
	if(isEveryday == null) isEveryday = true;
	if(videoLength == null) videoLength = 0;
	if(startTime == null) startTime = 0;
	this.status = -1;
	this.isKey = true;
	this.videoLength = videoLength;
	this.isTest = isTest;
	this.startDay = startDay;
	this.startMonth = startMonth;
	this.isEveryday = isEveryday;
	this.startTime = startTime;
};
passkey_PassKey.__name__ = true;
passkey_PassKey.prototype = {
	encode: function() {
		var bytes = haxe_io_Bytes.alloc(this.isEveryday?11:15);
		bytes.set(0,Math.floor(Math.random() * 255));
		bytes.b[1] = 1;
		bytes.setInt32(2,this.startTime | 0);
		bytes.setInt32(6,this.videoLength);
		if(this.isEveryday) bytes.b[10] = (this.isTest?1:0) & 255; else {
			bytes.setUInt16(10,this.startMonth);
			bytes.b[12] = (this.isTest?1:0) & 255;
			bytes.setUInt16(13,this.startDay);
		}
		return haxe_crypto_Base64.encode(bytes);
	}
	,decode: function(encodedValue) {
		this.encodedValue = encodedValue;
		if(encodedValue == null || encodedValue.length == 0) {
			this.status = 0;
			return;
		}
		var bytes = haxe_crypto_Base64.decode(encodedValue);
		if(bytes.length != 15 && bytes.length != 11) {
			this.status = 1;
			return;
		}
		this.isKey = bytes.b[1] == 1;
		this.startTime = js_Boot.__cast(bytes.getInt32(2) , Float);
		this.videoLength = bytes.getInt32(6);
		this.isEveryday = bytes.length == 11;
		if(this.isEveryday) this.isTest = bytes.b[10] == 1; else {
			this.startMonth = bytes.getUInt16(10);
			this.isTest = bytes.b[12] == 1;
			this.startDay = bytes.getUInt16(13);
		}
	}
	,__class__: passkey_PassKey
};
var passkey_PassKeyChecker = function() {
	events_Observer.call(this);
};
passkey_PassKeyChecker.__name__ = true;
passkey_PassKeyChecker.__super__ = events_Observer;
passkey_PassKeyChecker.prototype = $extend(events_Observer.prototype,{
	check: function() {
		this.passKey = this.getPassKey();
		if(this.passKey.status != -1) {
			this.endWithError();
			return;
		}
		var startTime = this.passKey.startTime;
		var startMonth = 0;
		var startDay = 0;
		if(this.passKey.isEveryday) {
			startMonth = Settings.getInstance().TODAY_MONTH;
			startDay = Settings.getInstance().TODAY_DAY;
		} else {
			startMonth = this.passKey.startMonth;
			startDay = this.passKey.startDay;
		}
		startTime += Settings.getInstance().TODAY;
		var currentTime = StableDate.currentTime;
		if(currentTime - startTime < -31622400000) {
			this.endWithError();
			return;
		}
		if(startTime > currentTime + 31622400000) {
			this.endWithError();
			return;
		}
		var date1 = 0;
		var date2 = 0;
		if(this.passKey.isTest) Settings.getInstance().START_TIME = currentTime - 30000; else {
			var month1 = Settings.getInstance().TODAY_MONTH;
			var month2 = startMonth;
			var date11 = month1 * 30 + Settings.getInstance().TODAY_DAY;
			var date21 = month2 * 30 + startDay;
			haxe_Log.trace("dates match",{ fileName : "PassKeyChecker.hx", lineNumber : 72, className : "passkey.PassKeyChecker", methodName : "check", customParams : [date11,date21]});
			haxe_Log.trace(month2,{ fileName : "PassKeyChecker.hx", lineNumber : 73, className : "passkey.PassKeyChecker", methodName : "check", customParams : [startDay]});
			if(date11 > date21) {
				this.dispatchEvent(new passkey_PassKeyCheckerEvents("eventEnd"));
				return;
			} else {
				haxe_Log.trace("event will start at",{ fileName : "PassKeyChecker.hx", lineNumber : 83, className : "passkey.PassKeyChecker", methodName : "check", customParams : [startTime,(function($this) {
					var $r;
					var d = new Date();
					d.setTime(startTime);
					$r = d;
					return $r;
				}(this))]});
				Settings.getInstance().START_TIME = startTime;
			}
		}
		var startTimeDelta = Settings.getInstance().START_TIME - currentTime;
		haxe_Log.trace("videLength",{ fileName : "PassKeyChecker.hx", lineNumber : 90, className : "passkey.PassKeyChecker", methodName : "check", customParams : [Math.abs(startTimeDelta),this.passKey.videoLength]});
		if(startTimeDelta < 0 && Math.abs(startTimeDelta) > this.passKey.videoLength) {
			this.dispatchEvent(new passkey_PassKeyCheckerEvents("eventEnd"));
			haxe_Log.trace("### EVEND END DETECT BY PASS KEY VIDEO LENGTH",{ fileName : "PassKeyChecker.hx", lineNumber : 94, className : "passkey.PassKeyChecker", methodName : "check"});
			return;
		}
		haxe_Log.trace((function($this) {
			var $r;
			var t = Settings.getInstance().START_TIME;
			var d1 = new Date();
			d1.setTime(t);
			$r = d1;
			return $r;
		}(this)),{ fileName : "PassKeyChecker.hx", lineNumber : 98, className : "passkey.PassKeyChecker", methodName : "check", customParams : [(function($this) {
			var $r;
			var d2 = new Date();
			d2.setTime(currentTime);
			$r = d2;
			return $r;
		}(this))]});
		haxe_Log.trace("check start time",{ fileName : "PassKeyChecker.hx", lineNumber : 99, className : "passkey.PassKeyChecker", methodName : "check", customParams : [Math.floor(startTimeDelta / 1000 / 60),startTimeDelta]});
		if(startTimeDelta <= 0) {
			haxe_Log.trace("init video",{ fileName : "PassKeyChecker.hx", lineNumber : 103, className : "passkey.PassKeyChecker", methodName : "check"});
			this.dispatchEvent(new passkey_PassKeyCheckerEvents("checkIsOk"));
		} else {
			haxe_Log.trace("show waiting",{ fileName : "PassKeyChecker.hx", lineNumber : 108, className : "passkey.PassKeyChecker", methodName : "check"});
			this.dispatchEvent(new passkey_PassKeyCheckerEvents("waiingForKey"));
		}
	}
	,endWithError: function() {
		this.dispatchEvent(new passkey_PassKeyCheckerEvents("keyCorrupted"));
	}
	,getPassKey: function() {
		var location = window.location.href;
		var pos = location.indexOf("?") + 1;
		location = HxOverrides.substr(location,pos,location.length);
		var vars = this.parseVariables(location);
		var passKeyInput;
		passKeyInput = __map_reserved.passKey != null?vars.getReserved("passKey"):vars.h["passKey"];
		var passKey = new passkey_PassKey();
		passKey.decode(passKeyInput);
		return passKey;
	}
	,parseVariables: function(baseString) {
		var map = new haxe_ds_StringMap();
		var urlVars = baseString.split("&");
		var _g = 0;
		while(_g < urlVars.length) {
			var urlVar = urlVars[_g];
			++_g;
			var paramName;
			var len = urlVar.indexOf("=");
			paramName = HxOverrides.substr(urlVar,0,len);
			var paramValue;
			var pos = urlVar.indexOf("=") + 1;
			paramValue = HxOverrides.substr(urlVar,pos,urlVar.length);
			if(__map_reserved[paramName] != null) map.setReserved(paramName,paramValue); else map.h[paramName] = paramValue;
		}
		return map;
	}
	,formatToTime: function(value) {
		var valueAsString;
		if(value == null) valueAsString = "null"; else valueAsString = "" + value;
		if(valueAsString.length == 1) valueAsString = "0" + valueAsString;
		return valueAsString;
	}
	,__class__: passkey_PassKeyChecker
});
var passkey_PassKeyCheckerEvents = function(type) {
	events_Event.call(this,type);
};
passkey_PassKeyCheckerEvents.__name__ = true;
passkey_PassKeyCheckerEvents.__super__ = events_Event;
passkey_PassKeyCheckerEvents.prototype = $extend(events_Event.prototype,{
	__class__: passkey_PassKeyCheckerEvents
});
var view_MainView = function(viewModel) {
	this.lastState = -1;
	this.usersCount = 0;
	this.viewModel = viewModel;
	this.initialize();
};
view_MainView.__name__ = true;
view_MainView.prototype = {
	hideAll: function() {
		this.waitingScreen.hide();
		this.chatContainer.hidden = true;
		this.usersListContainer.hidden = true;
	}
	,waitingState: function() {
		this.waitingScreen.show();
		this.chatContainer.hidden = false;
		this.usersListContainer.hidden = false;
	}
	,appState: function() {
		this.waitingScreen.hide();
		this.chatContainer.hidden = false;
		this.usersListContainer.hidden = false;
	}
	,initialize: function() {
		this.buildUi();
		this.userlistBlockHeaderPattern = this.usersListHeader.innerText;
		this.chatTextInput.addEventListener("keyup",$bind(this,this.onInputKeyPress));
		this.sendButton.onclick = $bind(this,this.sendMessage);
		this.viewModel.addEventListener("userListChange",$bind(this,this.updateUsersList));
		this.viewModel.addEventListener("messageAdd",$bind(this,this.updateMessagesLists));
	}
	,start: function() {
		var state = this.getUsersToTimeState();
		var count = 0;
		this.lastState = state;
		if(state == 0) count += 10 + Math.floor(Math.random() * 20); else if(state == 1) count += 50 + Math.floor(Math.random() * 50); else if(state == 2) count += 140 + Math.floor(Math.random() * 20);
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			this.viewModel.addUser(this.getRandomName(),true);
		}
		this.usersCount += count;
		this.getUsersUpdateTimer();
		this.onUsersCountUpdate();
		this.updateUsersList();
	}
	,getUsersToTimeState: function() {
		var currentTime = StableDate.currentTime;
		if(Settings.getInstance().START_TIME - currentTime > 7200000) return -1; else if(Settings.getInstance().START_TIME - currentTime > 1800000) return 0; else if(Settings.getInstance().START_TIME - currentTime < 180000 && Settings.getInstance().START_TIME - currentTime > 300000) return 1; else return 2;
	}
	,getUsersUpdateTimer: function() {
		var state = this.getUsersToTimeState();
		var interval = 0;
		if(state == 0) interval = 120000; else if(state == 1) interval = Math.floor(30000.); else if(state == 2) interval = 34285;
		if(this.usersUpdateTimer != null) this.usersUpdateTimer.stop();
		this.usersUpdateTimer = new haxe_Timer(interval);
		this.usersUpdateTimer.run = $bind(this,this.onUsersCountUpdate);
	}
	,onShowDiv: function() {
		this.showDiv.hidden = false;
	}
	,onUsersCountUpdate: function() {
		var state = this.getUsersToTimeState();
		var count = 0;
		if(state == 0) count += Math.floor(1 + Math.random() * 3); else if(state == 1) count += Math.floor(3 + Math.random() * 2); else if(state == 2) count += 1;
		var _g = 0;
		while(_g < count) {
			var i = _g++;
			this.viewModel.addUser(this.getRandomName(),true);
		}
		this.usersCount += count;
		this.usersListHeader.innerText = this.userlistBlockHeaderPattern.split("{0}").join(Std.string(this.usersCount + 1));
		if(this.lastState != state) {
			this.lastState = state;
			this.getUsersUpdateTimer();
		}
		this.updateUsersList();
	}
	,getRandomName: function() {
		var name = "Вы";
		while(name == "Вы") name = this.viewModel.userNamesList[Math.floor(Math.random() * this.viewModel.userNamesList.length)];
		return name;
	}
	,buildUi: function() {
		this.waitingScreen = new view_WaitingScreen();
		this.showDiv = window.document.getElementById("showDiv");
		this.usersListContainer = window.document.getElementById("usersListContainer");
		this.usersList = window.document.getElementById("users");
		this.usersListHeader = window.document.getElementById("usersHeader");
		this.chatContainer = window.document.getElementById("chatContainer");
		this.chatMessages = window.document.getElementById("chat");
		this.chatTextInput = js_Boot.__cast(window.document.getElementById("chatInput") , HTMLInputElement);
		this.sendButton = window.document.getElementById("sendButton");
	}
	,onInputKeyPress: function(event) {
		event.preventDefault();
		if(event.keyCode == 13) this.sendMessage();
	}
	,sendMessage: function() {
		if(this.chatTextInput.value.length == 0) return;
		this.viewModel.addMessage("Вы",this.chatTextInput.value);
		this.chatTextInput.value = "";
		this.chatTextInput.select();
	}
	,updateMessagesLists: function(e) {
		var text = "";
		var _g = 0;
		var _g1 = this.viewModel.messages;
		while(_g < _g1.length) {
			var messageData = _g1[_g];
			++_g;
			text += "<div class=\"chatMessege\"><span class=\"chatName\">" + Std.string(messageData.name) + ":</span>" + Std.string(messageData.message) + "</div>";
		}
		this.chatMessages.innerHTML = text;
		var currentScroll = this.chatMessages.scrollTop;
		var scrollHeight = Math.floor(Math.max(this.chatMessages.scrollHeight,this.chatMessages.clientHeight));
		this.chatMessages.scrollTop = scrollHeight - this.chatMessages.clientHeight;
		if(this.chatMessages.scrollTop == currentScroll) this.scrollTextDelayed();
	}
	,scrollTextDelayed: function() {
		if(this.scrollDelay == null) this.scrollDelay = new haxe_Timer(100);
		this.scrollDelay.run = $bind(this,this.onScrollDelayed);
	}
	,onScrollDelayed: function() {
		var scrollHeight = Math.floor(Math.max(this.chatMessages.scrollHeight,this.chatMessages.clientHeight));
		this.chatMessages.scrollTop = scrollHeight - this.chatMessages.clientHeight;
		if(this.chatMessages.scrollTop != 0) {
			this.scrollDelay.stop();
			this.scrollDelay = null;
		}
	}
	,updateUsersList: function(e) {
		var text = "";
		var _g = 0;
		var _g1 = this.viewModel.usersList;
		while(_g < _g1.length) {
			var userName = _g1[_g];
			++_g;
			text += "<div class=\"member\"><img src=\"img/gray-member.png\">" + userName + "</div>";
		}
		this.usersList.innerHTML = text;
	}
	,__class__: view_MainView
};
var view_WaitingScreen = function() {
	events_Observer.call(this);
	this.buildUi();
	this.initialize();
};
view_WaitingScreen.__name__ = true;
view_WaitingScreen.__super__ = events_Observer;
view_WaitingScreen.prototype = $extend(events_Observer.prototype,{
	initialize: function() {
		this.timer = new haxe_Timer(1000);
		this.timer.run = $bind(this,this.onTick);
	}
	,onTick: function() {
		var currentTime = StableDate.currentTime;
		var startTime = Settings.getInstance().START_TIME;
		if(startTime - currentTime <= 0) {
			this.timer.stop();
			this.dispatchEvent(new view_events_WaitingScreenEvent("waitingEnd"));
		} else {
			var seconds = (startTime - currentTime) / 1000;
			var minutes = Math.floor(seconds / 60);
			var hours = Math.floor(minutes / 60);
			var days = Math.floor(hours / 24);
			seconds = Math.floor(seconds % 60);
			minutes = Math.floor(minutes % 60);
			if(days > 0) hours = hours % 24;
			if(this.waitingTimerD != null) this.waitingTimerD.innerText = this.formatToTime(days);
			if(this.waitingTimerH != null) this.waitingTimerH.innerText = this.formatToTime(hours);
			if(this.waitingTimerM != null) this.waitingTimerM.innerText = this.formatToTime(minutes);
			if(this.waitingTimerS != null) this.waitingTimerS.innerText = this.formatToTime(seconds);
		}
	}
	,formatToTime: function(value) {
		var valueAsString;
		if(value == null) valueAsString = "null"; else valueAsString = "" + value;
		if(valueAsString.length == 1) valueAsString = "0" + valueAsString;
		return valueAsString;
	}
	,buildUi: function() {
		this.container = window.document.getElementById("waitingScreen");
		this.waitingTimerD = window.document.getElementById("timerD");
		this.waitingTimerH = window.document.getElementById("timerH");
		this.waitingTimerM = window.document.getElementById("timerM");
		this.waitingTimerS = window.document.getElementById("timerS");
	}
	,hide: function() {
		this.container.hidden = true;
	}
	,show: function() {
		this.container.hidden = false;
	}
	,__class__: view_WaitingScreen
});
var view_data_MainViewModel = function() {
	this.inputText = "";
	this.messages = [];
	this.usersList = [];
	events_Observer.call(this);
};
view_data_MainViewModel.__name__ = true;
view_data_MainViewModel.__super__ = events_Observer;
view_data_MainViewModel.prototype = $extend(events_Observer.prototype,{
	addUsers: function(users) {
		var _g = 0;
		while(_g < users.length) {
			var user = users[_g];
			++_g;
			this.usersList.push(user);
		}
		this.dispatchEvent(new view_events_UserListEvent("userListChange"));
	}
	,addUser: function(user,silent) {
		if(silent == null) silent = false;
		this.usersList.push(user);
		if(silent == false) this.dispatchEvent(new view_events_UserListEvent("userListChange"));
	}
	,addMessage: function(name,message,silent) {
		if(silent == null) silent = false;
		this.messages.push({ name : name, message : message});
		if(!silent) this.dispatchEvent(new view_events_ChatEvent("messageAdd"));
	}
	,formatMinutes: function(minutes) {
		var minutesAsString;
		if(minutes == null) minutesAsString = "null"; else minutesAsString = "" + minutes;
		if(minutesAsString.length == 1) minutesAsString = "0" + minutesAsString;
		return minutesAsString;
	}
	,__class__: view_data_MainViewModel
});
var view_events_ChatEvent = function(type) {
	events_Event.call(this,type);
};
view_events_ChatEvent.__name__ = true;
view_events_ChatEvent.__super__ = events_Event;
view_events_ChatEvent.prototype = $extend(events_Event.prototype,{
	__class__: view_events_ChatEvent
});
var view_events_UserListEvent = function(type) {
	events_Event.call(this,type);
};
view_events_UserListEvent.__name__ = true;
view_events_UserListEvent.__super__ = events_Event;
view_events_UserListEvent.prototype = $extend(events_Event.prototype,{
	__class__: view_events_UserListEvent
});
var view_events_WaitingScreenEvent = function(type) {
	events_Event.call(this,type);
};
view_events_WaitingScreenEvent.__name__ = true;
view_events_WaitingScreenEvent.__super__ = events_Event;
view_events_WaitingScreenEvent.prototype = $extend(events_Event.prototype,{
	__class__: view_events_WaitingScreenEvent
});
var $_, $fid = 0;
function $bind(o,m) { if( m == null ) return null; if( m.__id__ == null ) m.__id__ = $fid++; var f; if( o.hx__closures__ == null ) o.hx__closures__ = {}; else f = o.hx__closures__[m.__id__]; if( f == null ) { f = function(){ return f.method.apply(f.scope, arguments); }; f.scope = o; f.method = m; o.hx__closures__[m.__id__] = f; } return f; }
String.prototype.__class__ = String;
String.__name__ = true;
Array.__name__ = true;
Date.prototype.__class__ = Date;
Date.__name__ = ["Date"];
var Int = { __name__ : ["Int"]};
var Dynamic = { __name__ : ["Dynamic"]};
var Float = Number;
Float.__name__ = ["Float"];
var Bool = Boolean;
Bool.__ename__ = ["Bool"];
var Class = { __name__ : ["Class"]};
var Enum = { };
var __map_reserved = {}
var ArrayBuffer = $global.ArrayBuffer || js_html_compat_ArrayBuffer;
if(ArrayBuffer.prototype.slice == null) ArrayBuffer.prototype.slice = js_html_compat_ArrayBuffer.sliceImpl;
var DataView = $global.DataView || js_html_compat_DataView;
var Uint8Array = $global.Uint8Array || js_html_compat_Uint8Array._new;
StableDate.isInit = false;
StableDate.updateTimer = new haxe_Timer(500);
StableDate.currentTime = 0;
StableDate.lastTime = -1;
events_Event.COMPLETE = "complete";
events_DataEvent.ON_LOAD = "onLoad";
external_DataLoader.ON_LOAD = "onLoad";
haxe_crypto_Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
haxe_io_FPHelper.i64tmp = (function($this) {
	var $r;
	var x = new haxe__$Int64__$_$_$Int64(0,0);
	$r = x;
	return $r;
}(this));
js_Boot.__toStr = {}.toString;
js_html_compat_Uint8Array.BYTES_PER_ELEMENT = 1;
passkey_PassKey.STATUS_WRONG_INPUT = 0;
passkey_PassKey.STATUS_WRONG_DATA_LENGTH = 1;
passkey_PassKey.EVRYDAY_SIZE = 11;
passkey_PassKey.COMMON_SIZE = 15;
passkey_PassKeyCheckerEvents.EVENT_END = "eventEnd";
passkey_PassKeyCheckerEvents.KEY_CORRUPTED = "keyCorrupted";
passkey_PassKeyCheckerEvents.CHECK_IS_OK = "checkIsOk";
passkey_PassKeyCheckerEvents.WAIING_FOR_KEY = "waiingForKey";
view_events_ChatEvent.MESSAGE_ADD = "messageAdd";
view_events_UserListEvent.USER_LIST_CHANGE = "userListChange";
view_events_WaitingScreenEvent.WAITING_END = "waitingEnd";
EntryPoint.main();
})(typeof console != "undefined" ? console : {log:function(){}}, typeof window != "undefined" ? window : typeof global != "undefined" ? global : typeof self != "undefined" ? self : this);
