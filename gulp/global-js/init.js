var global = {
    init: function() {
        $.html = $("html");
        $.body = $("body");
        $.amBody = $("div.am-body").eq(0);
        if ($.html.hasClass("am-mob")) {
            $.amHeader = $("header.am-app").eq(0) || "";
            $.amFooter = $.body.children(".am-pos-fixb").eq(0) || "";
        }
        if ($.html.hasClass("am-app")) {
            this.app();
        } else
        if ($.html.hasClass("am-wx") || $.html.hasClass("am-bro")) {
            this.wx();
        } else
        if ($.html.hasClass("am-pc")) {
            $.amHeader = $("header.am-pc").eq(0) || "";
            $.amFooter = $("footer.am-pc").eq(0) || "";
            this.pc();
        }
    },
    wx: function() {
        document.addEventListener('touchmove', $.preventDefault, { passive: false });
        $.setevent.init();
        $.setmove.init();
        $.fnCheckDevice();
        $.fnBodyInner();
        $.fnBodyHeight();
        $.fnScrollX();
        $.fnScrollY();
        $.fnBtnTouch();
        $.fnInputBlur();
        $.fnWxFont();
        $(".am-keyboard-input").length ? $.fn.fnKeyBoard("KBReady") : false;
        $("a.am-btnSwitch").fnBtnSwitch();
        $("label[data-type]").fnChecked();
        $("input.am-input").fnInput();
        $(".am-banner.royalSlider").fnBanner();
        $("span.am-input-select").fnInputSelect();
        $(".am-keyboard-input[placeholder]").fnPlaceHolder();
        $('body').imagesLoaded().always(function() {
            $.fnPageLoad({ state: 0 });
        });
    },
    app: function() {
        document.addEventListener('touchmove', $.preventDefault, { passive: false });
        $.setevent.init();
        $.setmove.init();
        $.fnCheckDevice();
        $.fnBodyInner();
        $.fnBodyHeight();
        $.fnScrollX();
        $.fnScrollY();
        $.fnBtnTouch();
        $.fnInputBlur();
        $(".am-keyboard-input").length ? $.fn.fnKeyBoard("KBReady") : false;
        $.amHeader.children("span.title").fnAutoTitle();
        $.amHeader.children("span.title").fnTitleToTop();
        $("a.am-btnSwitch").fnBtnSwitch();
        $("label[data-type]").fnChecked();
        $("input.am-input").fnInput();
        $(".am-banner.royalSlider").fnBanner();
        $("span.am-input-select").fnInputSelect();
        $(".am-keyboard-input[placeholder]").fnPlaceHolder();
    },
    pc: function() {
        $.setevent.init();
        $.setmove.init();
        $.fnCheckDevice();
        $.fnBtnTouch();
        $.fnPcFooterBtn();
        $(".am-keyboard-input").length ? $.fn.fnKeyBoard("KBReady") : false;
        $("label[data-type]").fnChecked();
        $("input.am-input").fnInput();
        $("html.ie9 input[placeholder],.am-keyboard-input[placeholder]").fnPlaceHolder();
        $("a.am-btnSwitch").fnBtnSwitch();
        $(".am-banner.royalSlider").fnBanner();
        $("span.am-input-select").fnInputSelect();
    }
};

global.init();
