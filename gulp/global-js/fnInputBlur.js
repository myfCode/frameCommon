! function($) {
    "use strict";
    //hasn't this
    //hasn't opt
    //hasn't each

    $.fnInputBlur = function(method) {
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
            var $slideRulerInner = $(".am-slideRuler");

            $(document).off($.touchend + ".inputBlur");
            $(document).on($.touchend + ".inputBlur", function(e) {
                if ((e.target.tagName !== "INPUT")
                 && ($("svg").has(e.target).length === 0)
                 && (e.target.className.indexOf("am-input-clear") < 0)
                 && (e.target.className.indexOf("ui-autocomplete") < 0)
                 && (e.target.className.indexOf("ui-menu-item") < 0)
                 && (e.target.className.indexOf("ui-corner-all") < 0)
                 && ($slideRulerInner.has(e.target).length === 0)) {
                    $(".am-input").blur();
                }
            });
        }
    };

}(jQuery);
