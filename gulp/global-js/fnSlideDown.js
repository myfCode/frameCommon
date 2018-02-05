! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnSlideDown = function(method) {
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
            index: null,
            state: null
        },
        only: true, //only one line at one time
        onSlide: function(id, index, state) {}
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $btn = $this.find(">.am-row");

                $btn.each(function() {
                    methods._checkState($this, $btn, $(this));
                });

                //bind event
                $btn.off($.touchend + ".slidedown").on($.touchend + ".slidedown", function() {
                    if (!$.touchMoved) {
                        methods._slide($this, $btn, $(this));
                    }
                });

            });
        },
        _checkState: function($this, $btn, _this) {
            _this.data({
                "index": _this.index(),
            });
            if (_this.hasClass(".am-on")) {
                _this.data({
                    "index": _this.index(),
                    state: 1
                });
                setTimeout(function() {
                    methods._slideEnd($this, $btn);
                }, $.globalSpeed);
            }
        },
        //下拉点击事件
        _slide: function($this, $btn, _this) {
            if (!_this.hasClass("am-on")) {
                if (opt.only) {
                    _this.siblings().removeClass("am-on");
                }
                _this.addClass("am-on");
                _this.data("state", 1);
            } else {
                _this.removeClass("am-on");
                _this.data("state", 0);
            }
            setTimeout(function() {
                methods._slideEnd($this, $btn, _this);
            }, $.globalSpeed);
        },
        //切换动画完成事件
        _slideEnd: function($this, $btn, _this) {
            //刷新当前pageY滚动条
            $.scrollY[$.xIndex] ? $.scrollY[$.xIndex].refresh() : false;
            //call back
            opt.onSlide(methods._getId($this), _this.data("index"), _this.data("state"));
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        }
    };

}(jQuery);
