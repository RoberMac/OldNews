var gulp       = require('gulp'),
    rename     = require('gulp-rename'),
    concat     = require('gulp-concat'),
    uglify     = require('gulp-uglify'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyCSS  = require('gulp-minify-css'),
    minifyHTML = require('gulp-minify-html');

var paths = {
    js_sy: [
        'public/js/core.js',
        'public/js/directives/*.js',
        'public/js/services/*.js',
        'public/js/controllers/*.js'
    ],
    js_libs: [
        'public/js/libs/angular.min.js',
        'public/js/libs/*.js',
        '!public/js/libs/inobounce.min.js',
        '!public/js/libs/*.map'
    ],
    css_sy: 'public/css/main.css',
    html_index: [
        'views/*.html',
        '!views/*.min.html'
    ],
    html_sy: [
        'public/js/templates/*.html'
    ]
};

// Minify all AngularJS libs
gulp.task('js_libs', function() {

    return gulp.src(paths.js_libs)
    .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('libs.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public/dist'));
});

// Minify all ShinyaApp-News Scripts
gulp.task('js_sy', function() {

    return gulp.src(paths.js_sy)
        .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(concat('sy-news.min.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'));
});

// Minify all ShinyaApp-News CSS files
gulp.task('css_sy', function () {

    return gulp.src(paths.css_sy)
        .pipe(sourcemaps.init())
            .pipe(minifyCSS({keepSpecialComments: 1}))
            .pipe(concat('sy-news.min.css'))
            .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'))
})

// Minify ShinyaApp-News index page
gulp.task('html_index', function (){

    return gulp.src(paths.html_index)
        .pipe(minifyHTML())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('views'))
})

// Minify all ShinyaApp-News HTML template files
gulp.task('html_sy', function (){

    return gulp.src(paths.html_sy)
        .pipe(minifyHTML())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('public/dist'))
})

// Rerun the task when a file changes 
gulp.task('watch', function() {

    gulp.watch(paths.js_sy, ['js_sy']);
    gulp.watch(paths.js_libs, ['js_libs']);
    gulp.watch(paths.css_sy, ['css_sy']);
    gulp.watch(paths.css_libs, ['css_libs']);
    gulp.watch(paths.html_index, ['html_index']);
    gulp.watch(paths.html_sy, ['html_sy']);
});

// The default task (called when you run `gulp` from cli) 
gulp.task('default', ['watch', 'js_sy', 'js_libs', 'css_sy', 'html_index', 'html_sy']);
