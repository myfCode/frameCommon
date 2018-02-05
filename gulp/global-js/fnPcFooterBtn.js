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
