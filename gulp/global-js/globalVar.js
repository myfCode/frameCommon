'use strict';
//定义requestAnimationFrame
var rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) { window.setTimeout(callback, 1000 / 60); };
//prevent default
$.preventDefault = function(e) {
    e.preventDefault();
};
//定义全局变量
$.touchMoved = false; //touchmove判断
$.globalEffect = false; //全局动画效果开关
$.globalSpeed = 0; //全局js动画时长
$.orientationTimeout; //旋转超时
$.fnScrollPanelTimeOut; //滚动面板用
$.fnNoticeShowTimeOut; //消息提示用
$.fnNoticeHideTimeOut; //消息提示用
$.fnNoticeDestoryTimeOut; //消息提示用
$.winW = $(window).width(); //定义窗口宽
$.winH = $(window).height(); //定义窗口高
$.fontSize = 0; //定义动态fontsize
$.html; //定义html
$.body; //定义body
$.amHeader; //定义am-header
$.amFooter; //定义am-footer
$.amBody; //定义am-body
$.amBodyInner; //定义am-bodyInner
$.sTop = 0; //定义滚动条高度
$.xIndex = 0; //定义横向当前项
$.xPage = []; //定义横向页码
$.pullDownSensitive = 70; //定义下拉触发刷新距离阀值
$.pullUpSensitive = 20; //定义上拉触发加载距离阀值
$.pullDownHtml = "<div class='am-pullDown'><span></span><span></span><span></span></div>"; //下拉加载dom
$.pullUpHtml = "<div class='am-pullUp'><span class='icon'></span><span class='msg'></span></div>"; //上拉刷新dom
$.scrollX = []; //全局横向滚动条数组
$.scrollY = []; //全局纵向滚动条数组
$.bounceTime = 600; //下拉刷新回弹时间，须大于550ms
$.touchX; //touch触点X
$.touchY; //touch触点Y
$.touchstart; //start事件
$.touchmove; //move事件
$.touchend; //end事件
$.tap; //自定义tap事件
$.isSupportTouch = "ontouchend" in document ? true : false; //支持touch判断
$.config = {
    language: (navigator.browserLanguage || navigator.language).toLowerCase(),
    //检测操作系统
    system: function() {
        var p = navigator.platform.toLowerCase();
        var u = navigator.userAgent.toLowerCase();
        return {
            win: p === "win32" || p === "win64" || p === "windows",
            mac: p === "mac68k" || p === "macppc" || p === "macintosh" || p === "macintel",
            linux: p === "linux" || p === "x11",
            ios: !!u.match(/\(i[^;]+;( u;)? cpu.+mac os x/),
            android: u.indexOf('android') > -1 || u.indexOf('linux') > -1
        };
    }(),
    //检测操作系统版本，返回结果为数值型，格式为整数加.加n位小数，
    version: function() {
        var u = navigator.userAgent.toLowerCase();
        var vv = "";
        var vs = -1; //version start
        var ve = -1; //version end
        var tt = -1; //temp text
        switch (true) {
            case u.indexOf('msie') > 1:
                vs = u.indexOf('msie') + 5;
                tt = u.substr(vs);
                ve = tt.indexOf(';');
                break;
            case u.indexOf('windows nt') > 1:
                vs = u.indexOf('windows nt') + 11;
                tt = u.substr(vs);
                ve = tt.indexOf(';');
                break;
            case u.indexOf('iphone os') > 1:
                vs = u.indexOf('iphone os') + 10;
                tt = u.substr(vs);
                ve = tt.indexOf('like') - 1;
                break;
            case u.indexOf('cpu os') > 1:
                vs = u.indexOf('cpu os') + 7;
                tt = u.substr(vs);
                ve = tt.indexOf('like') - 1;
                break;
            case u.indexOf('android') > 1:
                vs = u.indexOf('android') + 8;
                tt = u.substr(vs);
                ve = tt.indexOf(';');
                break;
            case u.indexOf('(bb') > 1:
                vs = u.indexOf('(bb') + 3;
                tt = u.substr(vs);
                ve = tt.indexOf(';');
                break;
        }
        var t = u.substr(vs, ve).replace(/_/g, '.').split(".");
        for (var i = 0; i < t.length; i++) {
            if (i === 0 && t.length > 1) {
                vv += String(t[i]) + ".";
            } else {
                vv += String(t[i]);
            }
        }
        return Number(vv) || -1;
    }(),
    //检测浏览器
    browser: function() {
        var u = navigator.userAgent.toLowerCase();
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
            wechat: u.match(/micromessenger/i) == "micromessenger"
        };
    }()
}; //检测系统参数
$.setevent = {
    init: function() {
        $.touchstart = $.html.hasClass("am-mob") ? "touchstart" : "mousedown";
        $.touchmove = $.html.hasClass("am-mob") ? "touchmove" : "mousemove";
        $.touchend = $.html.hasClass("am-mob") ? "touchend" : "mouseup";
        $.tap = "ChanyHot";
    }
}; //检测事件
$.settouch = {
    init: function(e) {
        if ($.html.hasClass("am-mob")) {
            $.touchX = e.originalEvent.changedTouches[0].pageX;
            $.touchY = e.originalEvent.changedTouches[0].pageY;
        }
        if ($.html.hasClass("am-pc")) {
            $.touchX = e.pageX;
            $.touchY = e.pageY;
        }
    }
}; //检测jQuery或Zepto引用，设置touch触点
$.setmove = {
    init: function() {
        $(document).off($.touchstart + ".setmove").on($.touchstart + ".setmove", this.move);
        $(document).off($.touchend + ".setmove").on($.touchend + ".setmove", this.move);
    },
    move: function(e) {
        $.settouch.init(e);
        if (e.type === $.touchstart) {
            $.touchMoved = false;
            $.setmove.x = $.touchX;
            $.setmove.y = $.touchY;
            $(document).on($.touchmove + ".setmove", $.setmove.move);
        } else
        if (e.type === $.touchmove) {
            $.setmove._x = $.touchX;
            $.setmove._y = $.touchY;
            if (Math.abs($.setmove._x - $.setmove.x) > 10 || Math.abs($.setmove._y - $.setmove.y) > 10) {
                $.touchMoved = true;
            }
        } else
        if (e.type === $.touchend) {
            !$.touchMoved ? $(e.target).trigger($.tap) : false;
            $.touchMoved = false;
            $(document).off($.touchmove + ".setmove");
        }
    }
}; //检测Touch后是否移动
$.console = function(msg) {
    console.log("%c%s",
        "color:#FF7F7F; background-color:#280000;",
        "JQB Error: " + msg);
}
$.scrollPullDown = function() {
    console.log("refreshing");
    $.scrollY[0].pullDownComplete(function() {
        console.log("loaddata");
    });
}; //下拉刷新回调方法，可用同名新方法覆盖此默认值
$.scrollPullUp = function() {
    console.log("loading");
    $.scrollY[0].pullUpComplete(function() {
        console.log("loaddata");
    });
}; //上拉加载回调方法，可用同名新方法覆盖此默认值
//乘法
$.floatMulti = function(arg1, arg2) {
    var precision1 = $._getPrecision(arg1);
    var precision2 = $._getPrecision(arg2);
    var tempPrecision = 0;
    tempPrecision += precision1;
    tempPrecision += precision2;
    var int1 = $._getIntFromFloat(arg1);
    var int2 = $._getIntFromFloat(arg2);
    return (int1 * int2) * Math.pow(10, -tempPrecision);
};
//除法
$.floatDiv = function(arg1, arg2) {
    var precision1 = $._getPrecision(arg1);
    var precision2 = $._getPrecision(arg2);
    var int1 = $._getIntFromFloat(arg1);
    var int2 = $._getIntFromFloat(arg2);
    return (int1 / int2) * Math.pow(10, precision2 - precision1);
};
//加法
$.floatAdd = function(arg1, arg2) {
    var precision1 = $._getPrecision(arg1);
    var precision2 = $._getPrecision(arg2);
    var temp = Math.pow(10, Math.max(precision1, precision2));
    return ($.floatMulti(arg1, temp) + $.floatMulti(arg2, temp)) / temp;
};
//减法
$.floatSubtract = function(arg1, arg2) {
    var precision1 = $._getPrecision(arg1);
    var precision2 = $._getPrecision(arg2);
    var temp = Math.pow(10, Math.max(precision1, precision2));
    return ($.floatMulti(arg1, temp) - $.floatMulti(arg2, temp)) / temp;
};
$._getPrecision = function(arg) {
    if (arg.toString().indexOf(".") == -1) {
        return 0;
    } else {
        return arg.toString().split(".")[1].length;
    };
}
$._getIntFromFloat = function(arg) {
    if (arg.toString().indexOf(".") == -1) {
        return arg;
    } else {
        return Number(arg.toString().replace(".", ""));
    }
};
$.keep2 = function(num) {
    if (isNaN(num)) {
        return '数据错误';
    } else {
        num = num + '';
    }
    var rs = num.split('.');
    var res = rs[0];
    if (rs[1]) {
        if (rs[1].charAt(0) != 0 || rs[1].charAt(1) != 0) {
            res = rs[0] + '.';
            for (var i = 0; i < 2; i++) {
                if (rs[1].charAt(i) != 0 || i == 0) {
                    res += rs[1].charAt(i);
                }
            }
        }
    }
    return res;
};
