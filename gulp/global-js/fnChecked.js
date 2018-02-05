! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnChecked = function(method) {
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
            state: [],
            length: null
        },
        onChecked: function(name, state) {}
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $icon = $this.find("span[class*=am-icon-]");
                methods._setData($this);
                $this.off($.touchend + ".checked").on($.touchend + ".checked", function() {
                    //检测点击移动 & 当前禁用
                    if (!$.touchMoved && !$this.hasClass("am-disable")) {
                        methods._checkChange($this, $icon);
                    }
                });
            });
        },
        //设置各种data参数
        _setData: function($this) {
            //设置当前点击组长度
            $this.data("length", $("label[data-name='" + $this.data("name") + "']").length);
        },
        _checkChange: function($this, $icon) {
            //type radio
            if ($this.data("type") === "radio") {
                $("label[data-name='" + $this.data("name") + "']").find("span.am-icon-radio").removeClass("am-on");
                $icon.addClass("am-on");
                //state set
                $this.data("state", [$this.index()]);
            }
            //type checkbox
            else if ($this.data("type") === "checkbox") {
                if ($icon.hasClass("am-on")) {
                    $icon.removeClass("am-on");
                } else {
                    $icon.addClass("am-on");
                }
                //state array set
                var tempType = [];
                for (var i = 0; i < $this.data("length"); i++) {
                    tempType.push($("label[data-name='" + $this.data("name") + "']").eq(i).find("span.am-on").length || 0);
                }
                $this.data("state", tempType);
            }
            //callback
            opt.onChecked($this.data("name"), $this.data("state"));
            return $this;
        },
        clear: function($this) {
            $this = $this || $(this);
            $this.find("span[class*=am-icon-]").removeClass("am-on").data(opt._data);
            return $this;
        }
    };

}(jQuery);
