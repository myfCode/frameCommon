! function() {
    if (typeof define === "function" && define.amd) {
        define("global", ['jquery', 'IScroll', 'imagesloaded', 'royalslider'], function($, IScroll) {
            init($, IScroll);
        });
    } else {
        init($, IScroll);
    }

    function init($, IScroll) {

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

! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fn.fnAutoTitle = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var $this = null;
    var size = null;
    var title = null;
    var height = 46;

    var methods = {
        init: function() {
            $this = $(this);
            methods._checkOnly();
            size = parseInt($this.css("font-size"));
            title = $this.text();
            if ($this.height() <= height) {
                $this.addClass("am-on");
            } else {
                methods._setFontSize();
            }
            return $this;
        },
        //字号缩小处理
        _setFontSize: function() {
            size -= 1; //每次递减字号
            $this.css({
                "font-size": size + "px"
            });
            if ($this.height() > height && size > $.fontSize) {
                methods._setFontSize();
            } else if ($this.height() > height) {
                methods._setLength();
            } else {
                $this.addClass("am-on");
            }
        },
        //删减尾字符处理
        _setLength: function() {
            if ($this.height() > height) {
                title = title.substring(0, $this.text().length - 1);
                $this.text(title);
                methods._setLength();
            }
            //最后一次删减后去掉3位补"..."
            else {
                title = title.substring(0, $this.text().length - 3);
                $this.text(title + "...");
                $this.addClass("am-on");
            }
        },
        //控件唯一性检查
        _checkOnly: function() {
            if ($this.length > 1) {
                $this.not(':first-of-type').remove();
                $this = $this.eq(0);
                $.console("this plugin support only one selector");
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnBanner = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        speed: 3,
        onReady: function() {},
        onSlide: function(index) {},
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $slider = $this.royalSlider({
                    autoHeight: false,
                    arrowsNav: false,
                    fadeinLoadedSlide: false,
                    controlNavigationSpacing: 0,
                    controlNavigation: 'bullets',
                    imageScaleMode: 'fill',
                    imageAlignCenter: true,
                    loop: false,
                    loopRewind: true,
                    numImagesToPreload: 6,
                    slidesSpacing: 0,
                    autoScaleSlider: true,
                    autoScaleSliderWidth: "100%",
                    autoScaleSliderHeight: "100%",
                    autoPlay: {
                        enabled: true,
                        pauseOnHover: true,
                        stopAtAction: false,
                        delay: opt.speed * 1000
                    }
                }).data('royalSlider');
                $slider.ev.on("rsAfterContentSet", function() {
                    opt.onReady();
                });
                $slider.ev.on("rsAfterSlideChange", function() {
                    opt.onSlide($slider.currSlideId);
                });
            });
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnBodyHeight = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var headerH = $("header.am-app:not(.am-hide)").outerHeight() || 0;
    var fixtopH = $("body>.am-pos-fixt").outerHeight() || 0;
    var noticeTopH = $("body>.am-notice-top").outerHeight() || 0;
    var noticeBottomH = $("body>.am-notice-bar").outerHeight() || 0;
    var fixbottomH = $("body>.am-pos-fixb:visible").outerHeight() || 0;

    var methods = {
        init: function() {
            $.amBody.css({
                bottom: noticeBottomH + fixbottomH,
                top: noticeTopH + headerH + fixtopH
            });
            //设置fixt容器的顶间距
            $("body>.am-pos-fixt").eq(0).css({
                top: noticeTopH + headerH
            });
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnBodyInner = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            methods._setBodyInner();
        },
        //检测并添加inner结构
        _setBodyInner: function() {
            if (!$(".am-body-inner").length) {
                $.amBody.wrapInner("<div class='am-body-inner' />");
                $.amBodyInner = $("div.am-body-inner").eq(0);
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnBtnSwitch = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            x: null,
            _x: null,
            y: null,
            _y: null,
            state: null,
            _state: null
        },
        touchSensitive: 80,
        onSwitch: function(id, state) {}
    };
    var lock = false;
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                $this.data(opt._data);
                $this
                    .off($.touchstart + ".btnswitch")
                    .on($.touchstart + ".btnswitch", function(e) {
                        methods._btnTouchStart(e, $this);
                    });
            });
        },
        //按钮按下事件
        _btnTouchStart: function(e, $this) {
            if (!lock) {
                //加锁
                lock = true;
                //禁用页面滚动条
                $.scrollY[0] ? $.scrollY[0].disable() : false;
                //改变按钮样式，绑定事件
                $this.addClass("am-active");
                //定义坐标
                $.settouch.init(e);
                //记录原始值
                $this.data({
                    _x: $.touchX,
                    _y: $.touchY,
                    _state: $this.hasClass("am-on")
                });
                $this.on($.touchend + ".btnswitch", function(e) {
                    methods._btnTouchEnd(e, $this);
                });
                $this.on($.touchmove + ".btnswitch", function(e) {
                    methods._btnTouchMove(e, $this);
                });
                return $this;
            }
        },
        //按钮松开事件
        _btnTouchEnd: function(e, $this) {
            //启用页面滚动条
            $.scrollY[0] ? $.scrollY[0].enable() : false;
            //切换状态
            if ($this.hasClass("am-on")) {
                $this.removeClass("am-on");
            } else {
                $this.addClass("am-on");
            }
            $this.removeClass("am-active");
            $this.off($.touchend + ".btnswitch");
            $this.off($.touchmove + ".btnswitch");
            //当按键弹回后执行回调
            setTimeout(function() {
                opt.onSwitch(methods._getId($this), $this.hasClass("am-on"));
                //解锁
                lock = false;
            }, $.globalSpeed);
            return $this;
        },
        //按钮移动事件
        _btnTouchMove: function(e, $this) {
            //定义坐标
            $.settouch.init(e);
            $this.data({
                x: $.touchX - $this.data("_x"),
                y: $.touchY - $this.data("_y")
            });
            //移动超出范围
            if (Math.abs($this.data("y")) > opt.touchSensitive || Math.abs($this.data("x")) > opt.touchSensitive) {
                $this.removeClass("am-active");
                $this.data({ "state": $this.hasClass("am-on") });
                $this.off($.touchend + ".btnswitch").off($.touchmove + ".btnswitch");
                //有改变开关状态
                if ($this.data("_state") !== $this.data("state")) {
                    opt.onSwitch($this.attr("id") || undefined, $this.hasClass("am-on"));
                }
                //启用页面滚动条
                $.scrollY[0] ? $.scrollY[0].enable() : false;
            }
            //移动在范围内
            else {
                //切换为关闭
                if ($this.hasClass("am-on") && $this.data("x") < opt.touchSensitive / 4 * -1) {
                    $this.removeClass("am-on");
                    $this.data("state", $this.hasClass("am-on"));
                    $this.off($.touchend + ".btnswitch").on($.touchend + ".btnswitch", function() {
                        methods._btnTouchMoveEnd($this);
                    });
                } else
                //切换到开启
                if (!$this.hasClass("am-on") && $this.data("x") > opt.touchSensitive / 4) {
                    $this.addClass("am-on");
                    $this.data("state", $this.hasClass("am-on"));
                    $this.off($.touchend + ".btnswitch").on($.touchend + ".btnswitch", function() {
                        methods._btnTouchMoveEnd($this);
                    });
                }
            }
            //解锁
            lock = false;
            return $this;
        },
        //按键移动超出范围
        _btnTouchMoveEnd: function($this) {
            $this.removeClass("am-active");
            if ($this.data("_state") !== $this.data("state")) {
                opt.onSwitch(methods._getId($this), $this.hasClass("am-on"));
            }
            return $this;
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnBtnTouch = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        //定义目标范围
        target: "\
            .am-btn:not(.am-disable):not(.am-loading),\
            .am-btn-active:not(.am-disable),\
            .am-popbtn:not(.am-disable),\
            a.am-row:not(.am-disable),\
            label.am-row:not(.am-disable),\
            div.am-filter>a,\
            div.am-sort>a,\
            div.am-panel-btn>a,\
            .am-header>a[class*='btn-'],\
            .am-slidedown>.am-row>a.am-row-title"
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            //绑定触发事件，仅在范围内生效
            if ($.html.hasClass("am-mob")) {
                $(document)
                    .off($.touchstart + ".btntouch").on($.touchstart + '.btntouch', opt.target, function() {
                        $(this).addClass("am-active");
                    })
                    .off($.touchend + ".btntouch").on($.touchend + ".btntouch", opt.target, function() {
                        $(this).removeClass("am-active");
                    })
                    .off($.touchmove + ".btntouch").on($.touchmove + ".btntouch", opt.target, function() {
                        //check touchmove && filter canmove btn(use for keyboard)
                        if ($.touchMoved && !$(this).hasClass("canmove")) {
                            $(this).removeClass("am-active");
                        }
                    });
            } else if ($.html.hasClass("am-pc")) {
                $(document)
                    .off("mouseenter.btntouch").on("mouseenter.btntouch", opt.target, function() {
                        $(this).addClass("am-active");
                    })
                    .off("mouseleave.btntouch").on("mouseleave.btntouch", opt.target, function() {
                        $(this).removeClass("am-active");
                    });
            }
        }
    }

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnBtnVerifyCode = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            time: null,
            timeout: null
        },
        time: 60,
        speed: 1,
        onComplete: function(id) {}
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                $this.data("time", opt.time);
                if (!$this.hasClass("am-disable") && $this.data("time") == opt.time) {
                    $this.addClass("am-disable");
                    methods._startCountDown($this);
                }
            });
        },
        _startCountDown: function($this) {
            $this.text($this.data("time"));
            if ($this.data("time") > 0) {
                $this.data("time", $this.data("time") - opt.speed);
                $this.data("timeout", setTimeout(function() {
                    methods._startCountDown($this);
                }, 1000));
            } else {
                methods.clear($this);
            }
            return $this;
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        },
        clear: function($this) {
            $this = $this || $(this);
            $this.text("");
            $this.removeClass("am-disable");
            clearTimeout($this.data("timeout"));
            opt.onComplete(methods._getId($this));
            return $this;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnCheckDevice = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            methods.checkReady();
            methods.checkAnimation();
            methods.checkOrientation();
            $(window)
                .off("orientationchange")
                .on("orientationchange", methods.checkOrientation);
        },
        //轮训检测窗口宽高
        checkReady: function() {
            if (!($(window).height() > 1)) {
                setTimeout(methods.checkReady(), 1000 / 60);
            } else {
                $.winW = $(window).width();
                $.winH = $(window).height();
                methods.checkFontSize();
            }
        },
        //检测设备匹配动画效果
        checkAnimation: function() {
            if (($.config.system.android && $.config.version < 6.0) || ($.config.system.ios && $.config.version < 8.0)) {
                $.globalEffect = false;
                $.body.addClass("am-effect-off");
            } else {
                $.globalEffect = true;
                $.body.removeClass("am-effect-off");
            }
            //设置全局js动画时长
            $.globalSpeed = $.globalEffect ? 300 : 0;
        },
        //检测设备旋转状态
        checkOrientation: function() {
            clearTimeout($.orientationTimeout);
            $.orientationTimeout = setTimeout(function() {
                $.winW = $(window).width();
                $.winH = $(window).height();
                if (window.orientation === 90 || window.orientation === -90) {
                    $.body.addClass("am-orientation-on");
                } else if (window.orientation === 0 || window.orientation === 180) {
                    $.body.removeClass("am-orientation-on");
                }
                for (var i = 0; i < $.scrollY.length; i++) {
                    $.scrollY[i].refresh();
                }
            }, 200);
        },
        //检测标准字号
        checkFontSize: function() {
            $.fontSize = parseInt($("html").css("font-size"));
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnChecked = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            state: [],
            length: null
        },
        onChecked: function(name, state) {}
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $icon = $this.find("span[class*=am-icon-]");
                methods._setData($this);
                $this.off($.touchend + ".checked").on($.touchend + ".checked", function() {
                    //检测点击移动 & 当前禁用
                    if (!$.touchMoved && !$this.hasClass("am-disable")) {
                        methods._checkChange($this, $icon);
                    }
                });
            });
        },
        //设置各种data参数
        _setData: function($this) {
            //设置当前点击组长度
            $this.data("length", $("label[data-name='" + $this.data("name") + "']").length);
        },
        _checkChange: function($this, $icon) {
            //type radio
            if ($this.data("type") === "radio") {
                $("label[data-name='" + $this.data("name") + "']").find("span.am-icon-radio").removeClass("am-on");
                $icon.addClass("am-on");
                //state set
                $this.data("state", [$this.index()]);
            }
            //type checkbox
            else if ($this.data("type") === "checkbox") {
                if ($icon.hasClass("am-on")) {
                    $icon.removeClass("am-on");
                } else {
                    $icon.addClass("am-on");
                }
                //state array set
                var tempType = [];
                for (var i = 0; i < $this.data("length"); i++) {
                    tempType.push($("label[data-name='" + $this.data("name") + "']").eq(i).find("span.am-on").length || 0);
                }
                $this.data("state", tempType);
            }
            //callback
            opt.onChecked($this.data("name"), $this.data("state"));
            return $this;
        },
        clear: function($this) {
            $this = $this || $(this);
            $this.find("span[class*=am-icon-]").removeClass("am-on").data(opt._data);
            return $this;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fn.fnClipPic = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        pic:null,//jquery selection
        dock:null,//jquery selection
        picWidth: 0.9,
        onConfrim: function(x, y, w, h) {},
        onCancel: function(){}
    };
    var $this = null; //裁切容器
    var $img = null; //被裁切图片
    var $dock = null; //底部按钮组
    var $btnConfrim = null; //完成按钮
    var $btnCancel = null; //取消按钮
    var iw, ih = null; //图片宽度
    var bw, bh = null; //容器宽高
    var bl, bt, br, bb = null; //容器左上右下
    var oh, ow, ol, ot, _ow, _oh; //图片高宽左上, 图片原始宽高
    var x0, _x0, y0, _y0; //_x0横向距离obj边缘||x0新的左边距
    var x1, _x1, y1, _y1; //同上
    var xc, yc, mxc, myc; //双指中心xy, 及xy位移
    var xx, yy, zz, _zz; //xyz三边长度, _zz斜边原始长度
    var touch0, touch1; //触摸点0, 1
    var scale = 1;
    var _scale = 1;
    var scaleX, scaleY, scaleO; //放大比例, 上次比例, 中心点横向比例, 中心点纵向比例

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = opt.pic;
            $dock = opt.dock; //底部按钮组
            $btnConfrim = $dock.find(".confrim");
            $btnCancel = $dock.find(".cancel");
            $img = $this.find("img"); //移动的图片
            //初始执行
            methods._setPic();
            methods._autoCenter();
            methods._setMask();
            //绑定事件
            $this
                .off($.touchstart + ".clippic")
                .off($.touchend + ".clippic")
                .on($.touchstart + ".clippic", function(e) {
                    methods._imgTouchStart(e);
                })
                .on($.touchend + ".clippic", function(e) {
                    methods._imgTouchEnd(e);
                });
            $btnConfrim
                .off($.touchend + ".clippic")
                .on($.touchend + ".clippic", methods._btnConfrim);
            $btnCancel
                .off($.touchend + ".clippic")
                .on($.touchend + ".clippic", methods._btnCancel);
            return $this;
        },
        //初始自适应居中
        _autoCenter: function() {
            //图片宽高比小于窗口宽高比
            if ($img.width() / $img.height() < bw / bh) {
                //计算宽高
                ow = _ow = bw; //宽度固定
                oh = "auto"; //高度自适应
                //设置宽高
                $img.css({
                    height: oh,
                    width: ow
                });
                //计算居中
                ot = (bh - $img.height()) / 2;
                ol = 0;
                //设置居中
                $img.css({
                    top: ot,
                    left: ol
                });
                //计算偏移值
                oh = _oh = $img.height();
                scaleO = iw / bw;
                x0 = ol;
                y0 = ot;
            }
            //大于
            else {
                //计算宽高
                oh = _oh = bh; //高度固定
                ow = "auto"; //宽度自适应
                //设置宽高
                $img.css({
                    height: oh,
                    width: ow
                });
                //计算居中
                ol = (bw - $img.width()) / 2;
                ot = 0;
                //设置居中
                $img.css({
                    top: ot,
                    left: ol
                });
                //计算偏移值
                ow = _ow = $img.width();
                scaleO = ih / bh;
                x0 = ol;
                y0 = ot;
            }
        },
        //目标区域开始点击事件
        _imgTouchStart: function(e) {
            //双指点击
            if (e.originalEvent.targetTouches[1]) {
                //第一手指
                touch0 = e.originalEvent.targetTouches[0];
                _x0 = Math.ceil(Number(touch0.pageX - $img.position().left));
                _y0 = Math.ceil(Number(touch0.pageY - $img.position().top));
                //第二手指
                touch1 = e.originalEvent.targetTouches[1];
                _x1 = Math.ceil(Number(touch1.pageX - $img.position().left));
                _y1 = Math.ceil(Number(touch1.pageY - $img.position().top));
                //计算双指中心点
                xc = Math.ceil(Math.abs(((touch1.pageX - bl) + (touch0.pageX - bl)) / 2));
                yc = Math.ceil(Math.abs(((touch1.pageY - bt) + (touch0.pageY - bt)) / 2));
                //计算枞横定位及缩放比
                mxc = xc - $img.position().left;
                myc = yc - $img.position().top;
                scaleX = mxc / ow;
                scaleY = myc / oh;
                //缩放初始值
                xx = ((touch1.pageX - bl) - (touch0.pageX - bl));
                yy = ((touch1.pageY - bt) - (touch0.pageY - bt));
                _zz = Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
            }
            //单指点击
            else
            if (e.originalEvent.targetTouches[0]) {
                touch0 = e.originalEvent.targetTouches[0];
                _x0 = Math.ceil(Number(touch0.pageX - $img.position().left));
                _y0 = Math.ceil(Number(touch0.pageY - $img.position().top));
            }
            //绑定移动
            $img.on($.touchmove + ".clippic", methods._imgTouchMove);
        },
        //目标区域内移动事件
        _imgTouchMove: function(e) {
            //双指移动
            if (e.originalEvent.targetTouches[1]) {
                touch0 = e.originalEvent.targetTouches[0];
                touch1 = e.originalEvent.targetTouches[1];
                x0 = Math.ceil(Number(touch0.pageX) - _x0);
                y0 = Math.ceil(Number(touch0.pageY) - _y0);
                x1 = Math.ceil(Number(touch1.pageX) - _x1);
                y1 = Math.ceil(Number(touch1.pageY) - _y1);
                xc = Math.ceil(((touch1.pageX - bl) + (touch0.pageX - bl)) / 2);
                yc = Math.ceil(((touch1.pageY - bt) + (touch0.pageY - bt)) / 2);
                //缩放变化值
                xx = ((touch1.pageX - bl) - (touch0.pageX - bl));
                yy = ((touch1.pageY - bt) - (touch0.pageY - bt));
                zz = Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
                //缩放比, 最大放大4倍
                scale = zz / _zz * _scale;
                if (scale < 1) {
                    scale = 1;
                } else if (scale > 4) {
                    scale = 4;
                }
                //缩放后左上边距
                x0 = xc - Math.ceil(_ow * scale * scaleX);
                y0 = yc - Math.ceil(_oh * scale * scaleY);
            } else
            //单指移动
            if (e.originalEvent.targetTouches[0]) {
                touch0 = e.originalEvent.targetTouches[0];
                x0 = Math.ceil(Number(touch0.pageX) - _x0);
                y0 = Math.ceil(Number(touch0.pageY) - _y0);
            }
            //设置四边限位,带入缩放比
            if (x0 > 0) {
                x0 = 0;
            } else if (x0 < bw - _ow * scale) {
                x0 = bw - _ow * scale;
            }
            if (y0 > 0) {
                y0 = 0;
            } else if (y0 < bh - _oh * scale) {
                y0 = bh - _oh * scale;
            }
            //设置图片位置及尺寸
            $img.css({
                left: x0,
                top: y0,
                width: _ow * scale,
                height: _oh * scale
            });
        },
        //目标区别结束点击事件
        _imgTouchEnd: function() {
            //双指移动后又抬起一指, 会有跳动
            $img.off($.touchmove + ".clippic");
            //隐藏双指中心
            //$(".fingerC").hide();
            //更新图片宽高和缩放比
            oh = $img.height();
            ow = $img.width();
            _scale = scale;
        },
        //完成按钮点击
        _btnConfrim: function() {
            var x = Math.round(x0 * scaleO / scale); //实际图片尺寸的左起始点
            var y = Math.round(y0 * scaleO / scale); //实际图片尺寸的上起始点
            var w = Math.round(bw * scaleO / scale); //实际图片尺寸的截取宽度
            var h = Math.round(bh * scaleO / scale); //实际图片尺寸的截取高度
            //call back
            opt.onConfrim(x, y, w, h);
        },
        //取消按钮点击
        _btnCancel: function() {
            opt.onCancel();
        },
        //设置容器定位
        _setPic: function() {
            $this.width(($.winW * opt.picWidth).toFixed(0));
            bw = $this.width();
            $this.height(bw); //显示区域
            bh = $this.width();
            iw = $img.width();
            ih = $img.height();
            bl = Math.round(($.winW - bw) / 2);
            br = $.winW - (bl + bw);
            bt = Math.round(($.winH - $dock.outerHeight() - bh) / 2);
            bb = $.winH - (bt + bh);

            // alert(bl + " / " + bt + " / " + br + " / " + bb + " / " + bw + " / " + bh)
            $this.css({ left: bl, top: bt });
        },
        //设置遮罩效果
        _setMask: function() {
            var maskHtml = "<div class='mask ml'></div><div class='mask mt'></div><div class='mask mr'></div><div class='mask mb'></div>";
            $this.after(maskHtml);
            $(".mask.ml").css({ left: 0, right: "95%", top: bt, bottom: bb });
            $(".mask.mr").css({ left: "95%", right: 0, top: bt, bottom: bb });
            $(".mask.mt").css({ left: 0, right: 0, top: 0, bottom: $.winH - bt + 1 });
            $(".mask.mb").css({ left: 0, right: 0, top: $.winH - bb + 1, bottom: 0 });
        }
    };

}(jQuery);

