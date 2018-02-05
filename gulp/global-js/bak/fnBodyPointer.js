//fnBodyPointer
$.fn.fnBodyPointer = function() {
    //处理页面底层功能，如点击穿透，整页模糊等
    if (!$.amBody.hasClass("am-on")) {
        $.amBody.addClass("am-on");
    } else {
        $.amBody.removeClass("am-on");
    }
};
