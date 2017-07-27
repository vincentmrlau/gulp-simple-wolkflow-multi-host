/**
 * Created by Administrator on 2017/5/31.
 */
var gulp = require('gulp')
var sass = require('gulp-sass') // 编译sass
var del = require('del') //删除文件
var watch = require('gulp-watch') // 观察变化的文件
var browserSync = require('browser-sync') // 自动化新的服务
var gulpAutoprefixer = require('gulp-autoprefixer') // 补全css
// var babel = require('gulp-babel') // babel
var composer = require('gulp-uglify/composer') // 使用其他的压缩
var uglifyjs = require('uglify-js') // js压缩
var minimist = require('minimist') // 处理参数
var gulpIf = require('gulp-if') // 判断
var preprocess = require('gulp-preprocess') // 预设变量
var chalk = require('chalk') // 多姿多彩的log
var postcssHtml = require('gulp-html-postcss') // html 内使用postcss
var autoPrefixeer = require('autoprefixer') // css 补全
var runSequence = require('run-sequence') // 串行运行task
var gulpHtmlMin = require('gulp-htmlmin') // html 的压缩

var jsMinify = composer(uglifyjs, console)// js压缩器

var reload = browserSync.reload

// host环境列表
var hostENVList = [
    'test',
    'pe',
    'qa'
]
/*
* 打开服务的时候需要带入参数
* gulp server --host pe --debug --output
* debug: 是否压缩代码
* watch: 是否实时更新
* */
var minimistOptions = {
    default: {
        host: 'test',
        debug: false,
        output: false,
        watch: false
    }
}

var options = minimist(process.argv.slice(2), minimistOptions)
console.log(chalk.green('options:'),options)

// 检查host环境
var hostCheckedError = true
for (var x in hostENVList) {
    if (options.host === hostENVList[x]) {
        hostCheckedError = false
    }
}
if (hostCheckedError) {
    // 参数错误
    console.log(chalk.red('host参数错误，可选为：' + hostENVList))
    return false
}

/*
* 根据参数设置dest的路径
* 不使用 --output 为调试环境，打包到dist,
* 打包输出则输出路径为 dist/hostEnv 例如： host/test
* */
var destDir = 'dist' //默认值
if (options.output === true) {
    destDir = 'output/' + options.host
}

/*
* 设置参数helper
* */
var perprocessSet = function () {
    return preprocess({
        context: {
            HOST_ENV: options.host
        }
    })
}

/*
* 判断debug环境的helper
* */
var ifIsWatch = function (task) {
    return gulpIf(options.watch === true, task)
}

/*
* 判断是否压缩的helper
* */
var ifIsNotDebug = function (task) {
    return gulpIf(options.debug === false, task)
}

// 清空将要打包的位置
gulp.task('clean', function (cb) {
    del([destDir+'/**/*'],{dryRun: true})
        .then(function (paths) {
            console.log(paths)
            cb()
        })
})

// 图片处理
gulp.task('img', function (cb) {
    var imgArray = [];
    var imgExt = ['png', 'jpg']
    for( var x in imgExt){
        imgArray.push('dev/**/*.' + imgExt[x])
    }
    if (options.watch) {
        gulp.src(imgArray)
            .pipe(watch(imgArray))
            .pipe(gulp.dest(destDir))
    } else {
        gulp.src(imgArray)
            .pipe(gulp.dest(destDir))
    }
    cb()
})

// SASS
gulp.task('sass', function (cb) {
    if (options.watch) {
        gulp.src('dev/**/*.scss')
            .pipe(watch('dev/**/*.scss'))
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(gulpAutoprefixer({
                browsers: ['last 100 versions'],
                cascade: false
            }))
            .pipe(gulp.dest(destDir))
    } else {
        gulp.src('dev/**/*.scss')
            .pipe(sass.sync().on('error', sass.logError))
            .pipe(gulpAutoprefixer({
                browsers: ['last 100 versions'],
                cascade: false
            }))
            .pipe(gulp.dest(destDir))
    }
    cb()
})

// js
gulp.task('js', function (cb) {
    if(options.watch) {
        gulp.src('dev/**/*.js')
            .pipe(watch('dev/**/*.js'))
            .pipe(perprocessSet())
            .pipe(ifIsNotDebug(jsMinify({
                ie8: true,
                mangle: {
                    toplevel: true,
                    eval: true
                },
                compress: true,
                warnings: 'verbose'
            })))
            .pipe(gulp.dest(destDir))
    } else {
        gulp.src('dev/**/*.js')
            .pipe(perprocessSet())
            .pipe(ifIsNotDebug(jsMinify({
                ie8: true,
                mangle: {
                    toplevel: true,
                    eval: true
                },
                compress: true,
                warnings: 'verbose'
            })))
            .pipe(gulp.dest(destDir))
    }
    cb()
})

// css
gulp.task('css', function (cb) {
    if (options.watch) {
        gulp.src('dev/**/*.css')
            .pipe(watch('dev/**/*.css'))
            .pipe(gulpAutoprefixer({
                browsers: ['last 100 versions'],
                cascade: false
            }))
            .pipe(gulp.dest(destDir))
    } else {
        gulp.src('dev/**/*.css')
            .pipe(gulpAutoprefixer({
                browsers: ['last 100 versions'],
                cascade: false
            }))
            .pipe(gulp.dest(destDir))
    }

    cb()
})

/*
* TODO sass转css
* html
* gulp-uglify-inline
* gulp-html-postcss
* */
gulp.task('html', function (cb) {
    if (options.watch) {
        gulp.src('dev/**/*.html')
            .pipe(watch('dev/**/*.html'))
            .pipe(perprocessSet())
            .pipe(postcssHtml([
                autoPrefixeer({
                    browsers: ['last 100 versions'],
                    cascade: false
                })
            ]))
            .pipe(ifIsNotDebug(gulpHtmlMin({
                minifyJS: true,
                minifyCSS: true
            })))
            .pipe(gulp.dest(destDir))
    } else {
        gulp.src('dev/**/*.html')
            .pipe(perprocessSet())
            .pipe(postcssHtml([
                autoPrefixeer({
                    browsers: ['last 100 versions'],
                    cascade: false
                })
            ]))
            .pipe(ifIsNotDebug(gulpHtmlMin({
                minifyJS: true,
                minifyCSS: true
            })))
            .pipe(gulp.dest(destDir))
    }

    cb()
})

gulp.task('dev-server', function (cb) {
    browserSync({
        server: {
            baseDir: 'dist'
        }
    },function (err,bs) {
        gulp.watch('**/*.*', {cwd: 'dist'}, reload)
        cb()
    })
})

gulp.task('server', function (cb) {
    browserSync({
        server: {
            baseDir: '.'
        }
    },function (err,bs) {
        cb()
    })
})

gulp.task('deal', ['img', 'js', 'css', 'html', 'sass'],function (cb) {
    cb()
})

/*
* 开始开发
* 1.清空
* 2.监听
* 3.运行服务器
* */
gulp.task('dev',function (cb) {
    console.log('dev')
    runSequence('clean','deal','dev-server')
})

gulp.task('built', function (cb) {
    console.log(chalk.green('HOST_ENV:' + options.host))
    console.log(chalk.green('debug:' + options.debug))
    console.log(chalk.green('output:' + options.output))
    console.log(chalk.green('waiting to finish'))
    cb()
})

gulp.task('build', function (cb) {
    runSequence('clean','deal','built')
} )
