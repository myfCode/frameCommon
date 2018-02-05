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
