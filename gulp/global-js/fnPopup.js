! function($) {
    "use strict";
    //hasn't this
    //has opt
    //hasn't each

    $.fnPopup = function(method) {
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
        type: "alert", //弹窗类型
        class: "", //inner上的自定义class名，与css配合使用
        msg: "", //标题
        content: "", //内容，多种type下可定义为不同格式，具体请参考demo页面
        btnCancelName: "取消", //取消按钮文字
        btnConfirmName: "确认", //确认按钮文字
        onCancel: function() {},
        onConfirm: function(val) {},
        onReady: function(popId) {}
    };
    var popId = null;
    var type = null;

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            methods._setType();
            methods._open();
        },
        _setType: function() {
            //popup type set
            if (opt.type === 'alert') {
                type = 1;
            } else if (opt.type === 'confirm') {
                type = 2;
            } else if (opt.type === 'select') {
                type = 3;
            } else if (opt.type === 'passcode') {
                type = 4; //依赖fnKeyBoard
            } else if (opt.type === 'prompt') {
                type = 5;
            } else if (opt.type === 'share') {
                type = 6;
            } else if (opt.type === 'input') {
                type = 7;
            } else if (opt.type === 'custom') {
                type = 8;
            } else if (opt.type === 'middle') {
                type = 9;
            } else if (opt.type === 'alertselect') {
                type = 10;
            }
        },
        //open
        _open: function() {
            //检查是否移动
            if ($.touchMoved) {
                return false;
            }
            methods._checkRepeat();
            popId = "pop-" + Math.floor(Math.random() * 10000000000 + 1);

            var innerHtml;
            //type alert
            if (type === 1) {
                innerHtml = "<div class='am-pop am-popAlert' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type confirm
            if (type === 2) {
                innerHtml = "<div class='am-pop am-popConfirm' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6><a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type select
            if (type === 3) {
                innerHtml = "<div class='am-pop am-popSelect' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'>";
                if (opt.msg !== "") {
                    innerHtml += "<h6><span>" + opt.msg + "</span></h6>";
                }
                innerHtml += "<div>";
                for (var i = 0; i < opt.content.length; i++) {
                    //opt.color checking
                    if (opt.content[i].btnColor) {
                        innerHtml += "<a id='" + opt.content[i].id + "' class='am-popbtn am-submit " + opt.content[i].btnColor + "'><span>" + opt.content[i].btnName + "</span></a>";
                    } else {
                        innerHtml += "<a id='" + opt.content[i].id + "' class='am-popbtn am-submit'><span>" + opt.content[i].btnName + "</span></a>";
                    }
                }
                innerHtml += "</div><a class='am-popbtn am-cancel'><span>" + opt.btnCancelName + "</span></a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type passcode
            if (type === 4) {
                //初始键盘高度
                var KBheight
                if ($.html.hasClass("am-mob") && !$.html.hasClass("am-pad")) {
                    KBheight = $.winW / 1.46 + "px";
                } else {
                    KBheight = "";
                }
                innerHtml = "<div class='am-pop am-popPasscode' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><a class='am-popbtn am-close'>X</a><h6><span>" + opt.msg + "</span></h6><div class='code'><span></span><span></span><span></span><span></span><span></span><span></span></div><span class='am-keyboard-input am-hide' id='popKB'></span><a class='am-forget-pwd'>忘记交易密码？</a></div></div>";
                //检查是否已存在
                !$("#KBCon").length ? $.fn.fnKeyBoard("KBReady") : false;
                //不同位置插入pop
                $("#KBCon").before(innerHtml);
                //执行onReady回调
                opt.onReady(popId);
                //加载键盘
                $("#popKB").fnKeyBoard({
                    min: 6,
                    max: 6,
                    keyRandom: true,
                    allowScroll: false,
                    onChanged: function(val) {
                        methods._setPwd(val);
                    }
                });
            } else
            //type prompt
            if (type === 5) {
                innerHtml = "<div class='am-pop am-popPrompt' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6><div class='prompt-inner' style='max-height:" + ($.winH * 0.8 - 6.75 * $.fontSize) + "px'>" + opt.content + "</div><a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                document.removeEventListener($.touchmove, $.preventDefault, { passive: false });
                opt.onReady(popId);
            } else
            //type share
            if (type === 6) {
                innerHtml = "<div class='am-pop am-popShare' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><strong class='my'>我的邀请二维码</strong><div class='code'><span></span><p class='am-xs am-align-center am-color-black1'>扫一扫上面的二维码，加入鲸钱包</p></div><strong class='share'>分享到</strong><div class='list am-g-4'><a class='am-popbtn iconWechat'><span>微信好友</span></a><a class='am-popbtn iconWxCircle'><span>朋友圈</span></a><a class='am-popbtn iconQQ'><span>QQ好友</span></a><a class='am-popbtn iconMessage'><span>短信</span></a></div></div></div>";
                $.body.append(innerHtml);
                for (var i = 0; i < opt.content.length; i++) {
                    if (opt.content[i]) {
                        $("#" + popId).find(".am-popbtn").eq(i).addClass("am-on");
                    }
                }
                opt.onReady(popId);
            } else
            //type input
            if (type === 7) {
                innerHtml = "<div class='am-pop am-popInput' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6>" + opt.msg + "</h6><span>" + opt.content + "</span><input type='text' /><a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a><a class='am-popbtn am-submit'>" + opt.btnConfirmName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            } else
            //type custom
            if (type === 8) {
                innerHtml = "<div class='am-pop am-popCustom' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6>" + opt.msg + "</h6>" + opt.content + "<a class='am-popbtn am-cancel am-btn-active'><span class='am-icon-close'></span></a><a class='am-popbtn am-back am-btn-active'><span class='am-icon-back'></span></a></div></div>";
                $.body.append(innerHtml);
                document.removeEventListener($.touchmove, $.preventDefault, { passive: false });
                opt.onReady(popId);
            } else
            //type middle
            if (type === 9) {
                innerHtml = "<div class='am-pop am-popMiddle' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'>" + opt.content + "<a class='am-popbtn am-cancel'><span class='am-icon-close-w'></span></a></div></div>";
                $.body.append(innerHtml);
                document.removeEventListener($.touchmove, $.preventDefault, { passive: false });
                opt.onReady(popId);
            } else
            //type alertselect
            if (type === 10) {
                innerHtml = "<div class='am-pop am-popAlertSelect' id='" + popId + "'><div class='popBg'></div><div class='inner " + opt.class + "'><h6><span>" + opt.msg + "</span></h6>";
                for (var i = 0; i < opt.content.length; i++) {
                    innerHtml += "<a id='" + opt.content[i].id + "' class='am-popbtn am-submit'>" + opt.content[i].btnName + "</a>";
                }
                innerHtml += "<a class='am-popbtn am-cancel'>" + opt.btnCancelName + "</a></div></div>";
                $.body.append(innerHtml);
                opt.onReady(popId);
            }
            //set btn cancel
            if (opt.btnCancelName === "") {
                $("#" + popId).addClass("am-noCancel");
            }
            if (opt.btnSubmitName === "") {
                $("#" + popId).addClass("am-noSubmit");
            }
            //bind popup inner btn click
            methods._setBtnEvent();
            //for ios keyboard auto release
            $.amBody.find(".am-input").blur();
            //popup show
            rAF(function() {
                $("#" + popId).addClass("am-on");
            });
        },
        // set pwd
        _setPwd: function(val) {
            var $dot = $("#" + popId).find(".inner .code>span");
            $dot.removeClass("am-on");
            if (val && val.length < 7) {
                for (var i = 0; i < val.length; i++) {
                    $dot.eq(i).addClass("am-on");
                }
                if (val.length === 6) {
                    $("#" + popId).find(".code").addClass("am-color-blue");
                    setTimeout(function() {
                        opt.onConfirm(val);
                        $("#popKB").fnKeyBoard("KBClear");
                        $("#" + popId).find(".code").removeClass("am-color-blue");
                        $.fn.fnKeyBoard("KBClose");
                        methods.destroy();
                    }, $.globalSpeed);
                }
            }
        },
        //set popup inner btn event
        _setBtnEvent: function() {
            var index;
            // popBtn按钮点击
            $("#" + popId).find(".am-popbtn").off($.touchend + ".popup").on($.touchend + ".popup", function() {
                //touchmoved checking
                if ($.touchMoved) {
                    return false;
                }
                //callback type alert
                if (type === 1) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm();
                    }
                } else
                //callback type comfirm
                if (type === 2) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm();
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type select
                if (type === 3) {
                    methods.destroy();
                    index = $(this).index();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm(opt.content[index]);
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type passcode
                if (type === 4) {
                    //key close
                    if ($(this).hasClass("am-close")) {
                        methods.destroy();
                        $.fn.fnKeyBoard("KBClose");
                        //callback
                        opt.onCancel();
                    }
                } else
                //callback type prompt
                if (type === 5) {
                    if ($(this).hasClass("am-submit")) {
                        if (opt.onConfirm() !== false) {
                            methods.destroy();
                        }
                    } else if ($(this).hasClass("am-cancel")) {
                        methods.destroy();
                        opt.onCancel();
                    }
                } else
                //callback type share
                if (type === 6) {
                    if ($(this).hasClass("am-popbtn") && $(this).hasClass("am-on")) {
                        methods.destroy();
                        index = $(this).index();
                        opt.onConfirm(index);
                    }
                } else
                //callback type input
                if (type === 7) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        var val = $("#" + popId).find("input").eq(0).val();
                        opt.onConfirm(val);
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type custom
                if (type === 8) {
                    if ($(this).hasClass("am-submit")) {
                        methods.destroy();
                        opt.onConfirm(val);
                    } else if ($(this).hasClass("am-cancel")) {
                        methods.destroy();
                        opt.onCancel();
                    }
                } else
                //callback type middle
                if (type === 9) {
                    methods.destroy();
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm();
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                } else
                //callback type alertselect
                if (type === 10) {
                    methods.destroy();
                    index = $(this).index() - 1; //content传入参数从cancel按钮位置后计算需减2
                    if ($(this).hasClass("am-submit")) {
                        opt.onConfirm(opt.content[index]);
                    } else if ($(this).hasClass("am-cancel")) {
                        opt.onCancel();
                    }
                }
                //防止点击穿透弹层背部有link
                return;
            });
            // popBg遮罩层点击关闭
            $("#" + popId).find(".popBg").off($.touchend + ".popup").on($.touchend + ".popup", function() {
                if (type !== 1) {
                    methods.destroy();
                    opt.onCancel();
                }
                if (type === 4) {
                    $.fn.fnKeyBoard("KBClose");
                }
                return;
            });
            //密码键盘关闭事件联动pop
            if (type === 4) {
                $(".am-keyboard.number .btnFnCancel").off($.touchend + ".popup").on($.touchend + ".popup", function() {
                    methods.destroy();
                    opt.onCancel();
                });
            }
            //pc端键盘关闭事件
            if ($.html.hasClass("am-pc")) {
                $(window).off("keyup.popup").on("keyup.popup", function(e) {
                    if (e.keyCode === 27 && type !== 1) {
                        methods.destroy();
                        opt.onCancel();
                    }
                });
            }
        },
        //check repeat
        _checkRepeat: function() {
            if ($(".am-pop").length) {
                $("body>.am-pop").eq(0).remove();
            }
        },
        //destroy
        destroy: function() {
            //reset preventDefault
            document.addEventListener($.touchmove, $.preventDefault, { passive: false });
            var $pop = $("#" + popId);
            //disable popbtn double click 
            $pop.find(".am-popbtn,.am-btn").off($.touchend + ".popup");
            //hide pop window
            $pop.removeClass("am-on");
            //remove esc event
            $(window).off("keyup.popup");
            //body pointer reset
            setTimeout(function() {
                $pop.remove();
            }, $.globalSpeed + 200);
        }
    };
}(jQuery);
