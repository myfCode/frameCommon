! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnBodyHeight = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var headerH = $("header.am-app:not(.am-hide)").outerHeight() || 0;
    var fixtopH = $("body>.am-pos-fixt").outerHeight() || 0;
    var noticeTopH = $("body>.am-notice-top").outerHeight() || 0;
    var noticeBottomH = $("body>.am-notice-bar").outerHeight() || 0;
    var fixbottomH = $("body>.am-pos-fixb:visible").outerHeight() || 0;

    var methods = {
        init: function() {
            $.amBody.css({
                bottom: noticeBottomH + fixbottomH,
                top: noticeTopH + headerH + fixtopH
            });
            //设置fixt容器的顶间距
            $("body>.am-pos-fixt").eq(0).css({
                top: noticeTopH + headerH
            });
        }
    };

}(jQuery);
