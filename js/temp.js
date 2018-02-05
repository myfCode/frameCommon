'use strict';
//set viewport
$("head").append("<meta name='viewport' content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0' />");
//set clear cache
$("head").append("<meta http-equiv='cache-control' content='no-cache, no-store, must-revalidate'>");
$("head").append("<meta http-equiv='pragma' content='no-cache'>");
$("head").append("<meta http-equiv='expires' content='0'>");

//set header timebar
function setHeaderTimebar() {
    $("header.am-app").prepend("<div class='timebar w'><span></span><span></span><span></span></div>");
    var timeStyle = "<style>.timebar span{ width:33.333%; min-width:106px; max-width:138px; height:20px; display:block; position:absolute; top:50%; margin-top:-10px; background:url(/jingqb-unify/temp/timebar.png) center top/auto 40px no-repeat;}.timebar span:nth-child(1){ background-position:left top; left:0;}.timebar span:nth-child(2){ background-position:center top; left:50%; -webkit-transform:translate3d(-50%,0,0)}.timebar span:nth-child(3){ background-position:right top; right:0;}.timebar.w span:nth-child(1){ background-position:left bottom;}.timebar.w span:nth-child(2){ background-position:center bottom;}.timebar.w span:nth-child(3){ background-position:right bottom;}</style>";
    $("html>head").append(timeStyle);
}


function getQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
}

function setHref(d) {
    $("a[href]").each(function(i) {
        if ($(this).attr("href").indexOf("html") > 0) {
            var link = $(this).attr("href") + "?d=" + d;
            $(this).attr({ href: link });
        }
    });
}

function setWxPageload() {
    $("body").append("<div class='am-pageload fixed am-on'><span></span></div>");
}

function setWxHeader() {
    var wxstyle = "<style>html.am-wx header.am-app.am-wx{display:block!important;background:#222!important;height:64px;}header.am-app.am-wx .timebar{display:block;height:20px;}header.am-app.am-wx span.title{opacity:1;}header.am-app.am-wx a.btn-detail span{font-size:1.75rem;letter-spacing:1px; position:relative; top:-.55rem;}header.am-app.am-wx~.am-pop{top:64px;}</style>";
    var wxheader = "<header class='am-app am-wx'><div class='timebar w'><span></span><span></span><span></span></div><a href='javascript:history.back();' class='btn-back'><span class='am-icon-back-w'></span></a><span class='title'></span><a class='btn-detail' onclick='javascript:alert(\"你想多了...\")'><span>...</span></a></header>";
    $("html>head").append(wxstyle);
    $("body").prepend(wxheader);

    setTimeout(function() {
        $("header.am-wx>.title").text($("html>head>title").text());
    });

}

function checkBroswerVersion() {
    setTimeout(function() {
        if ($("html").hasClass("ieOld")) {
            window.location.href = "p-result-browser-incompatible.html";
        }
    });
}

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


//globalSet放在node端处理
var globalSet = function() {
    //标记操作系统
    if ($.config.system.ios) {
        $("html").addClass("ios");
    }
    if ($.config.system.win) {
        $("html").addClass("win");
    }
    if ($.config.system.mac) {
        $("html").addClass("mac");
    }
    if ($.config.system.android) {
        $("html").addClass("android");
    }
    //标记浏览器
    if ($.config.browser.chrome) {
        $("html").addClass("chrome");
    }
    if ($.config.browser.firefox) {
        $("html").addClass("firefox");
    }
    if ($.config.browser.iPad) {
        $("html").addClass("am-pad");
    }
    if ($.config.browser.safari) {
        $("html").addClass("safari");
    }
    if ($.config.browser.msie) {
        $("html").addClass("msie");
    }
    //标记客户端
    if (getQueryString("d") === "a") {
        $("html").addClass("am-mob am-app");
        $(".am-pc,.am-wx").remove();
        setHref("a");
        setHeaderTimebar();
    } else
    if (getQueryString("d") === "w") {
        $("html").addClass("am-mob am-wx");
        $(".am-pc,.am-app").remove();
        setHref("w");
        setHeaderTimebar();
        setWxPageload();
        if (!$.config.browser.wechat) { setWxHeader() }
    } else {
        $("html").addClass("am-pc");
        $(".am-mob,.am-app,.am-wx").remove();
        setHref("p");
        checkBroswerVersion();
    }
};
globalSet();
