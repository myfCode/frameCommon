! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fnEyeNumber = function(method) {
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
            number: null
        },
        isOpen: true,
        onChanged: function(state) {}
    };
    var $this = $(".am-icon-eye-w").eq(0);
    var $num = $(".am-eye-number");
    var hiddenHtml = "****";
    var loadingHtml = "<p>.</p>";
    var lock = false;
    // cuOptions需引用countUp.js
    var cuOptions = {
        useEasing: true,
          useGrouping: true,
          separator: ',',
          decimal: '.',
    };

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            methods._checkText();
        },
        //判断是否已有数据（微信）
        _checkText: function() {
            $num.each(function() {
                $(this).text() === "" ? $(this).html(loadingHtml + loadingHtml + loadingHtml) : false;
            });
        },
        //切换
        _checkChange: function() {
            if (!lock) {
                lock = true;
                if (opt.isOpen) {
                    methods.eyeOpen();
                } else {
                    methods.eyeClose();
                }
                //call back
                opt.onChanged(!opt.isOpen);
                //reset lock
                setTimeout(function() {
                    lock = false;
                }, 300);
            }
        },
        //眼睛打开事件
        eyeOpen: function() {
            //设置眼睛图标打开样式
            $this.addClass("am-on");
            opt.isOpen = false;
            //设置数值状态
            $num.each(function() {
                var num = Number($(this).data("number"));
                var id = $(this).attr("id");
                var countUp;
                $(this).addClass("am-on");
                if (!isNaN(num)) {
                    countUp = new CountUp(id, 0, num, 2, 0.3, cuOptions);
                    countUp.start();
                } else {
                    $(this).text($(this).data("number"));
                }
            });
        },
        //眼睛关闭事件
        eyeClose: function() {
            //设置眼睛图标关闭样式
            $this.removeClass("am-on");
            opt.isOpen = true;
            //设置数值状态
            $num.each(function() {
                $(this).removeClass("am-on").text(hiddenHtml);
            });
        },
        ready: function() {
            //显示眼睛按钮
            $this.show();
            //初始data记录
            $num.each(function(i) {
                $(this).data({
                    "number": $(this).text()
                }).addClass("am-ready");
            });
            //初始执行
            methods._checkChange();
            //绑定事件
            $this.off($.touchend + ".eyenumber").on($.touchend + ".eyenumber", function() {
                //检测点击移动 & 当前禁用
                if (!$.touchMoved) {
                    methods._checkChange();
                }
            });
        }
    };

}(jQuery);
