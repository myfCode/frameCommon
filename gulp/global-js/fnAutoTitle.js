! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fn.fnAutoTitle = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var $this = null;
    var size = null;
    var title = null;
    var height = 46;

    var methods = {
        init: function() {
            $this = $(this);
            methods._checkOnly();
            size = parseInt($this.css("font-size"));
            title = $this.text();
            if ($this.height() <= height) {
                $this.addClass("am-on");
            } else {
                methods._setFontSize();
            }
            return $this;
        },
        //字号缩小处理
        _setFontSize: function() {
            size -= 1; //每次递减字号
            $this.css({
                "font-size": size + "px"
            });
            if ($this.height() > height && size > $.fontSize) {
                methods._setFontSize();
            } else if ($this.height() > height) {
                methods._setLength();
            } else {
                $this.addClass("am-on");
            }
        },
        //删减尾字符处理
        _setLength: function() {
            if ($this.height() > height) {
                title = title.substring(0, $this.text().length - 1);
                $this.text(title);
                methods._setLength();
            }
            //最后一次删减后去掉3位补"..."
            else {
                title = title.substring(0, $this.text().length - 3);
                $this.text(title + "...");
                $this.addClass("am-on");
            }
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
