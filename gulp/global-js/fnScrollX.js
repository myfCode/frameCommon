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
