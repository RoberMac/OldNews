const gulp       = require('gulp');
const plumber    = require('gulp-plumber');
const concat     = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const path       = require('path');
const rename     = require('gulp-rename');

// Vendors
const uglify = require('gulp-uglify');
const ngAnnotate = require('gulp-ng-annotate');
const ngTpCache = require('gulp-angular-templatecache');
const PATH_VENDORS = [
    'public/js/vendors/angular.min.js',
    'public/js/vendors/*.js',
    '!public/js/vendors/*.map',
];
gulp.task('vendors', () => {
    return (
        gulp.src(PATH_VENDORS)
        .pipe(plumber())
        .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(concat('vendors.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'))
    );
});

// App:ng
const PATH_APP_NG = [
    'public/js/entry.js',
    'public/js/components/**/*.js',
    'public/js/utils/**/*.js',
];
gulp.task('app:ng', () => {
    return (
        gulp
        .src(PATH_APP_NG)
        .pipe(plumber())
        .pipe(ngAnnotate())
        .pipe(sourcemaps.init())
            .pipe(uglify())
            .pipe(concat('app.js'))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('public/dist'))
    );
});

// App:templates
const PATH_APP_TEMPLATES = 'public/js/components/**/*.html';
gulp.task('app:templates', () => {
    return (
        gulp
        .src(PATH_APP_TEMPLATES)
        .pipe(ngTpCache({
            root      : 'components',
            module    : 'ShinyaNews.templates',
            standalone: true,
        }))
        .pipe(gulp.dest('public/js/components'))
    );
});

// App:styles
const postcss = require('gulp-postcss');
const PATH_APP_STYLES_WATCH = 'public/css/**/*.css';
const PATH_APP_STYLES_ENTRY = 'public/css/app.css';
gulp.task('app:styles', () => {
    const processors = [
        require('postcss-import')({
            path: ['public/css'],
        }),
        require('postcss-nested'),
        require('postcss-short'),
        require('postcss-assets')({
            loadPaths: ['public/img/assets'],
        }),
        require('postcss-cssnext')({
            autoprefixer: true,
        }),
        require('css-mqpacker'),
        require('cssnano'),
    ];

    return (
        gulp.src(PATH_APP_STYLES_ENTRY)
        .pipe(plumber())
        .pipe(postcss(processors))
        .pipe(concat('app.css'))
        .pipe(gulp.dest('public/dist'))
    );
});

// App:svg
const svgmin   = require('gulp-svgmin');
const svgstore = require('gulp-svgstore');
const PATH_APP_SVG = 'public/img/src/*.svg';
gulp.task('app:svg', () => {
    return (
        gulp.src(PATH_APP_SVG)
        .pipe(svgmin(file => {
            const prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: `${prefix}-`,
                        minify: true,
                    },
                }],
            };
        }))
        .pipe(svgstore())
        .pipe(rename('icon-sprites.svg'))
        .pipe(gulp.dest('public/img'))
    );
});


/**
 * Task
 *
 */
// Watch
gulp.task('watch', () => {
    gulp.watch(PATH_VENDORS, ['vendors']);
    gulp.watch(PATH_APP_NG, ['app:ng']);
    gulp.watch(PATH_APP_TEMPLATES, ['app:templates']);
    gulp.watch(PATH_APP_STYLES_WATCH, ['app:styles']);
    gulp.watch(PATH_APP_SVG, ['app:svg']);
});
// Run
gulp.task('default', [
    'watch',
    'vendors',
    'app:ng',
    'app:templates',
    'app:styles',
    'app:svg',
]);
