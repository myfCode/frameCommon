! function($) {
    "use strict";
    //has this
    //has opt
    //has each

    $.fn.fnBanner = function(method) {
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
        speed: 3,
        onReady: function() {},
        onSlide: function(index) {},
    };
    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            return this.each(function() {
                var $this = $(this);
                var $slider = $this.royalSlider({
                    autoHeight: false,
                    arrowsNav: false,
                    fadeinLoadedSlide: false,
                    controlNavigationSpacing: 0,
                    controlNavigation: 'bullets',
                    imageScaleMode: 'fill',
                    imageAlignCenter: true,
                    loop: false,
                    loopRewind: true,
                    numImagesToPreload: 6,
                    slidesSpacing: 0,
                    autoScaleSlider: true,
                    autoScaleSliderWidth: "100%",
                    autoScaleSliderHeight: "100%",
                    autoPlay: {
                        enabled: true,
                        pauseOnHover: true,
                        stopAtAction: false,
                        delay: opt.speed * 1000
                    }
                }).data('royalSlider');
                $slider.ev.on("rsAfterContentSet", function() {
                    opt.onReady();
                });
                $slider.ev.on("rsAfterSlideChange", function() {
                    opt.onSlide($slider.currSlideId);
                });
            });
        }
    };

}(jQuery);
