! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fn.fnSlideRuler = function(method) {
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
        minVal: 1, //最低起投额
        maxVal: 100, //最高起投额
        step: 1, //递增递减额度，可选范围:[1,0.1]
        msg: "", //卡尺右侧提示文字
        onChanged: function(val) {}, //每次改变金额
        onReady: function(val) {}, //初始化完成
        onClear: function() {} //清空输入框
    };
    var $this = null;
    var $input = null;
    var $clear = null;
    var $outer = null;
    var $inner = null;
    var $ruler = null;
    var isDestory = false;
    var maxVal = null;
    var minVal = null;
    var length = null;
    var tempVal = null;
    var tempHtml = null;
    var valStep = null;
    var valCurrent = null;
    var itemWidth = 60;
    var valMultiple = 10000; //所有金额都是以万为单位

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = $(this);
            $input = $this.find(".am-input");
            $clear = $input.prev(".am-input-clear");
            $outer = $input.parents(".am-con");
            $inner = $this.find(".inner");
            isDestory = false;
            maxVal = opt.maxVal;
            minVal = opt.maxVal >= opt.minVal ? opt.minVal : opt.maxVal;
            length = maxVal - minVal;
            tempVal = length >= 0 ? minVal : maxVal;
            //执行方法
            methods._reset();
            methods._setRulerDom();
            methods._setScaleLine();
            //绑定事件
            $input.off("input.slideruler").on("input.slideruler", methods._inputChange);
            $clear.off($.touchend + ".slideruler").on($.touchend + ".slideruler", methods._inputClear);
            //set input val
            minVal !== 0 ? valCurrent = minVal : valCurrent = 0.0001;
            $input.val(valCurrent * valMultiple);
            opt.onReady(valCurrent);
            //判断min<=>max时
            if (opt.minVal >= opt.maxVal) {
                $input.attr("disabled", "disabled");
                $outer.addClass("am-disable");
                $this.find(".am-icon-inputedit").remove();
                //最小值大于最大值时
                if (opt.minVal > opt.maxVal) {
                    $inner.addClass("am-disable"); //禁用滚动条
                    $input.val(opt.minVal * valMultiple); //起投金额使用起投额
                    $ruler.find("li.last>span").addClass("am-color-red"); //提示文字红色
                }
                //不可滚动时销毁scroll
                $.scrollX[1] ? $.scrollX[1].destroy() : false;
            } else {
                //判断重复
                $.scrollX[1] ? $.scrollX[1].destroy() : false;
                //执行滚动条
                $.scrollX[1] = new IScroll(".am-slideRuler .inner", {
                    scrollX: true,
                    scrollY: false,
                    deceleration: 0.005
                });
                //绑定滚动事件
                $.scrollX[1].on("scroll", methods._scroll);
                $.scrollX[1].on("scrollStart", methods._checkFirstMove);
                $.scrollX[1].on("scrollEnd", methods._scrollEnd);
            }
        },
        //初始ruler结构
        _setRulerDom: function() {
            //设定first li dom
            tempHtml = "<ul class='ruler'>";
            tempHtml += "<li class='first' style='width:" + ($.winW / 2 + 1) + "px'><span>向左滑动</span></li>";
            tempHtml += "";
            //设定中间li dom
            if (length >= 0) {
                for (var i = 0; i < length + 1; i++) {
                    tempHtml += "<li style='width:" + itemWidth + "px;'><span>" + (parseInt(i) + tempVal) + "<em>万</em></span></li>";
                }
            }
            //加载&滚动条
            tempHtml += "</ul>";
            $inner.html(tempHtml);

            $ruler = $inner.find(".ruler");
            $ruler.find("li:last-child").addClass("last").width($.winW / 2 + 1).append("<span>" + opt.msg + "</span>");
            $ruler.css({ "width": length * itemWidth + $.winW + 4 });
        },
        //检测首次拖动
        _checkFirstMove: function() {
            $ruler.addClass("am-on"); //隐藏“向右滑动”提示
            $.scrollX[1].off("scrollStart", methods._checkFirstMove); //解除首次拖动事件
        },
        //设置刻度线
        _setScaleLine: function() {
            valStep = opt.step * valMultiple;
            $ruler.addClass("step" + valStep);
        },
        //滚动事件
        _scroll: function() {
            if ($input.val() === "") {
                $clear.show();
            }
            methods._setScrollVal();
            $input.val(valCurrent * valMultiple);
            opt.onChanged(valCurrent);
        },
        //滚动停止事件
        _scrollEnd: function() {
            methods._setScrollVal();
            methods._setRulerPos(valCurrent);
            $input.val(valCurrent * valMultiple);
            opt.onChanged(valCurrent);
        },
        //设置刻度尺状态
        _setRulerPos: function(val) {
            var _x = -1 * (val - 1) * itemWidth + (minVal - 1) * itemWidth;
            $.scrollX[1] ? $.scrollX[1].scrollTo(_x, 0) : false;
        },
        //设置当前值
        _setScrollVal: function() {
            var _x = $.scrollX[1].x;
            valCurrent = $.floatDiv($.floatMulti(-1, _x), itemWidth) + minVal;
            //检查移动刻度
            if (opt.step === 1) {
                valCurrent = Math.round(valCurrent);
            } else if (opt.step === 0.1) {
                valCurrent = parseFloat(valCurrent.toFixed(1));
            }
            methods._checkValOffset();
        },
        //输入框修改事件
        _inputChange: function() {
            //格式化后有非法字符时，重置输入框
            if ($input.val() !== $input.val().replace(/[^\d.]/g, '')) {
                $input.val($input.val().replace(/[^\d.]/g, ''));
            }
            valCurrent = $.floatDiv(Number($input.val()), valMultiple);
            methods._checkValOffset();
            methods._setRulerPos(valCurrent);
            opt.onChanged(valCurrent);
        },
        //输入框清除事件
        _inputClear: function() {
            valCurrent = 0;
            methods._checkValOffset();
            methods._setRulerPos(valCurrent);
            opt.onChanged(valCurrent);
            opt.onClear();
        },
        //检测超出范围
        _checkValOffset: function(val) {
            if (val == null && !isDestory) {
                //小于等于最小值时
                if (valCurrent <= minVal) {
                    valCurrent = minVal;
                    //最小值为0时，设置显示1元
                    if (minVal === 0) {
                        valCurrent = 0.0001;
                    }
                } else
                //大于最大值时
                if (valCurrent > maxVal) {
                    valCurrent = maxVal;
                }
            }
        },
        //重新运行重置
        _reset: function() {
            $this.removeClass("am-no-borderBottom");
            $inner.removeClass("am-hide am-disable");
            $outer.removeClass("am-disable");
            $input.removeAttr("disabled");
            !$input.next(".am-icon-inputedit").length ? $input.after("<span class='am-icon-inputedit'></span>") : false;
        },
        setVal: function(val) {
            valCurrent = val.toFixed(2);
            valCurrent = $.keep2(valCurrent);
            var inputVal = $.floatMulti(val, valMultiple);
            inputVal = $.keep2(inputVal.toFixed(2));
            $input.val(inputVal);
            methods._checkValOffset(valCurrent); //传参时代表指定当前值，否则根据min/max得到
            val = val < opt.minVal ? opt.minVal: val;
            val = val > opt.maxVal ? opt.maxVal: val;
            methods._setRulerPos(val);
            opt.onChanged(valCurrent);
        },
        destroy: function() {
            isDestory = true;
            $this = $(this);
            $input = $this.find(".am-input");
            $clear = $input.prev(".am-input-clear");
            $inner = $this.find(".inner");
            $outer = $input.parents(".am-con");
            //---
            methods._reset();
            $inner.addClass("am-hide");
            $this.addClass("am-no-borderBottom");
            if ($.scrollX[1]) {
                $.scrollX[1].off("scroll", methods._scroll);
                $.scrollX[1].off("scrollStart", methods._checkFirstMove);
                $.scrollX[1].off("scrollEnd", methods._scrollEnd);
            }
        }
    };

}(jQuery);
