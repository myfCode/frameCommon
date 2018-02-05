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
