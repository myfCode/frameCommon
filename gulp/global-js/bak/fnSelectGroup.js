//fnSelectGroup
$.fn.fnSelectGroup = function(options) {
    var defaults = {
        id: "select-group-" + Math.floor(Math.random() * 10000000000 + 1),
        mask: true, //弹出后显示遮罩
        data: [{ //数据格式
            "width": "", //宽度百分比
            "loop": false, //是否循环滚动（暂不可用）
            "data": [] //数据,{"sid":0,"name":"0"},{"sid":0,"name":"0"}
        }],
        linkage: false, //是否联动
        current: false, //初始值
        onComfirm: function() {}, //callback comfirm
        onCancel: function() {} //callback cancel
    };
    var opt = $.extend({}, defaults, options);
    var current = getCurrent() || getArray(); //定义初始值
    var saveCur = current.slice(0); //保存默认起始值
    var saveJson = []; //保存回传的数组
    var itemH = 48; //定义单位高度
    var touch;
    var touchLock = true;
    var y = 0;
    var _y = 0;
    var $btn; //头部按钮
    var $obj; //所有操控栏
    var $this; //当前操控栏
    var $list; //当前操作栏对应的滚动栏
    var index; //当前滚动栏index
    var scrollTop = getArray(); //滚动栏top
    var tempTop = 0; //临时top
    var vHeight;

    //touchmove checking
    if ($.touchMoved) {
        return false;
    }

    //repeat checking
    if (!$("#" + opt.id).length) {
        var innerHtml = "<div class='am-select-group";
        if (opt.mask) {
            innerHtml += " am-mask";
        }
        innerHtml += "' id='" + opt.id + "'><div class='outer'><div class='groupHeader'><a class='am-float-left am-cancel am-btn-active'>取消</a><a class='am-float-right am-submit am-btn-active'>完成</a></div><div class='groupBody'><div class='inner'>";
        for (var i1 = 0; i1 < opt.data.length; i1++) {
            innerHtml += "<ul class='am-g" + opt.data[i1].width + "'>";
            for (var i2 = 0; i2 < opt.data[i1].list.length; i2++) {
                innerHtml += "<li data-sid='" + opt.data[i1].list[i2].sid + "'";
                //if has pid
                if (opt.data[i1].list[i2].pid !== undefined) {
                    innerHtml += " data-pid='" + opt.data[i1].list[i2].pid + "'";
                }
                innerHtml += ">" + opt.data[i1].list[i2].name + "</li>";
            }
            innerHtml += "</ul>";
        }
        innerHtml += "</div></div><div class='current'>";
        for (var i3 = 0; i3 < opt.data.length; i3++) {
            innerHtml += "<div class='am-g" + opt.data[i3].width + "'></div>";
        }
        innerHtml += "</div></div></div>";
        $.htmlBody.append(innerHtml);

        //set scroll & btn
        $btn = $("#" + opt.id).find(".groupHeader>a");
        $obj = $("#" + opt.id).find(".current>div");
        $list = $("#" + opt.id).find(".groupBody ul");

        //bind event
        $btn.on($.touchend, fnGroupHide);
        $obj.on($.touchstart, selectTouchStart)
            .on($.touchmove, selectTouchMove)
            .on($.touchend, selectTouchEnd);

        //set linkage
        if (opt.linkage) {
            index = 0;
            setZoom(0, 0);
            setLinkage(0, 0);
        }

        //set current
        if (opt.current) {
            setCurrent(0, 0);
        }

        //set noLinkage & noCurrent
        if (!opt.linkage && !opt.current) {
            for (var i = 0; i < opt.data.length; i++) {
                setZoom(i, 0);
            }
        }
    }
    fnGroupShow();

    //group show
    function fnGroupShow() {
        $(".am-select-group").hide();
        $("#" + opt.id).addClass("am-on").stop(true, true).fadeIn(200);
        $.amBody.find(".am-input").blur();
        //set body pointer
        if (opt.mask) {
            $.fn.fnBodyPointer();
        }
    }

    //group hide
    function fnGroupHide() {
        //touchmoved checking
        if ($.touchMoved) {
            return false;
        }

        //confrim callback
        if ($(this).hasClass("am-submit")) {
            //return new select array
            saveJson = [];
            for (var i = 0; i < current.length; i++) {
                if (opt.data[i].list[current[i]]) {
                    saveJson[i] = opt.data[i].list[current[i]];
                }
            }
            opt.onComfirm(saveJson);
        } else
        //cancel callback
        if ($(this).hasClass("am-cancel")) {
            opt.onCancel();
        }
        //close------------------
        $("#" + opt.id).removeClass("am-on").stop(true, true).fadeOut(200);
        //body pointer reset
        setTimeout(function() {
            $.fn.fnBodyPointer();
        }, 400);
        //防止点击穿透弹层背部有link
        return false;
    }

    //touch event
    function selectTouchStart(e) {
        $.settouch.init(e);
        touchLock = true; //点击时加锁
        _y = $.touchY;
        $this = $(this);
        vHeight = $this.height();
        index = $this.index();
        $list.eq(index).css({
            "-webkit-transition-duration": 0 + "s"
        });
    }

    function selectTouchMove(e) {
        $.settouch.init(e);
        touchLock = false; //位移后开锁
        y = $.touchY - _y;
        tempTop = scrollTop[index] + y;
        if (tempTop > 0) {
            tempTop = 0;
        } else if (tempTop < vHeight - $list.eq(index).outerHeight()) {
            tempTop = vHeight - $list.eq(index).outerHeight();
        }
        //set current
        current[index] = $list.eq(index).find("li:visible").eq(Math.ceil((tempTop - (itemH / 2)) / itemH) * -1).index();
        setZoom(index, current[index]);
        //list move
        $list.eq(index).css({
            "-webkit-transform": "translate3d(0," + tempTop + "px,0)"
        });
    }

    function selectTouchEnd() {
        if (touchLock) {
            return false;
        } //禁止无位移点击
        $.body.off($.touchmove + ".preventDefault");
        scrollTop[index] = Math.ceil((tempTop - (itemH / 2)) / itemH) * itemH * 1;
        $list.eq(index).css({
            "-webkit-transition-duration": 0.2 + "s"
        }).css({
            "-webkit-transform": "translate3d(0," + scrollTop[index] + "px,0)"
        });
        //设置联动
        if (opt.linkage) {
            setLinkage(index, current[index]);
        }
        if (!opt.mask) {
            //return new select array
            saveJson = [];
            for (var i = 0; i < current.length; i++) {
                if (opt.data[i].list[current[i]]) {
                    saveJson[i] = opt.data[i].list[current[i]];
                }
            }
            opt.onComfirm(saveJson);
        }
    }

    //set linkage
    function setLinkage(idx, cur) {
        if (idx < opt.data.length - 1) {
            index++;
            scrollTop[index] = 0;
            var tempCurrentSid = $list.eq(index - 1).find("li").eq(cur).attr("data-sid");
            $list.eq(index).css({
                "-webkit-transform": "translate3d(0,0,0)"
            });
            $list.eq(index).find("li").hide().filter("[data-pid='" + tempCurrentSid + "']").show();
            current[index] = $list.eq(index).find("li[data-pid='" + tempCurrentSid + "']").eq(0).index();
            setZoom(index, current[index]);
            setLinkage(index, current[index]);

        }
    }

    //set current
    function setCurrent() {
        for (i = 0; i < current.length; i++) {
            index = i;
            var tempCur = saveCur[index];
            if (index !== 0 && opt.linkage) {
                var tempCurrentPid = $list.eq(index).find("li").eq(saveCur[index]).attr("data-pid");
                $list.eq(index).find("li").hide().filter("[data-pid='" + tempCurrentPid + "']").show();
                tempCur = $list.eq(index).find("li[data-pid='" + tempCurrentPid + "']").index($list.eq(index).find("li").eq(saveCur[index]));
                current[index] = saveCur[index];
            }
            scrollTop[index] = tempCur * itemH * -1;
            $list.eq(index).css({
                "-webkit-transform": "translate3d(0," + scrollTop[index] + "px,0)"
            });
            setZoom(index, saveCur[index]);
        }
    }

    //set perspective animate
    function setZoom(idx, cur) {
        //haven't sub level
        if (cur < 0) {
            return false;
        }
        var $li = $list.eq(idx).find("li");
        //set zoom class
        $li.removeAttr("class");
        $li.eq(cur).addClass("c4");
        $li.eq(cur + 1).addClass("c5");
        $li.eq(cur + 2).addClass("c6");
        $li.eq(cur + 3).addClass("c7");
        $li.eq(cur - 1).addClass("c3");
        $li.eq(cur - 2).addClass("c2");
        $li.eq(cur - 3).addClass("c1");
    }

    //get current
    function getCurrent() {
        if (opt.current) {
            var tempCur = new Array(opt.data.length);
            for (var i1 = 0; i1 < opt.data.length; i1++) {
                for (var i2 = 0; i2 < opt.data[i1].list.length; i2++) {
                    if (opt.current[i1] === opt.data[i1].list[i2].sid) {
                        tempCur[i1] = i2;
                        break;
                    }
                }
            }
            return tempCur;
        } else {
            return false;
        }
    }

    //get array
    function getArray() {
        var tempCur = new Array(opt.data.length);
        for (i = 0; i < opt.data.length; i++) {
            tempCur[i] = 0;
        }
        return tempCur;
    }
};
