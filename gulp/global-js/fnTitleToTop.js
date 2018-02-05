! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fn.fnTitleToTop = function(method) {
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
            var $this = $(this);
            $this.off($.touchend + ".titletotop").on($.touchend + ".titletotop", function() {
                methods._scrollTop();
            });
        },
        //滚动到顶部
        _scrollTop: function() {
            //判断当前纵向滚动条是否不在顶部 && 是否有点击移动 && 是否正在pageload
            if ($.scrollY[0] && $.scrollY[$.xIndex].y < 0 && !$.touchmoved && !$(".am-pageload").length) {
                $.scrollY[$.xIndex].scrollTop();
            }
        }
    };

}(jQuery);
