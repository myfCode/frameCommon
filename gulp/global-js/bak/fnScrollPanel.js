//fnScrollPanel
$.fn.fnScrollPanel = function(options) {
    if (!$(this).length) return;
    var defaults = {
        autoPlay: false, //自动播放
        speed: 3000, //自动播放间隔
        onChanged: function( /*index*/ ) {} //each call back
    };
    var opt = $.extend({}, defaults, options);

    return this.each(function() {
        var $this = $(this);
        var $thisInner;
        var $con = $this.find(".am-con");
        var $btnCon = $(".am-panel-btn[data-scroll='" + $this.attr("data-scroll") + "']");
        var $btn;
        var length = $con.length;
        var sIndex = 0;
        var touchLock = 1;
        var sLength = $.scrollX.length;
        init();

        function init() {

            //检测重复执行
            if ($this.hasClass($this.data("scroll"))) {
                //set new sLength
                sLength = $this.data("scroll").replace(/[^0-9]+/g, '');
                $.scrollX[sLength].destroy();
                $.scrollX[sLength] = null;
            }

            //设置scrollPanelInner和btn
            if (!$this.children(".scrollInner").length) {
                $this.addClass("scrollX" + $.scrollX.length).wrapInner("<div class='scrollInner' />");
                var btnHtml = "";
                for (var i = 0; i < length; i++) {
                    btnHtml += "<a></a>";
                }
                $btnCon.append(btnHtml);
            }
            $thisInner = $this.children(".scrollInner");
            $btn = $btnCon.children("a");

            //设置inner宽度和平分样式am-g-x
            $thisInner
                .attr({
                    "class": "scrollInner am-g-" + length
                })
                .css({
                    "width": length + "00%"
                });

            //定义滚动控件
            $.scrollX[sLength] = new IScroll(".scrollX" + sLength, {
                probeType: 3,
                scrollX: true,
                scrollY: false,
                momentum: false,
                snap: true,
                snapThreshold: 0.2
            });

            //初始设置
            $btn.eq(0).addClass("am-on").siblings().removeClass("am-on");
            $con.find("img").show();

            //绑定事件
            $.scrollX[sLength].on("beforeScrollStart", scrollStart);
            $.scrollX[sLength].on("scrollEnd", scrollEnd);
            $btn.off($.touchend + ".scrollX").on($.touchend + ".scrollX", function() {
                panelPlay($(this).index());
            });

            checkAutoPlay();
        }

        //滚动方法
        function panelPlay(i) {
            sIndex = i;
            $.scrollX[sLength].goToPage(sIndex, 0, 300);
            //每次滚动后重设置自动滚动间隔时间
            clearTimeout($.fnScrollPanelTimeOut);
            $.fnScrollPanelTimeOut = setTimeout(autoPlay, opt.speed);
        }

        //每次滚动开始事件
        function scrollStart() {
            //set lock when touch
            touchLock = 0;
            clearTimeout($.fnScrollPanelTimeOut);
        }

        //每次滚动完成事件
        function scrollEnd() {
            sIndex = $.scrollX[sLength].currentPage.pageX;
            //set btn current
            $btn.eq(sIndex).addClass("am-on").siblings().removeClass("am-on");
            //check lock
            if (!touchLock) {
                checkAutoPlay();
            }
        }

        //执行自动滚动
        function autoPlay() {
            if (sIndex === length - 1) {
                sIndex = 0;
            } else {
                sIndex++;
            }
            $.scrollX[sLength].goToPage(sIndex, 0, 300);
            clearTimeout($.fnScrollPanelTimeOut);
            $.fnScrollPanelTimeOut = setTimeout(autoPlay, opt.speed);
        }

        //检测自动滚动
        function checkAutoPlay() {
            touchLock = 1;
            if (opt.autoPlay) {
                //first play delay
                $.fnScrollPanelTimeOut = setTimeout(autoPlay, opt.speed);
            } else {
                clearTimeout($.fnScrollPanelTimeOut);
            }
        }
    });
};
