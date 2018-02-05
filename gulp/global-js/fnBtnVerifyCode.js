! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnBtnVerifyCode = function(method) {
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
            time: null,
            timeout: null
        },
        time: 60,
        speed: 1,
        onComplete: function(id) {}
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                $this.data("time", opt.time);
                if (!$this.hasClass("am-disable") && $this.data("time") == opt.time) {
                    $this.addClass("am-disable");
                    methods._startCountDown($this);
                }
            });
        },
        _startCountDown: function($this) {
            $this.text($this.data("time"));
            if ($this.data("time") > 0) {
                $this.data("time", $this.data("time") - opt.speed);
                $this.data("timeout", setTimeout(function() {
                    methods._startCountDown($this);
                }, 1000));
            } else {
                methods.clear($this);
            }
            return $this;
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        },
        clear: function($this) {
            $this = $this || $(this);
            $this.text("");
            $this.removeClass("am-disable");
            clearTimeout($this.data("timeout"));
            opt.onComplete(methods._getId($this));
            return $this;
        }
    };

}(jQuery);
