! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fnWxFont = function(method) {
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
            if (typeof WeixinJSBridge == "object" && typeof WeixinJSBridge.invoke == "function") {
                methods._handleFontSize();
            } else {　　
                if (document.addEventListener) {
                    document.addEventListener("WeixinJSBridgeReady", methods._handleFontSize, false);
                } else if (document.attachEvent) {
                    document.attachEvent("WeixinJSBridgeReady", methods._handleFontSize);
                    document.attachEvent("onWeixinJSBridgeReady", methods._handleFontSize);
                }
            }
        },
        //滚动到顶部
        _handleFontSize: function() {
            // 设置网页字体为默认大小
            WeixinJSBridge.invoke('setFontSizeCallback', {
                'fontSize': 0
            });
            // 重写设置网页字体大小的事件
            WeixinJSBridge.on('menu:setfont', function() {
                WeixinJSBridge.invoke('setFontSizeCallback', {
                    'fontSize': 0
                });
            });
        }
    };

}(jQuery);
