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
