var gulp = require('gulp');
var jshint = require('gulp-jshint');
var ignore = require('gulp-ignore');


gulp.task('lint-server', function() {
    return gulp.src(['./lib/*.js', './models/*.js', './controllers/*.js'])
        .pipe(jshint({
            "globals": {
                "console": false,
                "require": true,
                "module": true,
                "next": true,
                "_": true
            },
            "strict": true,
            "lastsemic": false,
            "quotmark": false,
            "maxdepth": 2,
            "maxparams": 3,
            "maxstatements": 15,
            "unused": true,
            "latedef": true,
            "loopfunc": true,
            "node": true,
            "maxerr": 999
        }))
        .pipe(jshint.reporter('gulp-jshint-html-reporter', {
            filename: 'jshint-output.html',
            createMissingFolders: false
        }));
});

gulp.task('lint-client', function() {
    return gulp.src(['./public/scripts/*.js', './public/scripts/**/*.js', '!./public/scripts/lib/*.js', '!./public/scripts/lib/**/*.js'])
        .pipe(jshint({
            "globals": {
                "console": false,
                "require": true,
                "module": true,
                "next": true,
                "_": true,
                "angular": true
            },
            "strict": true,
            "lastsemic": false,
            "quotmark": false,
            "maxdepth": 2,
            "maxparams": 3,
            "maxstatements": 15,
            "unused": true,
            "latedef": true,
            "loopfunc": true,
            "node": true,
            "maxerr": 999
        }))
        .pipe(jshint.reporter('gulp-jshint-html-reporter', {
            filename: 'jshint-output.html',
            createMissingFolders: false
        }));
});

gulp.task('default', ['lint-client', 'lint-server']);
