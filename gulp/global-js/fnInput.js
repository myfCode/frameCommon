! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnInput = function(method) {
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
        onClear: function(id) {}
    };
    var timeout;
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function(i) {
                var $this = $(this);
                var $btnClear = $this.parent().children(".am-input-clear");
                var $btnPwd = $this.parent().children(".am-input-pwd");
                $this.data("required", $this.attr("required") ? true : false);
                $this.data("formName", $this.data("required") ? $this.parents("[data-form*='form']").data("form") : "form");
                var $formBtn = $this.data("required") ? $("[data-form='" + $this.data("formName") + "-btn']") : false;
                var $formInput = $this.data("required") ? $("[data-form='" + $this.data("formName") + "']").find("input[required]") : false;

                //绑定input相关事件
                $this
                    .off("input.clear")
                    .on("input.clear", function() {
                        methods._checkBtnClear($this, $btnClear);
                        methods._checkFormBtn($formBtn, $formInput);
                        if ($this.val() === "") {
                            methods._inputClear($this, $btnClear);
                        }
                    })
                    .off("focus.clear")
                    .off("blur.clear")
                    .off("touchend.autoscroll")
                    .on("focus.clear", function() {
                        methods._checkBtnClear($this, $btnClear);
                    })
                    .on("blur.clear", function() {
                        methods._checkBtnClear($this, $btnClear);
                    })
                    .on("touchend.autoscroll", function() {
                        methods._autoScroll($this);
                    });

                //绑定clear按钮相关事件
                if ($btnClear.length > 0) {
                    $btnClear
                        .off($.touchend + ".clear")
                        .on($.touchend + ".clear", function() {
                            //touchmoved checking
                            if (!$.touchMoved) {
                                methods._inputClear($this, $btnClear);
                                methods._checkFormBtn($formBtn, $formInput);
                            }
                        });
                }

                //绑定pwd按钮相关事件
                if ($btnPwd.length > 0) {
                    $btnPwd
                        .show()
                        .off($.touchend + ".pwd")
                        .on($.touchend + ".pwd", function() {
                            //touchmoved checking
                            if (!$.touchMoved) {
                                if (!$this.parent().hasClass("am-on")) {
                                    $this.parent().addClass("am-on");
                                    $this.attr({
                                        "type": "text"
                                    });
                                } else {
                                    $this.parent().removeClass("am-on");
                                    $this.attr({
                                        "type": "password"
                                    });
                                }
                            }
                        });
                }

                //初始检查required表单按钮状态
                methods._checkFormBtn($formBtn, $formInput);
            });
        },
        _inputClear: function($this, $btnClear) {
            $this.val("");
            methods._checkBtnClear($this, $btnClear);
            opt.onClear($this.attr("id") || undefined);
        },
        _checkBtnClear: function($this, $btnClear) {
            // settimeout 250 for pc blur time
            setTimeout(function() {
                if ($this.val() && $this.is(":focus")) {
                    $btnClear.show();
                } else {
                    $btnClear.hide();
                    clearTimeout(timeout);
                }
            }, 250);
        },
        _checkFormBtn: function($formBtn, $formInput) {
            var pass = true;
            if ($formBtn) {
                for (var i = 0; i < $formInput.length; i++) {
                    if ($formInput.eq(i).val() === "") {
                        pass = false;
                    }
                }
                pass ? $formBtn.removeClass("am-disable") : $formBtn.addClass("am-disable");
            }
        },
        //获取焦点时滚动避开键盘高度
        _autoScroll: function($this) {
            if ($.html.hasClass("android")) {
                var t = $this.offset().top - $.scrollY[$.xIndex].y;
                if (t > $.winH / 2) {
                    t = (t - $.winH / 3) * -1;
                    timeout = setTimeout(function() {
                        $.scrollY[$.xIndex].scrollTo(0, t);
                    }, 500);
                }
            }
        }
    };

}(jQuery);
