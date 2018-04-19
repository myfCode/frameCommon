var Redis = require('ioredis');
var Promise = require('promise');
var crypto = require('crypto');
var errorMsg = require('./errorMsg');

Date.prototype.format = function(format){ //日期格式化
	var o = {
		"M+" : this.getMonth()+1, //month
		"d+" : this.getDate(), //day
		"h+" : this.getHours(), //hour
		"m+" : this.getMinutes(), //minute
		"s+" : this.getSeconds(), //second
		"q+" : Math.floor((this.getMonth()+3)/3), //quarter
		"S" : this.getMilliseconds() //millisecond
	};

	if(/(y+)/.test(format)) {
		format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
	}

	for(var k in o) {
		if(new RegExp("("+ k +")").test(format)) {
			format = format.replace(RegExp.$1, RegExp.$1.length===1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
		}
	}
	return format;
};

String.prototype.trim = function(){//去掉两边空格
	return this.replace(/(^\s*)|(\s*$)/g, "");
};

String.prototype.getLen = function(){//计算String的长度
	var totalLength = 0;
	var charCode;
	for (var i = 0; i < this.length; i++) {
		charCode = this.charCodeAt(i);
		if (charCode < 0x007f)  {
			totalLength++;
		} else if ((0x0080 <= charCode) && (charCode <= 0x07ff))  {
			totalLength += 2;
		} else if ((0x0800 <= charCode) && (charCode <= 0xffff))  {
			totalLength += 3;
		} else{
			totalLength += 4;
		}
	}
	return totalLength;
};

var common = {
	getSignature: function(noncestr,timestamp,url) {
		var promise = new Promise(function (resolve, reject) {
			var client = new Redis.Cluster(eval(process.env.REDIS_URL));
			client.get(process.env.WX_TICKET, function(err, reply) {
			    var jsapi_ticket = reply;
			    //生成signature的sha1值
                var signature;
                var sha1 = crypto.createHash('sha1');
                var string1 = {
                    jsapi_ticket: jsapi_ticket,
                    noncestr: noncestr,
                    timestamp: timestamp
                };
                string1 = require('querystring').stringify(string1);
                string1 = string1 + '&url=' + url;

                signature = sha1.update(string1).digest('hex');

			    resolve(signature);

			    client.disconnect();
			});
		});
		return promise;
	},
	getTimestamp: function() {
		return Math.round(new Date().getTime()/1000);
	},
	getClientIp: function(req) {
	    return req.headers['x-forwarded-for'] ||
	    req.connection.remoteAddress ||
	    req.socket.remoteAddress ||
	    req.connection.socket.remoteAddress;
	},
	testTel: function(str) {
		return (/^1(\d){10}$/.test(str));
	},
	testEmail:function(_email){
		return (/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/).test(_email);
	},
	testNum: function(str) {
		return (/\d/g.test(str));
	},
	testEngChar: function(str) {
		return (/[A-Za-z]/g.test(str));
	},
	testCJKChar: function(str) {
		return (/[\u4E00-\u9FA5\uF900-\uFA2D]/.test(str));
	},
	testLegalSpicChar: function(str) {
		return (/[~\.\!@#\$\%\^&\*]/g.test(str));
	},
	testIlegalSpicChar: function(str) {
		return (/[,\(\)`<>\?\/:;"'\[\{\]\}\|\\\-_\+=\s]/g.test(str));
	},
	checkStrong: function(str){
		var i = 0;
		if(str.length == 0){
			return 0;
		}
		if(str.length < 8){
			return 1;
		}
		if(this.testNum(str)){
			i++;
		}
		if(this.testEngChar(str)){
			i++;
		}
		if(this.testLegalSpicChar(str)){
			i++;
		}
		if(this.testIlegalSpicChar(str)){
			i=4;
		}
		if(this.testCJKChar(str)){
			i=5;
		}
		return i;
	},
	toStdAmount: function(num) {//金额标准格式
		if(num || num === '0' || num === 0){
			var numArr = (num+"").replace(/,/g,"").split(".");
			var str = numArr[0];
			while(/(\d+)(\d{3})/.test(str)){
				str = str.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
			}
			if(numArr.length === 1){
				return (str+".00");
			} else if(numArr.length === 2){
				if((numArr[1] + "").length === 1){
					return (str +'.' + numArr[1] + "0");
				} else {
					return (str +'.' + numArr[1]);
				}
			}
		}else{
			return null;
		}
	},
	clone: function(obj) {
		if(obj === null){
			return obj;
		}
	    function Clone(){}
	    Clone.prototype = obj;
	    var o = new Clone();
	    for(var a in o){
	        if(typeof o[a] === 'object') {
	            o[a] = common.clone(o[a]);
	        }
	    }
	    return o;
	},
	_getPrecision:function(arg){
		if(arg.toString().indexOf(".")===-1){
			return 0;
		}else{
			return arg.toString().split(".")[1].length;
		}
	},
	_getIntFromFloat:function(arg){
		if(arg.toString().indexOf(".")===-1){
			return arg;
		}else{
			return Number(arg.toString().replace(".",""));
		}
	},
	//乘法
	floatMulti:function(arg1,arg2){
		var precision1=common._getPrecision(arg1);
		var precision2=common._getPrecision(arg2);
		var tempPrecision=0;

		tempPrecision+=precision1;
		tempPrecision+=precision2;
		var int1=common._getIntFromFloat(arg1);
		var int2=common._getIntFromFloat(arg2);
		return (int1*int2)*Math.pow(10,-tempPrecision);
	},
	//加法
	floatAdd:function(arg1,arg2){
		var precision1=common._getPrecision(arg1);
		var precision2=common._getPrecision(arg2);
		var temp=Math.pow(10,Math.max(precision1,precision2));
		return (common.floatMulti(arg1,temp)+common.floatMulti(arg2,temp))/temp;
	},
	//减法
	floatSubtract:function(arg1,arg2){
		var precision1=common._getPrecision(arg1);
		var precision2=common._getPrecision(arg2);
		var temp=Math.pow(10,Math.max(precision1,precision2));
		return (common.floatMulti(arg1,temp)-common.floatMulti(arg2,temp))/temp;
	},
	//除法
	floatDiv:function(arg1,arg2){
		var precision1=common._getPrecision(arg1);
		var precision2=common._getPrecision(arg2);
		var int1=common._getIntFromFloat(arg1);
		var int2=common._getIntFromFloat(arg2);
		var result=(int1/int2)*Math.pow(10,precision2-precision1);
		return result;
	},
	extend: function(des,src,override){
		for(var i in src){
			if(src.hasOwnProperty(i) && (!des.hasOwnProperty(i) || des[i] === undefined || override)){
				des[i]=src[i];
			}
		}
		return des;
	},
	//判断是否为微信打开
	isWeixin:function(req){
    	var ua = req.headers['user-agent'].toLowerCase();
    	if(ua.match(/MicroMessenger/i)=="micromessenger") {
    		return true;
    	} else {
    		return false;
    	}
	},
	isPC: function(req) {
	    var userAgentInfo = req.headers['user-agent']?req.headers['user-agent'].toLowerCase():'';
	    var Agents = ["android", "iphone", "symbianos", "windows phone", "ipod", "ipad"];
	    var flag = true;
	    for (var v = 0; v < Agents.length; v++) {
	        if (userAgentInfo.indexOf(Agents[v]) > 0) {
	            flag = false;
	            break;
	        }
	    }
	    return flag;
	},
	system: function(req) {
        var u = req.headers['user-agent'].toLowerCase();
        return {
            win: u === "win32" || u === "win64" || u === "windows",
            mac: u === "mac68k" || u === "macppc" || u === "macintosh" || u === "macintel",
            linux: u === "linux" || u === "x11",
            ios: !!u.match(/\(i[^;]+;( u;)? cpu.+mac os x/),
            android: u.indexOf('android') > -1 || u.indexOf('linux') > -1
        };
    },
    browser: function(req) {
        var u = req.headers['user-agent'].toLowerCase();
        return {
            msie: u.indexOf("msie") > -1 || u.indexOf("rv:11") > -1,
            edge: u.indexOf("edge") > -1,
            trident: u.indexOf('trident') > -1,
            presto: u.indexOf('presto') > -1,
            webKit: u.indexOf('applewebKit') > -1,
            firefox: u.indexOf('firefox') > -1,
            chrome: u.indexOf('chrome') > -1,
            opera: u.indexOf('opera') > -1 && u.indexOf('chrome') < 1,
            safari: u.indexOf('safari') > -1 && u.indexOf('chrome') < 1,
            gecko: u.indexOf('gecko') > -1 && u.indexOf('khtml') < 1,
            mobile: !!u.match(/applewebkit.*mobile.*/) || !!u.match(/applewebkit/),
            iPhone: u.indexOf('iphone') > -1,
            iPad: u.indexOf('ipad') > -1,
            webApp: u.indexOf('safari') < 1,
            wechat: u.match(/micromessenger/i) === "micromessenger"
        };
    },
	addHtmlClass: function(req,result){
		if (this.isPC(req)) {
			result.htmlClass = 'am-pc';
		} else {
			result.htmlClass = 'am-mob am-wx';
		}
		if (this.system(req).ios) {
	    	result.htmlClass += ' ios';
	    }
	    if (this.system(req).win) {
	    	result.htmlClass += ' win';
	    }
	    if (this.system(req).mac) {
	        result.htmlClass += ' mac';
	    }
	    if (this.system(req).android) {
	        result.htmlClass += ' android';
	    }
	    if (this.browser(req).chrome) {
	        result.htmlClass += ' chrome';
	    }
	    if (this.browser(req).firefox) {
	        result.htmlClass += ' firefox';
	    }
	    //标记浏览器
	    if (this.browser(req).iPad) {
	        result.htmlClass += ' am-pad';
	    }
	    if (this.browser(req).safari) {
	        result.htmlClass += ' safari';
	    }
	    if (this.browser(req).msie) {
	        result.htmlClass += ' msie';
	    }
		return result;
	},
	setResult: function(req,callback){
		var protocol = process.env.NODE_ENV == 'production' ? 'https://' : 'http://';
		var resultConfig = {};
		resultConfig.isPC = common.isPC(req);
        resultConfig.isWeixin = common.isWeixin(req);
        resultConfig = common.addHtmlClass(req,resultConfig);
		if (common.isWeixin(req) === true) {
	        //申明微信所需要的参数
	        var noncestr =  process.env.NONCESTR;
	        var appid = process.env.APPID;
	        var timestamp = common.getTimestamp();
	        var url = protocol + req.headers.host + req.originalUrl;
	        //调用微信签名
	        common.getSignature(noncestr,timestamp,url).then(function (signature) {
	            resultConfig.appid = appid;
	            resultConfig.noncestr = noncestr;
	            resultConfig.timestamp = timestamp;
	            resultConfig.signature = signature;
	            callback(resultConfig);
	        });
	    } else {
	    	callback(resultConfig);
	    }
	},
	renderError: function(){
		if (arguments.length === 2) {
			res = arguments[0];
			result = {};
			resultConfig = arguments[1];
			result.resultMsg  = errorMsg.system.msg;
		} else if (arguments.length === 3) {
			res = arguments[0];
			result = arguments[1];
			resultConfig = arguments[2];
		} else {
			return;
		}
		result.showLogin = false;
        result.showLogout = false;
        result.showNav = false;
        result.status = 500;
        result.message = result.resultMsg;
        result.page_name = 'p-result-system-error';
        result.title = '错误';
        res.status(500);
		common.extend(result,resultConfig);
        res.render('error', result);
	},
	getContractFile: function(code){
		switch(code){
			case 'ZH00VM':
				return '/getProductContract.html?protocolType=ZH00VM01';
			case 'ZH03Y5':
				return '/getProductContract.html?protocolType=ZH03Y501';
		}
	},
	isInherentCode: function(req, res, result, method, callback){
		if (result.resultCode === 'E00015') {//重复请求，例如卡密绑卡页面提交成功之后，点击返回按钮，再次提交时候报错重复请求
			if (method === 'get') {
				res.redirect('/account/identity.html');
			} else if (method === 'post') {
				res.send({'status': 'REPEAT', 'msg':''});
			}
			return;
		}
		if(result.resultCode === 'E01950'){//账户冻结
			req.session.user = undefined;
			req.session.condition.accountFrozen = 1;
			req.session.condition.msg = result.resultMsg;
			if(method === 'post'){
				res.send({'status':'FROZEN','msg':result.resultMsg, 'url':req.originalUrl});
				return;
			}else if(method === 'get'){
				res.redirect('/');
				return;
			}
		}
		if (result.resultCode === 'E00010' || result.resultCode === 'E00011' || result.resultCode === 'E00012' || result.resultCode === 'E00013' || result.resultCode === 'E00020' || result.resultCode === 'E00030') {
			if (method === 'get') {
				if(req.session.user === undefined){
                    result.isPC = common.isPC(req);
                    result.isWeixin = common.isWeixin(req);
                    result = common.addHtmlClass(req,result);
                    result.message = errorMsg.system.msg;
                    result.announcementContent = req.session.condition.announcementContent;
                    result.error = {};
    				result.page_name = 'p-result-system-error';
                    result.status = '500';
                    result.layout = 'layout';
					res.render('error', result);
				}else{
                    result.isPC = common.isPC(req);
                    result.isWeixin = common.isWeixin(req);
                    result = common.addHtmlClass(req,result);
                    result.unreadMessageCount = req.session.user.unreadMessageCount;
                    result.nickName = req.session.user.nickName;
                    result.message = errorMsg.system.msg;
                    result.announcementContent = req.session.condition.announcementContent;
                    result.error = {};
    				result.page_name = 'p-result-system-error';
                    result.status = '500';
                    result.layout = 'layout';
					res.render('error', result);
				}
				return;
			} else if (method === 'post') {
				res.send({'status': 'ERROR', 'msg': errorMsg.system.msg});
				return;
			}
		} else {
			callback();
		}
	},
	product_status: {
		//1-即将开始；2-立刻投资；4-还有机会；8-已售罄；9-已停售
		yes: '1',
		now: '2',
		chance: '4',
		none: '8',
		stop: '9'
	},
	ProductSecondType: {
		//011：铁路基金，012：联动产品，013：转让产品
		railway: '011',
		receipt: '012',
		transfer: '013'
	},
	ProductType: {
		fixedincome: '01',
		cashmanage: '02',
		accountproduct: '00'
	},
	getRedemPath: function(code){
		switch(code){
			case 'ZH00VM':
				return '/trade/redeming.html';
			case 'ZH03Y5':
				return '/property/takecash.html';
		}
	},
	/***
	 * sliceDecimal(num, len)
	 * num:需要截取的数据
	 * len:截取小数点后的位数
	 * ***/
	sliceDecimal: function (num, len) {
		if(num == null){
		    num = 0;
        } else if(isNaN(num)){
			return;
		}
		if(!len){
			return num;
		}

		var _num = num + '';
		var arr = _num.split('.');

		var _int = arr[0];//整数部分
		if(_int == ''){//当传入参数为'.'或'.1'或''时
			_int = '0';
		}

		if(arr.length === 1){//没有小数
			_int += '.';
			//补零
			for(var i = 0; i < len; i++){
				_int += '0';
			}
			return _int;
		}else if(arr.length === 2){//有小数
			var _decimal = arr[1];//小数部分
			//补零
			for(var i = 0; i < len; i++){
				_decimal += '0';
			}
			//剪切拼接
			_decimal = _decimal.substr(0, len);
			_num = _int + '.' + _decimal;
			return _num;
		}
	},
	mobilePasswordExisted:{//是否设置手机密码保护
		exist: '1',
		none: '0'
	},
	mobilePasswordEnabled:{//是否启用手机密码保护
		exist: '1',
		none: '0'
	},
	compareToday: function(arg){
		var date = Number(arg.replace(/-/g,'').replace(/\//g,''));
		var today = Number((new Date()).format('yyyyMMdd'));
		if(date > today){
			return 1;
		}else if(date == today){
			return 0;
		}else if(date < today){
			return -1;
		}
	},
	isWorkingTime: function(){
		 var begin = new Date();
		 begin.setHours(9);
		 var end = new Date();
		 end.setHours(18);
		 var now = new Date();
		 if(now.getTime() >= begin.getTime() && now.getTime() < end.getTime()){
			return true;
		 }else{
			return false;
		 }
	},
	getClientIp: function(req) {
        return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
    }
};
module.exports = common;