/*countUp.js by @inorganik*/
// target = id of html element or var of previously selected html element where counting occurs
// startVal = the value you want to begin at
// endVal = the value you want to arrive at
// decimals = number of decimal places, default 0
// duration = duration of animation in seconds, default 2
// options = optional object of options (see below)
var CountUp = function(target, startVal, endVal, decimals, duration, options) {
    // make sure requestAnimationFrame and cancelAnimationFrame are defined
    // polyfill for browsers without native support
    // by Opera engineer Erik Möller
    var lastTime = 0;
    var vendors = ['webkit', 'moz', 'ms', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
            window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
    var self = this;
    self.version = function() {
        return '1.8.5';
    };

    function formatNumber(num) {
        num = num.toFixed(self.decimals);
        num += '';
        var x, x1, x2, rgx;
        x = num.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? self.options.decimal + x[1] : '';
        rgx = /(\d+)(\d{3})/;
        if (self.options.useGrouping) {
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + self.options.separator + '$2');
            }
        }
        return self.options.prefix + x1 + x2 + self.options.suffix;
    }
    // Robert Penner's easeOutExpo
    function easeOutExpo(t, b, c, d) {
        return c * (-Math.pow(2, -10 * t / d) + 1) * 1024 / 1023 + b;
    }

    function ensureNumber(n) {
        return (typeof n === 'number' && !isNaN(n));
    }
    // default options
    self.options = {
        useEasing: true, // toggle easing
        useGrouping: true, // 1,000,000 vs 1000000
        separator: ',', // character to use as a separator
        decimal: '.', // character to use as a decimal
        easingFn: easeOutExpo, // optional custom easing function, default is Robert Penner's easeOutExpo
        formattingFn: formatNumber, // optional custom formatting function, default is formatNumber above
        prefix: '', // optional text before the result
        suffix: '' // optional text after the result
    };
    // extend default options with passed options object
    if (options && typeof options === 'object') {
        for (var key in self.options) {
            if (options.hasOwnProperty(key) && options[key] !== null) {
                self.options[key] = options[key];
            }
        }
    }
    if (self.options.separator === '') self.options.useGrouping = false;
    self.initialize = function() {
        if (self.initialized) return true;
        self.d = (typeof target === 'string') ? document.getElementById(target) : target;
        if (!self.d) {
            console.error('[CountUp] target is null or undefined', self.d);
            return false;
        }
        self.startVal = Number(startVal);
        self.endVal = Number(endVal);
        // error checks
        if (ensureNumber(self.startVal) && ensureNumber(self.endVal)) {
            self.decimals = Math.max(0, decimals || 0);
            self.dec = Math.pow(10, self.decimals);
            self.duration = Number(duration) * 1000 || 2000;
            self.countDown = (self.startVal > self.endVal);
            self.frameVal = self.startVal;
            self.initialized = true;
            return true;
        } else {
            console.error('[CountUp] startVal or endVal is not a number', self.startVal, self.endVal);
            return false;
        }
    };
    // Print value to target
    self.printValue = function(value) {
        var result = self.options.formattingFn(value);

        if (self.d.tagName === 'INPUT') {
            this.d.value = result;
        } else if (self.d.tagName === 'text' || self.d.tagName === 'tspan') {
            this.d.textContent = result;
        } else {
            this.d.innerHTML = result;
        }
    };
    self.count = function(timestamp) {
        if (!self.startTime) { self.startTime = timestamp; }
        self.timestamp = timestamp;
        var progress = timestamp - self.startTime;
        self.remaining = self.duration - progress;
        // to ease or not to ease
        if (self.options.useEasing) {
            if (self.countDown) {
                self.frameVal = self.startVal - self.options.easingFn(progress, 0, self.startVal - self.endVal, self.duration);
            } else {
                self.frameVal = self.options.easingFn(progress, self.startVal, self.endVal - self.startVal, self.duration);
            }
        } else {
            if (self.countDown) {
                self.frameVal = self.startVal - ((self.startVal - self.endVal) * (progress / self.duration));
            } else {
                self.frameVal = self.startVal + (self.endVal - self.startVal) * (progress / self.duration);
            }
        }
        // don't go past endVal since progress can exceed duration in the last frame
        if (self.countDown) {
            self.frameVal = (self.frameVal < self.endVal) ? self.endVal : self.frameVal;
        } else {
            self.frameVal = (self.frameVal > self.endVal) ? self.endVal : self.frameVal;
        }
        // decimal
        self.frameVal = Math.round(self.frameVal * self.dec) / self.dec;
        // format and print value
        self.printValue(self.frameVal);
        // whether to continue
        if (progress < self.duration) {
            self.rAF = requestAnimationFrame(self.count);
        } else {
            if (self.callback) self.callback();
        }
    };
    // start your animation
    self.start = function(callback) {
        if (!self.initialize()) return;
        self.callback = callback;
        self.rAF = requestAnimationFrame(self.count);
    };
    // toggles pause/resume animation
    self.pauseResume = function() {
        if (!self.paused) {
            self.paused = true;
            cancelAnimationFrame(self.rAF);
        } else {
            self.paused = false;
            delete self.startTime;
            self.duration = self.remaining;
            self.startVal = self.frameVal;
            requestAnimationFrame(self.count);
        }
    };
    // reset to startVal so animation can be run again
    self.reset = function() {
        self.paused = false;
        delete self.startTime;
        self.initialized = false;
        if (self.initialize()) {
            cancelAnimationFrame(self.rAF);
            self.printValue(self.startVal);
        }
    };
    // pass a new endVal and start animation
    self.update = function(newEndVal) {
        if (!self.initialize()) return;
        newEndVal = Number(newEndVal);
        if (!ensureNumber(newEndVal)) {
            console.error('[CountUp] update() - new endVal is not a number', newEndVal);
            return;
        }
        if (newEndVal === self.frameVal) return;
        cancelAnimationFrame(self.rAF);
        self.paused = false;
        delete self.startTime;
        self.startVal = self.frameVal;
        self.endVal = newEndVal;
        self.countDown = (self.startVal > self.endVal);
        self.rAF = requestAnimationFrame(self.count);
    };
    // format startVal on initialization
    if (self.initialize()) self.printValue(self.startVal);
};

! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fnEyeNumber = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            number: null
        },
        isOpen: true,
        onChanged: function(state) {}
    };
    var $this = $(".am-icon-eye-w").eq(0);
    var $num = $(".am-eye-number");
    var hiddenHtml = "****";
    var loadingHtml = "<p>.</p>";
    var lock = false;
    // cuOptions需引用countUp.js
    var cuOptions = {
        useEasing: true,
          useGrouping: true,
          separator: ',',
          decimal: '.',
    };

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            methods._checkText();
        },
        //判断是否已有数据（微信）
        _checkText: function() {
            $num.each(function() {
                $(this).text() === "" ? $(this).html(loadingHtml + loadingHtml + loadingHtml) : false;
            });
        },
        //切换
        _checkChange: function() {
            if (!lock) {
                lock = true;
                if (opt.isOpen) {
                    methods.eyeOpen();
                } else {
                    methods.eyeClose();
                }
                //call back
                opt.onChanged(!opt.isOpen);
                //reset lock
                setTimeout(function() {
                    lock = false;
                }, 300);
            }
        },
        //眼睛打开事件
        eyeOpen: function() {
            //设置眼睛图标打开样式
            $this.addClass("am-on");
            opt.isOpen = false;
            //设置数值状态
            $num.each(function() {
                var num = Number($(this).data("number"));
                var id = $(this).attr("id");
                var countUp;
                $(this).addClass("am-on");
                if (!isNaN(num)) {
                    countUp = new CountUp(id, 0, num, 2, 0.3, cuOptions);
                    countUp.start();
                } else {
                    $(this).text($(this).data("number"));
                }
            });
        },
        //眼睛关闭事件
        eyeClose: function() {
            //设置眼睛图标关闭样式
            $this.removeClass("am-on");
            opt.isOpen = true;
            //设置数值状态
            $num.each(function() {
                $(this).removeClass("am-on").text(hiddenHtml);
            });
        },
        ready: function() {
            //显示眼睛按钮
            $this.show();
            //初始data记录
            $num.each(function(i) {
                $(this).data({
                    "number": $(this).text()
                }).addClass("am-ready");
            });
            //初始执行
            methods._checkChange();
            //绑定事件
            $this.off($.touchend + ".eyenumber").on($.touchend + ".eyenumber", function() {
                //检测点击移动 & 当前禁用
                if (!$.touchMoved) {
                    methods._checkChange();
                }
            });
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //hasn't opt
    //has each

    $.fn.fnFixedTop = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var _data = {
        objH: null
    };
    var offsetGap = -1; //间距偏移值
    var scrollIndex = null; //纵向滚动条索引
    var defaultTop = null; //默认顶间距
    var headerH = null; //头部高度

    var methods = {
        init: function() {
            return this.each(function() {
                var $this = $(this);
                scrollIndex = $this.parents("div[class*=scrollY]").index();
                defaultTop = $this.offset().top;
                headerH = $.amHeader.height() || 0;
                $this.data("objH", $this.outerHeight());

                //初始样式
                $this.addClass("am-pos-fixt");
                //绑定滚动事件
                if ($.html.hasClass("am-mob")) {
                    $.sTop = $.scrollY[scrollIndex].y;
                    $.scrollY[scrollIndex].off("scroll", methods._scroll);
                    $.scrollY[scrollIndex].on("scroll", function() {
                        methods._scroll($this);
                    });
                } else if ($.html.hasClass("am-pc")) {
                    //pc端不计算header高度
                    headerH = 0;
                    $.sTop = $(window).scrollTop() * -1;
                    $(window).off("scroll.fixedtop", methods._scroll);
                    $(window).on("scroll.fixedtop", function() {
                        methods._scroll($this);
                    });
                    //pc帮助中心左侧导航底部计算
                    if ($this.hasClass("help-nav")) {
                        $(window).on("scroll.checkfooter", function() {
                            methods._checkFooter($this);
                        });
                    }
                }
                methods._scroll($this);
            });
        },
        //滚动事件
        _scroll: function($this) {
            if ($.html.hasClass("am-pc")) { $.sTop = $(window).scrollTop() * -1 }
            //保持在屏幕顶部
            var y = ($.sTop + defaultTop - headerH - offsetGap) * -1;
            if (y >= 0) {
                $this.css({
                    "-webkit-transform": "translate(0," + y + "px)",
                    "-moz-transform": "translate(0," + y + "px)",
                    "-ms-transform": "translate(0," + y + "px)",
                    "transform": "translate(0," + y + "px)"
                });
                // 浮动样式切换
                if (!$this.hasClass("am-on")) {
                    $this.addClass("am-on");
                    // 影响高度变化时需刷新
                    if ($this.data("objH") != $this.outerHeight()) {
                        $.scrollY[0] ? $.scrollY[0].refresh() : false;
                    }
                }
            } else {
                methods._clearFix($this);
            }
        },
        //清除定位
        _clearFix: function($this) {
            $this.css({
                "-webkit-transform": "translate(0,0)",
                "-moz-transform": "translate(0,0)",
                "-ms-transform": "translate(0,0)",
                "transform": "translate(0,0)"
            });
            // 浮动样式切换
            if ($this.hasClass("am-on")) {
                $this.removeClass("am-on");
                // 影响高度变化时需刷新
                if ($this.data("objH") != $this.outerHeight()) {
                    $.scrollY[0] ? $.scrollY[0].refresh() : false;
                }
            }
        },
        //检查底部
        _checkFooter: function($this) {
            var t;
            if ($(document).height() + $.sTop - $this.data("objH") - $("footer.am-pc").outerHeight() - $.fontSize * 2 < 0) {
                t = $(document).height() - $this.data("objH") - defaultTop - $("footer.am-pc").outerHeight() - $.fontSize * 2;
                $this.css({
                    "-webkit-transform": "translate(0," + t + "px)",
                    "-moz-transform": "translate(0," + t + "px)",
                    "-ms-transform": "translate(0," + t + "px)",
                    "transform": "translate(0," + t + "px)"
                });
            }
        },
        refresh: function($this) {
            $this = $this || $(this);
            $.sTop = 0;
            methods._clearFix($this);
            methods._scroll($this);
            return $this;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fn.fnIndexBar = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var opt;
    var def = {
        indexData: false
    };
    var $slide = $(".am-indexBar-slide");
    var $index = $("#am-index").eq(0);
    var $this = null;
    var $bar = null;
    var indexH = null;
    var length = null;
    var indexTop = null;
    var current = 0;
    var y = null;
    var slideT = null;
    var slideH = null;
    var defaultTop = null; //无header时上边框为0

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = $(this);
            methods._checkOnly();
            $bar = $this.find("div.am-index");
            indexH = $bar.eq(0).height();
            length = $bar.length;
            indexTop = new Array(length);
            defaultTop = $.amHeader.filter(":visible").height() || 0;
            methods.refresh($this);
            //set scroll
            if ($.scrollY[0]) {
                $.scrollY[0].off("scroll", methods._scroll);
                $.scrollY[0].on("scroll", methods._scroll);
            } else {
                $.console("can not find $.scrollY");
            }
            //set slide
            if (opt.indexData && !$slide.length) {
                methods._setSlide();
            }
            return this;
        },
        //check add $slide
        _setSlide: function() {
            $.amBody.addClass("page-noscroll");
            //set html
            var slideHtml = "<div class='am-indexBar-slide'>";
            for (var i = 0; i < opt.indexData.length; i++) {
                slideHtml += "<div>" + opt.indexData[i].toUpperCase() + "</div>";
            }
            slideHtml += "</div>";
            //add dom
            $.amBodyInner.append(slideHtml);
            //set event
            $slide = $(".am-indexBar-slide");
            $slide.on($.touchmove, methods._slideTouchMove);
            $slide.children("div").on($.touchend, methods._slideTouchEnd);
            slideT = $slide.offset().top;
            slideH = $slide.height();
        },
        //scroll event
        _scroll: function(c) {
            //set header container
            if (indexTop[0] > $.sTop * -1 + defaultTop && $index.length) {
                $index.remove();
                $index = false;
            } else if (indexTop[0] < $.sTop * -1 + defaultTop && !$index.length) {
                $.body.append("<div id='am-index' class='am-index' style='top:" + defaultTop + "px'></div>");
                $index = $("#am-index").eq(0);
            }
            //判断是否指定current值，只在scroll事件中
            if (c === undefined) {
                //current checking
                for (var i = 0; i < length; i++) {
                    if (indexTop[i] < $.sTop * -1 + defaultTop) {
                        current = i;
                        $index.html($bar.eq(current).html());
                    }
                }
            }
            //change animate
            if (indexTop[current + 1] < $.sTop * -1 + defaultTop + indexH) {
                var y = indexTop[current + 1] - $.sTop * -1 - defaultTop - indexH;
                $index.find("div").css({
                    "-webkit-transform": "translate3d(0," + y + "px,0)",
                    "-moz-transform": "translate3d(0," + y + "px,0)",
                    "transform": "translate3d(0," + y + "px,0)"
                });
            }
        },
        //index条点击事件
        _slideTouchEnd: function() {
            if (!$.touchMoved) {
                current = $(this).index();
                methods._checkScrollEnd();
            }
        },
        //index条move事件
        _slideTouchMove: function(e) {
            //定义坐标
            $.settouch.init(e);
            y = $.touchY - slideT;
            current = Math.round(y / (slideH / length) - 0.5);
            current < 0 ? current = 0 : true;
            current > length - 1 ? current = length - 1 : true;
            methods._checkScrollEnd();
        },
        //检查当前index下数据是否满足一页，设置滚动条y轴
        _checkScrollEnd: function() {
            var t = -1 * indexTop[current] + $.amHeader.height();
            if (t < $.scrollY[0].maxScrollY) {
                t = $.scrollY[0].maxScrollY;
            } else {
                if ($index.length) {
                    $index.html($bar.eq(current).html());
                }
            }
            $.scrollY[0].scrollTo(0, t);
            methods._scroll(current);
        },
        //控件唯一性检查
        _checkOnly: function() {
            if ($this.length > 1) {
                $this.not(':first-of-type').remove();
                $this = $this.eq(0);
                $.console("this plugin support only one selector");
            }
        },
        //refresh event
        refresh: function($this) {
            $this = $this || $(this);
            $bar = $this.find("div.am-index");
            length = $bar.length;
            //set each indexTop
            for (var i = 0; i < length; i++) {
                //am-body scroll need add value sTop
                indexTop[i] = $bar.eq(i).offset().top + $.sTop * -1;
            }
            return $this;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnInput = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            required: null,
            formName: null
        },
        onClear: function(id) {}
    };
    var timeout;
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function(i) {
                var $this = $(this);
                var $btnClear = $this.parent().children(".am-input-clear");
                var $btnPwd = $this.parent().children(".am-input-pwd");
                $this.data("required", $this.attr("required") ? true : false);
                $this.data("formName", $this.data("required") ? $this.parents("[data-form*='form']").data("form") : "form");
                var $formBtn = $this.data("required") ? $("[data-form='" + $this.data("formName") + "-btn']") : false;
                var $formInput = $this.data("required") ? $("[data-form='" + $this.data("formName") + "']").find("input[required]") : false;

                //绑定input相关事件
                $this
                    .off("input.clear")
                    .on("input.clear", function() {
                        methods._checkBtnClear($this, $btnClear);
                        methods._checkFormBtn($formBtn, $formInput);
                        if ($this.val() === "") {
                            methods._inputClear($this, $btnClear);
                        }
                    })
                    .off("focus.clear")
                    .off("blur.clear")
                    .off("touchend.autoscroll")
                    .on("focus.clear", function() {
                        methods._checkBtnClear($this, $btnClear);
                    })
                    .on("blur.clear", function() {
                        methods._checkBtnClear($this, $btnClear);
                    })
                    .on("touchend.autoscroll", function() {
                        methods._autoScroll($this);
                    });

                //绑定clear按钮相关事件
                if ($btnClear.length > 0) {
                    $btnClear
                        .off($.touchend + ".clear")
                        .on($.touchend + ".clear", function() {
                            //touchmoved checking
                            if (!$.touchMoved) {
                                methods._inputClear($this, $btnClear);
                                methods._checkFormBtn($formBtn, $formInput);
                            }
                        });
                }

                //绑定pwd按钮相关事件
                if ($btnPwd.length > 0) {
                    $btnPwd
                        .show()
                        .off($.touchend + ".pwd")
                        .on($.touchend + ".pwd", function() {
                            //touchmoved checking
                            if (!$.touchMoved) {
                                if (!$this.parent().hasClass("am-on")) {
                                    $this.parent().addClass("am-on");
                                    $this.attr({
                                        "type": "text"
                                    });
                                } else {
                                    $this.parent().removeClass("am-on");
                                    $this.attr({
                                        "type": "password"
                                    });
                                }
                            }
                        });
                }

                //初始检查required表单按钮状态
                methods._checkFormBtn($formBtn, $formInput);
            });
        },
        _inputClear: function($this, $btnClear) {
            $this.val("");
            methods._checkBtnClear($this, $btnClear);
            opt.onClear($this.attr("id") || undefined);
        },
        _checkBtnClear: function($this, $btnClear) {
            // settimeout 250 for pc blur time
            setTimeout(function() {
                if ($this.val() && $this.is(":focus")) {
                    $btnClear.show();
                } else {
                    $btnClear.hide();
                    clearTimeout(timeout);
                }
            }, 250);
        },
        _checkFormBtn: function($formBtn, $formInput) {
            var pass = true;
            if ($formBtn) {
                for (var i = 0; i < $formInput.length; i++) {
                    if ($formInput.eq(i).val() === "") {
                        pass = false;
                    }
                }
                pass ? $formBtn.removeClass("am-disable") : $formBtn.addClass("am-disable");
            }
        },
        //获取焦点时滚动避开键盘高度
        _autoScroll: function($this) {
            if ($.html.hasClass("android")) {
                var t = $this.offset().top - $.scrollY[$.xIndex].y;
                if (t > $.winH / 2) {
                    t = (t - $.winH / 3) * -1;
                    timeout = setTimeout(function() {
                        $.scrollY[$.xIndex].scrollTo(0, t);
                    }, 500);
                }
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnInputBlur = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            var $slideRulerInner = $(".am-slideRuler");

            $(document).off($.touchend + ".inputBlur");
            $(document).on($.touchend + ".inputBlur", function(e) {
                if ((e.target.tagName !== "INPUT")
                 && ($("svg").has(e.target).length === 0)
                 && (e.target.className.indexOf("am-input-clear") < 0)
                 && (e.target.className.indexOf("ui-autocomplete") < 0)
                 && (e.target.className.indexOf("ui-menu-item") < 0)
                 && (e.target.className.indexOf("ui-corner-all") < 0)
                 && ($slideRulerInner.has(e.target).length === 0)) {
                    $(".am-input").blur();
                }
            });
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //hasn't opt
    //has each

    $.fn.fnInputSelect = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            return this.each(function() {
                var $this = $(this);
                var $select = $this.find("select");

                methods._checkFirst($this, $select);
                methods._checkSelected($this, $select);

                //绑定事件
                $select.off("change").one("change", function() {
                    methods._change($this);
                });
            });
        },
        //检查第一项“请选择” & disabled & selected
        _checkFirst: function($this, $select) {
            var $first = $select.children("option").eq(0);
            if ($first.text().indexOf("请选择")) {
                $select.prepend("<option>请选择</option>");
                $first = $select.children("option").eq(0);
            }
            if (!$select.find("option[disabled]").length) {
                $first.attr("disabled", "disabled");
            }
            if (!$select.find("option[selected]").length) {
                $first.attr("selected", "selected");
            }
        },
        //检查默认值
        _checkSelected: function($this, $select) {
            if ($select.find("option[selected]").index() > 0) {
                methods._change($this);
                $select.off("change");
            }
        },
        //设置各种data参数
        _change: function($this) {
            $this.addClass("am-on");
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //has opt
    //hasn't each

    $.fn.fnKeyBoard = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var opt;
    var def = {
        type: 0, //0数字，1字母，2符号，3金额
        min: 6, //最小长度
        max: 20, //最大长度
        letterUp: false, //字母键盘默认为大写
        keyRandom: false, //按键随机排列
        allowClose: true, //是否允许关闭
        allowScroll: true, //是否允许滚动
        filter: [43, 45, 92, 47, 91, 93, 123, 125, 44, 8364, 163, 165, 32], //过渡字符,ascii码
        onChanged: function(val, lastkey) {}, //回调-每次改变数值
        onCancel: function(val) {}, //回调-取消
        onDone: function(val) {}, //回调-完成
        onOffsetMin: function(min) {}, //回调-完成时，长度小于最小值
        onOffsetMax: function(max) {}, //回调-完成时，长度大于最大值
        onFilter: function() {} //回调-遇到过滤字符时
    };
    var $input = null;
    var $keyboard = null;
    var $keyboardCon = null;
    var $keyboardCtrl = null;
    var $keyboardCtrlBtn = null;
    var $keyboardL = null;
    var $keyboardN = null;
    var $keyboardS = null;
    var $keyboardP = null;
    var $keyBtn = null;
    var $keyFnBtn = null;
    var $keyBtnGroup = null;
    var $inputAll = null;
    var $btnClear = null;
    var $btnPwd = null;
    var fnbtnSelector = null;
    var inputVal = null;
    var inputValLast = null;
    var deleteInterval = null;
    var deleteTimeout = null;
    var keyMove_x = null;
    var keyMove_y = null;
    var eyeOpen = null;
    var delayTime = null;
    var arrayAfter = [];
    var arrayBefore = [];
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $input = $(this); //安全键盘输入框
            $keyboardCon = $("#KBCon"); //键盘外层容器
            $keyboard = $keyboardCon.children(".am-keyboard"); //键盘容器
            $keyboardCtrl = $keyboardCon.children(".ctrl"); //隐藏控制容器
            $keyboardL = $keyboard.filter(".letter"); //定义字母键盘
            $keyboardN = $keyboard.filter(".number"); //定义数字键盘
            $keyboardS = $keyboard.filter(".symbol"); //定义符号键盘
            $keyboardP = $keyboard.filter(".price"); //定义金额键盘
            $inputAll = $(".am-keyboard-input");
            $btnClear = $input.prev(".am-input-clear"); //输入框清除按键
            $btnPwd = $btnClear.prev(".am-input-pwd"); //密码显示按键
            fnbtnSelector = ".btnFnLetter,.btnFnSymbol,.btnFnSpace,.btnFnShift,.btnFnDelete,.btnFnCancel,.btnFnDone,.btnFnNull";
            inputVal = $input.data("value") !== undefined ? String($input.data("value")) : ""; //设置输入框当前值，必须为string
            eyeOpen = opt.type === 3 ? 1 : $btnPwd.parent(".am-on").length; //输入框默认显示状态，金额键盘默认打开
            delayTime = 1; //键盘延迟弹出时间
            //重复点击输入框处理
            if ($input.hasClass("am-on")) {
                return false;
            }
            //判断键盘是否已存在
            if ($keyboardCon.length) {
                //清除已展开键盘的眼睛与删除按键
                $inputAll.prev(".am-input-clear").hide().prev(".am-input-pwd").hide();
            }
            //初始化判断letterup
            if (opt.letterUp) {
                $keyboardL.addClass("up");
            }
            //数字键盘初始化按键随机排列
            if (opt.type === 0) {
                methods._keyRandom(opt.type);
            }
            //检查pc及pad端的键盘弹出定位
            $.html.hasClass("am-pc") ? methods._setKbPos() : false;
            //初始化默认键盘类型并显示
            $keyboard.removeClass("am-on").eq(opt.type).addClass("am-on");
            //上拉键盘动画后需延迟200ms设置按键坐标
            setTimeout(function() {
                methods._setKeyPos(opt.type);
            }, $.globalSpeed + 200);
            //定义按键及功能键选择器
            $keyFnBtn = $keyboard.find(fnbtnSelector);
            $keyBtn = $keyboard.find(".am-btn").not(fnbtnSelector);
            //绑定事件
            $keyFnBtn
                .off($.touchend + ".keyboard")
                .off($.touchstart + ".keyboard")
                .off($.touchmove + ".keyboard")
                .on($.touchstart + ".keyboard", methods._keyFnDown)
                .on($.touchend + ".keyboard", methods._keyFnUp)
                .on($.touchmove + ".keyboard", methods._keyFnMove);
            $keyBtn
                .off($.touchend + ".keyboard")
                .off($.touchstart + ".keyboard")
                .off($.touchmove + ".keyboard")
                .on($.touchstart + ".keyboard", methods._keyDown)
                .on($.touchend + ".keyboard", methods._keyUp)
                .on($.touchmove + ".keyboard", methods._keyMove);
            $btnPwd
                .off($.touchend + ".keyboard")
                .on($.touchend + ".keyboard", methods._btnPwdTouch);
            $btnClear
                .off($.touchend + ".keyboard")
                .on($.touchend + ".keyboard", methods._btnClearTouch);
            //设置允许关闭样式
            $keyboardCon.removeClass("cantclsose");
            if (!opt.allowClose) {
                $keyboardCon.addClass("cantclsose");
                $(document).off($.touchend + ".keyboard");
            }
            methods._checkInputBlur();
            //键盘弹出
            setTimeout(function() {
                methods._KBSwitch(1);
                methods._checkBtnState();
                $btnPwd.show();
            }, delayTime);
        },
        //转换千分位
        _toAmount: function(num) {
            if (num) {
                var numArr = (num + '').replace(/,/g, "").split(".");
                var str = numArr[0];
                while (/(\d+)(\d{3})/.test(str)) {
                    str = str.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
                }
                if (numArr.length === 2) {
                    return str + '.' + numArr[1];
                } else {
                    return (numArr[1]) ? (str + '.' + numArr[1]) : str;
                }
            } else {
                return '';
            }
        },
        //检查是否有系统键盘弹出
        _checkInputBlur: function() {
            delayTime = 1;
            $("input").each(function() {
                if ($(this).is(":focus")) {
                    delayTime += 200;
                    return;
                }
            });
        },
        //pc端定位键盘位置
        _setKbPos: function() {
            if ($keyboardCon.prev(".am-popPasscode").length) {
                $keyboardCon.css({ "left": "50%", "top": ($(".am-popPasscode .inner").offset().top + $(".am-popPasscode .inner").outerHeight() + 50) });
            } else {
                $keyboardCon.css({ "left": $input.offset().left, "top": $input.offset().top + $.fontSize * 2.25 + 2 });
            }
        },
        //眼睛按键状态切换
        _btnPwdTouch: function() {
            if (!$.touchMoved) {
                if ($(this).parent().hasClass("am-on")) {
                    $(this).parent().removeClass("am-on");
                    eyeOpen = 0;
                } else {
                    $(this).parent().addClass("am-on");
                    eyeOpen = 1;
                }
                methods._checkBtnPwd();
            }
        },
        //清除按键事件
        _btnClearTouch: function() {
            if (!$.touchMoved) {
                methods.KBClear($input);
            }
        },
        //眼睛按键功能
        _checkBtnPwd: function() {
            $input.data("value", inputVal);
            if (eyeOpen === 0) {
                var tempVal = "";
                for (var i = 0; i < inputVal.length; i++) {
                    tempVal += "●";
                }
                methods._setValue(tempVal);
            } else {
                methods._setValue($input.data("value"));
            }
        },
        //检查清除&完成按键状态
        _checkBtnDone: function() {
            if (inputVal !== "" && $input.hasClass("am-on")) {
                $btnClear.show();
                $keyboard.find(".btnFnDone").addClass("am-on");
            } else {
                $btnClear.hide();
                $keyboard.find(".btnFnDone").removeClass("am-on");
            }
        },
        //检查各种按键状态
        _checkBtnState: function() {
            methods._checkBtnPwd();
            methods._checkBtnDone();
        },
        //检查过滤字符
        _checkFilterKey: function() {
            //包含需要过滤字符,仅处理符号键盘
            if ($keyboardS.hasClass("am-on") && opt.filter.indexOf(ascii) > -1) {
                if (inputValLast === 32) {
                    inputValLast = "空格" //特殊处理"空格"
                } else {
                    inputValLast = String.fromCharCode(inputValLast); //其它过渡字符
                }
                opt.onFilter(inputValLast); //过渡后回调
                inputValLast = ""; //过渡后清除变量
            }
            //不包含需要过滤字符
            else {
                //判断空值不做fromCharCode 否则length会变1
                if (inputValLast != "") {
                    inputValLast = String.fromCharCode(inputValLast);
                }
            }
        },
        //检查placeholder显示状态
        _checkPlaceholder: function() {
            if (inputVal.length) {
                $input.next("sub").addClass("am-off");
            } else {
                $input.next("sub").removeClass("am-off");
            }
        },
        //普通按键down事件
        _keyDown: function() {
            $.scrollY[0] ? $.scrollY[0].disable() : false;
            $keyBtn.removeClass("am-active");
            //解决安卓长按弹出菜单,IOS在屏幕边缘快速点击中断问题
            $keyboardCon.on("touchstart", function(e) {
                e.preventDefault();
            });
        },
        //普通按键up事件
        _keyUp: function() {
            //直接点击，定义inputvallast值
            if (!$.touchMoved) {
                inputValLast = $(this).data("ascii");
            }
            //金额键盘
            if ($keyboardP.hasClass("am-on")) {
                //小数点按键
                if ($(this).hasClass("btn-dot")) {
                    // 小数点只能出现一次，并且不在第一个字符
                    if (inputVal.indexOf(".") > 0 || inputVal.length == 0) {
                        inputValLast = "";
                    }
                }
                //其它按键
                else {
                    // 小数点前的0只能有一个，并且0开头后只能跟小数点
                    if (inputVal.length === 1 && inputVal.indexOf("0") > -1) {
                        inputValLast = "";
                    }
                }
            }
            //过滤禁用字符
            methods._checkFilterKey();
            //处理大写字母转换
            if ($(this).parents(".am-keyboard").hasClass("up")) {
                inputValLast = inputValLast.toUpperCase();
            }
            //设置当前输入框最终结果
            inputVal += inputValLast.replace(/(^\s*)|(\s*$)/g, "");
            //超出max时的处理
            if (inputVal.length > opt.max) {
                inputVal = inputVal.substring(0, opt.max);
                opt.onOffsetMax(opt.max);
            }
            //未超出max时的处理
            else {
                methods._setValue(inputVal);
                opt.onChanged(inputVal, inputValLast);
            }
            //按下移动后，移除所有按键active样式
            if ($.touchMoved) {
                $keyBtnGroup.removeClass("am-active");
            }
            methods._checkBtnState();
            //恢复页面滚动
            $.scrollY[0] ? $.scrollY[0].enable() : false;
        },
        //普通按键move事件
        _keyMove: function(e) {
            //获取手指滑动坐标
            $.settouch.init(e);
            keyMove_x = $.touchX;
            keyMove_y = $.touchY;
            //匹配当前按键
            $keyBtnGroup.each(function() {
                if (keyMove_x > $(this).data("left") && keyMove_x < $(this).data("right") && keyMove_y > $(this).data("top") && keyMove_y < $(this).data("bottom")) {
                    //检查重复执行
                    if (inputValLast !== $(this).data("ascii")) {
                        $keyBtnGroup.removeClass("am-active");
                        $(this).addClass("am-active");
                        inputValLast = $(this).data("ascii");
                    }
                    return;
                }
            });
        },
        //功能按键down事件
        _keyFnDown: function() {
            $.scrollY[0] ? $.scrollY[0].disable() : false;
            //删除按键长按事件
            if ($(this).hasClass("btnFnDelete")) {
                valDelete();
                deleteTimeout = setTimeout(function() {
                    deleteInterval = setInterval(valDelete, 150);
                }, 750);
            }
            $keyBtnGroup.removeClass("am-active");
            //删除字符
            function valDelete() {
                inputVal = inputVal.substring(0, inputVal.length - 1);
                methods._setValue(inputVal);
                methods._checkBtnState();
            }
        },
        //功能按键up事件
        _keyFnUp: function() {
            $.scrollY[0] ? $.scrollY[0].enable() : false;
            //判断触摸移动
            if ($.touchMoved) {
                return false;
            }
            //切换至字母键盘
            if ($(this).hasClass("btnFnLetter")) {
                $keyboardL.addClass("am-on").siblings().removeClass("am-on");
                methods._setKeyPos(1);
            } else
            //切换至符号键盘
            if ($(this).hasClass("btnFnSymbol")) {
                $keyboardS.addClass("am-on").siblings().removeClass("am-on");
                methods._setKeyPos(2);
            } else
            //完成按键
            if ($(this).hasClass("btnFnDone") && $(this).hasClass("am-on")) {
                if (inputVal.length >= opt.min) {
                    methods._KBSwitch(0);
                    opt.onDone(inputVal);
                } else {
                    opt.onOffsetMin(opt.min);
                }
            } else
            //取消按键
            if ($(this).hasClass("btnFnCancel")) {
                methods._KBSwitch(0);
                opt.onCancel(inputVal);
            } else
            //空格按键
            if ($(this).hasClass("btnFnSpace")) {
                methods._checkFilterKey();
                opt.onChanged(inputVal, inputValLast);
            } else
            //Shift按键
            if ($(this).hasClass("btnFnShift")) {
                if ($keyboardL.hasClass("up")) {
                    $keyboardL.removeClass("up");
                } else {
                    $keyboardL.addClass("up");
                }
            } else
            //删除按键
            if ($(this).hasClass("btnFnDelete")) {
                clearInterval(deleteInterval);
                clearTimeout(deleteTimeout);
                opt.onChanged(inputVal, "delete");
            }
            methods._checkBtnState();
        },
        //功能按键move事件
        _keyFnMove: function() {
            //check deleting touchmove
            if ($.touchMoved && $(this).hasClass("btnFnDelete")) {
                clearInterval(deleteInterval);
                clearTimeout(deleteTimeout);
            }
        },
        //按键随机排版处理
        _keyRandom: function(type) {
            //字母与符号键盘二次随机，其它键盘一次随机
            var randomType = type === 2 ? 2 : 1;
            for (var i = 1; i < randomType + 1; i++) {
                //定义普通按键选择器
                $keyBtnGroup = $keyboard.eq(type).children(".am-g").eq(i).children(".am-btn").not(fnbtnSelector);
                $keyboardCtrl.empty();
                $keyBtnGroup.clone().prependTo($keyboardCtrl);
                methods._getKeyIndex();
                methods._setKeyIndex();
                //重新绑定普通按键各类事件
                $keyBtn = $keyboard.eq(type).children(".am-g").eq(i).children(".am-btn").not(fnbtnSelector);
                $keyBtn
                    .off($.touchend + ".keyboard")
                    .off($.touchstart + ".keyboard")
                    .off($.touchmove + ".keyboard")
                    .off($.touchmove + ".btnTouch")
                    .on($.touchstart + ".keyboard", methods._keyDown)
                    .on($.touchend + ".keyboard", methods._keyUp)
                    .on($.touchmove + ".keyboard", methods._keyMove);
            }
        },
        //获取按键位置
        _getKeyIndex: function() {
            arrayAfter = [];
            for (var i = 0; i < $keyBtnGroup.length; i++) {
                arrayAfter.push(i);
            }
        },
        //设置按键位置
        _setKeyIndex: function() {
            arrayBefore = arrayAfter.concat().sort(methods._getRandom);
            $keyboardCtrlBtn = $keyboardCtrl.children(".am-btn");
            for (var i = 0; i < $keyBtnGroup.length; i++) {
                $keyBtnGroup.eq(i).replaceWith($keyboardCtrlBtn.eq(arrayBefore[i]));
            }
        },
        //排列数组算法
        _getRandom: function() {
            return Math.random() > .5 ? -1 : 1;
        },
        //设置普通按键定位范围
        _setKeyPos: function(type) {
            //定义普通按键选择器
            $keyBtnGroup = $keyboard.eq(type).find(".am-btn").not(fnbtnSelector);
            $keyBtnGroup.each(function() {
                var l = Math.round($(this).offset().left);
                var t = Math.round($(this).offset().top);
                var r = Math.round(l + $(this).width());
                var b = Math.round(t + $(this).height());
                $(this).data("top", t).data("right", r).data("bottom", b).data("left", l);
            });
        },
        //设置input val值
        _setValue: function(val) {
            $keyboardP.hasClass("am-on") ? $input.text(methods._toAmount(val)) : $input.text(val); //对金额键盘做千分位处理
            methods._checkPlaceholder();
        },
        //设置键盘每个区域的高度
        _setKBHeight: function() {
            var hTotal = 0;
            if ($.html.hasClass("am-pc")) {
                hTotal = 200;
            } else if ($.html.hasClass("am-pad")) {
                hTotal = 300;
            } else {
                hTotal = Math.round($.winW / 1.46); //1.46为ios键盘的宽高比例
            }
            var hTitle = Math.round(hTotal * 0.15);
            var hBase = Math.round((hTotal - hTitle) / 4);
            //此处高度直接用css设置会造成各浏览器的四舍五入不统一，引起高度不精确问题，产生多余缝隙
            $(".am-keyboard-con>.am-keyboard>div:nth-child(1)").height(hTitle);
            $(".am-keyboard-con>.am-keyboard.letter>div:nth-child(2)").height(hBase * 4);
            $(".am-keyboard-con>.am-keyboard.number>div:nth-child(2)").height(hBase * 4);
            $(".am-keyboard-con>.am-keyboard.price>div:nth-child(2)").height(hBase * 4);
            $(".am-keyboard-con>.am-keyboard.symbol>div:nth-child(2)").height(hBase * 1);
            $(".am-keyboard-con>.am-keyboard.symbol>div:nth-child(3)").height(hBase * 3);
            $(".am-keyboard-con").height(hTitle + hBase * 4 + 2);
        },
        //键盘弹出&收起
        _KBSwitch: function(state) { //state:1开启，0关闭
            if (state === 1) {
                $inputAll.removeClass("am-on");
                $input.add($keyboardCon).addClass("am-on");
                $(document).on($.touchend + ".keyboard", methods.KBClose);
                if ($.html.hasClass("am-mob") && opt.allowScroll) {
                    methods._autoScroll();
                }
            } else if (opt.allowClose) {
                $input.add($keyboardCon).removeClass("am-on am-show");
                $btnPwd.hide();
                $btnClear.hide();
                $(document).off($.touchend + ".keyboard");
                if ($.html.hasClass("am-mob")) {
                    $.amBody.find(".scrollInner").css({ bottom: 0, "min-height": "100%!important" });
                    $.scrollY[$.xIndex].refresh();
                }
            }
        },
        //获取焦点时滚动避开键盘高度
        _autoScroll: function() {
            $.amBody.find(".scrollInner").css({ bottom: $keyboardCon.outerHeight(), "min-height": "none!important" });
            $.scrollY[$.xIndex].refresh();
            var t = $input.offset().top - $.scrollY[$.xIndex].y;
            if (t > $.winH / 2) {
                t = (t - $.winH / 3) * -1;
                var timeout = setTimeout(function() {
                    $.scrollY[$.xIndex].scrollTo(0, t, $.globalSpeed);
                });
            }
        },
        //键盘开启后页面空白处点击关闭
        KBClose: function(e) {
            if (
                e && (
                    e.target.parentNode.tagName === "HTML" ||
                    e.target.parentNode.tagName === "BODY")
            ) {
                //pc端am-body高度不足情况下，点击到页面空白区域
                methods._KBSwitch(0);
                opt.onCancel(inputVal);
                return;
            } else if (
                (e &&
                    ($("#KBCon").hasClass("am-on")) &&
                    (e.target.className.indexOf("am-keyboard-input") === -1) &&
                    (e.target.className.indexOf("am-kbinput") === -1) &&
                    (e.target.className.indexOf("am-input-pwd") === -1) &&
                    (e.target.className.indexOf("am-input-clear") === -1) &&
                    (e.target.parentNode.className.indexOf("am-keyboard") === -1) &&
                    (e.target.parentNode.parentNode.className.indexOf("am-keyboard") === -1) &&
                    (e.target.parentNode.parentNode.parentNode.className.indexOf("am-keyboard") === -1)) ||
                (!e && $("#KBCon").hasClass("am-on"))
            ) {
                methods._KBSwitch(0);
                opt.onCancel(inputVal);
            }
        },
        //清除功能
        KBClear: function($input) {
            $input = $input || $(this);
            inputVal = "";
            methods._setValue(inputVal);
            $input.data("value", inputVal);
            methods._checkBtnDone();
            methods._checkPlaceholder();
        },
        //预加载
        KBReady: function() {
            var dom = "<div class='am-keyboard-con' id='KBCon'><div class='am-keyboard number'><div class='am-g'><h6><span class='am-icon-security2'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn btn-n1 canmove nozoom' data-ascii='49'><span>1</span></a><a class='am-btn btn-n2 canmove nozoom' data-ascii='50'><span>2</span></a><a class='am-btn btn-n3 canmove nozoom' data-ascii='51'><span>3</span></a><a class='am-btn btn-n4 canmove nozoom' data-ascii='52'><span>4</span></a><a class='am-btn btn-n5 canmove nozoom' data-ascii='53'><span>5</span></a><a class='am-btn btn-n6 canmove nozoom' data-ascii='54'><span>6</span></a><a class='am-btn btn-n7 canmove nozoom' data-ascii='55'><span>7</span></a><a class='am-btn btn-n8 canmove nozoom' data-ascii='56'><span>8</span></a><a class='am-btn btn-n9 canmove nozoom' data-ascii='57'><span>9</span></a><a class='am-btn btnFnNull canmove nozoom'></a><a class='am-btn btn-n0 canmove nozoom' data-ascii='48'><span>0</span></a><a class='am-btn nozoom am-btnLight btnFnDelete'><span></span></a></div></div><div class='am-keyboard letter'><div class='am-g'><h6><span class='am-icon-security2 am-icon-36'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn canmove' data-ascii='113'><span>q</span></a><a class='am-btn canmove' data-ascii='119'><span>w</span></a><a class='am-btn canmove' data-ascii='101'><span>e</span></a><a class='am-btn canmove' data-ascii='114'><span>r</span></a><a class='am-btn canmove' data-ascii='116'><span>t</span></a><a class='am-btn canmove' data-ascii='121'><span>y</span></a><a class='am-btn canmove' data-ascii='117'><span>u</span></a><a class='am-btn canmove' data-ascii='105'><span>i</span></a><a class='am-btn canmove' data-ascii='111'><span>o</span></a><a class='am-btn canmove' data-ascii='112'><span>p</span></a><a class='am-btn canmove' data-ascii='97'><span>a</span></a><a class='am-btn canmove' data-ascii='115'><span>s</span></a><a class='am-btn canmove' data-ascii='100'><span>d</span></a><a class='am-btn canmove' data-ascii='102'><span>f</span></a><a class='am-btn canmove' data-ascii='103'><span>g</span></a><a class='am-btn canmove' data-ascii='104'><span>h</span></a><a class='am-btn canmove' data-ascii='106'><span>j</span></a><a class='am-btn canmove' data-ascii='107'><span>k</span></a><a class='am-btn canmove' data-ascii='108'><span>l</span></a><a class='am-btn am-btnLight btnFnShift nozoom'><span></span></a><a class='am-btn canmove' data-ascii='122'><span>z</span></a><a class='am-btn canmove' data-ascii='120'><span>x</span></a><a class='am-btn canmove' data-ascii='99'><span>c</span></a><a class='am-btn canmove' data-ascii='118'><span>v</span></a><a class='am-btn canmove' data-ascii='98'><span>b</span></a><a class='am-btn canmove' data-ascii='110'><span>n</span></a><a class='am-btn canmove' data-ascii='109'><span>m</span></a><a class='am-btn am-btnLight btnFnDelete nozoom'><span></span></a><a class='am-btn am-btnLight btnFnSymbol nozoom'><span>123.*!&</span></a><a class='am-btn nozoom btnFnSpace' data-ascii='32'><span>空格</span></a><a class='am-btn am-btnLight btnFnDone nozoom'><span>完成</span></a></div></div><div class='am-keyboard symbol'><div class='am-g'><h6><span class='am-icon-security2 am-icon-36'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn canmove' data-ascii='49'><span>1</span></a><a class='am-btn canmove' data-ascii='50'><span>2</span></a><a class='am-btn canmove' data-ascii='51'><span>3</span></a><a class='am-btn canmove' data-ascii='52'><span>4</span></a><a class='am-btn canmove' data-ascii='53'><span>5</span></a><a class='am-btn canmove' data-ascii='54'><span>6</span></a><a class='am-btn canmove' data-ascii='55'><span>7</span></a><a class='am-btn canmove' data-ascii='56'><span>8</span></a><a class='am-btn canmove' data-ascii='57'><span>9</span></a><a class='am-btn canmove' data-ascii='48'><span>0</span></a></div><div class='am-g'><a class='am-btn canmove' data-ascii='96'><span>`</span></a><a class='am-btn canmove' data-ascii='33'><span>!</span></a><a class='am-btn canmove' data-ascii='64'><span>@</span></a><a class='am-btn canmove' data-ascii='35'><span>#</span></a><a class='am-btn canmove' data-ascii='36'><span>$</span></a><a class='am-btn canmove' data-ascii='37'><span>%</span></a><a class='am-btn canmove' data-ascii='94'><span>^</span></a><a class='am-btn canmove' data-ascii='38'><span>&</span></a><a class='am-btn canmove' data-ascii='42'><span>*</span></a><a class='am-btn canmove' data-ascii='43'><span>+</span></a><a class='am-btn canmove' data-ascii='45'><span>-</span></a><a class='am-btn canmove' data-ascii='92'><span>&#92;</span></a><a class='am-btn canmove' data-ascii='47'><span>/</span></a><a class='am-btn canmove' data-ascii='91'><span>[</span></a><a class='am-btn canmove' data-ascii='93'><span>]</span></a><a class='am-btn canmove' data-ascii='123'><span>{</span></a><a class='am-btn canmove' data-ascii='125'><span>}</span></a><a class='am-btn am-btnLight btnFnDelete nozoom'><span></span></a><a class='am-btn am-btnLight btnFnLetter nozoom'><span>ABC</span></a><a class='am-btn canmove' data-ascii='44'><span>,</span></a><a class='am-btn canmove' data-ascii='46'><span>.</span></a><a class='am-btn canmove' data-ascii='8364'><span>€</span></a><a class='am-btn canmove' data-ascii='163'><span>£</span></a><a class='am-btn canmove' data-ascii='165'><span>¥</span></a><a class='am-btn am-btnLight btnFnDone nozoom'><span>完成</span></a></div></div><div class='am-keyboard price'><div class='am-g'><h6><span class='am-icon-security2'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn btn-n1 canmove nozoom' data-ascii='49'><span>1</span></a><a class='am-btn btn-n2 canmove nozoom' data-ascii='50'><span>2</span></a><a class='am-btn btn-n3 canmove nozoom' data-ascii='51'><span>3</span></a><a class='am-btn btn-n4 canmove nozoom' data-ascii='52'><span>4</span></a><a class='am-btn btn-n5 canmove nozoom' data-ascii='53'><span>5</span></a><a class='am-btn btn-n6 canmove nozoom' data-ascii='54'><span>6</span></a><a class='am-btn btn-n7 canmove nozoom' data-ascii='55'><span>7</span></a><a class='am-btn btn-n8 canmove nozoom' data-ascii='56'><span>8</span></a><a class='am-btn btn-n9 canmove nozoom' data-ascii='57'><span>9</span></a><a class='am-btn btn-dot canmove nozoom' data-ascii='46'><span>.</span></a><a class='am-btn btn-n0 canmove nozoom' data-ascii='48'><span>0</span></a><a class='am-btn nozoom am-btnLight btnFnDelete'><span></span></a></div></div><div class='ctrl'></div><div class='imgload'></div></div>";
            var preloadImg = "<img class='active' src='/images/unify/mob/keyboard-active.png'><img class='active' src='/images/unify/mob/keyboard-shift-black.png'><img class='active' src='/images/unify/mob/keyboard-delete-black.png'>";
            var pcinput = "<input type='password' class='am-input am-kbinput'>";
            //判断键盘是否已存在
            if (!$(".am-keyboard-con").length) {
                //加载键盘html代码
                $.body.append(dom);
                //初始化预加载素材图片
                $(".am-keyboard-con>.imgload").append(preloadImg);
                //初始化键盘高度
                methods._setKBHeight();
            }
        },
        KBDestroy: function() {
            methods.KBClose();
            setTimeout(function() {
                $("#KBCon").remove();
            }, $.globalSpeed);
        },
        //取值
        getValue: function() {
            return $(this).data("value") === "" ? undefined : $(this).data("value");
        },
        //设值
        setValue: function(val) {
            $input = $(this);
            $input.data("value", val);
            $input.text(methods._toAmount(val));
            $input.next("sub").addClass("am-off");
        }
    };
}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnLongTouch = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            timeOffsetL0: null,
            timeS: null,
            stepTime: null,
            timeOut: null,
            val: null,
            type: null,
            minVal: null,
            maxVal: null,
            curVal: null,
            stepVal: null
        },
        minVal: 4, //最小值
        maxVal: 12, //最大值
        curVal: 8, //默认值
        stepVal: 0.01, //最小变化值
        onChanged: function(id, val) {}, //改变值后回调
        onTouchEnd: function(id, val) {}, //长按松开回调
        onValMin: function(id) {}, //小于最小值回调
        onValMax: function(id) {} //大于最大值回调
    };
    var myTime = new Date();
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $btn = $this.find("div>.am-btn");
                var $input = $this.find(".am-input");
                $this.data(opt._data).data({
                    minVal: opt.minVal,
                    maxVal: opt.maxVal,
                    curVal: opt.curVal,
                    stepVal: opt.stepVal
                });
                $input.val($this.data("curVal"));
                $btn
                    .off($.touchstart + ".longtouch")
                    .off($.touchend + ".longtouch")
                    .on($.touchstart + ".longtouch", function(e) {
                        methods._btnTouchStart($this, $btn, $input, $(this), e);
                    })
                    .on($.touchend + ".longtouch", function() {
                        methods._btnTouchEnd($this);
                    });
                $input
                    .off("input.longtouch")
                    .on("input.longtouch", function() {
                        var val;
                        if (Number($(this).val()) > $this.data("maxVal")) {
                            $(this).val($this.data("maxVal"));
                        }
                        methods._inputChange($this, $btn, $input);
                    });
            });
        },
        //输入框值改变事件
        _inputChange: function($this, $btn, $input) {
            $this.data("val", Number($input.val()) || $this.data("curVal"));
            opt.onChanged(methods._getId($this), $this.data("val"));
        },
        //按钮开始点击事件
        _btnTouchStart: function($this, $btn, $input, _this, e) {
            //pc端绑定鼠标移出按钮后的touchend事件
            if ($.html.hasClass("am-pc")) {
                $(document)
                    .on($.touchend + ".longtouch", function() {
                        methods._btnTouchEnd($this);
                    });
            }
            methods._checkType($this, _this);
            $this.data("val", Number($input.val()));
            //清空后首次点击后回归到默认值
            if (!$this.data("val") && $this.data("type")) {
                $this.data("val", $this.data("curVal") - $this.data("stepVal"));
            } else if (!$this.data("val") && !$this.data("type")) {
                $this.data("val", $this.data("curVal") + $this.data("stepVal"));
            }
            //设置val
            methods.setVal($this, $input);
            myTime = new Date();
            $this.data("timeS", myTime.getTime());
            //首次点击后激活长按的间隔时间
            $this.data("timeOut", setTimeout(function() {
                methods._interval($this, $input);
            }, 500));
            //禁用Android系统长按事件
            e.preventDefault();
        },
        //判断点击按钮
        _checkType: function($this, _this) {
            if (_this.hasClass("am-btnAdd")) {
                $this.data("type", true);
            } else {
                $this.data("type", false);
            }
        },
        //按钮结束点击事件
        _btnTouchEnd: function($this) {
            //pc端绑定鼠标移出按钮后的touchend事件
            if ($.html.hasClass("am-pc")) {
                $(document)
                    .off($.touchend + ".longtouch");
            }
            myTime = new Date();
            $this.data("timeOffsetL0", myTime.getTime() - $this.data("timeS"));
            clearTimeout($this.data("timeOut"));
            //判断最大最小后不回调
            if ($this.data("val") !== $this.data("minVal") && $this.data("val") !== $this.data("maxVal")) {
                opt.onTouchEnd(methods._getId($this), $this.data("val"));
            }
        },
        //长按interval事件
        _interval: function($this, $input) {
            myTime = new Date();
            $this.data("timeOffsetL0", myTime.getTime() - $this.data("timeS"));
            //曲线变化公式
            $this.data("stepTime", 1 / Math.pow($this.data("timeOffsetL0") / 1000, 1.2) * 100);
            //最小间隔为屏幕刷新率
            if ($this.data("stepTime") < 1000 / 60) {
                $this.data("stepTime", 1000 / 60);
            }
            methods.setVal($this, $input);
            $this.data("timeOut", setTimeout(function() {
                methods._interval($this, $input);
            }, $this.data("stepTime")));
        },
        //设置当前值
        setVal: function($this, $input) {
            if (!$.touchMoved) {
                //判断加减按键
                if ($this.data("type")) {
                    $this.data("val", $this.data("val") + $this.data("stepVal"));
                } else {
                    $this.data("val", $this.data("val") - $this.data("stepVal"));
                }
                //判断最大最小值
                if ($this.data("val") < $this.data("minVal")) {
                    $this.data("val", $this.data("minVal"));
                    opt.onValMin(methods._getId($this));
                } else if ($this.data("val") > $this.data("maxVal")) {
                    $this.data("val", $this.data("maxVal"));
                    opt.onValMax(methods._getId($this));
                } else {
                    //设置数字并回调
                    $this.data("val", Number($this.data("val").toFixed(2)));
                    $input.val($this.data("val"));
                    opt.onChanged(methods._getId($this), $this.data("val"));
                }
            }
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fnNotice = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var opt;
    var def = {
        msg: "", //默认无消息
        time: 4 //默认显示时间4秒
    };
    var time = null;

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            //处理时间单位秒与毫秒兼容
            time = opt.time < 1000 ? opt.time * 1000 : opt.time;
            //判断不同执行状态
            if (!$("#am-notice").length && opt.msg.length !== 0) {
                methods._notice();
            } else {
                //清除各种timeout
                clearTimeout($.fnNoticeShowTimeOut);
                clearTimeout($.fnNoticeHideTimeOut);
                clearTimeout($.fnNoticeDestoryTimeOut);
                //销毁现有结构
                methods.destroy(0);
                //如果有新提示，销毁后执行
                if (opt.msg.length !== 0) {
                    setTimeout(function() {
                        methods._notice();
                    }, $.globalSpeed);
                }
            }
        },
        //完整展示流程，创建——>销毁
        _notice: function() {
            methods._create();
            methods.destroy(time);
        },
        //创建
        _create: function() {
            var innerHtml = "<div class='am-notice' id='am-notice'>" + opt.msg + "</div>";
            $.body.append(innerHtml);
            $.fnNoticeShowTimeOut = setTimeout(function() {
                $("#am-notice").addClass("am-on");
            }, 50);
            //此处延迟50ms为了dom操作时的等待时间，缺少会造成跳动
        },
        //销毁
        destroy: function(time) {
            time = time || 0;
            // 参数time为了实现显示完成后的销毁，与直接销毁的不同间隔要求
            $.fnNoticeHideTimeOut = setTimeout(function() {
                $("#am-notice").removeClass("am-on");
            }, time);
            $.fnNoticeDestoryTimeOut = setTimeout(function() {
                $("#am-notice").remove();
            }, time + $.globalSpeed);
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fn.fnNoticeBar = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            required: null,
            formName: null
        },
        onClose: function() {}
    };
    var $this = null;
    var $close = null;
    var $notice = null;
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = $(this);
            methods._checkOnly();
            $close = $this.find("span[class*=am-icon-close]");
            $notice = $this.find("p");
            methods._setPlay();
            $close.off($.touchend + ".noticebar").on($.touchend + ".noticebar", function() {
                if (!$.touchMoved) {
                    methods._close();
                }
            });
            return $this;
        },
        //
        _setPlay: function() {
            if ($notice.width() > $notice.parent("a").width()) {
                //速度固定，根据内容长度生成滚动所需时间
                var speed = $notice.width() / $notice.parent("a").width() * 15;
                $notice.css({
                    "-webkit-animation-duration": speed + "s",
                    "-moz-animation-duration": speed + "s",
                    "animation-duration": speed + "s"
                });
            }
            methods._setStyle();
            $this.addClass("play");
        },
        _setStyle: function() {
            var style = "<style>@-webkit-keyframes noticeBarPlay {";
            style += "0% { -webkit-transform:translate3d(" + $.winW + "px,0,0);}";
            style += "100% { -webkit-transform:translate3d(-100%,0,0);}";
            style += "}</style>";
            $.body.append(style);
        },
        _close: function() {
            $this.remove();
            $.fnBodyHeight();
            $.scrollY[0] ? $.scrollY[0].refresh() : false;
            opt.onClose();
        },
        //控件唯一性检查
        _checkOnly: function() {
            if ($this.length > 1) {
                $this.not(':first-of-type').remove();
                $this = $this.eq(0);
                $.console("this plugin support only one selector");
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fnPageLoad = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var opt;
    var def = {
        target: null,
        state: 1
    };

    var methods = {
        init: function(options) {
            def.target = $.body;
            opt = $.extend({}, def, options);
            var $this = $(".am-pageload");

            if (opt.state === 0 && $this.length) { //用于隐藏浮层
                methods._close($this);
            } else {
                //去掉重复
                $(".am-pageload").length ? $(".am-pageload").remove() : false;

                opt.target.css({ position: "relative" });
                //有底色
                if (opt.state === 1) {
                    opt.target.append("<div class='am-pageload am-on'><span></span></div>");
                } else
                //用于请求数据中
                if (opt.state === 2) {
                    opt.target.append("<div class='am-pageload am-bg-null am-on'><span></span></div>");
                }
            }
        },
        //循环检测loading层是否关闭
        _close: function($this) {
            $this = $(".am-pageload");
            $this.fadeOut($.globalSpeed);
            setTimeout(function() {
                $this.remove();
            }, $.globalSpeed);
            if ($this.length) {
                setTimeout(function() {
                    methods._close($this);
                }, $.globalSpeed + 1000 / 60);
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnPcFooterBtn = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            if (!$(".am-footer-btn").length) {
                $.amFooter.after("<div class='am-footer-btn'><a class='wx'><img src='/images/mob/qrcodeJingbao.png' /></a><a class='top'></a></div>");
            }
            $(".am-footer-btn>.top").off($.touchend).on($.touchend, function() {
                $('html,body').animate({
                    scrollTop: 0
                }, $.globalSpeed);
            });
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnPlaceHolder = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            placeholder: null
        }
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                $this.data("placeholder", $this.attr("placeholder"));
                methods._setPlaceholder($this);
                methods._checkPlaceholder($this);
                if (!$this.hasClass("am-keyboard-input")) {
                    $this
                        .off("input.placeholder")
                        .off("blur.placeholder")
                        .off("focus.placeholder")
                        .on("input.placeholder", function() {
                            methods._checkPlaceholder($this);
                        })
                        .on("blur.placeholder", function() {
                            methods._checkPlaceholder($this);
                        })
                        .on("focus.placeholder", function() {
                            methods._checkPlaceholder($this);
                        });
                }
            });
        },
        _setPlaceholder: function($this) {
            //重复性检测
            if ($this.data("placeholder") && !$this.next("sub").length) {
                $this.parent("span[class*='am-g']").addClass("placeholder");
                $this.after("<sub>" + $this.data("placeholder") + "</sub>");
            }
        },
        _checkPlaceholder: function($this) {
            var $holder = $this.next("sub");
            //settimeout null for ie replace val time;
            setTimeout(function() {
                if ($this.val() === "" || $this.val() === $this.data("placeholder")) {
                    $holder.removeClass("am-off");
                } else {
                    $holder.addClass("am-off");
                }
            });
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnPageBtn = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            target: 0,
            total: 0,
            current: 0
        },
        total: 1,
        current: 1,
        onChanged: function(id, target) {}
    };
    var prevHtml = "<a class='prev'>-1</a>";
    var nextHtml = "<a class='next'>+1</a>";
    var moreHtml = "<span>...</span>";
    var pageHtmlBefore = "<a class='num'>";
    var pageHtmlAfter = "</a>";

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this).children("div");
                $this.data({ "total": opt.total, "current": opt.current, "onChanged": opt.onChanged });
                var $btn = methods._setList($this);

                $btn.off($.touchend + ".pagebtn").on($.touchend + ".pagebtn", function() {
                    if (!$.touchMoved) {
                        methods._setTarget($this, $(this));
                    }
                });
            });
        },
        //
        _setTarget: function($this, _this) {
            $this.data("current", parseInt($this.find(".am-on").eq(0).text()));
            //检查当前项
            if (!_this.hasClass("am-on")) {
                //检查点击按钮
                if (_this.hasClass("prev")) {
                    $this.data("target", $this.data("current") - 1);
                } else
                if (_this.hasClass("next")) {
                    $this.data("target", $this.data("current") + 1);
                } else {
                    $this.data("target", parseInt(_this.text()));
                }
                //检查超出边界
                if ($this.data("target") === 0) {
                    $this.data("target", 1);
                } else if ($this.data("target") > $this.data("total")) {
                    $this.data("target", $this.data("total"));
                } else {
                    $this.data("onChanged")($this.data("target"));
                }
            }
        },
        _setList: function($this) {
            var tempHtml = "";
            var current = opt.current;
            tempHtml = prevHtml;

            //tatal num <9 or current page overflow
            if (opt.total <= 9) {
                for (var i = 1; i < opt.total + 1; i++) {
                    tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                }
            } else
            //total num>9
            if (opt.total > 9) {
                //current<=5
                if (opt.current <= 5) {
                    for (var i = 1; i < 8; i++) {
                        tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                    }
                    tempHtml += moreHtml;
                    tempHtml += pageHtmlBefore + opt.total + pageHtmlAfter;
                } else
                //倒数5位
                if (opt.total - opt.current > 4) {
                    tempHtml += pageHtmlBefore + 1 + pageHtmlAfter;
                    tempHtml += moreHtml;
                    if (opt.current === 4) {
                        for (var i = opt.current; i < opt.current + 5; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 2;
                    } else if (opt.current === 5) {
                        for (var i = opt.current - 1; i < opt.current + 4; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 3;
                    } else if (opt.current >= 6) {
                        for (var i = opt.current - 2; i < opt.current + 3; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 4;
                    }
                    tempHtml += moreHtml;
                    tempHtml += pageHtmlBefore + opt.total + pageHtmlAfter;
                } else {
                    tempHtml += pageHtmlBefore + 1 + pageHtmlAfter;
                    tempHtml += moreHtml;
                    if (opt.total - opt.current === 4) {
                        for (var i = opt.current - 2; i < opt.current + 5; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 4;
                    } else if (opt.total - opt.current === 3) {
                        for (var i = opt.current - 3; i < opt.current + 4; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 5;
                    } else if (opt.total - opt.current === 2) {
                        for (var i = opt.current - 4; i < opt.current + 3; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 6;
                    } else if (opt.total - opt.current === 1) {
                        for (var i = opt.current - 5; i < opt.current + 2; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 7;
                    } else {
                        for (var i = opt.current - 6; i < opt.current + 1; i++) {
                            tempHtml += pageHtmlBefore + i + pageHtmlAfter;
                        }
                        current = 8;
                    }
                }
            }
            tempHtml += nextHtml;
            $this.html(tempHtml);
            var $btn = $this.children("a");
            $btn.eq(current).addClass("am-on");
            return $btn;
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //has opt
    //hasn't each

    $.fnPopup = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var opt;
    var def = {
        type: "alert", //弹窗类型
        class: "", //inner上的自定义class名，与css配合使用
        msg: "", //标题
        content: "", //内容，多种type下可定义为不同格式，具体请参考demo页面
        btnCancelName: "取消", //取消按钮文字
        btnConfirmName: "确认", //确认按钮文字
        onCancel: function() {},
        onConfirm: function(val) {},
        onReady: function(popId) {}
    };
    var popId = null;
    var type = null;

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            methods._setType();
            methods._open();
        },
        _setType: function() {
            //popup type set
            if (opt.type === 'alert') {
                type = 1;
            } else if (opt.type === 'confirm') {
                type = 2;
            } else if (opt.type === 'select') {
                type = 3;
            } else if (opt.type === 'passcode') {
                type = 4; //依赖fnKeyBoard
            } else if (opt.type === 'prompt') {
                type = 5;
            } else if (opt.type === 'share') {
                type = 6;
            } else if (opt.type === 'input') {
                type = 7;
            } else if (opt.type === 'custom') {
                type = 8;
            } else if (opt.type === 'middle') {
                type = 9;
            } else if (opt.type === 'alertselect') {
                type = 10;
            }
        },
        //open
        _open: function() {
            //检查是否移动
            if ($.touchMoved) {
                return false;
            }
            methods._checkRepeat();
            popId = "pop-" + Math.floor(Math.random() * 10000000000 + 1);

            var innerHtml;
            //type alert
            if (type === 1) {
                innerHtml = "<div class='am-pop am-popAlert' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type confirm
            if (type === 2) {
                innerHtml = "<div class='am-pop am-popConfirm' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6><a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type select
            if (type === 3) {
                innerHtml = "<div class='am-pop am-popSelect' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'>";
                if (opt.msg !== "") {
                    innerHtml += "<h6><span>" + opt.msg + "</span></h6>";
                }
                innerHtml += "<div>";
                for (var i = 0; i < opt.content.length; i++) {
                    //opt.color checking
                    if (opt.content[i].btnColor) {
                        innerHtml += "<a id='" + opt.content[i].id + "' class='am-popbtn am-submit " + opt.content[i].btnColor + "'><span>" + opt.content[i].btnName + "</span></a>";
                    } else {
                        innerHtml += "<a id='" + opt.content[i].id + "' class='am-popbtn am-submit'><span>" + opt.content[i].btnName + "</span></a>";
                    }
                }
                innerHtml += "</div><a class='am-popbtn am-cancel'><span>" + opt.btnCancelName + "</span></a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type passcode
            if (type === 4) {
                //初始键盘高度
                var KBheight
                if ($.html.hasClass("am-mob") && !$.html.hasClass("am-pad")) {
                    KBheight = $.winW / 1.46 + "px";
                } else {
                    KBheight = "";
                }
                innerHtml = "<div class='am-pop am-popPasscode' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><a class='am-popbtn am-close'>X</a><h6><span>" + opt.msg + "</span></h6><div class='code'><span></span><span></span><span></span><span></span><span></span><span></span></div><span class='am-keyboard-input am-hide' id='popKB'></span><a class='am-forget-pwd'>忘记交易密码？</a></div></div>";
                //检查是否已存在
                !$("#KBCon").length ? $.fn.fnKeyBoard("KBReady") : false;
                //不同位置插入pop
                $("#KBCon").before(innerHtml);
                //执行onReady回调
                opt.onReady(popId);
                //加载键盘
                $("#popKB").fnKeyBoard({
                    min: 6,
                    max: 6,
                    keyRandom: true,
                    allowScroll: false,
                    onChanged: function(val) {
                        methods._setPwd(val);
                    }
                });
            } else
            //type prompt
            if (type === 5) {
                innerHtml = "<div class='am-pop am-popPrompt' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6><div class='prompt-inner' style='max-height:" + ($.winH * 0.8 - 6.75 * $.fontSize) + "px'>" + opt.content + "</div><a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                document.removeEventListener($.touchmove, $.preventDefault, { passive: false });
                opt.onReady(popId);
            } else
            //type share
            if (type === 6) {
                innerHtml = "<div class='am-pop am-popShare' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><strong class='my'>我的邀请二维码</strong><div class='code'><span></span><p class='am-xs am-align-center am-color-black1'>扫一扫上面的二维码，加入鲸钱包</p></div><strong class='share'>分享到</strong><div class='list am-g-4'><a class='am-popbtn iconWechat'><span>微信好友</span></a><a class='am-popbtn iconWxCircle'><span>朋友圈</span></a><a class='am-popbtn iconQQ'><span>QQ好友</span></a><a class='am-popbtn iconMessage'><span>短信</span></a></div></div></div>";
                $.body.append(innerHtml);
                for (var i = 0; i < opt.content.length; i++) {
                    if (opt.content[i]) {
                        $("#" + popId).find(".am-popbtn").eq(i).addClass("am-on");
                    }
                }
                opt.onReady(popId);
            } else
            //type input
            if (type === 7) {
                innerHtml = "<div class='am-pop am-popInput' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6>" + opt.msg + "</h6><span>" + opt.content + "</span><input type='text' /><a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type custom
            if (type === 8) {
                innerHtml = "<div class='am-pop am-popCustom' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6>" + opt.msg + "</h6>" + opt.content + "<a class='am-popbtn am-cancel am-btn-active'><span class='am-icon-close'></span></a><a class='am-popbtn am-back am-btn-active'><span class='am-icon-back'></span></a></div></div>";
                $.body.append(innerHtml);
                document.removeEventListener($.touchmove, $.preventDefault, { passive: false });
                opt.onReady(popId);
            } else
            //type middle
            if (type === 9) {
                innerHtml = "<div class='am-pop am-popMiddle' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'>" + opt.content + "<a class='am-popbtn am-cancel'><span class='am-icon-close-w'></span></a></div></div>";
                $.body.append(innerHtml);
                document.removeEventListener($.touchmove, $.preventDefault, { passive: false });
                opt.onReady(popId);
            } else
            //type alertselect
            if (type === 10) {
                innerHtml = "<div class='am-pop am-popAlertSelect' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6>";
                for (var i = 0; i < opt.content.length; i++) {
                    innerHtml += "<a id='" + opt.content[i].id + "' class='am-popbtn am-submit'>" + opt.content[i].btnName + "</a>";
                }
                innerHtml += "<a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            }
            //set btn cancel
            if (opt.btnCancelName === "") {
                $("#" + popId).addClass("am-noCancel");
            }
            if (opt.btnSubmitName === "") {
                $("#" + popId).addClass("am-noSubmit");
            }
            //bind popup inner btn click
            methods._setBtnEvent();
            //for ios keyboard auto release
            $.amBody.find(".am-input").blur();
            //popup show
            rAF(function() {
                $("#" + popId).addClass("am-on");
            });
        },
        // set pwd
        _setPwd: function(val) {
            var $dot = $("#" + popId).find(".inner .code>span");
            $dot.removeClass("am-on");
            if (val && val.length < 7) {
                for (var i = 0; i < val.length; i++) {
                    $dot.eq(i).addClass("am-on");
                }
                if (val.length === 6) {
                    $("#" + popId).find(".code").addClass("am-color-blue");
                    setTimeout(function() {
                        opt.onConfirm(val);
                        $("#popKB").fnKeyBoard("KBClear");
                        $("#" + popId).find(".code").removeClass("am-color-blue");
                        $.fn.fnKeyBoard("KBClose");
                        methods.destroy();
                    }, $.globalSpeed);
                }
            }
        },
        //set popup inner btn event
        _setBtnEvent: function() {
            var index;
            // popBtn按钮点击
            $("#" + popId).find(".am-popbtn").off($.touchend + ".popup").on($.touchend + ".popup", function() {
                //touchmoved checking
                if ($.touchMoved) {
                    return false;
                }
                //callback type alert
                if (type === 1) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm();
                    }
                } else
                //callback type comfirm
                if (type === 2) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm();
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type select
                if (type === 3) {
                    methods.destroy();
                    index = $(this).index();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm(opt.content[index]);
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type passcode
                if (type === 4) {
                    //key close
                    if ($(this).hasClass("am-close")) {
                        methods.destroy();
                        $.fn.fnKeyBoard("KBClose");
                        //callback
                        opt.onCancel();
                    }
                } else
                //callback type prompt
                if (type === 5) {
                    if ($(this).hasClass("am-submit")) {
                        if (opt.onConfirm() !== false) {
                            methods.destroy();
                        }
                    } else if ($(this).hasClass("am-cancel")) {
                        methods.destroy();
                        opt.onCancel();
                    }
                } else
                //callback type share
                if (type === 6) {
                    if ($(this).hasClass("am-popbtn") && $(this).hasClass("am-on")) {
                        methods.destroy();
                        index = $(this).index();
                        opt.onConfirm(index);
                    }
                } else
                //callback type input
                if (type === 7) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        var val = $("#" + popId).find("input").eq(0).val();
                        opt.onConfirm(val);
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type custom
                if (type === 8) {
                    if ($(this).hasClass("am-submit")) {
                        methods.destroy();
                        opt.onConfirm(val);
                    } else if ($(this).hasClass("am-cancel")) {
                        methods.destroy();
                        opt.onCancel();
                    }
                } else
                //callback type middle
                if (type === 9) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm();
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type alertselect
                if (type === 10) {
                    methods.destroy();
                    index = $(this).index() - 1; //content传入参数从cancel按钮位置后计算需减2
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm(opt.content[index]);
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                }
                //防止点击穿透弹层背部有link
                return;
            });
            // popBg遮罩层点击关闭
            $("#" + popId).find(".popBg").off($.touchend + ".popup").on($.touchend + ".popup", function() {
                if (type !== 1) {
                    methods.destroy();
                    opt.onCancel();
                }
                if (type === 4) {
                    $.fn.fnKeyBoard("KBClose");
                }
                return;
            });
            //密码键盘关闭事件联动pop
            if (type === 4) {
                $(".am-keyboard.number .btnFnCancel").off($.touchend + ".popup").on($.touchend + ".popup", function() {
                    methods.destroy();
                    opt.onCancel();
                });
            }
            //pc端键盘关闭事件
            if ($.html.hasClass("am-pc")) {
                $(window).off("keyup.popup").on("keyup.popup", function(e) {
                    if (e.keyCode === 27 && type !== 1) {
                        methods.destroy();
                        opt.onCancel();
                    }
                });
            }
        },
        //check repeat
        _checkRepeat: function() {
            if ($(".am-pop").length) {
                $("body>.am-pop").eq(0).remove();
            }
        },
        //destroy
        destroy: function() {
            //reset preventDefault
            document.addEventListener($.touchmove, $.preventDefault, { passive: false });
            var $pop = $("#" + popId);
            //disable popbtn double click 
            $pop.find(".am-popbtn,.am-btn").off($.touchend + ".popup");
            //hide pop window
            $pop.removeClass("am-on");
            //remove esc event
            $(window).off("keyup.popup");
            //body pointer reset
            setTimeout(function() {
                $pop.remove();
            }, $.globalSpeed + 200);
        }
    };
}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //has opt
    //hasn't each

    $.fnScrollX = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var opt;
    var def = {
        num: false, //[0,1,2,3]数组选择需要显示的列，可跳跃
        xIndex: false, //重设后的默认显示列
        hideNext: false //设置滚动时是否隐藏临近项
    };
    var $scrollXPanel = null;
    var $scrollY = null;
    var scrollXLock = null;

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $scrollXPanel = $(".scrollX0-panel");
            $scrollY = $.amBodyInner.children("div[class*=scrollY]");
            scrollXLock = 0;

            //无横向滚动页面dom设置
            if (!$scrollY.length) {
                $.amBodyInner.wrapInner("<div class='scrollY0' />");
                $scrollY = $.amBodyInner.children("div[class*=scrollY]");
                $scrollY.wrapInner("<div class='scrollInner' />");
            }

            //定义横向页码
            if (!opt.num) { //无指定列参数时
                $.xPage = methods._setArrow($scrollY.length);
            } else { //有指定列参数量
                $.xPage = opt.num;
            }

            //设置按键组当前页下划线
            if ($.xPage.length !== 1) {
                if (!$scrollXPanel.children("mark").length) {
                    $scrollXPanel.append("<mark></mark>");
                }
            } else {
                $scrollXPanel.children("mark").remove();
            }

            //根据横向页码设置scrollX的宽度
            $.amBodyInner
                .attr({
                    "class": "am-body-inner am-g-" + $.xPage.length
                })
                .css({
                    "width": $.xPage.length + "00%"
                });
            //根据横向页码设置panel按键组宽度
            $scrollXPanel
                .removeClass("am-g-1 am-g-2 am-g-3 am-g-4 am-g-5")
                .addClass("am-g-" + $.xPage.length);

            //初始化显示需要展示的列
            $scrollXPanel.children("a").hide();
            $scrollY.hide();
            for (var i = 0; i < $.xPage.length; i++) {
                $scrollXPanel.children("a").eq($.xPage[i]).show();
                $scrollY.eq($.xPage[i]).show();
            }

            //set new scroll
            if (!$.scrollX[0]) { //首次
                $.scrollX[0] = new IScroll(".am-body", {
                    scrollX: true,
                    scrollY: false,
                    momentum: false,
                    snap: true,
                    snapThreshold: 0.2
                });
            } else { //再次，产品列表页登录前后切换
                if (opt.xIndex !== false) {
                    $.xIndex = $.inArray(opt.xIndex, $.xPage);
                } else {
                    $.xIndex = 0;
                }
                $.scrollX[0].goToPage($.xIndex, 0, 0);
                $.scrollX[0].refresh();
            }
            //设置btn状态
            methods._setBtn();
            //设置是否显示下一项
            methods._checkShowNext();

            //首次绑定事件
            if (!$.amBody.hasClass("scrollX0")) {
                //绑定横向滚动事件
                $.amBody.addClass("scrollX0");
                $.scrollX[0].on("beforeScrollStart", methods._beforeScrollStart);
                $.scrollX[0].on("scrollEnd", methods._scrollEnd);
                $.scrollX[0].on("scroll", methods._scroll);
                //绑定横向panel点击事件
                $scrollXPanel.children("a").off($.touchend + ".scrollXPanel").on($.touchend + ".scrollXPanel", function() {
                    if (!$.touchMoved) {
                        for (i = 0; i < $.xPage.length; i++) {
                            if ($.xPage[i] === $(this).index()) {
                                $.xIndex = i;
                                break;
                            }
                        }
                        $.scrollX[0].goToPage($.xIndex, 0, 300);
                        methods._setBtn();
                        methods._checkShowNext();
                    }
                });
            }
        },
        _scrollEnd: function() {
            $.xIndex = $.scrollX[0].currentPage.pageX;
            //unlock current scrollY
            if (scrollXLock) {
                scrollXLock = 0;
                var prevIndex = $scrollY.filter(".am-disable").index();
                if (prevIndex !== -1) {
                    $scrollY.eq(prevIndex).removeClass("am-disable");
                    $.scrollY[prevIndex].enable();
                }
            }
            methods._setBtn();
            methods._checkShowNext();
        },
        _scroll: function() {
            //lock current scrollY and unlock siblings
            if (Math.abs($.scrollX[0].x + $.xIndex * $.winW) > 1 && !scrollXLock) {
                scrollXLock = 1;
                for (var i = 0; i < $.scrollY.length; i++) {
                    if (i === $.xPage[$.xIndex]) {
                        $.scrollY[i].disable();
                        $scrollY.eq(i).addClass("am-disable");
                    } else {
                        $.scrollY[i].enable();
                        $scrollY.eq(i).removeClass(".am-disable");
                    }
                }
            }
        },
        _beforeScrollStart: function() {
            if ($scrollY.eq($.xPage[$.xIndex]).hasClass("am-disable")) {
                $.scrollY[$.xPage[$.xIndex]].enable();
                $scrollY.eq($.xPage[$.xIndex]).removeClass(".am-disable");
            }
        },
        _setArrow: function(l) {
            var n = [];
            for (var i = 0; i < l; i++) {
                n[i] = i;
            }
            return n;
        },
        _setBtn: function() {
            $scrollXPanel.children("a")
                .eq($.xPage[$.xIndex])
                .addClass("am-on")
                .siblings()
                .removeClass("am-on");

            $scrollXPanel.children("mark")
                .css({
                    "-webkit-transform": "translate3d(" + $.xIndex + "00%,0,0)",
                    "-moz-transform": "translate3d(" + $.xIndex + "00%,0,0)",
                    "transform": "translate3d(" + $.xIndex + "00%,0,0)"
                });
        },
        _checkShowNext: function() {
            if (opt.hideNext) {
                $scrollY.eq($.xPage[$.xIndex]).css({
                    visibility: "visible",
                    opacity: 1
                }).siblings().css({
                    visibility: "hidden",
                    opacity: 0
                });
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnScrollY = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var touchSensitive = 5; //起始移动距离阀值

    var methods = {
        init: function() {
            //绑定上下拉出webview事件
            $(document).off($.touchmove + ".scrolly").on($.touchmove + ".scrolly", methods._moveOutWebview);
            //set scrollY
            $("div[class*=scrollY]").each(function(i) {
                var $up, $down;
                var scrolly, scrollMaxy;
                var $scrollY = $(this);

                //set scrollY and check repeat  
                if ($.scrollY[i]) {
                    $.scrollY[i].destroy();
                    $.scrollY[i] = null;
                }
                $.scrollY[i] = new IScroll(".scrollY" + i);

                //set pulldown/pullup dom and check repeat
                if (!$scrollY.children(".scrollInner").children(".am-pullUp").length) {
                    $scrollY.children(".scrollInner").append($.pullUpHtml);
                }
                if (!$scrollY.children(".scrollInner").children(".am-pullDown").length) {
                    $scrollY.children(".scrollInner").prepend($.pullDownHtml);
                }
                $up = $scrollY.children(".scrollInner").children(".am-pullUp");
                $down = $scrollY.children(".scrollInner").children(".am-pullDown");

                //bind scroll event
                $.scrollY[i].off("scroll", fnScrollYScroll);
                $.scrollY[i].on("scroll", fnScrollYScroll);
                //bind pulldown event
                $.scrollY[i].off("slideDown", fnScrollYSlideDown);
                $.scrollY[i].on("slideDown", fnScrollYSlideDown);
                //bind pullup event
                $.scrollY[i].off("slideUp", fnScrollYSlideUp);
                $.scrollY[i].on("slideUp", fnScrollYSlideUp);

                function fnScrollYScroll() {
                    if (!$down.hasClass("loading")) {
                        $.sTop = scrolly = Math.round(this.y);
                        scrollMaxy = this.maxScrollY - scrolly;
                        var downHasClass = $down.hasClass("am-on");
                        var upHasClass = $up.hasClass("am-on");
                        if (scrolly >= $.pullDownSensitive && !downHasClass) {
                            $down.addClass("am-on");
                        } else if (scrolly < $.pullDownSensitive && scrolly > 0 && downHasClass) {
                            $down.removeClass("am-on");
                        }
                        if (scrollMaxy >= $.pullUpSensitive && !upHasClass) {
                            $up.addClass("am-on");
                        } else if (scrollMaxy < $.pullUpSensitive && scrollMaxy >= 0 && upHasClass) {
                            $up.removeClass("am-on");
                        }
                        methods._logoDrowdown(scrolly, i);
                    }
                }

                function fnScrollYSlideDown() {
                    if (this.y > $.pullDownSensitive && $scrollY.children(".showPullDown").length) {
                        $(document).off($.touchmove + ".scrolly");
                        $.scrollY[i].disable();
                        $down.addClass("loading");
                        $.scrollY[i].scrollTo(0, $.pullDownSensitive, $.bounceTime);
                        $.scrollPullDown();
                    }
                }

                function fnScrollYSlideUp() {
                    if (this.maxScrollY - this.y > $.pullUpSensitive && $scrollY.children(".showPullUp").length) {
                        $(document).off($.touchmove + ".scrolly");
                        $up.removeClass("am-on");
                        if (!$up.hasClass("end")) {
                            $.scrollY[i].disable();
                            $up.addClass("loading");
                            $.scrollPullUp();
                        }
                    }
                }

                $.scrollY[i].pullDown = function() {
                    $scrollY.children(".scrollInner").addClass("showPullDown");
                };
                $.scrollY[i].pullDownComplete = function(callback) {
                    setTimeout(function() {
                        // console.log("refreshend");
                        $down.removeClass("am-on loading");
                        $.scrollY[i].scrollTo(0, 0, $.bounceTime * 0.5);
                        $(document).on($.touchmove + ".scrolly", methods._moveOutWebview);
                        setTimeout(function() {
                            callback();
                            //此处延迟enable防止用户过度操作
                            setTimeout(function() {
                                $.scrollY[i].enable();
                                $.scrollY[i].refresh();
                            });

                        }, $.bounceTime / 2);
                    }, $.bounceTime);
                };
                $.scrollY[i].pullUp = function() {
                    $scrollY.children(".scrollInner").addClass("showPullUp");
                };
                $.scrollY[i].pullUpComplete = function(callback) {
                    setTimeout(function() {
                        // console.log("loadend");
                        $up.removeClass("loading");
                        $(document).on($.touchmove + ".scrolly", methods._moveOutWebview);
                        setTimeout(function() {
                            callback();
                            //此处延迟enable防止用户过度操作
                            setTimeout(function() {
                                $.scrollY[i].enable();
                                $.scrollY[i].refresh();
                            });

                        });
                    }, $.bounceTime + 250);
                };
            });
        },
        _logoDrowdown: function(y, i) {
            if (y > 1) {
                if (y < $.pullDownSensitive) {
                    var y = $.pullDownSensitive - y;
                    $("div.scrollY" + i).find(".am-pullDown span").eq(0).css({
                        "-webkit-transform": "translate3d(0," + y + "px,0)",
                        "-moz-transform": "translate3d(0," + y + "px,0)",
                        "transform": "translate3d(0," + y + "px,0)"
                    });
                }
                if (y > $.pullDownSensitive) {
                    if (!$("div.scrollY" + i).find(".am-pullDown").hasClass("am-on")) {
                        $("div.scrollY" + i).find(".am-pullDown").addClass("am-on");
                    }
                } else {
                    if ($("div.scrollY" + i).find(".am-pullDown").hasClass("am-on")) {
                        $("div.scrollY" + i).find(".am-pullDown").removeClass("am-on");
                    }
                }
            }
        },
        _moveOutWebview: function(e) {
            $.settouch.init(e);
            var ty = $.touchY;
            if (ty <= touchSensitive || ty >= $.winH - touchSensitive) {
                //down moveout
                $.scrollY[$.xPage[$.xIndex]].touchCancel(e);
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnSlideDown = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        _data: {
            index: null,
            state: null
        },
        only: true, //only one line at one time
        onSlide: function(id, index, state) {}
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $btn = $this.find(">.am-row");

                $btn.each(function() {
                    methods._checkState($this, $btn, $(this));
                });

                //bind event
                $btn.off($.touchend + ".slidedown").on($.touchend + ".slidedown", function() {
                    if (!$.touchMoved) {
                        methods._slide($this, $btn, $(this));
                    }
                });

            });
        },
        _checkState: function($this, $btn, _this) {
            _this.data({
                "index": _this.index(),
            });
            if (_this.hasClass(".am-on")) {
                _this.data({
                    "index": _this.index(),
                    state: 1
                });
                setTimeout(function() {
                    methods._slideEnd($this, $btn);
                }, $.globalSpeed);
            }
        },
        //下拉点击事件
        _slide: function($this, $btn, _this) {
            if (!_this.hasClass("am-on")) {
                if (opt.only) {
                    _this.siblings().removeClass("am-on");
                }
                _this.addClass("am-on");
                _this.data("state", 1);
            } else {
                _this.removeClass("am-on");
                _this.data("state", 0);
            }
            setTimeout(function() {
                methods._slideEnd($this, $btn, _this);
            }, $.globalSpeed);
        },
        //切换动画完成事件
        _slideEnd: function($this, $btn, _this) {
            //刷新当前pageY滚动条
            $.scrollY[$.xIndex] ? $.scrollY[$.xIndex].refresh() : false;
            //call back
            opt.onSlide(methods._getId($this), _this.data("index"), _this.data("state"));
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fn.fnSlidePanel = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        onChanged: function(index) {}, //切换后回调
    };
    var $this = null;
    var $btnParent = null;
    var $conParent = null;
    var $btn = null;
    var $con = null;
    var index = null;
    var panelTop = null;
    var headerH = null;
    var footerH = null;
    var globalGap = null;

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = $(this);
            $btnParent = $this.eq(0);
            $conParent = $this.eq(1);
            $btn = $btnParent.children("a");
            $con = $conParent.children(".am-con");
            index = $btnParent.children(".am-on").eq(0).length ? $btnParent.children(".am-on").eq(0).index() : -1;
            panelTop = Math.round($btn.offset().top) || 0;
            headerH = $("header.am-app").height() || 0;
            footerH = $.amFooter.height() || 0;
            globalGap = 1;

            //设置默认显示状态
            if ($("html.am-mob").length) {
                $conParent.css({ "min-height": ($.winH - headerH - globalGap - footerH - $btnParent.height()) });
            } else if ($("html.am-pc").length) {
                $conParent.css({ "min-height": 300 });
            }
            $btn.eq(index).addClass("am-on").siblings().removeClass("am-on");
            $con.eq(index).addClass("am-on").siblings().removeClass("am-on");
            //绑定tab点击事件
            $btn.off($.touchend + ".slidepanel").on($.touchend + ".slidepanel", function() {
                index = $(this).index();
                methods._setPanel();
            });
            //移动端处理
            if ($.scrollY[0]) {
                //绑定滚动事件
                $.scrollY[0].off("scroll", methods._scroll);
                $.scrollY[0].on("scroll", methods._scroll);
                $.scrollY[0].refresh();
            }
        },
        //面板切换事件
        _setPanel: function() {
            if (!$btn.eq(index).hasClass("am-on") && !$.touchMoved) {
                $btn.eq(index).addClass("am-on").siblings().removeClass("am-on");
                $con.eq(index).addClass("am-on").siblings().removeClass("am-on");
                //移动端处理
                if ($.scrollY[0]) {
                    //切换后刷新滚动条并重新定位btnCon
                    $.scrollY[0].refresh();
                    $.sTop = Math.round($.scrollY[0].y);
                    var y = -1 * ($.sTop + panelTop - headerH - globalGap);
                    $btnParent.css({
                        "-webkit-transform": "translate3d(0," + y + "px,0)",
                        "-moz-transform": "translate3d(0," + y + "px,0)",
                        "transform": "translate3d(0," + y + "px,0)"
                    });
                    //在顶部时点击切换后自动滚动
                    methods._scrollUp();
                }
                //callback
                opt.onChanged(index);
            }
        },
        //面板上下滚动事件
        _scroll: function() {
            //保持btnCon在屏幕顶部
            var y = $.sTop + panelTop - headerH - globalGap;
            if (y <= 0) {
                $btnParent.css({
                    "-webkit-transform": "translate3d(0," + -1 * y + "px,0)",
                    "-moz-transform": "translate3d(0," + -1 * y + "px,0)",
                    "transform": "translate3d(0," + -1 * y + "px,0)"
                });
            }
            //去掉btnCon定位数值
            else {
                $btnParent.css({
                    "-webkit-transform": "translate3d(0,0,0)",
                    "-moz-transform": "translate3d(0,0,0)",
                    "transform": "translate3d(0,0,0)"
                });
            }
        },
        //面板切换后置顶事件
        _scrollUp: function() {
            $.scrollY[0].scrollTo(0, -1 * panelTop + headerH + globalGap, $.bounceTime * 0.5);

        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fn.fnSlideRuler = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var opt;
    var def = {
        minVal: 1, //最低起投额
        maxVal: 100, //最高起投额
        step: 1, //递增递减额度，可选范围:[1,0.1]
        msg: "", //卡尺右侧提示文字
        onChanged: function(val) {}, //每次改变金额
        onReady: function(val) {}, //初始化完成
        onClear: function() {} //清空输入框
    };
    var $this = null;
    var $input = null;
    var $clear = null;
    var $outer = null;
    var $inner = null;
    var $ruler = null;
    var isDestory = false;
    var maxVal = null;
    var minVal = null;
    var length = null;
    var tempVal = null;
    var tempHtml = null;
    var valStep = null;
    var valCurrent = null;
    var itemWidth = 60;
    var valMultiple = 10000; //所有金额都是以万为单位

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = $(this);
            $input = $this.find(".am-input");
            $clear = $input.prev(".am-input-clear");
            $outer = $input.parents(".am-con");
            $inner = $this.find(".inner");
            isDestory = false;
            maxVal = opt.maxVal;
            minVal = opt.maxVal >= opt.minVal ? opt.minVal : opt.maxVal;
            length = maxVal - minVal;
            tempVal = length >= 0 ? minVal : maxVal;
            //执行方法
            methods._reset();
            methods._setRulerDom();
            methods._setScaleLine();
            //绑定事件
            $input.off("input.slideruler").on("input.slideruler", methods._inputChange);
            $clear.off($.touchend + ".slideruler").on($.touchend + ".slideruler", methods._inputClear);
            //set input val
            minVal !== 0 ? valCurrent = minVal : valCurrent = 0.0001;
            $input.val(valCurrent * valMultiple);
            opt.onReady(valCurrent);
            //判断min<=>max时
            if (opt.minVal >= opt.maxVal) {
                $input.attr("disabled", "disabled");
                $outer.addClass("am-disable");
                $this.find(".am-icon-inputedit").remove();
                //最小值大于最大值时
                if (opt.minVal > opt.maxVal) {
                    $inner.addClass("am-disable"); //禁用滚动条
                    $input.val(opt.minVal * valMultiple); //起投金额使用起投额
                    $ruler.find("li.last>span").addClass("am-color-red"); //提示文字红色
                }
                //不可滚动时销毁scroll
                $.scrollX[1] ? $.scrollX[1].destroy() : false;
            } else {
                //判断重复
                $.scrollX[1] ? $.scrollX[1].destroy() : false;
                //执行滚动条
                $.scrollX[1] = new IScroll(".am-slideRuler .inner", {
                    scrollX: true,
                    scrollY: false,
                    deceleration: 0.005
                });
                //绑定滚动事件
                $.scrollX[1].on("scroll", methods._scroll);
                $.scrollX[1].on("scrollStart", methods._checkFirstMove);
                $.scrollX[1].on("scrollEnd", methods._scrollEnd);
            }
        },
        //初始ruler结构
        _setRulerDom: function() {
            //设定first li dom
            tempHtml = "<ul class='ruler'>";
            tempHtml += "<li class='first' style='width:" + ($.winW / 2 + 1) + "px'><span>向左滑动</span></li>";
            tempHtml += "";
            //设定中间li dom
            if (length >= 0) {
                for (var i = 0; i < length + 1; i++) {
                    tempHtml += "<li style='width:" + itemWidth + "px;'><span>" + (parseInt(i) + tempVal) + "<em>万</em></span></li>";
                }
            }
            //加载&滚动条
            tempHtml += "</ul>";
            $inner.html(tempHtml);

            $ruler = $inner.find(".ruler");
            $ruler.find("li:last-child").addClass("last").width($.winW / 2 + 1).append("<span>" + opt.msg + "</span>");
            $ruler.css({ "width": length * itemWidth + $.winW + 4 });
        },
        //检测首次拖动
        _checkFirstMove: function() {
            $ruler.addClass("am-on"); //隐藏“向右滑动”提示
            $.scrollX[1].off("scrollStart", methods._checkFirstMove); //解除首次拖动事件
        },
        //设置刻度线
        _setScaleLine: function() {
            valStep = opt.step * valMultiple;
            $ruler.addClass("step" + valStep);
        },
        //滚动事件
        _scroll: function() {
            if ($input.val() === "") {
                $clear.show();
            }
            methods._setScrollVal();
            $input.val(valCurrent * valMultiple);
            opt.onChanged(valCurrent);
        },
        //滚动停止事件
        _scrollEnd: function() {
            methods._setScrollVal();
            methods._setRulerPos(valCurrent);
            $input.val(valCurrent * valMultiple);
            opt.onChanged(valCurrent);
        },
        //设置刻度尺状态
        _setRulerPos: function(val) {
            var _x = -1 * (val - 1) * itemWidth + (minVal - 1) * itemWidth;
            $.scrollX[1] ? $.scrollX[1].scrollTo(_x, 0) : false;
        },
        //设置当前值
        _setScrollVal: function() {
            var _x = $.scrollX[1].x;
            valCurrent = $.floatDiv($.floatMulti(-1, _x), itemWidth) + minVal;
            //检查移动刻度
            if (opt.step === 1) {
                valCurrent = Math.round(valCurrent);
            } else if (opt.step === 0.1) {
                valCurrent = parseFloat(valCurrent.toFixed(1));
            }
            methods._checkValOffset();
        },
        //输入框修改事件
        _inputChange: function() {
            //格式化后有非法字符时，重置输入框
            if ($input.val() !== $input.val().replace(/[^\d.]/g, '')) {
                $input.val($input.val().replace(/[^\d.]/g, ''));
            }
            valCurrent = $.floatDiv(Number($input.val()), valMultiple);
            methods._checkValOffset();
            methods._setRulerPos(valCurrent);
            opt.onChanged(valCurrent);
        },
        //输入框清除事件
        _inputClear: function() {
            valCurrent = 0;
            methods._checkValOffset();
            methods._setRulerPos(valCurrent);
            opt.onChanged(valCurrent);
            opt.onClear();
        },
        //检测超出范围
        _checkValOffset: function(val) {
            if (val == null && !isDestory) {
                //小于等于最小值时
                if (valCurrent <= minVal) {
                    valCurrent = minVal;
                    //最小值为0时，设置显示1元
                    if (minVal === 0) {
                        valCurrent = 0.0001;
                    }
                } else
                //大于最大值时
                if (valCurrent > maxVal) {
                    valCurrent = maxVal;
                }
            }
        },
        //重新运行重置
        _reset: function() {
            $this.removeClass("am-no-borderBottom");
            $inner.removeClass("am-hide am-disable");
            $outer.removeClass("am-disable");
            $input.removeAttr("disabled");
            !$input.next(".am-icon-inputedit").length ? $input.after("<span class='am-icon-inputedit'></span>") : false;
        },
        setVal: function(val) {
            valCurrent = val.toFixed(2);
            valCurrent = $.keep2(valCurrent);
            var inputVal = $.floatMulti(val, valMultiple);
            inputVal = $.keep2(inputVal.toFixed(2));
            $input.val(inputVal);
            methods._checkValOffset(valCurrent); //传参时代表指定当前值，否则根据min/max得到
            val = val < opt.minVal ? opt.minVal: val;
            val = val > opt.maxVal ? opt.maxVal: val;
            methods._setRulerPos(val);
            opt.onChanged(valCurrent);
        },
        destroy: function() {
            isDestory = true;
            $this = $(this);
            $input = $this.find(".am-input");
            $clear = $input.prev(".am-input-clear");
            $inner = $this.find(".inner");
            $outer = $input.parents(".am-con");
            //---
            methods._reset();
            $inner.addClass("am-hide");
            $this.addClass("am-no-borderBottom");
            if ($.scrollX[1]) {
                $.scrollX[1].off("scroll", methods._scroll);
                $.scrollX[1].off("scrollStart", methods._checkFirstMove);
                $.scrollX[1].off("scrollEnd", methods._scrollEnd);
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fn.fnTitleToTop = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            var $this = $(this);
            $this.off($.touchend + ".titletotop").on($.touchend + ".titletotop", function() {
                methods._scrollTop();
            });
        },
        //滚动到顶部
        _scrollTop: function() {
            //判断当前纵向滚动条是否不在顶部 && 是否有点击移动 && 是否正在pageload
            if ($.scrollY[0] && $.scrollY[$.xIndex].y < 0 && !$.touchmoved && !$(".am-pageload").length) {
                $.scrollY[$.xIndex].scrollTop();
            }
        }
    };

}(jQuery);

! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fnWxFont = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                methods._handleFontSize();
            } else {　　
                if (document.addEventListener) {
                    document.addEventListener("WeixinJSBridgeReady", methods._handleFontSize, false);
                } else if (document.attachEvent) {
                    document.attachEvent("WeixinJSBridgeReady", methods._handleFontSize);
                    document.attachEvent("onWeixinJSBridgeReady", methods._handleFontSize);
                }
            }
        },
        //滚动到顶部
        _handleFontSize: function() {
            // 设置网页字体为默认大小
            WeixinJSBridge.invoke('setFontSizeCallback', {
                'fontSize': 0
            });
            // 重写设置网页字体大小的事件
            WeixinJSBridge.on('menu:setfont', function() {
                WeixinJSBridge.invoke('setFontSizeCallback', {
                    'fontSize': 0
                });
            });
        }
    };

}(jQuery);

var global = {
    init: function() {
        $.html = $("html");
        $.body = $("body");
        $.amBody = $("div.am-body").eq(0);
        if ($.html.hasClass("am-mob")) {
            $.amHeader = $("header.am-app").eq(0) || "";
            $.amFooter = $.body.children(".am-pos-fixb").eq(0) || "";
        }
        if ($.html.hasClass("am-app")) {
            this.app();
        } else
        if ($.html.hasClass("am-wx") || $.html.hasClass("am-bro")) {
            this.wx();
        } else
        if ($.html.hasClass("am-pc")) {
            $.amHeader = $("header.am-pc").eq(0) || "";
            $.amFooter = $("footer.am-pc").eq(0) || "";
            this.pc();
        }
    },
    wx: function() {
        document.addEventListener('touchmove', $.preventDefault, { passive: false });
        $.setevent.init();
        $.setmove.init();
        $.fnCheckDevice();
        $.fnBodyInner();
        $.fnBodyHeight();
        $.fnScrollX();
        $.fnScrollY();
        $.fnBtnTouch();
        $.fnInputBlur();
        $.fnWxFont();
        $(".am-keyboard-input").length ? $.fn.fnKeyBoard("KBReady") : false;
        $("a.am-btnSwitch").fnBtnSwitch();
        $("label[data-type]").fnChecked();
        $("input.am-input").fnInput();
        $(".am-banner.royalSlider").fnBanner();
        $("span.am-input-select").fnInputSelect();
        $(".am-keyboard-input[placeholder]").fnPlaceHolder();
        $('body').imagesLoaded().always(function() {
            $.fnPageLoad({ state: 0 });
        });
    },
    app: function() {
        document.addEventListener('touchmove', $.preventDefault, { passive: false });
        $.setevent.init();
        $.setmove.init();
        $.fnCheckDevice();
        $.fnBodyInner();
        $.fnBodyHeight();
        $.fnScrollX();
        $.fnScrollY();
        $.fnBtnTouch();
        $.fnInputBlur();
        $(".am-keyboard-input").length ? $.fn.fnKeyBoard("KBReady") : false;
        $.amHeader.children("span.title").fnAutoTitle();
        $.amHeader.children("span.title").fnTitleToTop();
        $("a.am-btnSwitch").fnBtnSwitch();
        $("label[data-type]").fnChecked();
        $("input.am-input").fnInput();
        $(".am-banner.royalSlider").fnBanner();
        $("span.am-input-select").fnInputSelect();
        $(".am-keyboard-input[placeholder]").fnPlaceHolder();
    },
    pc: function() {
        $.setevent.init();
        $.setmove.init();
        $.fnCheckDevice();
        $.fnBtnTouch();
        $.fnPcFooterBtn();
        $(".am-keyboard-input").length ? $.fn.fnKeyBoard("KBReady") : false;
        $("label[data-type]").fnChecked();
        $("input.am-input").fnInput();
        $("html.ie9 input[placeholder],.am-keyboard-input[placeholder]").fnPlaceHolder();
        $("a.am-btnSwitch").fnBtnSwitch();
        $(".am-banner.royalSlider").fnBanner();
        $("span.am-input-select").fnInputSelect();
    }
};

global.init();

}
}()
