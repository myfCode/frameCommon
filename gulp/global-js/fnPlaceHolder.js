! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnPlaceHolder = function(method) {
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
            placeholder: null
        }
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                $this.data("placeholder", $this.attr("placeholder"));
                methods._setPlaceholder($this);
                methods._checkPlaceholder($this);
                if (!$this.hasClass("am-keyboard-input")) {
                    $this
                        .off("input.placeholder")
                        .off("blur.placeholder")
                        .off("focus.placeholder")
                        .on("input.placeholder", function() {
                            methods._checkPlaceholder($this);
                        })
                        .on("blur.placeholder", function() {
                            methods._checkPlaceholder($this);
                        })
                        .on("focus.placeholder", function() {
                            methods._checkPlaceholder($this);
                        });
                }
            });
        },
        _setPlaceholder: function($this) {
            //重复性检测
            if ($this.data("placeholder") && !$this.next("sub").length) {
                $this.parent("span[class*='am-g']").addClass("placeholder");
                $this.after("<sub>" + $this.data("placeholder") + "</sub>");
            }
        },
        _checkPlaceholder: function($this) {
            var $holder = $this.next("sub");
            //settimeout null for ie replace val time;
            setTimeout(function() {
                if ($this.val() === "" || $this.val() === $this.data("placeholder")) {
                    $holder.removeClass("am-off");
                } else {
                    $holder.addClass("am-off");
                }
            });
        }
    };

}(jQuery);
