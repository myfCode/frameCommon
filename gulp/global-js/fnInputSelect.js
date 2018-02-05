! function($) {
    "use strict";
    //has this
    //hasn't opt
    //has each

    $.fn.fnInputSelect = function(method) {
        if (method && methods[method] && method.substring(0, 1) !== "_") {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on this plug');
        }
    };

    var methods = {
        init: function() {
            return this.each(function() {
                var $this = $(this);
                var $select = $this.find("select");

                methods._checkFirst($this, $select);
                methods._checkSelected($this, $select);

                //绑定事件
                $select.off("change").one("change", function() {
                    methods._change($this);
                });
            });
        },
        //检查第一项“请选择” & disabled & selected
        _checkFirst: function($this, $select) {
            var $first = $select.children("option").eq(0);
            if ($first.text().indexOf("请选择")) {
                $select.prepend("<option>请选择</option>");
                $first = $select.children("option").eq(0);
            }
            if (!$select.find("option[disabled]").length) {
                $first.attr("disabled", "disabled");
            }
            if (!$select.find("option[selected]").length) {
                $first.attr("selected", "selected");
            }
        },
        //检查默认值
        _checkSelected: function($this, $select) {
            if ($select.find("option[selected]").index() > 0) {
                methods._change($this);
                $select.off("change");
            }
        },
        //设置各种data参数
        _change: function($this) {
            $this.addClass("am-on");
        }
    };

}(jQuery);
