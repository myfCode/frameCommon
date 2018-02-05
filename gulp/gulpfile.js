var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var $ = gulpLoadPlugins();

gulp.task('clean', function() {
    return gulp.src(['dist', '../dist'], { read: false })
        .pipe($.rimraf({ force: true }));
});

//set both--------------------------------------------
gulp.task('unify-js', ['clean'], function() {
    return gulp.src([
            'global-js/_start.js',
            'global-js/globalVar.js',
            'global-js/fnAutoTitle.js',
            'global-js/fnBanner.js',
            'global-js/fnBodyHeight.js',
            'global-js/fnBodyInner.js',
            'global-js/fnBtnSwitch.js',
            'global-js/fnBtnTouch.js',
            'global-js/fnBtnVerifyCode.js',
            'global-js/fnCheckDevice.js',
            'global-js/fnChecked.js',
            'global-js/fnClipPic.js',
            'global-js/fnCountUp.js',
            'global-js/fnEyeNumber.js',
            'global-js/fnFixedTop.js',
            'global-js/fnIndexBar.js',
            'global-js/fnInput.js',
            'global-js/fnInputBlur.js',
            'global-js/fnInputSelect.js',
            'global-js/fnKeyBoard.js',
            'global-js/fnLongTouch.js',
            'global-js/fnNotice.js',
            'global-js/fnNoticeBar.js',
            'global-js/fnPageLoad.js',
            'global-js/fnPcFooterBtn.js',
            'global-js/fnPlaceHolder.js',
            'global-js/fnPageBtn.js',
            'global-js/fnPopup.js',
            'global-js/fnScrollX.js',
            'global-js/fnScrollY.js',
            'global-js/fnSlideDown.js',
            'global-js/fnSlidePanel.js',
            'global-js/fnSlideRuler.js',
            'global-js/fnTitleToTop.js',
            'global-js/fnWxFont.js',
            'global-js/init.js',
            'global-js/_end.js'
            // 'global-js/fnBodyPointer.js',
            // 'global-js/fnBgImg.js',
            // 'global-js/fnDropDown.js',
            // 'global-js/fnScrollPanel.js',
            // 'global-js/fnSelectGroup.js',
        ])
        .pipe($.concat('global.js'))
        .pipe(gulp.dest('../js'));
});

gulp.task('unify-css', ['clean'], function() {
    return gulp.src([
            'global-css/public.css'
        ])
        .pipe($.concatCss('global.min.css'))
        // .pipe($.cssmin({ advanced: false }))
        .pipe(gulp.dest('../css'));
});

gulp.task('copy-images-web', ['clean'], function() {
    return gulp.src('../images/**')
        .pipe(gulp.dest('../../jingqb-web/public/app/images'));
});

gulp.task('copy-images-allwin', ['clean'], function() {
    return gulp.src('../images/**')
        .pipe(gulp.dest('../../jingqb-allwin/public/app/images'));
});


// gulp.task('copy-css-web', ['unify-css'], function() {
//     return gulp.src('../css/*')
//         .pipe(gulp.dest('../../jingqb-web/public/app/stylesheets'));
// });

gulp.task('copy-js-web', ['unify-js'], function() {
    return gulp.src('../js/global.js')
        .pipe(gulp.dest('../../jingqb-web/public/app/javascripts/libs'));
});

// gulp.task('copy-css-allwin', ['unify-css'], function() {
//     return gulp.src('../css/*')
//         .pipe(gulp.dest('../../jingqb-allwin/public/app/stylesheets'));
// });

gulp.task('copy-js-allwin', ['unify-js'], function() {
    return gulp.src('../js/global.js')
        .pipe(gulp.dest('../../jingqb-allwin/public/app/javascripts/libs'));
});

//------------------------------------
gulp.task('default', function() {
    gulp.run('unify-js', 'unify-css', 'copy-images-web','copy-images-allwin', 'copy-js-web', 'copy-js-allwin');
});
