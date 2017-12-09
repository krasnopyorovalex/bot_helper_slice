var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    minifyCss = require('gulp-minify-css'),
    merge = require('merge-stream'),
    spritesmith = require('gulp.spritesmith'),
    rename = require('gulp-rename'),
    concatCss = require('gulp-concat-css'),
    zip = require('gulp-zip'),
    nib = require('nib'),
    rupture = require('rupture'),
    autoprefixer = require('autoprefixer-stylus'),
    type_utils = require('stylus-type-utils'),
    uglify = require('gulp-uglify'),
    concatJs = require('gulp-concat'),
    bs = require('browser-sync').create();

gulp.task('default',['bs']);

gulp.task('bs', function() {
    bs.init({
        server: {
            baseDir: "./dist"
        }
    });
    gulp.watch("app/stylus/*.styl", ['css']);
    gulp.watch("app/js/*.js", ['js']);
    gulp.watch("dist/*.html").on('change', bs.reload);
});

gulp.task('sprite', function () {
    // Generate our spritesheet
    var spriteData = gulp.src('app/sprite/*.*').pipe(spritesmith({
        imgName: 'sprite.png',
        cssName: 'sprite.styl',
        padding: 10
    }));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
        .pipe(gulp.dest('dist/images/'));

    // Pipe CSS stream through CSS optimizer and onto disk
    var stylStream = spriteData.css
        .pipe(gulp.dest('app/stylus/'));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, stylStream);
});

gulp.task('js', function(){
    return gulp.src('app/js/*.js')
        .pipe(concatJs("app.js"))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js/'))
        .pipe(bs.stream());
});

gulp.task('css', function() {
    gulp.src('app/stylus/main.styl')
        .pipe(stylus({
            use:[
                nib(),
                type_utils(),
                rupture(),
                autoprefixer()
            ]
        }))
        .pipe(concatCss("app.css"))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCss({
            keepBreaks: false
        }))
        .pipe(gulp.dest('dist/css/'))
        .pipe(bs.stream());
});

gulp.task('zip', function () {
    return gulp.src('dist/**/*')
        .pipe(zip('slice.zip'))
        .pipe(gulp.dest('./'));
});
