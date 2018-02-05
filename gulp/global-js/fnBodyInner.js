! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnBodyInner = function(method) {
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
            methods._setBodyInner();
        },
        //检测并添加inner结构
        _setBodyInner: function() {
            if (!$(".am-body-inner").length) {
                $.amBody.wrapInner("<div class='am-body-inner' />");
                $.amBodyInner = $("div.am-body-inner").eq(0);
            }
        }
    };

}(jQuery);
