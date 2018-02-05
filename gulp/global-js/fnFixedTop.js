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
