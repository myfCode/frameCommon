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
