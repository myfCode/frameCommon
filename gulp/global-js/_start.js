! function() {
    if (typeof define === "function" && define.amd) {
        define("global", ['jquery', 'IScroll', 'imagesloaded', 'royalslider'], function($, IScroll) {
            init($, IScroll);
        });
    } else {
        init($, IScroll);
    }

    function init($, IScroll) {
