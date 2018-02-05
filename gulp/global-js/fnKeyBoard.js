! function($) {
    "use strict";
    //hasn't this
    //has opt
    //hasn't each

    $.fn.fnKeyBoard = function(method) {
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
        type: 0, //0数字，1字母，2符号，3金额
        min: 6, //最小长度
        max: 20, //最大长度
        letterUp: false, //字母键盘默认为大写
        keyRandom: false, //按键随机排列
        allowClose: true, //是否允许关闭
        allowScroll: true, //是否允许滚动
        filter: [43, 45, 92, 47, 91, 93, 123, 125, 44, 8364, 163, 165, 32], //过渡字符,ascii码
        onChanged: function(val, lastkey) {}, //回调-每次改变数值
        onCancel: function(val) {}, //回调-取消
        onDone: function(val) {}, //回调-完成
        onOffsetMin: function(min) {}, //回调-完成时，长度小于最小值
        onOffsetMax: function(max) {}, //回调-完成时，长度大于最大值
        onFilter: function() {} //回调-遇到过滤字符时
    };
    var $input = null;
    var $keyboard = null;
    var $keyboardCon = null;
    var $keyboardCtrl = null;
    var $keyboardCtrlBtn = null;
    var $keyboardL = null;
    var $keyboardN = null;
    var $keyboardS = null;
    var $keyboardP = null;
    var $keyBtn = null;
    var $keyFnBtn = null;
    var $keyBtnGroup = null;
    var $inputAll = null;
    var $btnClear = null;
    var $btnPwd = null;
    var fnbtnSelector = null;
    var inputVal = null;
    var inputValLast = null;
    var deleteInterval = null;
    var deleteTimeout = null;
    var keyMove_x = null;
    var keyMove_y = null;
    var eyeOpen = null;
    var delayTime = null;
    var arrayAfter = [];
    var arrayBefore = [];
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $input = $(this); //安全键盘输入框
            $keyboardCon = $("#KBCon"); //键盘外层容器
            $keyboard = $keyboardCon.children(".am-keyboard"); //键盘容器
            $keyboardCtrl = $keyboardCon.children(".ctrl"); //隐藏控制容器
            $keyboardL = $keyboard.filter(".letter"); //定义字母键盘
            $keyboardN = $keyboard.filter(".number"); //定义数字键盘
            $keyboardS = $keyboard.filter(".symbol"); //定义符号键盘
            $keyboardP = $keyboard.filter(".price"); //定义金额键盘
            $inputAll = $(".am-keyboard-input");
            $btnClear = $input.prev(".am-input-clear"); //输入框清除按键
            $btnPwd = $btnClear.prev(".am-input-pwd"); //密码显示按键
            fnbtnSelector = ".btnFnLetter,.btnFnSymbol,.btnFnSpace,.btnFnShift,.btnFnDelete,.btnFnCancel,.btnFnDone,.btnFnNull";
            inputVal = $input.data("value") !== undefined ? String($input.data("value")) : ""; //设置输入框当前值，必须为string
            eyeOpen = opt.type === 3 ? 1 : $btnPwd.parent(".am-on").length; //输入框默认显示状态，金额键盘默认打开
            delayTime = 1; //键盘延迟弹出时间
            //重复点击输入框处理
            if ($input.hasClass("am-on")) {
                return false;
            }
            //判断键盘是否已存在
            if ($keyboardCon.length) {
                //清除已展开键盘的眼睛与删除按键
                $inputAll.prev(".am-input-clear").hide().prev(".am-input-pwd").hide();
            }
            //初始化判断letterup
            if (opt.letterUp) {
                $keyboardL.addClass("up");
            }
            //数字键盘初始化按键随机排列
            if (opt.type === 0) {
                methods._keyRandom(opt.type);
            }
            //检查pc及pad端的键盘弹出定位
            $.html.hasClass("am-pc") ? methods._setKbPos() : false;
            //初始化默认键盘类型并显示
            $keyboard.removeClass("am-on").eq(opt.type).addClass("am-on");
            //上拉键盘动画后需延迟200ms设置按键坐标
            setTimeout(function() {
                methods._setKeyPos(opt.type);
            }, $.globalSpeed + 200);
            //定义按键及功能键选择器
            $keyFnBtn = $keyboard.find(fnbtnSelector);
            $keyBtn = $keyboard.find(".am-btn").not(fnbtnSelector);
            //绑定事件
            $keyFnBtn
                .off($.touchend + ".keyboard")
                .off($.touchstart + ".keyboard")
                .off($.touchmove + ".keyboard")
                .on($.touchstart + ".keyboard", methods._keyFnDown)
                .on($.touchend + ".keyboard", methods._keyFnUp)
                .on($.touchmove + ".keyboard", methods._keyFnMove);
            $keyBtn
                .off($.touchend + ".keyboard")
                .off($.touchstart + ".keyboard")
                .off($.touchmove + ".keyboard")
                .on($.touchstart + ".keyboard", methods._keyDown)
                .on($.touchend + ".keyboard", methods._keyUp)
                .on($.touchmove + ".keyboard", methods._keyMove);
            $btnPwd
                .off($.touchend + ".keyboard")
                .on($.touchend + ".keyboard", methods._btnPwdTouch);
            $btnClear
                .off($.touchend + ".keyboard")
                .on($.touchend + ".keyboard", methods._btnClearTouch);
            //设置允许关闭样式
            $keyboardCon.removeClass("cantclsose");
            if (!opt.allowClose) {
                $keyboardCon.addClass("cantclsose");
                $(document).off($.touchend + ".keyboard");
            }
            methods._checkInputBlur();
            //键盘弹出
            setTimeout(function() {
                methods._KBSwitch(1);
                methods._checkBtnState();
                $btnPwd.show();
            }, delayTime);
        },
        //转换千分位
        _toAmount: function(num) {
            if (num) {
                var numArr = (num + '').replace(/,/g, "").split(".");
                var str = numArr[0];
                while (/(\d+)(\d{3})/.test(str)) {
                    str = str.replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
                }
                if (numArr.length === 2) {
                    return str + '.' + numArr[1];
                } else {
                    return (numArr[1]) ? (str + '.' + numArr[1]) : str;
                }
            } else {
                return '';
            }
        },
        //检查是否有系统键盘弹出
        _checkInputBlur: function() {
            delayTime = 1;
            $("input").each(function() {
                if ($(this).is(":focus")) {
                    delayTime += 200;
                    return;
                }
            });
        },
        //pc端定位键盘位置
        _setKbPos: function() {
            if ($keyboardCon.prev(".am-popPasscode").length) {
                $keyboardCon.css({ "left": "50%", "top": ($(".am-popPasscode .inner").offset().top + $(".am-popPasscode .inner").outerHeight() + 50) });
            } else {
                $keyboardCon.css({ "left": $input.offset().left, "top": $input.offset().top + $.fontSize * 2.25 + 2 });
            }
        },
        //眼睛按键状态切换
        _btnPwdTouch: function() {
            if (!$.touchMoved) {
                if ($(this).parent().hasClass("am-on")) {
                    $(this).parent().removeClass("am-on");
                    eyeOpen = 0;
                } else {
                    $(this).parent().addClass("am-on");
                    eyeOpen = 1;
                }
                methods._checkBtnPwd();
            }
        },
        //清除按键事件
        _btnClearTouch: function() {
            if (!$.touchMoved) {
                methods.KBClear($input);
            }
        },
        //眼睛按键功能
        _checkBtnPwd: function() {
            $input.data("value", inputVal);
            if (eyeOpen === 0) {
                var tempVal = "";
                for (var i = 0; i < inputVal.length; i++) {
                    tempVal += "●";
                }
                methods._setValue(tempVal);
            } else {
                methods._setValue($input.data("value"));
            }
        },
        //检查清除&完成按键状态
        _checkBtnDone: function() {
            if (inputVal !== "" && $input.hasClass("am-on")) {
                $btnClear.show();
                $keyboard.find(".btnFnDone").addClass("am-on");
            } else {
                $btnClear.hide();
                $keyboard.find(".btnFnDone").removeClass("am-on");
            }
        },
        //检查各种按键状态
        _checkBtnState: function() {
            methods._checkBtnPwd();
            methods._checkBtnDone();
        },
        //检查过滤字符
        _checkFilterKey: function() {
            //包含需要过滤字符,仅处理符号键盘
            if ($keyboardS.hasClass("am-on") && opt.filter.indexOf(ascii) > -1) {
                if (inputValLast === 32) {
                    inputValLast = "空格" //特殊处理"空格"
                } else {
                    inputValLast = String.fromCharCode(inputValLast); //其它过渡字符
                }
                opt.onFilter(inputValLast); //过渡后回调
                inputValLast = ""; //过渡后清除变量
            }
            //不包含需要过滤字符
            else {
                //判断空值不做fromCharCode 否则length会变1
                if (inputValLast != "") {
                    inputValLast = String.fromCharCode(inputValLast);
                }
            }
        },
        //检查placeholder显示状态
        _checkPlaceholder: function() {
            if (inputVal.length) {
                $input.next("sub").addClass("am-off");
            } else {
                $input.next("sub").removeClass("am-off");
            }
        },
        //普通按键down事件
        _keyDown: function() {
            $.scrollY[0] ? $.scrollY[0].disable() : false;
            $keyBtn.removeClass("am-active");
            //解决安卓长按弹出菜单,IOS在屏幕边缘快速点击中断问题
            $keyboardCon.on("touchstart", function(e) {
                e.preventDefault();
            });
        },
        //普通按键up事件
        _keyUp: function() {
            //直接点击，定义inputvallast值
            if (!$.touchMoved) {
                inputValLast = $(this).data("ascii");
            }
            //金额键盘
            if ($keyboardP.hasClass("am-on")) {
                //小数点按键
                if ($(this).hasClass("btn-dot")) {
                    // 小数点只能出现一次，并且不在第一个字符
                    if (inputVal.indexOf(".") > 0 || inputVal.length == 0) {
                        inputValLast = "";
                    }
                }
                //其它按键
                else {
                    // 小数点前的0只能有一个，并且0开头后只能跟小数点
                    if (inputVal.length === 1 && inputVal.indexOf("0") > -1) {
                        inputValLast = "";
                    }
                }
            }
            //过滤禁用字符
            methods._checkFilterKey();
            //处理大写字母转换
            if ($(this).parents(".am-keyboard").hasClass("up")) {
                inputValLast = inputValLast.toUpperCase();
            }
            //设置当前输入框最终结果
            inputVal += inputValLast.replace(/(^\s*)|(\s*$)/g, "");
            //超出max时的处理
            if (inputVal.length > opt.max) {
                inputVal = inputVal.substring(0, opt.max);
                opt.onOffsetMax(opt.max);
            }
            //未超出max时的处理
            else {
                methods._setValue(inputVal);
                opt.onChanged(inputVal, inputValLast);
            }
            //按下移动后，移除所有按键active样式
            if ($.touchMoved) {
                $keyBtnGroup.removeClass("am-active");
            }
            methods._checkBtnState();
            //恢复页面滚动
            $.scrollY[0] ? $.scrollY[0].enable() : false;
        },
        //普通按键move事件
        _keyMove: function(e) {
            //获取手指滑动坐标
            $.settouch.init(e);
            keyMove_x = $.touchX;
            keyMove_y = $.touchY;
            //匹配当前按键
            $keyBtnGroup.each(function() {
                if (keyMove_x > $(this).data("left") && keyMove_x < $(this).data("right") && keyMove_y > $(this).data("top") && keyMove_y < $(this).data("bottom")) {
                    //检查重复执行
                    if (inputValLast !== $(this).data("ascii")) {
                        $keyBtnGroup.removeClass("am-active");
                        $(this).addClass("am-active");
                        inputValLast = $(this).data("ascii");
                    }
                    return;
                }
            });
        },
        //功能按键down事件
        _keyFnDown: function() {
            $.scrollY[0] ? $.scrollY[0].disable() : false;
            //删除按键长按事件
            if ($(this).hasClass("btnFnDelete")) {
                valDelete();
                deleteTimeout = setTimeout(function() {
                    deleteInterval = setInterval(valDelete, 150);
                }, 750);
            }
            $keyBtnGroup.removeClass("am-active");
            //删除字符
            function valDelete() {
                inputVal = inputVal.substring(0, inputVal.length - 1);
                methods._setValue(inputVal);
                methods._checkBtnState();
            }
        },
        //功能按键up事件
        _keyFnUp: function() {
            $.scrollY[0] ? $.scrollY[0].enable() : false;
            //判断触摸移动
            if ($.touchMoved) {
                return false;
            }
            //切换至字母键盘
            if ($(this).hasClass("btnFnLetter")) {
                $keyboardL.addClass("am-on").siblings().removeClass("am-on");
                methods._setKeyPos(1);
            } else
            //切换至符号键盘
            if ($(this).hasClass("btnFnSymbol")) {
                $keyboardS.addClass("am-on").siblings().removeClass("am-on");
                methods._setKeyPos(2);
            } else
            //完成按键
            if ($(this).hasClass("btnFnDone") && $(this).hasClass("am-on")) {
                if (inputVal.length >= opt.min) {
                    methods._KBSwitch(0);
                    opt.onDone(inputVal);
                } else {
                    opt.onOffsetMin(opt.min);
                }
            } else
            //取消按键
            if ($(this).hasClass("btnFnCancel")) {
                methods._KBSwitch(0);
                opt.onCancel(inputVal);
            } else
            //空格按键
            if ($(this).hasClass("btnFnSpace")) {
                methods._checkFilterKey();
                opt.onChanged(inputVal, inputValLast);
            } else
            //Shift按键
            if ($(this).hasClass("btnFnShift")) {
                if ($keyboardL.hasClass("up")) {
                    $keyboardL.removeClass("up");
                } else {
                    $keyboardL.addClass("up");
                }
            } else
            //删除按键
            if ($(this).hasClass("btnFnDelete")) {
                clearInterval(deleteInterval);
                clearTimeout(deleteTimeout);
                opt.onChanged(inputVal, "delete");
            }
            methods._checkBtnState();
        },
        //功能按键move事件
        _keyFnMove: function() {
            //check deleting touchmove
            if ($.touchMoved && $(this).hasClass("btnFnDelete")) {
                clearInterval(deleteInterval);
                clearTimeout(deleteTimeout);
            }
        },
        //按键随机排版处理
        _keyRandom: function(type) {
            //字母与符号键盘二次随机，其它键盘一次随机
            var randomType = type === 2 ? 2 : 1;
            for (var i = 1; i < randomType + 1; i++) {
                //定义普通按键选择器
                $keyBtnGroup = $keyboard.eq(type).children(".am-g").eq(i).children(".am-btn").not(fnbtnSelector);
                $keyboardCtrl.empty();
                $keyBtnGroup.clone().prependTo($keyboardCtrl);
                methods._getKeyIndex();
                methods._setKeyIndex();
                //重新绑定普通按键各类事件
                $keyBtn = $keyboard.eq(type).children(".am-g").eq(i).children(".am-btn").not(fnbtnSelector);
                $keyBtn
                    .off($.touchend + ".keyboard")
                    .off($.touchstart + ".keyboard")
                    .off($.touchmove + ".keyboard")
                    .off($.touchmove + ".btnTouch")
                    .on($.touchstart + ".keyboard", methods._keyDown)
                    .on($.touchend + ".keyboard", methods._keyUp)
                    .on($.touchmove + ".keyboard", methods._keyMove);
            }
        },
        //获取按键位置
        _getKeyIndex: function() {
            arrayAfter = [];
            for (var i = 0; i < $keyBtnGroup.length; i++) {
                arrayAfter.push(i);
            }
        },
        //设置按键位置
        _setKeyIndex: function() {
            arrayBefore = arrayAfter.concat().sort(methods._getRandom);
            $keyboardCtrlBtn = $keyboardCtrl.children(".am-btn");
            for (var i = 0; i < $keyBtnGroup.length; i++) {
                $keyBtnGroup.eq(i).replaceWith($keyboardCtrlBtn.eq(arrayBefore[i]));
            }
        },
        //排列数组算法
        _getRandom: function() {
            return Math.random() > .5 ? -1 : 1;
        },
        //设置普通按键定位范围
        _setKeyPos: function(type) {
            //定义普通按键选择器
            $keyBtnGroup = $keyboard.eq(type).find(".am-btn").not(fnbtnSelector);
            $keyBtnGroup.each(function() {
                var l = Math.round($(this).offset().left);
                var t = Math.round($(this).offset().top);
                var r = Math.round(l + $(this).width());
                var b = Math.round(t + $(this).height());
                $(this).data("top", t).data("right", r).data("bottom", b).data("left", l);
            });
        },
        //设置input val值
        _setValue: function(val) {
            $keyboardP.hasClass("am-on") ? $input.text(methods._toAmount(val)) : $input.text(val); //对金额键盘做千分位处理
            methods._checkPlaceholder();
        },
        //设置键盘每个区域的高度
        _setKBHeight: function() {
            var hTotal = 0;
            if ($.html.hasClass("am-pc")) {
                hTotal = 200;
            } else if ($.html.hasClass("am-pad")) {
                hTotal = 300;
            } else {
                hTotal = Math.round($.winW / 1.46); //1.46为ios键盘的宽高比例
            }
            var hTitle = Math.round(hTotal * 0.15);
            var hBase = Math.round((hTotal - hTitle) / 4);
            //此处高度直接用css设置会造成各浏览器的四舍五入不统一，引起高度不精确问题，产生多余缝隙
            $(".am-keyboard-con>.am-keyboard>div:nth-child(1)").height(hTitle);
            $(".am-keyboard-con>.am-keyboard.letter>div:nth-child(2)").height(hBase * 4);
            $(".am-keyboard-con>.am-keyboard.number>div:nth-child(2)").height(hBase * 4);
            $(".am-keyboard-con>.am-keyboard.price>div:nth-child(2)").height(hBase * 4);
            $(".am-keyboard-con>.am-keyboard.symbol>div:nth-child(2)").height(hBase * 1);
            $(".am-keyboard-con>.am-keyboard.symbol>div:nth-child(3)").height(hBase * 3);
            $(".am-keyboard-con").height(hTitle + hBase * 4 + 2);
        },
        //键盘弹出&收起
        _KBSwitch: function(state) { //state:1开启，0关闭
            if (state === 1) {
                $inputAll.removeClass("am-on");
                $input.add($keyboardCon).addClass("am-on");
                $(document).on($.touchend + ".keyboard", methods.KBClose);
                if ($.html.hasClass("am-mob") && opt.allowScroll) {
                    methods._autoScroll();
                }
            } else if (opt.allowClose) {
                $input.add($keyboardCon).removeClass("am-on am-show");
                $btnPwd.hide();
                $btnClear.hide();
                $(document).off($.touchend + ".keyboard");
                if ($.html.hasClass("am-mob")) {
                    $.amBody.find(".scrollInner").css({ bottom: 0, "min-height": "100%!important" });
                    $.scrollY[$.xIndex].refresh();
                }
            }
        },
        //获取焦点时滚动避开键盘高度
        _autoScroll: function() {
            $.amBody.find(".scrollInner").css({ bottom: $keyboardCon.outerHeight(), "min-height": "none!important" });
            $.scrollY[$.xIndex].refresh();
            var t = $input.offset().top - $.scrollY[$.xIndex].y;
            if (t > $.winH / 2) {
                t = (t - $.winH / 3) * -1;
                var timeout = setTimeout(function() {
                    $.scrollY[$.xIndex].scrollTo(0, t, $.globalSpeed);
                });
            }
        },
        //键盘开启后页面空白处点击关闭
        KBClose: function(e) {
            if (
                e && (
                    e.target.parentNode.tagName === "HTML" ||
                    e.target.parentNode.tagName === "BODY")
            ) {
                //pc端am-body高度不足情况下，点击到页面空白区域
                methods._KBSwitch(0);
                opt.onCancel(inputVal);
                return;
            } else if (
                (e &&
                    ($("#KBCon").hasClass("am-on")) &&
                    (e.target.className.indexOf("am-keyboard-input") === -1) &&
                    (e.target.className.indexOf("am-kbinput") === -1) &&
                    (e.target.className.indexOf("am-input-pwd") === -1) &&
                    (e.target.className.indexOf("am-input-clear") === -1) &&
                    (e.target.parentNode.className.indexOf("am-keyboard") === -1) &&
                    (e.target.parentNode.parentNode.className.indexOf("am-keyboard") === -1) &&
                    (e.target.parentNode.parentNode.parentNode.className.indexOf("am-keyboard") === -1)) ||
                (!e && $("#KBCon").hasClass("am-on"))
            ) {
                methods._KBSwitch(0);
                opt.onCancel(inputVal);
            }
        },
        //清除功能
        KBClear: function($input) {
            $input = $input || $(this);
            inputVal = "";
            methods._setValue(inputVal);
            $input.data("value", inputVal);
            methods._checkBtnDone();
            methods._checkPlaceholder();
        },
        //预加载
        KBReady: function() {
            var dom = "<div class='am-keyboard-con' id='KBCon'><div class='am-keyboard number'><div class='am-g'><h6><span class='am-icon-security2'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn btn-n1 canmove nozoom' data-ascii='49'><span>1</span></a><a class='am-btn btn-n2 canmove nozoom' data-ascii='50'><span>2</span></a><a class='am-btn btn-n3 canmove nozoom' data-ascii='51'><span>3</span></a><a class='am-btn btn-n4 canmove nozoom' data-ascii='52'><span>4</span></a><a class='am-btn btn-n5 canmove nozoom' data-ascii='53'><span>5</span></a><a class='am-btn btn-n6 canmove nozoom' data-ascii='54'><span>6</span></a><a class='am-btn btn-n7 canmove nozoom' data-ascii='55'><span>7</span></a><a class='am-btn btn-n8 canmove nozoom' data-ascii='56'><span>8</span></a><a class='am-btn btn-n9 canmove nozoom' data-ascii='57'><span>9</span></a><a class='am-btn btnFnNull canmove nozoom'></a><a class='am-btn btn-n0 canmove nozoom' data-ascii='48'><span>0</span></a><a class='am-btn nozoom am-btnLight btnFnDelete'><span></span></a></div></div><div class='am-keyboard letter'><div class='am-g'><h6><span class='am-icon-security2 am-icon-36'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn canmove' data-ascii='113'><span>q</span></a><a class='am-btn canmove' data-ascii='119'><span>w</span></a><a class='am-btn canmove' data-ascii='101'><span>e</span></a><a class='am-btn canmove' data-ascii='114'><span>r</span></a><a class='am-btn canmove' data-ascii='116'><span>t</span></a><a class='am-btn canmove' data-ascii='121'><span>y</span></a><a class='am-btn canmove' data-ascii='117'><span>u</span></a><a class='am-btn canmove' data-ascii='105'><span>i</span></a><a class='am-btn canmove' data-ascii='111'><span>o</span></a><a class='am-btn canmove' data-ascii='112'><span>p</span></a><a class='am-btn canmove' data-ascii='97'><span>a</span></a><a class='am-btn canmove' data-ascii='115'><span>s</span></a><a class='am-btn canmove' data-ascii='100'><span>d</span></a><a class='am-btn canmove' data-ascii='102'><span>f</span></a><a class='am-btn canmove' data-ascii='103'><span>g</span></a><a class='am-btn canmove' data-ascii='104'><span>h</span></a><a class='am-btn canmove' data-ascii='106'><span>j</span></a><a class='am-btn canmove' data-ascii='107'><span>k</span></a><a class='am-btn canmove' data-ascii='108'><span>l</span></a><a class='am-btn am-btnLight btnFnShift nozoom'><span></span></a><a class='am-btn canmove' data-ascii='122'><span>z</span></a><a class='am-btn canmove' data-ascii='120'><span>x</span></a><a class='am-btn canmove' data-ascii='99'><span>c</span></a><a class='am-btn canmove' data-ascii='118'><span>v</span></a><a class='am-btn canmove' data-ascii='98'><span>b</span></a><a class='am-btn canmove' data-ascii='110'><span>n</span></a><a class='am-btn canmove' data-ascii='109'><span>m</span></a><a class='am-btn am-btnLight btnFnDelete nozoom'><span></span></a><a class='am-btn am-btnLight btnFnSymbol nozoom'><span>123.*!&</span></a><a class='am-btn nozoom btnFnSpace' data-ascii='32'><span>空格</span></a><a class='am-btn am-btnLight btnFnDone nozoom'><span>完成</span></a></div></div><div class='am-keyboard symbol'><div class='am-g'><h6><span class='am-icon-security2 am-icon-36'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn canmove' data-ascii='49'><span>1</span></a><a class='am-btn canmove' data-ascii='50'><span>2</span></a><a class='am-btn canmove' data-ascii='51'><span>3</span></a><a class='am-btn canmove' data-ascii='52'><span>4</span></a><a class='am-btn canmove' data-ascii='53'><span>5</span></a><a class='am-btn canmove' data-ascii='54'><span>6</span></a><a class='am-btn canmove' data-ascii='55'><span>7</span></a><a class='am-btn canmove' data-ascii='56'><span>8</span></a><a class='am-btn canmove' data-ascii='57'><span>9</span></a><a class='am-btn canmove' data-ascii='48'><span>0</span></a></div><div class='am-g'><a class='am-btn canmove' data-ascii='96'><span>`</span></a><a class='am-btn canmove' data-ascii='33'><span>!</span></a><a class='am-btn canmove' data-ascii='64'><span>@</span></a><a class='am-btn canmove' data-ascii='35'><span>#</span></a><a class='am-btn canmove' data-ascii='36'><span>$</span></a><a class='am-btn canmove' data-ascii='37'><span>%</span></a><a class='am-btn canmove' data-ascii='94'><span>^</span></a><a class='am-btn canmove' data-ascii='38'><span>&</span></a><a class='am-btn canmove' data-ascii='42'><span>*</span></a><a class='am-btn canmove' data-ascii='43'><span>+</span></a><a class='am-btn canmove' data-ascii='45'><span>-</span></a><a class='am-btn canmove' data-ascii='92'><span>&#92;</span></a><a class='am-btn canmove' data-ascii='47'><span>/</span></a><a class='am-btn canmove' data-ascii='91'><span>[</span></a><a class='am-btn canmove' data-ascii='93'><span>]</span></a><a class='am-btn canmove' data-ascii='123'><span>{</span></a><a class='am-btn canmove' data-ascii='125'><span>}</span></a><a class='am-btn am-btnLight btnFnDelete nozoom'><span></span></a><a class='am-btn am-btnLight btnFnLetter nozoom'><span>ABC</span></a><a class='am-btn canmove' data-ascii='44'><span>,</span></a><a class='am-btn canmove' data-ascii='46'><span>.</span></a><a class='am-btn canmove' data-ascii='8364'><span>€</span></a><a class='am-btn canmove' data-ascii='163'><span>£</span></a><a class='am-btn canmove' data-ascii='165'><span>¥</span></a><a class='am-btn am-btnLight btnFnDone nozoom'><span>完成</span></a></div></div><div class='am-keyboard price'><div class='am-g'><h6><span class='am-icon-security2'></span>鲸钱包安全键盘</h6><a class='am-btn btnFnCancel nozoom'><span>收起</span></a></div><div class='am-g'><a class='am-btn btn-n1 canmove nozoom' data-ascii='49'><span>1</span></a><a class='am-btn btn-n2 canmove nozoom' data-ascii='50'><span>2</span></a><a class='am-btn btn-n3 canmove nozoom' data-ascii='51'><span>3</span></a><a class='am-btn btn-n4 canmove nozoom' data-ascii='52'><span>4</span></a><a class='am-btn btn-n5 canmove nozoom' data-ascii='53'><span>5</span></a><a class='am-btn btn-n6 canmove nozoom' data-ascii='54'><span>6</span></a><a class='am-btn btn-n7 canmove nozoom' data-ascii='55'><span>7</span></a><a class='am-btn btn-n8 canmove nozoom' data-ascii='56'><span>8</span></a><a class='am-btn btn-n9 canmove nozoom' data-ascii='57'><span>9</span></a><a class='am-btn btn-dot canmove nozoom' data-ascii='46'><span>.</span></a><a class='am-btn btn-n0 canmove nozoom' data-ascii='48'><span>0</span></a><a class='am-btn nozoom am-btnLight btnFnDelete'><span></span></a></div></div><div class='ctrl'></div><div class='imgload'></div></div>";
            var preloadImg = "<img class='active' src='/images/unify/mob/keyboard-active.png'><img class='active' src='/images/unify/mob/keyboard-shift-black.png'><img class='active' src='/images/unify/mob/keyboard-delete-black.png'>";
            var pcinput = "<input type='password' class='am-input am-kbinput'>";
            //判断键盘是否已存在
            if (!$(".am-keyboard-con").length) {
                //加载键盘html代码
                $.body.append(dom);
                //初始化预加载素材图片
                $(".am-keyboard-con>.imgload").append(preloadImg);
                //初始化键盘高度
                methods._setKBHeight();
            }
        },
        KBDestroy: function() {
            methods.KBClose();
            setTimeout(function() {
                $("#KBCon").remove();
            }, $.globalSpeed);
        },
        //取值
        getValue: function() {
            return $(this).data("value") === "" ? undefined : $(this).data("value");
        },
        //设值
        setValue: function(val) {
            $input = $(this);
            $input.data("value", val);
            $input.text(methods._toAmount(val));
            $input.next("sub").addClass("am-off");
        }
    };
}(jQuery);
