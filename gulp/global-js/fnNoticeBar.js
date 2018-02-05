! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fn.fnNoticeBar = function(method) {
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
        _data: {
            required: null,
            formName: null
        },
        onClose: function() {}
    };
    var $this = null;
    var $close = null;
    var $notice = null;
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = $(this);
            methods._checkOnly();
            $close = $this.find("span[class*=am-icon-close]");
            $notice = $this.find("p");
            methods._setPlay();
            $close.off($.touchend + ".noticebar").on($.touchend + ".noticebar", function() {
                if (!$.touchMoved) {
                    methods._close();
                }
            });
            return $this;
        },
        //
        _setPlay: function() {
            if ($notice.width() > $notice.parent("a").width()) {
                //速度固定，根据内容长度生成滚动所需时间
                var speed = $notice.width() / $notice.parent("a").width() * 15;
                $notice.css({
                    "-webkit-animation-duration": speed + "s",
                    "-moz-animation-duration": speed + "s",
                    "animation-duration": speed + "s"
                });
            }
            methods._setStyle();
            $this.addClass("play");
        },
        _setStyle: function() {
            var style = "<style>@-webkit-keyframes noticeBarPlay {";
            style += "0% { -webkit-transform:translate3d(" + $.winW + "px,0,0);}";
            style += "100% { -webkit-transform:translate3d(-100%,0,0);}";
            style += "}</style>";
            $.body.append(style);
        },
        _close: function() {
            $this.remove();
            $.fnBodyHeight();
            $.scrollY[0] ? $.scrollY[0].refresh() : false;
            opt.onClose();
        },
        //控件唯一性检查
        _checkOnly: function() {
            if ($this.length > 1) {
                $this.not(':first-of-type').remove();
                $this = $this.eq(0);
                $.console("this plugin support only one selector");
            }
        }
    };

}(jQuery);
