! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnBtnSwitch = function(method) {
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
            x: null,
            _x: null,
            y: null,
            _y: null,
            state: null,
            _state: null
        },
        touchSensitive: 80,
        onSwitch: function(id, state) {}
    };
    var lock = false;
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                $this.data(opt._data);
                $this
                    .off($.touchstart + ".btnswitch")
                    .on($.touchstart + ".btnswitch", function(e) {
                        methods._btnTouchStart(e, $this);
                    });
            });
        },
        //按钮按下事件
        _btnTouchStart: function(e, $this) {
            if (!lock) {
                //加锁
                lock = true;
                //禁用页面滚动条
                $.scrollY[0] ? $.scrollY[0].disable() : false;
                //改变按钮样式，绑定事件
                $this.addClass("am-active");
                //定义坐标
                $.settouch.init(e);
                //记录原始值
                $this.data({
                    _x: $.touchX,
                    _y: $.touchY,
                    _state: $this.hasClass("am-on")
                });
                $this.on($.touchend + ".btnswitch", function(e) {
                    methods._btnTouchEnd(e, $this);
                });
                $this.on($.touchmove + ".btnswitch", function(e) {
                    methods._btnTouchMove(e, $this);
                });
                return $this;
            }
        },
        //按钮松开事件
        _btnTouchEnd: function(e, $this) {
            //启用页面滚动条
            $.scrollY[0] ? $.scrollY[0].enable() : false;
            //切换状态
            if ($this.hasClass("am-on")) {
                $this.removeClass("am-on");
            } else {
                $this.addClass("am-on");
            }
            $this.removeClass("am-active");
            $this.off($.touchend + ".btnswitch");
            $this.off($.touchmove + ".btnswitch");
            //当按键弹回后执行回调
            setTimeout(function() {
                opt.onSwitch(methods._getId($this), $this.hasClass("am-on"));
                //解锁
                lock = false;
            }, $.globalSpeed);
            return $this;
        },
        //按钮移动事件
        _btnTouchMove: function(e, $this) {
            //定义坐标
            $.settouch.init(e);
            $this.data({
                x: $.touchX - $this.data("_x"),
                y: $.touchY - $this.data("_y")
            });
            //移动超出范围
            if (Math.abs($this.data("y")) > opt.touchSensitive || Math.abs($this.data("x")) > opt.touchSensitive) {
                $this.removeClass("am-active");
                $this.data({ "state": $this.hasClass("am-on") });
                $this.off($.touchend + ".btnswitch").off($.touchmove + ".btnswitch");
                //有改变开关状态
                if ($this.data("_state") !== $this.data("state")) {
                    opt.onSwitch($this.attr("id") || undefined, $this.hasClass("am-on"));
                }
                //启用页面滚动条
                $.scrollY[0] ? $.scrollY[0].enable() : false;
            }
            //移动在范围内
            else {
                //切换为关闭
                if ($this.hasClass("am-on") && $this.data("x") < opt.touchSensitive / 4 * -1) {
                    $this.removeClass("am-on");
                    $this.data("state", $this.hasClass("am-on"));
                    $this.off($.touchend + ".btnswitch").on($.touchend + ".btnswitch", function() {
                        methods._btnTouchMoveEnd($this);
                    });
                } else
                //切换到开启
                if (!$this.hasClass("am-on") && $this.data("x") > opt.touchSensitive / 4) {
                    $this.addClass("am-on");
                    $this.data("state", $this.hasClass("am-on"));
                    $this.off($.touchend + ".btnswitch").on($.touchend + ".btnswitch", function() {
                        methods._btnTouchMoveEnd($this);
                    });
                }
            }
            //解锁
            lock = false;
            return $this;
        },
        //按键移动超出范围
        _btnTouchMoveEnd: function($this) {
            $this.removeClass("am-active");
            if ($this.data("_state") !== $this.data("state")) {
                opt.onSwitch(methods._getId($this), $this.hasClass("am-on"));
            }
            return $this;
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        }
    };

}(jQuery);
