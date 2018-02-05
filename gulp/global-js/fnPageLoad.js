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
