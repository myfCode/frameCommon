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
