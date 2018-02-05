//fnDropDown
$.fn.fnDropDown = function(options) {
    if (!$(this).length) return;
    var defaults = {
        only: true, //only one line at one time
        onDropdown: function( /*id,index,state*/ ) {}
            //id当前点击位置所在组的id
            //index当前点击位置所在本列表的index
            //state当前点击位置的状态，1为打开，0为关闭
    };
    var opt = $.extend({}, defaults, options);
    return this.each(function() {
        var $this = $(this);
        var $close = $this.parent().find("a.am-close");
        var $con = $this.next("div.am-dropdown-con");
        var $thisparent = $this.parent("div.am-row");
        var index = $thisparent.index();
        var id = $thisparent.parent("div.am-dropdown").attr("id");
        var state;
        init();

        function init() {
            if ($this.parent("div.am-on").length) {
                index = $this.parent().index();
                state = 1;
                //callback
                setTimeout(fnDropEnd, $.globalSpeed);
            }
            //has dropdown checking
            if ($con.length) {
                //btn click
                $this.add($close).off($.touchend + ".dropdown").on($.touchend + ".dropdown", function() {
                    btnClick();
                });
            }
        }

        //下拉点击事件
        function btnClick() {
            if ($.touchMoved) return;
            if (!$thisparent.hasClass("am-on")) {
                //opt.only checking
                if (opt.only) {
                    $thisparent.siblings().removeClass("am-on");
                }
                $thisparent.addClass("am-on");
                state = 1;
            } else {
                $thisparent.removeClass("am-on");
                state = 0;
            }
            //callback
            setTimeout(fnDropEnd, $.globalSpeed);
        }

        function fnDropEnd() {
            //刷新当前pageY滚动条
            $.scrollY[$.xIndex].refresh();
            opt.onDropdown(id, index, state);
        }
    });
};
