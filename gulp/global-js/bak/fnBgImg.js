//fnBgImg
$.fn.fnBgImg = function() {
    if (!$(this).length) return;
    return this.each(function() {
        var $this = $(this);
        var $img = $this.find("img").eq(0);
        var src = $img.attr("src");
        init();

        //处理img标题图片为css背景图
        function init() {
            $this.css({
                "background-image": "url(" + src + ")"
            });
            $img.remove();
        }
    });
};
