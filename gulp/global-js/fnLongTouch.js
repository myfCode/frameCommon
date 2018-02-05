! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnLongTouch = function(method) {
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
            timeOffsetL0: null,
            timeS: null,
            stepTime: null,
            timeOut: null,
            val: null,
            type: null,
            minVal: null,
            maxVal: null,
            curVal: null,
            stepVal: null
        },
        minVal: 4, //最小值
        maxVal: 12, //最大值
        curVal: 8, //默认值
        stepVal: 0.01, //最小变化值
        onChanged: function(id, val) {}, //改变值后回调
        onTouchEnd: function(id, val) {}, //长按松开回调
        onValMin: function(id) {}, //小于最小值回调
        onValMax: function(id) {} //大于最大值回调
    };
    var myTime = new Date();
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $btn = $this.find("div>.am-btn");
                var $input = $this.find(".am-input");
                $this.data(opt._data).data({
                    minVal: opt.minVal,
                    maxVal: opt.maxVal,
                    curVal: opt.curVal,
                    stepVal: opt.stepVal
                });
                $input.val($this.data("curVal"));
                $btn
                    .off($.touchstart + ".longtouch")
                    .off($.touchend + ".longtouch")
                    .on($.touchstart + ".longtouch", function(e) {
                        methods._btnTouchStart($this, $btn, $input, $(this), e);
                    })
                    .on($.touchend + ".longtouch", function() {
                        methods._btnTouchEnd($this);
                    });
                $input
                    .off("input.longtouch")
                    .on("input.longtouch", function() {
                        var val;
                        if (Number($(this).val()) > $this.data("maxVal")) {
                            $(this).val($this.data("maxVal"));
                        }
                        methods._inputChange($this, $btn, $input);
                    });
            });
        },
        //输入框值改变事件
        _inputChange: function($this, $btn, $input) {
            $this.data("val", Number($input.val()) || $this.data("curVal"));
            opt.onChanged(methods._getId($this), $this.data("val"));
        },
        //按钮开始点击事件
        _btnTouchStart: function($this, $btn, $input, _this, e) {
            //pc端绑定鼠标移出按钮后的touchend事件
            if ($.html.hasClass("am-pc")) {
                $(document)
                    .on($.touchend + ".longtouch", function() {
                        methods._btnTouchEnd($this);
                    });
            }
            methods._checkType($this, _this);
            $this.data("val", Number($input.val()));
            //清空后首次点击后回归到默认值
            if (!$this.data("val") && $this.data("type")) {
                $this.data("val", $this.data("curVal") - $this.data("stepVal"));
            } else if (!$this.data("val") && !$this.data("type")) {
                $this.data("val", $this.data("curVal") + $this.data("stepVal"));
            }
            //设置val
            methods.setVal($this, $input);
            myTime = new Date();
            $this.data("timeS", myTime.getTime());
            //首次点击后激活长按的间隔时间
            $this.data("timeOut", setTimeout(function() {
                methods._interval($this, $input);
            }, 500));
            //禁用Android系统长按事件
            e.preventDefault();
        },
        //判断点击按钮
        _checkType: function($this, _this) {
            if (_this.hasClass("am-btnAdd")) {
                $this.data("type", true);
            } else {
                $this.data("type", false);
            }
        },
        //按钮结束点击事件
        _btnTouchEnd: function($this) {
            //pc端绑定鼠标移出按钮后的touchend事件
            if ($.html.hasClass("am-pc")) {
                $(document)
                    .off($.touchend + ".longtouch");
            }
            myTime = new Date();
            $this.data("timeOffsetL0", myTime.getTime() - $this.data("timeS"));
            clearTimeout($this.data("timeOut"));
            //判断最大最小后不回调
            if ($this.data("val") !== $this.data("minVal") && $this.data("val") !== $this.data("maxVal")) {
                opt.onTouchEnd(methods._getId($this), $this.data("val"));
            }
        },
        //长按interval事件
        _interval: function($this, $input) {
            myTime = new Date();
            $this.data("timeOffsetL0", myTime.getTime() - $this.data("timeS"));
            //曲线变化公式
            $this.data("stepTime", 1 / Math.pow($this.data("timeOffsetL0") / 1000, 1.2) * 100);
            //最小间隔为屏幕刷新率
            if ($this.data("stepTime") < 1000 / 60) {
                $this.data("stepTime", 1000 / 60);
            }
            methods.setVal($this, $input);
            $this.data("timeOut", setTimeout(function() {
                methods._interval($this, $input);
            }, $this.data("stepTime")));
        },
        //设置当前值
        setVal: function($this, $input) {
            if (!$.touchMoved) {
                //判断加减按键
                if ($this.data("type")) {
                    $this.data("val", $this.data("val") + $this.data("stepVal"));
                } else {
                    $this.data("val", $this.data("val") - $this.data("stepVal"));
                }
                //判断最大最小值
                if ($this.data("val") < $this.data("minVal")) {
                    $this.data("val", $this.data("minVal"));
                    opt.onValMin(methods._getId($this));
                } else if ($this.data("val") > $this.data("maxVal")) {
                    $this.data("val", $this.data("maxVal"));
                    opt.onValMax(methods._getId($this));
                } else {
                    //设置数字并回调
                    $this.data("val", Number($this.data("val").toFixed(2)));
                    $input.val($this.data("val"));
                    opt.onChanged(methods._getId($this), $this.data("val"));
                }
            }
        },
        _getId: function($this) {
            return $this.attr("id") || undefined;
        }
    };

}(jQuery);
