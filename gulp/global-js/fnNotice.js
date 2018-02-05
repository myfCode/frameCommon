! function($) {
    "use strict";
    //has this
    //has opt
    //hasn't each

    $.fnNotice = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + method + " does not exist on this plug");
        }
    };

    var opt;
    var def = {
        msg: "", //默认无消息
        time: 4 //默认显示时间4秒
    };
    var time = null;

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            //处理时间单位秒与毫秒兼容
            time = opt.time < 1000 ? opt.time * 1000 : opt.time;
            //判断不同执行状态
            if (!$("#am-notice").length && opt.msg.length !== 0) {
                methods._notice();
            } else {
                //清除各种timeout
                clearTimeout($.fnNoticeShowTimeOut);
                clearTimeout($.fnNoticeHideTimeOut);
                clearTimeout($.fnNoticeDestoryTimeOut);
                //销毁现有结构
                methods.destroy(0);
                //如果有新提示，销毁后执行
                if (opt.msg.length !== 0) {
                    setTimeout(function() {
                        methods._notice();
                    }, $.globalSpeed);
                }
            }
        },
        //完整展示流程，创建——>销毁
        _notice: function() {
            methods._create();
            methods.destroy(time);
        },
        //创建
        _create: function() {
            var innerHtml = "<div class='am-notice' id='am-notice'>" + opt.msg + "</div>";
            $.body.append(innerHtml);
            $.fnNoticeShowTimeOut = setTimeout(function() {
                $("#am-notice").addClass("am-on");
            }, 50);
            //此处延迟50ms为了dom操作时的等待时间，缺少会造成跳动
        },
        //销毁
        destroy: function(time) {
            time = time || 0;
            // 参数time为了实现显示完成后的销毁，与直接销毁的不同间隔要求
            $.fnNoticeHideTimeOut = setTimeout(function() {
                $("#am-notice").removeClass("am-on");
            }, time);
            $.fnNoticeDestoryTimeOut = setTimeout(function() {
                $("#am-notice").remove();
            }, time + $.globalSpeed);
        }
    };

}(jQuery);
