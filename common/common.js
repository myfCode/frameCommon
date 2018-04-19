define(['jquery','errorMsg'], function($, errorMsg) {
    'use strict';

    //需要配置微信的appid
	function getWeixinCode() {
		window.location.replace('http://open.weixin.qq.com/connect/oauth2/authorize?appid=' + window.config.appid + '&redirect_uri=' + encodeURIComponent(window.location.href) + '&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect');
	}

	//获取用户微信头像
	function setHeadImg(callback) {
    	common.getContent('/getUserInfo.html','POST', 'json', {}, function(data){
			if (data.errcode === undefined && data.headimgurl !== undefined) {
				common.setCookie("headimgurl",data.headimgurl,365);
				if(typeof callback === 'function'){
                    callback();
                }
			} else {
				$.fnPopup({
					type: "alert",
					msg: data.errcode + ": " + data.errmsg
				});
            }
		});
    }

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
	String.prototype.trim = function(){//去掉string两边字符
　　     return this.replace(/(^\s*)|(\s*$)/g, "");
　　};
	String.prototype.getLen = function(){//计算字符的长度
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
    	//原型式继承
		inheritObject: function(o) {
			function F(){}
			F.prototype = o;
			return new F();
		},
		//寄生组合式集成
		inheritPrototype: function(subClass, superClass) {
			var p = this.inheritObject(superClass.prototype);
			p.constructor = subClass;
			subClass.prototype = p;
		},
		getOpenId: function(callback) {
    		var openId;
	    	if (common.getCookie("openId") === "" || common.getCookie("openId") === null || common.getCookie("openId") === undefined) {
				if (common.getQueryString('code') !== undefined){
					var postData = {
						code: common.getQueryString('code')
					};
					common.getContent('/getTokenWeixin.html','POST', 'json', postData, function(data){
						if (data.errcode === undefined && data.openid !== undefined) {
							common.setCookie("openId",data.openid,365);
							openId = data.openid;
							setHeadImg(function(){
								if(typeof callback === 'function'){
			                        callback(openId);
			                    }
							});
						} else {
							$.fnPopup({
								type: "alert",
								msg: data.errcode + ": " + data.errmsg
							});
			            }
					});
				}else{
					getWeixinCode();
				}
			}else{
				openId = common.getCookie("openId");
				if(typeof callback === 'function'){
                    callback(openId);
                }
			}
	    },
    	getContent: function(url, type, datatype, data, callback,isNeedLoading,target){
			if(isNeedLoading !== false){
				//显示透明loading
				if(isNeedLoading === undefined || (isNeedLoading == true && target === undefined)){
					$.fnPageLoad({state: 2});
				}
				//显示局部覆盖loading
				if(isNeedLoading == true && target !== undefined){
					$.fnPageLoad({target: target});
				}
			}
	        setTimeout(function(){
				//除去类型为string的前后的空格
				for( var attr in data){
					if(Object.prototype.toString.call(data[attr]) === '[object String]'){
						data[attr] = data[attr].trim();
					}
					if(Object.prototype.toString.call(data[attr]) === '[object Array]'){
						for(var i=0;i<data[attr].length;i++){
							if(Object.prototype.toString.call(data[attr][i]) === '[object String]'){
								data[attr][i] = data[attr][i].trim();
							}
						}
					}
				}
				//发送ajax
	            $.ajax({
	                url : url,
	                type : type,
	                dataType : datatype,
	                data : data,
					timeout: 300000,
	                headers: {'x-csrf-token': window.csrf},
	                success: function(e){
						if(datatype === 'html' || datatype === 'HTML'){
							try{
								e = $.parseJSON(e);
							}catch(err){}
						}
	                    if (e.status === 'NO_LOGIN') {
	                    	window.location.href = '/login.html';
	                    	return;
	                    } else if (e.status === 'YES_LOGIN') {
	                    	window.location.href = '/';
	                    	return;
	                    } else if(e.status === 'TRADEPASSWORD_EXISTED'){
							// $.fnNotice({
							// 	msg: '交易密码已存在'
							// })
						}else if (e.status === 'NO_TRADEPASSWORD') {
	                    	//window.location.href = '/';
	                    	//return;
	                    } else if (e.status === 'NO_MOBILEPASSWORD') {
							$.fnPopup({
								type: "confirm",
								msg: '您还没有设置手机密码，请先设置手机密码',
								btnConfirmName: '设置手机密码',
								onConfirm:function(){
									document.location.href='/account/wakeUpProtect_numPwd.html?type=set';
								}
							});
							return;
						}else if (e.status === 'REPEAT') {//重复请求
	                    	window.location.href = '/account/identity.html';
	                    	return;
	                    } else if (e.status === 'ERROR') {
							$.fnNotice({
								type: "alert",
								icon: "icon-warning",
								msg: e.msg,
								btnConfirmName: "确定"
							});
	                    } else if (e.status === 'FROZEN'){
							if(e.url === '/login.html'){
								$.fnNotice({
									msg:e.msg
								});
							}else if(e.url !== '/isWechatBinded.html') {
								window.location.href = '/';
							}
						}
						if(isNeedLoading !== false){
							$.fnPageLoad({state:0});
						}
	                    if(typeof callback === 'function'){
	                        callback(e);
	                    }
	                },
	                error : function(e){
						if(isNeedLoading !== false){
							$.fnPageLoad({state:0});
						}
	                    try{
							console.log(e);
						}catch(er){
							if(window.console){
								window.console.log(e);
							}
						}
						if(e.statusText === 'timeout' || e.statusText === 'error' || e.responseText === '324'){
							window.alert(errorMsg.system.timeout);
						}else{
							window.alert(errorMsg.system.timeout);
						}
	                }
	            });
	        },10);
	    },
	    setCookie:function(NameOfCookie, value,expiredays) {
			var ExpireDate = new Date ();
			ExpireDate.setTime(ExpireDate.getTime() + (expiredays * 24 * 3600 * 1000));
			document.cookie = NameOfCookie + "=" + encodeURIComponent(value) + ((expiredays === null) ? "" : "; expires=" + ExpireDate.toGMTString());
		},
		getCookie:function(NameOfCookie) {
			if (document.cookie.length > 0) {
		        var begin = document.cookie.indexOf(NameOfCookie + "=");
		        if (begin !== -1) {
		            begin += NameOfCookie.length + 1;//cookie值的初始位置
		            var end = document.cookie.indexOf(";", begin);//结束位置
		            if (end === -1) end = document.cookie.length;//没有;则end为字符串结束位置
		            return decodeURIComponent(document.cookie.substring(begin, end));
		        }
		    }
		    return null;
		},
		getQueryString:function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
		    var r = window.location.search.substr(1).match(reg);
		    if (r !== null) return decodeURIComponent(r[2]); return undefined;
		},
    	testTel: function(str) {
    		return (/^1(\d){10}$/.test(str));
    	},
		testTelNum:function(str){//校验手机号段
			/*
			var STR = str.replace(/(^\s*)|(\s*$)/g, "");//去除空格
    		var pattern = /^1((3[0-9])|(5[0-35-9])|(7[0135-8])|(8[0-9])|(4[579]))\d{8}$/;
    		return (pattern.test(STR));
    		*/
    		return true;
		},
		testEmail:function(_email){
			return (/^([a-z0-9A-Z]+[-|_|\\.]?)+[a-z0-9A-Z]@([a-z0-9A-Z]+((-|_)[a-z0-9A-Z]+)*\.)+[a-zA-Z]{2,}$/).test(_email.trim());
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
		testIlegalSpicChar: function(str) {
			return (/[^\dA-Za-z~\.\!@#\$\%\^&\*,\(\)`<>\?\/:;"'\[\{\]\}\|\\\-_\+=]/g.test(str));
		},
		testLegalSpicChar: function(str) {
			return (/[~\.\!@#\$\%\^&\*,\(\)`<>\?\/:;"'\[\{\]\}\|\\\-_\+=]/g.test(str));
		},
		checkStrong: function(str){
			var i = 0;
			if(str.length == 0){
				return 0;
			}
			if(str.length < 8){
				return 1;
			}
			if(common.testNum(str)){
				i++;
			}
			if(common.testEngChar(str)){
				i++;
			}
			if(common.testIlegalSpicChar(str)){
				return 4;
			}
			if(common.testLegalSpicChar(str)){
				i++;
			}
			return i;
		},
		toBigAmount: function(num) {
			var strOutput = "";
			var strUnit = '仟佰拾万仟佰拾亿仟佰拾万仟佰拾元角分';
			num += "00";
			var intPos = num.indexOf('.');
			if (intPos >= 0) {
				num = num.substring(0, intPos) + num.substr(intPos + 1, 2);
			}
			strUnit = strUnit.substr(strUnit.length - num.length);
			for (var i=0; i < num.length; i++) {
				strOutput += '零壹贰叁肆伍陆柒捌玖'.substr(num.substr(i,1),1) + strUnit.substr(i,1);
			}
			var res = strOutput.replace(/零角零分$/, '整').replace(/零角/, '').replace(/零分$/, '').replace(/零[仟佰拾]/g, '零').replace(/零{2,}/g, '零').replace(/零([亿|万])/g, '$1').replace(/零+元/, '元').replace(/亿零{0,3}万/, '亿').replace(/^元/, "零元");
			return (res === '整' || res === '零元整')?"&nbsp;" :res;
		},
		toStdAmount: function(num) {
			if(num + ''){
				var numArr = (num+'').replace(/,/g,"").split(".");
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
				return '';
			}
		},
		toStdInput: function(num) {
			if(num){
				var numArr = (num+'').replace(/,/g,"").split(".");
				var str = numArr[0];
				while(/(\d+)(\d{3})/.test(str)){
					str = str.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
				}
				if(numArr.length === 2){
					return str +'.' + numArr[1];
				}else{
					return (numArr[1])?(str +'.' + numArr[1]):str;
				}
			}else{
				return '';
			}
		},
		locate: function(id){//定位页面元素
			var shap = document.location.href.indexOf("#");
			if(shap >0){//url存在#
				document.location.href = document.location.href.substr(0,shap) + "#" + id;
			}else{
				document.location.href = document.location.href + "#" + id;
			}
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
		getWeekDay: function(str){//根据日期字符串获取所在周第几天，str-格式yyyy-MM-dd
			var date = new Date();
			var week = ['日','一','二','三','四','五','六'];
			date.setYear(str.substr(0,4));
			date.setMonth(str.substr(5,2) - 1);
			date.setDate(str.substr(8,2));
			return week[date.getDay()];
		},
		isIE8: function(){
			if(navigator.userAgent.indexOf("MSIE 7.0")>0 || navigator.userAgent.indexOf("MSIE 8.0")>0){
				return true;
			}else{
				return false;
			}
		},
		disInput: function(dom$){//禁止输入框输入
			if(dom$.length){
				dom$.css('ime-mode','disabled');
				dom$.on("keypress",function(e){e.preventDefault();return false;});
				dom$.on("paste",function(e){e.preventDefault();return false;});
				dom$.on("cut",function(e){e.preventDefault();return false;});
				dom$.on("input",function(e){var dom = e.delegateTarget;dom.value=dom.defaultValue;e.preventDefault();return false;});
			}
		},
		getHeadImg: function() {
	    	return common.getCookie("headimgurl");
	    },
		uploadHeadImg: function(callback){
			var url = common.getHeadImg();
			if(url.length > 1 && url !== '/0'){
				common.getContent('/sync_img.html','POST', 'JSON', {'url':url}, callback,true);
			}else{
				if(typeof callback === 'function'){
					callback();
				}
			}
		},
		/***
		 * sliceDecimal(num, len)
		 * num:需要截取的数据
		 * len:截取小数点后长度
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
		calProfit: function (amt,rate,num,unit){//计算收益
			if(arguments.length < 3){
				return null;
			}
			rate = common.floatDiv(rate,100);
			var profit = common.floatMulti(common.floatMulti(amt,rate),common.floatDiv(num,365));
			return common.sliceDecimal(profit,2);//小数点两位之后舍去
			/*
			switch(unit){
				case '天':
				//return common.floatMulti(common.floatMulti(amt,rate),common.floatDiv(num,(common.isLeapYear((new Date).getFullYear()))?366:365));
				return common.floatMulti(common.floatMulti(amt,rate),common.floatDiv(num,365));
				case '月':
				return common.floatMulti(common.floatMulti(amt,rate),common.floatDiv(num,12));
				case '年':
				return common.floatMulti(amt,rate);
			}
			*/
		},
		toFixedDecimal: function(num,leng){
			if (isNaN(num)) {
		      return '数据错误';
		    }else{
		      num = num + '';
		    }
		    if(leng === undefined){
		    	leng = 2;
		    }else if(leng === 0){
		    	return num.split('.')[0];
		    }
		    var rs = num.split('.');
		    var res = rs[0] + '.';
		    if(rs[1]){
		      for(var i=0;i<leng;i++){
		        if(rs[1].charAt(i)){
		          res += rs[1].charAt(i);
		        }else{
		          res += '0';
		        }
		      }
		    }else{
		      res += '00';
		    }
		    return res;
		},
		forceRefresh: function() {
			history.replaceState({}, 'refresh', location.pathname+'?time='+(+new Date()));
		},
		setFloatImg: function(link,src){
		    $("body").append("<a style='display:block; width:5rem; padding:.5rem; position:absolute; right:.5rem; bottom:6rem; z-index:8;' href='" + link + "'><img width='100%' src='" + src + "'></a>");
		}

    };

    return common;
});