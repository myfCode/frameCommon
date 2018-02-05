! function($) {
    "use strict";
    //has this
    //hasn't opt
    //hasn't each

    $.fn.fnClipPic = function(method) {
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
        pic:null,//jquery selection
        dock:null,//jquery selection
        picWidth: 0.9,
        onConfrim: function(x, y, w, h) {},
        onCancel: function(){}
    };
    var $this = null; //裁切容器
    var $img = null; //被裁切图片
    var $dock = null; //底部按钮组
    var $btnConfrim = null; //完成按钮
    var $btnCancel = null; //取消按钮
    var iw, ih = null; //图片宽度
    var bw, bh = null; //容器宽高
    var bl, bt, br, bb = null; //容器左上右下
    var oh, ow, ol, ot, _ow, _oh; //图片高宽左上, 图片原始宽高
    var x0, _x0, y0, _y0; //_x0横向距离obj边缘||x0新的左边距
    var x1, _x1, y1, _y1; //同上
    var xc, yc, mxc, myc; //双指中心xy, 及xy位移
    var xx, yy, zz, _zz; //xyz三边长度, _zz斜边原始长度
    var touch0, touch1; //触摸点0, 1
    var scale = 1;
    var _scale = 1;
    var scaleX, scaleY, scaleO; //放大比例, 上次比例, 中心点横向比例, 中心点纵向比例

    var methods = {
        init: function(options) {
            opt = $.extend({}, def, options);
            $this = opt.pic;
            $dock = opt.dock; //底部按钮组
            $btnConfrim = $dock.find(".confrim");
            $btnCancel = $dock.find(".cancel");
            $img = $this.find("img"); //移动的图片
            //初始执行
            methods._setPic();
            methods._autoCenter();
            methods._setMask();
            //绑定事件
            $this
                .off($.touchstart + ".clippic")
                .off($.touchend + ".clippic")
                .on($.touchstart + ".clippic", function(e) {
                    methods._imgTouchStart(e);
                })
                .on($.touchend + ".clippic", function(e) {
                    methods._imgTouchEnd(e);
                });
            $btnConfrim
                .off($.touchend + ".clippic")
                .on($.touchend + ".clippic", methods._btnConfrim);
            $btnCancel
                .off($.touchend + ".clippic")
                .on($.touchend + ".clippic", methods._btnCancel);
            return $this;
        },
        //初始自适应居中
        _autoCenter: function() {
            //图片宽高比小于窗口宽高比
            if ($img.width() / $img.height() < bw / bh) {
                //计算宽高
                ow = _ow = bw; //宽度固定
                oh = "auto"; //高度自适应
                //设置宽高
                $img.css({
                    height: oh,
                    width: ow
                });
                //计算居中
                ot = (bh - $img.height()) / 2;
                ol = 0;
                //设置居中
                $img.css({
                    top: ot,
                    left: ol
                });
                //计算偏移值
                oh = _oh = $img.height();
                scaleO = iw / bw;
                x0 = ol;
                y0 = ot;
            }
            //大于
            else {
                //计算宽高
                oh = _oh = bh; //高度固定
                ow = "auto"; //宽度自适应
                //设置宽高
                $img.css({
                    height: oh,
                    width: ow
                });
                //计算居中
                ol = (bw - $img.width()) / 2;
                ot = 0;
                //设置居中
                $img.css({
                    top: ot,
                    left: ol
                });
                //计算偏移值
                ow = _ow = $img.width();
                scaleO = ih / bh;
                x0 = ol;
                y0 = ot;
            }
        },
        //目标区域开始点击事件
        _imgTouchStart: function(e) {
            //双指点击
            if (e.originalEvent.targetTouches[1]) {
                //第一手指
                touch0 = e.originalEvent.targetTouches[0];
                _x0 = Math.ceil(Number(touch0.pageX - $img.position().left));
                _y0 = Math.ceil(Number(touch0.pageY - $img.position().top));
                //第二手指
                touch1 = e.originalEvent.targetTouches[1];
                _x1 = Math.ceil(Number(touch1.pageX - $img.position().left));
                _y1 = Math.ceil(Number(touch1.pageY - $img.position().top));
                //计算双指中心点
                xc = Math.ceil(Math.abs(((touch1.pageX - bl) + (touch0.pageX - bl)) / 2));
                yc = Math.ceil(Math.abs(((touch1.pageY - bt) + (touch0.pageY - bt)) / 2));
                //计算枞横定位及缩放比
                mxc = xc - $img.position().left;
                myc = yc - $img.position().top;
                scaleX = mxc / ow;
                scaleY = myc / oh;
                //缩放初始值
                xx = ((touch1.pageX - bl) - (touch0.pageX - bl));
                yy = ((touch1.pageY - bt) - (touch0.pageY - bt));
                _zz = Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
            }
            //单指点击
            else
            if (e.originalEvent.targetTouches[0]) {
                touch0 = e.originalEvent.targetTouches[0];
                _x0 = Math.ceil(Number(touch0.pageX - $img.position().left));
                _y0 = Math.ceil(Number(touch0.pageY - $img.position().top));
            }
            //绑定移动
            $img.on($.touchmove + ".clippic", methods._imgTouchMove);
        },
        //目标区域内移动事件
        _imgTouchMove: function(e) {
            //双指移动
            if (e.originalEvent.targetTouches[1]) {
                touch0 = e.originalEvent.targetTouches[0];
                touch1 = e.originalEvent.targetTouches[1];
                x0 = Math.ceil(Number(touch0.pageX) - _x0);
                y0 = Math.ceil(Number(touch0.pageY) - _y0);
                x1 = Math.ceil(Number(touch1.pageX) - _x1);
                y1 = Math.ceil(Number(touch1.pageY) - _y1);
                xc = Math.ceil(((touch1.pageX - bl) + (touch0.pageX - bl)) / 2);
                yc = Math.ceil(((touch1.pageY - bt) + (touch0.pageY - bt)) / 2);
                //缩放变化值
                xx = ((touch1.pageX - bl) - (touch0.pageX - bl));
                yy = ((touch1.pageY - bt) - (touch0.pageY - bt));
                zz = Math.sqrt(Math.pow(xx, 2) + Math.pow(yy, 2));
                //缩放比, 最大放大4倍
                scale = zz / _zz * _scale;
                if (scale < 1) {
                    scale = 1;
                } else if (scale > 4) {
                    scale = 4;
                }
                //缩放后左上边距
                x0 = xc - Math.ceil(_ow * scale * scaleX);
                y0 = yc - Math.ceil(_oh * scale * scaleY);
            } else
            //单指移动
            if (e.originalEvent.targetTouches[0]) {
                touch0 = e.originalEvent.targetTouches[0];
                x0 = Math.ceil(Number(touch0.pageX) - _x0);
                y0 = Math.ceil(Number(touch0.pageY) - _y0);
            }
            //设置四边限位,带入缩放比
            if (x0 > 0) {
                x0 = 0;
            } else if (x0 < bw - _ow * scale) {
                x0 = bw - _ow * scale;
            }
            if (y0 > 0) {
                y0 = 0;
            } else if (y0 < bh - _oh * scale) {
                y0 = bh - _oh * scale;
            }
            //设置图片位置及尺寸
            $img.css({
                left: x0,
                top: y0,
                width: _ow * scale,
                height: _oh * scale
            });
        },
        //目标区别结束点击事件
        _imgTouchEnd: function() {
            //双指移动后又抬起一指, 会有跳动
            $img.off($.touchmove + ".clippic");
            //隐藏双指中心
            //$(".fingerC").hide();
            //更新图片宽高和缩放比
            oh = $img.height();
            ow = $img.width();
            _scale = scale;
        },
        //完成按钮点击
        _btnConfrim: function() {
            var x = Math.round(x0 * scaleO / scale); //实际图片尺寸的左起始点
            var y = Math.round(y0 * scaleO / scale); //实际图片尺寸的上起始点
            var w = Math.round(bw * scaleO / scale); //实际图片尺寸的截取宽度
            var h = Math.round(bh * scaleO / scale); //实际图片尺寸的截取高度
            //call back
            opt.onConfrim(x, y, w, h);
        },
        //取消按钮点击
        _btnCancel: function() {
            opt.onCancel();
        },
        //设置容器定位
        _setPic: function() {
            $this.width(($.winW * opt.picWidth).toFixed(0));
            bw = $this.width();
            $this.height(bw); //显示区域
            bh = $this.width();
            iw = $img.width();
            ih = $img.height();
            bl = Math.round(($.winW - bw) / 2);
            br = $.winW - (bl + bw);
            bt = Math.round(($.winH - $dock.outerHeight() - bh) / 2);
            bb = $.winH - (bt + bh);

            // alert(bl + " / " + bt + " / " + br + " / " + bb + " / " + bw + " / " + bh)
            $this.css({ left: bl, top: bt });
        },
        //设置遮罩效果
        _setMask: function() {
            var maskHtml = "<div class='mask ml'></div><div class='mask mt'></div><div class='mask mr'></div><div class='mask mb'></div>";
            $this.after(maskHtml);
            $(".mask.ml").css({ left: 0, right: "95%", top: bt, bottom: bb });
            $(".mask.mr").css({ left: "95%", right: 0, top: bt, bottom: bb });
            $(".mask.mt").css({ left: 0, right: 0, top: 0, bottom: $.winH - bt + 1 });
            $(".mask.mb").css({ left: 0, right: 0, top: $.winH - bb + 1, bottom: 0 });
        }
    };

}(jQuery);
