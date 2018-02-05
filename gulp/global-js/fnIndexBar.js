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
